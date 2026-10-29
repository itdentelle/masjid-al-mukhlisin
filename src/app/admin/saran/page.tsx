'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  MessageSquareHeart,
  Search,
  X,
  Phone,
  MessageCircle,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  Edit3,
  Download,
  Eye,
  EyeOff,
  Send,
  User,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import CustomDropdown, { DropdownOption } from '@/components/ui/custom-dropdown';
import { DataService } from '@/lib/data-service';
import { SaranKritikItem, KategoriSaran, StatusSaran, KategoriItem } from '@/types';

const DEFAULT_SARAN_CATEGORIES = [
  'Umum',
  'Fasilitas & Kebersihan',
  'Kajian & Dakwah',
  'Pelayanan DKM',
  'Keuangan',
  'Lainnya',
];

export default function AdminSaranPage() {
  const [saranList, setSaranList] = useState<SaranKritikItem[]>([]);
  const [kategoriSaran, setKategoriSaran] = useState<KategoriItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterKategori, setFilterKategori] = useState<string>('all');

  // Modal Tanggapan / Edit
  const [selectedItem, setSelectedItem] = useState<SaranKritikItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tanggapanText, setTanggapanText] = useState('');
  const [ditanggapiOleh, setDitanggapiOleh] = useState('Pengurus DKM Al-Mukhlisin');
  const [statusVal, setStatusVal] = useState<StatusSaran>('ditindaklanjuti');
  const [isPublikVal, setIsPublikVal] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm Modal
  const [deleteId, setDeleteId] = useState<number | string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      if (typeof DataService?.getSaranKritik === 'function') {
        const [items, categories] = await Promise.all([
          DataService.getSaranKritik(),
          DataService.getKategori('saran'),
        ]);
        setSaranList(Array.isArray(items) ? items : []);
        const activeCats = categories.filter((k) => k.is_active !== false);
        if (activeCats.length > 0) setKategoriSaran(activeCats);
      }
    } catch (err) {
      console.error('Failed to load saran list:', err);
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
      { value: 'all', label: 'Semua Kategori' },
      ...saranOptions.map((opt) => ({
        value: opt,
        label: opt,
      })),
    ];
  }, [saranOptions]);

  const openEditModal = (item: SaranKritikItem) => {
    setSelectedItem(item);
    setTanggapanText(item.tanggapan_dkm || '');
    setDitanggapiOleh(item.ditanggapi_oleh || 'Pengurus DKM Al-Mukhlisin');
    setStatusVal(item.status === 'baru' ? 'ditindaklanjuti' : item.status);
    setIsPublikVal(item.is_publik !== false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleSaveTanggapan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      if (typeof DataService?.updateSaranKritik === 'function') {
        await DataService.updateSaranKritik(selectedItem.id, {
          tanggapan_dkm: tanggapanText.trim() || null,
          ditanggapi_oleh: ditanggapiOleh.trim() || 'Pengurus DKM',
          ditanggapi_pada: new Date().toISOString(),
          status: statusVal,
          is_publik: isPublikVal,
        });
      }
      closeModal();
      loadData();
    } catch (err) {
      console.error('Failed to update saran:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      if (typeof DataService?.deleteSaranKritik === 'function') {
        await DataService.deleteSaranKritik(deleteId);
      }
      setDeleteId(null);
      loadData();
    } catch (err) {
      console.error('Failed to delete saran:', err);
    }
  };

  const handleTogglePublik = async (item: SaranKritikItem) => {
    try {
      if (typeof DataService?.updateSaranKritik === 'function') {
        await DataService.updateSaranKritik(item.id, {
          is_publik: !item.is_publik,
        });
      }
      loadData();
    } catch (err) {
      console.error('Failed to toggle is_publik:', err);
    }
  };

  // Filtered Items
  const filteredItems = useMemo(() => {
    return saranList.filter((item) => {
      const matchSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.pesan.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tanggapan_dkm && item.tanggapan_dkm.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.no_hp && item.no_hp.includes(searchTerm));

      const matchStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchKategori = filterKategori === 'all' || item.kategori === filterKategori;

      return matchSearch && matchStatus && matchKategori;
    });
  }, [saranList, searchTerm, filterStatus, filterKategori]);

  // Statistics
  const stats = useMemo(() => {
    const total = saranList.length;
    const baru = saranList.filter((s) => s.status === 'baru').length;
    const ditindaklanjuti = saranList.filter((s) => s.status === 'ditindaklanjuti' || s.status === 'ditinjau').length;
    const selesai = saranList.filter((s) => s.status === 'selesai').length;
    return { total, baru, ditindaklanjuti, selesai };
  }, [saranList]);

  const dropdownFilterStatusOptions: DropdownOption[] = useMemo(() => [
    { value: 'all', label: 'Semua Status' },
    { value: 'baru', label: `Belum Ditanggapi (${stats.baru})` },
    { value: 'ditinjau', label: 'Sedang Ditinjau' },
    { value: 'ditindaklanjuti', label: 'Sedang Ditindaklanjuti' },
    { value: 'selesai', label: 'Selesai' },
  ], [stats.baru]);

  // Export to Excel
  const handleExportExcel = () => {
    if (saranList.length === 0) {
      alert('Tidak ada data saran untuk diekspor');
      return;
    }

    const exportData = filteredItems.map((s, index) => ({
      No: index + 1,
      Tanggal: new Date(s.created_at).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      'Nama Jamaah': s.nama,
      'No. WhatsApp': s.no_hp || '-',
      Kategori: s.kategori,
      'Isi Saran & Kritik': s.pesan,
      Status:
        s.status === 'baru'
          ? 'Belum Ditanggapi'
          : s.status === 'ditinjau'
            ? 'Ditinjau'
            : s.status === 'ditindaklanjuti'
              ? 'Sedang Ditindaklanjuti'
              : 'Selesai',
      'Tanggapan Resmi DKM': s.tanggapan_dkm || 'Belum ada tanggapan',
      'Penjawab DKM': s.ditanggapi_oleh || '-',
      'Tanggal Tanggapan': s.ditanggapi_pada
        ? new Date(s.ditanggapi_pada).toLocaleDateString('id-ID')
        : '-',
      'Tampil di Publik': s.is_publik ? 'Ya' : 'Tidak',
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Saran & Kritik Jamaah');
    XLSX.writeFile(
      wb,
      `Kotak_Saran_Jamaah_Al_Mukhlisin_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  const getStatusBadge = (status: StatusSaran) => {
    switch (status) {
      case 'baru':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle size={11} /> Baru (Belum Dijawab)
          </span>
        );
      case 'ditinjau':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={11} /> Sedang Ditinjau
          </span>
        );
      case 'ditindaklanjuti':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-50 text-sky-700 border border-sky-200">
            <RefreshCw size={11} className="animate-spin" /> Sedang Ditindaklanjuti
          </span>
        );
      case 'selesai':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle size={11} /> Telah Selesai
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout>
      <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-24">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs">
          <div>
            <div className="flex items-center gap-2 sm:gap-2.5 mb-1 sm:mb-1.5">
              <div className="p-2 sm:p-2.5 bg-emerald-50 text-emerald-700 rounded-xl sm:rounded-2xl border border-emerald-100">
                <MessageSquareHeart size={22} className="sm:size-[24px]" />
              </div>
              <h1 className="font-serif-elegant text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                Kotak Saran & Aspirasi Jamaah
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 max-w-2xl">
              Pusat penerimaan masukan, kritik konstruktif, dan saran dari jamaah. Berikan tanggapan resmi DKM secara amanah dan solutif.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <button
              onClick={loadData}
              className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Muat Ulang Data"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={handleExportExcel}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-700 transition-all shadow-sm active:scale-95"
            >
              <Download size={15} />
              <span>Ekspor ke Excel</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-slate-100 text-slate-700 rounded-xl sm:rounded-2xl shrink-0">
              <MessageSquareHeart size={20} className="sm:size-[22px]" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Masukan</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-rose-50 text-rose-600 rounded-xl sm:rounded-2xl shrink-0">
              <AlertCircle size={20} className="sm:size-[22px]" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-rose-500">Perlu Tanggapan</p>
              <p className="text-xl sm:text-2xl font-bold text-rose-600">{stats.baru}</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-sky-50 text-sky-600 rounded-xl sm:rounded-2xl shrink-0">
              <RefreshCw size={20} className="sm:size-[22px]" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-sky-600">Proses Tindak Lanjut</p>
              <p className="text-xl sm:text-2xl font-bold text-sky-700">{stats.ditindaklanjuti}</p>
            </div>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-3 sm:gap-4">
            <div className="p-2.5 sm:p-3 bg-emerald-50 text-emerald-600 rounded-xl sm:rounded-2xl shrink-0">
              <CheckCircle2 size={20} className="sm:size-[22px]" />
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-emerald-600">Telah Selesai</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-700">{stats.selesai}</p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama jamaah, isi saran, nomor WA, atau tanggapan..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <CustomDropdown
                value={filterStatus}
                onChange={(val) => setFilterStatus(val)}
                options={dropdownFilterStatusOptions}
                className="w-full sm:w-56"
              />

              <CustomDropdown
                value={filterKategori}
                onChange={(val) => setFilterKategori(val)}
                options={dropdownFilterKategoriOptions}
                className="w-full sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* Content List */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
            <RefreshCw className="animate-spin mx-auto text-emerald-600" size={28} />
            <p className="text-xs text-slate-500">Memuat data saran dan kritik jamaah...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
            <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
              <MessageSquareHeart size={24} />
            </div>
            <h3 className="font-bold text-slate-700 text-sm">Tidak ada saran yang sesuai</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchTerm || filterStatus !== 'all' || filterKategori !== 'all'
                ? 'Coba ganti filter atau kata kunci pencarian Anda.'
                : 'Belum ada saran atau masukan yang masuk dari jamaah.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all ${item.status === 'baru'
                    ? 'border-rose-200 shadow-md shadow-rose-50/50 ring-1 ring-rose-100'
                    : 'border-slate-200/80 hover:border-slate-300 shadow-xs'
                  }`}
              >
                {/* Item Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0 border border-emerald-100">
                      {item.nama === 'Hamba Allah' ? (
                        <User size={18} />
                      ) : (
                        item.nama.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{item.nama}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {item.kategori}
                        </span>
                        {item.no_hp && (
                          <a
                            href={`https://wa.me/${item.no_hp.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-colors"
                            title="Chat WhatsApp Jamaah"
                          >
                            <Phone size={10} />
                            <span>{item.no_hp}</span>
                          </a>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Dikirim pada{' '}
                        {new Date(item.created_at).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {getStatusBadge(item.status)}
                    <button
                      onClick={() => handleTogglePublik(item)}
                      className={`p-1.5 rounded-xl border text-[11px] flex items-center gap-1 transition-colors ${item.is_publik
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100'
                        }`}
                      title={item.is_publik ? 'Tampil di Halaman Publik' : 'Disembunyikan dari Publik'}
                    >
                      {item.is_publik ? <Eye size={13} /> : <EyeOff size={13} />}
                      <span className="hidden sm:inline font-bold">
                        {item.is_publik ? 'Publik' : 'Privat'}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Isi Saran Jamaah */}
                <div className="py-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                    Isi Aspirasi / Saran:
                  </p>
                  <p className="text-sm text-slate-800 leading-relaxed font-medium whitespace-pre-wrap bg-slate-50/80 p-4 rounded-2xl border border-slate-100">
                    "{item.pesan}"
                  </p>
                </div>

                {/* Tanggapan Resmi DKM jika sudah ada */}
                {item.tanggapan_dkm ? (
                  <div className="mb-4 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/80 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-600" />
                        Tanggapan Resmi Pengurus DKM
                      </span>
                      {item.ditanggapi_pada && (
                        <span className="text-[10px] text-emerald-600 font-medium">
                          {new Date(item.ditanggapi_pada).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs md:text-sm text-emerald-950 leading-relaxed font-medium">
                      {item.tanggapan_dkm}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-bold">
                      Oleh: {item.ditanggapi_oleh || 'Pengurus DKM Al-Mukhlisin'}
                    </p>
                  </div>
                ) : (
                  <div className="mb-4 py-2 px-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Clock size={13} className="text-amber-600 shrink-0" />
                      Belum ada tanggapan resmi dari pengurus untuk aspirasi ini.
                    </span>
                    <button
                      onClick={() => openEditModal(item)}
                      className="font-bold text-emerald-700 hover:underline shrink-0 text-xs"
                    >
                      Beri Tanggapan Sekarang &rarr;
                    </button>
                  </div>
                )}

                {/* Action Footer */}
                <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
                  <div className="text-[11px] text-slate-400">
                    ID Saran #{item.id}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditModal(item)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#0d8a5e] text-white hover:bg-emerald-600 transition-all shadow-xs active:scale-95"
                    >
                      <Edit3 size={13} />
                      <span>{item.tanggapan_dkm ? 'Ubah Tanggapan / Status' : 'Tanggapi Masukan'}</span>
                    </button>

                    <button
                      onClick={() => setDeleteId(item.id)}
                      className="p-1.5 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                      title="Hapus Saran"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Beri Tanggapan */}
        {isModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                    <MessageSquareHeart size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Tanggapan Resmi Pengurus DKM
                    </h3>
                    <p className="text-xs text-slate-500">
                      Menanggapi aspirasi dari: <span className="font-bold text-slate-800">{selectedItem.nama}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Kutipan Masukan */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-1">
                <span className="font-bold text-slate-500 uppercase text-[10px]">Pesan Jamaah:</span>
                <p className="text-slate-800 font-medium italic">"{selectedItem.pesan}"</p>
              </div>

              <form onSubmit={handleSaveTanggapan} className="space-y-4">
                {/* Status Selection */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Status Aspirasi
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 'ditinjau', label: 'Ditinjau' },
                      { val: 'ditindaklanjuti', label: 'Ditindaklanjuti' },
                      { val: 'selesai', label: 'Selesai' },
                    ].map((st) => (
                      <button
                        type="button"
                        key={st.val}
                        onClick={() => setStatusVal(st.val as StatusSaran)}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${statusVal === st.val
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-600 ring-1 ring-emerald-600'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                          }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ditanggapi Oleh */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ditanggapi Atas Nama
                  </label>
                  <input
                    type="text"
                    required
                    value={ditanggapiOleh}
                    onChange={(e) => setDitanggapiOleh(e.target.value)}
                    placeholder="Contoh: Ustadz H. Ahmad Sobari (Ketua DKM) atau Tim Sarpras"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-600"
                  />
                </div>

                {/* Isi Tanggapan Resmi */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Isi Tanggapan Resmi DKM <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={tanggapanText}
                    onChange={(e) => setTanggapanText(e.target.value)}
                    placeholder="Tuliskan jawaban yang ramah, santun, dan solutif mewakili pengurus masjid..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-hidden focus:border-emerald-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Tanggapan ini akan dapat dibaca oleh jamaah pada halaman khusus publik 'Saran & Kritik'.
                  </p>
                </div>

                {/* Toggle Publikasi */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="font-bold text-xs text-slate-800 block">
                      Tampilkan di Halaman Khusus Saran Publik
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Jika aktif, saran ini beserta tanggapannya dapat dilihat oleh seluruh jamaah di halaman publik.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublikVal}
                    onChange={(e) => setIsPublikVal(e.target.checked)}
                    className="h-4 w-4 rounded-sm border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0d8a5e] text-white text-xs font-bold hover:bg-emerald-600 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <Send size={13} />
                    <span>{submitting ? 'Menyimpan...' : 'Simpan & Publikasikan Tanggapan'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Hapus */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 size={24} />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-base text-slate-900">Hapus Masukan Jamaah?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Aspirasi ini akan dihapus secara permanen dari sistem. Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 shadow-sm"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
