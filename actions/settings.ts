'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateTenantProfile(formData: FormData) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 2. Profile Check (Must be Owner)
    // Note: You might want to allow 'admin' too depending on your role design
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile || !profile.tenant_id) {
        throw new Error("Profile not found");
    }

    // Optional: Enforce Owner role
    // if (profile.role !== 'owner') throw new Error("Only owners can update store settings");

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;

    // 3. Update Tenant
    const { error } = await supabase
        .from('tenants')
        .update({
            name,
            address,
            phone,
            updated_at: new Date().toISOString()
        })
        .eq('id', profile.tenant_id);

    if (error) {
        throw new Error(`Update failed: ${error.message}`);
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/settings');
    return { success: true };
}
