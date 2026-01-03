'use server';

import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/', 'layout');
    return redirect('/pos');
}

export async function signup(prevState: any, formData: FormData) {
    const fullName = formData.get('fullName') as string;
    const businessName = formData.get('businessName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const supabase = await createClient();

    // 1. Create Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            }
        }
    });

    if (authError || !authData.user) {
        return { error: authError?.message || 'Failed to create user' };
    }

    const userId = authData.user.id;

    try {
        // 2. Create Tenant (Using Admin to bypass RLS)
        // Slug generation: simple lowercase + random string for uniqueness
        const slug = `${businessName.toLowerCase().replace(/\s+/g, '-')}-${Math.floor(Math.random() * 10000)}`;

        const { data: tenant, error: tenantError } = await supabaseAdmin
            .from('tenants')
            .insert({
                name: businessName,
                // plan_type: 'free' // specific column if exists, currently schema only has name
            })
            .select()
            .single();

        if (tenantError || !tenant) {
            throw new Error(`Tenant creation failed: ${tenantError?.message}`);
        }

        // 3. Create Outlet
        const { data: outlet, error: outletError } = await supabaseAdmin
            .from('outlets')
            .insert({
                tenant_id: tenant.id,
                name: 'Main Branch',
                // is_active: true // if column exists
            })
            .select()
            .single();

        if (outletError || !outlet) {
            throw new Error(`Outlet creation failed: ${outletError?.message}`);
        }

        // 4. Create Profile (Link User -> Tenant -> Outlet)
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
                id: userId,
                tenant_id: tenant.id,
                outlet_id: outlet.id,
                role: 'owner',
                full_name: fullName
            });

        if (profileError) {
            throw new Error(`Profile creation failed: ${profileError.message}`);
        }

    } catch (err: any) {
        console.error("❌ Registration Rollback:", err.message);

        // ROLLBACK: Delete the Auth User so they can try again
        await supabaseAdmin.auth.admin.deleteUser(userId);

        return { error: err.message };
    }

    // Success
    revalidatePath('/', 'layout');
    return redirect('/pos');
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    return redirect('/login');
}
