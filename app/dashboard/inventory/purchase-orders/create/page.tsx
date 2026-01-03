
import { createClient } from "@/lib/supabase/server";
import CreatePOPage from "@/components/inventory/create-po-form";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const dynamic = 'force-dynamic';

export default async function CreatePurchaseOrderPageWrapper() {
    const supabase = await createClient();

    // 1. Get User Context
    const { data: { user } } = await supabase.auth.getUser();
    let tenantId: string | null = null;
    let outletId: string | null = null;

    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('tenant_id, outlet_id')
            .eq('id', user.id)
            .single();
        tenantId = profile?.tenant_id || null;
        outletId = profile?.outlet_id || null;
    }

    // 2. Fetch dependencies with strict tenant filtering
    let suppliersQuery = supabase.from('suppliers').select('id, name').order('name');
    let productsQuery = supabase
        .from('products')
        .select(`
            *,
            categories ( name ),
            product_stocks ( quantity )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

    console.log(suppliersQuery, productsQuery)
    if (tenantId) {
        suppliersQuery = suppliersQuery.eq('tenant_id', tenantId);
        productsQuery = productsQuery.eq('tenant_id', tenantId);
    }

    // Additional scope for products? (Maybe not needed for PO creation, usually central warehouse)
    // But stock display might want outlet context? 
    // For now, let's keep it simple matched to tenant.

    const { data: suppliers } = await suppliersQuery;
    const { data: products } = await productsQuery;

    // Flatten products manually
    const formattedProducts = products?.map((p: any) => {
        // Handle joined stock
        let stockQty = 0;
        if (Array.isArray(p.stock)) {
            // If we have outletId, try to find specific stock, otherwise sum?
            // Given the join wasn't filtered by outlet_id in the query, we get all stocks.
            // Let's filter in memory if outletId exists, or sum.
            if (outletId) {
                // We can't filter in memory easily without outlet_id in the select.
                // The previous 'ProductsPage' select was: stock:product_stocks(quantity) which returns [{quantity: 10}, {quantity: 5}]
                // We didn't select outlet_id in the join. 
                // Let's simple sum for now implicitly like before.
                stockQty = p.stock.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0);
            } else {
                stockQty = p.stock.reduce((acc: number, curr: any) => acc + (curr.quantity || 0), 0);
            }
        }

        return {
            id: p.id,
            name: p.name,
            cost_price: p.cost_price,
            stock: stockQty
        };
    }) || [];

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Create Purchase Order</h2>
                    <p className="text-slate-500">Restock inventory from your suppliers.</p>
                </div>

                <Card className="border-slate-200 bg-white shadow-sm">
                    <CardContent className="p-0">
                        <CreatePOPage suppliers={suppliers || []} products={formattedProducts} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
