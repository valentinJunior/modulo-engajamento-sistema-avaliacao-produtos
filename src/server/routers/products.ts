import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { revalidateTag } from "next/cache";
import {
  createProductSchema,
  listProductsSchema,
} from "@/lib/validations/product";
import { getDb } from "@/server/db";
import { fetchProductsPage, PRODUCTS_CACHE_TAG } from "@/server/product-list";
import { publicProcedure, router } from "@/server/trpc";

const sha256 = (value: string) => createHash("sha256").update(value).digest();

/** Compara em tempo constante (hash antes para igualar os tamanhos). */
function isValidAdminKey(received: string | null) {
  const expected = process.env.ADMIN_API_KEY;
  if (!expected || !received) return false;
  return timingSafeEqual(sha256(received), sha256(expected));
}

/** Exige `x-admin-key` igual a ADMIN_API_KEY; roda antes da validação do corpo. */
const adminProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!isValidAdminKey(ctx.reqHeaders.get("x-admin-key"))) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Chave de administrador inválida.",
    });
  }
  return next();
});

/** Dono: feature Home (plans/home.md) — `list` (pública) e `create` (admin). */
export const productsRouter = router({
  /** GET /api/v1/products.list?input={"limit":12,"cursor":"..."} — 200 (items pode ser []) | 400 */
  list: publicProcedure
    .input(listProductsSchema)
    .query(({ input }) => fetchProductsPage(input)),

  /** POST /api/v1/products.create — 201 { id } | 400 dados inválidos | 401 sem chave de admin */
  create: adminProcedure
    .input(createProductSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await getDb()
        .from("products")
        .insert({
          id: nanoid(),
          name: input.name,
          description: input.description ?? null,
          external_link: input.externalLink,
          image_url: input.imageUrl,
        })
        .select("id")
        .single();

      if (error) {
        console.error("[products.create] erro ao inserir produto", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível criar o produto. Tente novamente.",
        });
      }

      // A primeira página da home é cacheada; o novo produto aparece nela
      revalidateTag(PRODUCTS_CACHE_TAG, "max");
      ctx.successStatus = 201;
      return { id: data.id };
    }),
});
