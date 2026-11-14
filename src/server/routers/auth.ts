import "server-only";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcrypt";
import { nanoid } from "nanoid";
import { signInSchema } from "@/lib/validations/sign-in";
import { signUpSchema } from "@/lib/validations/sign-up";
import { getDb, PG_UNIQUE_VIOLATION } from "@/server/db";
import { hashPassword } from "@/server/password";
import { createSessionToken, sessionSetCookie } from "@/server/session";
import { publicProcedure, router } from "@/server/trpc";

/**
 * Hash bcrypt (custo 12, igual ao cadastro) de uma senha que não pertence a
 * ninguém. Quando o email não existe ainda comparamos contra ele, para que o
 * tempo de resposta não revele se a conta existe.
 */
const DUMMY_HASH =
  "$2b$12$I3.FIhqTcM62pxbDYtSOCeiOCgyJBt8IZw.5RdMjaGIaBzNGP5wDS";

const INVALID_CREDENTIALS = "Email ou senha inválidos.";

export const authRouter = router({
  /** POST /api/v1/auth.signUp — 201 criado | 400 dados inválidos | 409 email já cadastrado */
  signUp: publicProcedure
    .input(signUpSchema)
    .mutation(async ({ input, ctx }) => {
      const { password, salt } = await hashPassword(input.password);

      const { data, error } = await getDb()
        .from("accounts")
        .insert({
          id: nanoid(),
          first_name: input.firstName,
          last_name: input.lastName,
          email: input.email,
          password,
          salt,
        })
        .select("id")
        .single();

      if (error) {
        if (error.code === PG_UNIQUE_VIOLATION) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "Já existe uma conta com este email",
          });
        }
        console.error("[auth.signUp] erro ao inserir conta", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível criar a conta. Tente novamente.",
        });
      }

      ctx.successStatus = 201;
      return { id: data.id };
    }),

  /** POST /api/v1/auth.signIn — 200 com cookie de sessão | 400 dados inválidos | 401 credenciais */
  signIn: publicProcedure
    .input(signInSchema)
    .mutation(async ({ input, ctx }) => {
      const { data: account, error } = await getDb()
        .from("accounts")
        .select("id, password")
        .eq("email", input.email)
        .eq("active", true)
        .maybeSingle();

      if (error) {
        console.error("[auth.signIn] erro ao buscar conta", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Não foi possível entrar agora. Tente novamente.",
        });
      }

      const matches = await bcrypt.compare(
        input.password,
        account?.password ?? DUMMY_HASH,
      );
      if (!account || !matches) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: INVALID_CREDENTIALS,
        });
      }

      ctx.resHeaders.append(
        "Set-Cookie",
        sessionSetCookie(await createSessionToken(account.id)),
      );
      return { id: account.id };
    }),
});
