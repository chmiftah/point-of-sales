"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, Pencil } from "lucide-react";
import { createSupplier, deleteSupplier } from "@/actions/procurement"; // We will call these
import { useRouter } from "next/navigation";

function SubmitButton({ children, className }: { children: React.ReactNode, className?: string }) {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className={className}>
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : children}
        </Button>
    );
}

export function AddSupplierDialog() {
    const [open, setOpen] = useState(false);

    async function clientAction(formData: FormData) {
        await createSupplier(formData);
        setOpen(false);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"><Plus size={16} /> Add Supplier</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-solid border-white/10 text-slate-100 bg-slate-900/95 backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle>Add New Supplier</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Enter the details of your vendor here.
                    </DialogDescription>
                </DialogHeader>
                <form action={clientAction} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Company Name</Label>
                        <Input id="name" name="name" required className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" name="address" className="bg-white/5 border-white/10 text-white" />
                    </div>
                    <DialogFooter>
                        <SubmitButton className="bg-emerald-600 hover:bg-emerald-700">Save Supplier</SubmitButton>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export function DeleteSupplierButton({ id }: { id: string }) {
    const [pending, setPending] = useState(false);

    async function handleDelete(e: React.MouseEvent) {
        e.preventDefault();
        if (!confirm("Are you sure you want to delete this supplier?")) return;
        setPending(true);
        await deleteSupplier(id);
        setPending(false);
    }

    return (
        <div
            onClick={handleDelete}
            className="w-full flex items-center px-2 py-1.5 text-sm outline-none transition-colors hover:bg-slate-800 focus:bg-slate-800 cursor-pointer text-red-400"
        >
            {pending ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Trash2 size={16} className="mr-2" />}
            Delete Vendor
        </div>
    );
}
