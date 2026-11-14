# Arquitetura do Projeto

## Front-End
Vamos utilizar as seguintes bibliotecas principais:
- TypeScript: Linguagem principalmente de desenvolvimento com tipagem
- Next.js: framework para criacao e gestao de interfaces + APIs
- React.js: Biblioteca para criacao e componenticacao de interfaces
- Biome: Validacao/formatacao/correcao de codigo (lint)
- TailwindCSS: Estilizacao
- Date-FNS: Manipulacao de data/hora
- Shadcn: Componenticaqcao base (design system) 
- React Query: criacao e gestao de queries para ler dados da API e mutations para alterar dados.

## Back-End
Vamos utilizar as seguintes bibliotecas principais:
- TypeScript: Linguagem principalmente de desenvolvimento com tipagem
- Next.js: framework para criacao de APIs
- bcrypt: Geracao de salt + hash da senha
- Mastra.ai: Criacao e customizacao de agentes internos (ex.: resumo das avaliações por IA com OpenAI `gpt-4o-mini`, em `src/mastra`; requer `OPENAI_API_KEY`)
- TRPC: Gestao de endpoints

## Bando de dados
Supabase: PostgresQL
- Ambientes: local (Docker, via `supabase start`) ou externo (projeto hospedado em supabase.com)
- A escolha do ambiente é feita apenas por variáveis de ambiente no `.env.local` (ou na Vercel):
  - `SUPABASE_URL`: URL da API (`http://127.0.0.1:54321` no local, `https://<project-ref>.supabase.co` no externo)
  - `SUPABASE_SECRET_KEY` (`sb_secret_...`) ou `SUPABASE_SERVICE_ROLE_KEY` (legada): chave de servidor; nunca exposta ao cliente
- Acesso ao banco somente pelo servidor (`src/server/db.ts`); as tabelas têm RLS habilitado e sem permissões para `anon`/`authenticated`
- Migrations versionadas em `supabase/migrations`: aplicadas com `db:reset` no local e `db:link` + `db:push` no externo

## Infraestrutura
Vercel: Hospedar tanto o servidor (API) quanto cliente (SPA)

## Automacao
N8N: Criacao de fluxos automatizados