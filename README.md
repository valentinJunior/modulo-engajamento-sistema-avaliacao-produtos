# Módulo de Engajamento — Sistema de Avaliação de Produtos

Stack e arquitetura: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) · Specs de funcionalidades: [`specs/`](specs/)

## Pré-requisitos
- [Bun](https://bun.sh) ≥ 1.4
- Docker acessível pelo seu usuário (apenas para o Supabase local)
- **ou** um projeto no [Supabase](https://supabase.com) (Supabase externo)

## Setup — Supabase local
```bash
bun install
bun run db:start          # sobe o Supabase local e aplica supabase/migrations
bun run db:status         # mostra a URL da API e a "service_role key"
cp .env.example .env.local # preencha SUPABASE_SERVICE_ROLE_KEY
bun run dev               # http://localhost:3000/auth/sign-up
```

## Setup — Supabase externo (supabase.com)
1. Crie um projeto no dashboard do Supabase.
2. `cp .env.example .env.local` e preencha a **Opção B**:
   - `SUPABASE_URL` — `https://<project-ref>.supabase.co`
   - `SUPABASE_SECRET_KEY` (`sb_secret_...`) **ou** `SUPABASE_SERVICE_ROLE_KEY` (legada) — Project Settings → API Keys
   - `SUPABASE_PROJECT_REF` e `SUPABASE_DB_PASSWORD` — usados pelo CLI para aplicar as migrations
3. Aplique as migrations e rode o app:
```bash
bun install
bunx supabase login            # uma vez por máquina
bun run db:link                # vincula o CLI ao projeto externo
bun run db:push                # aplica supabase/migrations no banco remoto
bun run dev
```
> A chave secreta ignora RLS: mantenha-a só no servidor (nunca com prefixo `NEXT_PUBLIC_`).
> Na Vercel, cadastre `SUPABASE_URL` e `SUPABASE_SECRET_KEY` em Settings → Environment Variables.

## Scripts
| Script | Descrição |
|---|---|
| `dev` / `build` / `start` | Next.js |
| `lint` / `format` / `typecheck` | Biome e TypeScript |
| `db:start` / `db:stop` / `db:status` | Supabase local |
| `db:reset` | Recria o banco e reaplica as migrations |
| `db:migration:new <nome>` | Cria uma nova migration |
| `db:link` | Vincula o CLI ao projeto externo (`SUPABASE_PROJECT_REF`) |
| `db:push` | Aplica as migrations pendentes no Supabase externo |
| `db:migrations:remote` | Lista as migrations aplicadas no Supabase externo |

## Estrutura
```
src/
  app/
    api/v1/[trpc]/route.ts   # handler tRPC (endpoint /api/v1)
    auth/sign-up/            # página + formulário de criação de conta
  lib/validations/           # schemas Zod compartilhados (cliente + servidor)
  server/
    trpc.ts                  # init tRPC, contexto, formatação de erros
    routers/                 # routers tRPC (auth.signUp, ...)
    db.ts                    # cliente Supabase (chave secreta, só servidor; local ou externo)
    password.ts              # hash de senha (bcrypt)
  trpc/client.tsx            # provider tRPC + React Query
supabase/migrations/         # migrations SQL
```

## API
| Procedure | HTTP | Respostas |
|---|---|---|
| `auth.signUp` | `POST /api/v1/auth.signUp` (JSON) | `201` criada · `400` dados inválidos · `409` email já cadastrado |
