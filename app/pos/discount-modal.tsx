"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { Tag, Banknote, Percent } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

interface DiscountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function DiscountModal({ isOpen, onClose }: DiscountModalProps) {
    const { setGlobalDiscount, globalDiscount } = useCartStore();
    const [activeTab, setActiveTab] = useState<'percent' | 'fixed'>(globalDiscount.type);
    const [value, setValue] = useState<string>(globalDiscount.value.toString());

    const handleApply = () => {
        const numValue = parseFloat(value) || 0;
        setGlobalDiscount(activeTab, numValue);
        onClose();
    };

    const handlePreset = (val: number) => {
        setValue(val.toString());
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px] glass-light border-white/10 text-foreground">
                <DialogTitle className="flex items-center gap-2">
                    <Tag size={20} className="text-primary" />
                    Atur Diskon
                </DialogTitle>

                <Tabs defaultValue="percent" value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full mt-4">
                    <TabsList className="grid w-full grid-cols-2 bg-black/10">
                        <TabsTrigger value="percent" className="gap-2"><Percent size={14} /> Persen (%)</TabsTrigger>
                        <TabsTrigger value="fixed" className="gap-2"><Banknote size={14} /> Rupiah (Rp)</TabsTrigger>
                    </TabsList>

                    <div className="pt-6 pb-2">
                        <div className="relative">
                            <Input
                                type="number"
                                value={value}
                                onChange={(e) => setValue(e.target.value)}
                                className="text-4xl text-center h-20 font-bold bg-white/5 border-white/10 focus:ring-primary"
                                placeholder="0"
                            />
                            {activeTab === 'percent' && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-2xl text-muted-foreground">%</span>}
                        </div>
                    </div>

                    <TabsContent value="percent" className="space-y-3">
                        <div className="flex gap-2 justify-center">
                            {[5, 10, 20, 50].map((p) => (
                                <Button key={p} variant="outline" size="sm" onClick={() => handlePreset(p)} className="flex-1 bg-white/5 border-white/10">{p}%</Button>
                            ))}
                        </div>
                    </TabsContent>

                    <TabsContent value="fixed" className="space-y-3">
                        <div className="flex gap-2 justify-center flex-wrap">
                            {[10000, 20000, 50000].map((p) => (
                                <Button key={p} variant="outline" size="sm" onClick={() => handlePreset(p)} className="flex-1 min-w-[30%] bg-white/5 border-white/10">{formatRupiah(p)}</Button>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex gap-2 mt-6">
                    <Button variant="ghost" onClick={onClose} className="flex-1">Batal</Button>
                    <Button onClick={handleApply} className="flex-1 bg-primary text-primary-foreground font-bold">Simpan Diskon</Button>
                </div>

            </DialogContent>
        </Dialog>
    );
}
