
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Tenants (Already exists apparently, but for completeness)
create table if not exists public.tenants (
  id uuid default uuid_generate_v4() primary key,
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Outlets
create table if not exists public.outlets (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id),
  name text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Categories
create table if not exists public.categories (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id),
  name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(name, tenant_id)
);

-- Products
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id),
  category_id uuid references public.categories(id),
  name text,
  price numeric,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(name, tenant_id)
);

-- Product Stocks
create table if not exists public.product_stocks (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id),
  outlet_id uuid references public.outlets(id),
  quantity integer default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(product_id, outlet_id)
);

-- Orders (Simple structure for POS)
create table if not exists public.orders (
  id uuid default uuid_generate_v4() primary key,
  tenant_id uuid references public.tenants(id),
  outlet_id uuid references public.outlets(id),
  total_amount numeric,
  payment_method text,
  status text default 'completed',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items
create table if not exists public.order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references public.orders(id),
  product_id uuid references public.products(id),
  tenant_id uuid references public.tenants(id),
  outlet_id uuid references public.outlets(id),
  quantity integer,
  price numeric,
  subtotal numeric
);

-- RLS Policies (Optional but good practice - simplified for now)
alter table public.tenants enable row level security;
alter table public.outlets enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_stocks enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Allow read for everyone (Simulating public for dev) or authenticated
create policy "Public Read Tenants" on public.tenants for select using (true);
create policy "Public Read Outlets" on public.outlets for select using (true);
create policy "Public Read Categories" on public.categories for select using (true);
create policy "Public Read Products" on public.products for select using (true);
create policy "Public Read Stocks" on public.product_stocks for select using (true);

-- Profiles (Linking Auth User to Tenant)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  tenant_id uuid references public.tenants(id),
  outlet_id uuid references public.outlets(id),
  full_name text,
  role text default 'owner',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;
create policy "Public Read Profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
