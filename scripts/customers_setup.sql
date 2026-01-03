-- Create Customers Table
create table if not exists public.customers (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id),
  name text not null,
  phone text,
  email text,
  address text,
  total_spent numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(phone, tenant_id)
);
se
-- RLS for Customers
alter table public.customers enable row level security;

create policy "Users can view customers of their tenant"
  on public.customers for select
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()));

create policy "Users can insert customers for their tenant"
  on public.customers for insert
  with check (tenant_id = (select tenant_id from profiles where id = auth.uid()));

create policy "Users can update customers of their tenant"
  on public.customers for update
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()));

create policy "Users can delete customers of their tenant"
  on public.customers for delete
  using (tenant_id = (select tenant_id from profiles where id = auth.uid()));

-- Add customer_id to Orders table if it doesn't exist
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'orders' and column_name = 'customer_id') then
    alter table public.orders add column customer_id uuid references public.customers(id);
  end if;
end $$;

-- Enable RLS updates/inserts for Orders to include customer_id (existing policies likely cover insert checks if generic, otherwise might need update)
-- Assuming exisitng policies on orders rely on tenant_id, so adding customer_id column is safe.
