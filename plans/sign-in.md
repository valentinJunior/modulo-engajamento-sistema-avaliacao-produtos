# Plano: Sign-In (Autenticação)

Spec: `specs/sign-in.md`. Ordem de execução: **1º** (Home e Feedback dependem da sessão e do layout base).

## Objetivo
Permitir que pessoas com conta entrem na plataforma por email + senha, com sessão em cookie, e criar o layout base com cabeçalho (botão "Entrar" ou avatar) e uma home esqueleto em `/`.

## Pontos para você confirmar antes de executar
1. **Endpoint:** a spec pede `POST /api/v1/sign-in`. O sign-up foi padronizado como tRPC (`/api/v1/auth.signUp`). Proponho **`auth.signIn` → `POST /api/v1/auth.signIn`** para manter o mesmo padrão. Se quiser exatamente `/api/v1/sign-in`, faço um Route Handler REST separado.
2. **Biblioteca de sessão:** proponho **`jose`** (JWT assinado em cookie `httpOnly`, recomendado na doc do Next 16). Nova variável de ambiente `SESSION_SECRET` (≥ 32 caracteres) no `.env.local` / `.env.example` / Vercel. Duração: 7 dias.
3. **Sair (logout):** a spec não pede. Sem ele não dá para trocar de conta. Proponho **não implementar** agora; se quiser, é uma procedure `auth.signOut` + item no menu do avatar.
4. **Avatar DiceBear:** usar a API HTTP (`https://api.dicebear.com/9.x/<estilo>/svg?seed=<account id>`). O seed será o **id da conta**, nunca o email, para não vazar dado pessoal para um serviço externo.
5. "Você não deve" da spec fala em sign-up (texto copiado do template); vou interpretar como "nada fora de sign-in + layout base + home esqueleto".

## Back-end
- `src/lib/validations/sign-in.ts`: schema Zod compartilhado (`email` trim/lowercase + `z.email`, `password` min 1).
- `src/server/session.ts` (`server-only`):
  - `createSessionToken(accountId)` / `verifySessionToken(token)` com `jose` (HS256, `exp` 7d).
  - Nome do cookie: `session`; opções `httpOnly`, `secure` em produção, `sameSite: "lax"`, `path: "/"`.
- `src/server/trpc.ts`: `createContext({ req, resHeaders })` passa a receber a requisição para ler o cookie e os headers da resposta para gravar `Set-Cookie`. `Context` ganha `resHeaders` e `accountId?`.
- `src/server/routers/auth.ts` → `signIn` (mutation):
  - Busca em `accounts` por `email` (minúsculo) e `active = true`.
  - `bcrypt.compare(senha, accounts.password)`. Se a conta não existir, ainda roda um `compare` contra um hash fixo para não revelar pelo tempo de resposta se o email existe.
  - Falha → `UNAUTHORIZED` (401) com mensagem única: **"Email ou senha inválidos."**
  - Dados mal formatados → `BAD_REQUEST` (400) (já tratado pelo Zod/formatter atual).
  - Sucesso → grava cookie de sessão, retorna `200` com `{ id }`.
- `src/server/auth.ts` (Data Access Layer): `getCurrentAccount()` lê o cookie via `cookies()`, valida o token e busca `id, first_name, last_name, email` em `accounts`. Retorna `null` se não houver sessão válida.

## Front-end
- **Rotas e layout:**
  - Route group `src/app/(platform)/` com `layout.tsx` contendo o cabeçalho; `/` sai do redirect atual e vira a home esqueleto (título "Produtos" + grade de placeholders), dentro desse grupo.
  - As páginas `/auth/*` continuam sem o cabeçalho (layout próprio de duas colunas, como o sign-up).
- **Cabeçalho** (`src/components/site-header.tsx`):
  - Esquerda: marca "Avaliação de Produtos" com link para `/`.
  - Direita: área de conta dentro de `<Suspense>` (obrigatório com Cache Components, pois lê `cookies()`); fallback = círculo esqueleto do tamanho do avatar.
  - Sem sessão: botão **"Entrar"** → `/auth/sign-in`.
  - Com sessão: avatar DiceBear + nome e sobrenome + email (em telas pequenas só o avatar, com nome/email em um popover).
- **Página `/auth/sign-in`:**
  - Mesmo sistema visual do sign-up (tinta `#1B2340`, âmbar `#F2B233`, Bricolage Grotesque + Instrument Sans).
  - Formulário à esquerda: Email, Senha, botão **"Entrar"** ("Entrando…" enquanto envia). Link "Ainda não tem conta? Criar conta" → `/auth/sign-up`; e no sign-up, o inverso.
  - Painel tinta à direita: mesma linguagem do cartão de avaliação, mas como um "bem-vindo de volta" — uma pilha de 2–3 cartões de avaliação de exemplo, para não repetir o truque da assinatura ao vivo (que só faz sentido no cadastro).
  - Erros: alert vermelho no topo do formulário com a mensagem genérica; erros de validação por campo continuam inline.
  - Sucesso: `router.push("/")` + `router.refresh()` para o cabeçalho refletir a sessão.
- `next.config.ts`: adicionar `api.dicebear.com` em `images.remotePatterns` (ou usar `<img>` simples, já que é SVG).

## Arquivos
Novos: `src/lib/validations/sign-in.ts`, `src/server/session.ts`, `src/server/auth.ts`, `src/app/auth/sign-in/page.tsx`, `src/app/auth/sign-in/sign-in-form.tsx`, `src/app/(platform)/layout.tsx`, `src/app/(platform)/page.tsx`, `src/components/site-header.tsx`, `src/components/account-menu.tsx`.
Alterados: `src/server/trpc.ts`, `src/app/api/v1/[trpc]/route.ts`, `src/server/routers/auth.ts`, `src/app/page.tsx` (removido; substituído pelo do grupo), `src/app/auth/sign-up/page.tsx` (link para entrar), `next.config.ts`, `.env.example`, `package.json` (`jose`).

## Verificação
- `bun run typecheck` e `bun run lint` sem erros.
- `curl -X POST /api/v1/auth.signIn` com credenciais certas → 200 + `Set-Cookie: session=…; HttpOnly`; senha errada e email inexistente → 401 com a **mesma** mensagem; JSON inválido → 400.
- No navegador: login leva para `/`, cabeçalho mostra avatar + nome + email; sem cookie mostra "Entrar".
- Screenshots desktop e mobile das páginas `/auth/sign-in` e `/`.

## Fora de escopo
Logout (salvo confirmação), recuperação de senha, "lembrar de mim", envio de email, proteção de rotas (nenhuma rota exige login ainda).
