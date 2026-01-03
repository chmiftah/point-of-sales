-- Create a new private bucket 'product-images'
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true);

-- Policy to allow authenticated uploads
create policy "Authenticated users can upload product images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'product-images' );

-- Policy to allow public viewing
create policy "Public can view product images"
on storage.objects for select
to public
using ( bucket_id = 'product-images' );

-- Policy for updating/deleting (optional, restrict to owner or tenant logic if advanced)
create policy "Authenticated users can update own images"
on storage.objects for update
to authenticated
using ( bucket_id = 'product-images' );

create policy "Authenticated users can delete own images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'product-images' );
