
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClientLayout from "./dashboard-layout-client";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
        redirect('/login');
    }

    return (
        <DashboardClientLayout user={user}>
            {children}
        </DashboardClientLayout>
    );
}
