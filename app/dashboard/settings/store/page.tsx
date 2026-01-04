import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { updateTenantProfile } from "@/actions/settings";
import { Save } from "lucide-react";
import { redirect } from "next/navigation";

export default async function SettingsStorePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: profile } = await supabase.from('profiles').select('tenant_id').eq('id', user.id).single();

    if (!profile?.tenant_id) return <div>No linked tenant found.</div>;

    const { data: tenant } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', profile.tenant_id)
        .single();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">Store Settings</h2>
                <p className="text-slate-500">Manage your business profile and contact information.</p>
            </div>

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
        </div>
    );
}
