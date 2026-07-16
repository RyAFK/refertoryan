alter table profiles add column if not exists requested_practice_name text;

create or replace function handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, role, status, first_name, last_name,
    professional_title, professional_role, goc_number,
    contact_number, email, requested_practice_name
  )
  values (
    new.id,
    'partner',
    'pending',
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.raw_user_meta_data->>'professional_title',
    new.raw_user_meta_data->>'professional_role',
    new.raw_user_meta_data->>'goc_number',
    new.raw_user_meta_data->>'contact_number',
    new.email,
    new.raw_user_meta_data->>'requested_practice_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_auth_user();
