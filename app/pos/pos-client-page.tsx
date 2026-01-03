"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, User, ShoppingCart, Trash2, Plus, Minus, X, Menu, CreditCard } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCartStore, Product } from '@/store/cartStore';
import { CustomerSelector } from '@/components/pos/customer-selector';
import { PaymentModal } from './payment-modal';
import { formatRupiah, cn } from '@/lib/utils';
import { UserNav } from '@/components/layout/user-nav';
import { OutletSwitcher } from '@/components/pos/outlet-switcher';
import Link from 'next/link';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

interface Category {
    id: string;
    name: string;
}

interface Outlet {
    id: string;
    name: string;
}

interface POSClientPageProps {
    initialProducts: (Product & { category: string })[];
    categories: Category[];
    user?: any;
    outlets: Outlet[];
    currentOutletId: string;
}

export default function POSClientPage({ initialProducts, categories, user, outlets, currentOutletId }: POSClientPageProps) {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<{ id: string, name: string, phone: string | null } | null>(null);

    // --- BILLING STATE ---
    const [taxRate, setTaxRate] = useState(11);
    const [serviceRate, setServiceRate] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [discountType, setDiscountType] = useState<'percent' | 'amount'>('amount');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const { items, addItem, removeItem, updateQuantity, getSummary, clearCart } = useCartStore();
    const summary = getSummary();

    // --- BILLING CALCULATIONS ---
    const subtotal = summary.subtotal;
    const discountValue = discountType === 'percent' ? subtotal * (discount / 100) : discount;
    const taxableAmount = Math.max(0, subtotal - discountValue);

    const taxValue = taxableAmount * (taxRate / 100);
    const serviceValue = taxableAmount * (serviceRate / 100);

    const grandTotal = Math.max(0, taxableAmount + taxValue + serviceValue);

    const categoryList = ["All", ...categories.map(c => c.name)];

    const filteredProducts = initialProducts.filter(p => {
        const matchesCategory = selectedCategory === "All" || (p as any).category === selectedCategory;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const [currentTime, setCurrentTime] = useState<string>("");

    useEffect(() => {
        setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        const interval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleAddToCart = (product: Product) => {
        const currentInCart = items.find(i => i.id === product.id)?.quantity || 0;
        const availableStock = product.stock || 0;

        if (currentInCart + 1 > availableStock) {
            alert(`Stok tidak cukup! Sisa stok: ${availableStock}`);
            return;
        }
        addItem(product);
    };

    // --- REUSABLE CART COMPONENT (Shared between Sidebar and Mobile Sheet) ---
    const CartContent = () => (
        <div className="flex flex-col w-full h-full bg-white z-50">
            {/* Cart Header */}
            <div className="flex-none h-16 px-6 border-b border-zinc-100 flex items-center justify-between bg-white">
                <div>
                    <h2 className="text-lg font-bold tracking-tight text-slate-900">Current Order</h2>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">{items.length} Items</Badge>
                        <span>•</span>
                        <span>Order #New</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={cn("rounded-full h-8 w-8", isSettingsOpen ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-700")}
                        title="Bill Settings"
                    >
                        <CreditCard size={16} />
                    </Button>
                    {items.length > 0 && (
                        <Button variant="ghost" size="icon" onClick={clearCart} className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full h-8 w-8" title="Clear Cart">
                            <Trash2 size={16} />
                        </Button>
                    )}
                </div>
            </div>

            <CustomerSelector
                selectedCustomer={selectedCustomer}
                onSelectCustomer={setSelectedCustomer}
            />

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto w-full p-4 space-y-3 min-h-0">
                {items.map(item => (
                    <motion.div
                        layout
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="bg-white border border-slate-200 rounded-xl p-3 flex gap-3 items-center group relative shadow-sm"
                    >
                        {/* Image */}
                        <div className="h-12 w-12 rounded-lg bg-slate-100 overflow-hidden flex-none border border-slate-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-slate-900 truncate pr-5">{item.name}</h4>
                            <p className="text-xs text-emerald-600 font-medium mt-0.5">{formatRupiah(item.price)}</p>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200">
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-6 h-6 rounded-md hover:bg-white hover:shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all"
                            >
                                <Minus size={12} />
                            </button>
                            <span className="w-4 text-center text-xs font-bold tabular-nums text-slate-900">{item.quantity}</span>
                            <button
                                onClick={() => {
                                    const productStock = initialProducts.find(p => p.id === item.id)?.stock || 0;
                                    if (item.quantity + 1 > productStock) {
                                        alert(`Maksimal stok: ${productStock}`);
                                        return;
                                    }
                                    updateQuantity(item.id, item.quantity + 1)
                                }}
                                className="w-6 h-6 rounded-md hover:bg-white hover:shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                    </motion.div>
                ))}
                {items.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 space-y-3">
                        <ShoppingCart size={48} strokeWidth={1} className="opacity-50" />
                        <p className="text-sm font-medium">Cart is empty</p>
                    </div>
                )}
            </div>

            {/* Cart Footer */}
            <div className="flex-none p-6 bg-slate-50 border-t border-slate-200 space-y-4">

                {/* Bill Details Card */}
                <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                    {/* Settings / Controls */}
                    {isSettingsOpen && (
                        <div className="mb-4 space-y-3 pb-4 border-b border-slate-100 animate-in slide-in-from-top-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-slate-600">Tax (%)</label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn("h-6 text-xs", taxRate === 0 && "bg-slate-100 text-slate-400")}
                                        onClick={() => setTaxRate(taxRate === 0 ? 11 : 0)}
                                    >
                                        {taxRate === 0 ? "Off" : "11%"}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-medium text-slate-600">Service (%)</label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={cn("h-6 text-xs", serviceRate === 0 && "bg-slate-100 text-slate-400")}
                                        onClick={() => setServiceRate(serviceRate === 0 ? 5 : 0)}
                                    >
                                        {serviceRate === 0 ? "Off" : "5%"}
                                    </Button>
                                </div>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <label className="text-xs font-medium text-slate-600">Discount</label>
                                <div className="flex items-center gap-1">
                                    <div className="flex bg-slate-100 rounded-md p-0.5 border border-slate-200">
                                        <button
                                            onClick={() => setDiscountType('percent')}
                                            className={cn("px-2 py-0.5 text-[10px] font-bold rounded shadow-sm transition-all", discountType === 'percent' ? "bg-white text-emerald-600 shadow" : "text-slate-400 hover:text-slate-600")}
                                        >
                                            %
                                        </button>
                                        <button
                                            onClick={() => setDiscountType('amount')}
                                            className={cn("px-2 py-0.5 text-[10px] font-bold rounded shadow-sm transition-all", discountType === 'amount' ? "bg-white text-emerald-600 shadow" : "text-slate-400 hover:text-slate-600")}
                                        >
                                            Rp
                                        </button>
                                    </div>
                                    <Input
                                        className="h-7 w-20 text-right text-xs"
                                        placeholder="0"
                                        type="number"
                                        value={discount || ''}
                                        onChange={(e) => setDiscount(Number(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Subtotal</span>
                        <span className="font-medium text-slate-900">{formatRupiah(subtotal)}</span>
                    </div>

                    {taxRate > 0 && (
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Tax ({taxRate}%)</span>
                            <span>{formatRupiah(taxValue)}</span>
                        </div>
                    )}
                    {serviceRate > 0 && (
                        <div className="flex justify-between text-xs text-slate-500">
                            <span>Service ({serviceRate}%)</span>
                            <span>{formatRupiah(serviceValue)}</span>
                        </div>
                    )}
                    {discount > 0 && (
                        <div className="flex justify-between text-xs text-emerald-600 font-medium">
                            <span>Discount {discountType === 'percent' ? `(${discount}%)` : ''}</span>
                            <span>-{formatRupiah(discountValue)}</span>
                        </div>
                    )}

                    <div className="flex justify-between items-end pt-3 border-t border-slate-100 mt-2">
                        <div>
                            <span className="text-sm text-slate-500 block">Total</span>
                            <span className="text-2xl font-bold text-slate-900 tracking-tight">{formatRupiah(grandTotal)}</span>
                        </div>
                    </div>
                </div>

                <Button
                    size="lg"
                    className="w-full h-12 text-base font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200 rounded-xl"
                    onClick={() => {
                        setIsMobileCartOpen(false); // Close mobile sheet if open
                        setIsPaymentModalOpen(true);
                    }}
                    disabled={items.length === 0}
                >
                    Charge {formatRupiah(grandTotal)}
                </Button>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col h-screen h-[100dvh] w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">

            {/* --- TOP HEADER (Simplified) --- */}
            <div className="flex-none h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between z-20 shadow-sm relative">
                <div className="flex items-center gap-4">
                    {/* Brand */}
                    <div className="flex flex-col">
                        <h1 className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                            POS<span className="text-emerald-600">Pro</span>
                        </h1>
                        <p className="text-[10px] text-slate-500 font-mono hidden md:block">Shift #302 • {currentTime}</p>
                    </div>


                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    {/* Outlet Switcher (Owner Only) */}
                    <div className="hidden md:block">
                        <OutletSwitcher outlets={outlets} currentOutletId={currentOutletId} userRole={user?.role} />
                    </div>
                    {/* Search removed from here, moved to content area */}
                    <Link href="/dashboard" className="hidden md:block">
                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 gap-2 hover:bg-slate-100">
                            <LayoutDashboard size={16} /> <span className="hidden lg:inline">Dashboard</span>
                        </Button>
                    </Link>
                    <UserNav user={user || { name: 'Guest', email: '' }} />
                </div>
            </div>

            {/* --- MAIN CONTENT LAYOUT --- */}
            <div className="flex flex-1 overflow-hidden relative">

                {/* 1. PRODUCT GRID (Full Width on Mobile, 65% on Desktop) */}
                <div className="w-full md:w-[75%] flex flex-col h-full bg-slate-50/50 relative">

                    {/* NEW ACTION SECTION: Search & Categories */}
                    <div className="flex-none px-4 md:px-6 py-4 space-y-4 bg-slate-50 z-10">
                        {/* Search Bar - Prominent & Local */}
                        <div className="relative w-full md:mx-0">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <Input
                                placeholder="Search products..."
                                className="pl-10 pr-10 bg-white border-slate-200 focus:bg-white focus:border-emerald-500/50 focus:ring-emerald-500/20 rounded-full h-11 text-base shadow-sm hover:shadow-md transition-shadow"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                    <X size={16} />
                                </button>
                            )}
                        </div>

                        {/* Categories Pills */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mask-gradient-right">
                            {categoryList.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border shadow-sm",
                                        selectedCategory === cat
                                            ? "bg-slate-900 text-white border-slate-900 hover:bg-slate-800 hover:shadow-md"
                                            : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid Scroll Area */}
                    <div className="flex-1 overflow-y-auto px-4 md:px-6 pb-24 md:pb-6 min-h-0 scrollbar-hide">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5 pb-8">
                            {filteredProducts.map(product => {
                                const isOutOfStock = (product.stock || 0) <= 0;
                                return (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: isOutOfStock ? 0.6 : 1, scale: 1 }}
                                        whileHover={!isOutOfStock ? { y: -4, boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)" } : {}}
                                        whileTap={!isOutOfStock ? { scale: 0.96 } : {}}
                                        onClick={() => !isOutOfStock && handleAddToCart(product)}
                                        className={cn(
                                            "group bg-white rounded-2xl overflow-hidden transition-all relative flex flex-col",
                                            // Modern Card Styles: Shadow-sm default, Shadow-md hover. Removed heavy borders.
                                            "shadow-sm hover:shadow-lg border border-slate-100",
                                            isOutOfStock ? "grayscale opacity-80 cursor-not-allowed" : "cursor-pointer"
                                        )}
                                    >
                                        {/* Image Container */}
                                        <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={product.image || 'https://via.placeholder.com/300'} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />

                                            {/* Gradient Overlay for Text Contrast on Image? No, we moved text below. Just hover effect. */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

                                            {/* Stock Pill */}
                                            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm border border-slate-100/50">
                                                <div className={cn("w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor]", (product.stock || 0) < 10 && (product.stock || 0) > 0 ? "bg-amber-500 text-amber-500 animate-pulse" : isOutOfStock ? "bg-red-500 text-red-500" : "bg-emerald-500 text-emerald-500")} />
                                                <span className="text-slate-700 uppercase tracking-tight">{isOutOfStock ? '0 LEFT' : `${product.stock} LEFT`}</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4 flex flex-col flex-1 gap-2">
                                            {/* Name & Category */}
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight line-clamp-2 mb-0.5">{product.name}</h3>
                                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{product.category}</p>
                                            </div>

                                            {/* Price */}
                                            <div className="mt-auto pt-2 flex items-center justify-between border-t border-slate-50">
                                                <span className="text-base md:text-lg font-bold text-indigo-600 tracking-tight">{formatRupiah(product.price)}</span>

                                                {/* Mini Add Button (Visible on Desktop Hover) */}
                                                {!isOutOfStock && (
                                                    <div className="hidden md:flex opacity-0 group-hover:opacity-100 transition-opacity bg-indigo-50 text-indigo-600 p-1.5 rounded-lg">
                                                        <Plus size={16} strokeWidth={3} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                            {filteredProducts.length === 0 && (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                                    <Search className="h-12 w-12 mb-3 opacity-20" />
                                    <p className="text-base font-medium">No products found for "{searchQuery}"</p>
                                    <Button variant="link" onClick={() => setSearchQuery('')} className="text-indigo-500">Clear Search</Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. DESKTOP CART SIDEBAR (Hidden on Mobile, Visible on Desktop) */}
                <div className="hidden md:flex w-[25%] h-full border-l border-slate-200 bg-white relative z-20 shadow-2xl shadow-slate-200/50">
                    <CartContent />
                </div>

                {/* 3. MOBILE FLOATING CART BAR (Visible on Mobile Only) */}
                <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
                    <Sheet open={isMobileCartOpen} onOpenChange={setIsMobileCartOpen}>
                        <SheetTrigger asChild>
                            <Button
                                size="lg"
                                className="w-full h-14 rounded-full shadow-2xl bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-between px-6 border border-slate-800"
                            >
                                <div className="flex items-center gap-2">
                                    <div className="bg-white/20 px-2 py-1 rounded-md text-xs font-bold text-white">
                                        {items.length}
                                    </div>
                                    <span className="text-sm font-medium text-slate-200">Items</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold">{formatRupiah(grandTotal)}</span>
                                    <ShoppingCart size={18} className="text-emerald-400" />
                                </div>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="bottom" className="h-[85vh] p-0 rounded-t-3xl overflow-hidden">
                            <CartContent />
                        </SheetContent>
                    </Sheet>
                </div>

            </div>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                totalAmount={grandTotal}
                selectedCustomer={selectedCustomer}
                onConfirm={() => {
                    setIsPaymentModalOpen(false);
                    clearCart();
                    setSelectedCustomer(null);
                }}
            />
        </div>
    );
}

