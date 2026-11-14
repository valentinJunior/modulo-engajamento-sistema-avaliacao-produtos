-- Tabela de contas (spec: specs/sign-up.md)
create table public.accounts (
  id          text        primary key,               -- nanoid gerado na API
  first_name  text        not null,
  last_name   text        not null,
  email       text        not null,
  password    text        not null,                  -- hash bcrypt (inclui custo e salt)
  salt        text        not null,                  -- salt gerado por bcrypt.genSalt
  active      boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Email único, sem diferenciar maiúsculas/minúsculas
create unique index accounts_email_unique on public.accounts (lower(email));

-- Mantém updated_at atualizado
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

-- Acesso apenas pelo servidor (service role); nenhum acesso via anon/authenticated
alter table public.accounts enable row level security;
revoke all on public.accounts from anon, authenticated;
