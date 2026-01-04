import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StaffDialog } from "@/components/settings/staff-dialog";
import { redirect } from "next/navigation";

export default async function SettingsStaffPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();

    if (!profile?.tenant_id) return <div>No linked tenant found.</div>;

    // Fetch Staff
    const { data: staff } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: true });

    // Fetch Outlets (Required for Staff Dialog Assignment)
    const { data: outlets } = await supabase
        .from('outlets')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('name');

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Staff Management</h2>
                <p className="text-slate-500">Manage access and roles for your team members.</p>
            </div>

            <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Team Members</CardTitle>
                        <CardDescription>
                            Manage who has access to your store backend.
                        </CardDescription>
                    </div>
                    <StaffDialog outlets={outlets || []} />
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {staff?.map((member) => (
                                <TableRow key={member.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-medium text-slate-900">
                                        {member.full_name || 'Unknown'}
                                        {member.id === user.id && <span className="text-slate-400 font-normal ml-2">(You)</span>}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {member.role || 'Staff'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                                            Active
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
