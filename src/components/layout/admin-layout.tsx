'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Wallet,
  CalendarDays,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Shield,
  User,
  Database,
  Users,
  HandHeart,
  UserCheck,
  FileText,
  Settings,
  MapPin,
  MessageSquareHeart,
  Tags,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { DataService } from '@/lib/data-service';
import { IdentitasMasjid } from '@/types';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isSupabaseConnected } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [identitas, setIdentitas] = useState<IdentitasMasjid | null>(null);
  const [unreadSaran, setUnreadSaran] = useState(0);
  const [navTheme, setNavTheme] = useState<'dark' | 'light'>('dark');
  const mobileNavRef = useRef<HTMLElement>(null);

  // Dynamic Theme Detection:
  // "kalo bawahnya item jadi putih, kalo bawah putih jadi item"
  useEffect(() => {
    let ticking = false;

    const detectUnderlyingTheme = () => {
      if (!mobileNavRef.current) return;
      const navEl = mobileNavRef.current;
      const rect = navEl.getBoundingClientRect();
      const checkX = window.innerWidth / 2;
      // Sample 15px above the bottom bar top edge
      const checkY = Math.max(10, rect.top - 15);

      if (typeof document === 'undefined' || typeof document.elementsFromPoint !== 'function') return;

      const elements = document.elementsFromPoint(checkX, checkY);
      const target = elements.find(
        (el) => !navEl.contains(el) && el !== document.body && el !== document.documentElement
      );

      let isDark = false;
      let curr = target as HTMLElement | null;

      while (curr && curr !== document.body && curr !== document.documentElement) {
        if (curr.getAttribute('data-theme') === 'dark') {
          isDark = true;
          break;
        }
        if (curr.getAttribute('data-theme') === 'light') {
          isDark = false;
          break;
        }

        const bg = window.getComputedStyle(curr).backgroundColor;
        if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
          const match = bg.match(/\d+(\.\d+)?/g);
          if (match && match.length >= 3) {
            const r = parseFloat(match[0]);
            const g = parseFloat(match[1]);
            const b = parseFloat(match[2]);
            const a = match[3] !== undefined ? parseFloat(match[3]) : 1;
            if (a > 0.25) {
              const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
              isDark = luminance < 140;
              break;
            }
          }
        }
        curr = curr.parentElement;
      }

      // If background underneath is dark -> navbar becomes white (light)
      // If background underneath is white/light -> navbar becomes dark
      setNavTheme(isDark ? 'light' : 'dark');
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(detectUnderlyingTheme);
        ticking = true;
      }
    };

    detectUnderlyingTheme();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    let isMounted = true;
    const fetchIdentitas = async () => {
      try {
        const data = await DataService.getIdentitas();
        if (isMounted) setIdentitas(data);
      } catch (e) {
        console.error('Failed to load identitas in layout:', e);
      }
    };
    const fetchUnreadSaran = async () => {
      try {
        if (typeof DataService?.getSaranKritik === 'function') {
          const saranList = await DataService.getSaranKritik();
          if (isMounted && Array.isArray(saranList)) {
            const baruCount = saranList.filter((s) => s.status === 'baru').length;
            setUnreadSaran(baruCount);
          }
        }
      } catch (e) {
        console.error('Failed to load saran count in layout:', e);
      }
    };

    fetchIdentitas();
    fetchUnreadSaran();

    const handleUpdated = (e: any) => {
      if (e?.detail) setIdentitas(e.detail);
      else fetchIdentitas();
    };

    const handleSaranUpdated = () => {
      fetchUnreadSaran();
    };

    window.addEventListener('masjid_identitas_updated', handleUpdated);
    window.addEventListener('masjid_saran_updated', handleSaranUpdated);
    return () => {
      isMounted = false;
      window.removeEventListener('masjid_identitas_updated', handleUpdated);
      window.removeEventListener('masjid_saran_updated', handleSaranUpdated);
    };
  }, []);

  const navItems = [
    { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Saran & Kritik Jamaah', href: '/admin/saran', icon: MessageSquareHeart, badge: unreadSaran },
    { title: 'Buku Kas Keuangan', href: '/admin/finance', icon: Wallet },
    { title: 'Zakat & Qurban', href: '/admin/zakat', icon: HandHeart },
    { title: 'Data Jamaah', href: '/admin/jamaah', icon: Users },
    { title: 'Jadwal Petugas Jumat', href: '/admin/petugas-jumat', icon: UserCheck },
    { title: 'Khutbah & Kajian', href: '/admin/khutbah', icon: CalendarDays },
    { title: 'Inventaris & Wakaf', href: '/admin/inventory', icon: Package },
    { title: 'Master Kategori', href: '/admin/kategori', icon: Tags },
    { title: 'Laporan Resmi (SIMAS)', href: '/admin/laporan', icon: FileText },
    { title: 'Pengaturan & Backup', href: '/admin/pengaturan', icon: Settings },
  ];


  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-[#0a1f18] text-white border-b border-emerald-900/40 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-emerald-800/80 border border-emerald-500/30 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={identitas?.logo_url || '/icon.svg'}
              alt={identitas?.nama || 'Masjid Al-Mukhlisin'}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-serif-elegant text-lg font-bold leading-none tracking-wide text-white">
              {identitas?.nama || 'Al-Mukhlisin'}
            </h1>
            <p className="text-[9px] font-mono text-emerald-300 mt-1">
              ID {identitas?.nomor_id_kemenag || '01.4.13.04.06.000158'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          aria-label="Toggle Menu"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-72 bg-[#0a1f18] text-white flex flex-col justify-between p-6 z-50 overflow-y-auto transition-transform duration-300 ease-in-out border-r border-emerald-950/80 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-800/80 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow overflow-hidden">
                <img
                  src={identitas?.logo_url || '/icon.svg'}
                  alt={identitas?.nama || 'Masjid Al-Mukhlisin'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span className="font-serif-elegant text-2xl font-bold tracking-wide text-white block leading-tight">
                  {identitas?.nama || 'Al-Mukhlisin'}
                </span>
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase flex items-center gap-1 mt-0.5">
                  <Shield size={11} /> Admin Portal
                </span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden text-slate-400 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Database Connection Status Badge */}
          <div className="rounded-2xl bg-emerald-950/60 border border-emerald-800/40 p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Database size={13} className="text-emerald-400" /> Database Backend
              </span>
              <span
                className="relative flex h-2 w-2"
                title={isSupabaseConnected ? 'Database Cloud Terhubung' : 'Database Aktif & Terlindungi'}
              >
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
            </div>

            {/* Identitas SIMAS & Alamat */}
            <div className="border-t border-emerald-900/40 pt-2 text-[10px] space-y-0.5">
              <span className="font-mono font-bold text-emerald-400 block">
                ID {identitas?.nomor_id_kemenag || '01.4.13.04.06.000158'}
              </span>
              <p className="text-slate-300 flex items-start gap-1 leading-tight">
                <MapPin size={11} className="shrink-0 text-emerald-500 mt-0.5" />
                <span>{identitas?.alamat || 'Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar'}</span>
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="px-3 text-[10px] font-black tracking-widest text-emerald-500 uppercase mb-2">
              Menu Utama
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#0d8a5e] to-emerald-700 text-white shadow-lg shadow-emerald-950/50'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-white' : 'text-emerald-400'} />
                  <span className="flex-1">{item.title}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-emerald-950 shadow-sm animate-pulse">
                      {item.badge} baru
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area with User Profile and Action buttons */}
        <div className="space-y-4 pt-6 border-t border-emerald-950/80">
          {/* Quick link to public landing page */}
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-4 py-2.5 rounded-xl text-[11px] font-bold text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} className="text-emerald-400" /> Lihat Website Publik
            </span>
            <span className="text-[9px] text-emerald-400 uppercase tracking-wider">Web</span>
          </Link>

          {/* User Info & Logout */}
          <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/5">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="h-8 w-8 rounded-xl bg-emerald-600/60 flex items-center justify-center shrink-0 text-white font-bold text-xs uppercase">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Admin Masjid'}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@masjid.id'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Keluar"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/10 rounded-xl transition-colors shrink-0"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 min-w-0 bg-[#f8fafc] overflow-y-auto pb-28 md:pb-8">
        {children}
      </main>

      {/* Mobile Adaptive Dynamic Contrast Bottom Navigation */}
      <nav
        ref={mobileNavRef}
        aria-label="Navigasi Bawah Mobile Admin"
        className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-colors duration-300 pb-[calc(env(safe-area-inset-bottom,8px)+8px)] pt-2 ${
          navTheme === 'light'
            ? 'bg-white/95 backdrop-blur-xl border-t border-slate-200/90 shadow-[0_-8px_30px_rgba(0,0,0,0.22)]'
            : 'bg-[#0a1f18]/95 backdrop-blur-xl border-t border-emerald-500/20 shadow-[0_-8px_30px_rgba(0,0,0,0.45)]'
        }`}
      >
        {/* Subtle glowing accent line on top */}
        <div
          className={`absolute top-0 left-0 right-0 h-[1.5px] pointer-events-none transition-opacity duration-300 ${
            navTheme === 'light'
              ? 'bg-gradient-to-r from-transparent via-emerald-600/30 to-transparent'
              : 'bg-gradient-to-r from-transparent via-emerald-400/40 to-transparent'
          }`}
        />

        <div className="grid grid-cols-5 items-center max-w-md mx-auto px-1 gap-1">
          {[
            { title: 'Beranda', href: '/admin/dashboard', icon: LayoutDashboard },
            { title: 'Kas', href: '/admin/finance', icon: Wallet },
            { title: 'Zakat', href: '/admin/zakat', icon: HandHeart },
            { title: 'Saran', href: '/admin/saran', icon: MessageSquareHeart, badge: unreadSaran },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-150 active:scale-95 ${
                  isActive
                    ? navTheme === 'light'
                      ? 'text-emerald-800'
                      : 'text-white'
                    : navTheme === 'light'
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-slate-300 hover:text-white'
                }`}
              >
                {/* Active Indicator Pip */}
                {isActive && (
                  <span
                    className={`absolute -top-1.5 w-6 h-1 rounded-full transition-colors duration-300 ${
                      navTheme === 'light'
                        ? 'bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.7)]'
                        : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                    }`}
                  />
                )}

                <div
                  className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-200 ${
                    isActive
                      ? navTheme === 'light'
                        ? 'bg-emerald-100/90 text-emerald-800 shadow-sm ring-1 ring-emerald-500/30'
                        : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-300/40'
                      : navTheme === 'light'
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? navTheme === 'light'
                          ? 'text-emerald-800 stroke-[2.3]'
                          : 'text-white stroke-[2.3]'
                        : navTheme === 'light'
                          ? 'text-slate-600'
                          : 'text-slate-300'
                    }
                  />
                </div>
                <span
                  className={`text-[11px] tracking-tight mt-1 truncate w-full text-center transition-colors duration-200 ${
                    isActive
                      ? navTheme === 'light'
                        ? 'text-emerald-800 font-extrabold'
                        : 'text-emerald-300 font-bold'
                      : navTheme === 'light'
                        ? 'text-slate-600 font-medium'
                        : 'text-slate-300 font-medium'
                  }`}
                >
                  {tab.title}
                </span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-emerald-950 animate-pulse" />
                )}
              </Link>
            );
          })}

          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={`relative flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all duration-150 active:scale-95 ${
              sidebarOpen
                ? navTheme === 'light'
                  ? 'text-emerald-800'
                  : 'text-white'
                : navTheme === 'light'
                  ? 'text-slate-600 hover:text-slate-900'
                  : 'text-slate-300 hover:text-white'
            }`}
          >
            {sidebarOpen && (
              <span
                className={`absolute -top-1.5 w-6 h-1 rounded-full transition-colors duration-300 ${
                  navTheme === 'light'
                    ? 'bg-emerald-600 shadow-[0_0_8px_rgba(5,150,105,0.7)]'
                    : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]'
                }`}
              />
            )}
            <div
              className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-200 ${
                sidebarOpen
                  ? navTheme === 'light'
                    ? 'bg-emerald-100/90 text-emerald-800 shadow-sm ring-1 ring-emerald-500/30'
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-950/50 ring-1 ring-emerald-300/40'
                  : navTheme === 'light'
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Menu
                size={20}
                className={
                  sidebarOpen
                    ? navTheme === 'light'
                      ? 'text-emerald-800 stroke-[2.3]'
                      : 'text-white stroke-[2.3]'
                    : navTheme === 'light'
                      ? 'text-slate-600'
                      : 'text-slate-300'
                }
              />
            </div>
            <span
              className={`text-[11px] tracking-tight mt-1 truncate w-full text-center transition-colors duration-200 ${
                sidebarOpen
                  ? navTheme === 'light'
                    ? 'text-emerald-800 font-extrabold'
                    : 'text-emerald-300 font-bold'
                  : navTheme === 'light'
                    ? 'text-slate-600 font-medium'
                    : 'text-slate-300 font-medium'
              }`}
            >
              Menu
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}
