import "server-only";
import { TRPCError } from "@trpc/server";
import { cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/server/db";

export const PRODUCTS_CACHE_TAG = "products";
export const PRODUCTS_PAGE_SIZE = 12;

export type ProductListItem = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  score: number | null;
};

export type ProductPage = {
  items: ProductListItem[];
  nextCursor: string | null;
};

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  score: number | string | null;
  created_at: string;
};

// Cursor opaco: base64url de [created_at, id] do último item da página.
// O timestamp é mantido como veio do banco (com microssegundos) para a
// comparação por chave ser exata.
const TIMESTAMP_RE =
  /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}(:?\d{2})?)?$/;
const ID_RE = /^[A-Za-z0-9_-]{1,64}$/;

function encodeCursor(createdAt: string, id: string) {
  return Buffer.from(JSON.stringify([createdAt, id])).toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: string; id: string } {
  try {
    const value: unknown = JSON.parse(
      Buffer.from(cursor, "base64url").toString("utf8"),
    );
    if (
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === "string" &&
      typeof value[1] === "string" &&
      TIMESTAMP_RE.test(value[0]) &&
      ID_RE.test(value[1])
    ) {
      return { createdAt: value[0], id: value[1] };
    }
  } catch {
    // cai no erro abaixo
  }
  throw new TRPCError({ code: "BAD_REQUEST", message: "Cursor inválido." });
}

/**
 * Página de produtos, do mais novo para o mais antigo, paginada por chave
 * (created_at desc, id desc) — estável mesmo com inserções durante a rolagem.
 */
export async function fetchProductsPage({
  cursor,
  limit = PRODUCTS_PAGE_SIZE,
}: {
  cursor?: string | null;
  limit?: number;
}): Promise<ProductPage> {
  const after = cursor ? decodeCursor(cursor) : null;

  let query = getDb()
    .from("products")
    .select("id, name, description, image_url, score, created_at")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    // Um a mais para saber se existe próxima página
    .limit(limit + 1);

  if (after) {
    const { createdAt, id } = after;
    query = query.or(
      `created_at.lt."${createdAt}",and(created_at.eq."${createdAt}",id.lt."${id}")`,
    );
  }

  const { data, error } = await query.overrideTypes<ProductRow[]>();
  if (error) {
    console.error("[products.list] erro ao buscar produtos", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Não foi possível carregar os produtos. Tente novamente.",
    });
  }

  const rows = data.slice(0, limit);
  const last = rows.at(-1);
  return {
    items: rows.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      imageUrl: row.image_url,
      score: row.score === null ? null : Number(row.score),
    })),
    nextCursor:
      data.length > limit && last
        ? encodeCursor(last.created_at, last.id)
        : null,
  };
}

/** Primeira página da home, renderizada no servidor (produtos são públicos). */
export async function getFirstProductsPage(): Promise<ProductPage> {
  "use cache";
  cacheLife("minutes");
  cacheTag(PRODUCTS_CACHE_TAG);
  return fetchProductsPage({ limit: PRODUCTS_PAGE_SIZE });
}
