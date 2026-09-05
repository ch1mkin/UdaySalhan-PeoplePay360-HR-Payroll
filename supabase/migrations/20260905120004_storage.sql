-- PeoplePay360 — storage buckets for documents, photos, contracts, payslip PDFs

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'profile-photos',
    'profile-photos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'employee-documents',
    'employee-documents',
    false,
    20971520,
    array['application/pdf', 'image/jpeg', 'image/png']
  ),
  (
    'contract-files',
    'contract-files',
    false,
    20971520,
    array['application/pdf']
  ),
  (
    'payslip-pdfs',
    'payslip-pdfs',
    false,
    10485760,
    array['application/pdf']
  )
on conflict (id) do nothing;

-- Path convention: {company_id}/{employee_id}/{filename}

create policy profile_photos_select on storage.objects
  for select to authenticated
  using (bucket_id = 'profile-photos');

create policy profile_photos_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'profile-photos'
    and (
      public.has_hr_access()
      or split_part(name, '/', 2) = public.auth_employee_id()::text
    )
  );

create policy employee_documents_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'employee-documents'
    and (
      public.has_hr_access()
      or split_part(name, '/', 2) = public.auth_employee_id()::text
    )
  );

create policy employee_documents_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'employee-documents'
    and public.has_hr_access()
  );

create policy contract_files_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'contract-files'
    and public.has_hr_access()
  );

create policy contract_files_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'contract-files'
    and public.has_hr_access()
  );

create policy payslip_pdfs_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'payslip-pdfs'
    and (
      public.has_payroll_access()
      or public.has_hr_access()
      or split_part(name, '/', 2) = public.auth_employee_id()::text
    )
  );

create policy payslip_pdfs_write on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'payslip-pdfs'
    and public.has_payroll_access()
  );
