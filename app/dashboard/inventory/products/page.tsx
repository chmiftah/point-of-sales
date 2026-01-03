
import { createClient } from "@/lib/supabase/server";
import ProductView from "./product-view";

const ITEMS_PER_PAGE = 10;

export default async function ProductsPage({
    searchParams
}: {
    searchParams: Promise<{ page?: string }>
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    let outletId: string | null = null;
    let tenantId: string | null = null;

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id, outlet_id')
            .eq('id', user.id)
            .single();
        tenantId = profile?.tenant_id || null;
        outletId = profile?.outlet_id || null;
    }

    const resolvedParams = await searchParams;
    const currentPage = Number(resolvedParams?.page) || 1;
    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
        .from('products')
        .select(`
            *,
            categories ( name ),
            product_stocks ( quantity )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

    if (tenantId) {
        query = query.eq('tenant_id', tenantId);
    }

    if (outletId) {
        query = query.eq('product_stocks.outlet_id', outletId);
    }

    const { data: products, count } = await query;

    const mappedProducts = (products || []).map((p: any) => {
        const totalStock = (p.product_stocks || []).reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0);
        return {
            ...p,
            stock: totalStock
        };
    });

    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('name');

    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <div className="max-w-7xl mx-auto p-6">
                <ProductView
                    initialProducts={mappedProducts || []}
                    initialCategories={categories || []}
                    pagination={{
                        currentPage,
                        totalPages,
                        totalItems
                    }}
                />
            </div>
        </div>
    );
}
