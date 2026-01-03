"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { ChevronsUpDown, Check, Plus, Trash2, Save, ShoppingCart, Loader2 } from "lucide-react";
import { cn, formatRupiah } from "@/lib/utils";
import { createPurchaseOrder } from "@/actions/procurement";
import { Separator } from "@/components/ui/separator";

// Types
interface Supplier { id: string; name: string; }
interface Product { id: string; name: string; cost_price?: number; stock?: number; }
interface CartItem {
    productId: string;
    name: string;
    quantity: number;
    unitCost: number;
}

export default function CreatePOPage({ suppliers, products }: { suppliers: Supplier[], products: Product[] }) {
    const router = useRouter();
    const [supplierId, setSupplierId] = useState("");
    const [openSupplier, setOpenSupplier] = useState(false);

    // Product Selection State
    const [openProduct, setOpenProduct] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState("");

    // Cart State
    const [items, setItems] = useState<CartItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddProduct = () => {
        if (!selectedProductId) return;
        const product = products.find(p => p.id === selectedProductId);
        if (!product) return;

        if (items.some(i => i.productId === selectedProductId)) {
            alert("Product already in list. Update quantity instead.");
            return;
        }

        setItems([...items, {
            productId: product.id,
            name: product.name,
            quantity: 1,
            unitCost: product.cost_price || 0
        }]);
        setSelectedProductId("");
        setOpenProduct(false);
    };

    const updateItem = (index: number, field: 'quantity' | 'unitCost', value: number) => {
        const newItems = [...items];
        newItems[index][field] = value;
        setItems(newItems);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const calculateTotal = () => items.reduce((acc, item) => acc + (item.quantity * item.unitCost), 0);

    const handleSave = async (status: 'draft' | 'ordered') => {
        if (!supplierId) return alert("Please select a supplier");
        if (items.length === 0) return alert("Please add at least one item");

        setIsSubmitting(true);
        try {
            await createPurchaseOrder({
                supplierId,
                items,
                status,
                notes: "Created via Web POS"
            });
            router.push("/dashboard/inventory/purchase-orders");
        } catch (error) {
            console.error(error);
            alert("Failed to create PO");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    {/* Header handled by wrapper, this is inside the Card now. Maybe just content here? */}
                    {/* Actually let's keep it clean, maybe just a section header or nothing. Wrapper has title. */}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => handleSave('draft')} disabled={isSubmitting} className="bg-white border-slate-200 text-slate-700 hover:bg-slate-50">
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Draft
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleSave('ordered')} disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                        Place Order
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* LEFT: SUPPLIER & PRODUCT SELECTION */}
                <div className="space-y-8 lg:col-span-1 border-r border-slate-100 pr-0 lg:pr-8">
                    {/* Setup Supplier */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">Supplier Details</h3>
                        <div className="grid gap-2">
                            <Label className="text-slate-700">Select Vendor</Label>
                            <Popover open={openSupplier} onOpenChange={setOpenSupplier}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openSupplier}
                                        className="w-full justify-between bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                                    >
                                        {supplierId
                                            ? suppliers.find((s) => s.id === supplierId)?.name
                                            : "Select supplier..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 bg-white border-slate-200 text-slate-900 shadow-md">
                                    <Command>
                                        <CommandInput placeholder="Search supplier..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No supplier found.</CommandEmpty>
                                            <CommandGroup>
                                                {suppliers.map((supplier) => (
                                                    <CommandItem
                                                        key={supplier.id}
                                                        value={supplier.name}
                                                        onSelect={() => {
                                                            setSupplierId(supplier.id === supplierId ? "" : supplier.id);
                                                            setOpenSupplier(false);
                                                        }}
                                                        className="text-slate-900 aria-selected:bg-slate-100"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                supplierId === supplier.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {supplier.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <Separator className="bg-slate-100 my-6" />

                    {/* Add Products Form */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">Add Items</h3>
                        <div className="grid gap-2">
                            <Label className="text-slate-700">Product Search</Label>
                            <Popover open={openProduct} onOpenChange={setOpenProduct}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openProduct}
                                        className="w-full justify-between bg-white border-slate-200 text-slate-900 hover:bg-slate-50"
                                    >
                                        {selectedProductId
                                            ? products.find((p) => p.id === selectedProductId)?.name
                                            : "Search product..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[300px] p-0 bg-white border-slate-200 text-slate-900 shadow-md">
                                    <Command>
                                        <CommandInput placeholder="Search product..." className="h-9" />
                                        <CommandList>
                                            <CommandEmpty>No product found.</CommandEmpty>
                                            <CommandGroup>
                                                {products.map((product) => (
                                                    <CommandItem
                                                        key={product.id}
                                                        value={product.name}
                                                        onSelect={() => {
                                                            setSelectedProductId(product.id === selectedProductId ? "" : product.id);
                                                            setOpenProduct(false);
                                                        }}
                                                        className="text-slate-900 aria-selected:bg-slate-100"
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedProductId === product.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {product.name}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <Button
                                onClick={handleAddProduct}
                                disabled={!selectedProductId}
                                className="w-full bg-slate-900 hover:bg-slate-800 text-white mt-2"
                            >
                                <Plus size={16} className="mr-2" /> Add to Order
                            </Button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: ORDER SUMMARY TABLE */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-100 pb-2">Order Items</h3>

                    <div className="rounded-md border border-slate-200 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow className="hover:bg-slate-50 border-slate-200">
                                    <TableHead className="w-[40%] text-slate-700 font-semibold">Product</TableHead>
                                    <TableHead className="text-slate-700 font-semibold">Qty</TableHead>
                                    <TableHead className="text-slate-700 font-semibold">Unit Cost</TableHead>
                                    <TableHead className="text-right text-slate-700 font-semibold">Total</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center text-slate-500">
                                            No items added yet. Select products on the left.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    items.map((item, index) => (
                                        <TableRow key={index} className="hover:bg-slate-50 border-slate-100 text-slate-700">
                                            <TableCell className="font-medium text-slate-900">{item.name}</TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    value={item.quantity}
                                                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                                    className="w-20 h-8 bg-white border-slate-200 focus-visible:ring-emerald-500"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    value={item.unitCost}
                                                    onChange={(e) => updateItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                                                    className="w-28 h-8 bg-white border-slate-200 focus-visible:ring-emerald-500"
                                                />
                                            </TableCell>
                                            <TableCell className="text-right font-medium text-slate-900">
                                                {formatRupiah(item.quantity * item.unitCost)}
                                            </TableCell>
                                            <TableCell>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => removeItem(index)}>
                                                    <Trash2 size={16} />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Footer Summary */}
                    <div className="flex justify-end mt-6">
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-100 w-full max-w-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm text-slate-500">Subtotal</span>
                                <span className="font-medium text-slate-900">{formatRupiah(calculateTotal())}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm text-slate-500">Tax</span>
                                <span className="font-medium text-slate-900">-</span>
                            </div>
                            <Separator className="bg-slate-200 my-3" />
                            <div className="flex justify-between items-center">
                                <span className="text-base font-bold text-slate-700">Total Amount</span>
                                <span className="text-2xl font-bold text-slate-900 tracking-tight">{formatRupiah(calculateTotal())}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
