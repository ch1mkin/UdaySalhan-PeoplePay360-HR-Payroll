-- PeoplePay360 — first platform admin
-- Run in Supabase → SQL Editor (as postgres / service role).
--
-- 1. Replace the two values below.
-- 2. Run the whole script once.
-- 3. Sign in at / with that email and password.

do $$
declare
  user_email text := 'YOUR_EMAIL@example.com';
  user_password text := 'YOUR_STRONG_PASSWORD';
  new_user_id uuid;
begin
  if user_email = 'YOUR_EMAIL@example.com' or user_password = 'YOUR_STRONG_PASSWORD' then
    raise exception 'Set user_email and user_password before running this script.';
  end if;

  select id into new_user_id
  from auth.users
  where email = user_email;

  if new_user_id is null then
    new_user_id := gen_random_uuid();

    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      '00000000-0000-0000-0000-000000000000',
      new_user_id,
      'authenticated',
      'authenticated',
      user_email,
      extensions.crypt(user_password, extensions.gen_salt('bf')),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', 'Platform Admin'),
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) values (
      gen_random_uuid(),
      new_user_id,
      jsonb_build_object(
        'sub', new_user_id::text,
        'email', user_email,
        'email_verified', true
      ),
      'email',
      new_user_id::text,
      now(),
      now(),
      now()
    );
  else
    update auth.users
    set
      encrypted_password = extensions.crypt(user_password, extensions.gen_salt('bf')),
      email_confirmed_at = coalesce(email_confirmed_at, now()),
      updated_at = now()
    where id = new_user_id;
  end if;

  insert into public.profiles (id, full_name, role)
  values (new_user_id, 'Platform Admin', 'admin')
  on conflict (id) do update
    set
      role = 'admin',
      full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name);

  raise notice 'Admin ready: % (id %)', user_email, new_user_id;
end
$$;
