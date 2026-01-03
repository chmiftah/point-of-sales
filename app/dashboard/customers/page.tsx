"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const CUSTOMERS = [
    { id: 1, name: "Alice Wonderland", email: "alice@example.com", points: 120, totalSpent: 450.00 },
    { id: 2, name: "Bob Builder", email: "bob@example.com", points: 50, totalSpent: 120.00 },
];

export default function CustomersPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Customers</h2>
                    <p className="text-muted-foreground">Loyalty program and customer data.</p>
                </div>
                <Button className="gap-2"><Plus size={16} /> Add Customer</Button>
            </div>

            <div className="glass rounded-xl border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/10">
                            <TableHead>Client Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Loyalty Points</TableHead>
                            <TableHead className="text-right">Total Spent</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {CUSTOMERS.map((cust) => (
                            <TableRow key={cust.id} className="hover:bg-white/5 border-white/5">
                                <TableCell className="font-medium">{cust.name}</TableCell>
                                <TableCell>{cust.email}</TableCell>
                                <TableCell><span className="text-yellow-500 font-bold">{cust.points} pts</span></TableCell>
                                <TableCell className="text-right font-mono">${cust.totalSpent.toFixed(2)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
