"use client";

import { useCartStore } from "@/store/cartStore";
import { Button } from "@/components/ui/button";
import { Settings, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

export function TaxSettings() {
    const { customTaxes, toggleTax } = useCartStore();
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [ref]);

    return (
        <div className="relative inline-block" ref={ref}>
            <Button
                variant="ghost"
                size="icon"
                className={cn("h-6 w-6 rounded-full text-muted-foreground hover:bg-white/10 hover:text-primary transition-colors", isOpen && "bg-white/10 text-primary")}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Settings size={14} />
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 bottom-full mb-2 w-64 p-4 rounded-xl bg-[#1a1b1e] border border-white/10 shadow-2xl z-50 glass-light backdrop-blur-3xl"
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-foreground">Pengaturan Pajak</h4>
                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-full hover:bg-white/10" onClick={() => setIsOpen(false)}>
                                <X size={14} />
                            </Button>
                        </div>

                        <div className="space-y-3">
                            {customTaxes.map(tax => (
                                <div
                                    key={tax.id}
                                    className="flex items-center justify-between"
                                >
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{tax.name}</span>
                                        <span className="text-xs text-muted-foreground">Rate: {tax.rate * 100}%</span>
                                    </div>
                                    <Switch
                                        checked={tax.isActive}
                                        onCheckedChange={() => toggleTax(tax.id)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-white/5 text-[10px] text-muted-foreground text-center">
                            Changes apply immediately
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
