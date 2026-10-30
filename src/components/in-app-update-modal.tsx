'use client';

import React, { useEffect, useState } from 'react';
import {
  Sparkles,
  Download,
  X,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { checkAppUpdate, RemoteVersionInfo, CURRENT_APP_VERSION } from '@/lib/app-version';

export default function InAppUpdateModal() {
  const [updateInfo, setUpdateInfo] = useState<RemoteVersionInfo | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const check = async (isManual = false) => {
    const result = await checkAppUpdate();
    if (result.hasUpdate && result.latestVersion) {
      // Check if user dismissed today (unless manual check)
      const dismissedKey = `masjid_dismissed_update_${result.latestVersion.versionCode}`;
      const lastDismissed = localStorage.getItem(dismissedKey);
      const isDismissedToday =
        lastDismissed && Date.now() - Number(lastDismissed) < 24 * 60 * 60 * 1000;

      if (!isDismissedToday || isManual || result.latestVersion.forceUpdate) {
        setUpdateInfo(result.latestVersion);
        setIsOpen(true);
      }
    } else if (isManual) {
      alert(`Aplikasi sudah versi terbaru (${CURRENT_APP_VERSION.version})!`);
    }
  };

  useEffect(() => {
    // Delay slightly so it doesn't collide with splash screen animation
    const timer = setTimeout(() => {
      check(false);
    }, 2000);

    const handleManualCheck = () => check(true);
    window.addEventListener('masjid_check_update_manually', handleManualCheck);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('masjid_check_update_manually', handleManualCheck);
    };
  }, []);

  if (!isOpen || !updateInfo) return null;

  const handleDismiss = () => {
    if (!updateInfo.forceUpdate) {
      const dismissedKey = `masjid_dismissed_update_${updateInfo.versionCode}`;
      localStorage.setItem(dismissedKey, String(Date.now()));
    }
    setIsOpen(false);
  };

  const handleUpdateNow = () => {
    setDownloading(true);
    const downloadUrl = updateInfo.directDownloadUrl || updateInfo.apkUrl;

    // Trigger download
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'al-mukhlisin.apk';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      setDownloading(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col animate-scaleUp text-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Visual */}
        <div className="bg-gradient-to-br from-[#0a1f18] via-[#0d3b2c] to-[#0a1f18] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3 shadow-inner">
            <Sparkles size={28} className="animate-pulse" />
          </div>
          <h3 className="font-serif-elegant font-black text-lg sm:text-xl">
            Pembaruan Tersedia!
          </h3>
          <p className="text-xs text-emerald-200/90 mt-1">
            Versi {updateInfo.version} sudah siap dipasang
          </p>
          <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-emerald-200">
            Versi Anda: v{CURRENT_APP_VERSION.version} → v{updateInfo.version}
          </span>

          {!updateInfo.forceUpdate && (
            <button
              onClick={handleDismiss}
              className="absolute top-3.5 right-3.5 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content: Changelog */}
        <div className="p-5 space-y-4 text-xs">
          <div>
            <p className="font-bold text-slate-700 text-[11px] uppercase tracking-wider mb-2">
              Yang Baru di Versi Ini:
            </p>
            <ul className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {updateInfo.changelog && updateInfo.changelog.length > 0 ? (
                updateInfo.changelog.map((log, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-600 leading-snug">
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{log}</span>
                  </li>
                ))
              ) : (
                <li className="text-slate-500 italic">Peningkatan performa dan perbaikan bug.</li>
              )}
            </ul>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck size={12} className="text-emerald-600" />
            <span>Resmi dari DKM Al-Mukhlisin & Aman</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              onClick={handleUpdateNow}
              disabled={downloading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-70 cursor-pointer"
            >
              {downloading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Mengunduh Pembaruan...</span>
                </>
              ) : (
                <>
                  <Download size={15} />
                  <span>Perbarui Sekarang</span>
                </>
              )}
            </button>

            {!updateInfo.forceUpdate && (
              <button
                onClick={handleDismiss}
                className="w-full py-2 text-center text-xs text-slate-400 hover:text-slate-600 font-medium transition cursor-pointer"
              >
                Nanti Saja
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

