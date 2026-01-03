
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Building, FileText, MapPin, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ReceivePODialog } from "@/components/inventory/receive-po-dialog";

export const dynamic = 'force-dynamic';

export default async function PODetailPage({ params }: { params: Promise<{ id: string }> }) {
    const id = (await params).id
    const supabase = await createClient();

    // Fetch PO
    const { data: po, error } = await supabase
        .from('purchase_orders')
        .select(`
            *,
            suppliers (name, address, phone, email)
        `)
        .eq('id', id)
        .single();

    if (!po) return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-500">
            Order not found
        </div>
    );

    // Fetch Items
    // Fetch Items (No Join)
    const { data: itemsRaw, error: itemsError } = await supabase
        .from('purchase_order_items')
        .select('*')
        .eq('po_id', id);

    if (itemsError) console.error("Error fetching items:", itemsError);

    // Fetch Products manually to workaround missing FK
    const productIds = itemsRaw?.map(i => i.product_id) || [];
    let productsMap: Record<string, any> = {};

    if (productIds.length > 0) {
        const { data: products } = await supabase
            .from('products')
            .select('id, name')
            .in('id', productIds);

        products?.forEach(p => {
            productsMap[p.id] = p;
        });
    }

    // Merge
    const items = itemsRaw?.map(item => ({
        ...item,
        products: productsMap[item.product_id] || { name: 'Unknown Product' }
    }));

    // Fetch User Tenant ID
    const { data: { user } } = await supabase.auth.getUser();
    let tenantId = null;
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
        tenantId = profile?.tenant_id;
    }

    // Fetch Outlets for Receive Dialog
    let outletsQuery = supabase.from('outlets').select('id, name').order('name');
    if (tenantId) {
        outletsQuery = outletsQuery.eq('tenant_id', tenantId);
    }
    const { data: outlets } = await outletsQuery;

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <div className="max-w-7xl mx-auto p-6 space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/inventory/purchase-orders">
                            <Button variant="outline" size="icon" className="h-10 w-10 border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                                <ArrowLeft size={18} />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                    PO #{po.id.slice(0, 8).toUpperCase()}
                                </h1>
                                <Badge variant="outline" className={`capitalize border-0 px-2.5 py-0.5 text-sm font-medium ${po.status === 'received' ? 'bg-emerald-100 text-emerald-700' :
                                    po.status === 'ordered' ? 'bg-blue-100 text-blue-700' :
                                        'bg-slate-100 text-slate-600'
                                    }`}>
                                    {po.status}
                                </Badge>
                            </div>
                            <p className="text-slate-500 text-sm mt-1">
                                Created on {new Date(po.created_at).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2 bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
                            <Printer size={16} /> Print Order
                        </Button>
                        {po.status === 'ordered' && (
                            <ReceivePODialog poId={po.id} outlets={outlets || []} />
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left: Order Items */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                                <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <FileText className="h-5 w-5 text-slate-500" />
                                    Ordered Items
                                </CardTitle>
                            </CardHeader>
                            <div className="p-0">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow className="hover:bg-slate-50 border-slate-200">
                                            <TableHead className="text-slate-600 font-semibold pl-6">Product</TableHead>
                                            <TableHead className="text-right text-slate-600 font-semibold">Qty</TableHead>
                                            <TableHead className="text-right text-slate-600 font-semibold">Unit Cost</TableHead>
                                            <TableHead className="text-right text-slate-600 font-semibold pr-6">Total</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items?.map((item) => (
                                            <TableRow key={item.id} className="hover:bg-slate-50 border-slate-100 text-slate-700">
                                                <TableCell className="font-medium text-slate-900 pl-6">{item.products?.name}</TableCell>
                                                <TableCell className="text-right">{item.quantity}</TableCell>
                                                <TableCell className="text-right text-slate-600">{formatRupiah(item.unit_cost)}</TableCell>
                                                <TableCell className="text-right font-medium text-slate-900 pr-6">{formatRupiah(item.quantity * item.unit_cost)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="bg-slate-50 p-6 border-t border-slate-200">
                                <div className="flex justify-end items-center gap-6">
                                    <span className="text-slate-500 font-medium">Total Amount</span>
                                    <span className="text-3xl font-bold text-slate-900 tracking-tight">{formatRupiah(po.total_cost)}</span>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right: Supplier & Meta */}
                    <div className="space-y-6">
                        <Card className="border-slate-200 bg-white shadow-sm">
                            <CardHeader className="border-b border-slate-100 pb-4">
                                <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <Building className="h-4 w-4 text-slate-500" />
                                    Supplier Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-slate-900 text-lg">{po.suppliers?.name}</p>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-slate-600">
                                    <Mail className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                    <span>{po.suppliers?.email || 'No email provided'}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-slate-600">
                                    <Phone className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                    <span>{po.suppliers?.phone || 'No phone provided'}</span>
                                </div>
                                <div className="flex items-start gap-3 text-sm text-slate-600">
                                    <MapPin className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
                                    <span className="leading-relaxed">{po.suppliers?.address || 'No address provided'}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {po.notes && (
                            <Card className="border-slate-200 bg-amber-50/50 shadow-sm border-amber-100">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-bold text-amber-900">Notes</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-amber-800 italic">"{po.notes}"</p>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
