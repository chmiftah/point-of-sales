"use client";

import { Button } from "@/components/ui/button";
import { Plus, MapPin } from "lucide-react";

export default function OutletsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Outlet Settings</h2>
                    <p className="text-muted-foreground">Manage your physical store locations.</p>
                </div>
                <Button className="gap-2"><Plus size={16} /> Add Outlet</Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="glass p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50"><MapPin size={48} /></div>
                    <h3 className="text-xl font-bold mb-2">Main Branch</h3>
                    <p className="text-muted-foreground text-sm mb-4">123 Coffee Street, NYC</p>
                    <div className="flex gap-2">
                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">Active</span>
                        <span className="text-xs bg-blue-500/10 text-blue-500 px-2 py-1 rounded">HQ</span>
                    </div>
                </div>

                <div className="glass p-6 rounded-xl border border-white/10 hover:border-primary/50 transition-colors cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-50"><MapPin size={48} /></div>
                    <h3 className="text-xl font-bold mb-2">Downtown Pop-up</h3>
                    <p className="text-muted-foreground text-sm mb-4">456 Metro Station, NYC</p>
                    <div className="flex gap-2">
                        <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded">Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
