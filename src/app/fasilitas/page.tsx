'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Package,
  Layers,
  MapPin,
  CalendarDays,
  Shield,
  Download,
  Printer,
  ChevronRight,
  Info,
  Maximize2,
  X,
  Eye,
  RefreshCw,
  Building2,
  Clock,
  Check,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getHijriDateString } from '@/lib/hijri';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';
import CustomDropdown, { DropdownOption } from '@/components/ui/custom-dropdown';
import { DataService } from '@/lib/data-service';
import { InventoryItem, WakafItem, IdentitasMasjid } from '@/types';

export default function FasilitasDetailPage() {
  const [inventories, setInventories] = useState<InventoryItem[]>([]);
  const [wakafList, setWakafList] = useState<WakafItem[]>([]);
  const [identitas, setIdentitas] = useState<IdentitasMasjid | null>(null);
  const [loading, setLoading] = useState(true);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'fisik' | 'wakaf'>('fisik');

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKondisi, setSelectedKondisi] = useState<string>('all');
  const [selectedLokasi, setSelectedLokasi] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modal Detail Item
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedWakafItem, setSelectedWakafItem] = useState<WakafItem | null>(null);

  // Dates
  const [todayDateStr, setTodayDateStr] = useState('');
  const [hijriDateStr, setHijriDateStr] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [invData, wkData, idData] = await Promise.all([
        DataService.getInventories(),
        DataService.getWakaf(),
        DataService.getIdentitas(),
      ]);
      setInventories(invData);
      setWakafList(wkData);
      setIdentitas(idData);
    } catch (e) {
      console.error('Failed to load facilities data:', e);
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

  // Filtered Inventories
  const filteredInventories = useMemo(() => {
    return inventories.filter((item) => {
      const matchSearch =
        item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
      const matchKondisi = selectedKondisi === 'all' || item.kondisi === selectedKondisi;
      const matchLokasi = selectedLokasi === 'all' || item.lokasi === selectedLokasi;
      return matchSearch && matchKondisi && matchLokasi;
    });
  }, [inventories, searchTerm, selectedKondisi, selectedLokasi]);

  // Unique Lokasi List
  const uniqueLokasiList = useMemo(() => {
    const list = Array.from(new Set(inventories.map((i) => i.lokasi)));
    return list.sort();
  }, [inventories]);

  const dropdownKondisiOptions: DropdownOption[] = [
    { value: 'all', label: 'Semua Kondisi Fisik' },
    { value: 'baik', label: 'Baik / Prima' },
    { value: 'rusak_ringan', label: 'Rusak Ringan' },
    { value: 'rusak_berat', label: 'Rusak Berat' },
  ];

  const dropdownLokasiOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: 'all', label: 'Semua Area Penempatan' },
      ...uniqueLokasiList.map((lok) => ({
        value: lok,
        label: lok,
      })),
    ];
  }, [uniqueLokasiList]);

  // Stats
  const totalUnits = useMemo(() => {
    return inventories.reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);
  }, [inventories]);

  const unitBaik = useMemo(() => {
    return inventories
      .filter((i) => i.kondisi === 'baik')
      .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);
  }, [inventories]);

  const unitPerluPerawatan = useMemo(() => {
    return inventories
      .filter((i) => i.kondisi !== 'baik')
      .reduce((acc, curr) => acc + Number(curr.jumlah || 0), 0);
  }, [inventories]);

  // Export to Excel
  const handleExportExcel = () => {
    const dataToExport = filteredInventories.map((item, idx) => ({
      No: idx + 1,
      'Kode Aset': `AST-MKH-${String(item.id).padStart(4, '0')}`,
      'Nama Barang / Fasilitas': item.nama_barang,
      'Jumlah Unit': item.jumlah,
      'Kondisi Fisik': item.kondisi.toUpperCase(),
      'Lokasi Penempatan': item.lokasi,
      'Tanggal Catat': item.created_at ? item.created_at.split('T')[0] : '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventaris Fasilitas');
    XLSX.writeFile(
      workbook,
      `Inventaris_Fasilitas_Masjid_Al-Mukhlisin_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-900 font-sans selection:bg-emerald-200 pb-28 md:pb-12">
      {/* --- TOPBAR BRANDING --- */}
      <header className="sticky top-0 z-40 border-b border-emerald-950/20 bg-[#0a1f18]/95 px-4 py-3.5 text-white backdrop-blur-md md:px-8">
        <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
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
                <span className="font-serif-elegant text-sm font-bold tracking-wide text-white block leading-tight">
                  Al-Mukhlisin
                </span>
                <span className="text-[10px] font-mono text-emerald-300/80 leading-tight block">
                  ID SIMAS {identitas?.nomor_id_kemenag || '01.4.13.04.06.000158'} | Lagadar
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white transition-colors hover:bg-white/20"
            >
              <Shield size={13} className="text-emerald-400" />
              <span>Portal Pengurus</span>
            </Link>
          </div>
        </div>
      </header>

      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-8 pb-8 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 bg-white shadow-2xs">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-serif-elegant text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#0a1f18]">
                Inventaris Fasilitas
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-600">
                <span className="flex items-center gap-1.5 text-slate-700 font-medium">
                  <MapPin size={14} className="text-[#0d8a5e]" />
                  <span>Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar</span>
                </span>
                {todayDateStr && (
                  <>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
                      <CalendarDays size={13} className="text-[#0d8a5e]" />
                      <span>
                        {todayDateStr}
                        {hijriDateStr ? ` · ${hijriDateStr}` : ''}
                      </span>
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Tombol Aksi Cetak & Ekspor */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition-colors shadow-2xs"
                title="Cetak lembar inventaris"
              >
                <Printer size={14} className="text-[#0d8a5e]" />
                <span>Cetak</span>
              </button>
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0d8a5e] hover:bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-900/10 transition-all active:scale-95"
              >
                <Download size={14} />
                <span>Ekspor Excel</span>
              </button>
            </div>
          </div>

          {/* --- STAT CARDS --- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 mt-6 sm:mt-8">
            {/* Card 1: Total Unit */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <span>Total Unit Aset</span>
                <Package size={15} className="text-[#0d8a5e]" />
              </div>
              <p className="mt-2 text-2xl md:text-3xl font-black font-serif-elegant text-slate-900">
                {totalUnits} <span className="text-xs font-sans text-slate-500 font-normal">Unit</span>
              </p>
              <p className="mt-1 text-[10px] text-[#0d8a5e] font-medium">
                {inventories.length} ragam jenis barang
              </p>
            </div>

            {/* Card 2: Kondisi Prima */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <span>Kondisi Prima</span>
                <CheckCircle2 size={15} className="text-[#0d8a5e]" />
              </div>
              <p className="mt-2 text-2xl md:text-3xl font-black font-serif-elegant text-emerald-700">
                {unitBaik} <span className="text-xs font-sans text-slate-500 font-normal">Unit</span>
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                {totalUnits > 0 ? Math.round((unitBaik / totalUnits) * 100) : 100}% layak pakai penuh
              </p>
            </div>

            {/* Card 3: Perawatan */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <span>Perlu Perawatan</span>
                <AlertTriangle size={15} className="text-amber-600" />
              </div>
              <p className="mt-2 text-2xl md:text-3xl font-black font-serif-elegant text-amber-700">
                {unitPerluPerawatan} <span className="text-xs font-sans text-slate-500 font-normal">Unit</span>
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                {unitPerluPerawatan === 0 ? 'Semua aset prima' : 'Dalam jadwal perbaikan'}
              </p>
            </div>

            {/* Card 4: Titik Lokasi */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 shadow-2xs">
              <div className="flex items-center justify-between text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <span>Titik Penempatan</span>
                <MapPin size={15} className="text-[#b38e22]" />
              </div>
              <p className="mt-2 text-2xl md:text-3xl font-black font-serif-elegant text-[#b38e22]">
                {uniqueLokasiList.length} <span className="text-xs font-sans text-slate-500 font-normal">Area</span>
              </p>
              <p className="mt-1 text-[10px] text-slate-500">Terdistribusi di gedung masjid</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8">
        {/* TAB SWITCHER */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 flex-wrap gap-4">
          <div className="flex items-center gap-2 bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/60">
            <button
              onClick={() => setActiveTab('fisik')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'fisik'
                  ? 'bg-[#0d8a5e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package size={14} />
              <span>Inventaris Fisik ({inventories.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('wakaf')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'wakaf'
                  ? 'bg-[#0d8a5e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 size={14} />
              <span>Harta Wakaf Umat ({wakafList.length})</span>
            </button>
          </div>

          {activeTab === 'fisik' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500">Tampilan:</span>
              <div className="flex bg-slate-200/70 border border-slate-300/60 rounded-xl p-1 text-xs">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tabel Lengkap
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                    viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Grid Kartu
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- TAB 1: INVENTARIS FISIK --- */}
        {activeTab === 'fisik' && (
          <div className="mt-6 space-y-6">
            {/* SEARCH & FILTERS BAR */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              {/* Search */}
              <div className="md:col-span-6 relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Cari nama fasilitas, merek, atau lokasi penempatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#0d8a5e] transition-colors"
                />
              </div>

              {/* Filter Kondisi */}
              <div className="md:col-span-3">
                <CustomDropdown
                  value={selectedKondisi}
                  onChange={(val) => setSelectedKondisi(val)}
                  options={dropdownKondisiOptions}
                  className="w-full"
                />
              </div>

              {/* Filter Lokasi */}
              <div className="md:col-span-3">
                <CustomDropdown
                  value={selectedLokasi}
                  onChange={(val) => setSelectedLokasi(val)}
                  options={dropdownLokasiOptions}
                  className="w-full"
                />
              </div>
            </div>

            {/* CONTENT VIEW: TABLE MODE */}
            {viewMode === 'table' ? (
              <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40">
                {/* Header Card */}
                <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black tracking-widest text-[#b38e22] uppercase">
                      Daftar Terverifikasi
                    </p>
                    <h2 className="font-serif-elegant text-2xl font-bold text-[#0a1f18]">
                      Inventaris Fasilitas
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    Menampilkan <strong className="text-slate-900">{filteredInventories.length}</strong> aset
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                        <th className="py-4 px-6">Nama Barang</th>
                        <th className="py-4 px-4 text-center">Kode Register</th>
                        <th className="py-4 px-4 text-center">Jumlah</th>
                        <th className="py-4 px-4 text-center">Kondisi</th>
                        <th className="py-4 px-6">Lokasi Penempatan</th>
                        <th className="py-4 px-6 text-right">Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredInventories.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            <Package size={32} className="mx-auto text-slate-400 mb-2" />
                            <span>Tidak ada barang yang cocok dengan kata kunci atau filter.</span>
                          </td>
                        </tr>
                      ) : (
                        filteredInventories.map((item) => (
                          <tr
                            key={item.id}
                            onClick={() => setSelectedItem(item)}
                            className="hover:bg-emerald-50/40 transition-colors cursor-pointer group"
                          >
                            <td className="py-4 px-6">
                              <span className="font-bold text-slate-900 text-sm group-hover:text-[#0d8a5e] transition-colors block">
                                {item.nama_barang}
                              </span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                Terdaftar sejak {item.created_at ? item.created_at.split('T')[0] : '2026'}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center font-mono text-slate-500 text-[11px]">
                              AST-{String(item.id).padStart(4, '0')}
                            </td>
                            <td className="py-4 px-4 text-center font-mono font-bold text-slate-900 text-sm">
                              {item.jumlah} Unit
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span
                                className={`inline-block rounded-md px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                                  item.kondisi === 'baik'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : item.kondisi === 'rusak_ringan'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                              >
                                {item.kondisi === 'baik'
                                  ? 'BAIK'
                                  : item.kondisi === 'rusak_ringan'
                                  ? 'RUSAK RINGAN'
                                  : 'RUSAK BERAT'}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-slate-600 font-medium">
                              <span className="flex items-center gap-1.5">
                                <MapPin size={13} className="text-[#0d8a5e] shrink-0" />
                                {item.lokasi}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedItem(item);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0d8a5e] text-slate-700 hover:text-white font-bold text-[11px] transition-all"
                              >
                                <Eye size={12} />
                                <span>Lihat Detail</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* CARD GRID MODE */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredInventories.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="rounded-2xl border border-slate-200/80 bg-white p-5 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-slate-200/60 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          AST-{String(item.id).padStart(4, '0')}
                        </span>
                        <span
                          className={`rounded px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                            item.kondisi === 'baik'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.kondisi === 'rusak_ringan'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {item.kondisi === 'baik'
                            ? 'BAIK'
                            : item.kondisi === 'rusak_ringan'
                            ? 'RUSAK RINGAN'
                            : 'RUSAK BERAT'}
                        </span>
                      </div>

                      <h3 className="font-serif-elegant text-base font-bold text-[#0a1f18] leading-snug">
                        {item.nama_barang}
                      </h3>

                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-600">
                        <MapPin size={13} className="text-[#0d8a5e] shrink-0" />
                        <span className="truncate">{item.lokasi}</span>
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                      <span className="font-mono text-sm font-black text-slate-900">
                        {item.jumlah} Unit
                      </span>
                      <span className="text-[11px] font-bold text-[#0d8a5e] flex items-center gap-1">
                        Detail Lengkap <ChevronRight size={13} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- TAB 2: HARTA WAKAF UMAT --- */}
        {activeTab === 'wakaf' && (
          <div className="mt-6 space-y-6">
            <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-white shadow-xl shadow-slate-200/40">
              <div className="border-b border-slate-100 px-6 py-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black tracking-widest text-[#b38e22] uppercase">
                    Harta Amal Jariyah
                  </p>
                  <h2 className="font-serif-elegant text-2xl font-bold text-[#0a1f18]">
                    Data Harta Benda Wakaf
                  </h2>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  Total <strong className="text-slate-900">{wakafList.length}</strong> catatan wakaf
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-black tracking-widest text-slate-500 uppercase">
                      <th className="py-4 px-6">Tanggal</th>
                      <th className="py-4 px-6">Wakif (Pemberi)</th>
                      <th className="py-4 px-4">Jenis Wakaf</th>
                      <th className="py-4 px-4 text-right">Nilai Estimasi</th>
                      <th className="py-4 px-6">Keterangan / Peruntukan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {wakafList.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          Belum ada catatan harta wakaf.
                        </td>
                      </tr>
                    ) : (
                      wakafList.map((w) => (
                        <tr
                          key={w.id}
                          onClick={() => setSelectedWakafItem(w)}
                          className="hover:bg-emerald-50/40 transition-colors cursor-pointer"
                        >
                          <td className="py-4 px-6 font-mono text-slate-500">{w.tanggal}</td>
                          <td className="py-4 px-6 font-bold text-slate-900">{w.wakif}</td>
                          <td className="py-4 px-4">
                            <span className="rounded-md px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {w.jenis}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-bold text-slate-900">
                            Rp {Number(w.nilai || 0).toLocaleString('id-ID')}
                          </td>
                          <td className="py-4 px-6 text-slate-600 max-w-xs truncate">
                            {w.keterangan || '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL DETAIL POPUP (INSPECTION MODAL) --- */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl text-slate-900 max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative border-b border-emerald-950/20 bg-gradient-to-r from-[#0a1f18] to-[#0d2a20] p-6 text-white">
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute right-5 top-5 p-2 rounded-full bg-white/10 text-slate-200 hover:text-white hover:bg-white/20 transition-colors"
              >
                <X size={18} />
              </button>

              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#d4af37]/20 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2 border border-[#d4af37]/30">
                <Shield size={11} /> Terverifikasi DKM
              </div>

              <h3 className="font-serif-elegant text-2xl font-bold leading-tight text-white pr-8">
                {selectedItem.nama_barang}
              </h3>
              <p className="mt-1 font-mono text-xs text-emerald-300">
                Register ID: AST-MKH-{String(selectedItem.id).padStart(4, '0')}
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Status & Jumlah Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Kondisi Fisik
                  </span>
                  <span
                    className={`inline-block rounded-md px-2.5 py-1 text-xs font-black uppercase ${
                      selectedItem.kondisi === 'baik'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : selectedItem.kondisi === 'rusak_ringan'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}
                  >
                    {selectedItem.kondisi === 'baik'
                      ? 'Prima (Baik)'
                      : selectedItem.kondisi === 'rusak_ringan'
                      ? 'Rusak Ringan'
                      : 'Rusak Berat'}
                  </span>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Jumlah Tersedia
                  </span>
                  <span className="font-mono text-xl font-black text-slate-900">
                    {selectedItem.jumlah} <span className="text-xs font-normal text-slate-500">Unit</span>
                  </span>
                </div>
              </div>

              {/* Lokasi Penempatan */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-1">
                  <MapPin size={15} className="text-[#0d8a5e]" />
                  <span>Lokasi Penempatan Resmi</span>
                </div>
                <p className="text-base font-bold text-slate-900 pl-6">
                  {selectedItem.lokasi}
                </p>
                <p className="text-[11px] text-slate-500 pl-6 mt-0.5">
                  Gedung Masjid Al-Mukhlisin, Kp. Jalan Cagak, Lagadar
                </p>
              </div>

              {/* Ketentuan Pemakaian & Pemeliharaan */}
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-900">
                  <Info size={15} className="text-[#0d8a5e]" />
                  <span>SOP & Amanah Penggunaan</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fasilitas ini merupakan aset ibadah umat di Masjid Al-Mukhlisin. Dikelola dan
                  dirawat berkala oleh pengurus DKM. Mohon dijaga bersama dengan menjaga kebersihan
                  dan kerapian setelah digunakan.
                </p>
              </div>

              {/* Tanggal & Verifikator */}
              <div className="text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100 pt-3">
                <span>Tanggal Terdata: {selectedItem.created_at ? selectedItem.created_at.split('T')[0] : '2026-01-01'}</span>
                <span className="text-[#0d8a5e] font-bold">Status: Terdata di SIMAS</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-slate-100 p-4 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-2.5 rounded-xl bg-[#0d8a5e] hover:bg-emerald-600 font-bold text-xs text-white transition-colors shadow-xs"
              >
                Tutup Informasi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL WAKAF POPUP --- */}
      {selectedWakafItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl text-slate-900 p-5 sm:p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-[10px] font-black tracking-widest text-[#b38e22] uppercase">
                  Detail Harta Wakaf
                </span>
                <h3 className="font-serif-elegant text-xl font-bold text-[#0a1f18] mt-1">
                  Wakaf {selectedWakafItem.jenis}
                </h3>
              </div>
              <button
                onClick={() => setSelectedWakafItem(null)}
                className="p-1.5 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Wakif (Pemberi)</span>
                <span className="text-base font-bold text-slate-900">{selectedWakafItem.wakif}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Nilai Estimasi</span>
                <span className="text-base font-bold text-[#0d8a5e] font-mono">
                  Rp {Number(selectedWakafItem.nilai || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Peruntukan / Keterangan</span>
                <p className="text-slate-600 mt-1 leading-relaxed">{selectedWakafItem.keterangan || '-'}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedWakafItem(null)}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#0d8a5e] hover:bg-emerald-600 font-bold text-xs text-white transition-colors shadow-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (7 Tabs: Beranda, Kas, Jamaah, Agenda, Zakat, Aset, Laporan) */}
      <MobileBottomNav variant="public" />
    </div>
  );
}
