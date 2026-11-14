# Plano: Home (Listagem de produtos)

Spec: `specs/home.md`. Ordem de execução: **2º** (usa o layout base e a home esqueleto criados no Sign-In).

## Objetivo
Listar publicamente todos os produtos na home, com rolagem infinita, e criar a tabela `products` e um endpoint para inserir produtos manualmente.

## Pontos para você confirmar antes de executar
1. **`score: boolean`** — a spec define a nota do produto como booleano, o que não combina com avaliações de 1 a 5. Proponho **`score numeric(2,1)` nulo** (média das avaliações, preenchida pela feature de Feedback). Alternativa: remover a coluna e calcular a média na consulta.
2. **Imagem:** a listagem e o POST pedem imagem, mas a tabela não tem coluna. Proponho **`image_url text`** com uma URL externa. Upload de arquivo para o Supabase Storage seria mais trabalho e não está na spec.
3. **Endpoints e padrão tRPC:** proponho `products.list` → `GET /api/v1/products.list?input=…` e `products.create` → `POST /api/v1/products.create`. Se precisar exatamente de `GET /api/v1/products` e `POST /products`, faço Route Handlers REST separados.
4. **Proteção do endpoint de inserção:** um POST público deixaria qualquer pessoa criar produtos. Proponho exigir um header `x-admin-key` igual a uma nova variável `ADMIN_API_KEY` (401 se ausente/errado). Alternativa: exigir sessão de login.
5. "Criar uma nova conta… na tabela `products`" e o "Você não deve" sobre sign-up são textos copiados; vou interpretar como "criar a tabela products" e "nada fora da listagem de produtos".

## Banco de dados
Migration `supabase/migrations/<timestamp>_create_products.sql`:
```sql
create table public.products (
  id            text        primary key,          -- nanoid gerado na API
  name          text        not null,
  description   text,
  image_url     text,                             -- (ponto 2)
  external_link text        not null,
  score         numeric(2,1),                     -- (ponto 1) média 1.0–5.0
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index products_created_at_id on public.products (created_at desc, id desc);
create trigger products_set_updated_at before update on public.products
  for each row execute function public.set_updated_at();
alter table public.products enable row level security;
revoke all on public.products from anon, authenticated;
```
Mais um `supabase/seed.sql` com ~20 produtos de exemplo para testar a rolagem.

## Back-end
- `src/lib/validations/product.ts`: `createProductSchema` (`name` 1–200, `description` opcional ≤ 1000, `externalLink` e `imageUrl` com `z.url()` http/https).
- `src/server/routers/products.ts`:
  - `list` (query, pública): input `{ cursor?: string, limit: 1–50 (padrão 12) }`. Paginação por cursor (`created_at`, `id`), mais estável que offset durante inserções. Retorna `{ items, nextCursor }`; sem produtos → `200` com `items: []`.
  - `create` (mutation): valida o header de admin (ponto 4), gera `nanoid`, insere e retorna `201` com `{ id }`.
- `src/server/routers/_app.ts`: registrar `products`.

## Front-end
- `src/app/(platform)/page.tsx` substitui a home esqueleto:
  - Título "Produtos" + uma frase curta ("Veja o que as pessoas acham antes de comprar.").
  - Primeira página buscada no servidor e hidratada (lista aparece sem esperar o JS); páginas seguintes via `useInfiniteQuery` do tRPC + `IntersectionObserver` em um sentinela no fim da lista.
- **Cartão de produto** (`src/components/product-card.tsx`):
  - Imagem (proporção 4:3, `object-cover`, fallback com a inicial do produto em fundo tinta quando não houver imagem), nome em Bricolage, descrição em até 2 linhas e a nota em estrelas âmbar quando existir.
  - O nome é um link para `/products/[id]` (página criada na feature Feedback; até lá, 404).
- **Layout:** grade de 1 coluna no celular, 2 no tablet e 3–4 no desktop, alinhada à esquerda sob o título. Para não cair no "kit de cards SaaS", os cartões são planos: sem sombra, só a imagem com cantos arredondados e o texto solto abaixo, como uma prateleira.
- **Estados:** carregando a próxima página = 3 esqueletos no fim; fim da lista = linha discreta "Você viu todos os produtos."; vazio = "Nenhum produto cadastrado ainda."; erro = alert vermelho com botão "Tentar de novo".
- Imagens: `next/image` com `remotePatterns` liberando os domínios das imagens; se forem domínios arbitrários, uso `<img loading="lazy">` com dimensões fixas para evitar salto de layout.

## Arquivos
Novos: migration, `supabase/seed.sql`, `src/lib/validations/product.ts`, `src/server/routers/products.ts`, `src/components/product-card.tsx`, `src/app/(platform)/product-grid.tsx`.
Alterados: `src/server/routers/_app.ts`, `src/app/(platform)/page.tsx`, `next.config.ts`, `.env.example` (`ADMIN_API_KEY`).

## Verificação
- `bun run db:reset` aplica a migration e o seed sem erro.
- `GET /api/v1/products.list` → 200 com 12 itens e `nextCursor`; com o banco vazio → 200 e `items: []`.
- `POST /api/v1/products.create` sem chave → 401; dados inválidos → 400; válido → 201.
- No navegador: a rolagem carrega novas páginas até o fim sem duplicar itens; clicar no nome leva para `/products/<id>`.
- typecheck + lint; screenshots desktop e mobile.

## Fora de escopo
Busca, filtros, ordenação, edição/remoção de produtos, upload de imagem, página de detalhes (feature Feedback).
