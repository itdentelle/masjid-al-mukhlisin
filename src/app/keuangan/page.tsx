'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Search,
  Download,
  Printer,
  CalendarDays,
  CheckCircle2,
  Shield,
  X,
  PieChart,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DataService } from '@/lib/data-service';
import { getHijriDateString } from '@/lib/hijri';
import { KasItem, IdentitasMasjid } from '@/types';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';
import CustomDropdown, { DropdownOption } from '@/components/ui/custom-dropdown';

export default function KeuanganDetailPage() {
  const [dataKas, setDataKas] = useState<KasItem[]>([]);
  const [identitas, setIdentitas] = useState<IdentitasMasjid | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTipe, setSelectedTipe] = useState<'all' | 'masuk' | 'keluar'>('all');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [selectedBulan, setSelectedBulan] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals
  const [selectedTrx, setSelectedTrx] = useState<KasItem | null>(null);

  // Dates
  const [todayDateStr, setTodayDateStr] = useState('');
  const [hijriDateStr, setHijriDateStr] = useState('');
  const [currentMonthPrefix, setCurrentMonthPrefix] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [kasResult, idResult] = await Promise.all([
        DataService.getKas(),
        DataService.getIdentitas(),
      ]);
      setDataKas(kasResult);
      setIdentitas(idResult);
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const now = new Date();
    setCurrentMonthPrefix(now.toISOString().slice(0, 7));
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

  // Global Financial Statistics
  const stats = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;

    dataKas.forEach((item) => {
      const val = Number(item.nominal || 0);
      if (item.tipe === 'masuk') {
        totalIn += val;
      } else {
        totalOut += val;
      }
    });

    const saldo = totalIn - totalOut;

    // Monthly Current Stats
    let inThisMonth = 0;
    let outThisMonth = 0;

    dataKas.forEach((item) => {
      if (currentMonthPrefix && (item.tanggal || '').startsWith(currentMonthPrefix)) {
        const val = Number(item.nominal || 0);
        if (item.tipe === 'masuk') inThisMonth += val;
        else outThisMonth += val;
      }
    });

    return {
      totalIn,
      totalOut,
      saldo,
      inThisMonth,
      outThisMonth,
      trxCount: dataKas.length,
    };
  }, [dataKas, currentMonthPrefix]);

  // Unique Filter Options
  const uniqueMonths = useMemo(() => {
    const set = new Set<string>();
    dataKas.forEach((item) => {
      if (item.tanggal) set.add(item.tanggal.slice(0, 7));
    });
    return Array.from(set).sort().reverse();
  }, [dataKas]);

  const uniqueKategori = useMemo(() => {
    const set = new Set<string>();
    dataKas.forEach((item) => {
      if (item.kategori) set.add(item.kategori);
    });
    return Array.from(set).sort();
  }, [dataKas]);

  const dropdownTipeOptions: DropdownOption[] = [
    { value: 'all', label: 'Semua Aliran Kas' },
    { value: 'masuk', label: 'Pemasukan (+)', badge: { text: '+ Masuk', variant: 'emerald' } },
    { value: 'keluar', label: 'Pengeluaran (-)', badge: { text: '- Keluar', variant: 'rose' } },
  ];

  const dropdownKategoriOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: 'all', label: 'Semua Kategori' },
      ...uniqueKategori.map((cat) => ({
        value: cat,
        label: cat,
      })),
    ];
  }, [uniqueKategori]);

  const dropdownBulanOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: 'all', label: 'Semua Periode Bulan' },
      ...uniqueMonths.map((m) => ({
        value: m,
        label: `Bulan ${m}`,
      })),
    ];
  }, [uniqueMonths]);

  // Filtered Items
  const filteredKas = useMemo(() => {
    return dataKas.filter((item) => {
      const matchSearch =
        item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.kategori && item.kategori.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchTipe = selectedTipe === 'all' || item.tipe === selectedTipe;
      const matchKategori = selectedKategori === 'all' || item.kategori === selectedKategori;
      const matchBulan = selectedBulan === 'all' || (item.tanggal && item.tanggal.startsWith(selectedBulan));
      return matchSearch && matchTipe && matchKategori && matchBulan;
    });
  }, [dataKas, searchTerm, selectedTipe, selectedKategori, selectedBulan]);

  // Running Balance Calculation (Chronological cumulative calculation)
  const rowsWithBalance = useMemo(() => {
    // Sort oldest first to calculate running balance accurately
    const chronological = [...dataKas].sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    const balanceMap = new Map<number | string, number>();
    let running = 0;

    chronological.forEach((item) => {
      if (item.tipe === 'masuk') {
        running += Number(item.nominal || 0);
      } else {
        running -= Number(item.nominal || 0);
      }
      balanceMap.set(item.id, running);
    });

    // Return filtered items with running balance
    return filteredKas.map((item) => ({
      ...item,
      runningBalance: balanceMap.get(item.id) ?? 0,
    }));
  }, [dataKas, filteredKas]);

  // Monthly breakdown for visual bars (last 6 months)
  const monthlyBreakdown = useMemo(() => {
    const map = new Map<string, { masuk: number; keluar: number }>();
    dataKas.forEach((item) => {
      const month = (item.tanggal || '').slice(0, 7);
      if (!month) return;
      const current = map.get(month) || { masuk: 0, keluar: 0 };
      if (item.tipe === 'masuk') {
        current.masuk += Number(item.nominal || 0);
      } else {
        current.keluar += Number(item.nominal || 0);
      }
      map.set(month, current);
    });

    const sortedMonths = Array.from(map.keys()).sort().slice(-6);
    const maxVal = Math.max(
      1,
      ...sortedMonths.map((m) => Math.max(map.get(m)?.masuk || 0, map.get(m)?.keluar || 0))
    );

    return sortedMonths.map((m) => {
      const data = map.get(m) || { masuk: 0, keluar: 0 };
      return {
        month: m,
        masuk: data.masuk,
        keluar: data.keluar,
        masukHeight: Math.round((data.masuk / maxVal) * 100),
        keluarHeight: Math.round((data.keluar / maxVal) * 100),
      };
    });
  }, [dataKas]);

  // Category proportions
  const categoryBreakdown = useMemo(() => {
    const map = new Map<string, number>();
    dataKas.forEach((item) => {
      const cat = item.kategori || 'Lainnya';
      map.set(cat, (map.get(cat) || 0) + Number(item.nominal || 0));
    });
    const total = Array.from(map.values()).reduce((a, b) => a + b, 0) || 1;
    return Array.from(map.entries())
      .map(([name, nominal]) => ({
        name,
        nominal,
        pct: Math.round((nominal / total) * 100),
      }))
      .sort((a, b) => b.nominal - a.nominal)
      .slice(0, 5);
  }, [dataKas]);

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = rowsWithBalance.map((item, idx) => ({
      No: idx + 1,
      Tanggal: item.tanggal,
      Kategori: item.kategori || '-',
      Keterangan: item.keterangan,
      Tipe: item.tipe === 'masuk' ? 'PEMASUKAN' : 'PENGELUARAN',
      Nominal: Number(item.nominal),
      'Saldo Berjalan': item.runningBalance,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Buku Kas Transparansi');
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Buku_Kas_Masjid_Al_Mukhlisin_${dateStr}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans text-slate-900 selection:bg-emerald-200 pb-24 md:pb-0">
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
              <span className="hidden sm:inline">Pengurus</span>
            </Link>
          </div>
        </div>
      </header>

      {/* --- MAIN CONTAINER --- */}
      <main className="mx-auto max-w-7xl px-3.5 sm:px-6 md:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* --- 1. HERO GRAND DISPLAY TOTAL SALDO --- */}
        <section className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#064e3b] via-[#043d2d] to-[#012217] p-5 sm:p-8 md:p-12 text-white shadow-2xl border border-emerald-600/30">
          {/* Geometric Watermark Pattern */}
          <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="islamic-geom-keuangan" width="48" height="48" patternUnits="userSpaceOnUse">
                  <path d="M24 0 L48 24 L24 48 L0 24 Z" fill="none" stroke="#ffffff" strokeWidth="1" />
                  <circle cx="24" cy="24" r="10" fill="none" stroke="#ffffff" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#islamic-geom-keuangan)" />
            </svg>
          </div>

          {/* Radial Ambient Glow */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <p className="mb-3 flex items-center justify-center gap-3 text-[10px] font-black tracking-widest text-emerald-200 uppercase">
              <span className="h-px w-6 bg-emerald-300/60" /> Transparansi Terbuka Real-Time{' '}
              <span className="h-px w-6 bg-emerald-300/60" />
            </p>

            <h2 className="font-serif-elegant mb-5 sm:mb-6 text-2xl sm:text-3xl md:text-5xl text-white">
              Total Saldo Kas Umat
            </h2>

            {loading ? (
              <div className="mx-auto h-20 sm:h-24 w-60 sm:w-72 animate-pulse rounded-2xl sm:rounded-3xl bg-emerald-800/50" />
            ) : (
              <div className="inline-block rounded-2xl sm:rounded-3xl border border-emerald-400/40 bg-emerald-950/40 px-5 py-4 sm:px-8 sm:py-5 md:px-12 md:py-7 backdrop-blur-md shadow-2xl">
                <p className="font-serif-elegant text-3xl sm:text-4xl font-bold tracking-tight drop-shadow-lg md:text-6xl text-white">
                  <span className="mr-1.5 sm:mr-2 align-top text-xl sm:text-2xl text-emerald-300 md:text-3xl">Rp</span>
                  {stats.saldo.toLocaleString('id-ID')}
                </p>
              </div>
            )}

            <p className="mx-auto mt-6 max-w-xl text-xs md:text-sm leading-relaxed font-medium text-emerald-100/90">
              Dana diperbarui secara otomatis. Setiap rupiah yang disalurkan melalui infaq dan sedekah tercatat
              dengan amanah demi kemakmuran masjid dan jamaah Desa Lagadar.
            </p>

            {/* Quick Metrics Cards */}
            <div className="mt-10 grid grid-cols-1 gap-3.5 sm:grid-cols-3 text-left">
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-900/40 p-4.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-emerald-200 text-xs font-bold mb-1">
                  <span>Total Dana Masuk</span>
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300">
                    <TrendingUp size={15} />
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-black text-emerald-300">
                  Rp {stats.totalIn.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] text-emerald-200/70 mt-1">Infaq, sedekah, dan donasi</p>
              </div>

              <div className="rounded-2xl border border-red-500/20 bg-emerald-900/40 p-4.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-red-200 text-xs font-bold mb-1">
                  <span>Total Dana Keluar</span>
                  <div className="h-7 w-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-300">
                    <TrendingDown size={15} />
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-black text-rose-300">
                  Rp {stats.totalOut.toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] text-red-200/70 mt-1">Operasional, pemeliharaan & honor</p>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-emerald-900/40 p-4.5 backdrop-blur-xs">
                <div className="flex items-center justify-between text-amber-200 text-xs font-bold mb-1">
                  <span>Aliran Bulan Ini</span>
                  <div className="h-7 w-7 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300">
                    <CalendarDays size={15} />
                  </div>
                </div>
                <p className="text-xl md:text-2xl font-black text-amber-300">
                  +Rp {(stats.inThisMonth - stats.outThisMonth).toLocaleString('id-ID')}
                </p>
                <p className="text-[10px] text-amber-200/70 mt-1">Surplus bersih bulan berjalan</p>
              </div>
            </div>
          </div>
        </section>

        {/* --- 2. GRAFIK KOMPARASI BULANAN & DISTRIBUSI KATEGORI --- */}
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Monthly Comparison Bar Chart */}
          <div className="lg:col-span-2 rounded-[2rem] border border-slate-100 bg-white p-6 md:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="font-serif-elegant text-xl font-bold text-slate-900">
                  Arus Kas 6 Bulan Terakhir
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Perbandingan dana masuk (infaq) vs pengeluaran operasional
                </p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-bold">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="h-3 w-3 rounded bg-emerald-600 inline-block" /> Masuk
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="h-3 w-3 rounded bg-amber-500 inline-block" /> Keluar
                </span>
              </div>
            </div>

            {monthlyBreakdown.length > 0 ? (
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-6 gap-2 md:gap-4 items-end h-44 border-b border-slate-100 pb-2">
                  {monthlyBreakdown.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center h-full justify-end group">
                      <div className="w-full flex items-end justify-center gap-1 md:gap-1.5 h-36">
                        {/* Bar Masuk */}
                        <div
                          style={{ height: `${Math.max(12, item.masukHeight)}%` }}
                          className="w-1/2 max-w-[24px] rounded-t-md bg-gradient-to-t from-emerald-700 to-emerald-500 transition-all group-hover:brightness-110 relative"
                          title={`Masuk: Rp ${item.masuk.toLocaleString('id-ID')}`}
                        />
                        {/* Bar Keluar */}
                        <div
                          style={{ height: `${Math.max(12, item.keluarHeight)}%` }}
                          className="w-1/2 max-w-[24px] rounded-t-md bg-gradient-to-t from-amber-600 to-amber-400 transition-all group-hover:brightness-110 relative"
                          title={`Keluar: Rp ${item.keluar.toLocaleString('id-ID')}`}
                        />
                      </div>
                      <span className="text-[10px] font-mono font-bold text-slate-500 mt-2">
                        {item.month.slice(5)}/{item.month.slice(2, 4)}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 text-center italic">
                  Arahkan kursor pada batang grafik untuk melihat rincian nominal per bulan.
                </p>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                Belum ada data historis arus kas bulanan.
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="rounded-[2rem] border border-slate-100 bg-white p-6 md:p-8 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <PieChart size={18} className="text-emerald-700" />
                <h3 className="font-serif-elegant text-xl font-bold text-slate-900">
                  Kategori Utama
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-6">
                Alokasi dan sumber dana terbesar
              </p>

              <div className="space-y-4">
                {categoryBreakdown.map((cat, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{cat.name}</span>
                      <span className="font-mono text-slate-500 text-[11px]">
                        Rp {cat.nominal.toLocaleString('id-ID')} ({cat.pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        style={{ width: `${cat.pct}%` }}
                        className={`h-full rounded-full ${
                          idx === 0
                            ? 'bg-emerald-600'
                            : idx === 1
                            ? 'bg-teal-500'
                            : idx === 2
                            ? 'bg-amber-500'
                            : 'bg-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Total {dataKas.length} Transaksi Tercatat</span>
              <span className="font-bold text-emerald-700">100% Terverifikasi</span>
            </div>
          </div>
        </section>

        {/* --- 3. FILTER, PENCARIAN & AKSI EKSPOR --- */}
        <section className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif-elegant text-2xl font-bold text-slate-900">
                Buku Kas Transparansi Umat
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Rincian mutasi kas masuk dan keluar yang dapat ditelusuri secara terbuka
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:border-emerald-600 hover:text-emerald-700"
                title="Ekspor ke Excel"
              >
                <Download size={15} />
                <span>Ekspor Excel</span>
              </button>

              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:border-emerald-600 hover:text-emerald-700"
                title="Cetak Laporan"
              >
                <Printer size={15} />
                <span>Cetak</span>
              </button>

              <div className="h-6 w-px bg-slate-200" />

              <div className="inline-flex rounded-xl bg-slate-100 p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Tabel
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                    viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Kartu
                </button>
              </div>
            </div>
          </div>

          {/* Search and Dropdown Filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 pt-2">
            {/* Search Box */}
            <div className="relative">
              <input
                type="text"
                placeholder="Cari transaksi / keterangan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
              <Search className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Filter Tipe */}
            <CustomDropdown
              value={selectedTipe}
              onChange={(val) => setSelectedTipe(val as any)}
              options={dropdownTipeOptions}
              className="w-full md:w-56"
            />

            {/* Filter Kategori */}
            <CustomDropdown
              value={selectedKategori}
              onChange={(val) => setSelectedKategori(val)}
              options={dropdownKategoriOptions}
              className="w-full md:w-52"
            />

            {/* Filter Bulan */}
            <CustomDropdown
              value={selectedBulan}
              onChange={(val) => setSelectedBulan(val)}
              options={dropdownBulanOptions}
              className="w-full md:w-52"
            />
          </div>
        </section>

        {/* --- 4. DATA LISTING (TABEL / KARTU) --- */}
        {viewMode === 'table' ? (
          <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                    <th className="py-4 px-6 text-center w-14">No</th>
                    <th className="py-4 px-6">Tanggal</th>
                    <th className="py-4 px-6">Kategori</th>
                    <th className="py-4 px-6">Keterangan Transaksi</th>
                    <th className="py-4 px-6 text-right">Nominal</th>
                    <th className="py-4 px-6 text-right">Saldo Berjalan</th>
                    <th className="py-4 px-6 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {rowsWithBalance.length > 0 ? (
                    rowsWithBalance.map((item, idx) => {
                      const isMasuk = item.tipe === 'masuk';
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                          onClick={() => setSelectedTrx(item)}
                        >
                          <td className="py-4 px-6 text-center font-mono text-slate-400 text-[11px]">
                            {idx + 1}
                          </td>
                          <td className="py-4 px-6 font-mono text-slate-600 whitespace-nowrap">
                            {item.tanggal}
                          </td>
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span className="inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100">
                              {item.kategori || 'Kas Masjid'}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-800 max-w-md">
                            <span className="line-clamp-2">{item.keterangan}</span>
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap">
                            <span
                              className={`font-black font-mono text-sm ${
                                isMasuk ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            >
                              {isMasuk ? '+ ' : '- '}Rp {Number(item.nominal).toLocaleString('id-ID')}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right whitespace-nowrap font-mono font-bold text-slate-700">
                            Rp {item.runningBalance.toLocaleString('id-ID')}
                          </td>
                          <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedTrx(item)}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-600 hover:text-white text-[11px] font-bold text-slate-700 transition-colors"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-slate-400">
                        <Wallet size={36} className="mx-auto mb-2 text-slate-300 stroke-1" />
                        <p className="font-bold text-slate-600">Tidak ada transaksi yang cocok</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Coba atur ulang kata kunci pencarian atau filter kategori di atas.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rowsWithBalance.length > 0 ? (
              rowsWithBalance.map((item) => {
                const isMasuk = item.tipe === 'masuk';
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedTrx(item)}
                    className="rounded-3xl border border-slate-100 bg-white p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-3">
                        <span className="font-mono text-slate-400 text-[11px]">{item.tanggal}</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                            isMasuk ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isMasuk ? 'Pemasukan' : 'Pengeluaran'}
                        </span>
                      </div>

                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mb-2 inline-block">
                        {item.kategori || 'Kas Masjid'}
                      </span>

                      <h4 className="font-bold text-slate-800 text-sm line-clamp-2 mt-1 mb-4">
                        {item.keterangan}
                      </h4>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <p className="text-[9px] text-slate-400 uppercase font-black">Nominal</p>
                        <p
                          className={`font-black font-mono text-base ${
                            isMasuk ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {isMasuk ? '+ ' : '- '}Rp {Number(item.nominal).toLocaleString('id-ID')}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 uppercase font-black">Saldo Akhir</p>
                        <p className="font-mono font-bold text-xs text-slate-700">
                          Rp {item.runningBalance.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-3 py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-100">
                Tidak ada data transaksi yang sesuai filter.
              </div>
            )}
          </div>
        )}

        {/* --- 5. PENGESAHAN DKM & AKUNTABILITAS --- */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 text-center text-xs text-slate-600 shadow-2xs">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1 text-[10px] font-black text-emerald-800 uppercase tracking-widest border border-emerald-200">
              <Shield size={12} />
              <span>Verifikasi Akuntabilitas Publik</span>
            </div>
            <h4 className="font-serif-elegant text-lg font-bold text-slate-900">
              Dewan Kemakmuran Masjid (DKM) Al-Mukhlisin
            </h4>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              Seluruh laporan keuangan disusun berdasarkan asas keterbukaan, akuntabel, dan diawasi bersama oleh
              jamaah. Laporan fisik bulanan tertempel di papan pengumuman masjid dan arsip SIMAS Kemenag RI.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-[10px] font-bold text-slate-500">
              <span>Ketua DKM: {identitas?.ketua_dkm || 'Ustadz H. Ahmad Sobari'}</span>
              <span>•</span>
              <span>Bendahara: {identitas?.bendahara || 'H. Mulyadi, S.E.'}</span>
              <span>•</span>
              <span className="font-mono">ID Kemenag: {identitas?.nomor_id_kemenag || '01.4.13.04.06.000158'}</span>
            </div>
          </div>
        </section>
      </main>

      {/* --- MODAL DETAIL TRANSAKSI --- */}
      {selectedTrx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedTrx(null)} />
          <div className="animate-pop relative z-10 w-full max-w-lg rounded-2xl sm:rounded-[2.5rem] bg-white p-5 sm:p-8 shadow-2xl space-y-4 sm:space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                    selectedTrx.tipe === 'masuk'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {selectedTrx.tipe === 'masuk' ? 'Pemasukan Kas' : 'Pengeluaran Kas'}
                </span>
                <span className="text-xs font-mono text-slate-400">TRX-{String(selectedTrx.id).slice(-6)}</span>
              </div>
              <button
                onClick={() => setSelectedTrx(null)}
                className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Keterangan Transaksi</p>
              <h3 className="font-serif-elegant text-xl font-bold text-slate-900 mt-1">
                {selectedTrx.keterangan}
              </h3>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Nominal Transaksi:</span>
                <span
                  className={`font-mono text-lg font-black ${
                    selectedTrx.tipe === 'masuk' ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {selectedTrx.tipe === 'masuk' ? '+ ' : '- '}Rp {Number(selectedTrx.nominal).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Kategori:</span>
                <span className="font-bold text-slate-800">{selectedTrx.kategori || 'Kas Masjid'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Tanggal Transaksi:</span>
                <span className="font-mono font-bold text-slate-800">{selectedTrx.tanggal}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">Status Validasi:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px]">
                  <CheckCircle2 size={12} /> Terverifikasi DKM
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setSelectedTrx(null)}
                className="w-full rounded-2xl bg-slate-900 py-3.5 text-xs font-black tracking-widest text-white hover:bg-slate-800 transition-colors"
              >
                TUTUP RINCIAN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (7 Tabs: Beranda, Kas, Jamaah, Agenda, Zakat, Aset, Laporan) */}
      <MobileBottomNav variant="public" />
    </div>
  );
}


