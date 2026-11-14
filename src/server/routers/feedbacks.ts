import "server-only";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { revalidateTag } from "next/cache";
import { createFeedbackSchema } from "@/lib/validations/feedback";
import { getDb, PG_UNIQUE_VIOLATION } from "@/server/db";
import { productFeedbacksTag, productTag } from "@/server/product-details";
import { PRODUCTS_CACHE_TAG } from "@/server/product-list";
import { protectedProcedure, router } from "@/server/trpc";

/** Código Postgres para violação de chave estrangeira. */
const PG_FOREIGN_KEY_VIOLATION = "23503";

const productNotFound = () =>
  new TRPCError({ code: "NOT_FOUND", message: "Produto não encontrado." });

const internalError = () =>
  new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Não foi possível publicar a avaliação. Tente novamente.",
  });

type FeedbackRow = {
  id: string;
  score: number;
  comment: string;
  created_at: string;
  created_by: string;
  product_id: string;
};

/** Dono: feature Feedback (plans/feedback.md). */
export const feedbacksRouter = router({
  /**
   * POST /api/v1/feedbacks.create — 201 criada | 400 dados inválidos |
   * 401 sem sessão | 404 produto inexistente | 409 já avaliou o produto
   */
  create: protectedProcedure
    .input(createFeedbackSchema)
    .mutation(async ({ input, ctx }) => {
      const db = getDb();

      // Checagem explícita para um 404 limpo (a FK cobre a corrida abaixo)
      const { data: product, error: productError } = await db
        .from("products")
        .select("id")
        .eq("id", input.productId)
        .maybeSingle();
      if (productError) {
        console.error(
          "[feedbacks.create] erro ao buscar produto",
          productError,
        );
        throw internalError();
      }
      if (!product) throw productNotFound();

      const { data, error } = await db
        .rpc("add_product_feedback", {
          p_id: nanoid(),
          p_product_id: input.productId,
          p_created_by: ctx.accountId,
          p_score: input.score,
          p_comment: input.comment,
        })
        .single<FeedbackRow>();

      if (error) {
        if (error.code === PG_UNIQUE_VIOLATION) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Você já avaliou este produto.",
          });
        }
        if (error.code === PG_FOREIGN_KEY_VIOLATION) throw productNotFound();
        console.error("[feedbacks.create] erro ao inserir avaliação", error);
        throw internalError();
      }

      // Sem janela de conteúdo antigo: o router.refresh() do cliente precisa
      // ver a avaliação nova e a média atualizada logo em seguida.
      revalidateTag(productTag(input.productId), { expire: 0 });
      revalidateTag(productFeedbacksTag(input.productId), { expire: 0 });
      // A nota média aparece também na listagem da home
      revalidateTag(PRODUCTS_CACHE_TAG, "max");

      ctx.response.status = 201;
      return {
        id: data.id,
        productId: data.product_id,
        score: data.score,
        comment: data.comment,
        createdAt: data.created_at,
      };
    }),
});
