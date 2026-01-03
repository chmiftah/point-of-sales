
import React from 'react';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen w-full overflow-hidden">
            {/* Visual Side (Left) - 3D Abstract Placeholder */}
            <div className="hidden lg:flex w-1/2 bg-black relative items-center justify-center overflow-hidden">
                {/* Abstract Gradient Blob */}
                <div className="absolute w-[800px] h-[800px] bg-gradient-to-tr from-purple-600/30 to-blue-600/30 rounded-full blur-[120px] animate-pulse" />
                <div className="relative z-10 p-12 text-white">
                    <h1 className="text-6xl font-bold tracking-tighter mb-4">POS Expert.</h1>
                    <p className="text-xl text-white/60">The future of retail transaction processing.</p>
                    {/* Glass Card visual */}
                    <div className="mt-12 w-[400px] h-[250px] glass rounded-2xl p-6 border border-white/10 rotate-[-5deg] hover:rotate-0 transition-all duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <div className="w-12 h-12 rounded-full bg-white/20" />
                            <div className="text-sm font-mono text-white/50">VISA **** 4242</div>
                        </div>
                        <div className="text-4xl font-bold">$12,450.00</div>
                        <div className="mt-2 text-sm text-green-400">+15% vs last month</div>
                    </div>
                </div>
            </div>

            {/* Form Side (Right) - Scrollable Area */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background relative">
                <div className="absolute inset-0 z-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

                {/* Anti-gravity subtle background orb */}
                <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px]" />

                <div className="relative z-10 w-full max-w-md">
                    {children}
                </div>
            </div>
        </div>
    );
}
