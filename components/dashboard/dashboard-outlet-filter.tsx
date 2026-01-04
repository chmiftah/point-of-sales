"use client";

import { useRouter, useSearchParams } from "next/navigation";
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

interface DashboardOutletFilterProps {
    outlets: Outlet[];
    userRole?: string;
    currentOutletId?: string | null;
}

export function DashboardOutletFilter({ outlets, userRole, currentOutletId }: DashboardOutletFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. Visibility Check: Only Owners need this filter
    if (userRole !== 'owner') {
        // Option: Render a badge showing the current (locked) outlet name?
        // For now, return null as requested, to keep UI clean for staff.
        return null;
    }

    // 2. Handle Change
    const handleValueChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());

        if (value === 'all') {
            params.delete('outletId');
        } else {
            params.set('outletId', value);
        }

        // Push new URL (triggers server re-render)
        router.push(`?${params.toString()}`);
    };

    // 3. Determine Display Value
    // If currentOutletId is null/undefined, it means "All"
    const displayValue = currentOutletId || 'all';

    return (
        <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 text-muted-foreground px-2">
                <Store size={16} />
                <span className="text-sm font-medium">Filter:</span>
            </div>
            <Select value={displayValue} onValueChange={handleValueChange}>
                <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="All Outlets" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Semua Outlet (All)</SelectItem>
                    {outlets.map((outlet) => (
                        <SelectItem key={outlet.id} value={outlet.id}>
                            {outlet.name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
