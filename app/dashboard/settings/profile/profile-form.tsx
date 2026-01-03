"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { updateProfileInfo, changePassword } from "./actions";
import { useToast } from "@/components/ui/use-toast";
import { User, Lock, Save, KeyRound } from "lucide-react";

interface ProfileFormProps {
    user: {
        id: string;
        email?: string;
    };
    profile: {
        full_name: string | null;
        role: string | null;
    } | null;
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
    const { toast } = useToast();
    const [loadingInfo, setLoadingInfo] = useState(false);
    const [loadingPass, setLoadingPass] = useState(false);

    async function handleInfoSubmit(formData: FormData) {
        setLoadingInfo(true);
        try {
            const result = await updateProfileInfo(formData);
            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Profile information updated.",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setLoadingInfo(false);
        }
    }

    async function handlePasswordSubmit(formData: FormData) {
        setLoadingPass(true);
        try {
            const result = await changePassword(formData);
            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Password changed successfully.",
                });
                // Optional: clear form
                (document.getElementById("passwordForm") as HTMLFormElement)?.reset();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setLoadingPass(false);
        }
    }

    return (
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="general" className="gap-2"><User size={16} /> General</TabsTrigger>
                <TabsTrigger value="security" className="gap-2"><Lock size={16} /> Security</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6">
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle>General Information</CardTitle>
                        <CardDescription>
                            Update your personal details here.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={handleInfoSubmit} className="space-y-4 max-w-lg">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" value={user.email || ''} disabled className="bg-slate-50 text-slate-500" />
                                <p className="text-[10px] text-slate-400">Email cannot be changed directly.</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="fullName">Full Name</Label>
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    defaultValue={profile?.full_name || ''}
                                    placeholder="Your Name"
                                    required
                                />
                            </div>
                            <div className="pt-2">
                                <Button type="submit" disabled={loadingInfo} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                    {loadingInfo ? "Saving..." : <><Save size={16} className="mr-2" /> Save Changes</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>
                            Manage your password and account access.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form id="passwordForm" action={handlePasswordSubmit} className="space-y-4 max-w-lg">
                            <div className="space-y-2">
                                <Label htmlFor="newPassword">New Password</Label>
                                <Input id="newPassword" name="newPassword" type="password" required minLength={6} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
                            </div>
                            <div className="pt-2">
                                <Button type="submit" disabled={loadingPass} variant="destructive">
                                    {loadingPass ? "Updating..." : <><KeyRound size={16} className="mr-2" /> Update Password</>}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}
