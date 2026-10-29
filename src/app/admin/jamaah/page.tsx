'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Download,
  Search,
  X,
  Phone,
  MessageCircle,
  MapPin,
  ShieldCheck,
  Heart,
  Award,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import CustomDropdown, { DropdownOption } from '@/components/ui/custom-dropdown';
import { DataService } from '@/lib/data-service';
import { JamaahItem, PeranJamaah, KategoriItem } from '@/types';

const DEFAULT_JAMAAH_PERAN = [
  'Pengurus DKM',
  'Imam',
  'Muadzin',
  'Remaja Masjid',
  'Donatur',
  'Jamaah',
];

export default function JamaahPage() {
  const [dataJamaah, setDataJamaah] = useState<JamaahItem[]>([]);
  const [kategoriJamaah, setKategoriJamaah] = useState<KategoriItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<JamaahItem | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPeran, setFilterPeran] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  // Form State
  const [formData, setFormData] = useState<{
    nama: string;
    no_hp: string;
    alamat: string;
    peran: PeranJamaah;
  }>({
    nama: '',
    no_hp: '',
    alamat: '',
    peran: 'Jamaah',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [items, categories] = await Promise.all([
        DataService.getJamaah(),
        DataService.getKategori('jamaah'),
      ]);
      setDataJamaah(items);
      const activeCats = categories.filter((k) => k.is_active !== false);
      if (activeCats.length > 0) {
        setKategoriJamaah(activeCats);
      }
    } catch (error) {
      console.error('Failed to load jamaah:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleKategoriUpdate = () => {
      DataService.getKategori('jamaah').then((cats) => {
        const activeCats = cats.filter((k) => k.is_active !== false);
        if (activeCats.length > 0) setKategoriJamaah(activeCats);
      });
    };
    window.addEventListener('masjid_kategori_updated', handleKategoriUpdate);
    return () => window.removeEventListener('masjid_kategori_updated', handleKategoriUpdate);
  }, []);

  const peranOptions = useMemo(() => {
    if (kategoriJamaah.length > 0) {
      return kategoriJamaah.map((k) => k.nama);
    }
    return DEFAULT_JAMAAH_PERAN;
  }, [kategoriJamaah]);

  const dropdownPeranOptions: DropdownOption[] = useMemo(() => {
    return peranOptions.map((opt) => ({
      value: opt,
      label: opt,
    }));
  }, [peranOptions]);

  const dropdownFilterPeranOptions: DropdownOption[] = useMemo(() => {
    return [
      { value: 'all', label: 'Semua Peran / Status' },
      ...dropdownPeranOptions,
    ];
  }, [dropdownPeranOptions]);

  // Filtered
  const filteredJamaah = useMemo(() => {
    return dataJamaah.filter((item) => {
      const matchesSearch =
        item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.no_hp && item.no_hp.includes(searchTerm)) ||
        (item.alamat && item.alamat.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPeran = filterPeran === 'all' || item.peran === filterPeran;
      return matchesSearch && matchesPeran;
    });
  }, [dataJamaah, searchTerm, filterPeran]);

  // Statistics
  const totalJamaah = dataJamaah.length;
  const totalDKM = dataJamaah.filter((j) => j.peran === 'Pengurus DKM').length;
  const totalPetugas = dataJamaah.filter((j) => j.peran === 'Imam' || j.peran === 'Muadzin').length;
  const totalDonatur = dataJamaah.filter((j) => j.peran === 'Donatur').length;

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredJamaah.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: number | string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama) return;
    try {
      await DataService.addJamaah(formData);
      setShowAddModal(false);
      setFormData({
        nama: '',
        no_hp: '',
        alamat: '',
        peran: 'Jamaah',
      });
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Gagal menambahkan jamaah');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || !editItem.nama) return;
    try {
      await DataService.updateJamaah(editItem.id, editItem);
      setShowEditModal(false);
      setEditItem(null);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Gagal memperbarui jamaah');
    }
  };

  const handleDelete = async (id: number | string, nama: string) => {
    if (window.confirm(`Yakin ingin menghapus data jamaah "${nama}"?`)) {
      try {
        await DataService.deleteJamaah(id);
        loadData();
      } catch (err: any) {
        alert(err?.message || 'Gagal menghapus jamaah');
      }
    }
  };

  const getTargetData = () =>
    selectedIds.length > 0 ? dataJamaah.filter((i) => selectedIds.includes(i.id)) : filteredJamaah;

  const exportToExcel = () => {
    const prepare = getTargetData().map((i, idx) => ({
      No: idx + 1,
      'Nama Lengkap': i.nama,
      'No. WhatsApp/HP': i.no_hp || '-',
      Alamat: i.alamat || '-',
      Peran: i.peran,
      'Terdaftar Sejak': i.created_at ? new Date(i.created_at).toLocaleDateString('id-ID') : '-',
    }));
    const ws = XLSX.utils.json_to_sheet(prepare);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Jamaah');
    XLSX.writeFile(wb, `Data_Jamaah_Al_Mukhlisin_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const printTable = () => {
    window.print();
  };

  const formatWaUrl = (noHp?: string) => {
    if (!noHp) return null;
    let clean = noHp.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) {
      clean = '62' + clean.slice(1);
    }
    return `https://wa.me/${clean}`;
  };

  const getPeranBadge = (peran: PeranJamaah) => {
    switch (peran) {
      case 'Pengurus DKM':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold';
      case 'Imam':
        return 'bg-amber-100 text-amber-800 border-amber-300 font-bold';
      case 'Muadzin':
        return 'bg-blue-100 text-blue-800 border-blue-300 font-bold';
      case 'Remaja Masjid':
        return 'bg-purple-100 text-purple-800 border-purple-300 font-bold';
      case 'Donatur':
        return 'bg-rose-100 text-rose-800 border-rose-300 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <AdminLayout>
      <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 sm:p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <Users size={22} />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">Data Jamaah & Tokoh</h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
              Pencatatan warga, kontak silaturahmi WhatsApp, dan kepengurusan Masjid Al-Mukhlisin
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={loadData}
              className="p-2 sm:p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
              title="Segarkan Data"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={exportToExcel}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Download size={14} /> <span className="hidden xs:inline">Ekspor Excel</span>
            </button>
            <button
              onClick={printTable}
              className="px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer size={14} /> <span className="hidden xs:inline">Cetak</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-initial justify-center px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/20 transition"
            >
              <Plus size={16} /> <span>Tambah Jamaah</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Jamaah</p>
              <p className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5 sm:mt-1">{totalJamaah}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Warga terdaftar</p>
            </div>
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Users size={18} className="sm:size-[22px]" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pengurus DKM</p>
              <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-0.5 sm:mt-1">{totalDKM}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Struktur dewan</p>
            </div>
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck size={18} className="sm:size-[22px]" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Imam & Muadzin</p>
              <p className="text-xl sm:text-2xl font-black text-amber-700 mt-0.5 sm:mt-1">{totalPetugas}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Petugas rawatib</p>
            </div>
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award size={18} className="sm:size-[22px]" />
            </div>
          </div>
          <div className="bg-white rounded-2xl p-3 sm:p-4 border border-slate-100 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider">Donatur Tetap</p>
              <p className="text-xl sm:text-2xl font-black text-rose-700 mt-0.5 sm:mt-1">{totalDonatur}</p>
              <p className="text-[9px] sm:text-[10px] text-slate-400 mt-0.5">Dermawan & muhsinin</p>
            </div>
            <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <Heart size={18} className="sm:size-[22px]" />
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama, no hp, atau alamat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-56">
            <CustomDropdown
              value={filterPeran}
              onChange={(val) => setFilterPeran(val)}
              options={dropdownFilterPeranOptions}
              className="w-full"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredJamaah.length && filteredJamaah.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="py-3.5 px-4 w-12 text-center">No</th>
                  <th className="py-3.5 px-4">Nama Jamaah</th>
                  <th className="py-3.5 px-4">No. HP / WhatsApp</th>
                  <th className="py-3.5 px-4">Alamat Rumah</th>
                  <th className="py-3.5 px-4">Peran / Status</th>
                  <th className="py-3.5 px-4 text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Memuat data jamaah...
                    </td>
                  </tr>
                ) : filteredJamaah.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Tidak ada data jamaah yang cocok dengan pencarian.
                    </td>
                  </tr>
                ) : (
                  filteredJamaah.map((item, index) => {
                    const waLink = formatWaUrl(item.no_hp);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition group">
                        <td className="py-3 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelectRow(item.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="py-3 px-4 text-center text-slate-400 font-medium">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-800">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                              {item.nama.charAt(0)}
                            </div>
                            <span>{item.nama}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.no_hp ? (
                            <div className="flex items-center gap-2">
                              <span>{item.no_hp}</span>
                              {waLink && (
                                <a
                                  href={waLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition"
                                  title="Kirim Pesan WhatsApp"
                                >
                                  <MessageCircle size={14} />
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 italic">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.alamat ? (
                            <span className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-slate-400 shrink-0" />
                              {item.alamat}
                            </span>
                          ) : (
                            <span className="text-slate-300 italic">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg text-[10px] border ${getPeranBadge(
                              item.peran
                            )}`}
                          >
                            {item.peran}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100">
                            <button
                              onClick={() => {
                                setEditItem(item);
                                setShowEditModal(true);
                              }}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-200 bg-white transition"
                              title="Edit"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id, item.nama)}
                              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 bg-white transition"
                              title="Hapus"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-950 text-white">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Users size={16} className="text-emerald-400" /> Tambah Jamaah Baru
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: H. Ahmad Sobari"
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    placeholder="Contoh: 08123456789"
                    value={formData.no_hp}
                    onChange={(e) => setFormData({ ...formData, no_hp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <CustomDropdown
                    label="Peran / Status"
                    required
                    value={formData.peran}
                    onChange={(val) => setFormData({ ...formData, peran: val as PeranJamaah })}
                    options={dropdownPeranOptions}
                    placeholder="Pilih peran jamaah..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Rumah / RT-RW</label>
                  <textarea
                    rows={2}
                    placeholder="Contoh: Kp. Jalan Cagak RT 05/04 Desa Lagadar"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-900/20 transition"
                  >
                    Simpan Data
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-950 text-white">
                <h3 className="font-bold text-sm flex items-center gap-2">
                  <Edit2 size={16} className="text-emerald-400" /> Perbarui Data Jamaah
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 text-slate-400 hover:text-white transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={editItem.nama}
                    onChange={(e) => setEditItem({ ...editItem, nama: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">No. WhatsApp / HP</label>
                  <input
                    type="text"
                    value={editItem.no_hp || ''}
                    onChange={(e) => setEditItem({ ...editItem, no_hp: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <CustomDropdown
                    label="Peran / Status"
                    required
                    value={editItem.peran}
                    onChange={(val) => setEditItem({ ...editItem, peran: val as PeranJamaah })}
                    options={
                      !peranOptions.includes(editItem.peran) && editItem.peran
                        ? [...dropdownPeranOptions, { value: editItem.peran, label: editItem.peran }]
                        : dropdownPeranOptions
                    }
                    placeholder="Pilih peran jamaah..."
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alamat Rumah / RT-RW</label>
                  <textarea
                    rows={2}
                    value={editItem.alamat || ''}
                    onChange={(e) => setEditItem({ ...editItem, alamat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-900/20 transition"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
