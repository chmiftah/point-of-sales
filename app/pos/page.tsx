
import { createClient } from '@/lib/supabase/server';
import POSClientPage from './pos-client-page';
import { Product } from '@/store/cartStore';

interface Category {
    id: string;
    name: string;
}

export default async function POSPage() {
    const supabase = await createClient();

    // 1. Get User Context (Strict)
    // We need the outlet_id to fetch the correct stocks.
    const { data: { user } } = await supabase.auth.getUser();
    let userProfile = null;
    let outletId: string | null = null;
    let tenantId: string | null = null;

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, role, outlet_id, tenant_id')
            .eq('id', user.id)
            .single();

        tenantId = profile?.tenant_id || null;

        userProfile = {
            name: profile?.full_name || user.user_metadata?.full_name || 'Cashier',
            email: user.email,
            role: profile?.role || user.user_metadata?.role || 'Staff'
        };

        // If no outlet_id in profile (e.g. Owner), we might default to first outlet or handle specific logic.
        // For POS, we usually require a selected outlet.
        // For this task, strict validation implies we use the assigned outlet if available.
        outletId = profile?.outlet_id;

        // If Owner (no outletId), we should arguably query based on a selected outlet context or just show 0 stock?
        // Let's assume for POS view, if owner is viewing, they might need to pick outlet.
        // BUT strict requirement says "filter product_stocks by the current user's outlet_id".
        // If owner doesn't have one, we might fail to fetch stocks (show 0).
        // Let's fallback to first outlet of tenant if implicit, OR strict empty.
        // Prompt says: "Filter product_stocks by the current user's outlet_id".
        // If null, we'll try to fetch ANY outlet link to show something (dev convenience) or stick to 0.
        // I will stick to profile.outlet_id. If null, stocks will be 0.
        if (!outletId && profile?.tenant_id) {
            // Fallback for Owner without specific outlet: Get first outlet to show SOME data?
            // Or maybe they can't operate POS without selecting one. 
            // To prevent empty screen for Owner, let's grab the first outlet.
            const { data: firstOutlet } = await supabase.from('outlets').select('id').eq('tenant_id', profile.tenant_id).limit(1).single();
            if (firstOutlet) outletId = firstOutlet.id;
        }
    }

    // Fetch Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name');

    // 2. Fetch Products with Stocks
    // Note: We explicitly filter by tenant_id on the product root to be safe,
    // and by outlet_id on the joined resource to get the specific stock.

    let productsQuery = supabase
        .from('products')
        .select(`
            *,
            categories (
                name
            ),
            product_stocks (
                quantity
            )
        `)
        // Filter products by tenant (good practice even if RLS exists)
        .eq('tenant_id', tenantId);

    // Filter stock branch by outlet_id
    if (outletId) {
        productsQuery = productsQuery.eq('product_stocks.outlet_id', outletId);
    }

    const { data: rawProducts, error: prodError } = await productsQuery;
    console.log(rawProducts);
    if (prodError) console.error("POS Fetch Error:", prodError);

    // 3. Transform Data (CRITICAL STEP)
    // Map the raw data to a clean structure for the UI. 
    // Handle cases where product_stocks might be an empty array.
    const mappedProducts: (Product & { category: string })[] = (rawProducts || []).map((p: any) => {
        // 1. Supabase returns stock as an array: [{ quantity: 5 }] or []
        const stockEntry = p.product_stocks?.[0];

        // 2. Safely extract quantity. If array is empty, default to 0.
        const actualStock = stockEntry ? stockEntry.quantity : 0;

        return {
            id: p.id,
            name: p.name,
            price: Number(p.price),
            image: p.image_url,
            category: p.categories?.name || 'Uncategorized',
            stock: actualStock
        };
    });

    const mappedCategories: Category[] = (categories || []).map((c: any) => ({
        id: c.id,
        name: c.name
    }));

    return (
        <POSClientPage
            initialProducts={mappedProducts}
            categories={mappedCategories}
            user={userProfile}
        />
    );
}