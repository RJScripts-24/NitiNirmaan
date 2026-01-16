-- Add organization details to profiles
alter table profiles 
add column if not exists org_logo_url text,
add column if not exists org_website text;

-- Create storage bucket for organization logos
insert into storage.buckets (id, name, public)
values ('org-logos', 'org-logos', true)
on conflict (id) do nothing;

-- Allow public access to read logos
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'org-logos' );

-- Allow authenticated users to upload their own logos
create policy "Authenticated users can upload logos"
on storage.objects for insert
with check ( bucket_id = 'org-logos' and auth.role() = 'authenticated' );

create policy "Authenticated users can update logos"
on storage.objects for update
with check ( bucket_id = 'org-logos' and auth.role() = 'authenticated' );
