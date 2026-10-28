'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Smartphone,
  Download,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Share2,
  Layers,
  Zap,
  Lock,
  HeartHandshake,
  QrCode,
  FileCheck,
  AlertCircle
} from 'lucide-react';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';

export default function UnduhApkPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  // Direct download link ke file APK yang sudah di-build
  const apkDownloadUrl = '/downloads/masjid-al-mukhlisin.apk';

  const handleShare = async () => {
    if (typeof window !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Aplikasi Android Masjid Al-Mukhlisin',
          text: 'Unduh aplikasi resmi Masjid Al-Mukhlisin untuk jadwal shalat, transparansi kas, dan layanan jamaah.',
          url: window.location.href,
        });
      } catch {
        // User cancelled or failed
      }
    } else if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const faqs = [
    {
      q: 'Bagaimana cara menginstall file APK di HP Android?',
      a: 'Setelah file .apk selesai diunduh, buka file tersebut melalui bilah notifikasi atau aplikasi Pengelola File (File Manager). Jika muncul peringatan keamanan bawaan Android "Instal aplikasi dari sumber tidak dikenal", pilih Izinkan / Tetap Install (Install Anyway).',
    },
    {
      q: 'Apakah aplikasi ini aman dari virus atau malware?',
      a: '100% Aman. Aplikasi ini dikembangkan secara resmi oleh DKM Masjid Al-Mukhlisin menggunakan kode sumber terbuka (open-source) yang dapat diaudit langsung di GitHub repository resmi masjid.',
    },
    {
      q: 'Berapa versi Android minimum yang didukung?',
      a: 'Aplikasi mendukung sistem operasi Android 7.0 (Nougat) ke atas hingga Android 14/15 terbaru. Ukuran aplikasi sangat ringan (~14 MB) sehingga tidak membebani memori HP Anda.',
    },
    {
      q: 'Apakah aplikasi memerlukan koneksi internet?',
      a: 'Sebagian besar informasi jadwal shalat dan panduan dapat dibuka secara offline. Koneksi internet diperlukan untuk menyinkronkan laporan kas terbaru, pengumuman agenda, dan mengirim kotak saran.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-900 flex flex-col font-sans pb-24 md:pb-12">
      {/* --- TOP HEADER NAVIGATION --- */}
      <header className="sticky top-0 z-40 bg-[#0a1f18]/95 backdrop-blur-md border-b border-emerald-900/40 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-emerald-200 hover:text-white transition-colors bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full border border-white/10"
          >
            <ArrowLeft size={14} />
            <span>Kembali ke Beranda</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-serif-elegant font-bold text-lg text-emerald-100 hidden sm:inline">
              Masjid Al-Mukhlisin
            </span>
          </div>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full border border-white/10 transition-all active:scale-95"
            title="Bagikan Halaman"
          >
            <Share2 size={13} className="text-emerald-400" />
            <span>{copied ? 'Tersalin!' : 'Bagikan'}</span>
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* --- HERO SECTION --- */}
        <section data-theme="dark" className="relative overflow-hidden bg-gradient-to-b from-[#0a1f18] via-[#0d2a20] to-[#0a1f18] text-white pt-12 pb-16 px-4 sm:px-6 lg:px-8">
          {/* Subtle Islamic Motif BG Decoration */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          <div className="relative mx-auto max-w-5xl text-center">
            <h1 className="font-serif-elegant text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-4">
              Masjid Al-Mukhlisin <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-200">
                Dalam Genggaman Jamaah
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-sm sm:text-base text-emerald-100/80 leading-relaxed mb-8">
              Dapatkan kemudahan memantau jadwal shalat harian, transparansi arus kas, agenda kajian, layanan zakat & infaq, hingga mengirim aspirasi jamaah langsung dari layar ponsel Anda.
            </p>

            {/* Main Action Box */}
            <div className="mx-auto max-w-xl bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-emerald-950/70 text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* App Icon */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-[#0a1f18] border-2 border-emerald-400/50 p-2.5 shadow-xl shrink-0 flex items-center justify-center">
                  <img
                    src="/icon.svg"
                    alt="Logo Masjid Al-Mukhlisin"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* App Specs */}
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                    <h2 className="text-xl font-bold text-white">Al-Mukhlisin Mobile</h2>
                    <span className="bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                      v1.0.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-3">
                    ID Kemenag: 01.4.13.04.06.000158 · Desa Lagadar
                  </p>

                  <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-xl bg-black/25 border border-white/10 text-center text-[10px] sm:text-xs">
                    <div>
                      <span className="block text-slate-400 text-[10px]">Ukuran</span>
                      <strong className="text-white font-semibold">~14 MB</strong>
                    </div>
                    <div className="border-x border-white/10">
                      <span className="block text-slate-400 text-[10px]">Sistem</span>
                      <strong className="text-white font-semibold">Android 7+</strong>
                    </div>
                    <div>
                      <span className="block text-slate-400 text-[10px]">Lisensi</span>
                      <strong className="text-emerald-300 font-semibold">Gratis</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Button */}
              <div className="mt-6">
                <a
                  href={apkDownloadUrl}
                  download="masjid-al-mukhlisin.apk"
                  className="w-full inline-flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-950/50 border border-emerald-300/40 transition-all hover:scale-[1.01] active:scale-95"
                >
                  <Download size={18} />
                  <span>Unduh APK Sekarang</span>
                </a>
              </div>

              <p className="mt-3 text-[11px] text-center text-emerald-200/60 flex items-center justify-center gap-1.5">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Terverifikasi aman & bebas iklan mengganggu</span>
              </p>
            </div>
          </div>
        </section>

        {/* --- FITUR UNGGULAN APLIKASI --- */}
        <section className="py-6 sm:py-14 px-3 sm:px-6 lg:px-8 mx-auto max-w-6xl">
          <div className="text-center mb-4 sm:mb-8">
            <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#0d8a5e] uppercase">
              FITUR UTAMA
            </span>
            <h3 className="font-serif-elegant text-lg sm:text-2xl md:text-3xl font-bold text-[#0a1f18] mt-0.5 sm:mt-1">
              Semua Layanan Masjid dalam Satu Sentuhan
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-4 md:gap-5">
            {/* Fitur 1 */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-5 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1 sm:mb-3">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Clock size={15} className="sm:w-5 sm:h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-base leading-tight">
                  Jadwal Shalat
                </h4>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed">
                Waktu shalat resmi Kemenag RI, hitung mundur & kalender Hijriah.
              </p>
            </div>

            {/* Fitur 2 */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-5 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1 sm:mb-3">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Layers size={15} className="sm:w-5 sm:h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-base leading-tight">
                  Kas Terbuka
                </h4>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed">
                Pantau saldo, infaq jamaah, dan laporan kas secara transparan.
              </p>
            </div>

            {/* Fitur 3 */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-5 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1 sm:mb-3">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <FileCheck size={15} className="sm:w-5 sm:h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-base leading-tight">
                  Agenda & Khutbah
                </h4>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed">
                Jadwal khatib & imam Shalat Jumat serta agenda pengajian rutin.
              </p>
            </div>

            {/* Fitur 4 */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-5 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1 sm:mb-3">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <HeartHandshake size={15} className="sm:w-5 sm:h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-base leading-tight">
                  Kalkulator Zakat
                </h4>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed">
                Hitung nisab zakat fitrah & zakat maal mudah langsung dari HP.
              </p>
            </div>

            {/* Fitur 5 */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-5 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1 sm:mb-3">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Zap size={15} className="sm:w-5 sm:h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-base leading-tight">
                  Ringan & Cepat
                </h4>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed">
                Ukuran hemat (~14 MB), loading instan, dan hemat kuota data.
              </p>
            </div>

            {/* Fitur 6 */}
            <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-5 shadow-2xs hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 mb-1 sm:mb-3">
                <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-emerald-50 text-[#0d8a5e] flex items-center justify-center shrink-0">
                  <Lock size={15} className="sm:w-5 sm:h-5" />
                </div>
                <h4 className="font-bold text-slate-900 text-xs sm:text-base leading-tight">
                  Kotak Saran
                </h4>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-600 leading-snug sm:leading-relaxed">
                Kirimkan kritik, usulan fasilitas, dan aspirasi ke pengurus DKM.
              </p>
            </div>
          </div>
        </section>

        {/* --- PANDUAN INSTALASI --- */}
        <section className="py-6 sm:py-12 px-3 sm:px-6 lg:px-8 bg-white border-y border-slate-200/80">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-4 sm:mb-8">
              <span className="text-[10px] sm:text-[11px] font-black tracking-widest text-[#0d8a5e] uppercase">
                PANDUAN PRAKTIS
              </span>
              <h3 className="font-serif-elegant text-lg sm:text-2xl md:text-3xl font-bold text-[#0a1f18] mt-0.5 sm:mt-1">
                4 Langkah Mudah Memasang APK di HP Android
              </h3>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4">
              <div className="bg-[#f4f7f6] p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#0d8a5e] text-white font-bold flex items-center justify-center text-[10px] sm:text-xs shrink-0">
                    1
                  </span>
                  <h5 className="font-bold text-xs sm:text-sm text-[#0a1f18] leading-tight">
                    Unduh APK
                  </h5>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-600 leading-snug">
                  Klik tombol <strong>Unduh APK</strong> dan tunggu unduhan selesai.
                </p>
              </div>

              <div className="bg-[#f4f7f6] p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#0d8a5e] text-white font-bold flex items-center justify-center text-[10px] sm:text-xs shrink-0">
                    2
                  </span>
                  <h5 className="font-bold text-xs sm:text-sm text-[#0a1f18] leading-tight">
                    Buka File
                  </h5>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-600 leading-snug">
                  Buka notifikasi atau file <code>.apk</code> di folder <em>Download</em> HP.
                </p>
              </div>

              <div className="bg-[#f4f7f6] p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#0d8a5e] text-white font-bold flex items-center justify-center text-[10px] sm:text-xs shrink-0">
                    3
                  </span>
                  <h5 className="font-bold text-xs sm:text-sm text-[#0a1f18] leading-tight">
                    Izinkan Sumber
                  </h5>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-600 leading-snug">
                  Jika ada notif keamanan, pilih <strong>Setelan</strong> &rarr; <strong>Tetap Install</strong>.
                </p>
              </div>

              <div className="bg-[#f4f7f6] p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-200">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <span className="w-5 h-5 sm:w-7 sm:h-7 rounded-full bg-[#0d8a5e] text-white font-bold flex items-center justify-center text-[10px] sm:text-xs shrink-0">
                    4
                  </span>
                  <h5 className="font-bold text-xs sm:text-sm text-[#0a1f18] leading-tight">
                    Selesai!
                  </h5>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-600 leading-snug">
                  Aplikasi Masjid Al-Mukhlisin siap dibuka di ponsel Anda.
                </p>
              </div>
            </div>

            <div className="mt-3.5 sm:mt-6 p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-2.5">
              <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5 sm:w-5 sm:h-5" />
              <div className="text-[10px] sm:text-xs text-amber-900 leading-snug">
                <strong>Catatan Keamanan Android:</strong> Peringatan <em>"File mungkin berbahaya"</em> atau <em>"Install unknown apps"</em> adalah standar keamanan Android untuk APK mandiri. Aman melanjutkan dengan memilih <strong>Tetap Download / Tetap Install</strong>.
              </div>
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <h3 className="font-serif-elegant text-2xl font-bold text-[#0a1f18]">
              Pertanyaan yang Sering Diajukan (FAQ)
            </h3>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden shadow-2xs transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-4.5 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-800 hover:text-emerald-800"
                  >
                    <span>{faq.q}</span>
                    <span className="text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4.5 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      <div className="pt-3">{faq.a}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* --- FOOTER KECIL --- */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} DKM Masjid Al-Mukhlisin Lagadar. Hak Cipta Dilindungi.</p>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav variant="public" />
    </div>
  );
}
