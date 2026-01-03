"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Outlet {
    id: string;
    name: string;
}

interface OutletFilterProps {
    outlets: Outlet[];
    currentOutletId: string;
    disabled?: boolean;
}

export function OutletFilter({ outlets, currentOutletId, disabled }: OutletFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set('outletId', value);
        } else {
            params.delete('outletId');
        }
        // Reset page when filter changes
        params.set('page', '1');

        router.push(`?${params.toString()}`);
    };

    if (disabled) return null;

    return (
        <div className="flex items-center gap-2">
            <Label className="text-sm font-medium text-slate-700 whitespace-nowrap">Store Location:</Label>
            <Select value={currentOutletId} onValueChange={handleChange}>
                <SelectTrigger className="w-[200px] bg-white border-slate-200 shadow-sm">
                    <SelectValue placeholder="Select Outlet" />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200">
                    {/* Optional: 'All' option if we want global view back, but user asked for specific Context */}
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
