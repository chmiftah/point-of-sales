import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SuppliersClient from "./client";

export default async function SuppliersPage() {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/login");

    // 2. Resolve Tenant
    const { data: profile } = await supabase
        .from('profiles')
        .select('tenant_id')
        .eq('id', user.id)
        .single();

    if (!profile?.tenant_id) {
        return <div>Configuration Error: No Tenant ID found.</div>;
    }

    // 3. Fetch Suppliers
    const { data: suppliers, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Failed to fetch suppliers:", error);
        return <div>Failed to load suppliers data.</div>;
    }

    // 4. Render Client Component
    return (
        <SuppliersClient initialSuppliers={suppliers || []} />
    );
}
