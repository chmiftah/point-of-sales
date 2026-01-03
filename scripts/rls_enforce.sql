-- 1. Ensure columns exist (Idempotent checks)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tenant_id') THEN
        ALTER TABLE products ADD COLUMN tenant_id uuid references tenants(id) not null;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'tenant_id') THEN
        ALTER TABLE categories ADD COLUMN tenant_id uuid references tenants(id) not null;
    END IF;
END $$;

-- 2. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_products_tenant ON products(tenant_id);
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);

-- 3. Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- 4. Clean up old policies to avoid conflicts
DROP POLICY IF EXISTS "Public Read Products" ON products;
DROP POLICY IF EXISTS "Public Read Categories" ON categories;
DROP POLICY IF EXISTS "Tenant Isolation Select Products" ON products;
DROP POLICY IF EXISTS "Tenant Isolation Modify Products" ON products;
DROP POLICY IF EXISTS "Tenant Isolation Select Categories" ON categories;
DROP POLICY IF EXISTS "Tenant Isolation Modify Categories" ON categories;

-- 5. Define Strict RLS Policies

-- PRODUCTS
-- SELECT: User can see products if their profile.tenant_id matches product.tenant_id
CREATE POLICY "Tenant Isolation Select Products" ON products
    FOR SELECT
    USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- MODIFY (Insert/Update/Delete): User can only modify rows where tenant matches
CREATE POLICY "Tenant Isolation Modify Products" ON products
    FOR ALL
    USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
    WITH CHECK (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- CATEGORIES
-- SELECT
CREATE POLICY "Tenant Isolation Select Categories" ON categories
    FOR SELECT
    USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );

-- MODIFY
CREATE POLICY "Tenant Isolation Modify Categories" ON categories
    FOR ALL
    USING (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    )
    WITH CHECK (
        tenant_id = (SELECT tenant_id FROM profiles WHERE id = auth.uid())
    );
