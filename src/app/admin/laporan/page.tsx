'use client';

import React, { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { exportExcelFile } from '@/lib/excel-export';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Building,
  Wallet,
  HandHeart,
  Users,
  Package,
  Landmark,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Share2,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import { DataService } from '@/lib/data-service';
import {
  IdentitasMasjid,
  KasItem,
  JamaahItem,
  ZakatQurbanItem,
  InventoryItem,
  WakafItem,
  PetugasJumatItem,
} from '@/types';

export default function LaporanPage() {
  const [identitas, setIdentitas] = useState<IdentitasMasjid>({
    nama: 'Al-Mukhlisin',
    nomor_id_kemenag: '01.4.13.04.06.000158',
    alamat: 'Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar',
    ketua_dkm: 'Ustadz H. Ahmad Sobari',
    bendahara: 'H. Mulyadi, S.E.',
  });
  const [kas, setKas] = useState<KasItem[]>([]);
  const [jamaah, setJamaah] = useState<JamaahItem[]>([]);
  const [zakat, setZakat] = useState<ZakatQurbanItem[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [wakaf, setWakaf] = useState<WakafItem[]>([]);
  const [petugasJumat, setPetugasJumat] = useState<PetugasJumatItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter Periode
  const [periode, setPeriode] = useState<'all' | 'month' | 'year'>('all');
  const [currentDateStr, setCurrentDateStr] = useState('');

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [idData, kasData, jamData, zkData, invData, wkData, pjData] = await Promise.all([
        DataService.getIdentitas(),
        DataService.getKas(),
        DataService.getJamaah(),
        DataService.getZakatQurban(),
        DataService.getInventories(),
        DataService.getWakaf(),
        DataService.getPetugasJumat(),
      ]);
      setIdentitas(idData);
      setKas(kasData);
      setJamaah(jamData);
      setZakat(zkData);
      setInventory(invData);
      setWakaf(wkData);
      setPetugasJumat(pjData);
    } catch (e) {
      console.error('Failed to load report data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentDateStr(
      new Date().toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    );
    loadAllData();
  }, []);

  // Filtered Kas by Period
  const [nowDate, setNowDate] = useState<Date | null>(null);

  useEffect(() => {
    setNowDate(new Date());
  }, []);

  const filteredKas = useMemo(() => {
    if (!nowDate) return kas;
    const currYear = nowDate.getFullYear().toString();
    const currMonth = (nowDate.getMonth() + 1).toString().padStart(2, '0');
    const currYearMonth = `${currYear}-${currMonth}`;

    if (periode === 'month') {
      return kas.filter((k) => k.tanggal.startsWith(currYearMonth));
    }
    if (periode === 'year') {
      return kas.filter((k) => k.tanggal.startsWith(currYear));
    }
    return kas;
  }, [kas, periode, nowDate]);

  // Statistics
  const totalMasuk = useMemo(
    () => filteredKas.filter((k) => k.tipe === 'masuk').reduce((a, b) => a + Number(b.nominal), 0),
    [filteredKas]
  );
  const totalKeluar = useMemo(
    () => filteredKas.filter((k) => k.tipe === 'keluar').reduce((a, b) => a + Number(b.nominal), 0),
    [filteredKas]
  );
  const saldoKas = totalMasuk - totalKeluar;

  const totalFitrahUang = useMemo(
    () =>
      zakat
        .filter((z) => z.jenis === 'Zakat Fitrah (uang)')
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0),
    [zakat]
  );

  const totalFitrahBeras = useMemo(
    () =>
      zakat
        .filter((z) => z.jenis === 'Zakat Fitrah (beras)')
        .reduce((sum, item) => sum + Number(item.beras_kg || 0), 0),
    [zakat]
  );

  const totalZakatMal = useMemo(
    () =>
      zakat
        .filter((z) => z.jenis === 'Zakat Mal')
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0),
    [zakat]
  );

  const totalQurban = useMemo(
    () =>
      zakat
        .filter((z) => z.jenis.startsWith('Qurban'))
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0),
    [zakat]
  );

  const totalPenyaluran = useMemo(
    () =>
      zakat
        .filter((z) => z.jenis === 'Penyaluran')
        .reduce((sum, item) => sum + Number(item.nominal || 0), 0),
    [zakat]
  );

  const totalNilaiWakaf = useMemo(
    () => wakaf.reduce((sum, w) => sum + Number(w.nilai || 0), 0),
    [wakaf]
  );

  const totalUnitAset = useMemo(
    () => inventory.reduce((sum, i) => sum + Number(i.jumlah || 1), 0),
    [inventory]
  );

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Export Multi-Sheet Excel (7 Sheet)
  const exportMultiSheetExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Rekap Eksekutif
    const rekapData = [
      [`LAPORAN KEUANGAN DAN MANAJEMEN MASJID ${(identitas.nama || 'Al-Mukhlisin').toUpperCase()}`],
      ['Nomor ID Kemenag RI (SIMAS):', identitas.nomor_id_kemenag],
      ['Alamat:', identitas.alamat],
      ['Tanggal Laporan Dibuat:', currentDateStr],
      ['Periode:', periode === 'month' ? 'Bulan Ini' : periode === 'year' ? 'Tahun Ini' : 'Seluruh Periode'],
      [],
      ['1. RINGKASAN KAS KEUANGAN', 'NOMINAL (RP)'],
      ['Total Pemasukan Kas', totalMasuk],
      ['Total Pengeluaran Kas', totalKeluar],
      ['Saldo Akhir Kas', saldoKas],
      [],
      ['2. REKAPITULASI ZAKAT & QURBAN', 'NILAI / JUMLAH'],
      ['Zakat Fitrah (Uang Tunai)', totalFitrahUang],
      ['Zakat Fitrah (Beras Kg)', `${totalFitrahBeras} Kg`],
      ['Zakat Mal (Harta)', totalZakatMal],
      ['Tabungan Qurban', totalQurban],
      ['Penyaluran Mustahiq', totalPenyaluran],
      [],
      ['3. STATISTIK JAMAAH & INVENTARIS', 'JUMLAH'],
      ['Total Jamaah Terdaftar', jamaah.length],
      ['Pengurus DKM', jamaah.filter((j) => j.peran === 'Pengurus DKM').length],
      ['Total Unit Aset Inventaris', totalUnitAset],
      ['Total Nilai Harta Wakaf', totalNilaiWakaf],
      [],
      ['Mengetahui, Ketua DKM', 'Bendahara DKM'],
      [identitas.ketua_dkm, identitas.bendahara],
    ];
    const wsRekap = XLSX.utils.aoa_to_sheet(rekapData);
    XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekap_Eksekutif');

    // Sheet 2: Kas
    const kasData = filteredKas.map((k, idx) => ({
      No: idx + 1,
      Tanggal: k.tanggal,
      Keterangan: k.keterangan,
      Kategori: k.kategori || '-',
      Tipe: k.tipe.toUpperCase(),
      Nominal: k.nominal,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(kasData), 'Buku_Kas');

    // Sheet 3: Zakat & Qurban
    const zakatData = zakat.map((z, idx) => ({
      No: idx + 1,
      Tanggal: z.tanggal,
      Nama: z.nama,
      Jenis: z.jenis,
      'Jumlah Jiwa': z.jumlah_jiwa,
      'Beras (Kg)': z.beras_kg,
      Nominal: z.nominal,
      Keterangan: z.keterangan || '-',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(zakatData), 'Zakat_Qurban');

    // Sheet 4: Jamaah
    const jamaahData = jamaah.map((j, idx) => ({
      No: idx + 1,
      Nama: j.nama,
      'No HP': j.no_hp || '-',
      Alamat: j.alamat || '-',
      Peran: j.peran,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(jamaahData), 'Data_Jamaah');

    // Sheet 5: Inventaris
    const invData = inventory.map((i, idx) => ({
      No: idx + 1,
      'Nama Barang': i.nama_barang,
      Jumlah: i.jumlah,
      Kondisi: i.kondisi.toUpperCase(),
      Lokasi: i.lokasi,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(invData), 'Inventaris');

    // Sheet 6: Wakaf
    const wakafData = wakaf.map((w, idx) => ({
      No: idx + 1,
      Tanggal: w.tanggal,
      'Nama Wakif': w.wakif,
      'Jenis Wakaf': w.jenis,
      'Estimasi Nilai': w.nilai,
      Keterangan: w.keterangan || '-',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(wakafData), 'Wakaf');

    // Sheet 7: Petugas Jumat
    const pjData = petugasJumat.map((p, idx) => ({
      No: idx + 1,
      Tanggal: p.tanggal,
      Khatib: p.khatib,
      Imam: p.imam,
      Muadzin: p.muadzin,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pjData), 'Petugas_Jumat');

    const safeNama = (identitas.nama || 'Al-Mukhlisin').replace(/[^a-zA-Z0-9_-]/g, '_');
    exportExcelFile(
      wb,
      `Laporan_Lengkap_${safeNama}_${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AdminLayout>
      <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-24">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="print:hidden flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 sm:p-2 rounded-xl bg-emerald-100 text-emerald-800">
                <FileText size={20} />
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-800">Laporan Resmi Berkop SIMAS</h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">
              Rekapitulasi lengkap 6 bagian dengan legalitas Nomor SIMAS Kemenag RI dan tanda tangan DKM
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Periode filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setPeriode('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  periode === 'all' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setPeriode('year')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  periode === 'year' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tahun Ini
              </button>
              <button
                onClick={() => setPeriode('month')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  periode === 'month' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulan Ini
              </button>
            </div>

            <button
              onClick={loadAllData}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition"
              title="Segarkan Data"
            >
              <RefreshCw size={16} />
            </button>

            <button
              onClick={exportMultiSheetExcel}
              className="px-3.5 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2 transition"
            >
              <Download size={15} /> Ekspor 7-Sheet Excel
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-900/20 transition"
            >
              <Printer size={16} /> Cetak / Unduh PDF
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRINTABLE OFFICIAL REPORT CANVAS */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-lg p-4 sm:p-8 md:p-12 text-slate-900 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none overflow-x-auto">
          {/* KOP SURAT RESMI BERKOP SIMAS KEMENAG RI */}
          <div className="border-b-4 border-double border-emerald-950 pb-5 mb-8 text-center relative">
            <div className="flex items-center justify-center gap-4 mb-2">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#0a1f18] to-emerald-800 text-white flex items-center justify-center font-serif text-3xl font-bold shadow-md shrink-0">
                M
              </div>
              <div className="text-left">
                <p className="text-[11px] font-black tracking-widest text-emerald-800 uppercase">
                  DEWAN KEMAKMURAN MASJID (DKM)
                </p>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 font-serif uppercase tracking-tight">
                  {identitas.nama}
                </h2>
                <div className="flex items-center gap-2 flex-wrap text-xs text-slate-600 mt-0.5">
                  <span className="font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    NOMOR ID SIMAS KEMENAG RI: {identitas.nomor_id_kemenag}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {identitas.alamat}
            </p>
          </div>

          {/* REPORT TITLE & METADATA */}
          <div className="text-center mb-8">
            <h3 className="text-base md:text-lg font-black uppercase tracking-wider text-slate-900">
              LAPORAN PERTANGGUNGJAWABAN & REKAPITULASI DKM
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Periode:{' '}
              <span className="font-bold text-slate-800">
                {periode === 'month'
                  ? 'Bulan Ini'
                  : periode === 'year'
                  ? 'Tahun Berjalan'
                  : 'Seluruh Periode Operasional'}
              </span>{' '}
              | Dicetak pada: <span className="font-bold text-slate-800">{currentDateStr}</span>
            </p>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 1: RINGKASAN EKSEKUTIF KAS KEUANGAN */}
          {/* ========================================================================= */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200">
              <span className="h-5 w-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                1
              </span>
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Ringkasan Eksekutif Buku Kas Keuangan
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mb-4">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                  Total Pemasukan Kas
                </p>
                <p className="text-base sm:text-lg font-black text-emerald-700 mt-1">{formatRupiah(totalMasuk)}</p>
              </div>
              <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-50/80 border border-rose-200">
                <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
                  Total Pengeluaran Kas
                </p>
                <p className="text-base sm:text-lg font-black text-rose-700 mt-1">{formatRupiah(totalKeluar)}</p>
              </div>
              <div className="p-3 sm:p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200">
                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                  Saldo Kas Berjalan
                </p>
                <p className="text-base sm:text-lg font-black text-blue-800 mt-1">{formatRupiah(saldoKas)}</p>
              </div>
            </div>

            {/* Recent 5 transactions */}
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Tanggal</th>
                    <th className="py-2 px-3">Keterangan Transaksi</th>
                    <th className="py-2 px-3">Kategori</th>
                    <th className="py-2 px-3 text-right">Pemasukan</th>
                    <th className="py-2 px-3 text-right">Pengeluaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredKas.slice(0, 5).map((k) => (
                    <tr key={k.id} className="text-slate-800">
                      <td className="py-2 px-3 whitespace-nowrap text-slate-500">{k.tanggal}</td>
                      <td className="py-2 px-3 font-medium">{k.keterangan}</td>
                      <td className="py-2 px-3 text-slate-500">{k.kategori || '-'}</td>
                      <td className="py-2 px-3 text-right font-bold text-emerald-700">
                        {k.tipe === 'masuk' ? formatRupiah(k.nominal) : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-rose-600">
                        {k.tipe === 'keluar' ? formatRupiah(k.nominal) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 2: ZAKAT, INFAQ & QURBAN */}
          {/* ========================================================================= */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200">
              <span className="h-5 w-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                2
              </span>
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                Rekapitulasi Zakat, Infaq & Qurban
              </h4>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Fitrah Uang & Beras</p>
                <p className="text-sm font-extrabold text-slate-900 mt-1">
                  {formatRupiah(totalFitrahUang)}
                </p>
                <p className="text-[10px] text-amber-700 font-bold">{totalFitrahBeras} Kg Beras</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Zakat Mal</p>
                <p className="text-sm font-extrabold text-slate-900 mt-1">
                  {formatRupiah(totalZakatMal)}
                </p>
                <p className="text-[10px] text-slate-400">Harta muzakki</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Dana Qurban</p>
                <p className="text-sm font-extrabold text-slate-900 mt-1">{formatRupiah(totalQurban)}</p>
                <p className="text-[10px] text-slate-400">Sapi & Kambing</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Penyaluran Mustahiq</p>
                <p className="text-sm font-extrabold text-rose-700 mt-1">
                  {formatRupiah(totalPenyaluran)}
                </p>
                <p className="text-[10px] text-slate-400">Tersalurkan resmi</p>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION 3 & 4: JAMAAH & INVENTARIS/WAKAF (2 Columns) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Bagian 3: Jamaah */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200">
                <span className="h-5 w-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                  Data Jamaah & Tokoh
                </h4>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Total Jamaah Terdaftar:</span>
                  <span className="font-bold text-slate-900">{jamaah.length} orang</span>
                </li>
                <li className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Pengurus DKM:</span>
                  <span className="font-bold text-slate-900">
                    {jamaah.filter((j) => j.peran === 'Pengurus DKM').length} orang
                  </span>
                </li>
                <li className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Imam & Muadzin Rawatib:</span>
                  <span className="font-bold text-slate-900">
                    {jamaah.filter((j) => j.peran === 'Imam' || j.peran === 'Muadzin').length} orang
                  </span>
                </li>
              </ul>
            </div>

            {/* Bagian 4 & 5: Inventaris & Wakaf */}
            <div>
              <div className="flex items-center gap-2 mb-3 pb-1 border-b border-slate-200">
                <span className="h-5 w-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                  Inventaris & Harta Wakaf
                </h4>
              </div>
              <ul className="space-y-2 text-xs">
                <li className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Total Unit Barang Aset:</span>
                  <span className="font-bold text-slate-900">{totalUnitAset} unit</span>
                </li>
                <li className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Kondisi Baik:</span>
                  <span className="font-bold text-emerald-700">
                    {inventory.filter((i) => i.kondisi === 'baik').length} item
                  </span>
                </li>
                <li className="flex justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-600">Estimasi Nilai Wakaf Umat:</span>
                  <span className="font-bold text-slate-900">{formatRupiah(totalNilaiWakaf)}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TANDA TANGAN RESMI PENGURUS DKM */}
          {/* ========================================================================= */}
          <div className="mt-12 pt-6 border-t-2 border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-0 text-xs text-slate-700">
              <div className="text-center w-full sm:w-52">
                <p className="font-semibold text-slate-500 mb-1">Mengetahui,</p>
                <p className="font-black text-slate-800 uppercase tracking-wider">Ketua DKM</p>
                <div className="h-16 sm:h-20 flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 italic">[ Tanda Tangan & Cap ]</span>
                </div>
                <p className="font-bold text-slate-900 underline decoration-slate-400">
                  {identitas.ketua_dkm}
                </p>
                <p className="text-[10px] text-slate-400">DKM Masjid {identitas.nama}</p>
              </div>

              <div className="text-center w-full sm:w-52">
                <p className="font-semibold text-slate-500 mb-1">
                  Lagadar, {currentDateStr}
                </p>
                <p className="font-black text-slate-800 uppercase tracking-wider">Bendahara DKM</p>
                <div className="h-16 sm:h-20 flex items-center justify-center">
                  <span className="text-[10px] text-slate-300 italic">[ Tanda Tangan & Cap ]</span>
                </div>
                <p className="font-bold text-slate-900 underline decoration-slate-400">
                  {identitas.bendahara}
                </p>
                <p className="text-[10px] text-slate-400">DKM Masjid {identitas.nama}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
