"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { formatRupiah } from "@/lib/utils";

// Mock Data for Charts (Simulating Weekly Data)
// Ideally, we pass this from the server too, but for now, static data for visuals is fine or we can enhance later.
interface ChartData {
    name: string;
    total: number;
}

interface TopProduct {
    name: string;
    sales: number;
    revenue: number;
}

interface DashboardChartsProps {
    revenueData: ChartData[];
    topProducts: TopProduct[];
}

export function DashboardCharts({ revenueData, topProducts }: DashboardChartsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-7">
            <Card className="col-span-4 glass border-white/10">
                <CardHeader>
                    <CardTitle>Overview</CardTitle>
                    <CardDescription>Sales performance this month.</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={revenueData}>
                            <XAxis
                                dataKey="name"
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#888888"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `Rp${(value / 1000).toFixed(0)}k`}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: '#333', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                formatter={(value: any) => formatRupiah(value)}
                            />
                            <Bar dataKey="total" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-blue-500" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="col-span-3 glass border-white/10">
                <CardHeader>
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription>Best selling items.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {topProducts.length > 0 ? topProducts.map((item, i) => (
                            <div key={i} className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">{item.name}</p>
                                    <p className="text-sm text-muted-foreground">{item.sales} sales</p>
                                </div>
                                <div className="ml-auto font-medium">{formatRupiah(item.revenue)}</div>
                            </div>
                        )) : (
                            <p className="text-muted-foreground text-sm">No sales data yet.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
