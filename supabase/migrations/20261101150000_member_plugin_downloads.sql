-- Downloads do FLMMKR FX feitos pela área de membros: quem baixou, quando e qual sistema.
create table if not exists public.member_plugin_downloads (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  email text,
  os text not null check (os in ('macos', 'windows', 'linux')),
  created_at timestamptz not null default now()
);

create index if not exists member_plugin_downloads_user_idx on public.member_plugin_downloads (user_id, created_at desc);

-- Só o servidor (service role) grava e lê.
alter table public.member_plugin_downloads enable row level security;
revoke all on public.member_plugin_downloads from anon, authenticated;
