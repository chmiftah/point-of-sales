import { createClient } from "@/lib/supabase/server";
import StockView from "./stock-view";

export default async function StocksPage({
    searchParams
}: {
    searchParams: Promise<{ outlet_id?: string }>
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Unauthorized</div>;

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id, outlet_id')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) return <div>No tenant found.</div>;

    const tenantId = profile.tenant_id;
    const userOutletId = profile.outlet_id;

    // 1. Fetch Outlets (Filtered by Tenant)
    let outletsQuery = supabase
        .from('outlets')
        .select('id, name')
        .eq('tenant_id', tenantId)
        .order('name');

    // If user is restricted to an outlet, only show that one? 
    // Usually stock view is administrative, but if a cashier handles stock, maybe.
    // For now, let's just default to it if set.

    const { data: outlets } = await outletsQuery;

    if (!outlets || outlets.length === 0) {
        return <div className="p-8">No outlets found. Please create an outlet first.</div>;
    }

    const resolvedParams = await searchParams;
    // Default to URL param, then User's Assigned Outlet, then First Outlet
    const currentOutletId = resolvedParams?.outlet_id || userOutletId || outlets[0].id;

    // 2. Fetch Products with Category (Filtered by Tenant)
    const { data: products } = await supabase
        .from('products')
        .select('*, categories(name)')
        .eq('tenant_id', tenantId) // Filter by Tenant
        .order('name');

    // 3. Fetch Stocks for the CURRENT Outlet
    const { data: stocks } = await supabase
        .from('product_stocks')
        .select('*')
        .eq('outlet_id', currentOutletId);

    // 4. Merge Data
    const productsWithStock = products?.map(product => {
        const stockRecord = stocks?.find(s => s.product_id === product.id);
        return {
            id: product.id,
            name: product.name,
            image_url: product.image_url,
            category: product.categories,
            stock: stockRecord?.quantity || 0
        };
    }) || [];

    return (
        <StockView
            products={productsWithStock}
            outlets={outlets}
            currentOutletId={currentOutletId}
        />
    );
}
