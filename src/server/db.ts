import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

/**
 * Cliente Supabase com privilégios de servidor — usar somente no servidor.
 * Funciona tanto com o Supabase local quanto com um projeto externo
 * (supabase.com); basta apontar SUPABASE_URL e a chave para o ambiente.
 */
export function getDb() {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  // Projetos externos novos usam "secret key" (sb_secret_...); a chave
  // legada "service_role" continua aceita (e é a usada pelo Supabase local).
  const serverKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serverKey) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_SECRET_KEY (ou SUPABASE_SERVICE_ROLE_KEY) precisam estar definidas (veja .env.example)",
    );
  }
  if (!URL.canParse(url)) {
    throw new Error(`SUPABASE_URL inválida: "${url}"`);
  }

  client = createClient(url, serverKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/** Código Postgres para violação de unicidade. */
export const PG_UNIQUE_VIOLATION = "23505";
