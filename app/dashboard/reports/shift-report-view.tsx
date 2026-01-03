"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatRupiah, cn } from "@/lib/utils";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ShiftSession {
    id: string;
    cashier_name: string;
    started_at: string;
    ended_at: string | null;
    opening_cash: number;
    system_expected_cash: number; // Calculated or from DB
    actual_closing_cash: number | null;
}

interface ShiftReportViewProps {
    shifts: ShiftSession[];
}

export function ShiftReportView({ shifts }: ShiftReportViewProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Shift Audits</CardTitle>
                <CardDescription>Cash control and register closures</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Shift Time</TableHead>
                            <TableHead>Cashier</TableHead>
                            <TableHead className="text-right">Opening Cash</TableHead>
                            <TableHead className="text-right">System Expected</TableHead>
                            <TableHead className="text-right">Actual Closing</TableHead>
                            <TableHead className="text-right">Difference</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shifts.map((shift) => {
                            const isEnded = !!shift.ended_at && shift.actual_closing_cash !== null;
                            const difference = isEnded ? (shift.actual_closing_cash || 0) - shift.system_expected_cash : 0;
                            const isBalanced = difference === 0;
                            const isShort = difference < 0;

                            return (
                                <TableRow key={shift.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium text-foreground">
                                                {new Date(shift.started_at).toLocaleString('id-ID', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                            {shift.ended_at && (
                                                <span className="text-xs text-muted-foreground">
                                                    to {new Date(shift.ended_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{shift.cashier_name}</TableCell>
                                    <TableCell className="text-right">{formatRupiah(shift.opening_cash)}</TableCell>
                                    <TableCell className="text-right text-muted-foreground">
                                        {formatRupiah(shift.system_expected_cash)}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {shift.actual_closing_cash !== null ? (
                                            <span className="font-medium text-foreground">{formatRupiah(shift.actual_closing_cash)}</span>
                                        ) : (
                                            <Badge variant="outline" className="text-xs">Active</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {isEnded ? (
                                            isBalanced ? (
                                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200 hover:bg-emerald-500/20">
                                                    Balanced
                                                </Badge>
                                            ) : (
                                                <span className={cn("font-bold text-xs", isShort ? "text-red-500" : "text-blue-500")}>
                                                    {isShort ? "Minus " : "Plus "} {formatRupiah(Math.abs(difference))}
                                                </span>
                                            )
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                            <Eye size={16} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {shifts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-48 text-muted-foreground">
                                    No shift data available for this period.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
