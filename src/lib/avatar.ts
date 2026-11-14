/**
 * URL de avatar DiceBear (SVG). Use sempre o id da conta como seed — nunca
 * email ou nome, para não enviar dado pessoal a um serviço externo.
 */
export function avatarUrl(accountId: string) {
  return `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${encodeURIComponent(accountId)}&backgroundColor=f2b233`;
}
