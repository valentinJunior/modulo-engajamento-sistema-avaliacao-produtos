import { z } from "zod";

/** Schema compartilhado entre o formulário (cliente) e a API (servidor). */
export const signUpSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(1, "Informe seu nome")
      .max(100, "Nome muito longo"),
    lastName: z
      .string()
      .trim()
      .min(1, "Informe seu sobrenome")
      .max(100, "Sobrenome muito longo"),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Email inválido").max(254, "Email muito longo")),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      // bcrypt ignora tudo além de 72 bytes, então barramos antes
      .refine((value) => new TextEncoder().encode(value).length <= 72, {
        message: "A senha deve ter no máximo 72 caracteres",
      }),
    confirmPassword: z.string().min(1, "Confirme sua senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.input<typeof signUpSchema>;
