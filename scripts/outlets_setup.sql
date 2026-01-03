-- Add missing columns
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE outlets ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Enable RLS on outlets
ALTER TABLE outlets ENABLE ROW LEVEL SECURITY;

-- Policy: Allow users to view outlets belonging to their tenant
CREATE POLICY "Users can view own tenant outlets"
ON outlets FOR SELECT
USING (
  tenant_id IN (
    SELECT tenant_id FROM profiles
    WHERE profiles.id = auth.uid()
  )
);

-- Policy: Allow OWNERS to insert outlets
CREATE POLICY "Owners can create outlets"
ON outlets FOR INSERT
WITH CHECK (
  tenant_id IN (
    SELECT tenant_id FROM profiles
    WHERE profiles.id = auth.uid()
    -- AND profiles.role = 'owner' -- Uncomment to restrict to owners only
  )
);

-- Policy: Allow OWNERS to update their own outlets
CREATE POLICY "Owners can update own outlets"
ON outlets FOR UPDATE
USING (
  tenant_id IN (
    SELECT tenant_id FROM profiles
    WHERE profiles.id = auth.uid()
    -- AND profiles.role = 'owner'
  )
);

-- Policy: Allow OWNERS to delete their own outlets
CREATE POLICY "Owners can delete own outlets"
ON outlets FOR DELETE
USING (
  tenant_id IN (
    SELECT tenant_id FROM profiles
    WHERE profiles.id = auth.uid()
    -- AND profiles.role = 'owner'
  )
);
