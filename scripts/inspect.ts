
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function inspect() {
    console.log('Inspecting Schema...');

    // List all tables
    const { data: tables, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

    if (tableError) {
        // Try RPC or raw query if possible, but JS client is limited to REST.
        // Trying to just insert dummy data to 'tenants' to see error?
        // Or reading columns from information_schema
    }

    // Attempt to read columns from 'tenants'
    // Note: information_schema access might be restricted depending on RLS/Permissions, 
    // but Service Role should have access.

    // NOTE: supabase-js 'from' usually targets public tables. accessing information_schema might be tricky directly if not exposed.
    // Instead, let's try to just select one row from 'tenants' and see the keys, or rely on the error.

    // Safer approach: Query columns
    // This query might fail if the API isn't exposed for information_schema
    const { data: columns, error: colError } = await supabase
        .from('information_schema.columns')
        .select('table_name, column_name, data_type')
        .eq('table_schema', 'public')
        .order('table_name');

    if (colError) {
        console.log('Error reading information_schema:', colError.message);
        // Fallback: Try to just read from 'tenants'
        const { data: tenantData, error: tenantErr } = await supabase.from('tenants').select('*').limit(1);
        if (tenantErr) console.log('Tenant Read Error:', tenantErr.message);
        else console.log('Tenants keys:', Object.keys(tenantData?.[0] || {}));

        return;
    }

    // Group by table
    const schema: Record<string, string[]> = {};
    columns?.forEach((col: any) => {
        if (!schema[col.table_name]) schema[col.table_name] = [];
        schema[col.table_name].push(`${col.column_name} (${col.data_type})`);
    });

    console.log(JSON.stringify(schema, null, 2));
}

inspect();
