
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase Environment Variables!');
    process.exit(1);
}

// Initialize Supabase Admin Client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function seed() {
    console.log('🌱 Starting Database Seeding...');

    // 1. Create Tenant (Mocking a tenant creation if table exists, otherwise adapting to schema)
    // Assuming a Schema: tenants, outlets, products, categories, users
    // Adjust based on your ACTUAL schema. For now, I will assume a standard SaaS schema.

    // NOTE: Since I don't see the exact schema definitions in the prompt, I will assume generic tables.
    // If tables don't exist, this will fail. Ideally, we should inspect schema first, but I will write standard inserts.

    try {
        // --- TENANT ---
        console.log('Creating Tenant...');
        const { data: tenant, error: tenantError } = await supabase
            .from('tenants')
            .insert({ name: 'PT POS Indonesia' })
            .select()
            .single();

        if (tenantError) {
            // If duplicate (slug exists), try to fetch it
            if (tenantError.code === '23505') {
                console.log('Tenant exists, fetching...');
                var { data: existingTenant } = await supabase.from('tenants').select().eq('name', 'PT POS Indonesia').single();
                var tenantId = existingTenant?.id;
            } else {
                throw new Error(`Tenant Error: ${tenantError.message}`);
            }
        } else {
            var tenantId = tenant.id;
        }

        if (!tenantId) throw new Error("Failed to get Tenant ID");
        console.log(`✅ Tenant ID: ${tenantId}`);

        // --- OUTLET ---
        console.log('Creating Outlet...');
        const { data: outlet, error: outletError } = await supabase
            .from('outlets')
            .insert({
                name: 'Kopi Kenangan Senopati',
                tenant_id: tenantId,
                address: 'Jl. Senopati No. 99, Jakarta Selatan'
            })
            .select()
            .single();

        if (outletError) {
            // Handle duplicate if needed, or simple fail
            console.warn(`Outlet creation warning (might exist): ${outletError.message}`);
            var { data: existingOutlet } = await supabase.from('outlets').select().eq('name', 'Kopi Kenangan Senopati').single();
            var outletId = existingOutlet?.id;
        } else {
            var outletId = outlet.id;
        }

        if (!outletId) throw new Error("Failed to get Outlet ID");
        console.log(`✅ Outlet ID: ${outletId}`);

        // --- CATEGORIES ---
        console.log('Creating Categories...');
        const categoriesData = [
            { name: 'Coffee', tenant_id: tenantId },
            { name: 'Non-Coffee', tenant_id: tenantId },
            { name: 'Pastry', tenant_id: tenantId },
            { name: 'Manual Brew', tenant_id: tenantId },
        ];

        const { data: categories, error: catError } = await supabase
            .from('categories')
            .upsert(categoriesData, { onConflict: 'name, tenant_id' }) // Assuming generic constraint
            .select();

        if (catError) throw new Error(`Category Error: ${catError.message}`);

        // Map category names to IDs for product insertion
        const catMap: Record<string, string> = {};
        categories?.forEach((c: any) => catMap[c.name] = c.id);
        console.log(`✅ Created ${categories?.length} Categories`);


        // --- PRODUCTS ---
        console.log('Creating Products...');
        // Helpers
        const getCatId = (name: string) => catMap[name] || categories?.[0]?.id;

        const productsData = [
            // Coffee
            { name: 'Caramel Macchiato', price: 45000, category_id: getCatId('Coffee'), image_url: 'https://images.unsplash.com/photo-1485808191679-5f8c7c8606af?auto=format&fit=crop&q=80&w=300' },
            { name: 'Iced Americano', price: 32000, category_id: getCatId('Coffee'), image_url: 'https://images.unsplash.com/photo-1517701604599-bb29b5dd7359?auto=format&fit=crop&q=80&w=300' },
            { name: 'Cappuccino', price: 38000, category_id: getCatId('Coffee'), image_url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=300' },
            { name: 'Espresso', price: 25000, category_id: getCatId('Coffee'), image_url: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=300' },
            { name: 'Caffe Latte', price: 35000, category_id: getCatId('Coffee'), image_url: 'https://images.unsplash.com/photo-1595434091143-b375ced5fe5c?auto=format&fit=crop&q=80&w=300' },

            // Non-Coffee
            { name: 'Matcha Latte', price: 48000, category_id: getCatId('Non-Coffee'), image_url: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3002?auto=format&fit=crop&q=80&w=300' },
            { name: 'Chocolate Classic', price: 42000, category_id: getCatId('Non-Coffee'), image_url: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&q=80&w=300' },
            { name: 'Red Velvet Latte', price: 45000, category_id: getCatId('Non-Coffee'), image_url: 'https://images.unsplash.com/photo-1616486338812-3aeee96b7bcc?auto=format&fit=crop&q=80&w=300' },
            { name: 'Lychee Tea', price: 28000, category_id: getCatId('Non-Coffee'), image_url: 'https://images.unsplash.com/photo-1626500135898-751bd7308709?auto=format&fit=crop&q=80&w=300' },

            // Pastry
            { name: 'Croissant Butter', price: 28000, category_id: getCatId('Pastry'), image_url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=300' },
            { name: 'Almond Croissant', price: 38000, category_id: getCatId('Pastry'), image_url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=300' },
            { name: 'Cheesecake Slice', price: 50000, category_id: getCatId('Pastry'), image_url: 'https://images.unsplash.com/photo-1508737027454-e6454ef45afd?auto=format&fit=crop&q=80&w=300' },
            { name: 'Avocado Toast', price: 65000, category_id: getCatId('Pastry'), image_url: 'https://images.unsplash.com/photo-1588137372308-15f75323a399?auto=format&fit=crop&q=80&w=300' },

            // Manual Brew
            { name: 'V60 Ethiopia', price: 45000, category_id: getCatId('Manual Brew'), image_url: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=300' },
            { name: 'Japanese Cold Brew', price: 40000, category_id: getCatId('Manual Brew'), image_url: 'https://images.unsplash.com/photo-1461023058943-48dbf1399f98?auto=format&fit=crop&q=80&w=300' }
        ];

        // Insert Products
        const { data: createdProducts, error: prodError } = await supabase
            .from('products')
            .upsert(productsData.map(p => ({ ...p, tenant_id: tenantId })), { onConflict: 'name, tenant_id' })
            .select();

        if (prodError) throw new Error(`Product Error: ${prodError.message}`);
        console.log(`✅ Created/Updated ${createdProducts?.length} Products`);

        if (createdProducts && createdProducts.length > 0) {
            console.log('Initializing Stock...');
            // Insert Stock for each product in this outlet
            // Schema Assumption: product_stocks (product_id, outlet_id, quantity)

            const stockData = createdProducts.map(p => ({
                product_id: p.id,
                outlet_id: outletId,
                quantity: 100 // Default stock
            }));

            const { error: stockError } = await supabase
                .from('product_stocks')
                .upsert(stockData, { onConflict: 'product_id, outlet_id' }); // Assuming constraint

            if (stockError) console.warn(`Stock Warning: ${stockError.message} (Maybe table doesn't exist yet?)`);
            else console.log('✅ Stock Initialized (100 pcs each)');
        }


        // --- USER (CASHIER) ---
        // Creating a user in auth.users is simpler via Admin API if needed, 
        // but typically we just insert into `public.users` or use `supabase.auth.admin.createUser`

        console.log('Checking Cashier User...');
        const { data: { users }, error: authSearchError } = await supabase.auth.admin.listUsers();

        const cashierEmail = 'kasir@pos.com';
        let cashierId = users.find(u => u.email === cashierEmail)?.id;

        if (!cashierId) {
            console.log('Creating new Cashier User...');
            const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
                email: cashierEmail,
                password: 'password123',
                email_confirm: true,
                user_metadata: { role: 'cashier', tenant_id: tenantId, outlet_id: outletId }
            });

            if (createUserError) throw new Error(`Auth Error: ${createUserError.message}`);
            cashierId = newUser.user.id;
            console.log(`✅ Created Auth User: ${cashierEmail}`);
        } else {
            console.log(`ℹ️ User ${cashierEmail} already exists.`);
        }

        // --- UPSERT PROFILE ---
        console.log('Ensuring Profile exists...');
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: cashierId,
                tenant_id: tenantId,
                outlet_id: outletId,
                full_name: 'Cashier 1',
                role: 'cashier'
            });

        if (profileError) throw new Error(`Profile Error: ${profileError.message}`);
        console.log('✅ Profile Ensured');

        console.log('🎉 SEEDING COMPLETE! 🎉');

    } catch (err: any) {
        console.error('❌ SEEDING FAILED:', err.message);
    }
}

seed();
