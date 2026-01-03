"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { receivePurchaseOrder } from "@/actions/procurement";
import { Loader2, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function ReceivePODialog({ poId, outlets }: { poId: string, outlets: { id: string, name: string }[] }) {
    const [open, setOpen] = useState(false);
    const [selectedOutlet, setSelectedOutlet] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleReceive() {
        if (!selectedOutlet) return;
        setLoading(true);
        try {
            await receivePurchaseOrder(poId, selectedOutlet);
            setOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert("Failed to receive order");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
                    <CheckCircle size={16} /> Mark as Received
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] glass-solid border-white/10 text-slate-100 bg-slate-900">
                <DialogHeader>
                    <DialogTitle>Receive Goods</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        Select the outlet where these items will be added to stock.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label>Receiving Outlet</Label>
                        <Select onValueChange={setSelectedOutlet}>
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                <SelectValue placeholder="Select outlet" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-slate-700 text-slate-200">
                                {outlets.map((outlet) => (
                                    <SelectItem key={outlet.id} value={outlet.id}>{outlet.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleReceive} disabled={!selectedOutlet || loading} className="bg-emerald-600 hover:bg-emerald-700">
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirm Receipt
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
