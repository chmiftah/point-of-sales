import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Star, Zap, Shield, Store, BarChart3, Users, Package } from 'lucide-react';

export const metadata: Metadata = {
  title: 'POSPro - Aplikasi Kasir Multi-Cabang untuk Retail & F&B',
  description: 'Kelola bisnis retail dan F&B lebih mudah dengan POSPro. Satu aplikasi kasir modern untuk multi-cabang, manajemen stok real-time, dan laporan lengkap.',
  keywords: ['Aplikasi Kasir', 'POS Indonesia', 'Sistem Kasir Online', 'Manajemen Stok', 'Multi Outlet POS'],
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">POSPro</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-emerald-600 transition-colors">Fitur</Link>
            <Link href="#pricing" className="hover:text-emerald-600 transition-colors">Harga</Link>
            <Link href="#contact" className="hover:text-emerald-600 transition-colors">Kontak</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex text-slate-600 hover:text-emerald-600">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200" asChild>
              <Link href="/register">Coba Gratis</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
                <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl mb-6 leading-tight">
                  Kelola Bisnis Retail & F&B <span className="text-emerald-600">Lebih Mudah</span>
                </h1>
                <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                  Satu aplikasi kasir modern untuk semua kebutuhan: Multi-cabang, manajemen stok real-time, laporan lengkap, hingga manajemen pelanggan.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 px-8 text-base shadow-lg shadow-emerald-200/50" asChild>
                    <Link href="/register">Coba Sekarang Gratis</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="h-12 px-8 text-base border-slate-300 text-slate-700 hover:bg-slate-50">
                    Lihat Demo
                  </Button>
                </div>
                <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-1"><Check className="h-4 w-4 text-emerald-500" /> Setup 5 Menit</div>
                  <div className="flex items-center gap-1"><Check className="h-4 w-4 text-emerald-500" /> Tanpa Kartu Kredit</div>
                </div>
              </div>
              <div className="relative mx-auto w-full max-w-[600px] lg:max-w-none">
                <div className="relative aspect-[4/3] w-full rounded-xl bg-slate-100 border border-slate-200 shadow-2xl overflow-hidden flex items-center justify-center group">
                  <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100" />
                  {/* Placeholder Illustration */}
                  <div className="relative z-10 text-center space-y-4 p-8">
                    <div className="mx-auto h-20 w-20 bg-white rounded-2xl shadow-sm flex items-center justify-center border border-slate-100">
                      <BarChart3 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">[SCREENSHOT DASHBOARD POS]</p>
                      <p className="text-sm text-slate-500">Dashboard Interaktif dengan Grafik Penjualan</p>
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute -top-12 -right-12 h-40 w-40 bg-emerald-500/10 rounded-full blur-3xl opacity-50" />
                  <div className="absolute -bottom-12 -left-12 h-40 w-40 bg-blue-500/10 rounded-full blur-3xl opacity-50" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Banner */}
        <section className="border-y border-slate-100 bg-slate-50/50 py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg">Setup Cepat 5 Menit</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Langsung jualan tanpa instalasi rumit. Akses dari browser apa saja.</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-1">
                  <Store className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg">Support Multi-Device</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">PC, Tablet, atau Smartphone. POSPro siap menemani bisnis Anda.</p>
              </div>
              <div className="flex flex-col items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-1">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900 text-lg">Data Aman di Cloud</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Data tersimpan otomatis & aman. Tidak perlu takut kehilangan data.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section (Zig-Zag) */}
        <section id="features" className="py-24 space-y-24">
          {/* Feature 1: POS */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-2 md:order-1 space-y-6">
                <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
                  Point of Sale
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Transaksi Kasir Super Cepat Anti Ribet
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Antarmuka kasir yang intuitif. Dukung berbagai metode pembayaran (Tunai, Kartu, QRIS), fitur 'Hold Order', hingga mode kasir 'Guest' untuk kecepatan antrian.
                </p>
                <ul className="space-y-3">
                  {['Checkout dalam 3 klik', 'Support Barcode Scanner', 'Cetak Struk Otomatis'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-slate-700 font-medium">
                      <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">
                        <Check className="h-3 w-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="order-1 md:order-2">
                <div className="aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 shadow-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-50" />
                  <div className="relative z-10 text-center p-6">
                    <Store className="h-16 w-16 text-emerald-500 mx-auto mb-4 opacity-50" />
                    <span className="font-mono text-sm text-slate-400">[SCREENSHOT POS INTERFACE]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2: Multi-Outlet */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-1 md:order-1">
                <div className="aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 shadow-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-50" />
                  <div className="relative z-10 text-center p-6">
                    <Store className="h-16 w-16 text-blue-500 mx-auto mb-4 opacity-50" />
                    <span className="font-mono text-sm text-slate-400">[SCREENSHOT MULTI-OUTLET]</span>
                  </div>
                </div>
              </div>
              <div className="order-2 md:order-2 space-y-6">
                <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
                  Multi-Outlet
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Pantau Semua Cabang dari Satu Tempat
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Fitur khusus Owner untuk melihat performa semua outlet secara global atau spesifik. Beralih antar cabang dengan satu klik tanpa perlu logout.
                </p>
                <ul className="space-y-3">
                  {['Dashboard Terpusat', 'Filter Laporan per Cabang', 'Manajemen Stok Antar Outlet'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-slate-700 font-medium">
                      <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">
                        <Check className="h-3 w-3" />
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Feature 3: Inventory */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-2 md:order-1 space-y-6">
                <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm font-medium text-purple-800">
                  Inventory
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Stok Akurat, Jualan Lancar
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Kelola produk, kategori, dan stok per cabang secara real-time. Catat data supplier untuk memudahkan proses restock.
                </p>
              </div>
              <div className="order-1 md:order-2">
                <div className="aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 shadow-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-50" />
                  <div className="relative z-10 text-center p-6">
                    <Package className="h-16 w-16 text-purple-500 mx-auto mb-4 opacity-50" />
                    <span className="font-mono text-sm text-slate-400">[SCREENSHOT INVENTORY]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Staff Access */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-1 md:order-1">
                <div className="aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 shadow-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-50" />
                  <div className="relative z-10 text-center p-6">
                    <Users className="h-16 w-16 text-orange-500 mx-auto mb-4 opacity-50" />
                    <span className="font-mono text-sm text-slate-400">[SCREENSHOT STAFF ACCESS]</span>
                  </div>
                </div>
              </div>
              <div className="order-2 md:order-2 space-y-6">
                <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-800">
                  Manajemen Staff
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Delegasikan Tugas dengan Aman
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Atur peran karyawan (Owner vs Staff/Kasir). Pastikan kasir hanya fokus pada penjualan di cabang mereka, sementara Anda memegang kendali penuh.
                </p>
              </div>
            </div>
          </div>

          {/* Feature 5: Analytics */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 lg:gap-24 items-center">
              <div className="order-2 md:order-1 space-y-6">
                <div className="inline-flex items-center rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-sm font-medium text-pink-800">
                  Laporan Lengkap
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Ambil Keputusan Berdasarkan Data
                </h2>
                <p className="text-lg text-slate-600 leading-relaxed">
                  Laporan penjualan harian, mingguan, bulanan. Lihat produk terlaris dan kenali pelanggan setia Anda melalui fitur manajemen Customer (CRM).
                </p>
              </div>
              <div className="order-1 md:order-2">
                <div className="aspect-[4/3] rounded-2xl bg-slate-100 border border-slate-200 shadow-xl flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-50" />
                  <div className="relative z-10 text-center p-6">
                    <BarChart3 className="h-16 w-16 text-pink-500 mx-auto mb-4 opacity-50" />
                    <span className="font-mono text-sm text-slate-400">[SCREENSHOT REPORT]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-emerald-900 py-24 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-20 -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600 rounded-full blur-3xl opacity-20 -ml-16 -mb-16"></div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
              Siap Mengembangkan Bisnis Anda?
            </h2>
            <p className="text-lg text-emerald-100 mb-10 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan pebisnis yang telah beralih ke POSPro. Digitalisasi bisnis retail dan F&B Anda sekarang.
            </p>
            <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 h-14 px-8 text-lg font-semibold" asChild>
              <Link href="/register">Mulai Uji Coba Gratis 14 Hari <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <p className="mt-6 text-sm text-emerald-200/60">Tanpa kartu kredit • Cancel kapan saja</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded-md bg-emerald-600 flex items-center justify-center">
                  <Store className="h-3 w-3 text-white" />
                </div>
                <span className="text-lg font-bold text-slate-900">POSPro</span>
              </div>
              <p className="text-sm text-slate-500">
                Solusi kasir digital modern untuk bisnis masa depan. Simpel, Cepat, Terjangkau.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Produk</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#" className="hover:text-emerald-600">Fitur Utama</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">Harga</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">Integrasi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#" className="hover:text-emerald-600">Tentang Kami</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">Karir</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">Hubungi Kami</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link href="#" className="hover:text-emerald-600">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-emerald-600">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-400">© 2024 POSPro SaaS. All rights reserved.</p>
            <div className="flex gap-4">
              {/* Social icons placeholders */}
              <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer">
                <span className="sr-only">Facebook</span>
                <svg fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" /></svg>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 flex items-center justify-center transition-colors cursor-pointer">
                <span className="sr-only">Twitter</span>
                <svg fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
