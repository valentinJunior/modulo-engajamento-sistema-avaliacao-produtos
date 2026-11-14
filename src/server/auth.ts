import "server-only";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { getDb } from "@/server/db";
import { SESSION_COOKIE, verifySessionToken } from "@/server/session";

export type Account = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

/**
 * Data Access Layer: conta da sessão atual, ou `null` sem sessão válida.
 * Lê `cookies()`, então com Cache Components quem chama precisa estar
 * dentro de um <Suspense>.
 */
export async function getCurrentAccount(): Promise<Account | null> {
  // A validação do JWT lê o relógio; sem isso o Cache Components acusa
  // valor instável durante o prerender.
  await connection();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const accountId = await verifySessionToken(token);
  if (!accountId) return null;

  const { data } = await getDb()
    .from("accounts")
    .select("id, first_name, last_name, email")
    .eq("id", accountId)
    .eq("active", true)
    .maybeSingle();
  if (!data) return null;

  return {
    id: data.id,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
  };
}
