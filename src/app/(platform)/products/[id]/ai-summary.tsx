import { Sparkles } from "lucide-react";
import { getProductAiSummary } from "@/server/ai-summary";
import { reviewCountLabel } from "./product-header";

const sectionClass =
  "mt-12 rounded-2xl bg-ink px-6 py-7 text-ink-foreground shadow-[0_24px_48px_-28px_rgb(5_10_30/0.6)] sm:mt-14 sm:px-10 sm:py-9";

function AiLabel({ id }: { id?: string }) {
  return (
    <h2
      id={id}
      className="inline-flex items-center gap-2 rounded-full bg-rating/15 px-3 py-1 text-sm font-semibold text-rating"
    >
      <Sparkles aria-hidden className="size-4" />
      Resumo por IA
    </h2>
  );
}

type AiSummaryProps = { productId: string; feedbackCount: number };

/** Resumo das avaliações gerado pela IA; some se não houver resumo. */
export async function AiSummary({ productId, feedbackCount }: AiSummaryProps) {
  const summary = await getProductAiSummary(productId, feedbackCount);
  if (!summary) return null;

  return (
    <section aria-labelledby="ai-summary-title" className={sectionClass}>
      <AiLabel id="ai-summary-title" />
      <p className="mt-5 max-w-[68ch] font-heading text-xl leading-snug text-pretty sm:text-2xl">
        {summary.summary}
      </p>
      <p className="mt-6 text-sm text-ink-foreground/70">
        Gerado por IA a partir de {reviewCountLabel(summary.feedbackCount)}.
        Pode conter imprecisões.
      </p>
    </section>
  );
}

/** Mesmo bloco enquanto a IA escreve o resumo. */
export function AiSummarySkeleton() {
  return (
    <section aria-busy="true" className={sectionClass}>
      <AiLabel />
      <output className="sr-only">Gerando resumo das avaliações…</output>
      <div aria-hidden className="mt-5 max-w-[68ch] motion-safe:animate-pulse">
        <div className="h-5 rounded bg-ink-foreground/15 sm:h-6" />
        <div className="mt-3 h-5 rounded bg-ink-foreground/15 sm:h-6" />
        <div className="mt-3 h-5 w-2/3 rounded bg-ink-foreground/15 sm:h-6" />
      </div>
      <p className="mt-6 text-sm text-ink-foreground/70">
        Lendo as avaliações…
      </p>
    </section>
  );
}
