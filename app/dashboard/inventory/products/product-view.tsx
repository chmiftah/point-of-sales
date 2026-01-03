"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Search, Package, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetFooter
} from "@/components/ui/sheet";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRupiah } from "@/lib/utils";
import { createProduct, updateProduct, deleteProduct } from "../actions";

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    category_id: string;
    categories?: { name: string };
    stock?: number;
}

export default function ProductView({
    initialProducts,
    initialCategories,
    pagination
}: {
    initialProducts: Product[],
    initialCategories: Category[],
    pagination: {
        currentPage: number;
        totalPages: number;
        totalItems: number;
    }
}) {
    const [products, setProducts] = useState(initialProducts);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const filtered = products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const handleOpenCreate = () => {
        setEditingProduct(null);
        setIsSheetOpen(true);
    };

    const handleOpenEdit = (product: Product) => {
        setEditingProduct(product);
        setIsSheetOpen(true);
    };

    async function handleSubmit(formData: FormData) {
        if (editingProduct) {
            formData.append("id", editingProduct.id);
            const res = await updateProduct(formData);
            if (res?.error) alert(res.error);
            else window.location.reload();
        } else {
            const res = await createProduct(formData);
            if (res?.error) alert(res.error);
            else window.location.reload();
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Delete this product?")) return;
        const res = await deleteProduct(id);
        if (res?.error) alert(res.error);
        else window.location.reload();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Products</h2>
                    <p className="text-slate-500">Manage your inventory items.</p>
                </div>
                <Button onClick={handleOpenCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm">
                    <Plus size={16} /> Add Product
                </Button>
            </div>

            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                        placeholder="Search current page..."
                        className="pl-10 bg-white border-slate-200 text-slate-900 focus-visible:ring-emerald-500"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow className="hover:bg-slate-50 border-slate-200">
                            <TableHead className="w-[80px] text-slate-600 font-semibold">Image</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Name</TableHead>
                            <TableHead className="text-slate-600 font-semibold">Category</TableHead>
                            <TableHead className="text-right text-slate-600 font-semibold">Price</TableHead>
                            <TableHead className="text-center text-slate-600 font-semibold">Stock</TableHead>
                            <TableHead className="text-right text-slate-600 font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filtered.map((product) => (
                            <TableRow key={product.id} className="hover:bg-slate-50 border-slate-100 text-slate-700">
                                <TableCell>
                                    <Avatar className="h-10 w-10 rounded-lg border border-slate-200 bg-slate-100">
                                        <AvatarImage src={product.image_url || ""} className="object-cover" />
                                        <AvatarFallback className="rounded-lg bg-slate-100">
                                            <Package size={18} className="text-slate-400" />
                                        </AvatarFallback>
                                    </Avatar>
                                </TableCell>
                                <TableCell className="font-medium text-slate-900">{product.name}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-700">
                                        {product.categories?.name || 'Uncategorized'}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right font-mono text-sm text-slate-600">
                                    {formatRupiah(product.price)}
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${(product.stock || 0) > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                        {product.stock || 0}
                                    </div>
                                </TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(product)} className="text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                        <Pencil size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)} className="text-slate-400 hover:text-red-600 hover:bg-red-50">
                                        <Trash2 size={16} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filtered.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-48 text-slate-500">
                                    No products found on this page.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {/* PAGINATION CONTROLS */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500">
                    Page {pagination.currentPage} of {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage <= 1}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50"
                        asChild={pagination.currentPage > 1}
                    >
                        {pagination.currentPage > 1 ? (
                            <Link href={`?page=${pagination.currentPage - 1}`}>
                                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                            </Link>
                        ) : (
                            <span className="flex items-center"><ChevronLeft className="h-4 w-4 mr-1" /> Previous</span>
                        )}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={pagination.currentPage >= pagination.totalPages}
                        className="border-slate-200 text-slate-700 hover:bg-slate-50"
                        asChild={pagination.currentPage < pagination.totalPages}
                    >
                        {pagination.currentPage < pagination.totalPages ? (
                            <Link href={`?page=${pagination.currentPage + 1}`}>
                                Next <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        ) : (
                            <span className="flex items-center">Next <ChevronRight className="h-4 w-4 ml-1" /></span>
                        )}
                    </Button>
                </div>
            </div>

            {/* PRODUCT SHEET FORM */}
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="bg-white text-slate-900 border-l border-slate-200 sm:max-w-md w-full">
                    <SheetHeader>
                        <SheetTitle className="text-slate-900">{editingProduct ? "Edit Product" : "Add New Product"}</SheetTitle>
                        <SheetDescription className="text-slate-500">
                            {editingProduct ? "Update product details." : "Create a new item for your inventory."}
                        </SheetDescription>
                    </SheetHeader>

                    <form action={handleSubmit} className="space-y-6 mt-6">
                        {/* Image Upload */}
                        <div className="space-y-2">
                            <Label className="text-slate-700">Product Image</Label>
                            <div className="border-2 border-dashed border-slate-200 bg-slate-50 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file && file.size > 5 * 1024 * 1024) {
                                            alert("File size must be less than 5MB");
                                            e.target.value = ""; // Clear input
                                        }
                                    }}
                                />
                                <Upload className="h-8 w-8 text-slate-400 group-hover:scale-110 transition-transform" />
                                <p className="text-xs text-slate-500">Drag or Click to Upload</p>
                            </div>
                            {editingProduct?.image_url && (
                                <p className="text-xs text-blue-600">Current image set. Upload new to replace.</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-slate-700">Name</Label>
                            <Input id="name" name="name" defaultValue={editingProduct?.name} required placeholder="Product Name" className="bg-white border-slate-200 text-slate-900 focus-visible:ring-emerald-500" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category" className="text-slate-700">Category</Label>
                            <Select name="category_id" defaultValue={editingProduct?.category_id} required>
                                <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent className="bg-white border-slate-200 text-slate-900">
                                    {initialCategories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id} className="focus:bg-slate-100 cursor-pointer">{cat.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-slate-700">Price (Rp)</Label>
                            <Input
                                id="price"
                                name="price"
                                type="number"
                                defaultValue={editingProduct?.price}
                                required
                                placeholder="0"
                                min="0"
                                className="bg-white border-slate-200 text-slate-900 focus-visible:ring-emerald-500"
                            />
                        </div>

                        <SheetFooter>
                            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                                {editingProduct ? "Update Product" : "Create Product"}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}
