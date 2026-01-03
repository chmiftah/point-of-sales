import { create } from 'zustand';

export interface Product {
    id: string;
    name: string;
    price: number;
    image?: string; // Optional
    stock?: number; // Available stock
}

export interface CartItem extends Product {
    quantity: number;
}

export interface Tax {
    id: string;
    name: string;
    rate: number;
    isActive: boolean;
}

export interface Discount {
    type: 'percent' | 'fixed';
    value: number;
}

export interface CartSummary {
    subtotal: number;
    discountAmount: number;
    taxableAmount: number;
    totalTaxAmount: number;
    grandTotal: number;
}

interface CartState {
    items: CartItem[];
    globalDiscount: Discount;
    customTaxes: Tax[];

    addItem: (product: Product) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;

    setGlobalDiscount: (type: 'percent' | 'fixed', value: number) => void;
    toggleTax: (taxId: string) => void;

    // Computation
    getSummary: () => CartSummary;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    globalDiscount: { type: 'percent', value: 0 },
    customTaxes: [
        { id: 'ppn', name: 'PPN', rate: 0.11, isActive: true },
        { id: 'service', name: 'Service Charge', rate: 0.05, isActive: false },
    ],

    addItem: (product) => set((state) => {
        const existingItem = state.items.find((item) => item.id === product.id);
        if (existingItem) {
            return {
                items: state.items.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                ),
            };
        }
        return { items: [...state.items, { ...product, quantity: 1 }] };
    }),

    removeItem: (productId) => set((state) => ({
        items: state.items.filter((item) => item.id !== productId),
    })),

    updateQuantity: (productId, quantity) => set((state) => ({
        items: state.items.map((item) =>
            item.id === productId ? { ...item, quantity: Math.max(0, quantity) } : item
        ),
    })),

    clearCart: () => set({ items: [] }),

    setGlobalDiscount: (type, value) => set({ globalDiscount: { type, value } }),

    toggleTax: (taxId) => set((state) => ({
        customTaxes: state.customTaxes.map(tax =>
            tax.id === taxId ? { ...tax, isActive: !tax.isActive } : tax
        )
    })),

    getSummary: () => {
        const { items, globalDiscount, customTaxes } = get();

        // 1. Subtotal
        const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

        // 2. Discount
        let discountAmount = 0;
        if (globalDiscount.type === 'percent') {
            discountAmount = subtotal * (globalDiscount.value / 100);
        } else {
            discountAmount = globalDiscount.value;
        }
        // Ensure discount doesn't exceed subtotal
        discountAmount = Math.min(discountAmount, subtotal);

        // 3. Taxable Amount
        const taxableAmount = subtotal - discountAmount;

        // 4. Taxes
        // Commonly PPN is on the price AFTER discount, but sometimes before. 
        // User prompt says: "taxableAmount: subtotal - discountAmount" -> "totalTaxAmount: Sum...". 
        // So taxes are applied on the discounted amount.
        const activeTaxes = customTaxes.filter(t => t.isActive);
        const totalTaxAmount = activeTaxes.reduce((total, tax) => {
            return total + (taxableAmount * tax.rate);
        }, 0);

        // 5. Grand Total
        const grandTotal = taxableAmount + totalTaxAmount;

        return {
            subtotal,
            discountAmount,
            taxableAmount,
            totalTaxAmount,
            grandTotal
        };
    }
}));
