'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { exportExcelFile } from '@/lib/excel-export';
import {
  UserCheck,
  Plus,
  Edit2,
  Trash2,
  Printer,
  Download,
  Search,
  X,
  Calendar,
  Mic,
  Award,
  RefreshCw,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import CustomDropdown, { DropdownOption } from '@/components/ui/custom-dropdown';
import { DataService } from '@/lib/data-service';
import { PetugasJumatItem, JamaahItem, IdentitasMasjid } from '@/types';

export default function PetugasJumatPage() {
  const [identitas, setIdentitas] = useState<IdentitasMasjid | null>(null);
  const [dataPetugas, setDataPetugas] = useState<PetugasJumatItem[]>([]);
  const [dataJamaah, setDataJamaah] = useState<JamaahItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editItem, setEditItem] = useState<PetugasJumatItem | null>(null);

  // Custom Input Toggles
  const [customKhatib, setCustomKhatib] = useState(false);
  const [customImam, setCustomImam] = useState(false);
  const [customMuadzin, setCustomMuadzin] = useState(false);

  const [editCustomKhatib, setEditCustomKhatib] = useState(false);
  const [editCustomImam, setEditCustomImam] = useState(false);
  const [editCustomMuadzin, setEditCustomMuadzin] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<(number | string)[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    tanggal: '',
    imam: '',
    khatib: '',
    muadzin: '',
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [items, jamaahList, identitasData] = await Promise.all([
        DataService.getPetugasJumat(),
        DataService.getJamaah(),
        DataService.getIdentitas(),
      ]);
      if (identitasData) setIdentitas(identitasData);
      setDataPetugas(items);
      setDataJamaah(jamaahList);
    } catch (error) {
      console.error('Failed to load petugas jumat:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Next Friday calculation helper
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() + ((5 + 7 - day) % 7);
    const nextFri = new Date(d.setDate(diff));
    setFormData((prev) => ({
      ...prev,
      tanggal: nextFri.toISOString().split('T')[0],
    }));
    loadData();
  }, []);

  // Filter kandidat berdasarkan peran jamaah
  const kandidatImam = useMemo(() => {
    return dataJamaah.filter((j) => j.peran === 'Imam');
  }, [dataJamaah]);

  const kandidatDkm = useMemo(() => {
    return dataJamaah.filter((j) => j.peran === 'Pengurus DKM');
  }, [dataJamaah]);

  const kandidatMuadzin = useMemo(() => {
    return dataJamaah.filter((j) => j.peran === 'Muadzin');
  }, [dataJamaah]);

  const kandidatRemaja = useMemo(() => {
    return dataJamaah.filter((j) => j.peran === 'Remaja Masjid');
  }, [dataJamaah]);

  const khatibOptions: DropdownOption[] = useMemo(() => {
    const list: DropdownOption[] = [];
    kandidatImam.forEach((j) => {
      list.push({
        value: j.nama,
        label: j.nama,
        group: 'Imam Masjid (Peran: Imam)',
      });
    });
    kandidatDkm.forEach((j) => {
      list.push({
        value: j.nama,
        label: j.nama,
        group: 'Pengurus DKM',
      });
    });
    return list;
  }, [kandidatImam, kandidatDkm]);

  const imamOptions: DropdownOption[] = useMemo(() => {
    const list: DropdownOption[] = [
      { value: '', label: '(Sama dengan Khatib)' },
    ];
    kandidatImam.forEach((j) => {
      list.push({
        value: j.nama,
        label: j.nama,
        group: 'Imam Masjid (Peran: Imam)',
      });
    });
    kandidatDkm.forEach((j) => {
      list.push({
        value: j.nama,
        label: j.nama,
        group: 'Pengurus DKM',
      });
    });
    return list;
  }, [kandidatImam, kandidatDkm]);

  const muadzinOptions: DropdownOption[] = useMemo(() => {
    const list: DropdownOption[] = [];
    kandidatMuadzin.forEach((j) => {
      list.push({
        value: j.nama,
        label: j.nama,
        group: 'Muadzin Masjid (Peran: Muadzin)',
      });
    });
    kandidatRemaja.forEach((j) => {
      list.push({
        value: j.nama,
        label: `${j.nama} (Remaja)`,
        group: 'Remaja Masjid (Kader Bilal)',
      });
    });
    return list;
  }, [kandidatMuadzin, kandidatRemaja]);

  const getEditKhatibOptions = useMemo(() => {
    if (!editItem?.khatib) return khatibOptions;
    const exists = khatibOptions.some((o) => o.value === editItem.khatib);
    if (!exists) {
      return [
        { value: editItem.khatib, label: `${editItem.khatib} (Tersimpan)`, group: 'Tersimpan' },
        ...khatibOptions,
      ];
    }
    return khatibOptions;
  }, [editItem?.khatib, khatibOptions]);

  const getEditImamOptions = useMemo(() => {
    if (!editItem?.imam) return imamOptions;
    const exists = imamOptions.some((o) => o.value === editItem.imam);
    if (!exists) {
      return [
        { value: editItem.imam, label: `${editItem.imam} (Tersimpan)`, group: 'Tersimpan' },
        ...imamOptions,
      ];
    }
    return imamOptions;
  }, [editItem?.imam, imamOptions]);

  const getEditMuadzinOptions = useMemo(() => {
    if (!editItem?.muadzin) return muadzinOptions;
    const exists = muadzinOptions.some((o) => o.value === editItem.muadzin);
    if (!exists) {
      return [
        { value: editItem.muadzin, label: `${editItem.muadzin} (Tersimpan)`, group: 'Tersimpan' },
        ...muadzinOptions,
      ];
    }
    return muadzinOptions;
  }, [editItem?.muadzin, muadzinOptions]);

  // Filtered
  const filteredPetugas = useMemo(() => {
    return dataPetugas.filter((item) => {
      const q = searchTerm.toLowerCase();
      return (
        item.imam.toLowerCase().includes(q) ||
        item.khatib.toLowerCase().includes(q) ||
        item.muadzin.toLowerCase().includes(q) ||
        item.tanggal.includes(q)
      );
    });
  }, [dataPetugas, searchTerm]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredPetugas.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: number | string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tanggal || !formData.khatib) return;
    try {
      await DataService.addPetugasJumat({
        tanggal: formData.tanggal,
        imam: formData.imam || formData.khatib,
        khatib: formData.khatib,
        muadzin: formData.muadzin || 'Petugas Marbot',
      });
      setShowAddModal(false);
      setFormData({
        tanggal: '',
        imam: '',
        khatib: '',
        muadzin: '',
      });
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Gagal menambahkan jadwal petugas');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem || !editItem.tanggal || !editItem.khatib) return;
    try {
      await DataService.updatePetugasJumat(editItem.id, editItem);
      setShowEditModal(false);
      setEditItem(null);
      loadData();
    } catch (err: any) {
      alert(err?.message || 'Gagal memperbarui jadwal petugas');
    }
  };

  const handleDelete = async (id: number | string, tgl: string) => {
    if (window.confirm(`Yakin ingin menghapus jadwal petugas Jumat tanggal ${tgl}?`)) {
      try {
        await DataService.deletePetugasJumat(id);
        loadData();
      } catch (err: any) {
        alert(err?.message || 'Gagal menghapus jadwal');
      }
    }
  };

  const getTargetData = () =>
    selectedIds.length > 0 ? dataPetugas.filter((i) => selectedIds.includes(i.id)) : filteredPetugas;

  const exportToExcel = () => {
    const target = getTargetData();
    if (target.length === 0) {
      alert('Tidak ada data jadwal petugas untuk diekspor');
      return;
    }
    const prepare = target.map((i, idx) => ({
      No: idx + 1,
      Tanggal: i.tanggal,
      Khatib: i.khatib,
      Imam: i.imam,
      Muadzin: i.muadzin,
    }));
    const ws = XLSX.utils.json_to_sheet(prepare);
    ws['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 22 }, { wch: 22 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Petugas Jumat');
    const safeNama = (identitas?.nama || 'Al-Mukhlisin').replace(/[^a-zA-Z0-9_-]/g, '_');
    exportExcelFile(wb, `Jadwal_Petugas_Jumat_${safeNama}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const printTable = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-24">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 sm:p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <UserCheck size={22} />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">Jadwal Petugas Shalat Jumat</h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
              Penyusunan dan mading jadwal Khatib, Imam, dan Muadzin Shalat Jumat Masjid {identitas?.nama || 'Al-Mukhlisin'}
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
              <Printer size={14} /> <span className="hidden xs:inline">Cetak Mading</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex-1 sm:flex-initial justify-center px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/20 transition"
            >
              <Plus size={16} /> <span>Jadwalkan Petugas</span>
            </button>
          </div>
        </div>

        {/* Quick Schedule Preview Cards for upcoming Fridays */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {dataPetugas.slice(0, 3).map((item, idx) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition shadow-sm ${
                idx === 0
                  ? 'bg-gradient-to-br from-[#0a1f18] to-emerald-950 text-white border-emerald-800/80 shadow-emerald-950/20'
                  : 'bg-white text-slate-800 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 border-slate-100">
                <span
                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    idx === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {idx === 0 ? 'Jumat Terdekat' : `Pekan ke-${idx + 1}`}
                </span>
                <span className={`text-xs font-bold ${idx === 0 ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {new Date(item.tanggal).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div>
                  <p className={`text-[10px] uppercase font-bold tracking-wider ${idx === 0 ? 'text-slate-400' : 'text-slate-400'}`}>
                    Khatib Jumat:
                  </p>
                  <p className="font-extrabold text-sm">{item.khatib}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${idx === 0 ? 'text-slate-400' : 'text-slate-400'}`}>
                      Imam:
                    </p>
                    <p className="font-bold">{item.imam}</p>
                  </div>
                  <div>
                    <p className={`text-[10px] uppercase font-bold tracking-wider ${idx === 0 ? 'text-slate-400' : 'text-slate-400'}`}>
                      Muadzin:
                    </p>
                    <p className="font-bold">{item.muadzin}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Cari nama khatib, imam, muadzin, atau tanggal..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Total {filteredPetugas.length} jadwal terdaftar
          </span>
        </div>

        {/* Table Content */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-3 sm:px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredPetugas.length && filteredPetugas.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                    />
                  </th>
                  <th className="py-3 px-3 sm:px-4 w-12 text-center">No</th>
                  <th className="py-3 px-3 sm:px-4">Tanggal Jumat</th>
                  <th className="py-3 px-3 sm:px-4">Khatib Shalat</th>
                  <th className="py-3 px-3 sm:px-4">Imam Shalat</th>
                  <th className="py-3 px-3 sm:px-4">Muadzin</th>
                  <th className="py-3 px-3 sm:px-4 text-center w-24">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Memuat jadwal petugas Jumat...
                    </td>
                  </tr>
                ) : filteredPetugas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      Belum ada jadwal petugas Jumat yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredPetugas.map((item, index) => {
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition group">
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={() => toggleSelectRow(item.id)}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center text-slate-400 font-medium">
                          {index + 1}
                        </td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-slate-800 whitespace-nowrap">
                          <span className="flex items-center gap-2">
                            <Calendar size={14} className="text-emerald-600" />
                            {new Date(item.tanggal).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </span>
                        </td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 font-bold text-emerald-800 whitespace-nowrap">
                          {item.khatib}
                        </td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-slate-700 font-medium whitespace-nowrap">
                          {item.imam}
                        </td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-slate-700 whitespace-nowrap">
                          {item.muadzin}
                        </td>
                        <td className="py-2.5 sm:py-3 px-3 sm:px-4 text-center">
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
                              onClick={() => handleDelete(item.id, item.tanggal)}
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
                  <UserCheck size={16} className="text-emerald-400" /> Jadwalkan Petugas Jumat
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
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Shalat Jumat *</label>
                  <input
                    type="date"
                    required
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Khatib Dropdown / Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Khatib Shalat Jumat <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomKhatib(!customKhatib);
                        if (!customKhatib) setFormData({ ...formData, khatib: '' });
                      }}
                      className="text-[10px] text-emerald-600 font-bold hover:underline"
                    >
                      {customKhatib ? '← Pilih dari Data Jamaah' : '+ Input Manual / Tamu'}
                    </button>
                  </div>

                  {!customKhatib ? (
                    <CustomDropdown
                      value={formData.khatib}
                      onChange={(val) => setFormData({ ...formData, khatib: val })}
                      options={khatibOptions}
                      placeholder="Pilih Khatib dari Data Jamaah..."
                      searchable={true}
                      required={true}
                    />
                  ) : (
                    <input
                      type="text"
                      required
                      placeholder="Ketik nama khatib / ustadz tamu luar..."
                      value={formData.khatib}
                      onChange={(e) => setFormData({ ...formData, khatib: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 font-bold text-xs text-slate-800"
                    />
                  )}
                </div>

                {/* Imam Dropdown / Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Imam Shalat (kosongkan jika sama dengan Khatib)
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomImam(!customImam);
                        if (!customImam) setFormData({ ...formData, imam: '' });
                      }}
                      className="text-[10px] text-emerald-600 font-bold hover:underline"
                    >
                      {customImam ? '← Pilih dari Data Jamaah' : '+ Input Manual'}
                    </button>
                  </div>

                  {!customImam ? (
                    <CustomDropdown
                      value={formData.imam}
                      onChange={(val) => setFormData({ ...formData, imam: val })}
                      options={imamOptions}
                      placeholder="(Sama dengan Khatib)"
                      searchable={true}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Ketik nama imam shalat..."
                      value={formData.imam}
                      onChange={(e) => setFormData({ ...formData, imam: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 font-bold text-xs text-slate-800"
                    />
                  )}
                </div>

                {/* Muadzin Dropdown / Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Muadzin / Bilal
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomMuadzin(!customMuadzin);
                        if (!customMuadzin) setFormData({ ...formData, muadzin: '' });
                      }}
                      className="text-[10px] text-emerald-600 font-bold hover:underline"
                    >
                      {customMuadzin ? '← Pilih dari Data Jamaah' : '+ Input Manual'}
                    </button>
                  </div>

                  {!customMuadzin ? (
                    <CustomDropdown
                      value={formData.muadzin}
                      onChange={(val) => setFormData({ ...formData, muadzin: val })}
                      options={muadzinOptions}
                      placeholder="Pilih Muadzin (Peran: Muadzin)..."
                      searchable={true}
                    />
                  ) : (
                    <input
                      type="text"
                      placeholder="Ketik nama muadzin / bilal..."
                      value={formData.muadzin}
                      onChange={(e) => setFormData({ ...formData, muadzin: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 font-bold text-xs text-slate-800"
                    />
                  )}
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
                    Simpan Jadwal
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
                  <Edit2 size={16} className="text-emerald-400" /> Perbarui Jadwal Petugas
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
                  <label className="block font-bold text-slate-700 mb-1">Tanggal Shalat Jumat *</label>
                  <input
                    type="date"
                    required
                    value={editItem.tanggal}
                    onChange={(e) => setEditItem({ ...editItem, tanggal: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Edit Khatib */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Khatib Shalat Jumat <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditCustomKhatib(!editCustomKhatib)}
                      className="text-[10px] text-emerald-600 font-bold hover:underline"
                    >
                      {editCustomKhatib ? '← Pilih dari Data Jamaah' : '+ Input Manual'}
                    </button>
                  </div>

                  {!editCustomKhatib ? (
                    <CustomDropdown
                      value={editItem.khatib}
                      onChange={(val) => setEditItem({ ...editItem, khatib: val })}
                      options={getEditKhatibOptions}
                      placeholder="Pilih Khatib dari Data Jamaah..."
                      searchable={true}
                      required={true}
                    />
                  ) : (
                    <input
                      type="text"
                      required
                      value={editItem.khatib}
                      onChange={(e) => setEditItem({ ...editItem, khatib: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 font-bold text-xs text-slate-800"
                    />
                  )}
                </div>

                {/* Edit Imam */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Imam Shalat
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditCustomImam(!editCustomImam)}
                      className="text-[10px] text-emerald-600 font-bold hover:underline"
                    >
                      {editCustomImam ? '← Pilih dari Data Jamaah' : '+ Input Manual'}
                    </button>
                  </div>

                  {!editCustomImam ? (
                    <CustomDropdown
                      value={editItem.imam}
                      onChange={(val) => setEditItem({ ...editItem, imam: val })}
                      options={getEditImamOptions}
                      placeholder="(Sama dengan Khatib)"
                      searchable={true}
                    />
                  ) : (
                    <input
                      type="text"
                      value={editItem.imam}
                      onChange={(e) => setEditItem({ ...editItem, imam: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 font-bold text-xs text-slate-800"
                    />
                  )}
                </div>

                {/* Edit Muadzin */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                      Muadzin / Bilal
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditCustomMuadzin(!editCustomMuadzin)}
                      className="text-[10px] text-emerald-600 font-bold hover:underline"
                    >
                      {editCustomMuadzin ? '← Pilih dari Data Jamaah' : '+ Input Manual'}
                    </button>
                  </div>

                  {!editCustomMuadzin ? (
                    <CustomDropdown
                      value={editItem.muadzin}
                      onChange={(val) => setEditItem({ ...editItem, muadzin: val })}
                      options={getEditMuadzinOptions}
                      placeholder="Pilih Muadzin (Peran: Muadzin)..."
                      searchable={true}
                    />
                  ) : (
                    <input
                      type="text"
                      value={editItem.muadzin}
                      onChange={(e) => setEditItem({ ...editItem, muadzin: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 font-bold text-xs text-slate-800"
                    />
                  )}
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
