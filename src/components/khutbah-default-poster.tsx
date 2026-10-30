'use client';

import React, { useEffect, useState } from 'react';
import { CalendarDays, MapPin, Clock } from 'lucide-react';

export interface KhutbahDefaultPosterProps {
  jenisKegiatan?: string;
  khotib?: string;
  tema?: string | null;
  tanggal?: string;
  waktu?: string | null;
  variant?: 'thumbnail' | 'preview' | 'card' | 'banner';
  className?: string;
  namaMasjid?: string;
}

export function isCustomPosterImage(image?: string | null): boolean {
  if (!image) return false;
  const trimmed = image.trim();
  if (!trimmed) return false;
  if (trimmed.includes('unsplash.com')) return false;
  if (trimmed.includes('default-khutbah')) return false;
  if (trimmed.startsWith('/images/')) return false;
  return (
    trimmed.startsWith('data:image') ||
    trimmed.includes('khutbah-images') ||
    trimmed.includes('supabase.co') ||
    trimmed.includes('supabase.in')
  );
}

export function MosqueDomeIcon({ className = 'w-6 h-6 text-amber-300' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Crescent at apex */}
      <path
        d="M24 3C24.8 3 25.5 3.3 26 3.8C25 4.3 24.3 5.3 24.3 6.5C24.3 8.2 25.6 9.5 27.3 9.5C27.9 9.5 28.5 9.3 29 9C28.5 10.7 26.9 12 25 12C22.8 12 21 10.2 21 8C21 5.2 22.3 3 24 3Z"
        fill="currentColor"
      />
      {/* Spire / Finial */}
      <path d="M23.5 11H24.5V14H23.5V11Z" fill="currentColor" />
      {/* Onion Dome */}
      <path
        d="M24 14C20.5 17.5 14 21 14 29C14 33 17 35 24 35C31 35 34 33 34 29C34 21 27.5 17.5 24 14Z"
        fill="currentColor"
        fillOpacity="0.25"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Base Arch */}
      <path
        d="M19 35V27C19 24.2 21.2 22 24 22C26.8 22 29 24.2 29 27V35"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      {/* Bottom Foundation Line */}
      <path d="M10 38H38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 41H36" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function KhutbahDefaultPoster({
  jenisKegiatan = 'Shalat Jumat',
  khotib = 'Nama Khotib / Penceramah',
  tema = '',
  tanggal,
  waktu,
  variant = 'card',
  className = '',
  namaMasjid,
}: KhutbahDefaultPosterProps) {
  const [dynamicNama, setDynamicNama] = useState<string>(namaMasjid || 'Al-Mukhlisin');
  useEffect(() => {
    if (namaMasjid) {
      setDynamicNama(namaMasjid);
    } else if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('masjid_identitas_data');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.nama) setDynamicNama(parsed.nama);
        }
      } catch { }
    }
  }, [namaMasjid]);
  // Thumbnail for Table List (compact square)
  if (variant === 'thumbnail') {
    return (
      <div
        className={`relative h-full w-full overflow-hidden rounded-xl bg-gradient-to-br from-[#064e3b] via-[#043326] to-[#021f17] flex flex-col items-center justify-center p-1 border border-emerald-500/30 text-white shadow-inner select-none ${className}`}
        title={`Poster Standar Masjid ${dynamicNama}`}
      >
        <MosqueDomeIcon className="w-6 h-6 text-emerald-300 drop-shadow" />
        <span className="text-[7px] font-black uppercase tracking-wider text-emerald-200 mt-0.5 text-center leading-none">
          {dynamicNama}
        </span>
      </div>
    );
  }

  // Interactive Live Preview for Admin Modal
  if (variant === 'preview') {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#064e3b] via-[#043627] to-[#011d14] p-4 text-white shadow-lg border border-emerald-500/30 select-none ${className}`}
      >
        {/* Geometric Islamic Star Pattern Watermark */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic-geom-prev" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="#ffffff" strokeWidth="1" />
                <circle cx="20" cy="20" r="10" fill="none" stroke="#ffffff" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-geom-prev)" />
          </svg>
        </div>

        {/* Top Mosque Header */}
        <div className="relative z-10 flex items-center justify-between gap-2 border-b border-emerald-500/20 pb-2">
          <div className="flex items-center gap-2">
            <MosqueDomeIcon className="w-5 h-5 text-amber-300" />
            <div>
              <p className="text-[10px] font-black tracking-widest text-emerald-300 uppercase leading-none">
                Masjid {dynamicNama}
              </p>
              <p className="text-[8px] font-mono text-emerald-100/60 leading-tight">
                Lagadar, Margaasih
              </p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-800/80 px-2.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-emerald-200 border border-emerald-500/30">
            {jenisKegiatan || 'Kajian / Khutbah'}
          </span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-3 text-center px-2">
          <p className="text-[9px] font-black tracking-widest text-amber-300 uppercase mb-1">
            Jadwal Khutbah & Majelis Ilmu
          </p>
          <h4 className="font-serif-elegant text-base font-bold text-white drop-shadow leading-snug line-clamp-1">
            {khotib || 'Nama Penceramah / Khotib'}
          </h4>
          <p className="text-[11px] text-emerald-200/90 italic mt-1 line-clamp-1">
            "{tema || 'Tema Khutbah / Kajian'}"
          </p>
        </div>

        {/* Bottom Footer Info */}
        <div className="relative z-10 flex items-center justify-between text-[9px] text-emerald-200/80 border-t border-emerald-500/20 pt-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <CalendarDays size={11} className="text-amber-300" />
              <span className="font-bold">{tanggal || 'Tanggal Pelaksanaan'}</span>
            </div>
            {waktu && (
              <div className="flex items-center gap-1 text-emerald-200">
                <Clock size={10} className="text-amber-300" />
                <span className="font-mono font-bold">{waktu} WIB</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-[8px] text-emerald-300/90">
            <MapPin size={9} className="text-emerald-400" />
            <span>Masjid {dynamicNama}</span>
          </div>
        </div>
      </div>
    );
  }

  // Large Grand Banner for Modals Detail
  if (variant === 'banner') {
    return (
      <div
        className={`relative h-full w-full overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#043326] to-[#011b13] p-6 text-white flex flex-col justify-between select-none ${className}`}
      >
        {/* Geometric Islamic Star Pattern Watermark */}
        <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="islamic-geom-ban" width="48" height="48" patternUnits="userSpaceOnUse">
                <path d="M24 0 L48 24 L24 48 L0 24 Z" fill="none" stroke="#ffffff" strokeWidth="1" />
                <circle cx="24" cy="24" r="12" fill="none" stroke="#ffffff" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#islamic-geom-ban)" />
          </svg>
        </div>

        {/* Radiant Backdrop Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-emerald-800/80 border border-emerald-500/30 flex items-center justify-center shadow">
              <MosqueDomeIcon className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h5 className="text-[11px] font-black uppercase tracking-widest text-emerald-300 leading-none">
                Masjid {dynamicNama}
              </h5>
              <p className="text-[9px] text-emerald-100/70 mt-0.5">
                Kp. Jalan Cagak, Lagadar
              </p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-900/90 border border-emerald-500/40 px-3 py-1 text-[9px] font-black tracking-widest uppercase text-emerald-200 shadow-sm">
            {jenisKegiatan}
          </span>
        </div>

        {/* Center Title & Theme */}
        <div className="relative z-10 text-center py-4 px-2 my-auto">
          <span className="text-[9px] font-black tracking-widest text-amber-300 uppercase inline-block mb-1">
            Syiar Dakwah & Kajian Islam
          </span>
          <h3 className="font-serif-elegant text-2xl md:text-3xl font-black text-white drop-shadow-md leading-tight">
            {khotib}
          </h3>
          {tema && (
            <p className="text-xs text-emerald-200/90 italic mt-1.5 max-w-md mx-auto line-clamp-2">
              "{tema}"
            </p>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-emerald-200/80 border-t border-emerald-500/20 pt-3">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <CalendarDays size={13} className="text-amber-300" />
              <span className="font-bold">{tanggal || 'Jadwal Terdaftar'}</span>
            </div>
            {waktu && (
              <div className="flex items-center gap-1 text-emerald-200">
                <Clock size={12} className="text-amber-300" />
                <span className="font-mono font-bold">{waktu} WIB</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 text-[9px] text-emerald-300">
            <MapPin size={11} className="text-emerald-400" />
            <span>Masjid {dynamicNama}</span>
          </div>
        </div>
      </div>
    );
  }

  // Public Landing Page Card (variant === 'card')
  return (
    <div
      className={`relative h-full w-full overflow-hidden bg-gradient-to-br from-[#064e3b] via-[#043627] to-[#011d14] p-3.5 sm:p-4 md:p-5 text-white flex flex-col justify-between select-none ${className}`}
    >
      {/* Geometric Islamic Star Pattern Watermark */}
      <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="islamic-geom-card" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="none" stroke="#ffffff" strokeWidth="1" />
              <circle cx="20" cy="20" r="10" fill="none" stroke="#ffffff" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#islamic-geom-card)" />
        </svg>
      </div>

      {/* Decorative Radial Lighting */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between gap-1.5 border-b border-emerald-500/20 pb-2">
        <div className="flex items-center gap-1.5">
          <MosqueDomeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 shrink-0" />
          <div>
            <p className="text-[9px] sm:text-[10px] font-black tracking-widest text-emerald-300 uppercase leading-none">
              Masjid {dynamicNama}
            </p>
            <p className="text-[7px] sm:text-[8px] font-mono text-emerald-100/60 leading-tight mt-0.5">
              Lagadar, Margaasih
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-800/80 px-2 py-0.5 text-[7px] sm:text-[8px] font-black uppercase tracking-wider text-emerald-200 border border-emerald-500/30 whitespace-nowrap">
          {jenisKegiatan || 'Shalat Jumat'}
        </span>
      </div>

      {/* Center Subject */}
      <div className="relative z-10 my-auto text-center py-1 sm:py-2 px-1">
        <p className="text-[8px] sm:text-[9px] font-black tracking-widest text-amber-300 uppercase mb-0.5 sm:mb-1">
          Jadwal Khutbah & Majelis Ilmu
        </p>
        <h4 className="font-serif-elegant text-sm sm:text-base md:text-xl font-black text-white drop-shadow leading-tight line-clamp-1">
          {khotib}
        </h4>
        <p className="text-[10px] sm:text-[11px] text-emerald-200/90 italic mt-0.5 sm:mt-1 line-clamp-1">
          "{tema || 'Tema Khutbah / Kajian'}"
        </p>
      </div>

      {/* Bottom Footer */}
      <div className="relative z-10 flex items-center justify-between text-[8px] sm:text-[9px] text-emerald-200/80 border-t border-emerald-500/20 pt-1.5 sm:pt-2.5">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <CalendarDays size={10} className="text-amber-300 shrink-0" />
            <span className="font-bold truncate max-w-[100px] sm:max-w-none">{tanggal || 'Jadwal Kajian'}</span>
          </div>
          {waktu && (
            <div className="flex items-center gap-0.5 text-emerald-200">
              <Clock size={9} className="text-amber-300 shrink-0" />
              <span className="font-mono font-bold">{waktu} WIB</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 text-[7px] sm:text-[8px] text-emerald-300/90 whitespace-nowrap">
          <MapPin size={8} className="text-emerald-400 shrink-0" />
          <span>Masjid {dynamicNama}</span>
        </div>
      </div>
    </div>
  );
}
