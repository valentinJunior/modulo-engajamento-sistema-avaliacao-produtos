-- Tabela de produtos (spec: specs/home.md, plano: plans/home.md)
create table public.products (
  id            text         primary key,          -- nanoid gerado na API
  name          text         not null,
  description   text,
  image_url     text,                              -- URL externa da imagem
  external_link text         not null,
  score         numeric(2,1) check (score between 1 and 5), -- média das avaliações; null sem avaliações
  created_at    timestamptz  not null default now(),
  updated_at    timestamptz  not null default now()
);

-- Paginação por cursor (created_at desc, id desc)
create index products_created_at_id on public.products (created_at desc, id desc);

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.products enable row level security;
revoke all on public.products from anon, authenticated;
