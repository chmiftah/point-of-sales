"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateStock } from "./actions";

interface Product {
    id: string;
    name: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: Product | null;
    outletId: string;
    currentStock: number;
    outletName?: string;
}

export default function StockAdjustmentDialog({
    open,
    onOpenChange,
    product,
    outletId,
    currentStock,
    outletName
}: Props) {
    const [mode, setMode] = useState<'add' | 'subtract' | 'set'>('add');
    const [amount, setAmount] = useState<number>(0);
    const [loading, setLoading] = useState(false);

    if (!product) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);

        const res = await updateStock({
            productId: product!.id,
            outletId,
            quantity: Number(amount),
            adjustmentType: mode
        });

        setLoading(false);

        if (res?.error) {
            alert(res.error);
        } else {
            onOpenChange(false);
            setAmount(0);
        }
    }

    // Calculate preview
    let previewStock = currentStock;
    if (mode === 'add') previewStock += Number(amount);
    else if (mode === 'subtract') previewStock -= Number(amount);
    else if (mode === 'set') previewStock = Number(amount);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Adjust Stock</DialogTitle>
                    <DialogDescription>
                        Update inventory for <strong>{product.name}</strong> at {outletName || "this outlet"}.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Tabs defaultValue="add" value={mode} onValueChange={(v: any) => setMode(v)}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="add">Add (+)</TabsTrigger>
                            <TabsTrigger value="subtract">Reduce (-)</TabsTrigger>
                            <TabsTrigger value="set">Set (=)</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="space-y-2">
                        <Label htmlFor="amount">
                            {mode === 'set' ? 'New Quantity' : 'Amount'}
                        </Label>
                        <Input
                            id="amount"
                            type="number"
                            min="0"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            required
                        />
                    </div>

                    <div className="bg-muted p-4 rounded-lg flex justify-between items-center text-sm">
                        <span>Current Stock: <strong>{currentStock}</strong></span>
                        <span>&rarr;</span>
                        <span>New Stock: <strong>{Math.max(0, previewStock)}</strong></span>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Adjustment"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
