import "server-only";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { signUpSchema } from "@/lib/validations/sign-up";
import { getDb, PG_UNIQUE_VIOLATION } from "@/server/db";
import { hashPassword } from "@/server/password";
import { publicProcedure, router } from "@/server/trpc";

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
});
