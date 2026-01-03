"use client";

import { useState } from "react";
import { Search, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StockAdjustmentDialog from "./stock-adjustment-dialog";
import { useRouter } from "next/navigation";

interface ProductStockInfo {
    id: string;
    name: string;
    image_url: string | null;
    stock: number;
    category?: { name: string };
}

interface Outlet {
    id: string;
    name: string;
}

export default function StockView({
    products,
    outlets,
    currentOutletId
}: {
    products: ProductStockInfo[],
    outlets: Outlet[],
    currentOutletId: string
}) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<ProductStockInfo | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Filter
    const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const currentOutletName = outlets.find(o => o.id === currentOutletId)?.name;

    const handleOutletChange = (val: string) => {
        router.push(`?outlet_id=${val}`);
    };

    const handleOpenAdjust = (product: ProductStockInfo) => {
        setSelectedProduct(product);
        setDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Stock Management</h2>
                    <p className="text-muted-foreground">Audit and adjust inventory levels per outlet.</p>
                </div>
                <div className="w-[200px]">
                    <Select value={currentOutletId} onValueChange={handleOutletChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Outlet" />
                        </SelectTrigger>
                        <SelectContent>
                            {outlets.map(o => (
                                <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search products..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Current Stock</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <Avatar className="h-10 w-10 rounded-lg border bg-muted">
                                        <AvatarImage src={product.image_url || ""} className="object-cover" />
                                        <AvatarFallback className="rounded-lg">
                                            <Package size={18} className="text-muted-foreground opacity-50" />
                                        </AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium">
                                    {product.name}
                                    {product.stock < 5 && (
                                        <span className="ml-2 inline-flex items-center text-xs text-red-500 font-bold">
                                            <AlertTriangle size={12} className="mr-1" /> Low Stock
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{product.category?.name || '-'}</TableCell>
                                <TableCell className="text-right font-mono text-lg font-semibold">
                                    {product.stock}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="outline" size="sm" onClick={() => handleOpenAdjust(product)}>
                                        Adjust
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-48 text-muted-foreground">
                                    No products found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            <StockAdjustmentDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                product={selectedProduct}
                outletId={currentOutletId}
                currentStock={selectedProduct?.stock || 0}
                outletName={currentOutletName}
            />
        </div>
    );
}
