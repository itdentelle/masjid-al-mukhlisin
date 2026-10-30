'use client';

import React, { useEffect, useState } from 'react';
import {
  Settings,
  Save,
  Download,
  Copy,
  CheckCircle2,
  Building,
  Database,
  RefreshCw,
  KeyRound,
  Lock,
  Trash2,
  Upload,
  RotateCcw,
  Image as ImageIcon,
  QrCode,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import AdminLayout from '@/components/layout/admin-layout';
import { DataService } from '@/lib/data-service';
import { IdentitasMasjid } from '@/types';
import { CURRENT_APP_VERSION } from '@/lib/app-version';

export default function PengaturanPage() {
  const [identitas, setIdentitas] = useState<IdentitasMasjid>({
    nama: 'Al-Mukhlisin',
    nomor_id_kemenag: '01.4.13.04.06.000158',
    alamat: 'Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar',
    ketua_dkm: 'Ustadz H. Ahmad Sobari',
    bendahara: 'H. Mulyadi, S.E.',
    logo_url: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);

  // Logo upload state
  const [logoUploading, setLogoUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // QRIS upload state
  const [qrisUploading, setQrisUploading] = useState(false);
  const qrisFileInputRef = React.useRef<HTMLInputElement>(null);

  // Backup states
  const [backupJson, setBackupJson] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // Password states
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [pwSavedOk, setPwSavedOk] = useState(false);
  const [pwError, setPwError] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await DataService.getIdentitas();
      setIdentitas(data);
    } catch (e) {
      console.error('Failed to load identitas:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, WebP, atau SVG).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file foto terlalu besar (maksimal 10MB).');
      return;
    }

    setLogoUploading(true);
    try {
      const uploadedUrl = await DataService.uploadLogoImage(file);
      setIdentitas((prev) => ({ ...prev, logo_url: uploadedUrl }));
    } catch (err: any) {
      console.error('Gagal memproses foto:', err);
      alert('Gagal memproses gambar foto logo. Silakan coba file lain.');
    } finally {
      setLogoUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleResetLogo = () => {
    setIdentitas((prev) => ({ ...prev, logo_url: null }));
  };

  const handleQrisFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Mohon pilih file gambar (JPG, PNG, atau WebP).');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file foto QRIS terlalu besar (maksimal 10MB).');
      return;
    }

    setQrisUploading(true);
    try {
      const uploadedUrl = await DataService.uploadQrisImage(file);
      setIdentitas((prev) => ({ ...prev, qris_url: uploadedUrl }));
    } catch (err: any) {
      console.error('Gagal memproses gambar QRIS:', err);
      alert('Gagal memproses gambar barcode QRIS. Silakan coba file lain.');
    } finally {
      setQrisUploading(false);
      if (qrisFileInputRef.current) qrisFileInputRef.current.value = '';
    }
  };

  const handleResetQris = () => {
    setIdentitas((prev) => ({ ...prev, qris_url: null }));
  };

  useEffect(() => {
    loadData();
    if (typeof window !== 'undefined') {
      const stored =
        localStorage.getItem('masjid_admin_password') ||
        process.env.NEXT_PUBLIC_ADMIN_PASSWORD ||
        'Almukhlisin0504$';
      setCurrentPw(stored);
    }
  }, []);

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPw.length < 6) {
      setPwError('Kata sandi baru minimal 6 karakter');
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('masjid_admin_password', newPw);
      setCurrentPw(newPw);
      setNewPw('');
      setPwError('');
      setPwSavedOk(true);
      setTimeout(() => setPwSavedOk(false), 3000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await DataService.updateIdentitas(identitas);
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
    } catch (err: any) {
      alert(err?.message || 'Gagal menyimpan identitas masjid');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateBackup = async () => {
    setBackupLoading(true);
    try {
      const data = await DataService.exportAllData();
      const jsonStr = JSON.stringify(data, null, 2);
      setBackupJson(jsonStr);
    } catch (e) {
      alert('Gagal membuat cadangan data');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleCopyBackup = () => {
    if (!backupJson) return;
    navigator.clipboard.writeText(backupJson).then(() => {
      setCopiedJson(true);
      setTimeout(() => setCopiedJson(false), 2000);
    });
  };

  const handleDownloadBackup = () => {
    if (!backupJson) return;
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Backup_Masjid_Al_Mukhlisin_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = async () => {
    if (
      confirm(
        'Apakah Anda yakin ingin mengosongkan seluruh data transaksi (Kas, Jamaah, Inventaris, Zakat, dll)? Data akan bersih dimulai dari nol (0).'
      )
    ) {
      await DataService.clearAllData();
      alert('Seluruh data transaksi lokal telah berhasil dikosongkan.');
      window.location.reload();
    }
  };

  return (
    <AdminLayout>
      <div className="p-3.5 sm:p-6 md:p-8 space-y-4 sm:space-y-6 max-w-4xl mx-auto pb-24">
        {/* Header */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <span className="p-1.5 sm:p-2 rounded-xl bg-emerald-100 text-emerald-800">
            <Settings size={22} />
          </span>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800">Pengaturan & Cadangan Data</h1>
            <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
              Kelola identitas resmi SIMAS Kemenag dan lakukan backup/restore seluruh data masjid
            </p>
          </div>
        </div>

        {/* ============================= */}
        {/* SECTION 1: IDENTITAS MASJID */}
        {/* ============================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-2 mb-6">
            <Building size={18} className="text-emerald-700" />
            <h2 className="font-black text-slate-800 text-base">Identitas Resmi Masjid</h2>
            <span className="text-[10px] font-bold text-slate-400 border border-slate-200 rounded-full px-2 py-0.5 uppercase tracking-wide">
              SIMAS Kemenag RI
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-slate-400 text-center py-6">Memuat data identitas...</p>
          ) : (
            <form onSubmit={handleSave} className="space-y-6 text-sm">
              {/* Logo & Foto Profil Masjid */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  {/* Preview Logo */}
                  <div className="relative group shrink-0">
                    <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-white border-2 border-emerald-500/30 shadow-md p-1.5 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-emerald-500">
                      <img
                        src={identitas.logo_url || '/icon.svg'}
                        alt={identitas.nama || 'Logo Masjid'}
                        className="h-full w-full object-contain rounded-xl"
                      />
                    </div>
                    {identitas.logo_url && (
                      <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-600 border border-white"></span>
                      </span>
                    )}
                  </div>

                  {/* Actions & Info */}
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-800 text-sm">Logo / Foto Profil Masjid</h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          identitas.logo_url
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {identitas.logo_url ? 'Foto Kustom Aktif' : 'Logo Standar Sistem'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Unggah foto lambang DKM, foto kubah/masjid, atau logo resmi Anda. Foto logo ini otomatis tampil di header website publik, laporan resmi, dan portal admin.
                    </p>

                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleLogoFileChange}
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={logoUploading}
                        className="flex items-center gap-2 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-60 cursor-pointer"
                      >
                        {logoUploading ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Upload size={14} />
                        )}
                        {logoUploading ? 'Mengunggah & Mengoptimalkan...' : 'Pilih Foto / Ganti Logo'}
                      </button>

                      {identitas.logo_url && (
                        <button
                          type="button"
                          onClick={handleResetLogo}
                          className="flex items-center gap-1.5 px-3 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                          title="Hapus foto kustom dan gunakan logo standar"
                        >
                          <RotateCcw size={13} />
                          <span>Reset ke Logo Standar</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
                    Nama Masjid
                  </label>
                  <input
                    type="text"
                    required
                    value={identitas.nama}
                    onChange={(e) => setIdentitas({ ...identitas, nama: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    placeholder="Contoh: Al-Mukhlisin"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
                    Nomor ID SIMAS Kemenag RI
                  </label>
                  <input
                    type="text"
                    required
                    value={identitas.nomor_id_kemenag}
                    onChange={(e) =>
                      setIdentitas({ ...identitas, nomor_id_kemenag: e.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    placeholder="Contoh: 01.4.13.04.06.000158"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
                  Alamat Lengkap Masjid
                </label>
                <textarea
                  rows={2}
                  required
                  value={identitas.alamat}
                  onChange={(e) => setIdentitas({ ...identitas, alamat: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition resize-none"
                  placeholder="Contoh: Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar, Kec. Margaasih, Kab. Bandung"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
                    Nama Ketua DKM
                  </label>
                  <input
                    type="text"
                    required
                    value={identitas.ketua_dkm}
                    onChange={(e) => setIdentitas({ ...identitas, ketua_dkm: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    placeholder="Contoh: Ustadz H. Ahmad Sobari"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5 text-xs uppercase tracking-wide">
                    Nama Bendahara DKM
                  </label>
                  <input
                    type="text"
                    required
                    value={identitas.bendahara}
                    onChange={(e) => setIdentitas({ ...identitas, bendahara: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                    placeholder="Contoh: H. Mulyadi, S.E."
                  />
                </div>
              </div>

              {/* --- QRIS & DONASI DIGITAL MASJID --- */}
              <div className="rounded-2xl border-2 border-dashed border-emerald-500/40 bg-gradient-to-br from-emerald-50/60 to-teal-50/40 p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-emerald-700 text-white shadow-sm">
                      <QrCode size={18} />
                    </span>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">QRIS Donasi & Infaq Digital Masjid</h3>
                      <p className="text-[11px] text-slate-500">
                        Unggah barcode QRIS resmi masjid agar jamaah dapat berinfaq melalui m-banking dan e-wallet.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      identitas.qris_url
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {identitas.qris_url ? '✓ Barcode QRIS Aktif' : 'Belum Ada Barcode'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pt-1">
                  {/* QRIS Preview Box */}
                  <div className="relative group shrink-0">
                    <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-2xl bg-white border-2 border-emerald-500/40 shadow-md p-2 flex flex-col items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-emerald-500">
                      {identitas.qris_url ? (
                        <img
                          src={identitas.qris_url}
                          alt="QRIS Donasi Masjid"
                          className="h-full w-full object-contain rounded-xl"
                        />
                      ) : (
                        <div className="text-center p-3 text-slate-400 space-y-2">
                          <QrCode size={48} className="mx-auto text-slate-300 stroke-[1.5]" />
                          <p className="text-[11px] font-medium leading-tight">
                            Belum ada foto barcode QRIS
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Controls & Rekening Form */}
                  <div className="space-y-3.5 flex-1 w-full">
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-700">Pilih Gambar Barcode QRIS:</p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Format yang didukung: JPG, PNG, atau WebP (maksimal 10MB). Sistem otomatis mengoptimalkan ketajaman gambar agar mudah dipindai oleh kamera HP jamaah.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="file"
                        ref={qrisFileInputRef}
                        onChange={handleQrisFileChange}
                        accept="image/png,image/jpeg,image/webp"
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => qrisFileInputRef.current?.click()}
                        disabled={qrisUploading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition disabled:opacity-60 cursor-pointer"
                      >
                        {qrisUploading ? (
                          <RefreshCw size={14} className="animate-spin" />
                        ) : (
                          <Upload size={14} />
                        )}
                        {qrisUploading ? 'Mengunggah QRIS...' : identitas.qris_url ? 'Ganti Barcode QRIS' : 'Unggah Barcode QRIS'}
                      </button>

                      {identitas.qris_url && (
                        <button
                          type="button"
                          onClick={handleResetQris}
                          className="flex items-center gap-1.5 px-3.5 py-2.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition cursor-pointer"
                          title="Hapus barcode QRIS"
                        >
                          <Trash2 size={13} />
                          <span>Hapus Barcode</span>
                        </button>
                      )}
                    </div>

                    {/* Nomor Rekening Pendukung / Nama Bank */}
                    <div className="pt-2">
                      <label className="block font-bold text-slate-700 mb-1 text-xs">
                        Informasi Rekening Bank / Merchant QRIS (Opsional):
                      </label>
                      <input
                        type="text"
                        value={identitas.rekening_bank || ''}
                        onChange={(e) => setIdentitas({ ...identitas, rekening_bank: e.target.value })}
                        className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                        placeholder="Contoh: Bank Syariah Indonesia (BSI) 7123456789 a.n. DKM Al-Mukhlisin"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Informasi ini akan ditampilkan di bawah barcode QRIS sebagai alternatif transfer manual bagi jamaah.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <div>
                  {savedOk && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                      <CheckCircle2 size={15} /> Identitas berhasil disimpan!
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-900/20 transition disabled:opacity-60"
                >
                  {saving ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  {saving ? 'Menyimpan...' : 'Simpan Identitas'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* ============================= */}
        {/* SECTION 2: BACKUP DATA */}
        {/* ============================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Database size={18} className="text-emerald-700" />
            <h2 className="font-black text-slate-800 text-base">Cadangan Data (Backup)</h2>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Ekspor seluruh data masjid (Kas, Jamaah, Zakat, Inventaris, Wakaf, Petugas Jumat, Saran Jamaah, dan Master Kategori) ke
            format JSON untuk disimpan sebagai arsip atau dipindah ke perangkat lain.
          </p>

          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <button
              onClick={handleGenerateBackup}
              disabled={backupLoading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-md disabled:opacity-60"
            >
              {backupLoading ? (
                <RefreshCw size={14} className="animate-spin" />
              ) : (
                <Database size={14} />
              )}
              {backupLoading ? 'Menyiapkan...' : 'Buat File Backup JSON'}
            </button>

            {backupJson && (
              <>
                <button
                  onClick={handleCopyBackup}
                  className="px-4 py-2.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold rounded-xl flex items-center gap-2 transition"
                >
                  {copiedJson ? (
                    <CheckCircle2 size={14} className="text-emerald-600" />
                  ) : (
                    <Copy size={14} />
                  )}
                  {copiedJson ? 'Tersalin!' : 'Salin ke Clipboard'}
                </button>
                <button
                  onClick={handleDownloadBackup}
                  className="px-4 py-2.5 border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold rounded-xl flex items-center gap-2 transition"
                >
                  <Download size={14} /> Unduh File .json
                </button>
              </>
            )}

            <button
              type="button"
              onClick={handleClearAllData}
              className="px-4 py-2.5 border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-bold rounded-xl flex items-center gap-2 transition"
              title="Kosongkan seluruh data transaksi agar bersih dari 0"
            >
              <Trash2 size={14} /> Kosongkan Data Transaksi (Mulai dari 0)
            </button>
          </div>

          {backupJson && (
            <div className="relative">
              <pre className="w-full h-52 overflow-auto text-[10px] font-mono bg-slate-900 text-emerald-300 rounded-2xl p-4 border border-slate-700">
                {backupJson}
              </pre>
            </div>
          )}
        </div>

        {/* ============================= */}
        {/* SECTION 3: KEAMANAN & KATA SANDI */}
        {/* ============================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <KeyRound size={18} className="text-emerald-700" />
            <h2 className="font-black text-slate-800 text-base">Keamanan & Kata Sandi Administrator</h2>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Kelola kata sandi yang digunakan oleh pengurus DKM untuk masuk ke Portal Administrasi DKM.
          </p>

          <form onSubmit={handleSavePassword} className="max-w-md space-y-4">
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Kata Sandi Aktif Saat Ini
              </span>
              <p className="font-mono text-sm font-bold text-emerald-800">
                {currentPw || 'Almukhlisin0504$'}
              </p>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1.5">
                Ubah Kata Sandi Baru
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Masukkan kata sandi baru (min. 6 karakter)..."
                  className="w-full text-xs font-mono font-bold bg-white border border-slate-200 rounded-xl px-4 py-3 pl-10 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none text-slate-900"
                />
                <Lock size={15} className="absolute left-3.5 top-3.5 text-slate-400" />
              </div>
              {pwError && (
                <p className="text-[11px] font-bold text-red-600 mt-1.5">{pwError}</p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <Save size={14} /> Simpan Kata Sandi Baru
              </button>
              {pwSavedOk && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                  <CheckCircle2 size={15} /> Sandi berhasil diperbarui!
                </span>
              )}
            </div>
          </form>
        </div>

        {/* ============================= */}
        {/* SECTION 4: PEMBARUAN & VERSI APLIKASI */}
        {/* ============================= */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6 md:p-8">
          <div className="flex items-center gap-2 mb-2">
            <Smartphone size={18} className="text-emerald-700" />
            <h2 className="font-black text-slate-800 text-base">Pembaruan & Versi Aplikasi</h2>
          </div>
          <p className="text-xs text-slate-500 mb-5">
            Sistem secara otomatis memeriksa ketersediaan pembaruan saat aplikasi dibuka di HP. Anda juga dapat memicu pemeriksaan manual kapan saja.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">Al-Mukhlisin Mobile</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold border border-emerald-200">
                  v{CURRENT_APP_VERSION.version} (Build {CURRENT_APP_VERSION.versionCode})
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Rilis: {CURRENT_APP_VERSION.releaseDate} · Didukung In-App Auto Update & Pull-to-Refresh
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('masjid_check_update_manually'));
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-sm transition active:scale-95 cursor-pointer"
            >
              <RefreshCw size={14} />
              <span>Periksa Pembaruan Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
