import { z } from "zod";

/** Schema compartilhado entre o formulário (cliente) e a API (servidor). */
export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Email inválido").max(254, "Email muito longo")),
  password: z
    .string()
    .min(1, "Informe sua senha")
    .max(200, "Senha muito longa"),
});

export type SignInInput = z.input<typeof signInSchema>;
