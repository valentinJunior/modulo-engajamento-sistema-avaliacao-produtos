import "server-only";
import { connection } from "next/server";
import { mastra } from "@/mastra";
import {
  REVIEW_SUMMARY_AGENT_ID,
  REVIEW_SUMMARY_MODEL,
} from "@/mastra/agents/review-summary-agent";
import { getDb } from "@/server/db";

/** Com menos avaliações o resumo só repetiria o comentário. */
export const MIN_FEEDBACKS_FOR_SUMMARY = 2;
/** Avaliações mais recentes enviadas ao modelo. */
const MAX_FEEDBACKS_IN_PROMPT = 100;

export type ProductAiSummary = {
  summary: string;
  /** Quantas avaliações o resumo cobre. */
  feedbackCount: number;
  /** ISO 8601 */
  generatedAt: string;
};

type SummaryRow = {
  summary: string;
  feedback_count: number;
  generated_at: string;
};

const toSummary = (row: SummaryRow): ProductAiSummary => ({
  summary: row.summary,
  feedbackCount: row.feedback_count,
  generatedAt: row.generated_at,
});

/** Gerações em andamento, para não chamar a OpenAI duas vezes pelo mesmo produto. */
const inFlight = new Map<string, Promise<ProductAiSummary | null>>();
/** Depois de uma falha, espera antes de tentar de novo (evita uma chamada por visita). */
const RETRY_AFTER_FAILURE_MS = 10 * 60 * 1000;
const lastFailureAt = new Map<string, number>();

async function readStoredSummary(productId: string) {
  const { data, error } = await getDb()
    .from("products_ai_summaries")
    .select("summary, feedback_count, generated_at")
    .eq("product_id", productId)
    .maybeSingle<SummaryRow>();
  if (error) {
    console.error("[ai-summary] erro ao ler resumo", error);
    return null;
  }
  return data ? toSummary(data) : null;
}

/** Remove os sinais que permitiriam fechar a tag <avaliacao> por dentro do comentário. */
const sanitize = (text: string) => text.replace(/[<>]/g, "").trim();

async function generateAndStore(
  productId: string,
): Promise<ProductAiSummary | null> {
  if (!process.env.OPENAI_API_KEY) return null;
  const db = getDb();

  const [{ data: product }, { data: feedbacks, count, error }] =
    await Promise.all([
      db.from("products").select("name").eq("id", productId).maybeSingle(),
      db
        .from("products_feedbacks")
        .select("score, comment", { count: "exact" })
        .eq("product_id", productId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .limit(MAX_FEEDBACKS_IN_PROMPT),
    ]);
  if (error) throw new Error(`Erro ao buscar avaliações: ${error.message}`);
  if (!product || !feedbacks || (count ?? 0) < MIN_FEEDBACKS_FOR_SUMMARY) {
    return null;
  }
  const total = count ?? feedbacks.length;

  const prompt = [
    `Produto: ${sanitize(product.name)}`,
    `Avaliações (${total} no total${total > feedbacks.length ? `; estas são as ${feedbacks.length} mais recentes` : ""}):`,
    ...feedbacks.map(
      (f) =>
        `<avaliacao nota="${f.score}/5">${sanitize(f.comment)}</avaliacao>`,
    ),
  ].join("\n");

  const agent = mastra.getAgentById(REVIEW_SUMMARY_AGENT_ID);
  const result = await agent.generate(prompt, {
    modelSettings: { temperature: 0.3, maxOutputTokens: 350 },
  });
  const summary = result.text.trim();
  if (!summary) throw new Error("Modelo retornou resumo vazio");

  const { data, error: upsertError } = await db
    .from("products_ai_summaries")
    .upsert({
      product_id: productId,
      summary,
      feedback_count: total,
      model: REVIEW_SUMMARY_MODEL,
      generated_at: new Date().toISOString(),
    })
    .select("summary, feedback_count, generated_at")
    .single<SummaryRow>();
  if (upsertError) {
    throw new Error(`Erro ao salvar resumo: ${upsertError.message}`);
  }
  return toSummary(data);
}

/**
 * Gera (ou regenera) e salva o resumo do produto. Nunca lança: em caso de
 * falha registra o erro e devolve `null`.
 */
export function refreshProductAiSummary(
  productId: string,
): Promise<ProductAiSummary | null> {
  const running = inFlight.get(productId);
  if (running) return running;

  const failedAt = lastFailureAt.get(productId);
  if (failedAt && Date.now() - failedAt < RETRY_AFTER_FAILURE_MS) {
    return Promise.resolve(null);
  }

  const job = generateAndStore(productId)
    .then((summary) => {
      lastFailureAt.delete(productId);
      return summary;
    })
    .catch((error) => {
      console.error("[ai-summary] erro ao gerar resumo", productId, error);
      lastFailureAt.set(productId, Date.now());
      return null;
    })
    .finally(() => inFlight.delete(productId));
  inFlight.set(productId, job);
  return job;
}

/**
 * Resumo para exibir na página. Só chama a OpenAI quando o resumo salvo não
 * cobre o número atual de avaliações; se a geração falhar, devolve o último
 * resumo salvo (ou `null`).
 */
export async function getProductAiSummary(
  productId: string,
  feedbackCount: number,
): Promise<ProductAiSummary | null> {
  await connection();
  if (feedbackCount < MIN_FEEDBACKS_FOR_SUMMARY) return null;

  const stored = await readStoredSummary(productId);
  if (stored && stored.feedbackCount === feedbackCount) return stored;

  return (await refreshProductAiSummary(productId)) ?? stored;
}
