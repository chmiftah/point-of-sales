-- 1. Add missing columns to tenants table
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Ensure RLS is enabled
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Allow users to view the tenant they belong to
create policy "Users can view their own tenant"
on tenants for select
using (
  id in (
    select tenant_id from profiles
    where profiles.id = auth.uid()
  )
);

-- Allow OWNERS to update their own tenant
create policy "Owners can update their own tenant"
on tenants for update
using (
  id in (
    select tenant_id from profiles
    where profiles.id = auth.uid()
    and profiles.role = 'owner' -- Assuming 'owner' role string. Adjust if your roles are different (e.g. 'admin')
  )
);
