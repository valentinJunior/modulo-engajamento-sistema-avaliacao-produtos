const BASE = "http://interno.local";

/**
 * Destino pós-login vindo de `?next=`. Só aceita caminhos internos
 * (começam com uma única `/`, sem esquema nem `//`); senão volta para `/`.
 */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/";
  // Navegadores tratam `\` como `/` (ex.: `/\evil.com`)
  if (value.includes("\\")) return "/";
  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
