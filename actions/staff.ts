'use server';

import { createClient as createServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function createStaffUser(formData: FormData) {
    const supabase = await createServerClient();

    // 1. Auth Check (Current User must be Owner)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Unauthorized" };

    const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'owner') {
        return { error: "Permission denied. Only owners can add staff." };
    }

    const tenantId = profile.tenant_id;
    if (!tenantId) return { error: "Tenant ID missing." };

    // 2. Extract Form Data
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const fullName = formData.get("fullName") as string;
    const outletId = formData.get("outletId") as string;

    if (!email || !password || !fullName || !outletId) {
        return { error: "All fields are required." };
    }

    // 3. Create User via Admin API
    // We use the Service Role key to create a user without signing out the current user.
    // const supabaseAdmin = createAdminClient(); // FIXED: Imported directly

    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
            full_name: fullName,
            role: 'cashier' // We could store role in metadata too, but profiles is source of truth
        }
    });

    if (createError) {
        return { error: createError.message };
    }

    if (!newUser.user) {
        return { error: "Failed to create user object." };
    }

    // 4. Create Profile Entry Linked to Tenant
    // This is the CRITICAL security step. We force tenant_id and outlet_id.
    const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
            id: newUser.user.id,

            full_name: fullName,
            role: 'cashier',
            tenant_id: tenantId,
            outlet_id: outletId,
            created_at: new Date().toISOString(),

        });

    if (profileError) {
        // Rollback? Deleting the user if profile creation fails would be ideal but tricky.
        // For now, let's just return error.
        console.error("Profile Link Error:", profileError);
        return { error: `Profile Link Failed: ${profileError.message} (${profileError.details || ''})` };
    }

    revalidatePath('/dashboard/settings');
    return { success: true };
}
