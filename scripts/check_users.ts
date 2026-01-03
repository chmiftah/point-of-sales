import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function check() {
    console.log("--- USERS (Auth) ---");
    const { data: { users } } = await supabase.auth.admin.listUsers();
    users.forEach(u => console.log(`User: ${u.email} ID: ${u.id}`));

    console.log("\n--- PROFILES (Public) ---");
    const { data: profiles } = await supabase.from('profiles').select('*');
    profiles?.forEach(p => console.log(`Profile: ${p.full_name} ID: ${p.id} Tenant: ${p.tenant_id}`));

    if (profiles?.length === 0) console.log("NO PROFILES FOUND!");
}

check();
