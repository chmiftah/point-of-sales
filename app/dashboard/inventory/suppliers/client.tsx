"use client";

import { useState } from "react";
import { Plus, Search, Pencil, Trash2, MoreHorizontal, User, Phone, MapPin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { createSupplier, updateSupplier, deleteSupplier } from "@/actions/procurement";
import { useToast } from "@/components/ui/use-toast";

interface Supplier {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
}

export default function SuppliersClient({ initialSuppliers }: { initialSuppliers: Supplier[] }) {
    const { toast } = useToast();
    const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Filter Logic
    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.phone && s.phone.includes(searchQuery))
    );

    // Handle Form Submit (Create & Update)
    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        try {
            if (editingSupplier) {
                formData.append("id", editingSupplier.id);
                await updateSupplier(formData);
                toast({
                    title: "Success",
                    description: "Supplier updated successfully",
                    variant: "default",
                });
            } else {
                await createSupplier(formData);
                toast({
                    title: "Success",
                    description: "Supplier created successfully",
                    variant: "default",
                });
            }
            setIsDialogOpen(false);
            setEditingSupplier(null);
            // In a real app we might re-fetch or use router.refresh() but server action revalidatePath handles it?
            // Since we are inside client component state might not update immediately if we don't refresh the page or update local state.
            // For now, let's trigger a full refresh or we can optimistically update. 
            // Better to rely on router.refresh() from next/navigation but for this snippet I'll let revalidatePath do its job on next nav.
            // To see immediate changes without refresh, we should really use router.refresh().
            window.location.reload(); // Simple brute force for now to ensure data sync.
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Handle Delete
    async function handleDelete(id: string) {
        if (!confirm("Are you sure you want to delete this supplier?")) return;
        try {
            await deleteSupplier(id);
            toast({
                title: "Deleted",
                description: "Supplier deleted successfully",
                variant: "default",
            });
            window.location.reload();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive",
            });
        }
    }

    const openCreateModal = () => {
        setEditingSupplier(null);
        setIsDialogOpen(true);
    };

    const openEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Suppliers</h1>
                    <p className="text-sm text-slate-500">Manage your vendor relationships and contacts.</p>
                </div>
                <Button onClick={openCreateModal} className="bg-slate-900 text-white hover:bg-slate-800">
                    <Plus size={16} className="mr-2" /> Add Supplier
                </Button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 max-w-sm">
                <div className="relative w-full">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <Input
                        placeholder="Search suppliers..."
                        className="pl-9 bg-white border-slate-200 focus:ring-slate-900/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Search Results */}
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="font-semibold text-slate-700">Name</TableHead>
                            <TableHead className="font-semibold text-slate-700">Contact Info</TableHead>
                            <TableHead className="font-semibold text-slate-700">Address</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700 w-[100px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSuppliers.length > 0 ? (
                            filteredSuppliers.map((supplier) => (
                                <TableRow key={supplier.id} className="hover:bg-slate-50 transition-colors group">
                                    <TableCell className="font-medium text-slate-900">
                                        <div className="flex flex-col">
                                            <span>{supplier.name}</span>
                                            {/* <span className="text-xs text-slate-400 font-normal">ID: {supplier.id.slice(0, 8)}</span> */}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1 text-sm text-slate-600">
                                            {supplier.email && (
                                                <div className="flex items-center gap-2">
                                                    <Mail size={12} className="text-slate-400" />
                                                    <span>{supplier.email}</span>
                                                </div>
                                            )}
                                            {supplier.phone && (
                                                <div className="flex items-center gap-2">
                                                    <Phone size={12} className="text-slate-400" />
                                                    <span>{supplier.phone}</span>
                                                </div>
                                            )}
                                            {!supplier.email && !supplier.phone && <span className="text-slate-400">-</span>}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600 max-w-[250px] truncate">
                                        {supplier.address ? (
                                            <div className="flex items-center gap-2" title={supplier.address}>
                                                <MapPin size={12} className="text-slate-400 flex-none" />
                                                <span className="truncate">{supplier.address}</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-400">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openEditModal(supplier)}
                                                className="h-8 w-8 text-slate-500 hover:text-slate-900 transition-colors"
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(supplier.id)}
                                                className="h-8 w-8 text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                                        <User size={32} className="opacity-20" />
                                        <p>No suppliers found.</p>
                                        {searchQuery && <Button variant="link" onClick={() => setSearchQuery("")} className="text-slate-900">Clear Search</Button>}
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-lg bg-white border-slate-200">
                    <DialogHeader>
                        <DialogTitle>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</DialogTitle>
                        <DialogDescription>
                            {editingSupplier ? "Update supplier details below." : "Enter the details of the new supplier."}
                        </DialogDescription>
                    </DialogHeader>

                    <form action={handleSubmit} className="space-y-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Company Name <span className="text-red-500">*</span></Label>
                            <Input id="name" name="name" defaultValue={editingSupplier?.name} required placeholder="e.g. Acme Corp" className="border-slate-200" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" defaultValue={editingSupplier?.email || ''} placeholder="contact@acme.com" className="border-slate-200" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" type="tel" defaultValue={editingSupplier?.phone || ''} placeholder="+62 812..." className="border-slate-200" />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" defaultValue={editingSupplier?.address || ''} placeholder="Full address..." className="border-slate-200" />
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isLoading} className="border-slate-200">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading} className="bg-slate-900 hover:bg-slate-800 text-white">
                                {isLoading ? "Saving..." : (editingSupplier ? "Save Changes" : "Create Supplier")}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
