'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Search,
  ArrowLeft,
  Shield,
  Phone,
  MapPin,
  Heart,
  Award,
  Download,
  Printer,
  X,
  MessageCircle,
  UserCheck,
  Building2,
  Calendar,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { getHijriDateString } from '@/lib/hijri';
import { DataService } from '@/lib/data-service';
import { JamaahItem, IdentitasMasjid } from '@/types';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';

export default function JamaahPublicPage() {
  const [dataJamaah, setDataJamaah] = useState<JamaahItem[]>([]);
  const [identitas, setIdentitas] = useState<IdentitasMasjid | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeran, setSelectedPeran] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Detail Modal
  const [selectedPerson, setSelectedPerson] = useState<JamaahItem | null>(null);

  // Dates
  const [todayDateStr, setTodayDateStr] = useState('');
  const [hijriDateStr, setHijriDateStr] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [jamaahRes, idRes] = await Promise.all([
        DataService.getJamaah(),
        DataService.getIdentitas(),
      ]);
      setDataJamaah(jamaahRes);
      setIdentitas(idRes);
    } catch (err) {
      console.error('Failed to load jamaah data:', err);
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

  // Stats
  const stats = useMemo(() => {
    const total = dataJamaah.length;
    const pengurus = dataJamaah.filter((j) => j.peran === 'Pengurus DKM').length;
    const imam = dataJamaah.filter((j) => j.peran === 'Imam' || j.peran === 'Muadzin').length;
    const tokoh = dataJamaah.filter((j) => j.peran === 'Donatur' || j.peran === 'Remaja Masjid').length;
    return { total, pengurus, imam, tokoh };
  }, [dataJamaah]);

  // Filtered List
  const filteredData = useMemo(() => {
    return dataJamaah.filter((j) => {
      const matchSearch =
        j.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.alamat || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.no_hp || '').includes(searchTerm);
      const matchPeran =
        selectedPeran === 'all' ||
        j.peran === selectedPeran ||
        (selectedPeran === 'Imam & Muadzin' && (j.peran === 'Imam' || j.peran === 'Muadzin')) ||
        (selectedPeran === 'Tokoh Masyarakat' && (j.peran === 'Donatur' || j.peran === 'Remaja Masjid'));
      return matchSearch && matchPeran;
    });
  }, [dataJamaah, searchTerm, selectedPeran]);

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = filteredData.map((item, index) => ({
      No: index + 1,
      Nama: item.nama,
      Peran: item.peran,
      Alamat: item.alamat || '-',
      'No HP': item.no_hp ? item.no_hp : '-',
      'Terdaftar Sejak': item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Jamaah');
    const dateStr = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `Data_Jamaah_Al_Mukhlisin_${dateStr}.xlsx`);
  };

  const getRoleBadgeStyle = (peran: string) => {
    switch (peran) {
      case 'Pengurus DKM':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Imam & Muadzin':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Tokoh Masyarakat':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      case 'Donatur Tetap':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
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
                <span>KEPENGURUSAN & WARGA JAMAAH · MASJID AL-MUKHLISIN</span>
              </div>
              <h1 className="font-serif-elegant text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
                Data Jamaah & Tokoh
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
                Struktur Dewan Kemakmuran Masjid (DKM), asatidz, imam rawatib, serta silaturahmi warga jamaah Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar.
              </p>
            </div>

            {/* Quick Actions */}
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
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors shadow-xs"
              >
                <Printer size={14} />
                <span className="hidden sm:inline">Cetak</span>
              </button>
            </div>
          </div>

          {/* Quick Leadership Highlight */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <Building2 size={24} className="text-emerald-300" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 block">
                  Ketua DKM Al-Mukhlisin
                </span>
                <p className="text-sm sm:text-base font-bold text-white">
                  {identitas?.ketua_dkm || 'Ustadz H. Ahmad Sobari'}
                </p>
                <span className="text-[11px] text-slate-300">Penanggung Jawab Kemakmuran Masjid</span>
              </div>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center shrink-0">
                <UserCheck size={24} className="text-amber-300" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block">
                  Bendahara DKM
                </span>
                <p className="text-sm sm:text-base font-bold text-white">
                  {identitas?.bendahara || 'H. Mulyadi, S.E.'}
                </p>
                <span className="text-[11px] text-slate-300">Pengelola Amanah Kas & Keuangan Ummat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- STAT CARDS & CONTENT --- */}
      <main className="relative z-10 mx-auto max-w-7xl px-3.5 sm:px-6 md:px-8 -mt-8 space-y-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div className="h-11 w-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
              <Users size={22} className="text-emerald-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Total Jamaah
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.total}</p>
              <span className="text-[10px] text-slate-500">Warga Terdaftar</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              <Award size={22} className="text-blue-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Pengurus DKM
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.pengurus}</p>
              <span className="text-[10px] text-slate-500">Dewan Pengurus</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
              <Award size={22} className="text-amber-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Imam & Muadzin
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.imam}</p>
              <span className="text-[10px] text-slate-500">Petugas Rawatib</span>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div className="h-11 w-11 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
              <Heart size={22} className="text-rose-700" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Tokoh & Donatur
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-800">{stats.tokoh}</p>
              <span className="text-[10px] text-slate-500">Sesepuh & Muhsinin</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari nama jamaah, RT/RW, atau nomor kontak..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:outline-hidden focus:border-emerald-600 focus:bg-white transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 self-end md:self-auto">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'cards'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tampilan Kartu
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                  viewMode === 'table'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tabel Rinci
              </button>
            </div>
          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              { id: 'all', label: 'Semua Peran' },
              { id: 'Pengurus DKM', label: 'Pengurus DKM' },
              { id: 'Imam & Muadzin', label: 'Imam & Muadzin' },
              { id: 'Tokoh Masyarakat', label: 'Tokoh Masyarakat' },
              { id: 'Donatur Tetap', label: 'Donatur Tetap' },
              { id: 'Jamaah', label: 'Warga Jamaah' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedPeran(tab.id)}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                  selectedPeran === tab.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Display: Cards or Table */}
        {loading ? (
          <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
            <p className="mt-3 text-xs font-bold text-slate-500">Memuat data jamaah...</p>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="rounded-2xl bg-white p-12 text-center border border-slate-200 shadow-xs space-y-2">
            <Users size={36} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">Tidak ada data jamaah yang ditemukan</p>
            <p className="text-xs text-slate-400">
              {searchTerm ? 'Coba ubah kata kunci pencarian Anda' : 'Belum ada data warga terdaftar'}
            </p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredData.map((person) => {
              const initials = person.nama
                .split(' ')
                .slice(0, 2)
                .map((n) => n[0])
                .join('')
                .toUpperCase();

              return (
                <div
                  key={person.id}
                  onClick={() => setSelectedPerson(person)}
                  className="group rounded-2xl bg-white p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {initials}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-800 group-hover:text-emerald-800 transition-colors">
                            {person.nama}
                          </h3>
                          <span
                            className={`inline-block px-2 py-0.5 mt-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle(
                              person.peran
                            )}`}
                          >
                            {person.peran}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 pt-1">
                      <p className="flex items-start gap-1.5 leading-snug">
                        <MapPin size={13} className="text-slate-400 shrink-0 mt-0.5" />
                        <span className="truncate">{person.alamat || 'Kp. Jalan Cagak Lagadar'}</span>
                      </p>
                      {person.no_hp && (
                        <p className="flex items-center gap-1.5">
                          <Phone size={13} className="text-slate-400 shrink-0" />
                          <span className="font-mono text-[11px] text-slate-600">{person.no_hp}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Klik untuk detail</span>
                    {person.no_hp && (
                      <a
                        href={`https://wa.me/${person.no_hp.replace(/^0/, '62').replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-bold"
                      >
                        <MessageCircle size={13} />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Nama Jamaah</th>
                    <th className="px-4 py-3">Peran / Amanah</th>
                    <th className="px-4 py-3">Alamat</th>
                    <th className="px-4 py-3">Kontak</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredData.map((person, idx) => (
                    <tr
                      key={person.id}
                      onClick={() => setSelectedPerson(person)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 font-bold text-slate-800">{person.nama}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle(
                            person.peran
                          )}`}
                        >
                          {person.peran}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{person.alamat || '-'}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{person.no_hp || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* --- DETAIL MODAL --- */}
      {selectedPerson && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setSelectedPerson(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users size={18} className="text-emerald-700" />
                <h3 className="font-bold text-base text-slate-800">Profil Jamaah</h3>
              </div>
              <button
                onClick={() => setSelectedPerson(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-center py-3 bg-slate-50 rounded-xl">
                <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 text-white font-bold text-xl flex items-center justify-center shadow-md">
                  {selectedPerson.nama
                    .split(' ')
                    .slice(0, 2)
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </div>
                <h4 className="mt-2 text-base font-bold text-slate-800">{selectedPerson.nama}</h4>
                <span
                  className={`inline-block px-2.5 py-0.5 mt-1 rounded-full text-xs font-bold border ${getRoleBadgeStyle(
                    selectedPerson.peran
                  )}`}
                >
                  {selectedPerson.peran}
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-start justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Alamat Domisili</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[200px]">
                    {selectedPerson.alamat || 'Kp. Jalan Cagak Lagadar'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Nomor Telepon/WA</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {selectedPerson.no_hp || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Status Jamaah</span>
                  <span className="font-bold text-emerald-700">Aktif & Terverifikasi</span>
                </div>
              </div>

              {selectedPerson.no_hp && (
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${selectedPerson.no_hp.replace(/^0/, '62').replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                  >
                    <MessageCircle size={15} />
                    <span>Hubungi Pengurus / Jamaah via WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
