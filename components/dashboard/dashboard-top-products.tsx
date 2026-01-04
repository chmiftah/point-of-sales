import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface TopProduct {
    id: string;
    name: string;
    image_url: string | null;
    category: string;
    totalSold: number;
    totalRevenue: number;
}

interface DashboardTopProductsProps {
    products: TopProduct[];
}

export function DashboardTopProducts({ products }: DashboardTopProductsProps) {
    const formatRupiah = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Card className="glass border-white/10 h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    Top Products
                </CardTitle>
                <CardDescription>
                    Best selling items this month based on quantity.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-6">
                    {products.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            No sales data available for this month.
                        </div>
                    ) : (
                        products.map((product, index) => (
                            <div key={product.id} className="flex items-center justify-between group hover:bg-slate-50/50 p-2 rounded-lg transition-colors -mx-2">
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                                        ${index === 0 ? "bg-yellow-100 text-yellow-700" :
                                            index === 1 ? "bg-slate-100 text-slate-700" :
                                                index === 2 ? "bg-orange-100 text-orange-700" : "bg-slate-50 text-slate-500"}
                                    `}>
                                        #{index + 1}
                                    </div>
                                    <Avatar className="h-10 w-10 border border-slate-200">
                                        <AvatarImage src={product.image_url || "/placeholder.png"} alt={product.name} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                            {product.name.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">{product.name}</p>
                                        <p className="text-xs text-muted-foreground">{product.category || 'Uncategorized'}</p>
                                    </div>
                                </div>
                                <div className="text-right space-y-1">
                                    <p className="text-sm font-bold">{product.totalSold} sold</p>
                                    <p className="text-xs text-muted-foreground font-mono">
                                        {formatRupiah(product.totalRevenue)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
