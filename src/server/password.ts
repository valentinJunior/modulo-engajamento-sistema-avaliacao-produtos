import "server-only";
import bcrypt from "bcrypt";

/**
 * Hash de senha com bcrypt.
 *
 * - `accounts.salt`: salt gerado por `bcrypt.genSalt` (ex.: `$2b$12$...`)
 * - `accounts.password`: hash bcrypt completo (já contém custo e salt)
 *
 * Custo 12 ≈ 190ms por hash. Para validar no login, use
 * `bcrypt.compare(senha, accounts.password)`.
 */
const SALT_ROUNDS = 12;

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return { password: hash, salt };
}
