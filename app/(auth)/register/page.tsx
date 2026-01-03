"use client";

import { useActionState } from 'react';
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Store, User, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { signup } from "../actions";

export default function RegisterPage() {
    const [state, formAction, isPending] = useActionState(signup, null);

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full"
        >
            <Card className="glass border-0 shadow-2xl overflow-hidden">
                <CardHeader className="space-y-1 bg-white/5 border-b border-white/5 pb-6">
                    <CardTitle className="text-2xl font-bold tracking-tight">Setup Your Account</CardTitle>
                    <CardDescription>
                        Create your business workspace in seconds.
                    </CardDescription>
                </CardHeader>
                <form action={formAction}>
                    <CardContent className="grid gap-5 pt-6">
                        {state?.error && (
                            <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg border border-red-500/20 animate-in fade-in slide-in-from-top-2">
                                {state.error}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="businessName">Business Name</Label>
                            <div className="relative">
                                <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <Input
                                    id="businessName"
                                    name="businessName"
                                    placeholder="e.g. Kopi Kenangan"
                                    className="pl-10 glass bg-white/5 border-white/10 focus-visible:ring-emerald-500/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="fullName">Owner Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <Input
                                    id="fullName"
                                    name="fullName"
                                    placeholder="John Doe"
                                    className="pl-10 glass bg-white/5 border-white/10 focus-visible:ring-emerald-500/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="owner@business.com"
                                    className="pl-10 glass bg-white/5 border-white/10 focus-visible:ring-emerald-500/50"
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    className="pl-10 glass bg-white/5 border-white/10 focus-visible:ring-emerald-500/50"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4 bg-white/5 border-t border-white/5 pt-6">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 text-white font-bold h-11" disabled={isPending}>
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating Workspace...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>
                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 underline underline-offset-4">
                                Login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </motion.div>
    );
}
