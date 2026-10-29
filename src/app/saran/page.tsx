'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  MessageSquareHeart,
  Send,
  CheckCircle,
  Clock,
  ShieldCheck,
  RefreshCw,
  User,
  Heart,
  Phone,
  Filter,
  X,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Shield,
  HelpCircle,
} from 'lucide-react';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';
import CustomDropdown, { DropdownOption } from '@/components/ui/custom-dropdown';
import { DataService } from '@/lib/data-service';
import { SaranKritikItem, IdentitasMasjid, KategoriSaran, KategoriItem } from '@/types';

const DEFAULT_SARAN_CATEGORIES = [
  'Umum',
  'Fasilitas & Kebersihan',
  'Kajian & Dakwah',
  'Pelayanan DKM',
  'Keuangan',
  'Lainnya',
];

export default function SaranKritikPublicPage() {
  const [saranList, setSaranList] = useState<SaranKritikItem[]>([]);
  const [identitas, setIdentitas] = useState<IdentitasMasjid | null>(null);
  const [kategoriSaran, setKategoriSaran] = useState<KategoriItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedKategori, setSelectedKategori] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Form State (Kirim Saran Baru)
  const [showFormModal, setShowFormModal] = useState(false);
  const [nama, setNama] = useState('');
  const [isAnonim, setIsAnonim] = useState(false);
  const [noHp, setNoHp] = useState('');
  const [kategori, setKategori] = useState<KategoriSaran>('Umum');
  const [pesan, setPesan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const getSaranFn = DataService?.getSaranKritik;
      const getIdentitasFn = DataService?.getIdentitas;

      const [saranRes, idRes, catRes] = await Promise.all([
        typeof getSaranFn === 'function' ? getSaranFn(true) : Promise.resolve([]),
        typeof getIdentitasFn === 'function' ? getIdentitasFn() : Promise.resolve(null),
        DataService.getKategori('saran'),
      ]);
      setSaranList(Array.isArray(saranRes) ? saranRes : []);
      if (idRes) setIdentitas(idRes);
      const activeCats = catRes.filter((k) => k.is_active !== false);
      if (activeCats.length > 0) setKategoriSaran(activeCats);
    } catch (err) {
      console.error('Failed to load saran:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleKategoriUpdate = () => {
      DataService.getKategori('saran').then((cats) => {
        const activeCats = cats.filter((k) => k.is_active !== false);
        if (activeCats.length > 0) setKategoriSaran(activeCats);
      });
    };

    const handleSaranUpdated = () => {
      loadData();
    };

    window.addEventListener('masjid_kategori_updated', handleKategoriUpdate);
    window.addEventListener('masjid_saran_updated', handleSaranUpdated);
    return () => {
      window.removeEventListener('masjid_kategori_updated', handleKategoriUpdate);
      window.removeEventListener('masjid_saran_updated', handleSaranUpdated);
    };
  }, []);

  const saranOptions = useMemo(() => {
    if (kategoriSaran.length > 0) {
      return kategoriSaran.map((k) => k.nama);
    }
    return DEFAULT_SARAN_CATEGORIES;
  }, [kategoriSaran]);

  const dropdownFilterKategoriOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: 'all', label: 'Semua Topik' },
      ...saranOptions.map((opt) => ({
        value: opt,
        label: opt,
      })),
    ];
  }, [saranOptions]);

  const dropdownFilterStatusOptions: DropdownOption[] = [
    { value: 'all', label: 'Semua Status Respon' },
    { value: 'terjawab', label: 'Sudah Ditanggapi DKM' },
    { value: 'belum', label: 'Sedang Ditinjau' },
  ];

  const dropdownFormKategoriOptions: DropdownOption[] = useMemo(() => {
    return saranOptions.map((opt) => ({
      value: opt,
      label: opt,
    }));
  }, [saranOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pesan.trim()) return;

    setSubmitting(true);
    try {
      if (typeof DataService?.addSaranKritik === 'function') {
        await DataService.addSaranKritik({
          nama: isAnonim ? 'Hamba Allah' : (nama.trim() || 'Hamba Allah'),
          no_hp: noHp.trim() || undefined,
          kategori,
          pesan: pesan.trim(),
          status: 'baru',
          is_publik: true,
        });
      }

      setSubmitSuccess(true);
      setNama('');
      setNoHp('');
      setPesan('');
      setIsAnonim(false);
      setKategori('Umum');
      loadData();

      setTimeout(() => {
        setSubmitSuccess(false);
        setShowFormModal(false);
      }, 3000);
    } catch (err) {
      console.error('Error submitting saran:', err);
      alert('Terjadi kendala saat mengirim masukan. Silakan coba kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return saranList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tanggapan_dkm && item.tanggapan_dkm.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchKategori = selectedKategori === 'all' || item.kategori === selectedKategori;
      const matchStatus =
        selectedStatus === 'all'
          ? true
          : selectedStatus === 'terjawab'
          ? Boolean(item.tanggapan_dkm)
          : !item.tanggapan_dkm;

      return matchSearch && matchKategori && matchStatus;
    });
  }, [saranList, searchTerm, selectedKategori, selectedStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = saranList.length;
    const terjawab = saranList.filter((s) => Boolean(s.tanggapan_dkm)).length;
    const proses = saranList.filter((s) => s.status === 'ditindaklanjuti' || s.status === 'ditinjau').length;
    return { total, terjawab, proses };
  }, [saranList]);

  return (
    <div className="min-h-screen bg-[#f4f7f6] font-sans text-slate-900 pb-28 md:pb-16 selection:bg-emerald-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0a1f18]/95 backdrop-blur-md text-white border-b border-emerald-900/40">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-1.5 text-xs font-bold text-slate-200 hover:text-white"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Beranda</span>
            </Link>
            <div className="h-4 w-px bg-white/20" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-800 border border-emerald-500/30 overflow-hidden flex items-center justify-center">
                <img
                  src={identitas?.logo_url || '/icon.svg'}
                  alt={identitas?.nama || 'Masjid Al-Mukhlisin'}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-serif-elegant font-bold text-base md:text-lg tracking-wide text-white whitespace-nowrap">
                {identitas?.nama || 'Al-Mukhlisin'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowFormModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 shadow-sm transition-all active:scale-95"
            >
              <Send size={13} />
              <span>Tulis Saran Baru</span>
            </button>
            <Link
              href="/login"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 transition-all"
            >
              <Shield size={13} className="text-emerald-400" />
              <span>Portal Pengurus</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Header */}
      <section className="bg-gradient-to-b from-[#0a1f18] via-[#0f2e24] to-[#143d30] text-white pt-16 sm:pt-20 pb-16 sm:pb-20 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:16px_16px]" />

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[11px] font-bold text-emerald-300 tracking-wide uppercase">
            <MessageSquareHeart size={13} className="text-[#d4af37]" />
            <span>Transparansi & Musyawarah Umat</span>
          </div>

          <h1 className="font-serif-elegant text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white max-w-3xl mx-auto leading-tight">
            Kotak Saran & Aspirasi Jamaah
          </h1>

          <p className="max-w-2xl mx-auto text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
            "Agama adalah nasehat." (HR. Muslim). Kami terbuka dan berterima kasih atas setiap masukan, kritik konstruktif, serta saran demi kebaikan dan kemakmuran ibadah di Masjid {identitas?.nama || 'Al-Mukhlisin'}.
          </p>

          {/* Quick CTA to open Form */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setShowFormModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs md:text-sm font-black bg-gradient-to-r from-emerald-500 to-[#0d8a5e] text-white shadow-xl hover:shadow-emerald-900/50 hover:brightness-110 transition-all active:scale-95"
            >
              <Send size={15} />
              <span>Kirim Aspirasi & Masukan Anda</span>
            </button>
            <a
              href="#daftar-saran"
              className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full text-xs md:text-sm font-bold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
            >
              <span>Lihat Tanggapan DKM</span>
              <ChevronDown size={14} />
            </a>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="max-w-5xl mx-auto mt-10 grid grid-cols-3 gap-3 md:gap-6 bg-white/10 backdrop-blur-md p-4 md:p-6 rounded-3xl border border-white/15">
          <div className="text-center">
            <p className="font-serif-elegant text-2xl md:text-4xl font-bold text-white">
              {stats.total}
            </p>
            <p className="text-[10px] md:text-xs font-bold text-emerald-300 uppercase tracking-wider mt-1">
              Aspirasi Masuk
            </p>
          </div>
          <div className="text-center border-x border-white/10">
            <p className="font-serif-elegant text-2xl md:text-4xl font-bold text-emerald-400">
              {stats.terjawab}
            </p>
            <p className="text-[10px] md:text-xs font-bold text-emerald-300 uppercase tracking-wider mt-1">
              Respon Resmi DKM
            </p>
          </div>
          <div className="text-center">
            <p className="font-serif-elegant text-2xl md:text-4xl font-bold text-[#d4af37]">
              {stats.proses}
            </p>
            <p className="text-[10px] md:text-xs font-bold text-emerald-300 uppercase tracking-wider mt-1">
              Tindak Lanjut Aktif
            </p>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="daftar-saran" className="max-w-7xl mx-auto px-4 md:px-8 -mt-6 relative z-20 space-y-8">
        {/* Filter & Search Bar */}
        <div className="bg-white p-5 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200/80 space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari kata kunci saran, topik, atau tanggapan..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-xs md:text-sm focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 bg-slate-50/50"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <CustomDropdown
                value={selectedKategori}
                onChange={(val) => setSelectedKategori(val)}
                options={dropdownFilterKategoriOptions}
                className="w-full sm:w-48"
              />

              <CustomDropdown
                value={selectedStatus}
                onChange={(val) => setSelectedStatus(val)}
                options={dropdownFilterStatusOptions}
                className="w-full sm:w-56"
              />
            </div>
          </div>

          {/* Category Quick Tags */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="font-bold text-slate-400 text-[11px] uppercase tracking-wider shrink-0 mr-1">
              Kategori:
            </span>
            {['all', ...saranOptions].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedKategori(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
                  selectedKategori === cat
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'Semua' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Saran Cards Feed */}
        {loading ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <RefreshCw className="animate-spin mx-auto text-emerald-600" size={32} />
            <p className="text-xs text-slate-500 font-medium">Memuat aspirasi dan saran jamaah...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <MessageSquareHeart size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif-elegant font-bold text-lg text-slate-800">
                Belum ada saran yang sesuai kriteria
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Jadilah yang pertama menyampaikan masukan atau aspirasi untuk memakmurkan Masjid {identitas?.nama || 'Al-Mukhlisin'}.
              </p>
            </div>
            <button
              onClick={() => setShowFormModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#0d8a5e] text-white hover:bg-emerald-600 transition-all shadow-md active:scale-95"
            >
              <Send size={13} />
              <span>Tulis Masukan Pertama</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 p-6 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  {/* Card Header */}
                  <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 shadow-inner">
                        {item.nama === 'Hamba Allah' ? (
                          <User size={18} className="text-emerald-700" />
                        ) : (
                          item.nama.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 text-sm">{item.nama}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                            {item.kategori}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {new Date(item.created_at).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div>
                      {item.tanggapan_dkm ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                          <CheckCircle size={12} className="text-emerald-600" />
                          <span>Telah Ditanggapi</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                          <Clock size={12} className="text-amber-600" />
                          <span>Sedang Ditinjau</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Isi Saran Jamaah */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Aspirasi / Saran:
                    </p>
                    <p className="text-sm text-slate-800 leading-relaxed font-medium bg-slate-50/80 p-4 rounded-2xl border border-slate-100 italic">
                      "{item.pesan}"
                    </p>
                  </div>

                  {/* Tanggapan Resmi DKM jika ada */}
                  {item.tanggapan_dkm ? (
                    <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/50 p-4 sm:p-5 rounded-2xl border border-emerald-300/60 shadow-xs space-y-2.5 relative">
                      <div className="flex items-center justify-between gap-2 border-b border-emerald-200/60 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <ShieldCheck size={13} />
                          </div>
                          <span className="font-black text-xs text-emerald-950 uppercase tracking-wider">
                            Respon Resmi Pengurus DKM
                          </span>
                        </div>
                        {item.status === 'selesai' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-200/80 text-emerald-900">
                            Selesai
                          </span>
                        )}
                        {item.status === 'ditindaklanjuti' && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-sky-100 text-sky-800">
                            Ditindaklanjuti
                          </span>
                        )}
                      </div>

                      <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-medium">
                        {item.tanggapan_dkm}
                      </p>

                      <div className="flex items-center justify-between pt-1 text-[11px] text-emerald-700 font-semibold">
                        <span>Oleh: {item.ditanggapi_oleh || `Pengurus DKM ${identitas?.nama || 'Al-Mukhlisin'}`}</span>
                        {item.ditanggapi_pada && (
                          <span className="text-[10px] opacity-75 font-normal">
                            {new Date(item.ditanggapi_pada).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/50 text-xs text-amber-800 flex items-center gap-2">
                      <Clock size={14} className="text-amber-600 shrink-0" />
                      <span className="text-[11px]">
                        Aspirasi ini telah diterima dan sedang dipelajari oleh divisi terkait DKM.
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Masjid {identitas?.nama || 'Al-Mukhlisin'} &bull; Saran #{item.id}</span>
                  <span className="flex items-center gap-1 text-emerald-600 font-bold">
                    <Heart size={10} className="fill-emerald-500 text-emerald-500" />
                    Kemakmuran Masjid
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Formulir Saran Baru */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                  <MessageSquareHeart size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-base md:text-lg text-slate-900">
                    Sampaikan Saran & Masukan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Masukan Anda sangat berarti bagi kemakmuran masjid
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {submitSuccess ? (
              <div className="p-6 text-center space-y-3 bg-emerald-50 rounded-2xl border border-emerald-200">
                <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle size={28} />
                </div>
                <h4 className="font-bold text-emerald-950 text-base">Jazakallahu Khairan!</h4>
                <p className="text-xs text-emerald-800 leading-relaxed max-w-sm mx-auto">
                  Alhamdulillah, aspirasi dan saran Anda telah tersimpan dan akan segera ditinjau oleh Pengurus DKM {identitas?.nama || 'Al-Mukhlisin'}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Opsi Kirim Sebagai Anonim */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs">
                    <span className="font-bold text-slate-800 block">Kirim sebagai Anonim</span>
                    <span className="text-[11px] text-slate-500">
                      Nama akan tampil sebagai "Hamba Allah"
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isAnonim}
                    onChange={(e) => setIsAnonim(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {!isAnonim && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Jamaah / Warga
                    </label>
                    <input
                      type="text"
                      value={nama}
                      onChange={(e) => setNama(e.target.value)}
                      placeholder="Contoh: Pak Hendra / Ibu Siti"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-600"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. WhatsApp (Opsional)
                  </label>
                  <input
                    type="tel"
                    value={noHp}
                    onChange={(e) => setNoHp(e.target.value)}
                    placeholder="Contoh: 081234567890 (jika ingin dihubungi pengurus)"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Nomor kontak Anda aman dan tidak akan disebarluaskan ke publik.
                  </p>
                </div>

                <CustomDropdown
                  label="Kategori Aspirasi"
                  value={kategori}
                  onChange={(val) => setKategori(val as KategoriSaran)}
                  options={dropdownFormKategoriOptions}
                />

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Isi Saran, Masukan, atau Kritik Konstruktif <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={pesan}
                    onChange={(e) => setPesan(e.target.value)}
                    placeholder="Sampaikan saran Anda dengan santun dan jelas demi kebaikan bersama..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowFormModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !pesan.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0d8a5e] text-white text-xs font-bold hover:bg-emerald-600 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>{submitting ? 'Mengirimkan...' : 'Kirim Saran Sekarang'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Quick Button khusus Mobile */}
      <div className="fixed bottom-[5.5rem] right-4 z-40 md:hidden">
        <button
          onClick={() => setShowFormModal(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-[#0d8a5e] text-white font-bold text-xs shadow-2xl shadow-emerald-950/40 hover:scale-105 active:scale-95 transition-all border border-emerald-400/30"
          title="Tulis Saran Baru"
        >
          <MessageSquareHeart size={16} />
          <span>Tulis Saran</span>
        </button>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav variant="public" />
    </div>
  );
}
