"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { CreditCard, Banknote, QrCode, CheckCircle, Printer, MessageCircle, Plus, Smartphone, Delete } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalAmount: number;
    onConfirm: () => void;
    selectedCustomer: { id: string, name: string } | null;
    currentOutletId: string | null;
}

import { formatRupiah } from "@/lib/utils";
import { checkoutAction } from "@/actions/checkout";

export function PaymentModal({ isOpen, onClose, totalAmount, onConfirm, selectedCustomer, currentOutletId }: PaymentModalProps) {
    const { items } = useCartStore();
    const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'kartu' | 'qris'>('tunai');
    const [amountTendered, setAmountTendered] = useState<number>(0);
    const [displayAmount, setDisplayAmount] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setAmountTendered(0);
            setDisplayAmount('');
            setIsSuccess(false);
            setPaymentMethod('tunai');
        }
    }, [isOpen]);

    const handleNumpadInput = (value: string) => {
        if (value === 'clear') {
            setDisplayAmount('');
            setAmountTendered(0);
            return;
        }

        let newDisplay = displayAmount;
        if (value === 'backspace') {
            newDisplay = newDisplay.slice(0, -1);
        } else {
            // Prevent leading zeros logic if needed, but simple string concat usually works for simple POS
            if (value === '000' && newDisplay.length === 0) return; // Don't start with 000
            newDisplay = newDisplay + value;
        }

        setDisplayAmount(newDisplay);
        setAmountTendered(parseInt(newDisplay) || 0);
    };

    const handleQuickAmount = (amount: number) => {
        setAmountTendered(amount);
        setDisplayAmount(amount.toString());
    };

    const calculateChange = () => {
        return amountTendered - totalAmount;
    };

    const isPaymentValid = () => {
        if (paymentMethod === 'tunai') {
            return amountTendered >= totalAmount;
        }
        return true;
    };


    const [isLoading, setIsLoading] = useState(false);

    const handleProcessPayment = async () => {
        console.log("Processing payment...", {
            valid: isPaymentValid(),
            method: paymentMethod,
            outletId: currentOutletId
        });

        if (!isPaymentValid()) return;

        setIsLoading(true);

        try {
            // Prepare Payload
            const checkoutItems = items.map(i => ({
                id: i.id,
                quantity: i.quantity,
                price: i.price
            }));

            const payload = {
                items: checkoutItems,
                total: totalAmount,
                method: paymentMethod,
                customerId: selectedCustomer?.id,
                outletId: currentOutletId
            };
            console.log("PAYMENT PAYLOAD:", payload);

            const result = await checkoutAction(checkoutItems, totalAmount, paymentMethod, selectedCustomer?.id, currentOutletId);

            if (result.success) {
                setIsSuccess(true);
            } else {
                alert(`Transaction Failed: ${result.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("An unexpected error occurred.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFinalize = () => {
        onConfirm(); // This clears cart in parent
    };


    const kembalian = calculateChange();

    // Smart Suggestions: Uang Pas, Next 10k, Next 50k, Next 100k
    const suggestions = [
        totalAmount,
        Math.ceil(totalAmount / 10000) * 10000,
        Math.ceil(totalAmount / 50000) * 50000,
        Math.ceil(totalAmount / 100000) * 100000
    ].filter((val, index, self) => self.indexOf(val) === index && val >= totalAmount).slice(0, 3);

    // If suggestions too few (e.g. Total 100k), ensure we have buttons
    if (suggestions.length < 3) {
        if (!suggestions.includes(50000) && 50000 > totalAmount) suggestions.push(50000);
        if (!suggestions.includes(100000) && 100000 > totalAmount) suggestions.push(100000);
    }
    const uniqueSuggestions = Array.from(new Set(suggestions)).sort((a, b) => a - b);


    return (
        <Dialog open={isOpen} onOpenChange={(open) => !isSuccess && onClose()}>
            <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden border-white/10 glass-light text-foreground sm:rounded-3xl">
                <DialogTitle className="sr-only">Pembayaran</DialogTitle>

                <AnimatePresence mode="wait">
                    {!isSuccess ? (
                        <motion.div
                            key="payment-step"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex h-[600px]"
                        >
                            {/* LEFT PANEL: Ringkasan */}
                            <div className="w-1/3 bg-black/20 p-6 flex flex-col border-r border-white/10">
                                <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Ringkasan Order</h3>

                                <div className="text-4xl font-black text-primary mb-1 tracking-tighter glow-text">
                                    {formatRupiah(totalAmount)}
                                </div>
                                <div className="text-sm text-muted-foreground mb-6">Total Tagihan</div>

                                <ScrollArea className="flex-1 -mx-2 px-2">
                                    <div className="space-y-3">
                                        {items.map(item => (
                                            <div key={item.id} className="flex justify-between items-start text-sm group">
                                                <div className="flex gap-2">
                                                    <span className="font-bold text-muted-foreground min-w-[20px]">{item.quantity}x</span>
                                                    <span className="group-hover:text-primary transition-colors">{item.name}</span>
                                                </div>
                                                <span className="font-medium">{formatRupiah(item.price * item.quantity)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollArea>

                                <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Pelanggan</span>
                                        <span className="font-medium">{selectedCustomer ? selectedCustomer.name : 'Walk-in'}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Order ID</span>
                                        <span className="font-mono">#9021</span>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT PANEL: Pembayaran */}
                            <div className="flex-1 p-6 flex flex-col bg-background/60 backdrop-blur-xl">
                                <Tabs defaultValue="tunai" onValueChange={(v: any) => setPaymentMethod(v)} className="w-full flex-1 flex flex-col">
                                    <TabsList className="grid w-full grid-cols-3 mb-6 bg-black/10 p-1">
                                        <TabsTrigger value="tunai" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Banknote size={16} /> Tunai</TabsTrigger>
                                        <TabsTrigger value="kartu" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><CreditCard size={16} /> Kartu</TabsTrigger>
                                        <TabsTrigger value="qris" className="gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><QrCode size={16} /> QRIS</TabsTrigger>
                                    </TabsList>

                                    <div className="flex-1 relative">
                                        <TabsContent value="tunai" className="h-full mt-0 flex flex-col absolute inset-0">
                                            {/* Input Display */}
                                            <div className="bg-black/10 rounded-2xl p-4 mb-4 border border-white/5 text-right relative overflow-hidden h-32 flex flex-col justify-center">
                                                <div className="text-xs text-muted-foreground uppercase absolute top-3 left-4">Uang Diterima</div>
                                                <div className={cn("text-4xl font-mono font-bold tracking-tight transition-colors",
                                                    amountTendered === 0 ? "text-muted-foreground" : "text-foreground"
                                                )}>
                                                    {amountTendered === 0 ? 'Rp 0' : formatRupiah(amountTendered)}
                                                </div>

                                                {/* Kembalian Indicator */}
                                                <div className="absolute bottom-3 left-4 flex gap-2 items-center">
                                                    {kembalian >= 0 ? (
                                                        <span className="text-green-400 font-bold text-sm bg-green-400/10 px-2 py-0.5 rounded-md">
                                                            Kembalian: {formatRupiah(kembalian)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-400 font-bold text-sm bg-red-400/10 px-2 py-0.5 rounded-md">
                                                            Kurang: {formatRupiah(Math.abs(kembalian))}
                                                        </span>
                                                    )}
                                                </div>
                                                {amountTendered > 0 && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleNumpadInput('clear')}
                                                        className="absolute top-2 right-2 hover:bg-white/10 text-muted-foreground hover:text-red-400"
                                                    >
                                                        Clear
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Suggestions */}
                                            <div className="flex gap-2 mb-4">
                                                {uniqueSuggestions.map((sug) => (
                                                    <Button
                                                        key={sug}
                                                        variant="outline"
                                                        onClick={() => handleQuickAmount(sug)}
                                                        className="flex-1 border-primary/20 hover:bg-primary/10 hover:border-primary text-primary"
                                                    >
                                                        {sug === totalAmount ? 'Uang Pas' : formatRupiah(sug)}
                                                    </Button>
                                                ))}
                                            </div>

                                            {/* Numpad */}
                                            <div className="grid grid-cols-3 gap-3 flex-1">
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((key) => (
                                                    <Button
                                                        key={key}
                                                        variant="ghost"
                                                        onClick={() => handleNumpadInput(key.toString())}
                                                        className="h-full text-2xl font-bold rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:scale-[0.98] active:scale-95 transition-all w-full"
                                                    >
                                                        {key}
                                                    </Button>
                                                ))}
                                                <Button variant="ghost" className="h-full text-2xl font-bold rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-red-300" onClick={() => handleNumpadInput('backspace')}>⌫</Button>
                                                <Button variant="ghost" className="h-full text-2xl font-bold rounded-xl border border-white/5 bg-white/5 hover:bg-white/10" onClick={() => handleNumpadInput('0')}>0</Button>
                                                <Button variant="ghost" className="h-full text-2xl font-bold rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-yellow-300" onClick={() => handleNumpadInput('000')}>000</Button>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="kartu" className="h-full flex flex-col items-center justify-center space-y-6">
                                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                                                <CreditCard size={48} className="text-white" />
                                            </div>
                                            <div className="text-center">
                                                <h4 className="text-xl font-bold">Menunggu EDC...</h4>
                                                <p className="text-muted-foreground">Silakan gesek atau masukkan kartu.</p>
                                            </div>
                                            <div className="animate-pulse text-indigo-400 font-mono">Connecting...</div>
                                        </TabsContent>

                                        <TabsContent value="qris" className="h-full flex flex-col items-center justify-center space-y-6">
                                            <div className="bg-white p-4 rounded-xl shadow-lg">
                                                <div className="w-48 h-48 bg-gray-900 rounded-lg flex items-center justify-center text-white/50 pattern-dots">
                                                    [QRIS CODE]
                                                </div>
                                            </div>
                                            <div className="text-center">
                                                <h4 className="text-xl font-bold">Scan QRIS</h4>
                                                <p className="text-muted-foreground">Menunggu pembayaran pelanggan.</p>
                                            </div>
                                        </TabsContent>
                                    </div>

                                    {/* Action Button */}
                                    <div className="mt-6">
                                        <Button
                                            size="lg"
                                            className={cn("w-full h-14 text-lg font-bold shadow-xl transition-all",
                                                isPaymentValid()
                                                    ? "bg-green-600 hover:bg-green-700 hover:scale-[1.02] shadow-green-900/20"
                                                    : "bg-muted text-muted-foreground cursor-not-allowed"
                                            )}
                                            disabled={!isPaymentValid() || isLoading}
                                            onClick={handleProcessPayment}
                                        >
                                            {paymentMethod === 'tunai'
                                                ? (kembalian >= 0 ? (isLoading ? 'Processing...' : 'Bayar Sekarang') : 'Uang Kurang')
                                                : (isLoading ? 'Processing...' : 'Konfirmasi Pembayaran')
                                            }
                                        </Button>
                                    </div>
                                </Tabs>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="success-step"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center p-12 h-[600px] text-center bg-black/40 backdrop-blur-xl"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                                className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-6 shadow-2xl shadow-green-500/40"
                            >
                                <CheckCircle size={48} className="text-white" strokeWidth={3} />
                            </motion.div>

                            <h2 className="text-3xl font-black mb-2 tracking-tight">Pembayaran Berhasil!</h2>
                            <p className="text-white mb-8">Transaksi #9021 telah selesai.</p>

                            {paymentMethod === 'tunai' && (
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 w-full max-w-sm">
                                    <div className="text-sm text-white uppercase tracking-wider mb-2">Kembalian</div>
                                    <div className="text-5xl font-mono font-bold text-green-400 glow-text-green">
                                        {formatRupiah(kembalian)}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                <Button size="lg" variant="outline" className="gap-2 h-14 bg-white/5 border-white/10 hover:bg-white/10">
                                    <Printer size={20} /> Cetak Struk
                                </Button>
                                <Button size="lg" variant="outline" className="gap-2 h-14 bg-white/5 border-white/10 hover:bg-white/10">
                                    <MessageCircle size={20} /> Kirim WA
                                </Button>
                                <Button
                                    size="lg"
                                    className="col-span-2 h-14 bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-bold gap-2"
                                    onClick={handleFinalize}
                                >
                                    <Plus size={20} strokeWidth={3} /> Transaksi Baru
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
