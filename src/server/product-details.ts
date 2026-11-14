import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/server/db";

export type ProductDetails = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  externalLink: string;
  /** Média das avaliações (1–5), ou `null` sem avaliações. */
  score: number | null;
};

/** Avaliação pública: só primeiro nome + inicial do sobrenome, nunca email. */
export type PublicFeedback = {
  id: string;
  score: number;
  comment: string;
  /** ISO 8601 */
  createdAt: string;
  author: {
    /** Usado apenas como seed do avatar. */
    accountId: string;
    /** Ex.: "Maria S." */
    signature: string;
  };
};

/** Tags de cache, revalidadas em `feedbacks.create`. */
export const productTag = (id: string) => `product:${id}`;
export const productFeedbacksTag = (id: string) => `product-feedbacks:${id}`;

export async function getProduct(id: string): Promise<ProductDetails | null> {
  "use cache";
  cacheLife("hours");
  cacheTag(productTag(id));

  const { data, error } = await getDb()
    .from("products")
    .select("id, name, description, image_url, external_link, score")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`Erro ao buscar produto: ${error.message}`);
  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    imageUrl: data.image_url,
    externalLink: data.external_link,
    score: data.score === null ? null : Number(data.score),
  };
}

type FeedbackRow = {
  id: string;
  score: number;
  comment: string;
  created_at: string;
  created_by: string;
  account: { first_name: string; last_name: string } | null;
};

function signature(firstName: string, lastName: string) {
  const first = firstName.trim();
  const initial = lastName.trim().charAt(0).toUpperCase();
  return initial ? `${first} ${initial}.` : first;
}

/** Avaliações do produto, mais recentes primeiro. */
export async function listFeedbacks(
  productId: string,
): Promise<PublicFeedback[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(productFeedbacksTag(productId));

  const { data, error } = await getDb()
    .from("products_feedbacks")
    .select(
      "id, score, comment, created_at, created_by, account:accounts!created_by (first_name, last_name)",
    )
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .overrideTypes<FeedbackRow[], { merge: false }>();
  if (error) throw new Error(`Erro ao buscar avaliações: ${error.message}`);

  return data.map((row) => ({
    id: row.id,
    score: row.score,
    comment: row.comment,
    createdAt: row.created_at,
    author: {
      accountId: row.created_by,
      signature: row.account
        ? signature(row.account.first_name, row.account.last_name)
        : "Conta removida",
    },
  }));
}
