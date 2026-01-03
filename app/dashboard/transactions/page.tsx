import { createClient } from '@/lib/supabase/server';
import { Button } from "@/components/ui/button";
import { Download, CreditCard, TrendingUp, Activity } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { TransactionTable } from './transaction-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';

export default async function TransactionsPage() {
    const supabase = await createClient();

    // 1. Get User Profile for Context
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
    console.log(profile);
    if (!profile) return <div>Profile not found. Please contact support.</div>;

    // 2. Build Query with Strict RLS/Context Filters
    let query = supabase
        .from('orders')
        .select(`
            *,
            outlets (
                name,
                address
            ),
            tenants (
                name
            )
        `)
        .eq('tenant_id', profile.tenant_id) // Redundant via RLS but strictly safe
        .order('created_at', { ascending: false })
        .limit(100);

    // Apply Outlet Isolation if user is assigned to specific outlet
    // (Assuming 'owner' role might exist later to bypass, but strictly following prompt for now)
    if (profile.outlet_id) {
        query = query.eq('outlet_id', profile.outlet_id);
    }

    const { data: orders, error } = await query;

    // 3. Fetch Available Outlets for Filter
    // Only fetch outlets the user is allowed to see.
    let outletsQuery = supabase
        .from('outlets')
        .select('id, name')
        .eq('tenant_id', profile.tenant_id);

    if (profile.outlet_id) {
        outletsQuery = outletsQuery.eq('id', profile.outlet_id);
    }

    const { data: outlets } = await outletsQuery;

    // 4. Calculate Summary
    const totalRevenue = orders?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;
    const totalCount = orders?.length || 0;
    const avgTransaction = totalCount > 0 ? totalRevenue / totalCount : 0;

    // Determine Page Title based on scope
    const pageTitle = profile.outlet_id
        ? `Transactions - ${outlets?.find(o => o.id === profile.outlet_id)?.name || 'My Outlet'}`
        : "Transactions - All Outlets";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
                    <p className="text-muted-foreground">Manage and track your financial records.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2"><Download size={16} /> Export CSV</Button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
                        <CreditCard className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{formatRupiah(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground mt-1 flex items-center">
                            <TrendingUp className="mr-1 h-3 w-3 text-emerald-500" />
                            <span className="text-emerald-500 font-medium">+20.1%</span>
                            <span className="ml-1">from last month</span>
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Transactions</CardTitle>
                        <Activity className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{totalCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Orders processed today
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Avg. Transaction</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-foreground">{formatRupiah(avgTransaction)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Per successful order
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Client Side Table with Interactions */}
            <TransactionTable initialOrders={orders || []} availableOutlets={outlets || []} />
        </div>
    );
}
