import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateTenantProfile } from "@/actions/settings";
import { Store, Users, Save, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OutletDialog } from "@/components/settings/outlet-dialog";

export default async function SettingsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return <div>Unauthorized</div>;

    // 1. Fetch Tenant Info
    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();

    if (!profile?.tenant_id) return <div>No linked tenant found.</div>;

    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();

    // 2. Fetch Staff
    const { data: staff } = await supabase
        .from('profiles')
        .select('*')
        .eq('tenant_id', profile.tenant_id);

    // 3. Fetch Outlets
    const { data: outlets } = await supabase
        .from('outlets')
        .select('*')
        .eq('tenant_id', profile.tenant_id)
        .order('created_at', { ascending: true });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Settings</h2>
                <p className="text-slate-500">Manage your store details, outlets, and team.</p>
            </div>

            <Tabs defaultValue="outlets" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general" className="gap-2"><Store size={16} /> General</TabsTrigger>
                    <TabsTrigger value="outlets" className="gap-2"><MapPin size={16} /> Outlets</TabsTrigger>
                    <TabsTrigger value="staff" className="gap-2"><Users size={16} /> Staff</TabsTrigger>
                </TabsList>

                <TabsContent value="general">
                    <Card className="border-slate-200 shadow-sm bg-white">
                        <CardHeader>
                            <CardTitle>Store Information</CardTitle>
                            <CardDescription>
                                This information will appear on your receipts and invoices.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form action={updateTenantProfile} className="space-y-4 max-w-lg">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Store Name</Label>
                                    <Input id="name" name="name" defaultValue={tenant?.name} required placeholder="My Store" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input id="phone" name="phone" defaultValue={tenant?.phone} placeholder="+62..." />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address">Address</Label>
                                    <Textarea id="address" name="address" defaultValue={tenant?.address} placeholder="Store full address" className="min-h-[100px]" />
                                </div>
                                <div className="pt-4">
                                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                        <Save size={16} className="mr-2" /> Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="outlets">
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
                </TabsContent>

                <TabsContent value="staff">
                    <Card className="border-slate-200 shadow-sm bg-white">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Team Members</CardTitle>
                                <CardDescription>
                                    Manage who has access to your store backend.
                                </CardDescription>
                            </div>
                            <Button variant="outline">Invite Staff (Pro)</Button>
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
                </TabsContent>
            </Tabs>
        </div>
    );
}
