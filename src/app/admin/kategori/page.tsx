'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Tags,
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Wallet,
  HandHeart,
  Landmark,
  MessageSquareHeart,
  CalendarDays,
  Users,
  Check,
  ArrowUpDown,
  Filter,
  Mic,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import CustomDropdown, { DropdownOption } from '@/components/ui/custom-dropdown';
import { DataService, INITIAL_KATEGORI } from '@/lib/data-service';
import { KategoriItem, ModulKategori } from '@/types';

interface ModulConfig {
  key: ModulKategori;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

const MODUL_LIST: ModulConfig[] = [
  {
    key: 'kas',
    label: 'Kas Keuangan',
    icon: Wallet,
    color: 'emerald',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    badgeText: 'Kas Masuk & Keluar',
    description: 'Kategori transaksi buku kas operasional dan infaq',
  },
  {
    key: 'zakat',
    label: 'Zakat & Qurban',
    icon: HandHeart,
    color: 'amber',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    badgeText: 'Zakat & Qurban',
    description: 'Jenis penerimaan zakat fitrah, zakat mal, qurban & penyaluran',
  },
  {
    key: 'wakaf',
    label: 'Harta Wakaf',
    icon: Landmark,
    color: 'teal',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    badgeText: 'Harta Wakaf',
    description: 'Kategori aset wakaf fisik, tanah, bangunan, uang, mushaf dll',
  },
  {
    key: 'saran',
    label: 'Saran Jamaah',
    icon: MessageSquareHeart,
    color: 'blue',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    badgeText: 'Aspirasi Jamaah',
    description: 'Topik pengelompokan masukan warga & jamaah masjid',
  },
  {
    key: 'agenda',
    label: 'Agenda & Kajian',
    icon: CalendarDays,
    color: 'indigo',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    badgeText: 'Agenda & Kajian',
    description: 'Jenis kegiatan dakwah, khutbah Jumat, dan jadwal pengajian',
  },
  {
    key: 'jamaah',
    label: 'Peran Jamaah',
    icon: Users,
    color: 'purple',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    badgeText: 'Status & Peran',
    description: 'Klasifikasi peran warga, DKM, imam, muadzin & donatur',
  },
];

const dropdownModulOptions: DropdownOption[] = MODUL_LIST.map((m) => ({
  value: m.key,
  label: m.label,
}));

const dropdownArahKasOptions: DropdownOption[] = [
  { value: 'masuk', label: 'Pemasukan (+)', badge: { text: '+ Masuk', variant: 'emerald' } },
  { value: 'keluar', label: 'Pengeluaran (-)', badge: { text: '- Keluar', variant: 'rose' } },
  { value: 'semua', label: 'Bebas / Bisa Masuk & Keluar', badge: { text: 'Fleksibel', variant: 'slate' } },
];

const dropdownFilterStatusOptions: DropdownOption[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'active', label: 'Hanya Aktif' },
  { value: 'inactive', label: 'Hanya Nonaktif' },
];

export default function MasterKategoriPage() {
  const [categories, setCategories] = useState<KategoriItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | ModulKategori>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal State
  const [modalMode, setModalMode] = useState<'add' | 'edit' | null>(null);
  const [selectedItem, setSelectedItem] = useState<KategoriItem | null>(null);
  const [formData, setFormData] = useState<{
    modul: ModulKategori;
    nama: string;
    deskripsi: string;
    tipe: 'masuk' | 'keluar' | 'semua' | '';
    urutan: number;
    is_active: boolean;
  }>({
    modul: 'kas',
    nama: '',
    deskripsi: '',
    tipe: 'masuk',
    urutan: 1,
    is_active: true,
  });

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Load Data
  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await DataService.getKategori();
      setCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && MODUL_LIST.some((m) => m.key === tab)) {
        setActiveTab(tab as ModulKategori);
      }
    }
  }, []);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  // Filtered List
  const filteredCategories = useMemo(() => {
    return categories.filter((item) => {
      const matchModul = activeTab === 'all' || item.modul === activeTab;
      const matchSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.deskripsi && item.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && item.is_active !== false) ||
        (filterStatus === 'inactive' && item.is_active === false);
      return matchModul && matchSearch && matchStatus;
    });
  }, [categories, activeTab, searchTerm, filterStatus]);

  // Counts by Module
  const countsByModul = useMemo(() => {
    const counts: Record<string, number> = { all: categories.length };
    MODUL_LIST.forEach((m) => {
      counts[m.key] = categories.filter((c) => c.modul === m.key).length;
    });
    return counts;
  }, [categories]);

  // Handle Open Add
  const handleOpenAdd = (defaultModul?: ModulKategori) => {
    const targetModul = defaultModul || (activeTab === 'all' ? 'kas' : activeTab);
    const existingInModul = categories.filter((c) => c.modul === targetModul);
    const nextOrder = existingInModul.length > 0 ? Math.max(...existingInModul.map((c) => c.urutan || 0)) + 1 : 1;

    setFormData({
      modul: targetModul,
      nama: '',
      deskripsi: '',
      tipe: targetModul === 'kas' ? 'masuk' : '',
      urutan: nextOrder,
      is_active: true,
    });
    setModalMode('add');
    setSelectedItem(null);
  };

  // Handle Open Edit
  const handleOpenEdit = (item: KategoriItem) => {
    setSelectedItem(item);
    setFormData({
      modul: item.modul,
      nama: item.nama,
      deskripsi: item.deskripsi || '',
      tipe: item.tipe || (item.modul === 'kas' ? 'semua' : ''),
      urutan: item.urutan || 1,
      is_active: item.is_active !== false,
    });
    setModalMode('edit');
  };

  // Handle Save (Add or Edit)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama.trim()) {
      showNotification('error', 'Nama kategori wajib diisi.');
      return;
    }

    setSaving(true);
    try {
      const payload: Omit<KategoriItem, 'id' | 'created_at'> = {
        modul: formData.modul,
        nama: formData.nama.trim(),
        deskripsi: formData.deskripsi.trim() || null,
        tipe: formData.modul === 'kas' ? (formData.tipe as any) || 'semua' : null,
        urutan: Number(formData.urutan) || 1,
        is_active: formData.is_active,
      };

      if (modalMode === 'add') {
        await DataService.addKategori(payload);
        showNotification('success', `Kategori "${payload.nama}" berhasil ditambahkan.`);
      } else if (modalMode === 'edit' && selectedItem) {
        await DataService.updateKategori(selectedItem.id, payload);
        showNotification('success', `Kategori "${payload.nama}" berhasil diperbarui.`);
      }

      setModalMode(null);
      await loadCategories();
    } catch (err: any) {
      showNotification('error', err?.message || 'Gagal menyimpan kategori.');
    } finally {
      setSaving(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id: number | string, nama: string) => {
    try {
      await DataService.deleteKategori(id);
      showNotification('success', `Kategori "${nama}" berhasil dihapus.`);
      setConfirmDeleteId(null);
      await loadCategories();
    } catch (err: any) {
      showNotification('error', err?.message || 'Gagal menghapus kategori.');
    }
  };

  // Handle Reset to Initial Data
  const handleResetToDefault = async () => {
    try {
      setLoading(true);
      await DataService.resetKategoriDefault();
      showNotification('success', 'Seluruh kategori berhasil dipulihkan ke data inisialisasi awal.');
      setShowResetConfirm(false);
      await loadCategories();
    } catch (err: any) {
      showNotification('error', err?.message || 'Gagal memulihkan kategori.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                <Tags size={20} />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
                  Master Kategori Dropdown
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Kelola opsi dropdown kategori untuk formulir Kas, Zakat, Wakaf, Saran, Agenda, dan Jamaah
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold rounded-xl shadow-xs transition"
              title="Kembalikan opsi kategori ke standar awal sistem"
            >
              <RotateCcw size={14} className="text-slate-500" />
              <span>Pulihkan Standar</span>
            </button>
            <button
              onClick={() => handleOpenAdd()}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-900/10 transition active:scale-95"
            >
              <Plus size={16} />
              <span>Tambah Kategori</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {message && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between transition ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
              <X size={15} />
            </button>
          </div>
        )}

        {/* Information Callout */}
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/70 rounded-2xl p-4 sm:p-5 text-xs text-slate-700">
          <div className="flex items-start gap-3">
            <span className="p-1.5 bg-emerald-600 text-white rounded-lg shrink-0 mt-0.5">
              <HelpCircle size={15} />
            </span>
            <div className="space-y-1">
              <p className="font-bold text-emerald-950">
                Data Inisialisasi Dinamis & Terintegrasi
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px] sm:text-xs">
                Setiap kategori yang Anda tambahkan, ubah, atau hapus di sini otomatis langsung memperbarui pilihan dropdown pada formulir transaksi terkait di seluruh aplikasi. Kategori bawaan sistem telah diisi sebagai data awal.
              </p>
            </div>
          </div>
        </div>

        {/* Module Filter Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                activeTab === 'all'
                  ? 'bg-emerald-800 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Semua Modul</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  activeTab === 'all' ? 'bg-emerald-900/60 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {countsByModul.all}
              </span>
            </button>

            {MODUL_LIST.map((m) => {
              const Icon = m.icon;
              const isActive = activeTab === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setActiveTab(m.key)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-emerald-200' : 'text-slate-400'} />
                  <span>{m.label}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                      isActive ? 'bg-emerald-900/60 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {countsByModul[m.key] || 0}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama kategori atau deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
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

          <div className="flex items-center gap-2 w-full md:w-52">
            <CustomDropdown
              value={filterStatus}
              onChange={(val) => setFilterStatus(val as any)}
              options={dropdownFilterStatusOptions}
              className="w-full"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4">Nama Kategori Dropdown</th>
                  <th className="py-3 px-4">Modul / Halaman</th>
                  <th className="py-3 px-4">Tipe / Keterangan</th>
                  <th className="py-3 px-4 w-20 text-center">Urutan</th>
                  <th className="py-3 px-4 w-24 text-center">Status</th>
                  <th className="py-3 px-4 w-28 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mb-2" />
                      <p className="font-bold text-xs">Memuat daftar kategori...</p>
                    </td>
                  </tr>
                ) : filteredCategories.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 space-y-2">
                      <Tags size={32} className="mx-auto text-slate-300" />
                      <p className="font-bold text-slate-600 text-sm">Tidak ada kategori ditemukan</p>
                      <p className="text-xs text-slate-400">
                        {searchTerm ? 'Coba ubah kata kunci pencarian Anda.' : 'Klik tombol "Tambah Kategori" untuk membuat opsi baru.'}
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCategories.map((item, idx) => {
                    const modulInfo = MODUL_LIST.find((m) => m.key === item.modul);
                    const isDeleting = confirmDeleteId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 text-center font-mono text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">{item.nama}</div>
                          {item.deskripsi && (
                            <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {item.deskripsi}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {modulInfo ? (
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${modulInfo.badgeBg}`}
                            >
                              <modulInfo.icon size={12} />
                              <span>{modulInfo.label}</span>
                            </span>
                          ) : (
                            <span className="text-slate-500 capitalize">{item.modul}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {item.modul === 'kas' ? (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.tipe === 'masuk'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : item.tipe === 'keluar'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {item.tipe === 'masuk'
                                ? 'Arus Masuk (+)'
                                : item.tipe === 'keluar'
                                ? 'Arus Keluar (-)'
                                : 'Fleksibel'}
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[11px]">Standar</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-600">
                          #{item.urutan}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              item.is_active !== false
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {item.is_active !== false ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isDeleting ? (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleDelete(item.id, item.nama)}
                                className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold hover:bg-rose-700 transition"
                              >
                                Ya, Hapus
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold hover:bg-slate-300 transition"
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                title="Edit Kategori"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(item.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Hapus Kategori"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Menampilkan {filteredCategories.length} dari {categories.length} total kategori
            </span>
            <span>Diurutkan berdasarkan urutan tampilan dropdown</span>
          </div>
        </div>

        {/* Modal Add / Edit */}
        {modalMode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-pop">
              <div className="flex items-center justify-between px-6 py-4 bg-emerald-950 text-white">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-800 text-emerald-200 rounded-lg">
                    {modalMode === 'add' ? <Plus size={16} /> : <Edit2 size={16} />}
                  </span>
                  <h3 className="font-bold text-sm">
                    {modalMode === 'add' ? 'Tambah Kategori Baru' : 'Edit Kategori Dropdown'}
                  </h3>
                </div>
                <button
                  onClick={() => setModalMode(null)}
                  className="p-1 text-slate-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
                {/* Modul Selector */}
                <CustomDropdown
                  label="Modul / Halaman Target"
                  required
                  value={formData.modul}
                  onChange={(val) => {
                    const newModul = val as ModulKategori;
                    setFormData({
                      ...formData,
                      modul: newModul,
                      tipe: newModul === 'kas' ? 'masuk' : '',
                    });
                  }}
                  options={dropdownModulOptions}
                />

                {/* Nama Kategori */}
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5">
                    Nama Kategori <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Infaq Kotak Jumat, Sedekah Subuh, dll."
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 font-bold text-xs text-slate-900"
                  />
                </div>

                {/* Tipe Khusus Kas */}
                {formData.modul === 'kas' && (
                  <div>
                    <CustomDropdown
                      label="Arah Arus Kas Default"
                      value={formData.tipe}
                      onChange={(val) => setFormData({ ...formData, tipe: val as any })}
                      options={dropdownArahKasOptions}
                    />
                    <p className="text-[10px] text-slate-400 mt-1.5 px-1">
                      Jika dipilih pemasukan/pengeluaran, formulir buku kas otomatis memilih tipe yang sesuai saat kategori ini dipilih.
                    </p>
                  </div>
                )}

                {/* Deskripsi */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Deskripsi / Catatan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Digunakan untuk alokasi pengeluaran kebersihan masjid"
                    value={formData.deskripsi}
                    onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                  />
                </div>

                {/* Urutan & Status Aktif */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Nomor Urutan
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.urutan}
                      onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 1 })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Status Dropdown
                    </label>
                    <label className="flex items-center gap-2 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                      />
                      <span className="font-bold text-slate-700">Tampil Aktif</span>
                    </label>
                  </div>
                </div>

                {/* Buttons */}
                <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalMode(null)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold shadow-md shadow-emerald-900/10 transition disabled:opacity-60 flex items-center gap-2"
                  >
                    {saving && <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />}
                    <span>{modalMode === 'add' ? 'Simpan Kategori' : 'Perbarui Kategori'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Reset Standar */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-4 animate-pop">
              <div className="flex items-center gap-3 text-amber-600">
                <span className="p-2 bg-amber-100 rounded-xl">
                  <AlertCircle size={22} />
                </span>
                <h3 className="font-black text-slate-800 text-base">
                  Pulihkan ke Kategori Standar?
                </h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tindakan ini akan mengembalikan daftar kategori seluruh modul ke data inisialisasi awal sistem (Infaq Jumat, Zakat Fitrah, Harta Wakaf, Saran, Agenda, dan Peran Jamaah). Kategori kustom yang baru ditambahkan mungkin akan digantikan.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md transition"
                >
                  Ya, Pulihkan Standar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

