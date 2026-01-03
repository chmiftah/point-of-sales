"use client";

import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, User, Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { createCustomer } from "@/actions/customers"; // Reusing the server action
import { useToast } from "@/components/ui/use-toast";

interface Customer {
    id: string;
    name: string;
    phone: string | null;
}

interface CustomerSelectorProps {
    selectedCustomer: Customer | null;
    onSelectCustomer: (customer: Customer | null) => void;
}

export function CustomerSelector({ selectedCustomer, onSelectCustomer }: CustomerSelectorProps) {
    const [open, setOpen] = useState(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [query, setQuery] = useState("");
    const [loading, setLoading] = useState(false);

    // Quick Create State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newCustomerName, setNewCustomerName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const { toast } = useToast();

    // Fetch customers (Simple client-side fetch for MVP - optimizing for small business size)
    // Ideally this should be a server search if list is huge.
    useEffect(() => {
        if (open) {
            const fetchCustomers = async () => {
                setLoading(true);
                const supabase = createClient();
                // Fetch basic info for selector
                const { data } = await supabase
                    .from('customers')
                    .select('id, name, phone')
                    .order('created_at', { ascending: false })
                    .limit(50); // Limit for performance

                if (data) {
                    setCustomers(data);
                }
                setLoading(false);
            };
            fetchCustomers();
        }
    }, [open]);

    // Handle Quick Create
    async function handleCreateCustomer(formData: FormData) {
        setIsCreating(true);
        try {
            const result = await createCustomer(formData);
            if (result.error) {
                toast({
                    title: "Error",
                    description: result.error,
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Success",
                    description: "Customer created and selected.",
                });

                // Fetch the newly created customer to select it
                // Since we don't get the ID back from simple action, we might need to fetch by phone/name or update action.
                // For now, let's just close and maybe refetch or optimistically update if we had ID.
                // Wait, server action `createCustomer` returns { success: true }. 
                // Let's modify the action separately if we want the ID, but for now let's just search for it or re-fetch.
                // Better UX: Reuse fetch logic

                const supabase = createClient();
                const { data } = await supabase
                    .from('customers')
                    .select('id, name, phone')
                    .eq('phone', formData.get('phone'))
                    .single();

                if (data) {
                    onSelectCustomer(data);
                    setCustomers(prev => [data, ...prev]);
                }

                setDialogOpen(false);
                setOpen(false);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong.",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <div className="w-full p-2">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn("w-full p-4 justify-between h-12 bg-white border-slate-200 hover:bg-slate-50", !selectedCustomer && "text-slate-500")}
                    >
                        {selectedCustomer ? (
                            <div className="flex flex-col items-start overflow-hidden">
                                <span className="font-semibold text-slate-900 leading-tight">{selectedCustomer.name}</span>
                                {selectedCustomer.phone && <span className="text-[10px] text-slate-500 leading-tight">{selectedCustomer.phone}</span>}
                            </div>
                        ) : (
                            <span className="flex items-center gap-2"><User size={16} /> Select Customer...</span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <div className="flex items-center border-b px-3" cmdk-input-wrapper="">
                            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                            <input
                                className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Search customer..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                        <CommandList>
                            <CommandEmpty className="py-2 px-2">
                                <p className="text-sm text-slate-500 mb-2 text-center">No customer found.</p>
                                <Button
                                    size="sm"
                                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                    onClick={() => {
                                        setNewCustomerName(query);
                                        setDialogOpen(true);
                                    }}
                                >
                                    <Plus size={14} className="mr-1" /> Create "{query}"
                                </Button>
                            </CommandEmpty>
                            <CommandGroup heading="Recent Customers">
                                {customers
                                    .filter(c => c.name.toLowerCase().includes(query.toLowerCase()) || (c.phone && c.phone.includes(query)))
                                    .map((customer) => (
                                        <CommandItem
                                            key={customer.id}
                                            value={customer.name}
                                            onSelect={() => {
                                                onSelectCustomer(customer);
                                                setOpen(false);
                                            }}
                                            className="cursor-pointer"
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-medium">{customer.name}</span>
                                                <span className="text-xs text-slate-500">{customer.phone}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>

            {/* Quick Create Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Quick Add Customer</DialogTitle>
                        <DialogDescription>
                            Add a new customer to the database instantly.
                        </DialogDescription>
                    </DialogHeader>
                    <form action={handleCreateCustomer} className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="quick-name">Name</Label>
                            <Input id="quick-name" name="name" defaultValue={newCustomerName} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="quick-phone">Phone</Label>
                            <Input id="quick-phone" name="phone" placeholder="08..." required />
                        </div>
                        {/* Hidden fields if needed or simplified form */}
                        <DialogFooter>
                            <Button type="submit" disabled={isCreating} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                {isCreating ? "Saving..." : "Create & Select"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
