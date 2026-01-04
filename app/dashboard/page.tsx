
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatRupiah } from "@/lib/utils";
import { ShoppingCart, Activity, TrendingUp, DollarSign, Store, ArrowRight, Clock } from 'lucide-react';
import { DashboardCharts } from './dashboard-charts';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardOutletFilter } from "@/components/dashboard/dashboard-outlet-filter";

interface DashboardPageProps {
    searchParams: Promise<{ outletId?: string }>;
}

export default async function DashboardPage(props: DashboardPageProps) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();

    // 1. Authenticate & Identify
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
        .from('profiles')
        .select('*, outlets(name)')
        .eq('id', user.id)
        .single();

    if (!profile) return <div className="p-8">Error: Profile not found. Contact support.</div>;

    // 2. Determine Filter Scope
    const isOwner = profile.role === 'owner';
    const paramsOutletId = searchParams.outletId;

    let targetOutletId: string | null = null;

    if (isOwner) {
        // Owner Logic: Use URL param, 'all' means null
        targetOutletId = (paramsOutletId === 'all' || !paramsOutletId) ? null : paramsOutletId;
    } else {
        // Staff Logic: Locked to profile
        targetOutletId = profile.outlet_id;
    }

    // 3. Fetch Outlets (Owner Only - for Switcher)
    let availableOutlets: { id: string, name: string }[] = [];
    if (isOwner) {
        const { data: outlets } = await supabase
            .from('outlets')
            .select('id, name')
            .eq('tenant_id', profile.tenant_id)
            .order('name');
        availableOutlets = outlets || [];
    }

    // 4. Fetch Contextual Metrics
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    let query = supabase
        .from('orders')
        .select(`
            id, 
            total_amount, 
            created_at, 
            status,
            order_items (
                quantity,
                price
            )
        `)
        .eq('tenant_id', profile.tenant_id)
        .gte('created_at', firstDayOfMonth)
        .order('created_at', { ascending: false });

    // Apply Dynamic Filter
    if (targetOutletId) {
        query = query.eq('outlet_id', targetOutletId);
    }

    const { data: orders, error } = await query;
    if (error) console.error("Dashboard Error:", error);

    // 5. Calculate KPIs
    const validOrders = orders || [];
    const totalRevenue = validOrders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
    const totalTransactions = validOrders.length;
    const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    const totalItemsSold = validOrders.reduce((acc, order) => {
        return acc + (order.order_items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0);
    }, 0);

    // 6. Chart Data Prep
    const revenueByDate = new Map<string, number>();
    validOrders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        const current = revenueByDate.get(date) || 0;
        revenueByDate.set(date, current + (order.total_amount || 0));
    });

    const chartData = Array.from(revenueByDate.entries())
        .map(([name, total]) => ({ name, total }))
        .reverse();

    const topProductsMock = [
        { name: "Demo Product A", sales: 120, revenue: 5000000 },
        { name: "Demo Product B", sales: 90, revenue: 3500000 },
    ];

    const recentActivity = validOrders.slice(0, 5);

    // Greeting Time
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {greeting}, {profile.full_name?.split(' ')[0] || 'User'} 👋
                    </h2>
                    <p className="text-muted-foreground">
                        Here's what's happening at {targetOutletId ? 'this outlet' : 'all outlets'} today.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* Render Filter for Owner, Badge for Staff */}
                    {isOwner ? (
                        <DashboardOutletFilter
                            outlets={availableOutlets}
                            userRole="owner"
                            currentOutletId={targetOutletId}
                        />
                    ) : (
                        <Badge variant="outline" className="h-9 px-4 text-sm gap-2 border-primary/20 bg-primary/5">
                            <Store size={14} className="text-primary" />
                            {profile.outlets?.name || 'My Outlet'}
                        </Badge>
                    )}

                    <Button asChild>
                        <Link href="/pos">Open POS</Link>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="glass border-white/10 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-emerald-500/10 to-transparent" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-500">{formatRupiah(totalRevenue)}</div>
                        <p className="text-xs text-muted-foreground">This month</p>
                    </CardContent>
                </Card>

                <Card className="glass border-white/10 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-blue-500/10 to-transparent" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                        <ShoppingCart className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-500">{totalTransactions}</div>
                        <p className="text-xs text-muted-foreground">Orders processed</p>
                    </CardContent>
                </Card>

                <Card className="glass border-white/10 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-purple-500/10 to-transparent" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Items Sold</CardTitle>
                        <Activity className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-500">{totalItemsSold}</div>
                        <p className="text-xs text-muted-foreground">Products moved</p>
                    </CardContent>
                </Card>

                <Card className="glass border-white/10 relative overflow-hidden">
                    <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-orange-500/10 to-transparent" />
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
                        <TrendingUp className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-500">{formatRupiah(avgOrderValue)}</div>
                        <p className="text-xs text-muted-foreground">Per transaction</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <DashboardCharts revenueData={chartData} topProducts={topProductsMock} />

            {/* Recent Activity */}
            <Card className="glass border-white/10">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Recent Transactions</CardTitle>
                        <p className="text-sm text-muted-foreground">Latest financial activity from this outlet.</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="gap-1">
                        <Link href="/dashboard/transactions">
                            View All <ArrowRight size={14} />
                        </Link>
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivity.length > 0 ? recentActivity.map((order: any) => (
                            <div key={order.id} className="flex items-center justify-between border-b border-border/50 last:border-0 pb-4 last:pb-0">
                                <div className="flex items-center gap-4">
                                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Clock size={16} className="text-primary" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="capitalize shadow-none">
                                        {order.status}
                                    </Badge>
                                    <div className="font-mono font-bold text-sm">
                                        {formatRupiah(order.total_amount)}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No recent transactions needed.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
