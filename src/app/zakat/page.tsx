'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  HandHeart,
  Search,
  ArrowLeft,
  Shield,
  Download,
  Printer,
  X,
  Coins,
  Wheat,
  Scale,
  Users2,
  Calculator,
  QrCode,
  Building,
  CheckCircle2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getHijriDateString } from '@/lib/hijri';
import { DataService } from '@/lib/data-service';
import { ZakatQurbanItem, IdentitasMasjid } from '@/types';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';

export default function ZakatPublicPage() {
  const [dataZakat, setDataZakat] = useState<ZakatQurbanItem[]>([]);
  const [identitas, setIdentitas] = useState<IdentitasMasjid | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJenis, setSelectedJenis] = useState<string>('all');

  // Dates
  const [todayDateStr, setTodayDateStr] = useState('');
  const [hijriDateStr, setHijriDateStr] = useState('');

  // Interactive Zakat Calculator State
  const [calcTab, setCalcTab] = useState<'fitrah' | 'maal' | 'fidyah'>('fitrah');
  const [fitrahJiwa, setFitrahJiwa] = useState<number>(1);
  const [hargaBerasPerJiwa, setHargaBerasPerJiwa] = useState<number>(45000);
  const [maalHarta, setMaalHarta] = useState<number>(100000000);
  const [fidyahHari, setFidyahHari] = useState<number>(1);

  const loadData = async () => {
    setLoading(true);
    try {
      const [zakatRes, idRes] = await Promise.all([
        DataService.getZakatQurban(),
        DataService.getIdentitas(),
      ]);
      setDataZakat(zakatRes);
      setIdentitas(idRes);
    } catch (err) {
      console.error('Failed to load zakat data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const now = new Date();
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

  // Stats Calculation
  const stats = useMemo(() => {
    let totalUang = 0;
    let totalBerasKg = 0;
    let totalJiwa = 0;

    dataZakat.forEach((item) => {
      totalUang += Number(item.nominal || 0);
      totalBerasKg += Number(item.beras_kg || 0);
      totalJiwa += Number(item.jumlah_jiwa || 0);
    });

    return { totalUang, totalBerasKg, totalJiwa, count: dataZakat.length };
  }, [dataZakat]);

  // Filtered Data
  const filteredData = useMemo(() => {
    return dataZakat.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.keterangan && item.keterangan.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchJenis = selectedJenis === 'all' || item.jenis === selectedJenis;
      return matchSearch && matchJenis;
    });
  }, [dataZakat, searchTerm, selectedJenis]);

  // Format Currency
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(val);
  };

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredData.map((item, index) => ({
      No: index + 1,
      Tanggal: item.tanggal,
      Muzakki: item.nama,
      'Jenis ZIS': item.jenis,
      'Jumlah Jiwa': item.jumlah_jiwa,
      'Beras (kg)': item.beras_kg,
      Nominal: item.nominal,
      Keterangan: item.keterangan || '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transparansi ZIS');
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Laporan_ZIS_Al_Mukhlisin_${dateStr}.xlsx`);
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
                <span>UNIT PENGUMPUL ZAKAT (UPZ) · MASJID {(identitas?.nama || 'Al-Mukhlisin').toUpperCase()}</span>
              </div>
              <h1 className="font-serif-elegant text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                Layanan Zakat & Infaq
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                Penyaluran zakat fitrah, zakat maal, infaq, shadaqah, dan fidyah terpadu untuk warga mustahik Kp. Jalan Cagak Lagadar secara amanah dan transparan.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors shadow-xs"
              >
                <Download size={14} />
                <span>Unduh Laporan</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- STAT CARDS & CALCULATOR --- */}
      <main className="relative z-10 mx-auto max-w-7xl px-3.5 sm:px-6 md:px-8 -mt-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Coins size={22} className="text-emerald-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Zakat Tunai Terkumpul
              </span>
              <p className="text-lg sm:text-xl font-black text-slate-800">
                {formatRupiah(stats.totalUang)}
              </p>
              <span className="text-[10px] text-slate-500">Dana Masuk ZIS</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Wheat size={22} className="text-amber-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Zakat Fitrah Beras
              </span>
              <p className="text-lg sm:text-xl font-black text-slate-800">
                {stats.totalBerasKg} <span className="text-xs font-normal text-slate-500">kg</span>
              </p>
              <span className="text-[10px] text-slate-500">Beras Tersedia</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Users2 size={22} className="text-blue-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Jiwa Muzakki
              </span>
              <p className="text-lg sm:text-xl font-black text-slate-800">{stats.totalJiwa}</p>
              <span className="text-[10px] text-slate-500">Jiwa Tertunaikan</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
              <HandHeart size={22} className="text-rose-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Transaksi ZIS
              </span>
              <p className="text-lg sm:text-xl font-black text-slate-800">{stats.count}</p>
              <span className="text-[10px] text-slate-500">Catatan Amanah</span>
            </div>
          </div>
        </div>

        {/* Interactive Zakat Calculator */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800">
              <Calculator size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-800">
                Kalkulator Zakat & Fidyah
              </h3>
              <p className="text-[11px] text-slate-500">
                Hitung takaran kewajiban zakat fitrah, zakat harta (maal), atau fidyah Anda
              </p>
            </div>
          </div>

          {/* Calculator Tabs */}
          <div className="flex items-center gap-2 text-xs">
            {[
              { id: 'fitrah', label: 'Zakat Fitrah' },
              { id: 'maal', label: 'Zakat Maal (Harta)' },
              { id: 'fidyah', label: 'Fidyah Puasa' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCalcTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
                  calcTab === tab.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Calculator Body */}
          {calcTab === 'fitrah' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jumlah Anggota Keluarga (Jiwa)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={fitrahJiwa}
                    onChange={(e) => setFitrahJiwa(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ketetapan Zakat Uang per Jiwa (Rp)
                  </label>
                  <input
                    type="number"
                    step={5000}
                    value={hargaBerasPerJiwa}
                    onChange={(e) => setHargaBerasPerJiwa(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Total Kewajiban Zakat Fitrah
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-emerald-950">
                    {formatRupiah(fitrahJiwa * hargaBerasPerJiwa)}
                  </p>
                </div>
                <div className="text-xs text-emerald-800 font-semibold bg-white/60 px-3 py-1.5 rounded-lg border border-emerald-200/60">
                  Atau setara dengan <strong className="font-black">{(fitrahJiwa * 2.5).toFixed(1)} kg beras</strong> (2.5 kg per jiwa)
                </div>
              </div>
            </div>
          )}

          {calcTab === 'maal' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Harta Tabungan / Emas / Aset Produktif Mengendap 1 Tahun (Rp)
                </label>
                <input
                  type="number"
                  step={1000000}
                  value={maalHarta}
                  onChange={(e) => setMaalHarta(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Standar Nisab Emas: 85 gram emas (~Rp 85.000.000)
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Kewajiban Zakat Maal (2.5%)
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-amber-950">
                    {maalHarta >= 85000000 ? formatRupiah(maalHarta * 0.025) : 'Belum Mencapai Nisab'}
                  </p>
                </div>
                <div className="text-xs text-amber-800 font-semibold bg-white/60 px-3 py-1.5 rounded-lg border border-amber-200/60">
                  {maalHarta >= 85000000 ? 'Wajib Ditunaikan Setiap Tahun (Haul)' : 'Nisab minimal: Rp 85.000.000'}
                </div>
              </div>
            </div>
          )}

          {calcTab === 'fidyah' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jumlah Hari Hutang Puasa (Hari)
                </label>
                <input
                  type="number"
                  min={1}
                  value={fidyahHari}
                  onChange={(e) => setFidyahHari(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-800 focus:outline-hidden focus:border-emerald-600"
                />
              </div>

              <div className="rounded-xl bg-blue-50 border border-blue-200/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800">
                    Total Fidyah
                  </span>
                  <p className="text-xl sm:text-2xl font-black text-blue-950">
                    {formatRupiah(fidyahHari * 45000)}
                  </p>
                </div>
                <div className="text-xs text-blue-800 font-semibold bg-white/60 px-3 py-1.5 rounded-lg border border-blue-200/60">
                  Setara dengan makanan siap santap / 1 mud beras per hari
                </div>
              </div>
            </div>
          )}
        </div>

        {/* --- TABEL TRANSPARANSI PENERIMAAN ZIS --- */}
        <div className="rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <h3 className="font-bold text-base text-slate-800">Riwayat Catatan ZIS Terbuka</h3>
              <p className="text-xs text-slate-500">Transparansi penerimaan zakat, infaq, dan sedekah DKM {identitas?.nama || 'Al-Mukhlisin'}</p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama muzakki..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-600 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'Semua Jenis ZIS' },
              { id: 'Zakat Fitrah (uang)', label: 'Fitrah (Uang)' },
              { id: 'Zakat Fitrah (beras)', label: 'Fitrah (Beras)' },
              { id: 'Zakat Maal', label: 'Zakat Maal' },
              { id: 'Fidyah', label: 'Fidyah' },
              { id: 'Qurban', label: 'Qurban' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedJenis(tab.id)}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                  selectedJenis === tab.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Table */}
          {loading ? (
            <div className="rounded-xl bg-white p-12 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
              <p className="mt-3 text-xs font-bold text-slate-500">Memuat data ZIS...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-8 text-center border border-slate-200/60 space-y-1">
              <HandHeart size={32} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Belum ada catatan transaksi ZIS</p>
              <p className="text-xs text-slate-400">Data penerimaan zakat akan tampil secara transparan di sini.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Muzakki / Donatur</th>
                    <th className="px-4 py-3">Jenis ZIS</th>
                    <th className="px-4 py-3 text-center">Jiwa</th>
                    <th className="px-4 py-3 text-right">Beras (kg)</th>
                    <th className="px-4 py-3 text-right">Nominal (Rp)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 font-mono text-slate-500">{item.tanggal}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{item.nama}</td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {item.jenis}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-slate-700">
                        {item.jumlah_jiwa || 1}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-amber-700 font-bold">
                        {item.beras_kg > 0 ? `${item.beras_kg} kg` : '-'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">
                        {item.nominal > 0 ? formatRupiah(item.nominal) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
