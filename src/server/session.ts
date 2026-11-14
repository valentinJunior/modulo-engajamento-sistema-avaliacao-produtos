import "server-only";
import { jwtVerify, SignJWT } from "jose";

/**
 * Sessão sem estado: JWT HS256 assinado com SESSION_SECRET, guardado em um
 * cookie httpOnly. O `sub` do token é o id da conta (accounts.id).
 */
export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias, em segundos

function getKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET precisa estar definida com pelo menos 32 caracteres (veja .env.example)",
    );
  }
  return new TextEncoder().encode(secret);
}

export function createSessionToken(accountId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(accountId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getKey());
}

/** Retorna o id da conta se o token for válido e não expirado; senão `null`. */
export async function verifySessionToken(
  token: string | null | undefined,
): Promise<string | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}

/** Lê o cookie de sessão a partir do header `Cookie` de uma requisição. */
export function readSessionCookie(cookieHeader: string | null) {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === SESSION_COOKIE) return decodeURIComponent(rest.join("="));
  }
  return null;
}

/** Valor do header `Set-Cookie` que grava (ou, com token vazio, apaga) a sessão. */
export function sessionSetCookie(token: string) {
  const attrs = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${token ? SESSION_MAX_AGE : 0}`,
  ];
  if (process.env.NODE_ENV === "production") attrs.push("Secure");
  return attrs.join("; ");
}
