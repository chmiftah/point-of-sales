
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
import { DashboardTopProducts } from '@/components/dashboard/dashboard-top-products';

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



    // ... (imports)

    // ... (inside DashboardPage)

    // 4. Fetch Contextual Metrics & Top Products Data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

    // --- QUERY 1: Orders (For KPI & Charts) ---
    // reused existing query logic
    let ordersQuery = supabase
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
        .gte('created_at', startOfMonth)
        .order('created_at', { ascending: false });

    if (targetOutletId) {
        ordersQuery = ordersQuery.eq('outlet_id', targetOutletId);
    }

    const { data: orders, error: ordersError } = await ordersQuery;
    if (ordersError) console.error("Orders Error:", ordersError);


    // --- QUERY 2: Top Products (Aggregation) ---
    // Fetch raw items to aggregate in JS (Supabase has no easy 'group by' for relations yet)
    let itemsQuery = supabase
        .from('order_items')
        .select(`
            quantity,
            price, 
            product_id,
            products (name, image_url, categories(name)),
            orders!inner (status, created_at, outlet_id)
        `)
        .eq('tenant_id', profile.tenant_id)
        .eq('orders.status', 'completed')
        .gte('orders.created_at', startOfMonth)
        .lte('orders.created_at', endOfMonth);

    if (targetOutletId) {
        itemsQuery = itemsQuery.eq('orders.outlet_id', targetOutletId);
    }

    const { data: orderItems, error: itemsError } = await itemsQuery;
    if (itemsError) console.error("Top Products Error:", itemsError);

    // --- AGGREGATION LOGIC ---
    const productStats = new Map<string, {
        id: string;
        name: string;
        image_url: string | null;
        category: string;
        totalSold: number;
        totalRevenue: number;
    }>();

    if (orderItems) {
        orderItems.forEach((item: any) => {
            const pid = item.product_id;
            const current = productStats.get(pid) || {
                id: pid,
                name: item.products?.name || 'Unknown',
                image_url: item.products?.image_url || null,
                category: item.products?.categories?.name || 'Uncategorized',
                totalSold: 0,
                totalRevenue: 0
            };

            current.totalSold += item.quantity;
            current.totalRevenue += (item.quantity * item.price); // aggregated revenue for this item
            productStats.set(pid, current);
        });
    }

    const topProducts = Array.from(productStats.values())
        .sort((a, b) => b.totalSold - a.totalSold) // Sort by Qty Descending
        .slice(0, 5);


    // ... (KPI Calculations reused from orders data) ...
    const validOrders = orders || [];
    const totalRevenue = validOrders.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
    const totalTransactions = validOrders.length;
    const avgOrderValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const totalItemsSold = validOrders.reduce((acc, order) => {
        return acc + (order.order_items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0);
    }, 0);

    // Chart Data Prep
    const revenueByDate = new Map<string, number>();
    validOrders.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        const current = revenueByDate.get(date) || 0;
        revenueByDate.set(date, current + (order.total_amount || 0));
    });

    const chartData = Array.from(revenueByDate.entries())
        .map(([name, total]) => ({ name, total }))
        .reverse();

    const recentActivity = validOrders.slice(0, 5);
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

            {/* Charts & Top Products Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <DashboardCharts revenueData={chartData} topProducts={[]} />
                </div>
                <div className="col-span-3">
                    <DashboardTopProducts products={topProducts} />
                </div>
            </div>

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
