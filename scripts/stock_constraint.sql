-- Add unique constraint to product_stocks to enable UPSERT
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'product_stocks_uniq_product_outlet'
    ) THEN
        ALTER TABLE product_stocks 
        ADD CONSTRAINT product_stocks_uniq_product_outlet 
        UNIQUE (product_id, outlet_id);
    END IF;
END $$;
