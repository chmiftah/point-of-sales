'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createOutlet(formData: FormData) {
    const supabase = await createClient();

    // 1. Auth & Tenant Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile?.tenant_id) throw new Error("Tenant context missing");

    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string; // Optional

    if (!name) throw new Error("Outlet name is required");

    // 2. Insert
    const { error } = await supabase.from('outlets').insert({
        tenant_id: profile.tenant_id,
        name,
        address,
        phone,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    });

    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/settings');
    return { success: true };
}

export async function updateOutlet(formData: FormData) {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const address = formData.get("address") as string;
    const phone = formData.get("phone") as string;

    if (!id || !name) throw new Error("Invalid request");

    // 2. Update (RLS handles tenant check, but explicit check is safer)
    const { error } = await supabase
        .from('outlets')
        .update({
            name,
            address,
            phone,
            updated_at: new Date().toISOString()
        })
        .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/dashboard/settings');
    return { success: true };
}

export async function deleteOutlet(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('outlets').delete().eq('id', id);
    if (error) throw new Error(error.message);
    revalidatePath('/dashboard/settings');
    return { success: true };
}
