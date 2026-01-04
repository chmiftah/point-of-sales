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

// UPDATE: Tambahkan parameter 'selectedOutletId'
export async function checkoutAction(
    items: CheckoutItem[],
    totalAmount: number,
    paymentMethod: string,
    customerId?: string,
    selectedOutletId?: string // <--- PARAMETER BARU (Opsional, wajib bagi Owner)
): Promise<CheckoutResult> {
    const supabase = await createClient();

    // 1. Get Current User
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: 'Unauthorized: No active session' };
    }

    try {
        // 2. Resolve Tenant & Profile
        // Ambil juga kolom 'role' untuk pengecekan
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tenant_id, outlet_id, role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return { success: false, error: 'Authorization Error: Profile not found.' };
        }

        const { tenant_id, role } = profile;

        if (!tenant_id) {
            return { success: false, error: 'Configuration Error: User has no Tenant.' };
        }

        // --- LOGIC PENENTUAN OUTLET ---
        // Prioritize selectedOutletId (from UI/URL), fallback to profile.outlet_id (assigned outlet)
        const targetOutletId = selectedOutletId || profile.outlet_id;

        // if (role === 'owner') {
        //    // Original strict logic removed based on user request to fallback
        // }

        console.log(selectedOutletId, targetOutletId)

        // Final Validation
        if (!targetOutletId) {
            return { success: false, error: 'Transaction Error: Outlet ID is missing.' };
        }

        // --- PRE-FLIGHT STOCK CHECK ---
        for (const item of items) {
            const { data: stockData } = await supabase
                .from('product_stocks')
                .select('quantity')
                .eq('product_id', item.id)
                .eq('outlet_id', targetOutletId) // <--- Gunakan targetOutletId
                .single();

            const currentQty = stockData?.quantity || 0;

            // Uncomment baris ini jika ingin strict validation
            // if (currentQty < item.quantity) {
            //     return { success: false, error: `Stok habis untuk Item ID: ${item.id}. Sisa: ${currentQty}` };
            // }
        }

        // 3. Create Order
        console.log("Creating Order with Outlet ID:", targetOutletId);

        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                tenant_id: tenant_id,
                outlet_id: targetOutletId, // <--- Gunakan targetOutletId
                customer_id: customerId || null,
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
            tenant_id: tenant_id,
            quantity: item.quantity,
            price: item.price,
            subtotal: item.quantity * item.price
        }));

        const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItemsData);

        if (itemsError) throw new Error(`Order Items Failed: ${itemsError.message}`);

        // 5. Update Stock (Decrement)
        for (const item of items) {
            const { data: stock } = await supabase
                .from('product_stocks')
                .select('quantity')
                .eq('product_id', item.id)
                .eq('outlet_id', targetOutletId) // <--- Gunakan targetOutletId
                .single();

            if (stock) {
                const newQty = Math.max(0, stock.quantity - item.quantity);
                await supabase
                    .from('product_stocks')
                    .update({ quantity: newQty, updated_at: new Date().toISOString() })
                    .eq('product_id', item.id)
                    .eq('outlet_id', targetOutletId); // <--- Gunakan targetOutletId
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