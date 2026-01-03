import { createClient } from "@/lib/supabase/server";
import StockView from "./stock-view";

export default async function StocksPage({
    searchParams
}: {
    searchParams: Promise<{ outlet_id?: string }>
}) {
    const supabase = await createClient();

    // 1. Fetch Outlets
    const { data: outlets } = await supabase
        .from('outlets')
        .select('id, name')
        .order('name');

    if (!outlets || outlets.length === 0) {
        return <div className="p-8">No outlets found. Please create an outlet first.</div>;
    }

    const resolvedParams = await searchParams;
    const currentOutletId = resolvedParams?.outlet_id || outlets[0].id;

    // 2. Fetch Products with Category
    const { data: products } = await supabase
        .from('products')
        .select('*, categories(name)')
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
