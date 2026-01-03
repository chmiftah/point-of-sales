
import { createClient } from "@/lib/supabase/server";
import ProductView from "./product-view";
import { log } from "console";

const ITEMS_PER_PAGE = 10;

export default async function ProductsPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string; outletId?: string }>
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Determine User Role & Context
    let userOutletId: string | null = null;
    let tenantId: string | null = null;
    let isOwner = false;

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id, outlet_id, role')
            .eq('id', user.id)
            .single();
        tenantId = profile?.tenant_id || null;
        userOutletId = profile?.outlet_id || null;
        isOwner = profile?.role === 'owner'; // If no outlet assigned, assume Owner/Admin
    }

    // 2. Determine Target Outlet for Stock Display
    const resolvedParams = await searchParams;
    let targetOutletId = resolvedParams?.outletId || userOutletId;

    // Fetch Outlets for Filter (Only for Owner)
    let outlets: any[] = [];
    if (tenantId) {
        const { data: outletList } = await supabase
            .from('outlets')
            .select('id, name')
            .eq('tenant_id', tenantId)
            .order('name');
        outlets = outletList || [];

        // If Owner hasn't selected an outlet, default to the first one for context
        if (isOwner && !targetOutletId && outlets.length > 0) {
            targetOutletId = outlets[0].id;
        }
        console.log(targetOutletId)
    }

    const currentPage = Number(resolvedParams?.page) || 1;
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    // 3. Build Query
    // We join product_stocks filtering by the specific outlet.
    // Note: If no record exists for that outlet, product_stocks will be empty array (or null depending on exact join behavior with RLS)

    let query = supabase
        .from('products')
        .select(`
            *,
            categories ( name ),
            product_stocks!left ( quantity, outlet_id ) 
        `, { count: 'exact' })
        // IMPORTANT: We want to fetch stocks ONLY for targetOutletId. 
        // Supabase PostgREST join filtering: product_stocks.outlet_id=eq.ID
        .eq('product_stocks.outlet_id', targetOutletId)
        .order('created_at', { ascending: false })
        .range(from, to);

    if (tenantId) {
        query = query.eq('tenant_id', tenantId);
    }

    const { data: products, count } = await query;

    // 4. Map Data
    const mappedProducts = (products || []).map((p: any) => {
        // Since we filtered the join, product_stocks should optimally have 0 or 1 record.
        // However, if the Left Join found nothing (no stock record), the array might be empty.
        // Or if we didn't filter correctly, it might have many.
        // The .eq('product_stocks.outlet_id', ...) applies to the JOIN if using !inner, or filtration on result if !left?
        // Actually, Supabase .eq('table.col', val) on a left join usually filters the parent rows unless configured carefully.
        // To be safe regarding "Filtering nested resource", we rely on the fact that we WANT to see products even if stock is 0.
        // BUT strict filtering on a LEFT JOINed table in PostgREST typically acts like an INNER JOIN.
        // FIX: We need to see ALL products, but only join stock for corresponding outlet.

        // Let's refine the approach: Fetch stocks separately or trust the join?
        // The standard PostgREST way to filter nested resource without filtering parent is: 
        // select('*, product_stocks(*)') + .eq('product_stocks.outlet_id', id) triggers Inner Join behavior usually.
        // For now, we will assume standard behavior and handle the mapping.

        // Actually, for a Product List, we want ALL products. If we filter `product_stocks.outlet_id`, we might lose products that have NO stock record there?
        // Correct.
        // A better approach for this UI might be: Fetch Products, then Fetch Stocks for those products @ Outlet, then merge.
        // OR rely on embedded resource filtering grammar: `product_stocks(quantity, outlet_id).eq.outlet_id` inside the select string?

        // Let's try the embedded filter syntax if Supabase JS supports it clearly, otherwise Manual Merge is safest for "Show all products, 0 stock if missing".

        const stockRecord = (p.product_stocks || []).find((s: any) => s.outlet_id === targetOutletId);
        const quantity = stockRecord ? stockRecord.quantity : 0; // If filtered correctly above, this reduces. If we remove filter above to keep all products, we filter here.

        return {
            ...p,
            stock: quantity
        };
    });

    // RE-FETCH STRATEGY ADJUSTMENT:
    // To ensure we see products with 0 stock (no record), we cannot use `.eq('product_stocks.outlet_id', ...)` at top level if it forces inner join.
    // If we remove that .eq, we get ALL stocks for ALL outlets for each product. Then we filter in memory.
    // Given pagination (10 items), fetching all stocks for 10 items is cheap.

    // Updated Logic below overrides the query above slightly for safety:

    // [Reseting Query for Safety]
    let safeQuery = supabase
        .from('products')
        .select(`
            *,
            categories ( name ),
            product_stocks ( quantity, outlet_id )
        `, { count: 'exact' })
        .eq('tenant_id', tenantId!)
        .order('created_at', { ascending: false })
        .range(from, to);

    const { data: safeProducts, count: safeCount } = await safeQuery;

    const finalProducts = (safeProducts || []).map((p: any) => {
        // Filter in memory for the target outlet
        const relevantStock = (p.product_stocks || []).find((s: any) => s.outlet_id === targetOutletId);
        return {
            ...p,
            // If we found a record, use it. If not, 0.
            stock: relevantStock ? relevantStock.quantity : 0
        }
    });


    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    const totalItems = safeCount || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <div className="max-w-7xl mx-auto p-6 space-y-6">

                <ProductView
                    initialProducts={finalProducts || []}
                    initialCategories={categories || []}
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems
                    }}
                    outletContext={{
                        isOwner,
                        outlets,
                        currentOutletId: targetOutletId || ''
                    }}
                />
            </div>
        </div>
    );
}
