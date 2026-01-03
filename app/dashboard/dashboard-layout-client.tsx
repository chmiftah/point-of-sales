"use client";

import Link from "next/link";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/layout/user-nav";
import { AppSidebar } from "@/components/layout/app-sidebar";

export default function DashboardClientLayout({
    children,
    user
}: {
    children: React.ReactNode;
    user: any;
}) {
    // Identify user initials
    const fullName = user?.user_metadata?.full_name || "Owner";
    const email = user?.email || "owner@business.com";

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">

            {/* 1. Sidebar: Fixed width (handled inside AppSidebar or just placed here) */}
            {/* The AppSidebar component has 'fixed w-64' internally for desktop */}
            <AppSidebar />

            {/* 2. Main Wrapper: Takes remaining space, Handles Scrolling */}
            {/* ml-64 to offset the fixed sidebar */}
            <div className="flex-1 flex flex-col h-full overflow-hidden lg:ml-64 transition-all duration-300">

                {/* Header: Stays at top */}
                <header className="h-16 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-8 shrink-0 z-40">
                    <div className="flex items-center gap-2 lg:hidden ml-10">
                        {/* Spacer for mobile menu button which is absolute positioned in sidebar component */}
                        <span className="font-semibold">Dashboard</span>
                    </div>
                    <h2 className="text-lg font-semibold hidden lg:block">Dashboard</h2>

                    <div className="flex items-center gap-4">
                        <Link href="/pos">
                            <Button size="sm" className="hidden sm:flex bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20">
                                <Store size={16} className="mr-2" />
                                Open POS
                            </Button>
                        </Link>
                        <UserNav
                            user={{
                                name: fullName,
                                email: email,
                                role: 'Owner'
                            }}
                        />
                    </div>
                </header>

                {/* Scrollable Content Area */}
                {/* overflow-y-auto ensures THIS container scrolls, not the body */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/20">
                    <div className="max-w-7xl mx-auto space-y-8 pb-10">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}

