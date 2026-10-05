alter table public.profiles add column if not exists nickname text;

with base as (
  select id,
    coalesce(nullif(regexp_replace(lower(translate(coalesce(nullif(first_name,''), split_part(coalesce(full_name,''),' ',1), split_part(coalesce(email,''),'@',1), 'aluno'), 'ÁÀÂÃÄáàâãäÉÈÊËéèêëÍÌÎÏíìîïÓÒÔÕÖóòôõöÚÙÛÜúùûüÇçÑñ', 'AAAAAaaaaaEEEEeeeeIIIIiiiiOOOOOoooooUUUUuuuuCcNn')), '[^a-z0-9_]', '', 'g'), ''), 'aluno') as b
  from public.profiles where nickname is null
), ranked as (
  select id, b, row_number() over (partition by b order by id) as rn from base
)
update public.profiles p
set nickname = case when r.rn = 1 and not exists (select 1 from public.profiles x where x.nickname = r.b) then r.b else r.b || r.rn::text end
from ranked r where p.id = r.id;

update public.profiles set nickname = left(nickname,20) where length(nickname) > 20;
update public.profiles set nickname = rpad(nickname,3,'0') where length(nickname) < 3;

create unique index if not exists profiles_nickname_unique on public.profiles (lower(nickname));
alter table public.profiles add constraint profiles_nickname_format check (nickname is null or nickname ~ '^[a-z0-9_]{3,20}$') not valid;
