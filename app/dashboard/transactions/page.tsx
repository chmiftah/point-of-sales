
import { createClient } from '@/lib/supabase/server';
import { Button } from "@/components/ui/button";
import { Download, CreditCard, TrendingUp, Activity } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import { TransactionTable } from './transaction-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { redirect } from 'next/navigation';
import { DashboardOutletFilter } from "@/components/dashboard/dashboard-outlet-filter";

interface TransactionsPageProps {
    searchParams: Promise<{ outletId?: string }>;
}

export default async function TransactionsPage(props: TransactionsPageProps) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();

    // 1. Authenticate
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

    if (!profile) return <div>Profile not found. Please contact support.</div>;

    // 2. Determine Filter Scope (Dynamic Logic)
    const isOwner = profile.role === 'owner';
    const paramsOutletId = searchParams.outletId;

    let targetOutletId: string | null = null;
    let availableOutlets: { id: string, name: string }[] = [];

    if (isOwner) {
        // Owner Logic: Use URL param, 'all' means null. Fetch available.
        targetOutletId = (paramsOutletId === 'all' || !paramsOutletId) ? null : paramsOutletId;
        const { data: outlets } = await supabase
            .from('outlets')
            .select('id, name')
            .eq('tenant_id', profile.tenant_id)
            .order('name');
        availableOutlets = outlets || [];
    } else {
        // Staff Logic: Locked to profile
        targetOutletId = profile.outlet_id;
    }

    // 3. Build Query with Strict RLS/Context Filters
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

    // Apply Dynamic Filter
    if (targetOutletId) {
        query = query.eq('outlet_id', targetOutletId);
    }

    const { data: orders, error } = await query;

    // 4. Calculate Summary
    const totalRevenue = orders?.reduce((acc, curr) => acc + (curr.total_amount || 0), 0) || 0;
    const totalCount = orders?.length || 0;
    const avgTransaction = totalCount > 0 ? totalRevenue / totalCount : 0;

    // Determine Page Title
    const currentOutletName = isOwner
        ? (targetOutletId ? availableOutlets.find(o => o.id === targetOutletId)?.name : "All Outlets")
        : (profile.outlet_id ? "My Outlet" : "All Outlets");

    const pageTitle = `Transactions - ${currentOutletName}`;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{pageTitle}</h2>
                    <p className="text-muted-foreground">Manage and track your financial records.</p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Filter Integration */}
                    {isOwner && (
                        <DashboardOutletFilter
                            outlets={availableOutlets}
                            userRole="owner"
                            currentOutletId={targetOutletId}
                        />
                    )}
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
            <TransactionTable initialOrders={orders || []} availableOutlets={availableOutlets} />
        </div>
    );
}
