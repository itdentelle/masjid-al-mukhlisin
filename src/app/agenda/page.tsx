'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Clock,
  Search,
  ArrowLeft,
  Shield,
  MapPin,
  UserCheck,
  X,
  Share2,
  Calendar,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import { DataService } from '@/lib/data-service';
import { getHijriDateString } from '@/lib/hijri';
import { getOfficialPrayerTimes } from '@/lib/prayer-service';
import { KhutbahItem, PetugasJumatItem, IdentitasMasjid, KategoriItem } from '@/types';
import KhutbahDefaultPoster, { isCustomPosterImage } from '@/components/khutbah-default-poster';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';

export default function AgendaPublicPage() {
  const [khutbahList, setKhutbahList] = useState<KhutbahItem[]>([]);
  const [petugasJumat, setPetugasJumat] = useState<PetugasJumatItem[]>([]);
  const [identitas, setIdentitas] = useState<IdentitasMasjid | null>(null);
  const [kategoriAgenda, setKategoriAgenda] = useState<KategoriItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Jadwal Shalat
  const [jadwalShalat, setJadwalShalat] = useState<Record<string, string>>({
    Fajr: '04:36',
    Sunrise: '05:48',
    Dhuhr: '11:55',
    Asr: '15:10',
    Maghrib: '17:58',
    Isha: '19:07',
  });

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<KhutbahItem | null>(null);

  // Dates
  const [todayDateStr, setTodayDateStr] = useState('');
  const [hijriDateStr, setHijriDateStr] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [khutbahRes, petugasRes, idRes, catRes] = await Promise.all([
        DataService.getKhutbahs(),
        DataService.getPetugasJumat(),
        DataService.getIdentitas(),
        DataService.getKategori('agenda'),
      ]);
      setKhutbahList(khutbahRes);
      setPetugasJumat(petugasRes);
      setIdentitas(idRes);
      const activeCats = catRes.filter((k) => k.is_active !== false);
      if (activeCats.length > 0) setKategoriAgenda(activeCats);
    } catch (err) {
      console.error('Failed to load agenda data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleKategoriUpdated = () => {
      DataService.getKategori('agenda').then((cats) => {
        const activeCats = cats.filter((k) => k.is_active !== false);
        if (activeCats.length > 0) setKategoriAgenda(activeCats);
      });
    };
    window.addEventListener('masjid_kategori_updated', handleKategoriUpdated);

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

    // Fetch live shalat timings from Kemenag RI
    getOfficialPrayerTimes(now)
      .then((timings) => {
        setJadwalShalat(timings);
      })
      .catch((err) => {
        console.warn('API Shalat fallback active:', err);
      });

    return () => {
      window.removeEventListener('masjid_kategori_updated', handleKategoriUpdated);
    };
  }, []);

  const agendaPillOptions = useMemo(() => {
    if (kategoriAgenda.length > 0) {
      return [
        { id: 'all', label: 'Semua Agenda' },
        ...kategoriAgenda.map((k) => ({ id: k.nama, label: k.nama })),
      ];
    }
    return [
      { id: 'all', label: 'Semua Agenda' },
      { id: 'Shalat Jumat', label: 'Shalat Jumat' },
      { id: 'Kajian Ahad Subuh', label: 'Kajian Ahad Subuh' },
      { id: 'Tabligh Akbar', label: 'Tabligh Akbar' },
      { id: 'Kajian Muslimah', label: 'Kajian Muslimah' },
      { id: 'Kajian Remaja', label: 'Kajian Remaja' },
    ];
  }, [kategoriAgenda]);

  // Filtered Kajian
  const filteredKajian = useMemo(() => {
    return khutbahList.filter((item) => {
      const matchSearch =
        (item.tema || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.khotib.toLowerCase().includes(searchTerm.toLowerCase());
      const matchKategori =
        selectedKategori === 'all' || item.jenis_kegiatan === selectedKategori;
      return matchSearch && matchKategori;
    });
  }, [khutbahList, searchTerm, selectedKategori]);

  // Petugas Jumat Terdekat
  const nextJumat = useMemo(() => {
    if (petugasJumat.length === 0) return null;
    return petugasJumat[0];
  }, [petugasJumat]);

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
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a1f18] via-[#0d2a21] to-[#081a14] pt-10 pb-10 sm:pb-12 px-4 sm:px-6 md:px-8 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-900/60 px-3.5 py-1 text-[10px] font-black tracking-widest text-emerald-300 uppercase">
            <span>JADWAL SHALAT & MAJELIS ILMU · MASJID AL-MUKHLISIN</span>
          </div>
          <h1 className="font-serif-elegant text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white">
            Agenda & Kajian Masjid
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 max-w-2xl leading-relaxed">
            Waktu shalat fardhu harian, petugas ibadah Jumat, serta majelis taklim dan tabligh akbar terbuka untuk seluruh jamaah kaum muslimin.
          </p>

          {/* Real-time Prayer Times Widget */}
          <div className="mt-8 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 p-4 sm:p-6">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-emerald-300" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">
                  Waktu Shalat Hari Ini (Kemenag RI · Lagadar, Kab. Bandung)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-300">Zona WIB (UTC+7)</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-4 text-center">
              {[
                { name: 'Subuh', time: jadwalShalat.Fajr },
                { name: 'Terbit', time: jadwalShalat.Sunrise },
                { name: 'Dzuhur', time: jadwalShalat.Dhuhr },
                { name: 'Ashar', time: jadwalShalat.Asr },
                { name: 'Maghrib', time: jadwalShalat.Maghrib },
                { name: 'Isya', time: jadwalShalat.Isha },
              ].map((waktu) => (
                <div
                  key={waktu.name}
                  className="rounded-xl bg-white/5 border border-white/10 p-2.5 sm:p-3 hover:bg-white/15 transition-colors"
                >
                  <span className="text-[10px] font-bold text-slate-300 block">{waktu.name}</span>
                  <p className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">
                    {waktu.time || '--:--'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 mx-auto max-w-7xl px-3.5 sm:px-6 md:px-8 py-8 sm:py-10 space-y-8">
        {/* Highlight Petugas Jumat Terdekat */}
        {nextJumat && (
          <div className="rounded-2xl sm:rounded-3xl bg-white p-4 sm:p-6 border border-slate-200/90 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                  <UserCheck size={18} className="sm:hidden" />
                  <UserCheck size={20} className="hidden sm:block" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-sm sm:text-base text-slate-800 truncate">
                      Petugas Shalat Jumat
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      Pekan Ini
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                    <CalendarDays size={12} className="text-emerald-700 shrink-0" />
                    <span className="truncate">
                      Jumat, {new Date(nextJumat.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile View: 3 Baris Rapi & Hemat Ruang */}
            <div className="space-y-2 sm:hidden">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md shrink-0">
                    Khotib
                  </span>
                  <span className="text-[11px] text-slate-400">Penceramah</span>
                </div>
                <span className="font-bold text-xs text-slate-800 text-right truncate max-w-[170px]">{nextJumat.khatib}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md shrink-0">
                    Imam
                  </span>
                  <span className="text-[11px] text-slate-400">Imam Shalat</span>
                </div>
                <span className="font-bold text-xs text-slate-800 text-right truncate max-w-[170px]">{nextJumat.imam || nextJumat.khatib}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded-md shrink-0">
                    Muadzin
                  </span>
                  <span className="text-[11px] text-slate-400">Adzan</span>
                </div>
                <span className="font-bold text-xs text-slate-800 text-right truncate max-w-[170px]">{nextJumat.muadzin || '-'}</span>
              </div>
            </div>

            {/* Desktop & Tablet View: 3 Kolom */}
            <div className="hidden sm:grid sm:grid-cols-3 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Khotib Jumat</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{nextJumat.khatib}</p>
                <p className="text-[11px] text-slate-500 mt-1">Penceramah Utama</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Imam Shalat</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{nextJumat.imam || nextJumat.khatib}</p>
                <p className="text-[11px] text-slate-500 mt-1">Imam Rawatib / Tamu</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Muadzin</span>
                <p className="font-bold text-slate-800 text-sm mt-0.5">{nextJumat.muadzin || '-'}</p>
                <p className="text-[11px] text-slate-500 mt-1">Adzan & Pengumuman</p>
              </div>
            </div>
          </div>
        )}

        {/* Section Kajian & Khutbah */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
            <div>
              <h2 className="font-bold text-lg sm:text-xl text-slate-800">Jadwal Kajian & Khutbah</h2>
              <p className="text-xs text-slate-500">
                Daftar kajian rutin tematik dan jadwal khutbah Jumat Masjid Al-Mukhlisin
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari tema atau nama ustadz..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-hidden focus:border-emerald-600 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {agendaPillOptions.map((kategori) => (
              <button
                key={kategori.id}
                onClick={() => setSelectedKategori(kategori.id)}
                className={`px-3.5 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                  selectedKategori === kategori.id
                    ? 'bg-emerald-800 text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {kategori.label}
              </button>
            ))}
          </div>

          {/* Grid Cards Kajian */}
          {loading ? (
            <div className="rounded-2xl bg-white p-12 text-center border border-slate-200">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
              <p className="mt-3 text-xs font-bold text-slate-500">Memuat jadwal kajian...</p>
            </div>
          ) : filteredKajian.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center border border-slate-200 shadow-xs space-y-2">
              <CalendarDays size={36} className="mx-auto text-slate-300" />
              <p className="text-sm font-bold text-slate-700">Belum ada agenda kajian yang dijadwalkan</p>
              <p className="text-xs text-slate-400">
                Silakan periksa kembali di lain waktu atau hubungi pengurus DKM.
              </p>
            </div>
          ) : (
            <>
              {filteredKajian.length > 1 && (
                <div className="flex sm:hidden items-center justify-between px-1">
                  <span className="text-[11px] font-bold text-slate-500">
                    {filteredKajian.length} Agenda Tersedia
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                    <span>Geser ke samping</span>
                    <ArrowRight size={11} />
                  </span>
                </div>
              )}
              <div className="flex overflow-x-auto gap-3.5 pb-4 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-5 sm:overflow-visible sm:pb-0">
                {filteredKajian.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className="group rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between w-[250px] sm:w-auto shrink-0 snap-start"
                  >
                    {/* Poster Area */}
                    <div className="relative aspect-16/9 bg-slate-900 overflow-hidden shrink-0">
                      {item.image && isCustomPosterImage(item.image) ? (
                        <>
                          <img
                            src={item.image}
                            alt={item.tema || 'Kajian Masjid'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white border border-white/20">
                            {item.jenis_kegiatan}
                          </span>
                        </>
                      ) : (
                        <KhutbahDefaultPoster
                          variant="card"
                          jenisKegiatan={item.jenis_kegiatan}
                          khotib={item.khotib}
                          tema={item.tema || 'Kajian Rutin'}
                          tanggal={new Date(item.tanggal).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                          waktu={item.waktu}
                          className="h-full w-full"
                        />
                      )}
                    </div>

                  {/* Body Info */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-[11px] text-emerald-700 font-bold mb-1">
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} />
                          <span>
                            {new Date(item.tanggal).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </span>
                        {item.waktu && (
                          <span className="flex items-center gap-1 text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-mono text-[10px]">
                            <Clock size={11} className="text-emerald-700" />
                            <span>{item.waktu} WIB</span>
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-800 group-hover:text-emerald-800 transition-colors line-clamp-2">
                        {item.tema}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">
                        Pemateri / Khotib: <span className="font-bold text-slate-700">{item.khotib}</span>
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} className="text-slate-400" />
                        <span>Masjid Al-Mukhlisin</span>
                      </span>
                      <span className="font-bold text-emerald-700 group-hover:underline">Lihat Rincian</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            </>
          )}
        </div>
      </main>

      {/* --- DETAIL MODAL KAJIAN --- */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-16/9 bg-slate-900">
              {selectedItem.image && isCustomPosterImage(selectedItem.image) ? (
                <img
                  src={selectedItem.image}
                  alt={selectedItem.tema || 'Kajian Masjid'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <KhutbahDefaultPoster
                  variant="banner"
                  jenisKegiatan={selectedItem.jenis_kegiatan}
                  khotib={selectedItem.khotib}
                  tema={selectedItem.tema || 'Kajian Rutin'}
                  tanggal={new Date(selectedItem.tanggal).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  waktu={selectedItem.waktu}
                  className="h-full w-full"
                />
              )}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {selectedItem.jenis_kegiatan}
                </span>
                <h3 className="font-bold text-lg text-slate-800 mt-2">{selectedItem.tema || 'Kajian Masjid'}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bersama: <span className="font-bold text-slate-700">{selectedItem.khotib}</span>
                </p>
              </div>

              <div className="space-y-2 text-xs border-y border-slate-100 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tanggal Pelaksanaan</span>
                  <span className="font-bold text-slate-800">
                    {new Date(selectedItem.tanggal).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {selectedItem.waktu && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Waktu / Pukul</span>
                    <span className="font-bold text-emerald-800 font-mono">
                      {selectedItem.waktu} WIB
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Tempat</span>
                  <span className="font-bold text-slate-800">
                    Ruang Utama Masjid Al-Mukhlisin Lagadar
                  </span>
                </div>
              </div>

              {selectedItem.link && (
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-700">Tautan Rekaman / Materi:</span>
                  <a
                    href={selectedItem.link}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-xs text-emerald-700 underline font-semibold truncate"
                  >
                    {selectedItem.link}
                  </a>
                </div>
              )}

              <button
                onClick={() => setSelectedItem(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                Tutup Rincian
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}
