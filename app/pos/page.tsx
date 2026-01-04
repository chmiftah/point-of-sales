
import { createClient } from '@/lib/supabase/server';
import POSClientPage from './pos-client-page';
import { Product } from '@/store/cartStore';

interface Category {
    id: string;
    name: string;
}

export default async function POSPage({
    searchParams
}: {
    searchParams: Promise<{ outletId?: string }>
}) {
    const supabase = await createClient();

    // 1. Get User Context (Strict)
    const { data: { user } } = await supabase.auth.getUser();

    // Auth Guard
    if (!user) {
        // Redirect to login or show error?
        // Since this is a server comp, maybe simple return for now or let middleware handle it.
        return <div>Unauthorized. Please Login.</div>;
    }

    let userProfile = null;
    let outletId: string | null = null;
    let tenantId: string | null = null;
    let isOwner = false;

    // Fetch Profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, role, outlet_id, tenant_id')
        .eq('id', user.id)
        .single();

    tenantId = profile?.tenant_id || null;
    if (!tenantId) return <div>No Tenant Found</div>;

    outletId = profile?.outlet_id; // Assigned outlet
    isOwner = profile?.role === 'owner'; // Check role

    userProfile = {
        name: profile?.full_name || user.user_metadata?.full_name || 'Cashier',
        email: user.email,
        role: profile?.role || user.user_metadata?.role || 'Staff'
    };

    // 2. Determine Active Outlet (Logic Cascade)
    const resolvedParams = await searchParams;
    const paramOutletId = resolvedParams?.outletId;

    let activeOutletId = outletId; // Default to Assigned

    // Priority 1: URL Param (if present)
    if (paramOutletId) {
        activeOutletId = paramOutletId;
    }

    // Priority 2: Fallback for Owner with no outlet (and no URL param)
    if (isOwner && !activeOutletId) {
        const { data: firstOutlet } = await supabase
            .from('outlets')
            .select('id')
            .eq('tenant_id', tenantId)
            .limit(1)
            .single();
        if (firstOutlet) activeOutletId = firstOutlet.id;
    }

    // 3. Fetch Outlets for Switcher (Owner Only needs to see them, but we fetch to pass to client)
    const { data: outlets } = await supabase
        .from('outlets')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .order('name');

    // 4. Fetch Categories
    const { data: categories } = await supabase
        .from('categories')
        .select('id, name');

    // 5. Fetch Products with Stocks (Filtered by Active Outlet)
    let productsQuery = supabase
        .from('products')
        .select(`
            *,
            categories (
                name
            ),
            product_stocks (
                quantity,
                outlet_id
            )
        `)
        .eq('tenant_id', tenantId);

    // Filter stock branch by activeOutletId
    if (activeOutletId) {
        productsQuery = productsQuery.eq('product_stocks.outlet_id', activeOutletId);
    } else {
        // If no outlet context (e.g. brand new owner with no outlets), handle gracefully
        // The join will result in empty stocks, which is fine (stock=0)
    }

    const { data: rawProducts, error: prodError } = await productsQuery;
    if (prodError) console.error("POS Fetch Error:", prodError);

    // 6. Map Data
    const mappedProducts: (Product & { category: string })[] = (rawProducts || []).map((p: any) => {
        // We filtered product_stocks by outlet_id in the query, so the array should contain THE specific stock or be empty.
        const stockEntry = p.product_stocks?.[0]; // Should be only one
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
            outlets={outlets || []}
            currentOutletId={activeOutletId || ''}
        />
    );
}