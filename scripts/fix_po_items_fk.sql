-- Fix Missing Foreign Key on Purchase Order Items
ALTER TABLE purchase_order_items
ADD CONSTRAINT purchase_order_items_product_id_fkey
FOREIGN KEY (product_id) REFERENCES products(id);
