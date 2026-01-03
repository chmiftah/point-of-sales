import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function fix() {
    console.log("🔧 Fixing Missing Profiles...");

    // 1. Get Default Tenant
    const { data: tenant } = await supabase.from('tenants').select('id').limit(1).single();
    if (!tenant) throw new Error("No tenants found! Run seed first.");
    console.log(`Using Tenant: ${tenant.id}`);

    // 2. Get Default Outlet
    const { data: outlet } = await supabase.from('outlets').select('id').eq('tenant_id', tenant.id).limit(1).single();

    // 3. Get All Users
    const { data: { users } } = await supabase.auth.admin.listUsers();

    for (const user of users) {
        // Check profile
        const { data: profile } = await supabase.from('profiles').select('id').eq('id', user.id).single();

        if (!profile) {
            console.log(`⚠️ User ${user.email} (${user.id}) has NO profile. Creating...`);
            const { error } = await supabase.from('profiles').insert({
                id: user.id,
                tenant_id: tenant.id,
                outlet_id: outlet?.id, // Optional
                full_name: 'Admin User',
                role: 'owner'
            });
            if (error) console.error(`Failed to create profile: ${error.message}`);
            else console.log(`✅ Profile created for ${user.email}`);
        } else {
            console.log(`✅ User ${user.email} OK.`);
        }
    }
}

fix();
