import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Phone, Mail, MapPin, History, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Helper for formatting currency
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};

export default async function CustomerDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Unauthorized</div>;

    // Fetch Customer Details
    const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();

    if (!customer) return notFound();

    // Fetch Transaction History (Orders)
    const { data: orders } = await supabase
        .from('orders')
        .select(`
            *,
            outlets ( name )
        `)
        .eq('customer_id', id)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard/customers">
                        <ArrowLeft size={18} />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900">{customer.name}</h2>
                    <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <span>Customer Profile</span>
                        <span>•</span>
                        <span>Joined {new Date(customer.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="ml-auto">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-base px-4 py-1">
                        Total Spent: {formatCurrency(customer.total_spent || 0)}
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="history" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="history" className="gap-2"><History size={16} /> Transaction History</TabsTrigger>
                    <TabsTrigger value="profile" className="gap-2"><User size={16} /> Profile Details</TabsTrigger>
                </TabsList>

                {/* --- History Tab --- */}
                <TabsContent value="history">
                    <Card className="border-slate-200 shadow-sm bg-white">
                        <CardHeader>
                            <CardTitle>Order History</CardTitle>
                            <CardDescription>
                                All transactions made by this customer.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Outlet</TableHead>
                                        <TableHead>Payment</TableHead>
                                        <TableHead className="text-right">Total Amount</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders?.map((order) => (
                                        <TableRow key={order.id} className="hover:bg-slate-50/50">
                                            <TableCell className="font-medium text-slate-900 font-mono text-xs">
                                                #{order.id.slice(0, 8)}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {new Date(order.created_at).toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-slate-600">
                                                {order.outlets?.name || 'Unknown'}
                                            </TableCell>
                                            <TableCell className="capitalize text-slate-700">
                                                {order.payment_method?.replace('_', ' ') || '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-900">
                                                {formatCurrency(order.total_amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 capitalize">
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {(!orders || orders.length === 0) && (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <ShoppingBag className="h-8 w-8 text-slate-300" />
                                                    <p>No transactions found for this customer yet.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Profile Tab --- */}
                <TabsContent value="profile">
                    <Card className="border-slate-200 shadow-sm bg-white">
                        <CardHeader>
                            <CardTitle>Contact Information</CardTitle>
                            <CardDescription>
                                Personal details and contact info.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 max-w-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <User size={14} /> Full Name
                                    </h4>
                                    <p className="text-base font-medium text-slate-900">{customer.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <Mail size={14} /> Email Address
                                    </h4>
                                    <p className="text-base text-slate-700">{customer.email || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <Phone size={14} /> Phone Number
                                    </h4>
                                    <p className="text-base text-slate-700 font-mono">{customer.phone || 'N/A'}</p>
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <MapPin size={14} /> Address
                                    </h4>
                                    <p className="text-base text-slate-700">{customer.address || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <Button variant="outline" disabled>Edit Profile (Coming Soon)</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
