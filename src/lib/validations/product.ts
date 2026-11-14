import { z } from "zod";

const httpUrl = (message: string) =>
  z
    .string()
    .trim()
    .pipe(
      z
        .url({ protocol: /^https?$/, message })
        .max(2048, "Endereço muito longo"),
    );

/** POST /api/v1/products.create */
export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome do produto")
    .max(200, "Nome muito longo"),
  description: z
    .string()
    .trim()
    .max(1000, "Descrição muito longa")
    .optional()
    .transform((value) => value || undefined),
  externalLink: httpUrl("Informe um link http ou https válido"),
  imageUrl: httpUrl("Informe uma URL de imagem http ou https válida"),
});

/** GET /api/v1/products.list — o input é opcional (sem ele: primeira página, 12 itens). */
export const listProductsSchema = z
  .object({
    cursor: z.string().max(512).nullish(),
    limit: z.number().int().min(1).max(50).default(12),
  })
  .prefault({});

export type CreateProductInput = z.input<typeof createProductSchema>;
export type ListProductsInput = z.input<typeof listProductsSchema>;
