'use client';

import React, { useState } from 'react';
import {
  QrCode,
  X,
  Download,
  Copy,
  CheckCircle2,
  Heart,
  ExternalLink,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import { IdentitasMasjid } from '@/types';

interface QrisDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
  identitas: IdentitasMasjid | null;
}

export default function QrisDonationModal({
  isOpen,
  onClose,
  identitas,
}: QrisDonationModalProps) {
  const [copiedRekening, setCopiedRekening] = useState(false);

  if (!isOpen) return null;

  const mosqueName = identitas?.nama || 'Masjid';
  const qrisUrl = identitas?.qris_url;
  const rekeningBank = identitas?.rekening_bank;

  const handleCopyRekening = () => {
    if (!rekeningBank) return;
    navigator.clipboard.writeText(rekeningBank);
    setCopiedRekening(true);
    setTimeout(() => setCopiedRekening(false), 2500);
  };

  const handleDownloadQris = () => {
    if (!qrisUrl) return;
    const a = document.createElement('a');
    a.href = qrisUrl;
    a.download = `QRIS_Donasi_${mosqueName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#0a1f18] via-[#0f382a] to-[#0a1f18] text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-900/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <QrCode size={20} />
            </span>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-snug">
                Infaq & Donasi QRIS
              </h3>
              <p className="text-[11px] text-emerald-200/80">
                Masjid {mosqueName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
            title="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 text-slate-800 text-xs">
          {qrisUrl ? (
            <>
              {/* QRIS Card Display */}
              <div className="relative mx-auto w-full max-w-[280px] bg-white rounded-2xl p-4 border-2 border-emerald-500/30 shadow-lg flex flex-col items-center">
                {/* QRIS Official Header Badge */}
                <div className="w-full flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  <span className="flex items-center gap-1 text-rose-600 font-extrabold tracking-wider">
                    QRIS
                  </span>
                  <span className="text-[9px] text-slate-400 font-sans">
                    Pembayaran Digital
                  </span>
                </div>

                {/* QR Code Image */}
                <div className="w-full aspect-square bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-1.5 border border-slate-200/80">
                  <img
                    src={qrisUrl}
                    alt={`QRIS Donasi Masjid ${mosqueName}`}
                    className="w-full h-full object-contain select-none"
                  />
                </div>

                <p className="text-[11px] font-bold text-slate-800 mt-2.5 text-center">
                  DKM Masjid {mosqueName}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200/80 rounded-full px-2.5 py-0.5 mt-1 font-semibold">
                  <ShieldCheck size={11} className="text-emerald-600" />
                  NMID Terverifikasi
                </span>
              </div>

              {/* Action Buttons: Download QRIS */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleDownloadQris}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-900/15 transition active:scale-95 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Simpan Gambar QRIS</span>
                </button>
              </div>

              {/* Rekening Info if available */}
              {rekeningBank && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Atau Transfer Manual via Rekening Bank:
                  </p>
                  <div className="flex items-center justify-between gap-2 p-2.5 bg-white rounded-xl border border-slate-200 text-xs font-mono font-bold text-slate-800">
                    <span className="truncate">{rekeningBank}</span>
                    <button
                      onClick={handleCopyRekening}
                      className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-sans font-bold border border-emerald-200 transition cursor-pointer"
                      title="Salin nomor rekening"
                    >
                      {copiedRekening ? (
                        <>
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Salin</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Cara Bayar Guide */}
              <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/60 p-3.5 space-y-2 text-[11px] text-slate-700">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <Smartphone size={13} className="text-emerald-700" />
                  <span>Cara Mudah Berinfaq via QRIS:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1 leading-relaxed">
                  <li>Buka aplikasi m-Banking (BSI, BCA, Mandiri, BRI) atau e-Wallet (GoPay, OVO, DANA, LinkAja).</li>
                  <li>Pilih menu <strong>Bayar / Scan QRIS</strong>.</li>
                  <li>Arahkan kamera ke barcode di atas (atau pilih gambar dari galeri).</li>
                  <li>Masukkan nominal infaq yang ingin Anda niatkan, lalu konfirmasi pembayaran.</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="text-center py-8 px-4 space-y-3">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center">
                <QrCode size={32} />
              </div>
              <h4 className="font-bold text-slate-800 text-sm">
                Barcode QRIS Belum Diunggah
              </h4>
              <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                Pengurus DKM Masjid {mosqueName} belum mengunggah barcode QRIS resmi. Anda dapat menyalurkan infaq secara langsung ke kotak infaq masjid atau hubungi pengurus DKM.
              </p>
              {rekeningBank && (
                <div className="pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Rekening Transfer Tersedia:
                  </p>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl font-mono text-xs font-bold text-slate-700">
                    <span>{rekeningBank}</span>
                    <button
                      onClick={handleCopyRekening}
                      className="text-emerald-700 hover:text-emerald-800"
                    >
                      <Copy size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <span className="flex items-center gap-1.5">
            <Heart size={12} className="text-rose-500 fill-rose-500" />
            Semoga menjadi amal jariyah Anda
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}

