"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, Search, Eye, CreditCard, Banknote, QrCode } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn, formatRupiah } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TransactionSheet } from "./transaction-sheet";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Order {
    id: string;
    created_at: string;
    payment_method: string;
    status: string;
    total_amount: number;
    outlet_id: string;
    outlets?: {
        name: string;
        address?: string; // Optional if not fetched everywhere
    };
    tenants?: {
        name: string;
    };
}

interface Outlet {
    id: string;
    name: string;
}

interface TransactionTableProps {
    initialOrders: Order[];
    availableOutlets: Outlet[];
}

export function TransactionTable({ initialOrders, availableOutlets }: TransactionTableProps) {
    const [date, setDate] = useState<DateRange | undefined>({
        from: new Date(),
        to: new Date(),
    });
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedOutlet, setSelectedOutlet] = useState<string>("all");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    // Client-side filtering for demo (Server-side recommended for production with large data)
    // For now, we filter the initialOrders based on search query. 
    // Date filtering usually requires refetching or complex client logic. 
    // We'll implemented basic client filtering here.
    const filteredOrders = initialOrders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesOutlet = selectedOutlet === "all" || order.outlet_id === selectedOutlet;

        let matchesDate = true;
        if (date?.from && date?.to) {
            const orderDate = new Date(order.created_at);
            // reset times for comparison
            const start = new Date(date.from); start.setHours(0, 0, 0, 0);
            const end = new Date(date.to); end.setHours(23, 59, 59, 999);
            matchesDate = orderDate >= start && orderDate <= end;
        } else if (date?.from) {
            const orderDate = new Date(order.created_at);
            const start = new Date(date.from); start.setHours(0, 0, 0, 0);
            matchesDate = orderDate >= start;
        }

        return matchesSearch && matchesDate && matchesOutlet;
    });

    const getPaymentIcon = (method: string) => {
        switch (method.toLowerCase()) {
            case 'cash': return <Banknote size={16} className="text-emerald-500" />;
            case 'qris': return <QrCode size={16} className="text-blue-500" />;
            default: return <CreditCard size={16} className="text-purple-500" />;
        }
    };

    const handleRowClick = (order: Order) => {
        setSelectedOrder(order);
        setIsSheetOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search transaction ID..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Outlet Filter */}
                    <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="All Outlets" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Outlets</SelectItem>
                            {availableOutlets.map(outlet => (
                                <SelectItem key={outlet.id} value={outlet.id}>
                                    {outlet.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[260px] justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>

                    <Button variant="outline" className="gap-2 ml-auto sm:ml-0">
                        <Filter size={16} /> <span className="hidden sm:inline">Status</span>
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[180px]">Transaction ID</TableHead>
                            <TableHead>Outlet</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Payment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredOrders.length > 0 ? filteredOrders.map((tx) => (
                            <TableRow
                                key={tx.id}
                                className="cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => handleRowClick(tx)}
                            >
                                <TableCell className="font-mono text-xs text-muted-foreground">
                                    <span className="font-bold text-foreground">#{tx.id.slice(0, 8).toUpperCase()}</span>
                                    ...{tx.id.slice(-4)}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-normal">
                                        {tx.outlets?.name || 'Main'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-foreground">
                                    {new Date(tx.created_at).toLocaleString('id-ID', {
                                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                    })}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2 text-sm text-foreground">
                                        {getPaymentIcon(tx.payment_method)}
                                        <span className="capitalize">{tx.payment_method}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={
                                        tx.status === 'completed' ? 'default' :
                                            tx.status === 'pending' ? 'secondary' : 'destructive'
                                    } className="shadow-none rounded-full">
                                        {tx.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right font-bold font-mono tracking-tight text-foreground">
                                    {formatRupiah(tx.total_amount)}
                                </TableCell>
                                <TableCell>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <Eye size={16} />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-48 text-muted-foreground">
                                    <div className="flex flex-col items-center gap-2">
                                        <Search size={32} className="opacity-20" />
                                        <p>No transactions found matching your filter.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls Placeholder */}
            <div className="flex items-center justify-end gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" disabled>Next</Button>
            </div>

            <TransactionSheet
                open={isSheetOpen}
                onOpenChange={setIsSheetOpen}
                orderId={selectedOrder?.id || null}
                initialData={selectedOrder}
            />
        </div>
    );
}
