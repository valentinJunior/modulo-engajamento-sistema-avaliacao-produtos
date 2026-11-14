import "server-only";
import { initTRPC } from "@trpc/server";
import { ZodError, z } from "zod";

export type Context = {
  /** Status HTTP de sucesso definido pela procedure (ex.: 201 em criações). */
  successStatus?: number;
};

export const createContext = (): Context => ({});

type FieldErrors = Record<string, string[] | undefined>;

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    const isValidationError =
      error.code === "BAD_REQUEST" && error.cause instanceof ZodError;

    return {
      ...shape,
      // Mensagem limpa em vez do JSON bruto do Zod
      message: isValidationError ? "Dados inválidos" : shape.message,
      data: {
        ...shape.data,
        // Erros de validação por campo, para exibir no formulário
        fieldErrors: isValidationError
          ? (z.flattenError(error.cause as ZodError).fieldErrors as FieldErrors)
          : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;
