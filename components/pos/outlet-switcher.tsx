"use client";

import { useRouter } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Store } from "lucide-react";

interface Outlet {
    id: string;
    name: string;
}

interface OutletSwitcherProps {
    outlets: Outlet[];
    currentOutletId: string;
    userRole: string; // 'owner' | 'staff' etc
}

export function OutletSwitcher({ outlets, currentOutletId, userRole }: OutletSwitcherProps) {
    const router = useRouter();

    // Only Owners can see this
    if (userRole !== 'owner') {
        return null;
    }

    const handleChange = (value: string) => {
        // Navigating to the same page with a query param triggers a filtered server-side fetch
        // This effectively "switches" the POS context
        router.push(`/pos?outletId=${value}`);
    };

    const currentOutletName = outlets.find(o => o.id === currentOutletId)?.name || "Select Outlet";

    return (
        <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-slate-500 bg-slate-100/50 px-3 py-1.5 rounded-full border border-slate-200/50">
                <Store size={14} />
                <span className="text-xs font-semibold uppercase tracking-wider">Mode:</span>
            </div>

            <Select value={currentOutletId} onValueChange={handleChange}>
                <SelectTrigger className="w-[180px] h-9 bg-white border-slate-200 text-slate-900 shadow-sm focus:ring-emerald-500/20">
                    <SelectValue>{currentOutletName}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {outlets.map((outlet) => (
                        <SelectItem key={outlet.id} value={outlet.id} className="cursor-pointer">
                            {outlet.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
