import "server-only";
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

/** Dono: feature Home (plans/home.md) — `list` e `create`, ambas públicas. */
export const productsRouter = router({
  /** GET /api/v1/products.list?input={"limit":12,"cursor":"..."} — 200 (items pode ser []) | 400 */
  list: publicProcedure
    .input(listProductsSchema)
    .query(({ input }) => fetchProductsPage(input)),

  /** POST /api/v1/products.create — 201 { id } | 400 dados inválidos */
  create: publicProcedure
    .input(createProductSchema)
    .mutation(async ({ input, ctx }) => {
      const { data, error } = await getDb()
        .from("products")
        .insert({
          id: nanoid(),
          name: input.name,
          external_link: input.link,
          image_url: input.image,
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
      ctx.response.status = 201;
      return { id: data.id };
    }),
});
