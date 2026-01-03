"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingCart, Users, Package, BarChart3, Receipt, Settings, Menu, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { cn } from "@/lib/utils";

const MENU_ITEMS = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: Receipt, label: "Transactions", href: "/dashboard/transactions" },
    { icon: BarChart3, label: "Reports", href: "/dashboard/reports" },
    {
        label: "Inventory",
        icon: Package,
        children: [
            { label: "Products", href: "/dashboard/inventory/products" },
            { label: "Categories", href: "/dashboard/inventory/categories" },
            { label: "Stocks", href: "/dashboard/inventory/stocks" },
            { label: "Suppliers", href: "/dashboard/inventory/suppliers" },
            { label: "Purchase Orders", href: "/dashboard/inventory/purchase-orders" },
        ]
    },
    { icon: Users, label: "Customers", href: "/dashboard/customers" },
    { icon: Users, label: "Staff", href: "/dashboard/staff" },
    { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function AppSidebar() {
    const pathname = usePathname();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const NavContent = () => (
        <div className="flex flex-col h-full py-4 bg-card text-card-foreground border-r">
            <div className="px-6 mb-8 flex items-center gap-2">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-primary" />
                </div>
                <div>
                    <h1 className="text-xl font-bold tracking-tight">POS Expert</h1>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Enterprise</p>
                </div>
            </div>
            <ScrollArea className="flex-1 px-4">
                <nav className="space-y-1">
                    {MENU_ITEMS.map((item, index) => {
                        if (item.children) {
                            return (
                                <div key={index} className="py-2">
                                    <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                        {/* <item.icon size={14} /> */}
                                        {item.label}
                                    </div>
                                    <div className="ml-2 space-y-1 pl-2 border-l border-border/50">
                                        {item.children.map(child => (
                                            <Link
                                                key={child.href}
                                                href={child.href}
                                                className={cn(
                                                    "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                                    pathname === child.href
                                                        ? 'bg-primary/10 text-primary'
                                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                                )}
                                            >
                                                {child.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            );
                        }
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                                    pathname === item.href
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                )}
                            >
                                <item.icon size={18} />
                                {item.label}
                            </Link>
                        )
                    })}
                </nav>
            </ScrollArea>
            <div className="p-4 border-t">
                <Link href="/pos">
                    <Button className="w-full gap-2" variant="default">
                        <ShoppingCart size={16} /> Open POS
                    </Button>
                </Link>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop Sidebar: Fixed Position */}
            <div className="hidden lg:block fixed left-0 top-0 bottom-0 w-64 z-50">
                <NavContent />
            </div>

            {/* Mobile Sidebar */}
            <div className="lg:hidden absolute top-4 left-4 z-50">
                <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="md:hidden">
                            <Menu />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 w-64">
                        <NavContent />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}
