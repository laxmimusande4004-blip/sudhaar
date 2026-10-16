
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'complaint-photos',
    'complaint-photos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  ),
  (
    'resolution-proof',
    'resolution-proof',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']
  )
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can view complaint photos"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'complaint-photos');

create policy "Citizens can upload their complaint photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'complaint-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Citizens can delete their complaint photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'complaint-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy "Public can view resolution proof"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'resolution-proof');

create policy "Admins can upload resolution proof"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'resolution-proof'
  and (select private.is_admin())
);

create policy "Admins can delete resolution proof"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'resolution-proof'
  and (select private.is_admin())
);
