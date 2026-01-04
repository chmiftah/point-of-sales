import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OutletDialog } from "@/components/settings/outlet-dialog";
import { redirect } from "next/navigation";

export default async function SettingsOutletsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('tenant_id, outlet_id').eq('id', user.id).single();

    if (!profile?.tenant_id) return <div>No linked tenant found.</div>;

    const { data: outlets } = await supabase
        .from('outlets')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: true });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Outlets</h2>
                <p className="text-slate-500">Manage your physical store locations and branches.</p>
            </div>

            <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Outlets & Branches</CardTitle>
                        <CardDescription>
                            Manage your physical store locations.
                        </CardDescription>
                    </div>
                    <OutletDialog />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Outlet Name</TableHead>
                                <TableHead>Address</TableHead>
                                <TableHead>Phone</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {outlets?.map((outlet) => (
                                <TableRow key={outlet.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium text-slate-900">
                                        {outlet.name}
                                        {outlet.id === profile.outlet_id && <Badge variant="outline" className="ml-2 text-xs text-sky-600 border-sky-200 bg-sky-50">Current</Badge>}
                                    </TableCell>
                                    <TableCell className="text-slate-600 text-sm max-w-[300px] truncate">
                                        {outlet.address || '-'}
                                    </TableCell>
                                    <TableCell className="text-slate-600">
                                        {outlet.phone || '-'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <OutletDialog outlet={outlet} />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(!outlets || outlets.length === 0) && (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                                        No outlets found. Add your first branch.
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
