import { z } from "zod";

export const COMMENT_MIN = 10;
export const COMMENT_MAX = 1000;

const SCORE_MESSAGE = "Escolha uma nota de 1 a 5";

/** Schema compartilhado entre o formulário (cliente) e a API (servidor). */
export const createFeedbackSchema = z.object({
  productId: z.string().trim().min(1, "Produto inválido").max(64),
  score: z
    .number({ error: SCORE_MESSAGE })
    .int(SCORE_MESSAGE)
    .min(1, SCORE_MESSAGE)
    .max(5, SCORE_MESSAGE),
  comment: z
    .string({ error: "Escreva um comentário" })
    .trim()
    .min(COMMENT_MIN, `Escreva pelo menos ${COMMENT_MIN} caracteres`)
    .max(COMMENT_MAX, `Use no máximo ${COMMENT_MAX} caracteres`),
});

export type CreateFeedbackInput = z.input<typeof createFeedbackSchema>;
