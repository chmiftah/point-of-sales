'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

interface CheckoutItem {
    id: string;
    quantity: number;
    price: number;
}

export async function checkoutAction(
    items: CheckoutItem[],
    totalAmount: number,
    paymentMethod: string,
    customerId?: string,
    selectedOutletId?: string // <--- Parameter ke-5 yang dikirim dari PaymentModal
) {
    const supabase = await createClient();

    // 1. Cek User Login
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { success: false, error: 'Unauthorized: No active session' };
    }

    try {
        // 2. Ambil Profile User untuk Cek Role & Tenant
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('tenant_id, outlet_id, role')
            .eq('id', user.id)
            .single();

        if (profileError || !profile) {
            return { success: false, error: 'Profile not found.' };
        }

        // --- DEBUGGING LOG (Lihat ini di Terminal VSCode Anda saat Transaksi) ---
        console.log("DEBUG CHECKOUT:", {
            userRoleDB: profile?.role,
            inputOutletId: selectedOutletId,
            profileOutletId: profile?.outlet_id,
            isOwnerCheck: profile?.role === 'owner' // Check true/false
        });

        const { tenant_id, role } = profile;

        // 3. TENTUKAN OUTLET ID (CRITICAL LOGIC)
        // Default: Gunakan outlet_id milik user (ini untuk Staff/Kasir agar terkunci)
        let finalOutletId = profile.outlet_id;

        // JIKA OWNER:
        // Kita izinkan Owner menggunakan 'selectedOutletId' yang dikirim dari Frontend (hasil pilihan di Switcher)
        if (role === 'owner') {
            if (selectedOutletId) {
                finalOutletId = selectedOutletId;
            } else {
                // Fallback jika Owner tidak memilih (misal error frontend), kembalikan error atau pakai default
                return { success: false, error: 'Owner wajib memilih Outlet aktif.' };
            }
        }

        // Validasi Akhir
        if (!finalOutletId) {
            return { success: false, error: 'Outlet ID is missing or invalid.' };
        }

        // --- MULAI TRANSAKSI ---

        // 4. Validasi Stok (Opsional: Strict Mode)
        // Kita gunakan finalOutletId untuk mengecek stok di cabang yang BENAR
        for (const item of items) {
            const { data: stockData } = await supabase
                .from('product_stocks')
                .select('quantity')
                .eq('product_id', item.id)
                .eq('outlet_id', finalOutletId) // <--- Cek stok di outlet yang dipilih
                .single();

            const currentQty = stockData?.quantity || 0;
            if (currentQty < item.quantity) {
                return { success: false, error: `Stok tidak cukup untuk item ID: ${item.id} di outlet ini.` };
            }
        }

        // 5. Buat Order
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                tenant_id: tenant_id,
                outlet_id: finalOutletId, // <--- Simpan transaksi di outlet yang dipilih
                customer_id: customerId || null,
                total_amount: totalAmount,
                payment_method: paymentMethod,
                status: 'completed'
            })
            .select()
            .single();

        if (orderError) throw new Error(`Gagal membuat order: ${orderError.message}`);

        // 6. Simpan Item Order
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

        if (itemsError) throw new Error(`Gagal menyimpan item: ${itemsError.message}`);

        // 7. Kurangi Stok (Decrement)
        for (const item of items) {
            // Gunakan RPC atau Logic manual. Disini manual read-update untuk simplifikasi.
            // Lebih aman menggunakan RPC 'decrement_stock' jika ada traffic tinggi.
            const { data: stock } = await supabase
                .from('product_stocks')
                .select('quantity')
                .eq('product_id', item.id)
                .eq('outlet_id', finalOutletId)
                .single();

            if (stock) {
                const newQty = Math.max(0, stock.quantity - item.quantity);
                await supabase
                    .from('product_stocks')
                    .update({
                        quantity: newQty,
                        updated_at: new Date().toISOString()
                    })
                    .eq('product_id', item.id)
                    .eq('outlet_id', finalOutletId); // <--- Update stok di outlet yang dipilih
            }
        }

        // 8. Revalidate Cache
        // Agar stok di halaman POS langsung update tanpa refresh manual
        revalidatePath('/pos');
        revalidatePath('/dashboard');

        return { success: true, orderId: order.id };

    } catch (error: any) {
        console.error('Checkout Error:', error);
        return { success: false, error: error.message };
    }
}