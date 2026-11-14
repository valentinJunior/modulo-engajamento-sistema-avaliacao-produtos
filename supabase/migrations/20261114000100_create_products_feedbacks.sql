-- Avaliações de produtos (spec: specs/feedback.md, plano: plans/feedback.md)
create table public.products_feedbacks (
  id          text        primary key,                          -- nanoid gerado na API
  score       int         not null check (score between 1 and 5),
  comment     text        not null,
  created_at  timestamptz not null default now(),
  created_by  text        not null references public.accounts (id),
  product_id  text        not null references public.products (id) on delete cascade
);

create index products_feedbacks_product_created
  on public.products_feedbacks (product_id, created_at desc);

-- Uma avaliação por pessoa por produto
create unique index products_feedbacks_one_per_account
  on public.products_feedbacks (product_id, created_by);

alter table public.products_feedbacks enable row level security;
revoke all on public.products_feedbacks from anon, authenticated;

-- Insere a avaliação e recalcula products.score na mesma transação.
-- Chamada pelo servidor via getDb().rpc("add_product_feedback", {...}).
create or replace function public.add_product_feedback(
  p_id text,
  p_product_id text,
  p_created_by text,
  p_score int,
  p_comment text
)
returns public.products_feedbacks
language plpgsql
set search_path = ''
as $$
declare
  created public.products_feedbacks;
begin
  insert into public.products_feedbacks (id, score, comment, created_by, product_id)
  values (p_id, p_score, p_comment, p_created_by, p_product_id)
  returning * into created;

  update public.products
     set score = (
       select round(avg(f.score)::numeric, 1)
         from public.products_feedbacks f
        where f.product_id = p_product_id
     )
   where id = p_product_id;

  return created;
end;
$$;

revoke all on function public.add_product_feedback(text, text, text, int, text)
  from public, anon, authenticated;
