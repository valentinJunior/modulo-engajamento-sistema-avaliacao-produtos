import "server-only";
import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { ZodError, z } from "zod";
import { readSessionCookie, verifySessionToken } from "@/server/session";

export type Context = {
  /**
   * Status HTTP de sucesso definido pela procedure (ex.: `ctx.response.status = 201`).
   * É um objeto compartilhado de propósito: middlewares como `protectedProcedure`
   * criam uma cópia do ctx, e um campo simples se perderia nessa cópia.
   */
  response: { status?: number };
  /** Headers da resposta; use `resHeaders.append("Set-Cookie", ...)`. */
  resHeaders: Headers;
  /** Headers da requisição. */
  reqHeaders: Headers;
  /** Id da conta da sessão (cookie `session`), se houver sessão válida. */
  accountId: string | null;
};

export async function createContext({
  req,
  resHeaders,
}: FetchCreateContextFnOptions): Promise<Context> {
  const accountId = await verifySessionToken(
    readSessionCookie(req.headers.get("cookie")),
  );
  return { response: {}, resHeaders, reqHeaders: req.headers, accountId };
}

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

/** Exige sessão válida; sem ela responde 401. `ctx.accountId` vira `string`. */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.accountId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Entre na sua conta para continuar.",
    });
  }
  return next({ ctx: { ...ctx, accountId: ctx.accountId } });
});
