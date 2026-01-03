"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getTenantId(supabase: any) {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) throw new Error("Tenant not found");
    return profile.tenant_id;
}

type AdjustmentType = 'add' | 'subtract' | 'set';

export async function updateStock({
    productId,
    outletId,
    quantity, // This is the INPUT value (e.g. 5 to add, 5 to set)
    adjustmentType
}: {
    productId: string,
    outletId: string,
    quantity: number,
    adjustmentType: AdjustmentType
}) {
    const supabase = await createClient();
    const tenant_id = await getTenantId(supabase);

    // 1. If 'set', we just upsert.
    // 2. If 'add'/'subtract', we need current stock.
    // However, to ensure atomicity, it's best to process this logic carefully.
    // Ideally, we'd use a database function or a serializable transaction.
    // For this implementation, we will fetch current, calc, and upsert.

    let finalQuantity = quantity;

    if (adjustmentType !== 'set') {
        const { data: currentStock } = await supabase
            .from('product_stocks')
            .select('quantity')
            .eq('product_id', productId)
            .eq('outlet_id', outletId)
            .single();

        const currentQty = currentStock?.quantity || 0;

        if (adjustmentType === 'add') {
            finalQuantity = currentQty + quantity;
        } else if (adjustmentType === 'subtract') {
            finalQuantity = Math.max(0, currentQty - quantity);
        }
    }

    const { error } = await supabase
        .from('product_stocks')
        .upsert({
            product_id: productId,
            outlet_id: outletId,
            tenant_id: tenant_id,
            quantity: finalQuantity
        }, {
            onConflict: 'product_id, outlet_id'
        });

    if (error) {
        console.error("Stock Update Error:", error);
        return { error: error.message };
    }

    revalidatePath("/dashboard/inventory/stocks");
    return { success: true };
}
