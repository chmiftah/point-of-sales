import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ProfileForm from "./profile-form";
import { Store, MapPin } from "lucide-react";

export default async function ProfilePage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return <div className="p-6">Unauthorized</div>;
    }

    // Fetch Profile with specific joins
    const { data: profile } = await supabase
        .from('profiles')
        .select(`
            full_name, 
            role, 
            outlet_id, 
            tenant_id,
            outlets ( name ),
            tenants ( name )
        `)
        .eq('id', user.id)
        .single();

    // Type casting/checking for safe access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const safeProfile = profile as any;
    const userOutletName = safeProfile?.outlets?.name;
    const userTenantName = safeProfile?.tenants?.name;

    const userInitials = (profile?.full_name || user.email || 'U').substring(0, 2).toUpperCase();

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">User Profile</h2>
                <p className="text-slate-500">Manage your account settings and preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Left Column: Profile Card */}
                <div className="md:col-span-1">
                    <Card className="border-slate-200 shadow-sm bg-white sticky top-6">
                        <CardHeader className="text-center pb-2">
                            <div className="mx-auto w-24 h-24 mb-4">
                                <Avatar className="w-24 h-24">
                                    <AvatarImage src="" />
                                    <AvatarFallback className="text-2xl bg-slate-100 text-slate-600">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <CardTitle>{profile?.full_name || 'User'}</CardTitle>
                            <CardDescription>{user.email}</CardDescription>

                            <div className="flex justify-center mt-2">
                                <Badge variant="outline" className="capitalize border-slate-200 text-slate-600 bg-slate-50">
                                    {profile?.role || 'Staff'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4 border-t border-slate-100 mt-4">
                            {userOutletName && (
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-md">
                                        <MapPin size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Assigned Branch</p>
                                        <p>{userOutletName}</p>
                                    </div>
                                </div>
                            )}

                            {profile?.role === 'owner' && userTenantName && (
                                <div className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-md">
                                        <Store size={16} />
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">Managing Store</p>
                                        <p>{userTenantName}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Edit Forms */}
                <div className="md:col-span-2">
                    <ProfileForm
                        user={{ id: user.id, email: user.email }}
                        profile={{ full_name: profile?.full_name, role: profile?.role }}
                    />
                </div>
            </div>
        </div>
    );
}
