import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, User } from "lucide-react";
import Link from "next/link";
import { CustomerDialog } from "@/components/customers/customer-dialog";

export default async function CustomersPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Unauthorized</div>;

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();
    if (!profile?.tenant_id) return <div>No tenant found</div>;

    const resolvedParams = await searchParams;
    const query = resolvedParams?.q || '';

    let customersQuery = supabase
        .from('customers')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: false });

    if (query) {
        customersQuery = customersQuery.or(`name.ilike.%${query}%,phone.ilike.%${query}%`);
    }

    const { data: customers } = await customersQuery;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Customers</h2>
                    <p className="text-slate-500">Manage your customer base and view history.</p>
                </div>
                <CustomerDialog />
            </div>

            <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="pb-4">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                        <Input
                            placeholder="Search by name or phone..."
                            className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                        // Client-side search implementation would go here or use a form for server search
                        // For MVP, we assume URL param drive which acts as server search if implemented with form
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Total Spent</TableHead>
                                <TableHead>Join Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customers?.map((customer) => (
                                <TableRow key={customer.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium text-slate-900">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <div className="font-semibold">{customer.name}</div>
                                                <div className="text-xs text-slate-500">{customer.email || '-'}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {customer.phone || '-'}
                                    </TableCell>
                                    <TableCell className="text-emerald-600 font-medium">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(customer.total_spent || 0)}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {new Date(customer.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/dashboard/customers/${customer.id}`}>
                                                View History
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!customers || customers.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                                        No customers found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
