-- Resumo das avaliações gerado por IA (plano: plans/ai-summary.md)
create table public.products_ai_summaries (
  product_id     text        primary key references public.products (id) on delete cascade,
  summary        text        not null,
  feedback_count int         not null check (feedback_count >= 0), -- quantas avaliações o resumo cobre
  model          text        not null,                             -- ex.: openai/gpt-4o-mini
  generated_at   timestamptz not null default now()
);

alter table public.products_ai_summaries enable row level security;
revoke all on public.products_ai_summaries from anon, authenticated;
