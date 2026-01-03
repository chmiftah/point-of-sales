"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STAFF = [
    { id: 1, name: "John Doe", role: "Manager", outlet: "Main Branch", status: "Active" },
    { id: 2, name: "Jane Smith", role: "Cashier", outlet: "Main Branch", status: "Active" },
    { id: 3, name: "Mike Ross", role: "Cashier", outlet: "Downtown", status: "Inactive" },
];

export default function StaffPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Staff Members</h2>
                    <p className="text-muted-foreground">Manage access and roles.</p>
                </div>
                <Button className="gap-2"><Plus size={16} /> Add Staff</Button>
            </div>

            <div className="glass rounded-xl border border-white/10 overflow-hidden">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="hover:bg-transparent border-white/10">
                            <TableHead>Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Outlet</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {STAFF.map((member) => (
                            <TableRow key={member.id} className="hover:bg-white/5 border-white/5">
                                <TableCell className="font-medium flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                                        {member.name.charAt(0)}
                                    </div>
                                    {member.name}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-1">
                                        {member.role === 'Manager' && <Shield size={12} className="text-yellow-500" />}
                                        {member.role}
                                    </div>
                                </TableCell>
                                <TableCell>{member.outlet}</TableCell>
                                <TableCell>
                                    <Badge variant={member.status === 'Active' ? 'default' : 'secondary'} className={member.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>
                                        {member.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button variant="link" size="sm">Manage</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
