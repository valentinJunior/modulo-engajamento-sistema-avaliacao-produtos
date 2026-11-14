# Plano: Feedback (Avaliações de produto)

Spec: `specs/feedback.md`. Ordem de execução: **3º** (depende da sessão do Sign-In e da tabela `products` da Home).

## Objetivo
Criar a página pública de detalhes `/products/[id]` com as informações do produto e a lista de avaliações. Pessoas logadas podem publicar uma avaliação (nota de 1 a 5 + comentário); quem não está logado vê um bloco pedindo para entrar.

## Pontos para você confirmar antes de executar
1. **Mais de uma avaliação por pessoa?** A spec não limita. Proponho **uma avaliação por pessoa por produto** (índice único em `product_id, created_by`; segunda tentativa → 409 "Você já avaliou este produto."). Alternativa: permitir várias.
2. **Nota média do produto:** se você aprovou `products.score numeric` no plano da Home, atualizo a média a cada nova avaliação (em uma função SQL, de forma atômica). Se não, a média é calculada na consulta da página.
3. **Comentário obrigatório?** Proponho obrigatório, entre 10 e 1000 caracteres, para evitar avaliações vazias.
4. **Endpoint:** `feedbacks.create` → `POST /api/v1/feedbacks.create` (padrão tRPC), status `201`; sem login → `401`; produto inexistente → `404`; dados inválidos → `400`.
5. "Resultado" e "Você não deve" da spec repetem textos de outras features; vou interpretar como "qualquer pessoa vê produto e avaliações; só quem está logado publica".

## Banco de dados
Migration `supabase/migrations/<timestamp>_create_products_feedbacks.sql`:
```sql
create table public.products_feedbacks (
  id          text        primary key,                          -- nanoid
  score       int         not null check (score between 1 and 5),
  comment     text        not null,
  created_at  timestamptz not null default now(),
  created_by  text        not null references public.accounts (id),
  product_id  text        not null references public.products (id) on delete cascade
);
create index products_feedbacks_product_created on public.products_feedbacks (product_id, created_at desc);
create unique index products_feedbacks_one_per_account on public.products_feedbacks (product_id, created_by); -- (ponto 1)
alter table public.products_feedbacks enable row level security;
revoke all on public.products_feedbacks from anon, authenticated;
```
Mais, se aprovado o ponto 2, uma função `public.add_product_feedback(...)` que insere e recalcula `products.score` na mesma transação.

## Back-end
- `src/lib/validations/feedback.ts`: `createFeedbackSchema` (`productId`, `score` int 1–5, `comment` trim 10–1000).
- `src/server/trpc.ts`: `protectedProcedure`, que exige `ctx.accountId` (vindo do cookie de sessão do Sign-In) e responde `UNAUTHORIZED` (401) quando não há sessão.
- `src/server/routers/feedbacks.ts` → `create` (mutation, protegida): confere se o produto existe (404), insere com `created_by = ctx.accountId`, trata o 409 do ponto 1 e retorna `201` com a avaliação criada.
- Leitura (no servidor, sem endpoint público novo): `getProduct(id)` e `listFeedbacks(productId)` em `src/server/products.ts`, juntando `accounts.first_name` e `last_name` para assinar cada avaliação.

## Front-end
- **Página `src/app/(platform)/products/[id]/page.tsx`:**
  - Produto e avaliações são públicos e entram na casca da página. A parte que depende de login (formulário ou bloco "entre para avaliar") fica dentro de `<Suspense>`, porque lê `cookies()` (regra do Cache Components).
  - `notFound()` quando o id não existe.
- **Cabeçalho do produto:** imagem grande à esquerda, e à direita nome (Bricolage), descrição, nota média em estrelas âmbar + "12 avaliações", e o link externo **"Ver na loja"** (abre em nova aba, `rel="noopener noreferrer"`).
- **Lista de avaliações:** a mesma linguagem visual do cartão do sign-up (estrelas âmbar, comentário em Bricolage, assinatura "Maria S." com avatar DiceBear e data relativa em pt-BR via `date-fns`, ex.: "há 3 dias"). Aqui o cartão aparece de verdade, fechando a promessa feita no cadastro. Lista simples, mais recentes primeiro; vazio = "Ninguém avaliou este produto ainda. Seja a primeira pessoa."
- **Formulário (logado)**, depois da lista:
  - Seletor de nota com 5 estrelas acessível: um `radiogroup` navegável por teclado, com rótulos "1 estrela" … "5 estrelas" e destaque âmbar ao passar o mouse e ao focar.
  - Campo de comentário com contador "0/1000".
  - Botão **"Publicar avaliação"** ("Publicando…" enquanto envia).
  - React Hook Form + Zod; erros por campo inline e alert vermelho para erro geral (401, 404, 409).
  - Sucesso: a avaliação nova entra no topo da lista (invalidação da query / `router.refresh()`), o formulário é trocado por "Avaliação publicada." e a nota média é atualizada.
- **Bloco sem login:** cartão em tinta com "Entre para avaliar este produto." e botões **"Entrar"** (`/auth/sign-in?next=/products/<id>`) e "Criar conta". Volto para o produto após o login se o Sign-In aceitar o parâmetro `next` (pequeno ajuste nele, validando que é um caminho interno).

## Arquivos
Novos: migration, `src/lib/validations/feedback.ts`, `src/server/routers/feedbacks.ts`, `src/server/products.ts`, `src/app/(platform)/products/[id]/page.tsx`, `.../feedback-form.tsx`, `.../feedback-list.tsx`, `src/components/star-rating.tsx`.
Alterados: `src/server/trpc.ts` (`protectedProcedure`), `src/server/routers/_app.ts`, `src/app/auth/sign-in/sign-in-form.tsx` (parâmetro `next`).

## Verificação
- `bun run db:reset` sem erro.
- `POST /api/v1/feedbacks.create`: sem cookie → 401; nota 0 ou 6 → 400; produto inexistente → 404; válido → 201; segunda vez com a mesma conta → 409 (se o ponto 1 for aprovado).
- No navegador, deslogado: vê produto, avaliações e o bloco "Entre para avaliar"; logado: publica e a avaliação aparece no topo com nome e avatar.
- Seletor de estrelas usável só com teclado; typecheck + lint; screenshots desktop e mobile.

## Fora de escopo
Editar ou apagar avaliações, respostas a avaliações, curtidas, denúncia/moderação, paginação das avaliações (fica para quando um produto tiver muitas), envio de email.
