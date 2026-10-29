'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  Package,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Printer,
  Download,
  Copy,
  Search,
  X,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Landmark,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import CustomDropdown, { DropdownOption } from '@/components/ui/custom-dropdown';
import { DataService } from '@/lib/data-service';
import { InventoryItem, KondisiBarang, WakafItem, JenisWakaf, KategoriItem } from '@/types';

const DEFAULT_WAKAF_CATEGORIES = [
  'Tanah',
  'Bangunan',
  'Uang',
  "Al-Qur'an",
  'Peralatan',
  'Lainnya',
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'inventaris' | 'wakaf'>('inventaris');
  const [dataAset, setDataAset] = useState<InventoryItem[]>([]);
  const [dataWakaf, setDataWakaf] = useState<WakafItem[]>([]);
  const [kategoriWakaf, setKategoriWakaf] = useState<KategoriItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState<'add' | 'edit' | 'detail' | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Wakaf modals
  const [showWakafModal, setShowWakafModal] = useState<'add' | 'edit' | null>(null);
  const [selectedWakaf, setSelectedWakaf] = useState<WakafItem | null>(null);
  const [wakafForm, setWakafForm] = useState<{
    tanggal: string; wakif: string; jenis: JenisWakaf; nilai: string; keterangan: string;
  }>({ tanggal: '', wakif: '', jenis: "Al-Qur'an", nilai: '0', keterangan: '' });

  // Filters & Selection
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKondisi, setFilterKondisi] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  const [currentDateStr, setCurrentDateStr] = useState('');

  // Form
  const [formData, setFormData] = useState({
    nama_barang: '',
    jumlah: '1',
    kondisi: 'baik' as KondisiBarang,
    lokasi: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [invItems, wakafItems, categories] = await Promise.all([
        DataService.getInventories(),
        DataService.getWakaf(),
        DataService.getKategori('wakaf'),
      ]);
      setDataAset(invItems);
      setDataWakaf(wakafItems);
      const activeCats = categories.filter((k) => k.is_active !== false);
      if (activeCats.length > 0) {
        setKategoriWakaf(activeCats);
      }
    } catch (error) {
      console.error('Failed to load inventory/wakaf:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setCurrentDateStr(new Date().toLocaleDateString('id-ID'));
    setWakafForm((prev) => ({ ...prev, tanggal: today }));
    loadData();

    const handleKategoriUpdate = () => {
      DataService.getKategori('wakaf').then((cats) => {
        const activeCats = cats.filter((k) => k.is_active !== false);
        if (activeCats.length > 0) setKategoriWakaf(activeCats);
      });
    };
    window.addEventListener('masjid_kategori_updated', handleKategoriUpdate);
    return () => window.removeEventListener('masjid_kategori_updated', handleKategoriUpdate);
  }, []);

  const wakafOptions = useMemo(() => {
    if (kategoriWakaf.length > 0) {
      return kategoriWakaf.map((k) => k.nama);
    }
    return DEFAULT_WAKAF_CATEGORIES;
  }, [kategoriWakaf]);

  const dropdownWakafOptions: DropdownOption[] = useMemo(() => {
    return wakafOptions.map((opt) => ({
      value: opt,
      label: opt,
    }));
  }, [wakafOptions]);

  const kondisiDropdownOptions: DropdownOption[] = [
    { value: 'baik', label: 'Baik' },
    { value: 'pemeliharaan', label: 'Pemeliharaan' },
    { value: 'dipinjamkan', label: 'Dipinjamkan' },
    { value: 'rusak', label: 'Rusak' },
  ];

  // Filtered
  const filteredAset = useMemo(() => {
    return dataAset.filter((item) => {
      const matchesSearch =
        item.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesKondisi = filterKondisi === 'all' || item.kondisi === filterKondisi;
      return matchesSearch && matchesKondisi;
    });
  }, [dataAset, searchTerm, filterKondisi]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredAset.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: number | string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  // Export to Excel
  const getTargetData = () =>
    selectedIds.length > 0 ? dataAset.filter((i) => selectedIds.includes(i.id)) : filteredAset;

  const exportToExcel = () => {
    const prepare = getTargetData().map((i) => ({
      'Nama Barang': i.nama_barang,
      Jumlah: i.jumlah,
      Kondisi: i.kondisi.toUpperCase(),
      Lokasi: i.lokasi,
      'Tanggal Input': i.created_at ? new Date(i.created_at).toLocaleDateString('id-ID') : '-',
    }));
    const ws = XLSX.utils.json_to_sheet(prepare);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventaris');
    XLSX.writeFile(wb, `Inventaris_Masjid_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const copyTable = () => {
    const head = 'Nama Barang\tJumlah\tKondisi\tLokasi\n';
    const rows = getTargetData()
      .map((i) => `${i.nama_barang}\t${i.jumlah}\t${i.kondisi}\t${i.lokasi}`)
      .join('\n');
    navigator.clipboard.writeText(head + rows);
    alert('Data tabel inventaris berhasil disalin ke clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  // CRUD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama_barang || !formData.lokasi) return;

    try {
      if (showModal === 'edit' && selectedItem) {
        await DataService.updateInventory(selectedItem.id, {
          nama_barang: formData.nama_barang,
          jumlah: parseInt(formData.jumlah, 10) || 1,
          kondisi: formData.kondisi,
          lokasi: formData.lokasi,
        });
      } else {
        await DataService.addInventory({
          nama_barang: formData.nama_barang,
          jumlah: parseInt(formData.jumlah, 10) || 1,
          kondisi: formData.kondisi,
          lokasi: formData.lokasi,
        });
      }
      setShowModal(null);
      setFormData({ nama_barang: '', jumlah: '1', kondisi: 'baik', lokasi: '' });
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan inventaris');
    }
  };

  const handleDelete = async (id: number | string) => {
    if (confirm('Hapus aset fisik ini dari daftar inventaris?')) {
      try {
        await DataService.deleteInventory(id);
        loadData();
      } catch (err: any) {
        alert(err?.message || 'Gagal menghapus inventaris');
      }
    }
  };

  const handleWakafAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wakafForm.wakif || !wakafForm.tanggal) return;
    try {
      await DataService.addWakaf({
        tanggal: wakafForm.tanggal,
        wakif: wakafForm.wakif,
        jenis: wakafForm.jenis,
        nilai: parseFloat(wakafForm.nilai) || 0,
        keterangan: wakafForm.keterangan,
      });
      setShowWakafModal(null);
      setWakafForm({ tanggal: new Date().toISOString().split('T')[0], wakif: '', jenis: "Al-Qur'an", nilai: '0', keterangan: '' });
      loadData();
    } catch (err: any) { alert(err?.message || 'Gagal menambahkan wakaf'); }
  };

  const handleWakafEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWakaf) return;
    try {
      await DataService.updateWakaf(selectedWakaf.id, selectedWakaf);
      setShowWakafModal(null);
      setSelectedWakaf(null);
      loadData();
    } catch (err: any) { alert(err?.message || 'Gagal memperbarui wakaf'); }
  };

  const handleWakafDelete = async (id: number | string, wakif: string) => {
    if (confirm(`Hapus catatan wakaf dari "${wakif}"?`)) {
      try {
        await DataService.deleteWakaf(id);
        loadData();
      } catch (err: any) { alert(err?.message || 'Gagal menghapus wakaf'); }
    }
  };

  const formatRupiah = (val: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  return (
    <AdminLayout>
      <div className="p-3.5 sm:p-6 md:p-10 max-w-7xl mx-auto space-y-4 sm:space-y-6 pb-24">
        {/* Print Title */}
        <div className="hidden print-only-title">
          DAFTAR INVENTARIS FASILITAS MASJID AL-MUKHLISIN
          <p className="text-xs font-normal mt-1">Dicetak pada: {currentDateStr || '-'}</p>
        </div>

        {/* Top Header */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-serif-elegant">Inventaris &amp; Wakaf</h2>
            <p className="text-[11px] sm:text-xs font-bold text-slate-400 mt-0.5 sm:mt-1 uppercase tracking-widest">
              Aset Fisik, Fasilitas Masjid &amp; Harta Wakaf Umat
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeTab === 'inventaris' ? (
              <>
                <button onClick={copyTable} className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-slate-400 transition-colors shadow-xs" title="Salin ke Clipboard">
                  <Copy size={14} /> <span className="hidden sm:inline">Salin</span>
                </button>
                <button onClick={exportToExcel} className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-600 hover:text-emerald-700 transition-colors shadow-xs" title="Ekspor ke Excel">
                  <Download size={14} /> <span className="hidden sm:inline">Excel</span>
                </button>
                <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-2xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-600 transition-colors shadow-xs" title="Cetak Laporan">
                  <Printer size={14} /> <span className="hidden sm:inline">Cetak</span>
                </button>
                <button onClick={() => { setFormData({ nama_barang: '', jumlah: '1', kondisi: 'baik', lokasi: '' }); setShowModal('add'); }} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-[#0d8a5e] text-white hover:bg-emerald-700 text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-emerald-900/10 active:scale-95">
                  <Plus size={16} /> <span>Tambah Aset</span>
                </button>
              </>
            ) : (
              <button onClick={() => { setShowWakafModal('add'); }} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-[#0d8a5e] text-white hover:bg-emerald-700 text-xs font-black tracking-wider uppercase transition-all shadow-md shadow-emerald-900/10 active:scale-95">
                <Plus size={16} /> <span>Catat Wakaf</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="no-print flex bg-white border border-slate-200 p-1 rounded-2xl w-full sm:w-fit shadow-xs">
          <button onClick={() => setActiveTab('inventaris')} className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'inventaris' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Package size={15} /> Inventaris Fisik
          </button>
          <button onClick={() => setActiveTab('wakaf')} className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'wakaf' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}>
            <Landmark size={15} /> Harta Wakaf
          </button>
        </div>

        {/* Filters (only for Inventaris tab) */}
        {activeTab === 'inventaris' && (
        <div className="no-print rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xs space-y-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Cari nama barang atau lokasi penempatan..."
              className="w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 pl-11 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all text-slate-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-4 top-3.5 text-slate-400" size={16} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400 mr-1">Kondisi:</span>
            {['all', 'baik', 'pemeliharaan', 'dipinjamkan', 'rusak'].map((k) => (
              <button
                key={k}
                onClick={() => setFilterKondisi(k)}
                className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                  filterKondisi === k
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {k === 'all' ? 'Semua Kondisi' : k}
              </button>
            ))}

            {(searchTerm || filterKondisi !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterKondisi('all');
                }}
                className="text-xs text-red-500 font-bold hover:underline ml-auto"
              >
                Reset Filter
              </button>
            )}
          </div>
        </div>
        )}


        {/* =================== INVENTARIS TAB =================== */}
        {activeTab === 'inventaris' && (
          <div id="printable-area" className="rounded-2xl sm:rounded-[2.5rem] border border-slate-100 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                  <tr>
                    <th className="no-print px-3.5 sm:px-6 py-3.5 sm:py-4">
                      <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" onChange={handleSelectAll} checked={selectedIds.length === filteredAset.length && filteredAset.length > 0} />
                    </th>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4">Nama Barang</th>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-center">Jumlah</th>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-center">Kondisi</th>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4">Lokasi</th>
                    <th className="no-print px-3.5 sm:px-6 py-3.5 sm:py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAset.length > 0 ? (
                    filteredAset.map((item) => {
                      const isSelected = selectedIds.includes(item.id);
                      return (
                        <tr key={item.id} className={`hover:bg-slate-50/70 transition-colors ${selectedIds.length > 0 && !isSelected ? 'no-print-row' : ''}`}>
                          <td className="no-print px-3.5 sm:px-6 py-3 sm:py-4"><input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500" checked={isSelected} onChange={() => toggleSelectRow(item.id)} /></td>
                          <td className="px-3.5 sm:px-6 py-3 sm:py-4 font-bold text-slate-800">{item.nama_barang}</td>
                          <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-center font-mono font-bold text-slate-700 whitespace-nowrap">{item.jumlah} Unit</td>
                          <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-md text-[9px] font-black uppercase ${item.kondisi === 'baik' ? 'bg-emerald-50 text-emerald-600' : item.kondisi === 'pemeliharaan' ? 'bg-amber-50 text-amber-600' : item.kondisi === 'dipinjamkan' ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-600'}`}>{item.kondisi}</span>
                          </td>
                          <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-slate-600">{item.lokasi}</td>
                          <td className="no-print px-3.5 sm:px-6 py-3 sm:py-4 text-center">
                            <div className="flex items-center justify-center gap-2 text-slate-400">
                              <button onClick={() => { setSelectedItem(item); setShowModal('detail'); }} className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Detail"><Eye size={16} /></button>
                              <button onClick={() => { setSelectedItem(item); setFormData({ nama_barang: item.nama_barang, jumlah: String(item.jumlah), kondisi: item.kondisi, lokasi: item.lokasi }); setShowModal('edit'); }} className="p-1.5 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan={6} className="py-12 text-center text-slate-400">Tidak ada data inventaris yang cocok dengan pencarian.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =================== WAKAF TAB =================== */}
        {activeTab === 'wakaf' && (
          <div className="rounded-2xl sm:rounded-[2.5rem] border border-slate-100 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-100 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                  <tr>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4 w-12 text-center">No</th>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4">Tanggal</th>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4">Nama Wakif / Donatur</th>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4">Jenis Wakaf</th>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-right">Estimasi Nilai</th>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4">Keterangan</th>
                    <th className="px-3.5 sm:px-6 py-3.5 sm:py-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400">Memuat data wakaf...</td></tr>
                  ) : dataWakaf.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-slate-400">Belum ada catatan wakaf. Klik &apos;Catat Wakaf&apos; untuk menambahkan.</td></tr>
                  ) : dataWakaf.map((w, idx) => (
                    <tr key={w.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-center text-slate-400">{idx + 1}</td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-slate-600 whitespace-nowrap">{new Date(w.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 font-bold text-slate-800">{w.wakif}</td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">{w.jenis}</span>
                      </td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-right font-bold text-emerald-800 whitespace-nowrap">{w.nilai > 0 ? formatRupiah(w.nilai) : '-'}</td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-slate-500 max-w-xs truncate">{w.keterangan || '-'}</td>
                      <td className="px-3.5 sm:px-6 py-3 sm:py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-slate-400 opacity-90 group-hover:opacity-100">
                          <button onClick={() => { setSelectedWakaf(w); setShowWakafModal('edit'); }} className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit"><Edit2 size={16} /></button>
                          <button onClick={() => handleWakafDelete(w.id, w.wakif)} className="p-1.5 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Wakaf Add Modal */}
        {showWakafModal === 'add' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 bg-emerald-950 text-white">
                <h3 className="font-bold text-sm flex items-center gap-2"><Landmark size={16} className="text-emerald-400" /> Catat Harta Wakaf</h3>
                <button onClick={() => setShowWakafModal(null)} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
              </div>
              <form onSubmit={handleWakafAdd} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5">
                      Tanggal <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={wakafForm.tanggal}
                      onChange={(e) => setWakafForm({ ...wakafForm, tanggal: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 text-slate-900"
                    />
                  </div>
                  <div>
                    <CustomDropdown
                      label="Jenis Wakaf"
                      required
                      value={wakafForm.jenis}
                      onChange={(val) => setWakafForm({ ...wakafForm, jenis: val as JenisWakaf })}
                      options={dropdownWakafOptions}
                    />
                  </div>
                </div>
                <div><label className="block font-bold text-slate-700 mb-1">Nama Wakif / Donatur *</label><input type="text" required placeholder="Contoh: Bpk. H. Dedi Kurniawan" value={wakafForm.wakif} onChange={(e) => setWakafForm({ ...wakafForm, wakif: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Estimasi Nilai (Rp)</label><input type="number" min="0" value={wakafForm.nilai} onChange={(e) => setWakafForm({ ...wakafForm, nilai: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Keterangan / Deskripsi</label><input type="text" placeholder="Contoh: 5 mushaf Al-Quran Standar Kemenag" value={wakafForm.keterangan} onChange={(e) => setWakafForm({ ...wakafForm, keterangan: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button type="button" onClick={() => setShowWakafModal(null)} className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold">Batal</button>
                  <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Wakaf Edit Modal */}
        {showWakafModal === 'edit' && selectedWakaf && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-3 sm:p-4">
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between px-6 py-4 bg-emerald-950 text-white">
                <h3 className="font-bold text-sm flex items-center gap-2"><Edit2 size={16} className="text-emerald-400" /> Edit Catatan Wakaf</h3>
                <button onClick={() => setShowWakafModal(null)} className="p-1 text-slate-400 hover:text-white"><X size={18} /></button>
              </div>
              <form onSubmit={handleWakafEdit} className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5">
                      Tanggal <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={selectedWakaf.tanggal}
                      onChange={(e) => setSelectedWakaf({ ...selectedWakaf, tanggal: e.target.value })}
                      className="w-full px-3 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 text-slate-900"
                    />
                  </div>
                  <div>
                    <CustomDropdown
                      label="Jenis Wakaf"
                      required
                      value={selectedWakaf.jenis}
                      onChange={(val) => setSelectedWakaf({ ...selectedWakaf, jenis: val as JenisWakaf })}
                      options={dropdownWakafOptions}
                    />
                  </div>
                </div>
                <div><label className="block font-bold text-slate-700 mb-1">Nama Wakif *</label><input type="text" required value={selectedWakaf.wakif} onChange={(e) => setSelectedWakaf({ ...selectedWakaf, wakif: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Estimasi Nilai (Rp)</label><input type="number" min="0" value={selectedWakaf.nilai || 0} onChange={(e) => setSelectedWakaf({ ...selectedWakaf, nilai: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block font-bold text-slate-700 mb-1">Keterangan</label><input type="text" value={selectedWakaf.keterangan || ''} onChange={(e) => setSelectedWakaf({ ...selectedWakaf, keterangan: e.target.value })} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button type="button" onClick={() => setShowWakafModal(null)} className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold">Batal</button>
                  <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL ADD / EDIT --- */}
        {(showModal === 'add' || showModal === 'edit') && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowModal(null)} />
            <div className="animate-pop relative z-10 w-full max-w-md rounded-2xl sm:rounded-[2.5rem] bg-white p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 font-serif-elegant">
                  {showModal === 'add' ? 'Tambah Aset Inventaris' : 'Edit Data Aset'}
                </h3>
                <button onClick={() => setShowModal(null)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                    Nama Barang
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Sound System Amplifier Yamaha"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900"
                    value={formData.nama_barang}
                    onChange={(e) => setFormData({ ...formData, nama_barang: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 items-end">
                  <div>
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1.5">
                      Jumlah Unit
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      className="w-full rounded-2xl border border-slate-200/90 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900 font-mono"
                      value={formData.jumlah}
                      onChange={(e) => setFormData({ ...formData, jumlah: e.target.value })}
                    />
                  </div>

                  <div>
                    <CustomDropdown
                      label="Kondisi"
                      value={formData.kondisi}
                      onChange={(val) => setFormData({ ...formData, kondisi: val as KondisiBarang })}
                      options={kondisiDropdownOptions}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase block mb-1">
                    Lokasi Penempatan
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Ruang Shalat Utama / Gudang Audio"
                    className="w-full rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 text-slate-900"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-emerald-600 py-4 text-xs font-black tracking-widest text-white hover:bg-emerald-700 transition-colors mt-4"
                >
                  {showModal === 'add' ? 'SIMPAN ASET' : 'PERBARUI ASET'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL DETAIL --- */}
        {showModal === 'detail' && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowModal(null)} />
            <div className="animate-pop relative z-10 w-full max-w-sm rounded-2xl sm:rounded-[2.5rem] bg-white p-5 sm:p-8 shadow-2xl text-center max-h-[90vh] overflow-y-auto">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Package size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{selectedItem.nama_barang}</h3>
              <p className="text-sm font-bold text-slate-400 mt-1">{selectedItem.lokasi}</p>

              <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600 space-y-2 text-left my-6">
                <div className="flex justify-between">
                  <span className="font-bold">Jumlah:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedItem.jumlah} Unit</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Kondisi:</span>
                  <span className="capitalize font-bold text-emerald-700">{selectedItem.kondisi}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold">Dicatat:</span>
                  <span>{new Date(selectedItem.created_at).toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              <button
                onClick={() => setShowModal(null)}
                className="w-full rounded-2xl bg-slate-900 py-3.5 text-xs font-black tracking-widest text-white hover:bg-slate-800 transition-colors"
              >
                TUTUP DETAIL
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
