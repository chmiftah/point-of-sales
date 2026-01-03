"use client";

import { useEffect, useState } from "react";
import { formatRupiah } from "@/lib/utils";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, Receipt, ShoppingBag, CreditCard, User } from "lucide-react";

interface OrderItem {
    id: string;
    product_name: string;
    quantity: number;
    price: number;
    subtotal: number;
}

interface TransactionSheetProps {
    orderId: string | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // We can also pass the full order object if we have it from the table
    // to show summary details immediately while fetching items
    initialData?: any;
}

export function TransactionSheet({ orderId, open, onOpenChange, initialData }: TransactionSheetProps) {
    const supabase = createClient();
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchItems() {
            if (!orderId || !open) return;

            setLoading(true);
            try {
                // Fetch order items and join with product name
                // Note: The schema might have products linked. 
                // Let's assume order_items has product_id, price, quantity. 
                // And we fetch product name from products table.
                const { data, error } = await supabase
                    .from('order_items')
                    .select(`
                        id,
                        price,
                        quantity,
                        products (
                            name
                        )
                    `)
                    .eq('order_id', orderId);

                if (error) throw error;

                const mappedItems = data.map((item: any) => ({
                    id: item.id,
                    product_name: item.products?.name || 'Unknown Product',
                    quantity: item.quantity,
                    price: item.price,
                    subtotal: item.price * item.quantity
                }));

                setItems(mappedItems);
            } catch (err) {
                console.error("Failed to fetch order items:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchItems();
    }, [orderId, open, supabase]);

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] bg-background border-l text-foreground overflow-y-auto">
                <SheetHeader className="mb-6">
                    <div className="flex flex-col items-center text-center space-y-1 pb-4 border-b">
                        <h3 className="text-2xl font-black tracking-tight text-foreground uppercase">
                            {initialData?.tenants?.name || "POS Pro"}
                        </h3>
                        <p className="text-sm font-medium text-foreground">
                            {initialData?.outlets?.name || "Main Branch"}
                        </p>
                        <p className="text-xs text-muted-foreground max-w-[200px]">
                            {initialData?.outlets?.address || "Jakarta, Indonesia"}
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-4">
                        <SheetTitle className="text-lg font-bold flex items-center gap-2">
                            <Receipt className="text-primary" size={20} />
                            Receipt #{orderId?.slice(0, 8)}
                        </SheetTitle>
                        {initialData && (
                            <Badge variant={initialData.status === 'completed' ? 'default' : 'destructive'}>
                                {initialData.status?.toUpperCase()}
                            </Badge>
                        )}
                    </div>
                </SheetHeader>

                {initialData && (
                    <div className="space-y-6">
                        {/* Customer Info */}
                        <div className="bg-muted/50 rounded-xl p-4 border">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <User size={16} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-foreground">Guest Customer</p>
                                    <p className="text-xs text-muted-foreground">Walk-in</p>
                                </div>
                            </div>
                            <div className="flex justify-between text-sm mt-3 pt-3 border-t">
                                <span className="text-muted-foreground">Date</span>
                                <span>{new Date(initialData.created_at).toLocaleString('id-ID')}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span className="text-muted-foreground">Payment</span>
                                <span className="capitalize flex items-center gap-2">
                                    <CreditCard size={14} /> {initialData.payment_method}
                                </span>
                            </div>
                        </div>

                        {/* Order Items */}
                        <div>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-foreground">
                                <ShoppingBag size={16} className="text-primary" />
                                Items Purchased
                            </h3>
                            <div className="bg-card rounded-xl border overflow-hidden">
                                {loading ? (
                                    <div className="h-32 flex items-center justify-center">
                                        <Loader2 className="animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted/50 text-muted-foreground">
                                            <tr>
                                                <th className="text-left py-2 px-4 font-medium">Item</th>
                                                <th className="text-right py-2 px-4 font-medium">Qty</th>
                                                <th className="text-right py-2 px-4 font-medium">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="py-3 px-4">
                                                        <div className="font-medium text-foreground">{item.product_name}</div>
                                                        <div className="text-xs text-muted-foreground">{formatRupiah(item.price)}</div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-foreground">{item.quantity}</td>
                                                    <td className="py-3 px-4 text-right font-medium text-foreground">
                                                        {formatRupiah(item.subtotal)}
                                                    </td>
                                                </tr>
                                            ))}
                                            {items.length === 0 && (
                                                <tr><td colSpan={3} className="py-4 text-center text-muted-foreground">No items found</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="space-y-3 pt-4 border-t">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="text-foreground">{formatRupiah(initialData.total_amount)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-destructive">
                                <span>Discount</span>
                                <span>-Rp 0</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tax</span>
                                <span className="text-foreground">Rp 0</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-lg text-foreground">Grand Total</span>
                                <span className="font-bold text-xl text-primary">{formatRupiah(initialData.total_amount)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}

