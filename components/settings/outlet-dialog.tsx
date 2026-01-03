"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea"; // Ensure this component exists!
import { createOutlet, updateOutlet } from "@/actions/outlets";
import { Loader2, Plus, PenSquare } from "lucide-react";
import { useRouter } from "next/navigation";

interface Outlet {
    id: string;
    name: string;
    address?: string;
    phone?: string;
}

export function OutletDialog({ outlet }: { outlet?: Outlet }) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const isEdit = !!outlet;

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        const formData = new FormData(event.currentTarget);

        try {
            if (isEdit && outlet) {
                formData.append("id", outlet.id);
                await updateOutlet(formData);
            } else {
                await createOutlet(formData);
            }
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Operation failed. See console.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="icon" className="hover:bg-slate-100 text-slate-500 hover:text-emerald-600">
                        <PenSquare size={16} />
                    </Button>
                ) : (
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Plus size={16} /> Add Outlet
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-slate-200 text-slate-800">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Outlet" : "Add New Outlet"}</DialogTitle>
                    <DialogDescription className="text-slate-500">
                        {isEdit ? "Update branch details." : "Create a new branch location."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Outlet Name</Label>
                        <Input id="name" name="name" defaultValue={outlet?.name} required placeholder="e.g. Cabang Tebet" className="bg-white" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" defaultValue={outlet?.phone} placeholder="(021) ..." className="bg-white" />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Textarea id="address" name="address" defaultValue={outlet?.address} placeholder="Full connection address..." className="bg-white min-h-[80px]" />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEdit ? "Save Changes" : "Create Outlet"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
