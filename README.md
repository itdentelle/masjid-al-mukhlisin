# 🕌 Sistem Informasi & Manajemen Masjid Al-Mukhlisin

Aplikasi web modern berbasis **Next.js 16 (App Router + TypeScript + Tailwind CSS)** dan **Supabase (PostgreSQL Database, Auth, dan Storage)** yang dirancang untuk di-*deploy* dengan performa tinggi di **Vercel**.

Project ini menggantikan arsitektur *microservices* Laravel sebelumnya menjadi arsitektur modern fullstack yang hemat biaya, minim *maintenance*, cepat, dan siap skala produksi (*combo Vercel + Supabase*).

---

## ✨ Fitur Utama

1. **Portal Publik (Landing Page)**:
   - Hero Section sinematik dengan latar belakang video masjid (`/videos/masjid-cinematic.mp4`).
   - Jadwal Shalat Real-Time terintegrasi otomatis dengan API Aladhan (Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar / ID SIMAS: 01.4.13.04.06.000158).
   - Visi, Misi, dan Profil Sejarah Masjid.
   - Agenda Majelis Ilmu & Khutbah Jumat lengkap dengan status dan modal detail poster kajian.
   - Manajemen Fasilitas & Inventaris dengan slider otomatis (Ringkasan unit & tabel daftar aset).
   - Transparansi Keuangan Terbuka (Total kas umat & tabel aliran mutasi kas terbaru).
   - Modal Pop-up QRIS Donasi Infaq & Sedekah.

2. **Panel Pengurus DKM (Admin Dashboard - `/dashboard`)**:
   - Statistik utama: Saldo Kas, Total Aset Terinventarisir, dan Agenda Terdekat.
   - Ringkasan 5 mutasi kas terakhir & 3 agenda mendatang.
   - Akses cepat untuk pencatatan transaksi kas dan input inventaris.

3. **Modul Manajemen Keuangan Kas (`/finance`)**:
   - Saldo Akhir, Total Pemasukan, dan Total Pengeluaran terhitung otomatis.
   - Pencarian keterangan transaksi dan penyaringan berdasarkan kategori (*Semua, Masuk, Keluar*) serta rentang tanggal.
   - Cetak Laporan Otomatis (*Print Mode* ramah kertas dengan layout kwitansi/tabel khusus).
   - Dukungan multi-select transaksi untuk ringkasan kustom.
   - CRUD lengkap (Tambah, Edit, Detail, Hapus).

4. **Modul Manajemen Inventaris Fisik (`/inventory`)**:
   - Pencatatan aset masjid dengan status kondisi (*Baik, Pemeliharaan, Dipinjamkan, Rusak*).
   - Ekspor data inventaris ke format file **Microsoft Excel (.xlsx)**.
   - Fitur "Salin Tabel" langsung ke *Clipboard*.
   - Mode Cetak (*Print*) daftar fasilitas.
   - CRUD lengkap (Tambah, Edit, Detail, Hapus).

5. **Modul Khutbah & Majelis Ilmu (`/khutbah`)**:
   - Penjadwalan Khutbah Jumat, Kajian Ahad Subuh, Tabligh Akbar, dll.
   - Unggah gambar poster/foto khotib langsung ke **Supabase Storage** bucket `khutbah-images`.
   - Filter status kegiatan (*Terjadwal, Selesai, Batal*).
   - Ekspor agenda ke Excel (.xlsx).
   - CRUD lengkap.

6. **Autentikasi & Multi-Mode**:
   - Mendukung **Supabase Auth** (Login, Registrasi pengurus, Session Management).
   - Dilengkapi **Mode Demo / Offline Fallback** otomatis: jika *credentials* Supabase belum diisi, aplikasi tetap berjalan 100% menggunakan *local storage* tanpa *error*.

---

## 🚀 Panduan Memulai Cepat

### 1. Menjalankan di Lokal (Development)

```bash
# Pastikan berada di folder project
cd d:\Projects\masjid-al-mukhlisin

# Install dependencies (jika belum)
npm install

# Jalankan server lokal
npm run dev
```

Buka peramban di [http://localhost:3000](http://localhost:3000).

Untuk masuk ke Portal Pengurus di mode lokal:
- URL: [http://localhost:3000/login](http://localhost:3000/login)
- Email: `admin@masjid.id` (atau klik tombol **Isi Demo**)
- Password: `admin123`

---

## 🗄️ Menghubungkan ke Supabase (Database & Storage)

Ikuti langkah mudah berikut untuk menghubungkan ke database PostgreSQL Supabase:

1. Buat project baru di [Supabase Dashboard](https://supabase.com).
2. Buka menu **SQL Editor** di Supabase.
3. Buka file [supabase/schema.sql](file:///d:/Projects/masjid-al-mukhlisin/supabase/schema.sql), salin seluruh isinya, lalu klik **Run** di Supabase SQL Editor.
   > File SQL ini secara otomatis membuat tabel `inventories`, `kas`, `khutbahs`, storage bucket `khutbah-images`, Row Level Security (RLS) policies, serta data *seed* awal.
4. Buka menu **Project Settings** -> **API** di Supabase, lalu salin:
   - **Project URL**
   - **anon / public key**
5. Buka file `.env.local` di root project dan masukkan kredensial:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Setelah `.env.local` diisi, aplikasi akan langsung otomatis beralih dari mode offline ke database cloud Supabase secara *real-time*!

---

## ☁️ Panduan Deploy ke Vercel (Combo Vercel + Supabase)

1. Push kode ke repository GitHub / GitLab / Bitbucket Anda.
2. Buka [Vercel Dashboard](https://vercel.com) dan pilih **Add New Project**.
3. Import repository project ini.
4. Pada bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxxxxxxxxx.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUz...`
5. Klik **Deploy**!
   Vercel akan secara otomatis membangun aplikasi dalam waktu hitungan detik.

---

## 📁 Struktur Direktori

```
d:\Projects\masjid-al-mukhlisin
├── public/
│   ├── images/
│   │   └── masjid-bg.jpg           # Background poster masjid
│   ├── videos/
│   │   └── masjid-cinematic.mp4    # Video sinematik landing page
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── api/                    # REST API endpoints (Kas, Inventory, Khutbah, Auth)
│   │   ├── dashboard/page.tsx      # Halaman Panel Pengurus DKM (Admin Overview)
│   │   ├── finance/page.tsx        # Halaman Manajemen Kas
│   │   ├── inventory/page.tsx      # Halaman Manajemen Inventaris
│   │   ├── khutbah/page.tsx        # Halaman Manajemen Khutbah & Kajian
│   │   ├── login/page.tsx          # Halaman Login Admin
│   │   ├── register/page.tsx       # Halaman Registrasi Pengurus
│   │   ├── globals.css             # Tema Tailwind CSS, Google Fonts, & Print Styles
│   │   ├── layout.tsx              # Root Layout dengan Auth Provider
│   │   └── page.tsx                # Halaman Utama (Landing Page Publik)
│   ├── components/
│   │   └── layout/
│   │       └── admin-layout.tsx    # Sidebar admin responsif & status backend
│   ├── lib/
│   │   ├── auth-context.tsx        # Manajemen sesi login Supabase / Offline fallback
│   │   ├── data-service.ts         # Data layer terpadu untuk Supabase & Local DB
│   │   └── supabase/
│   │       └── client.ts           # Supabase client initialization
│   └── types/
│       └── index.ts                # TypeScript type definitions
├── supabase/
│   └── schema.sql                  # Skema database PostgreSQL, RLS, & Bucket
├── .env.example
├── .env.local
└── package.json
```

---

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + Plus Jakarta Sans & Lobster Two Google Fonts
- **Database & Auth**: Supabase (PostgreSQL + RLS + GoTrue Auth)
- **Object Storage**: Supabase Storage (`khutbah-images`)
- **Icons**: Lucide React
- **Exporting**: SheetJS (XLSX)
- **Deployment**: Vercel Ready
