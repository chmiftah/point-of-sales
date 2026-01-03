import { createClient } from "@/lib/supabase/server";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Phone, Mail, MapPin, MoreHorizontal, Search, Settings } from "lucide-react";
import { AddSupplierDialog, DeleteSupplierButton } from "@/components/inventory/supplier-actions";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
    const supabase = await createClient();
    const { data: suppliers } = await supabase.from('suppliers').select('*').order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white/90">Suppliers</h2>
                    <p className="text-slate-400">Manage vendor relationships and contact details.</p>
                </div>
                <AddSupplierDialog />
            </div>

            <Card className="border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <CardTitle className="text-slate-200">Vendor List</CardTitle>
                        <CardDescription className="text-slate-500">
                            Viewing {suppliers?.length || 0} active suppliers.
                        </CardDescription>
                    </div>
                    <div className="flex w-[250px] items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-1">
                        <Search className="h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search suppliers..."
                            className="h-7 border-0 bg-transparent p-0 text-slate-200 placeholder:text-slate-500 focus-visible:ring-0"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border border-white/10 overflow-hidden">
                        <Table>
                            <TableHeader className="bg-white/5">
                                <TableRow className="hover:bg-white/5 border-white/10">
                                    <TableHead className="text-slate-400">Company</TableHead>
                                    <TableHead className="text-slate-400">Contact</TableHead>
                                    <TableHead className="text-slate-400">Location</TableHead>
                                    <TableHead className="text-right text-slate-400">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {suppliers && suppliers.length > 0 ? (
                                    suppliers.map((sup) => (
                                        <TableRow key={sup.id} className="hover:bg-white/5 border-white/5">
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-200 text-base">{sup.name}</span>
                                                    <span className="text-xs text-slate-500">ID: {sup.id.slice(0, 8)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5 text-sm text-slate-400">
                                                    {sup.phone && <div className="flex items-center gap-2"><Phone size={13} className="text-emerald-500/70" /> {sup.phone}</div>}
                                                    {sup.email && <div className="flex items-center gap-2"><Mail size={13} className="text-blue-500/70" /> {sup.email}</div>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {sup.address ? (
                                                    <div className="flex items-start gap-2 text-sm text-slate-400 max-w-[200px]">
                                                        <MapPin size={14} className="mt-0.5 text-slate-600 shrink-0" />
                                                        <span className="truncate">{sup.address}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-slate-600 italic text-xs">No address</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white hover:bg-white/10">
                                                            <span className="sr-only">Open menu</span>
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-300">
                                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                        <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                                                            View Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="hover:bg-slate-800 focus:bg-slate-800 cursor-pointer">
                                                            Edit Supplier
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-800" />
                                                        <DropdownMenuItem className="text-red-400 hover:bg-red-900/20 focus:bg-red-900/20 cursor-pointer p-0">
                                                            <div className="w-full h-full flex items-center">
                                                                <DeleteSupplierButton id={sup.id} />
                                                            </div>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                            No suppliers found. Add one to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
