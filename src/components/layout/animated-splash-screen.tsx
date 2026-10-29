'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export default function AnimatedSplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [stage, setStage] = useState<'enter' | 'animate' | 'exit' | 'done'>('enter');
  const [namaMasjid, setNamaMasjid] = useState('AL-MUKHLISIN');
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('masjid_identitas_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.nama) setNamaMasjid(parsed.nama.toUpperCase());
          if (parsed?.logo_url) setLogoUrl(parsed.logo_url);
        }
      } catch {}
    }
  }, []);

  useEffect(() => {
    // Cek apakah splash screen sudah pernah tampil di sesi ini
    try {
      if (typeof window !== 'undefined') {
        const hasShown = sessionStorage.getItem('masjid_splash_shown');
        if (hasShown) {
          setStage('done');
          return;
        }
      }
    } catch {
      // ignore
    }

    setMounted(true);

    // 1. Stage 1: Mulai animasi zoom & glow (50ms)
    const t1 = setTimeout(() => {
      setStage('animate');
    }, 50);

    // 2. Stage 2: Mulai fade-out exit (2200ms)
    const t2 = setTimeout(() => {
      setStage('exit');
    }, 2200);

    // 3. Stage 3: Hapus dari DOM sepenuhnya (2800ms)
    const t3 = setTimeout(() => {
      setStage('done');
      try {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('masjid_splash_shown', 'true');
        }
      } catch {
        // ignore
      }
    }, 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (stage === 'done' || !mounted) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-[99999] flex flex-col items-center justify-between py-12 px-6 bg-[#064b36] overflow-hidden select-none transition-all duration-700 ease-in-out ${
        stage === 'exit' ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Background Ambient Glow & Light Rays */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        {/* Radial Golden Halo */}
        <div
          className={`w-[450px] h-[450px] rounded-full bg-gradient-radial from-amber-400/25 via-emerald-600/15 to-transparent blur-3xl transition-all duration-1000 ease-out ${
            stage === 'animate' ? 'opacity-100 scale-110' : 'opacity-30 scale-75'
          }`}
        />
        {/* Expanding Golden Ripple Rings */}
        <div
          className={`absolute w-64 h-64 rounded-full border border-amber-300/20 transition-all duration-1500 ease-out ${
            stage === 'animate' ? 'scale-150 opacity-40' : 'scale-90 opacity-0'
          }`}
        />
        <div
          className={`absolute w-80 h-80 rounded-full border border-amber-400/15 transition-all duration-1500 delay-200 ease-out ${
            stage === 'animate' ? 'scale-140 opacity-30' : 'scale-90 opacity-0'
          }`}
        />
      </div>

      {/* Top spacer */}
      <div className="w-full" />

      {/* Center Hero: 3D Gold Mosque Emblem + Animated Branding */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-sm">
        {/* 3D Gold Dome Emblem with Float and Breathing Pulse */}
        <div
          className={`relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1.5 transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1) ${
            stage === 'animate'
              ? 'opacity-100 scale-100 translate-y-0 drop-shadow-[0_15px_35px_rgba(251,191,36,0.35)]'
              : 'opacity-0 scale-75 translate-y-6'
          }`}
        >
          {/* Subtle Rotating Gold Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-300/40 animate-[spin_20s_linear_infinite]" />

          {/* Logo Image */}
          <div className="relative w-full h-full rounded-full overflow-hidden shadow-2xl ring-2 ring-amber-400/60 bg-[#064b36]">
            <Image
              src="/images/app-icon.png"
              alt={namaMasjid}
              fill
              priority
              sizes="180px"
              className="object-cover transition-transform duration-1000 hover:scale-105"
            />
          </div>
        </div>

        {/* Mosque Name with Shimmering Gold Text */}
        <div
          className={`mt-6 transition-all duration-1000 delay-300 ease-out ${
            stage === 'animate' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-amber-300/80 mb-1">
            Masjid Jami&apos;
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-amber-100 via-yellow-200 to-amber-300 bg-clip-text text-transparent drop-shadow-sm">
            {namaMasjid}
          </h1>
          <p className="text-xs text-emerald-100/70 mt-1.5 font-medium tracking-wide">
            Sistem Informasi & Transparansi Umat
          </p>
        </div>
      </div>

      {/* Bottom Area: Elegant Progress Indicator */}
      <div
        className={`relative z-10 flex flex-col items-center gap-2 transition-all duration-1000 delay-500 ease-out ${
          stage === 'animate' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        {/* Animated Loading Bar */}
        <div className="w-28 h-1 rounded-full bg-emerald-950/60 overflow-hidden border border-amber-400/20">
          <div className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-full animate-[progress_1.8s_ease-in-out_infinite]" />
        </div>
        <span className="text-[10px] text-emerald-200/60 tracking-wider">
          Memuat aplikasi...
        </span>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
