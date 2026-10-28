'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Wallet,
  Users,
  CalendarDays,
  HandHeart,
  Package,
  FileText,
  X,
  MessageSquareHeart,
} from 'lucide-react';

function MosqueIcon({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2v2.5" />
      <path d="M12 4.5c-2.3 0-3.8 1.6-3.8 4V11h7.6V8.5c0-2.4-1.5-4-3.8-4z" />
      <path d="M5 11v10h14V11" />
      <path d="M10 21v-4a2 2 0 0 1 4 0v4" />
      <path d="M5 11H3v10h2" />
      <path d="M19 11h2v10h-2" />
    </svg>
  );
}

interface MobileBottomNavProps {
  variant?: 'admin' | 'public';
}

export default function MobileBottomNav({ variant }: MobileBottomNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [navTheme, setNavTheme] = useState<'dark' | 'light'>('dark');
  const mobileNavRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic Theme Detection:
  // "kalo bwahnya item jadi putih, kalo bawah putih jadi item"
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

  const navItems = [
    {
      title: 'Beranda',
      fullTitle: 'Beranda Utama',
      href: '/',
      icon: MosqueIcon,
      active: pathname === '/',
    },
    {
      title: 'Kas',
      fullTitle: 'Transparansi Kas',
      href: '/keuangan',
      icon: Wallet,
      active: pathname === '/keuangan',
    },
    {
      title: 'Jamaah',
      fullTitle: 'Direktori Jamaah & DKM',
      href: '/jamaah',
      icon: Users,
      active: pathname === '/jamaah',
    },
    {
      title: 'Agenda',
      fullTitle: 'Agenda & Khutbah',
      href: '/agenda',
      icon: CalendarDays,
      active: pathname === '/agenda',
    },
    {
      title: 'Zakat',
      fullTitle: 'Layanan Zakat & Infaq',
      href: '/zakat',
      icon: HandHeart,
      active: pathname === '/zakat',
    },
    {
      title: 'Aset',
      fullTitle: 'Fasilitas & Wakaf',
      href: '/fasilitas',
      icon: Package,
      active: pathname === '/fasilitas',
    },
    {
      title: 'Laporan',
      fullTitle: 'Laporan Resmi SIMAS',
      href: '/laporan',
      icon: FileText,
      active: pathname === '/laporan',
    },
  ];

  const desktopNavItems = [
    ...navItems,
    {
      title: 'Saran',
      fullTitle: 'Kotak Saran & Aspirasi',
      href: '/saran',
      icon: MessageSquareHeart,
      active: pathname === '/saran',
    },
  ];

  // Mouse hover handlers with slight delay on exit
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 250);
  };

  // Close on Click outside or Escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* ============================================================== */}
      {/* 1. TAMPILAN MOBILE (< md): ADAPTIVE DYNAMIC CONTRAST DOCK      */}
      {/* ============================================================== */}
      <nav
        ref={mobileNavRef}
        aria-label="Navigasi Bawah Mobile"
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

        <div className="grid grid-cols-7 items-center max-w-lg mx-auto px-1 gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <Link
                key={item.title}
                href={item.href}
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
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ============================================================== */}
      {/* 2. TAMPILAN LAPTOP / DESKTOP (md: & UP): FLOATING SPEED DIAL   */}
      {/* ============================================================== */}
      <aside
        ref={containerRef}
        aria-label="Navigasi Cepat Desktop"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden md:block fixed bottom-7 right-7 z-50 select-none"
      >
        {/* Tombol-Tombol Bulat Muncul di Atas Tombol Utama */}
        <div
          className={`absolute bottom-16 right-0 flex flex-col-reverse items-end gap-3 transition-all duration-300 ease-out origin-bottom ${
            isOpen
              ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
              : 'opacity-0 translate-y-6 scale-90 pointer-events-none'
          }`}
        >
          {desktopNavItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = item.active;

            return (
              <div
                key={item.title}
                className="group flex items-center gap-2.5"
                style={{
                  transitionDelay: isOpen ? `${index * 25}ms` : '0ms',
                }}
              >
                {/* Tooltip Label di sebelah kiri tombol bulat */}
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shadow-md backdrop-blur-md transition-all duration-200 border cursor-pointer ${
                    isActive
                      ? 'bg-emerald-900/90 text-emerald-200 border-emerald-500/40 shadow-emerald-950/20'
                      : 'bg-slate-900/85 text-white border-white/10 group-hover:bg-slate-900 group-hover:scale-105'
                  }`}
                >
                  {item.fullTitle}
                </Link>

                {/* Tombol Bulat */}
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  title={item.fullTitle}
                  className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg active:scale-95 group-hover:scale-110 border ${
                    isActive
                      ? 'bg-gradient-to-tr from-emerald-700 to-teal-600 text-white border-emerald-300 shadow-emerald-900/40 ring-2 ring-emerald-400 ring-offset-2 ring-offset-[#f4f7f6]'
                      : 'bg-white/95 text-slate-700 hover:bg-emerald-700 hover:text-white border-slate-200 shadow-slate-900/10 hover:shadow-emerald-900/30'
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? 'text-white stroke-[2.2]' : 'transition-colors'}
                  />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Tombol Utama (Trigger FAB) */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-label="Menu Layanan Masjid"
          className={`relative group w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl border-2 active:scale-95 focus:outline-hidden ${
            isOpen
              ? 'bg-gradient-to-tr from-[#0a1f18] to-slate-900 text-white border-emerald-400 rotate-90 shadow-emerald-950/50'
              : 'bg-gradient-to-tr from-[#0a1f18] to-emerald-800 hover:to-emerald-700 text-white border-emerald-400/50 hover:border-emerald-300 shadow-[0_8px_30px_rgba(10,31,24,0.35)] hover:shadow-[0_10px_35px_rgba(13,138,94,0.45)]'
          }`}
        >
          {/* Subtle pulse ring when closed */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-full bg-emerald-500/20 animate-ping pointer-events-none" />
          )}

          {isOpen ? (
            <X size={24} className="text-emerald-300 transition-transform duration-300 -rotate-90" />
          ) : (
            <MosqueIcon size={24} className="text-emerald-300 group-hover:scale-110 transition-transform duration-300" />
          )}
        </button>
      </aside>
    </>
  );
}
