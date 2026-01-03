'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CheckoutItem {
    id: string; // Product ID
    quantity: number;
    price: number;
}

interface CheckoutResult {
    success: boolean;
    orderId?: string;
    error?: string;
}

export async function checkoutAction(
    items: CheckoutItem[],
    totalAmount: number,
    paymentMethod: string
): Promise<CheckoutResult> {
    const supabase = await createClient();

    // 1. Get Current User (Cashier)
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'Unauthorized: No active session' };
    }

    try {
        // 2. Resolve Tenant & Outlet STRICTLY from Profile
        // IGNORE user_metadata and client headers. Source of truth is the Profile table.
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tenant_id, outlet_id')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return { success: false, error: 'Authorization Error: Profile not found.' };
        }

        const { tenant_id, outlet_id } = profile;

        if (!tenant_id || !outlet_id) {
            return {
                success: false,
                error: 'Configuration Error: User is not assigned to a Tenant or Outlet.'
            };
        }

        // --- PRE-FLIGHT STOCK CHECK ---
        for (const item of items) {
            const { data: stockData } = await supabase
                .from('product_stocks')
                .select('quantity')
                .eq('product_id', item.id)
                .eq('outlet_id', outlet_id)
                .single();

            const currentQty = stockData?.quantity || 0;

            if (currentQty < item.quantity) {
                return { success: false, error: `Stok habis untuk Item ID: ${item.id}. Sisa: ${currentQty}` };
            }
        }

        // 3. Create Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                tenant_id: tenant_id,
                outlet_id: outlet_id,
                total_amount: totalAmount,
                payment_method: paymentMethod,
                status: 'completed'
            })
            .select()
            .single();

        if (orderError) throw new Error(`Order Creation Failed: ${orderError.message}`);

        // 4. Create Order Items
        const orderItemsData = items.map(item => ({
            order_id: order.id,
            product_id: item.id,
            tenant_id: tenant_id, // SAFE: Derived from profile
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData);

        if (itemsError) throw new Error(`Order Items Failed: ${itemsError.message}`);

        // 5. Update Stock (Decrement)
        // We verified stock availability above. Now we deduct.
        for (const item of items) {
            const { data: stock } = await supabase
                .from('product_stocks')
                .select('quantity')
                .eq('product_id', item.id)
                .eq('outlet_id', outlet_id)
                .single();

            if (stock) {
                const newQty = Math.max(0, stock.quantity - item.quantity);
                await supabase
                    .from('product_stocks')
                    .update({ quantity: newQty, updated_at: new Date().toISOString() })
                    .eq('product_id', item.id)
                    .eq('outlet_id', outlet_id);
            }
        }

        // 6. Revalidate
        revalidatePath('/dashboard');
        revalidatePath('/pos');
        revalidatePath('/dashboard/transactions');

        return { success: true, orderId: order.id };

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return { success: false, error: error.message };
    }
}
