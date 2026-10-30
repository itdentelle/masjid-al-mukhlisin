'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Building,
  Wallet,
  HandHeart,
  Users,
  Package,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
  Shield,
  MapPin,
  Clock,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { exportExcelFile } from '@/lib/excel-export';
import { DataService } from '@/lib/data-service';
import { getHijriDateString } from '@/lib/hijri';
import {
  IdentitasMasjid,
  KasItem,
  JamaahItem,
  ZakatQurbanItem,
  InventoryItem,
  WakafItem,
  PetugasJumatItem,
} from '@/types';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';

export default function LaporanPublicPage() {
  const [identitas, setIdentitas] = useState<IdentitasMasjid>({
    nama: 'Al-Mukhlisin',
    nomor_id_kemenag: '01.4.13.04.06.000158',
    alamat: 'Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar',
    ketua_dkm: 'Ustadz H. Ahmad Sobari',
    bendahara: 'H. Mulyadi, S.E.',
  });
  const [kas, setKas] = useState<KasItem[]>([]);
  const [jamaah, setJamaah] = useState<JamaahItem[]>([]);
  const [zakat, setZakat] = useState<ZakatQurbanItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [wakaf, setWakaf] = useState<WakafItem[]>([]);
  const [petugasJumat, setPetugasJumat] = useState<PetugasJumatItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter Periode
  const [periode, setPeriode] = useState<'all' | 'month' | 'year'>('all');
  const [currentDateStr, setCurrentDateStr] = useState('');
  const [todayDateStr, setTodayDateStr] = useState('');
  const [hijriDateStr, setHijriDateStr] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [idData, kasData, jamData, zkData, invData, wkData, pjData] = await Promise.all([
        DataService.getIdentitas(),
        DataService.getKas(),
        DataService.getJamaah(),
        DataService.getZakatQurban(),
        DataService.getInventories(),
        DataService.getWakaf(),
        DataService.getPetugasJumat(),
      ]);
      setIdentitas(idData);
      setKas(kasData);
      setJamaah(jamData);
      setZakat(zkData);
      setInventory(invData);
      setWakaf(wkData);
      setPetugasJumat(pjData);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();

    const now = new Date();
    setCurrentDateStr(
      now.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    );
    setTodayDateStr(
      now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    );
    setHijriDateStr(getHijriDateString(now));
  }, []);

  // Filter Data by Periode
  const filteredKas = useMemo(() => {
    if (periode === 'all') return kas;
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7);
    const currentYear = now.getFullYear().toString();

    return kas.filter((item) => {
      if (!item.tanggal) return true;
      if (periode === 'month') return item.tanggal.startsWith(currentMonth);
      if (periode === 'year') return item.tanggal.startsWith(currentYear);
      return true;
    });
  }, [kas, periode]);

  // Financial Stats
  const finStats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    filteredKas.forEach((item) => {
      const n = Number(item.nominal || 0);
      if (item.tipe === 'masuk') totalIn += n;
      else totalOut += n;
    });
    return {
      totalIn,
      totalOut,
      saldo: totalIn - totalOut,
    };
  }, [filteredKas]);

  // Zakat Stats
  const zakatStats = useMemo(() => {
    let uang = 0;
    let beras = 0;
    let jiwa = 0;
    zakat.forEach((item) => {
      uang += Number(item.nominal || 0);
      beras += Number(item.beras_kg || 0);
      jiwa += Number(item.jumlah_jiwa || 0);
    });
    return { uang, beras, jiwa };
  }, [zakat]);

  // Format Currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Export Summary Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Identitas & Ringkasan
    const summaryData = [
      [`LAPORAN PERTANGGUNGJAWABAN DKM ${(identitas.nama || 'Al-Mukhlisin').toUpperCase()}`],
      ['Nomor SIMAS Kemenag RI', identitas.nomor_id_kemenag],
      ['Alamat', identitas.alamat],
      ['Tanggal Laporan', currentDateStr],
      ['Periode', periode === 'all' ? 'Seluruh Pembukuan' : periode === 'month' ? 'Bulan Ini' : 'Tahun Ini'],
      [],
      ['RINGKASAN KEUANGAN KAS'],
      ['Total Penerimaan Kas', finStats.totalIn],
      ['Total Pengeluaran Kas', finStats.totalOut],
      ['Saldo Kas Berjalan', finStats.saldo],
      [],
      ['RINGKASAN ZAKAT & INFAQ'],
      ['Total Zakat Uang', zakatStats.uang],
      ['Total Zakat Beras (kg)', zakatStats.beras],
      ['Jumlah Jiwa Muzakki', zakatStats.jiwa],
      [],
      ['RINGKASAN ASET & JAMAAH'],
      ['Total Aset Inventaris', inventory.length],
      ['Total Tanah/Aset Wakaf', wakaf.length],
      ['Total Jamaah Terdata', jamaah.length],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Eksekutif');

    // Sheet 2: Kas
    const kasData = filteredKas.map((k, i) => ({
      No: i + 1,
      Tanggal: k.tanggal,
      Tipe: k.tipe,
      Kategori: k.kategori,
      Nominal: k.nominal,
      Keterangan: k.keterangan || '-',
    }));
    const wsKas = XLSX.utils.json_to_sheet(kasData);
    XLSX.utils.book_append_sheet(wb, wsKas, 'Arus Kas');

    const safeNama = (identitas.nama || 'Al-Mukhlisin').replace(/[^a-zA-Z0-9_-]/g, '_');
    exportExcelFile(wb, `Laporan_Resmi_${safeNama}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans text-slate-900 selection:bg-emerald-200 pb-28 md:pb-12">
      {/* --- TOP BAR HEADER --- */}
      <header className="sticky top-0 z-40 border-b border-emerald-950/20 bg-[#0a1f18]/95 px-4 py-3.5 text-white backdrop-blur-md md:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200 transition-colors hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:inline">Beranda</span>
            </Link>

            <div className="h-5 w-px bg-white/20" />

            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-800/80 shadow-xs overflow-hidden">
                <img
                  src={identitas?.logo_url || '/icon.svg'}
                  alt={identitas?.nama || 'Masjid Al-Mukhlisin'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="font-serif-elegant text-sm font-bold tracking-wide text-white md:text-base leading-none">
                  Masjid {identitas?.nama || 'Al-Mukhlisin'}
                </h1>
                <p className="text-[9px] font-mono text-emerald-300/80 leading-tight mt-0.5">
                  ID SIMAS {identitas?.nomor_id_kemenag || '01.4.13.04.06.000158'} | Lagadar
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {todayDateStr && (
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-[10px] font-bold text-slate-300">{todayDateStr}</span>
                {hijriDateStr && (
                  <span className="text-[9px] font-mono text-amber-300">{hijriDateStr}</span>
                )}
              </div>
            )}

            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
            >
              <Shield size={13} className="text-emerald-400" />
              <span className="hidden sm:inline">Portal Pengurus</span>
            </Link>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a1f18] via-[#0d2a21] to-[#081a14] pt-10 pb-16 px-4 sm:px-6 md:px-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-900/60 px-3.5 py-1 text-[10px] font-black tracking-widest text-emerald-300 uppercase">
                <span>AKUNTABILITAS & TRANSPARANSI PUBLIK · SIMAS KEMENAG RI</span>
              </div>
              <h1 className="font-serif-elegant text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                Laporan Terbuka Masjid
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                Dokumen pertanggungjawaban terbuka DKM {identitas?.nama || 'Al-Mukhlisin'} meliputi transparansi keuangan kas, aset inventaris, wakaf tanah, kepengurusan jamaah, dan zakat.
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors shadow-xs"
              >
                <Download size={14} />
                <span>Unduh Excel</span>
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors shadow-md"
              >
                <Printer size={14} />
                <span>Cetak Lembar Resmi</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT CANVAS --- */}
      <main className="relative z-10 mx-auto max-w-5xl px-3.5 sm:px-6 md:px-8 -mt-8 space-y-6">
        {/* Periode Filter Pills */}
        <div className="rounded-2xl bg-white p-3.5 sm:p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-emerald-700" />
            <span className="text-xs font-bold text-slate-700">Pilih Periode Laporan:</span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {[
              { id: 'all', label: 'Seluruh Pembukuan' },
              { id: 'year', label: 'Tahun 2026' },
              { id: 'month', label: 'Bulan Ini' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setPeriode(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                  periode === tab.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Paper Canvas (Lembar Laporan Resmi Berstandar Cetak) */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-6 sm:p-10 space-y-8">
          {/* KOP SURAT RESMI */}
          <div className="border-b-2 border-slate-800 pb-5 text-center space-y-1.5 relative">
            <div className="flex items-center justify-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-emerald-800 border border-emerald-600 flex items-center justify-center shrink-0 overflow-hidden">
                <img
                  src={identitas?.logo_url || '/icon.svg'}
                  alt={identitas?.nama || 'Masjid Al-Mukhlisin'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="text-left">
                <h2 className="font-serif-elegant text-xl sm:text-2xl font-black text-slate-900 tracking-wide uppercase leading-tight">
                  DEWAN KEMAKMURAN MASJID {(identitas.nama || 'Al-Mukhlisin').toUpperCase()}
                </h2>
                <p className="text-xs font-semibold text-slate-600">
                  {identitas.alamat} · Kec. Margaasih, Kab. Bandung Barat
                </p>
                <p className="text-[10px] font-mono font-bold text-emerald-800">
                  ID SIMAS KEMENAG RI: {identitas.nomor_id_kemenag}
                </p>
              </div>
            </div>
          </div>

          {/* JUDUL DOKUMEN */}
          <div className="text-center space-y-1">
            <h3 className="font-bold text-base sm:text-lg text-slate-800 uppercase tracking-wider">
              LEMBAR LAPORAN PERTANGGUNGJAWABAN & TRANSPARANSI
            </h3>
            <p className="text-xs text-slate-500">
              Periode:{' '}
              <strong className="text-slate-800 font-bold">
                {periode === 'all'
                  ? 'Seluruh Riwayat Pembukuan'
                  : periode === 'year'
                  ? 'Tahun Berjalan 2026'
                  : 'Bulan Berjalan'}
              </strong>{' '}
              · Diterbitkan per tanggal {currentDateStr}
            </p>
          </div>

          {/* 1. SEKSI KEUANGAN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold text-sm">
              <Wallet size={16} className="text-emerald-700" />
              <span>I. REKAPITULASI KEUANGAN KAS UMMAT</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-emerald-50/80 p-3.5 border border-emerald-200/80">
                <span className="text-[10px] font-bold text-emerald-800 uppercase block">
                  Total Penerimaan Kas
                </span>
                <p className="text-base sm:text-lg font-black text-emerald-950 mt-1">
                  {formatRupiah(finStats.totalIn)}
                </p>
              </div>

              <div className="rounded-xl bg-rose-50/80 p-3.5 border border-rose-200/80">
                <span className="text-[10px] font-bold text-rose-800 uppercase block">
                  Total Pengeluaran Kas
                </span>
                <p className="text-base sm:text-lg font-black text-rose-950 mt-1">
                  {formatRupiah(finStats.totalOut)}
                </p>
              </div>

              <div className="rounded-xl bg-blue-50/80 p-3.5 border border-blue-200/80">
                <span className="text-[10px] font-bold text-blue-800 uppercase block">
                  Saldo Kas Terbuka
                </span>
                <p className="text-base sm:text-lg font-black text-blue-950 mt-1">
                  {formatRupiah(finStats.saldo)}
                </p>
              </div>
            </div>
          </div>

          {/* 2. SEKSI ZAKAT & INFAQ */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold text-sm">
              <HandHeart size={16} className="text-emerald-700" />
              <span>II. REKAPITULASI UNIT PENGUMPUL ZAKAT (UPZ)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Penerimaan Zakat Uang
                </span>
                <p className="text-base font-bold text-slate-800 mt-1">
                  {formatRupiah(zakatStats.uang)}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Penerimaan Zakat Beras
                </span>
                <p className="text-base font-bold text-slate-800 mt-1">
                  {zakatStats.beras} kg
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Jiwa Muzakki Tertunaikan
                </span>
                <p className="text-base font-bold text-slate-800 mt-1">
                  {zakatStats.jiwa} Jiwa
                </p>
              </div>
            </div>
          </div>

          {/* 3. SEKSI INVENTARIS & WAKAF */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200 text-slate-800 font-bold text-sm">
              <Package size={16} className="text-emerald-700" />
              <span>III. REKAPITULASI FASILITAS, ASET & WAKAF</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Barang Inventaris Fasilitas
                </span>
                <p className="text-base font-bold text-slate-800 mt-1">{inventory.length} Barang</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Tanah / Aset Wakaf Terkelola
                </span>
                <p className="text-base font-bold text-slate-800 mt-1">{wakaf.length} Bidang</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">
                  Data Warga Jamaah Terdaftar
                </span>
                <p className="text-base font-bold text-slate-800 mt-1">{jamaah.length} Orang</p>
              </div>
            </div>
          </div>

          {/* TANDA TANGAN RESMI PENGURUS */}
          <div className="pt-8 border-t border-slate-200">
            <p className="text-right text-xs text-slate-600 mb-6">
              Lagadar, {currentDateStr}
            </p>

            <div className="grid grid-cols-2 gap-8 text-center text-xs">
              <div className="space-y-16">
                <p className="font-bold text-slate-700">Mengetahui,<br />Ketua DKM {identitas.nama || 'Al-Mukhlisin'}</p>
                <div>
                  <p className="font-bold text-slate-900 underline text-sm">
                    {identitas.ketua_dkm || 'Ustadz H. Ahmad Sobari'}
                  </p>
                  <p className="text-[10px] text-slate-500">Penanggung Jawab Kemakmuran</p>
                </div>
              </div>

              <div className="space-y-16">
                <p className="font-bold text-slate-700">Disusun oleh,<br />Bendahara DKM</p>
                <div>
                  <p className="font-bold text-slate-900 underline text-sm">
                    {identitas.bendahara || 'H. Mulyadi, S.E.'}
                  </p>
                  <p className="text-[10px] text-slate-500">Amanah Kas Keuangan Ummat</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
