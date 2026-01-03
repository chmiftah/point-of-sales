'use server';

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createCustomer(formData: FormData) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) return { error: "Tenant ID missing" };

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;

    if (!name) return { error: "Name is required" };

    const { error } = await supabase
        .from('customers')
        .insert({
            tenant_id: profile.tenant_id,
            name,
            phone,
            email,
            address,
            total_spent: 0
        });

    if (error) return { error: error.message };

    revalidatePath('/dashboard/customers');
    return { success: true };
}

export async function updateCustomer(customerId: string, formData: FormData) {
    const supabase = await createClient();

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const address = formData.get("address") as string;

    const { error } = await supabase
        .from('customers')
        .update({ name, phone, email, address })
        .eq('id', customerId);

    if (error) return { error: error.message };

    revalidatePath(`/dashboard/customers/${customerId}`);
    revalidatePath('/dashboard/customers');
    return { success: true };
}

export async function deleteCustomer(customerId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

    if (error) return { error: error.message };

    revalidatePath('/dashboard/customers');
    return { success: true };
}
