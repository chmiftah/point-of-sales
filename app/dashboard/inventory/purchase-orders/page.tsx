
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Plus, Archive, CheckCircle, Clock, MoreHorizontal, Search, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const dynamic = 'force-dynamic';

export default async function PurchaseOrdersPage() {
    const supabase = await createClient();

    // Fetch POs
    const { data: orders, error } = await supabase
        .from('purchase_orders')
        .select(`
            *,
            suppliers (name)
        `)
        .order('created_at', { ascending: false });

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <div className="max-w-7xl mx-auto p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Purchase Orders</h2>
                        <p className="text-slate-500">Track and manage inventory procurement.</p>
                    </div>
                    <Link href="/dashboard/inventory/purchase-orders/create">
                        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                            <Plus size={16} /> Create Order
                        </Button>
                    </Link>
                </div>

                <Card className="border-slate-200 bg-white shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                        <div>
                            <CardTitle className="text-lg font-bold text-slate-800">Order History</CardTitle>
                            <CardDescription className="text-slate-500">
                                Recent procurement activities.
                            </CardDescription>
                        </div>
                        <div className="flex w-[250px] items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1">
                            <Search className="h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search orders..."
                                className="h-7 border-0 bg-transparent p-0 text-slate-900 placeholder:text-slate-400 focus-visible:ring-0"
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="rounded-md border border-slate-200 overflow-hidden">
                            <Table>
                                <TableHeader className="bg-slate-50">
                                    <TableRow className="hover:bg-slate-50 border-slate-200">
                                        <TableHead className="w-[100px] text-slate-600 font-semibold">Status</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Order ID</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Supplier</TableHead>
                                        <TableHead className="text-slate-600 font-semibold">Date</TableHead>
                                        <TableHead className="text-right text-slate-600 font-semibold">Amount</TableHead>
                                        <TableHead className="text-right text-slate-600 font-semibold">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders && orders.length > 0 ? (
                                        orders.map((po: any) => (
                                            <TableRow key={po.id} className="hover:bg-slate-50 border-slate-200 text-slate-700">
                                                <TableCell>
                                                    <Badge variant="outline" className={`capitalize border-0 ${po.status === 'received' ? 'bg-emerald-100 text-emerald-700' :
                                                        po.status === 'ordered' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                                                        }`}>
                                                        {po.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-900">
                                                    PO-{po.id.slice(0, 6).toUpperCase()}
                                                </TableCell>
                                                <TableCell className="text-slate-600">
                                                    {po.suppliers?.name || <span className="text-slate-400 italic">Unknown</span>}
                                                </TableCell>
                                                <TableCell className="text-slate-500 text-sm">
                                                    {new Date(po.created_at).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right font-medium text-slate-900">
                                                    {formatRupiah(po.total_cost)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-900 hover:bg-slate-100">
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-700 shadow-md">
                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                            <DropdownMenuItem className="hover:bg-slate-50 cursor-pointer" asChild>
                                                                <Link href={`/dashboard/inventory/purchase-orders/${po.id}`} className="flex items-center w-full">
                                                                    <FileText className="mr-2 h-4 w-4" /> View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                            {po.status === 'received' ? null : (
                                                                <DropdownMenuItem className="hover:bg-slate-50 cursor-pointer">
                                                                    <CheckCircle className="mr-2 h-4 w-4" /> Mark Received
                                                                </DropdownMenuItem>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <Archive size={24} className="opacity-50" />
                                                    <p>No purchase orders found.</p>
                                                    <Link href="/dashboard/inventory/purchase-orders/create">
                                                        <Button variant="link" className="text-emerald-600 h-auto p-0">Create new order</Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
