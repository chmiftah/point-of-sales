'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

// --- SUPPLIERS ACTIONS ---

export async function createSupplier(formData: FormData) {
    const supabase = await createClient();

    // 1. Server-Side Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 2. Fetch Truth from Profiles
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) {
        throw new Error('Configuration Error: Tenant ID missing for user.');
    }

    const tenantId = profile.tenant_id;

    const name = formData.get('name') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;

    const { error } = await supabase.from('suppliers').insert({
        tenant_id: tenantId,
        name,
        phone,
        email,
        address
    });

    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/inventory/suppliers');
    return { success: true };
}

export async function deleteSupplier(id: string) {
    const supabase = await createClient();
    // Ideally we should also check tenant ownership here if RLS is off, but sticking to requested scope.
    const { error } = await supabase.from('suppliers').delete().eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/inventory/suppliers');
    return { success: true };
}

// --- PURCHASE ORDERS ACTIONS ---

export async function createPurchaseOrder(data: {
    supplierId: string;
    items: { productId: string; quantity: number; unitCost: number }[];
    status: 'draft' | 'ordered';
    notes?: string;
}) {
    const supabase = await createClient();

    // 1. Server-Side Auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    // 2. Fetch Truth from Profiles
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) {
        throw new Error('Configuration Error: Tenant ID missing for user.');
    }

    const tenantId = profile.tenant_id;

    const totalCost = data.items.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);

    // 3. Create PO Header
    const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert({
            tenant_id: tenantId,
            supplier_id: data.supplierId,
            total_cost: totalCost,
            status: data.status,
            notes: data.notes
        })
        .select()
        .single();

    if (poError) throw new Error(poError.message);

    // 4. Create PO Items
    const itemsToInsert = data.items.map(item => ({
        tenant_id: tenantId,
        po_id: po.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_cost: item.unitCost
    }));

    const { error: itemsError } = await supabase.from('purchase_order_items').insert(itemsToInsert);

    if (itemsError) {
        // Cleanup header if items fail
        await supabase.from('purchase_orders').delete().eq('id', po.id);
        throw new Error(itemsError.message);
    }

    revalidatePath('/dashboard/inventory/purchase-orders');
    return { success: true, poId: po.id };
}

export async function receivePurchaseOrder(poId: string, outletId: string) {
    const supabase = await createClient();

    // 0. Fetch PO to verify status
    const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .select('status, tenant_id')
        .eq('id', poId)
        .single();

    if (poError || !po) throw new Error("Purchase Order not found");
    if (po.status === 'received') throw new Error("PO already processed");

    // 1. Get PO Items
    const { data: items, error: fetchError } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('po_id', poId);

    if (fetchError || !items) throw new Error('Failed to fetch PO items');

    // 2. Process each item (Stock Injection + HPP Update)
    for (const item of items) {
        // A. Stock Upsert (Read-Modify-Write Pattern)
        const { data: currentStock } = await supabase
            .from('product_stocks')
            .select('quantity')
            .eq('product_id', item.product_id)
            .eq('outlet_id', outletId)
            .single();

        const newQuantity = (currentStock?.quantity || 0) + Number(item.quantity);

        const { error: stockError } = await supabase
            .from('product_stocks')
            .upsert({
                tenant_id: po.tenant_id, // Ensure tenant context
                product_id: item.product_id,
                outlet_id: outletId,
                quantity: newQuantity,
                updated_at: new Date().toISOString()
            }, { onConflict: 'product_id, outlet_id' });

        if (stockError) {
            console.error(`Failed to update stock for product ${item.product_id}`, stockError);
            throw new Error(`Stock update failed for item ${item.product_id}`);
        }

        // B. Update Cost Price (HPP) - Last Purchase Price Method
        const { error: costError } = await supabase
            .from('products')
            .update({
                cost_price: item.unit_cost,
                updated_at: new Date().toISOString()
            })
            .eq('id', item.product_id);

        if (costError) console.error(`Failed to update HPP for product ${item.product_id}`, costError);
    }

    // 3. Mark PO as Received
    await supabase.from('purchase_orders')
        .update({
            status: 'received',
            outlet_id: outletId,
            updated_at: new Date().toISOString()
        })
        .eq('id', poId);

    revalidatePath('/dashboard/inventory/purchase-orders');
    revalidatePath(`/dashboard/inventory/purchase-orders/${poId}`);
    return { success: true };
}
