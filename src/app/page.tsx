'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getHijriDateString } from '@/lib/hijri';
import { getOfficialPrayerTimes } from '@/lib/prayer-service';
import KhutbahDefaultPoster, { isCustomPosterImage } from '@/components/khutbah-default-poster';
import {
  CalendarDays,
  CheckCircle,
  ChevronDown,
  Clock,
  Eye,
  Heart,
  MapPin,
  Menu,
  Shield,
  Target,
  Wallet,
  X,
  ArrowRight,
  RefreshCw,
  ExternalLink,
  MessageSquareHeart,
  Send,
  ShieldCheck,
  CheckCircle2,
  Sunrise,
  Sunset,
  Sun,
  SunMedium,
  Moon,
  MoonStar,
  Timer,
  Compass,
  Info,
  UserCheck,
  Smartphone,
} from 'lucide-react';
import MobileBottomNav from '@/components/layout/mobile-bottom-nav';
import CustomDropdown, { DropdownOption } from '@/components/ui/custom-dropdown';

const IconInstagram = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const IconYoutube = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
    <polygon points="10 15 15 12 10 9 10 15"/>
  </svg>
);

const IconFacebook = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
import { DataService } from '@/lib/data-service';
import { InventoryItem, KasItem, KhutbahItem, IdentitasMasjid, SaranKritikItem, KategoriSaran, PetugasJumatItem, KategoriItem } from '@/types';

function KajianCardMedia({ item }: { item: KhutbahItem }) {
  const [imgError, setImgError] = useState(false);
  const hasCustom = isCustomPosterImage(item.image) && !imgError;

  if (!hasCustom) {
    return (
      <KhutbahDefaultPoster
        variant="card"
        jenisKegiatan={item.jenis_kegiatan}
        khotib={item.khotib}
        tema={item.tema}
        tanggal={new Date(item.tanggal).toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        })}
        waktu={item.waktu}
        className="h-full w-full transition-transform duration-700 group-hover:scale-105"
      />
    );
  }

  return (
    <img
      src={item.image!}
      alt={item.khotib}
      loading="lazy"
      onError={() => setImgError(true)}
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
    />
  );
}

function KajianModalMedia({ item }: { item: KhutbahItem }) {
  const [imgError, setImgError] = useState(false);
  const hasCustom = isCustomPosterImage(item.image) && !imgError;

  if (!hasCustom) {
    return (
      <KhutbahDefaultPoster
        variant="banner"
        jenisKegiatan={item.jenis_kegiatan}
        khotib={item.khotib}
        tema={item.tema}
        tanggal={new Date(item.tanggal).toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}
        waktu={item.waktu}
        className="h-full w-full"
      />
    );
  }

  return (
    <img
      src={item.image!}
      alt={item.khotib}
      onError={() => setImgError(true)}
      className="h-full w-full object-cover"
    />
  );
}

export default function HomePage() {
  const [jadwal, setJadwal] = useState<KhutbahItem[]>([]);
  const [nextJumat, setNextJumat] = useState<PetugasJumatItem | null>(null);
  const [saldo, setSaldo] = useState<number>(0);
  const [totalFasilitas, setTotalFasilitas] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Jadwal Shalat
  const [jadwalShalat, setJadwalShalat] = useState<Record<string, string> | null>(null);
  const [loadingShalat, setLoadingShalat] = useState(true);
  const [todayDateString, setTodayDateString] = useState('');
  const [hijriDateString, setHijriDateString] = useState('');
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [identitas, setIdentitas] = useState<IdentitasMasjid | null>(null);

  // Live Clock & Real-time Prayer Tracker
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  const currentTimeString = useMemo(() => {
    if (!currentTime) return '--:--:--';
    return currentTime
      .toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(/\./g, ':');
  }, [currentTime]);

  const getPrayerTime = (key: string): string => {
    if (!jadwalShalat) return '--:--';
    if (jadwalShalat[key]) return jadwalShalat[key].split(' ')[0];
    if (key === 'Imsak' && jadwalShalat.Fajr) {
      const [h, m] = jadwalShalat.Fajr.split(':').map(Number);
      let totalM = h * 60 + m - 10;
      if (totalM < 0) totalM += 1440;
      const ih = String(Math.floor(totalM / 60)).padStart(2, '0');
      const im = String(totalM % 60).padStart(2, '0');
      return `${ih}:${im}`;
    }
    return '--:--';
  };

  const prayerList = [
    { key: 'Imsak', label: 'Imsak', desc: 'Batas Sahur', icon: MoonStar, color: 'text-amber-500' },
    { key: 'Fajr', label: 'Subuh', desc: 'Shalat Fardhu', icon: Sunrise, color: 'text-teal-500' },
    { key: 'Dhuhr', label: 'Dzuhur', desc: 'Shalat Fardhu', icon: Sun, color: 'text-amber-500' },
    { key: 'Asr', label: 'Ashar', desc: 'Shalat Fardhu', icon: SunMedium, color: 'text-orange-500' },
    { key: 'Maghrib', label: 'Maghrib', desc: 'Buka Puasa', icon: Sunset, color: 'text-rose-500' },
    { key: 'Isha', label: 'Isya', desc: 'Shalat Fardhu', icon: Moon, color: 'text-indigo-400' },
  ];

  const prayerInfo = useMemo(() => {
    if (!jadwalShalat || !currentTime) {
      return {
        activeKey: 'Dhuhr',
        nextKey: 'Asr',
        nextLabel: 'Ashar',
        nextTime: '--:--',
        countdownText: '',
      };
    }

    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const nowSeconds = currentTime.getSeconds();

    const timingsList = [
      { key: 'Imsak', label: 'Imsak', time: getPrayerTime('Imsak') },
      { key: 'Fajr', label: 'Subuh', time: getPrayerTime('Fajr') },
      { key: 'Dhuhr', label: 'Dzuhur', time: getPrayerTime('Dhuhr') },
      { key: 'Asr', label: 'Ashar', time: getPrayerTime('Asr') },
      { key: 'Maghrib', label: 'Maghrib', time: getPrayerTime('Maghrib') },
      { key: 'Isha', label: 'Isya', time: getPrayerTime('Isha') },
    ];

    let nextItem = null;
    let activeItem = timingsList[timingsList.length - 1]; // default Isya (night)

    for (let i = 0; i < timingsList.length; i++) {
      const item = timingsList[i];
      if (item.time === '--:--') continue;
      const [h, m] = item.time.split(':').map(Number);
      const itemMinutes = h * 60 + m;
      if (nowMinutes < itemMinutes || (nowMinutes === itemMinutes && nowSeconds === 0)) {
        nextItem = item;
        activeItem = i > 0 ? timingsList[i - 1] : timingsList[timingsList.length - 1];
        break;
      }
    }

    if (!nextItem) {
      // Past Isha, next is tomorrow's Imsak
      nextItem = timingsList[0];
      activeItem = timingsList[timingsList.length - 1];
    }

    let diffSecondsTotal = 0;
    if (nextItem.time !== '--:--') {
      const [nh, nm] = nextItem.time.split(':').map(Number);
      const targetDate = new Date(currentTime);
      targetDate.setHours(nh, nm, 0, 0);
      if (targetDate.getTime() <= currentTime.getTime()) {
        targetDate.setDate(targetDate.getDate() + 1);
      }
      diffSecondsTotal = Math.max(0, Math.floor((targetDate.getTime() - currentTime.getTime()) / 1000));
    }

    const hours = Math.floor(diffSecondsTotal / 3600);
    const minutes = Math.floor((diffSecondsTotal % 3600) / 60);
    const seconds = diffSecondsTotal % 60;

    let countdownText = '';
    if (hours > 0) {
      countdownText = `${hours}j ${minutes}m ${seconds}d`;
    } else {
      countdownText = `${minutes}m ${seconds}d`;
    }

    return {
      activeKey: activeItem.key,
      nextKey: nextItem.key,
      nextLabel: nextItem.label,
      nextTime: nextItem.time,
      countdownText,
    };
  }, [jadwalShalat, currentTime]);

  // Modals & Slides
  const [selectedKajian, setSelectedKajian] = useState<KhutbahItem | null>(null);
  const [dataKeuangan, setDataKeuangan] = useState<KasItem[]>([]);
  const [fasilitas, setFasilitas] = useState<InventoryItem[]>([]);

  // Saran & Aspirasi State
  const [saranList, setSaranList] = useState<SaranKritikItem[]>([]);
  const [kategoriSaranList, setKategoriSaranList] = useState<KategoriItem[]>([]);
  const [saranNama, setSaranNama] = useState('');
  const [saranIsAnonim, setSaranIsAnonim] = useState(false);
  const [saranNoHp, setSaranNoHp] = useState('');
  const [saranKategori, setSaranKategori] = useState<KategoriSaran>('Umum');
  const [saranPesan, setSaranPesan] = useState('');
  const [saranSubmitting, setSaranSubmitting] = useState(false);
  const [saranSuccess, setSaranSuccess] = useState(false);

  const saranDropdownOptions: DropdownOption[] = useMemo(() => {
    const list =
      kategoriSaranList.length > 0
        ? kategoriSaranList.map((k) => k.nama)
        : ['Umum', 'Fasilitas & Kebersihan', 'Kajian & Dakwah', 'Pelayanan DKM', 'Keuangan', 'Lainnya'];

    return list.map((opt) => ({
      value: opt,
      label: opt,
    }));
  }, [kategoriSaranList]);

  // Carousel Slides
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeKeuanganSlide, setActiveKeuanganSlide] = useState(0);

  // Auto slide Inventaris (8s)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev === 0 ? 1 : 0));
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Auto slide Keuangan (10s)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveKeuanganSlide((prev) => (prev === 0 ? 1 : 0));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleKirimSaran = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saranPesan.trim()) return;
    setSaranSubmitting(true);
    try {
      if (typeof DataService?.addSaranKritik === 'function') {
        await DataService.addSaranKritik({
          nama: saranIsAnonim ? 'Hamba Allah' : (saranNama.trim() || 'Hamba Allah'),
          no_hp: saranNoHp.trim() || undefined,
          kategori: saranKategori,
          pesan: saranPesan.trim(),
          status: 'baru',
          is_publik: true,
        });
      }
      setSaranSuccess(true);
      setSaranNama('');
      setSaranNoHp('');
      setSaranPesan('');
      setSaranIsAnonim(false);
      setSaranKategori('Umum');
      if (typeof DataService?.getSaranKritik === 'function') {
        const updatedSaran = await DataService.getSaranKritik(true);
        setSaranList(Array.isArray(updatedSaran) ? updatedSaran : []);
      }
      setTimeout(() => setSaranSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to submit saran from beranda:', err);
      alert('Gagal mengirimkan masukan. Silakan coba kembali.');
    } finally {
      setSaranSubmitting(false);
    }
  };

  // Fetch internal data and prayer times
  useEffect(() => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setTodayDateString(
      now.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    );
    setHijriDateString(getHijriDateString(now));

    const fetchInternalData = async () => {
      setLoading(true);
      try {
        const [khutbahData, kasData, invData, idData, saranData, petugasData, categoriesData] = await Promise.all([
          DataService.getKhutbahs(),
          DataService.getKas(),
          DataService.getInventories(),
          DataService.getIdentitas(),
          typeof DataService?.getSaranKritik === 'function'
            ? DataService.getSaranKritik(true)
            : Promise.resolve([]),
          DataService.getPetugasJumat(),
          DataService.getKategori('saran'),
        ]);

        if (idData) setIdentitas(idData);
        if (Array.isArray(categoriesData)) {
          const activeCats = categoriesData.filter((k) => k.is_active !== false);
          if (activeCats.length > 0) setKategoriSaranList(activeCats);
        }

        // 1. Khutbah: Urutkan terdekat dan ambil 3 teratas
        setJadwal(khutbahData.slice(0, 3));

        // 1b. Petugas Shalat Jumat Terdekat
        if (Array.isArray(petugasData) && petugasData.length > 0) {
          setNextJumat(petugasData[0]);
        }

        // 2. Keuangan: Hitung total kas & simpan list
        const total = kasData.reduce((acc, curr) => {
          const val = Number(curr.nominal);
          return curr.tipe === 'masuk' ? acc + val : acc - val;
        }, 0);
        setSaldo(total);
        setDataKeuangan(kasData);

        // 3. Inventaris
        setTotalFasilitas(invData.length);
        setFasilitas(invData);

        // 4. Saran Jamaah
        setSaranList(Array.isArray(saranData) ? saranData : []);
      } catch (err) {
        console.error('Error fetching internal data:', err);
      } finally {
        setLoading(false);
      }
    };

    const handleIdentitasUpdated = (e: any) => {
      if (e?.detail) setIdentitas(e.detail);
      else DataService.getIdentitas().then((d) => setIdentitas(d));
    };
    const handleSaranUpdated = () => {
      if (typeof DataService?.getSaranKritik === 'function') {
        DataService.getSaranKritik(true).then((s) => setSaranList(Array.isArray(s) ? s : []));
      }
    };

    const handleKategoriUpdated = () => {
      DataService.getKategori('saran').then((cats) => {
        const activeCats = cats.filter((k) => k.is_active !== false);
        if (activeCats.length > 0) setKategoriSaranList(activeCats);
      });
    };

    window.addEventListener('masjid_identitas_updated', handleIdentitasUpdated);
    window.addEventListener('masjid_saran_updated', handleSaranUpdated);
    window.addEventListener('masjid_kategori_updated', handleKategoriUpdated);

    const fetchShalat = async () => {
      try {
        const timings = await getOfficialPrayerTimes(now);
        setJadwalShalat(timings);
      } catch (error) {
        console.warn('Gagal memuat jadwal shalat dari API:', error);
      } finally {
        setLoadingShalat(false);
      }
    };

    fetchInternalData();
    fetchShalat();

    return () => {
      window.removeEventListener('masjid_identitas_updated', handleIdentitasUpdated);
      window.removeEventListener('masjid_saran_updated', handleSaranUpdated);
      window.removeEventListener('masjid_kategori_updated', handleKategoriUpdated);
    };
  }, []);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f4f7f6] font-sans text-slate-900 selection:bg-emerald-200">
      {/* --- NAVBAR MELAYANG (FLOATING PILL) --- */}
      <header className="fixed top-0 z-50 w-full px-4 pt-6 transition-all md:px-8">
        <nav
          className={`mx-auto max-w-7xl border border-white/10 bg-[#1a2b25]/85 shadow-2xl backdrop-blur-md transition-all duration-300 ${
            isMenuOpen ? 'rounded-[2rem]' : 'rounded-full'
          }`}
        >
          <div className="flex items-center justify-between px-4 py-3 md:px-8">
            {/* Logo & Brand */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-emerald-800/80 border border-emerald-500/30 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform overflow-hidden">
                <img
                  src={identitas?.logo_url || '/icon.svg'}
                  alt={identitas?.nama || "Masjid Al-Mukhlisin"}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="font-serif-elegant text-xl font-bold tracking-wide text-white md:text-2xl whitespace-nowrap block group-hover:text-emerald-300 transition-colors">
                {identitas?.nama || 'Al-Mukhlisin'}
              </span>
            </Link>

            {/* Navigation Links (Desktop) */}
            <div className="hidden gap-6 text-[11px] font-bold tracking-widest text-slate-300 uppercase md:flex lg:gap-8">
              <a href="#jadwal" className="transition-colors hover:text-white">
                Jadwal Shalat
              </a>
              <a href="#khutbah" className="transition-colors hover:text-white">
                Kajian & Khutbah
              </a>
              <a href="#fasilitas" className="transition-colors hover:text-white">
                Fasilitas
              </a>
              <a href="#keuangan" className="transition-colors hover:text-white">
                Transparansi
              </a>
              <a href="#saran" className="transition-colors hover:text-white text-emerald-300">
                Kotak Saran
              </a>
            </div>

            {/* Right Side: Portal Link (Desktop only) & Burger Button */}
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold text-slate-200 hover:text-white bg-white/10 hover:bg-white/15 transition-all"
              >
                <Shield size={13} className="text-emerald-400" />
                <span>Portal Pengurus</span>
              </Link>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:hidden"
                aria-label="Menu"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu (Dropdown) */}
          <div
            className={`overflow-hidden transition-all duration-300 md:hidden ${
              isMenuOpen ? 'max-h-[26rem] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="flex flex-col items-center gap-3.5 border-t border-white/5 pt-4 pb-6 text-[10px] font-black tracking-[0.2em] text-slate-300 uppercase">
              <a href="#jadwal" onClick={() => setIsMenuOpen(false)} className="py-1.5 transition-colors hover:text-white">
                Jadwal Shalat
              </a>
              <a href="#khutbah" onClick={() => setIsMenuOpen(false)} className="py-1.5 transition-colors hover:text-white">
                Kajian & Khutbah
              </a>
              <a href="#fasilitas" onClick={() => setIsMenuOpen(false)} className="py-1.5 transition-colors hover:text-white">
                Fasilitas
              </a>
              <a href="#keuangan" onClick={() => setIsMenuOpen(false)} className="py-1.5 transition-colors hover:text-white">
                Transparansi
              </a>
              <a href="#saran" onClick={() => setIsMenuOpen(false)} className="py-1.5 transition-colors text-emerald-300 hover:text-white">
                Kotak Saran
              </a>

              {/* Unduh Aplikasi Android APK khusus Mobile */}
              <Link
                href="/unduh"
                onClick={() => setIsMenuOpen(false)}
                className="w-full max-w-xs mt-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-[#0d8a5e] text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 border border-emerald-400/40 text-[11px] tracking-normal capitalize"
              >
                <Smartphone size={15} />
                <span>Unduh Aplikasi APK</span>
                <span className="rounded bg-amber-400/90 px-1.5 py-0.5 text-[9px] font-black text-amber-950 uppercase">
                  Android
                </span>
              </Link>

              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="py-1 text-slate-300 hover:text-emerald-300 font-bold flex items-center gap-1.5 tracking-normal text-[11px] capitalize"
              >
                <Shield size={14} className="text-emerald-400" /> Masuk Portal Pengurus
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* --- HERO SECTION --- */}
      <section data-theme="dark" className="relative flex min-h-[85vh] lg:min-h-[92vh] xl:min-h-screen items-center px-4 md:px-8 overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          poster="/images/masjid-bg.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/masjid-cinematic.mp4" type="video/mp4" />
        </video>

        {/* Overlay Directional: Gelap di kiri agar teks tajam, lembut & transparan di kanan agar video & kubah masjid terlihat jelas */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1f18]/92 via-[#0a1f18]/60 to-[#0a1f18]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1f18]/85 via-transparent to-[#0a1f18]/40" />
        {/* Transisi Halus ke Bagian Bawah */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f4f7f6] to-transparent pointer-events-none" />

        {/* Konten Hero */}
        <div className="relative z-10 mx-auto w-full max-w-7xl pt-32 sm:pt-36 md:pt-40 pb-20 sm:pb-24 md:pb-28">
          <div className="max-w-3xl">
            {/* Subteks Atas dengan Garis Emas & ID Kemenag */}
            <div className="mb-4 sm:mb-5 flex flex-wrap items-center gap-2.5 sm:gap-3">
              <span className="h-[2px] w-6 sm:w-8 bg-[#d4af37]" />
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-950/80 px-3 sm:px-4 py-1 text-[10px] sm:text-[11px] font-semibold text-emerald-300 backdrop-blur-md shadow-inner">
                <span className="tracking-wide">Kartu Masjid Kemenag RI</span>
                <span className="text-white/30">|</span>
                <span className="font-mono text-white tracking-wider font-bold">ID {identitas?.nomor_id_kemenag || '01.4.13.04.06.000158'}</span>
              </div>
            </div>

            {/* Judul Utama Serif (Al-Mukhlisin dilindungi whitespace-nowrap agar tidak patah tanda hubung '-') */}
            <h1 className="font-serif-elegant mb-3.5 sm:mb-5 text-3xl sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.08] font-bold text-white drop-shadow-md">
              Masjid <span className="whitespace-nowrap">{identitas?.nama || 'Al-Mukhlisin'}</span>
            </h1>

            {/* Alamat Resmi Hero & Tanggal Hijriah */}
            <div className="mb-5 sm:mb-7 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs md:text-sm text-emerald-200/90 font-medium">
              <span className="flex items-center gap-1.5">
                <MapPin size={14} className="text-[#d4af37] shrink-0 sm:size-[16px]" />
                <span className="text-[11px] sm:text-xs md:text-sm">{identitas?.alamat || 'Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar'}</span>
              </span>
              {todayDateString && (
                <span className="flex items-center gap-1.5 text-emerald-300 font-semibold bg-emerald-950/70 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-800/40 text-[10px] sm:text-xs">
                  <CalendarDays size={12} className="text-[#d4af37] shrink-0 sm:size-[14px]" />
                  <span>
                    {todayDateString}
                    {hijriDateString ? ` · ${hijriDateString}` : ''}
                  </span>
                </span>
              )}
            </div>

            {/* Subjudul Dua Warna */}
            <h2 className="font-serif-elegant mb-4 sm:mb-6 text-xl sm:text-3xl leading-snug sm:leading-tight font-bold md:text-4xl lg:text-[2.6rem]">
              <span className="text-emerald-400">Ikhlas Beribadah,</span>{' '}
              <span className="text-[#d4af37]">Merajut Berkah.</span>
            </h2>

            {/* Mini Real-Time Info Badges */}
            <div className="mb-5 flex flex-wrap items-center gap-2.5 text-xs">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-950/75 border border-emerald-500/35 px-3 py-1 text-emerald-300 backdrop-blur-md shadow-sm">
                <Clock size={12} className="text-emerald-400" />
                <span className="font-mono font-bold text-white text-[11px] sm:text-xs">{currentTimeString} WIB</span>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/10 border border-white/20 px-3 py-1 text-slate-200 backdrop-blur-md shadow-sm text-[11px] sm:text-xs">
                <Timer size={12} className="text-emerald-400 animate-pulse" />
                <span>Menuju {prayerInfo.nextLabel} ({prayerInfo.nextTime})</span>
                {prayerInfo.countdownText && (
                  <span className="font-mono font-bold text-emerald-300">
                    · {prayerInfo.countdownText}
                  </span>
                )}
              </div>
            </div>

            {/* Deskripsi */}
            <p className="mb-7 sm:mb-9 max-w-xl text-xs sm:text-sm md:text-base leading-relaxed sm:leading-loose font-medium text-slate-300/95">
              Menghidupkan syiar Islam dengan hati yang tulus dan penuh kedamaian. Selamat datang di rumah
              ibadah kita bersama, tempat bertumbuhnya iman dan kebersamaan warga.
            </p>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <a
                href="#jadwal"
                className="inline-flex items-center gap-2 rounded-full bg-[#0d8a5e] hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-3 shadow-lg shadow-emerald-950/60 transition-all hover:scale-105 active:scale-95"
              >
                <span>Jadwal Shalat Hari Ini</span>
                <ChevronDown size={15} className="animate-bounce" />
              </a>
              <a
                href="#khutbah"
                className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm px-5 py-3 backdrop-blur-xs transition-all hover:bg-white/15"
              >
                <span>Majelis Ilmu</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT SECTIONS --- */}
      <main className="relative z-20 mx-auto -mt-2 sm:-mt-6 max-w-7xl space-y-12 sm:space-y-24 px-3 sm:px-6 md:px-8 py-8 sm:py-12 md:-mt-16 md:space-y-32 md:py-20">
        {/* --- 1. JADWAL SHALAT REAL-TIME --- */}
        <section id="jadwal" className="scroll-mt-32">
          <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] border border-slate-200/80 bg-white p-3 sm:p-7 md:p-10 shadow-2xl shadow-slate-200/60">
            {/* Header Bagian Waktu Shalat */}
            <div className="mb-6 flex flex-col items-center justify-between gap-4 border-b border-slate-100 pb-5 md:flex-row md:items-end">
              <div className="text-center md:text-left">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest text-[#0d8a5e] mb-2 border border-emerald-100/80">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                  </span>
                  Jadwal Shalat & Imsakiyah
                </div>
                <h2 className="font-serif-elegant text-2xl font-bold text-[#0a1f18] sm:text-3xl md:text-4xl">
                  Waktu Shalat Hari Ini
                </h2>
                <p className="mt-1.5 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-500 md:justify-start">
                  <MapPin size={15} className="text-[#0d8a5e] shrink-0" />
                  <span>Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar, Margaasih</span>
                </p>
              </div>

              {/* Tanggal Masehi & Hijriah */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-900 bg-emerald-50/90 px-4 py-2 rounded-full border border-emerald-200/80 shadow-xs">
                  <CalendarDays size={14} className="text-[#0d8a5e]" />
                  <span>{todayDateString || 'Hari Ini'}</span>
                  {hijriDateString && (
                    <>
                      <span className="text-emerald-300 font-normal">|</span>
                      <span className="text-[#0d8a5e]">{hijriDateString}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Banner Digital Clock & Countdown Shalat Berikutnya */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#092219] via-[#0f382a] to-[#071913] p-5 sm:p-6 text-white shadow-xl border border-emerald-800/40 mb-6">
              {/* Background ambient lighting */}
              <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-teal-500/15 blur-3xl" />

              <div className="relative z-10 grid gap-5 md:grid-cols-12 md:items-center">
                {/* Sisi Kiri: Real-Time Jam Digital */}
                <div className="space-y-1.5 text-center md:text-left md:col-span-7">
                  <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-400/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                    <Clock size={12} className="text-emerald-400" />
                    <span>Jam Real-Time Wilayah Lagadar</span>
                  </div>
                  <div className="flex items-baseline justify-center md:justify-start gap-2">
                    <span className="font-mono text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white drop-shadow-sm">
                      {currentTimeString}
                    </span>
                    <span className="text-emerald-400 font-bold text-xs sm:text-sm tracking-widest uppercase">
                      WIB
                    </span>
                  </div>
                </div>

                {/* Sisi Kanan: Kartu Highlight Waktu Shalat Berikutnya */}
                <div className="md:col-span-5">
                  <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/15 p-3.5 sm:p-4 shadow-inner">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-300">
                        <Timer size={13} className="text-emerald-400 animate-pulse" />
                        Shalat Berikutnya
                      </span>
                      <span className="text-[11px] font-extrabold bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full">
                        {prayerInfo.nextTime} WIB
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-lg sm:text-2xl font-black text-white tracking-wide">
                          {prayerInfo.nextLabel}
                        </h4>
                        <p className="text-[10px] sm:text-[11px] text-emerald-200/80 font-medium">
                          Menuju kumandang adzan:
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block font-mono text-sm sm:text-lg font-black text-emerald-200 bg-emerald-950/70 border border-emerald-500/40 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg shadow-inner">
                          {prayerInfo.countdownText || '--:--'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Grid 6 Waktu Shalat (Imsak, Subuh, Dzuhur, Ashar, Maghrib, Isya) */}
            {loadingShalat ? (
              <div className="flex h-36 items-center justify-center font-bold text-slate-400 gap-2">
                <RefreshCw size={20} className="animate-spin text-emerald-600" />
                <span>Menyinkronkan waktu shalat...</span>
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-1 sm:gap-3 md:gap-4">
                {prayerList.map((item, idx) => {
                  const waktuJam = getPrayerTime(item.key);
                  const isNext = item.key === prayerInfo.nextKey;
                  const Icon = item.icon;

                  return (
                    <div
                      key={idx}
                      className={`group relative rounded-xl sm:rounded-2xl p-1.5 sm:p-4 text-center transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between ${
                        isNext
                          ? 'border-2 border-emerald-500 bg-gradient-to-b from-emerald-50 via-emerald-100/40 to-white shadow-md shadow-emerald-700/15 ring-1 sm:ring-2 ring-emerald-500/20'
                          : 'border border-slate-200/80 bg-slate-50/70 hover:border-emerald-300 hover:bg-white hover:shadow-md'
                      }`}
                    >
                      {/* Badge / Tag 'Berikutnya' jika aktif */}
                      <div className="mb-1 sm:mb-2 h-3.5 sm:h-5 flex items-center justify-center">
                        {isNext ? (
                          <span className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-emerald-600 px-1 sm:px-2 py-0.5 text-[7px] sm:text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                            <span className="h-1 w-1 rounded-full bg-emerald-200 animate-ping" />
                            <span className="hidden xs:inline">Next</span>
                            <span className="xs:hidden">✓</span>
                          </span>
                        ) : (
                          <span className="hidden sm:block text-[10px] font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-700 transition-colors truncate">
                            {item.desc}
                          </span>
                        )}
                      </div>

                      {/* Icon Waktu Shalat */}
                      <div className="mx-auto mb-1 sm:mb-2.5 flex h-7 w-7 sm:h-11 sm:w-11 items-center justify-center rounded-lg sm:rounded-xl transition-transform group-hover:scale-110">
                        <div
                          className={`flex h-full w-full items-center justify-center rounded-lg sm:rounded-xl ${
                            isNext
                              ? 'bg-emerald-600 text-white shadow-sm sm:shadow-md shadow-emerald-700/30'
                              : 'bg-white text-emerald-800 border border-slate-200/90 shadow-2xs group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-300'
                          }`}
                        >
                          <Icon size={14} className="sm:hidden" strokeWidth={isNext ? 2.5 : 2} />
                          <Icon size={20} className="hidden sm:block" strokeWidth={isNext ? 2.5 : 2} />
                        </div>
                      </div>

                      {/* Nama Shalat */}
                      <p
                        className={`text-[9px] sm:text-xs font-black uppercase tracking-tight sm:tracking-wider truncate ${
                          isNext ? 'text-emerald-950 font-black' : 'text-slate-700 group-hover:text-emerald-900'
                        }`}
                      >
                        {item.label}
                      </p>

                      {/* Jam Shalat */}
                      <p
                        className={`font-mono sm:font-serif-elegant mt-0.5 sm:mt-1 text-[11px] xs:text-xs sm:text-2xl md:text-3xl font-extrabold tracking-tight ${
                          isNext ? 'text-[#0a1f18] font-black' : 'text-slate-800 group-hover:text-[#0a1f18]'
                        }`}
                      >
                        {waktuJam}
                      </p>

                      {/* WIB Label */}
                      <div className="mt-0.5 sm:mt-1 flex items-center justify-center">
                        <span
                          className={`inline-block text-[7px] sm:text-[10px] font-bold px-1 sm:px-2 py-0.2 sm:py-0.5 rounded ${
                            isNext
                              ? 'bg-emerald-200/70 text-emerald-900 font-extrabold'
                              : 'bg-slate-200/60 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-800'
                          }`}
                        >
                          WIB
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Note bawah */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl bg-slate-50 px-4 py-3 border border-slate-200/60 text-center sm:text-left text-xs text-slate-500">
              <p className="flex items-center gap-1.5 font-medium">
                <Compass size={15} className="text-[#0d8a5e] shrink-0" />
                <span>
                  Waktu adzan disinkronkan otomatis sesuai koordinat Kp. Jalan Cagak, Desa Lagadar.
                </span>
              </p>
              <a
                href="#khutbah"
                className="font-bold text-[#0d8a5e] hover:text-emerald-700 hover:underline flex items-center gap-1 shrink-0"
              >
                <span>Lihat Jadwal Kajian & Khutbah</span>
                <ArrowRight size={13} />
              </a>
            </div>
          </div>
        </section>

        {/* --- PROFIL, VISI & MISI MASJID --- */}
        <section id="profil" className="scroll-mt-24">
          <div className="rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] bg-white p-4 sm:p-7 md:p-12 border border-slate-200/80 shadow-xl shadow-slate-200/40">
            <div className="grid gap-4 sm:gap-7 lg:grid-cols-12 lg:items-center">
              {/* Kiri: Deskripsi Sejarah */}
              <div className="space-y-2 sm:space-y-4 lg:col-span-7">
                <div className="flex items-center gap-2 text-[10px] font-black tracking-widest text-[#0d8a5e] uppercase">
                  <span className="h-px w-4 bg-[#0d8a5e]" /> Tentang Masjid
                </div>
                <h2 className="font-serif-elegant text-lg sm:text-2xl md:text-4xl lg:text-5xl font-bold leading-snug sm:leading-tight text-[#0a1f18]">
                  Pusat Ibadah, Pembinaan Umat & Penguat Ukhuwah
                </h2>
                <div className="space-y-2 text-xs sm:text-sm md:text-base leading-relaxed text-slate-600 font-medium">
                  <p>
                    Masjid {identitas?.nama || 'Al-Mukhlisin'} hadir sebagai pusat ibadah dan pembinaan umat di kawasan
                    Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar. Mengusung konsep transparansi modern berbasis teknologi, kami berdedikasi
                    untuk menghadirkan akuntabilitas penuh bagi setiap donasi jamaah.
                  </p>
                  <p className="hidden sm:block">
                    Selama bertahun-tahun, masjid ini telah menjadi rumah bagi berbagai kegiatan dakwah, pendidikan TPA,
                    dan santunan sosial masyarakat, menginspirasi ribuan jamaah untuk saling tolong-menolong sesuai
                    tuntunan Al-Qur'an dan As-Sunnah.
                  </p>
                </div>
              </div>

              {/* Kanan: Visi & Misi */}
              <div className="space-y-2.5 sm:space-y-3.5 lg:col-span-5">
                {/* Visi */}
                <div className="group rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4.5 transition-all hover:bg-white hover:shadow-md hover:shadow-emerald-900/5">
                  <div className="mb-1.5 sm:mb-2 flex items-center gap-2 sm:gap-2.5">
                    <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white text-[#0d8a5e] shadow-xs">
                      <Eye size={15} className="sm:hidden" />
                      <Eye size={18} className="hidden sm:block" />
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#0a1f18]">Visi Masjid</h3>
                  </div>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-slate-500 font-medium">
                    Menjadi masjid mandiri, pelopor pembangunan peradaban islami yang rahmatan lil 'alamin dan unggul
                    dalam pelayanan umat.
                  </p>
                </div>

                {/* Misi */}
                <div className="group rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50/80 p-3 sm:p-4.5 transition-all hover:bg-white hover:shadow-md hover:shadow-emerald-900/5">
                  <div className="mb-1.5 sm:mb-2 flex items-center gap-2 sm:gap-2.5">
                    <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white text-[#0d8a5e] shadow-xs">
                      <Target size={15} className="sm:hidden" />
                      <Target size={18} className="hidden sm:block" />
                    </div>
                    <h3 className="text-xs sm:text-sm md:text-base font-bold text-[#0a1f18]">Misi Masjid</h3>
                  </div>
                  <ul className="space-y-1 sm:space-y-1.5 text-[11px] sm:text-xs leading-snug sm:leading-relaxed text-slate-500 font-medium">
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="text-[#0d8a5e] font-bold shrink-0 mt-0.5">✓</span>
                      <span>Mewujudkan masjid sebagai rumah ruhani dan pusat kebangkitan masyarakat.</span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="text-[#0d8a5e] font-bold shrink-0 mt-0.5">✓</span>
                      <span>Membina generasi qur'ani berakhlak mulia dan berwawasan luas.</span>
                    </li>
                    <li className="flex items-start gap-1.5 sm:gap-2">
                      <span className="text-[#0d8a5e] font-bold shrink-0 mt-0.5">✓</span>
                      <span>Menerapkan tata kelola keuangan kas dan inventaris transparan real-time.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- 2. KHUTBAH & KAJIAN --- */}
        <section id="khutbah" className="scroll-mt-16">
          <div className="mb-6 md:mb-10 text-center md:text-left">
            <div>
              <p className="mb-2 text-[10px] font-black tracking-widest text-[#d4af37] uppercase">Syiar Agama</p>
              <h2 className="font-serif-elegant text-2xl sm:text-3xl font-bold text-[#0a1f18] md:text-5xl">
                Majelis Ilmu & Khutbah
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500">
                Jadwal kajian dan ceramah terdekat untuk mempertebal keimanan dan wawasan keislaman.
              </p>
            </div>
          </div>

          {/* Highlight Petugas Shalat Jumat Terdekat */}
          {nextJumat && (
            <div className="mb-8 md:mb-12 overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-100/90 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/40 p-4 sm:p-6 md:p-7 shadow-lg shadow-emerald-950/5">
              {/* Header Card: 1 baris rapi dan proporsional di mobile & desktop */}
              <div className="flex items-center justify-between gap-2.5 pb-3.5 border-b border-emerald-100/70">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl bg-[#0d8a5e] text-white flex items-center justify-center shadow-md shadow-emerald-700/20 shrink-0">
                    <UserCheck size={18} className="sm:hidden" />
                    <UserCheck size={22} className="hidden sm:block" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-lg text-[#0a1f18] truncate">
                        Petugas Shalat Jumat
                      </h3>
                      <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-extrabold bg-emerald-100 text-[#0d8a5e] border border-emerald-200 shrink-0">
                        Pekan Ini
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                      <CalendarDays size={12} className="text-[#0d8a5e] shrink-0" />
                      <span className="truncate">
                        Jumat, {new Date(nextJumat.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </span>
                    </p>
                  </div>
                </div>

                <Link
                  href="/agenda"
                  className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-[#0d8a5e] hover:text-emerald-800 transition-colors bg-white px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border border-emerald-200/80 shadow-2xs hover:shadow-xs shrink-0"
                >
                  <span>Agenda</span>
                  <ArrowRight size={12} />
                </Link>
              </div>

              {/* Tampilan Mobile: 3 Baris Kompak & Elegan (Hemat ruang & nama tidak terpotong) */}
              <div className="space-y-2 sm:hidden pt-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-100/80 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#0d8a5e] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 shrink-0">
                      Khotib
                    </span>
                    <span className="text-[11px] text-slate-400">Penceramah</span>
                  </div>
                  <span className="font-bold text-xs text-[#0a1f18] text-right truncate max-w-[170px]">{nextJumat.khatib}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-100/80 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60 shrink-0">
                      Imam
                    </span>
                    <span className="text-[11px] text-slate-400">Imam Shalat</span>
                  </div>
                  <span className="font-bold text-xs text-[#0a1f18] text-right truncate max-w-[170px]">{nextJumat.imam || nextJumat.khatib}</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-emerald-100/80 shadow-2xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60 shrink-0">
                      Muadzin
                    </span>
                    <span className="text-[11px] text-slate-400">Adzan</span>
                  </div>
                  <span className="font-bold text-xs text-[#0a1f18] text-right truncate max-w-[170px]">{nextJumat.muadzin || '-'}</span>
                </div>
              </div>

              {/* Tampilan Desktop & Tablet: Grid 3 Kolom Mewah */}
              <div className="hidden sm:grid sm:grid-cols-3 gap-3 sm:gap-4 pt-4">
                <div className="rounded-xl sm:rounded-2xl bg-white p-3.5 sm:p-4 border border-emerald-100/70 shadow-2xs transition-all hover:border-[#0d8a5e]/30 hover:shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Khotib Jumat</span>
                  <p className="font-bold text-[#0a1f18] text-sm sm:text-base mt-1 line-clamp-1">{nextJumat.khatib}</p>
                  <p className="text-[11px] text-[#0d8a5e] font-semibold mt-1">Penceramah Utama</p>
                </div>
                <div className="rounded-xl sm:rounded-2xl bg-white p-3.5 sm:p-4 border border-emerald-100/70 shadow-2xs transition-all hover:border-[#0d8a5e]/30 hover:shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Imam Shalat</span>
                  <p className="font-bold text-[#0a1f18] text-sm sm:text-base mt-1 line-clamp-1">{nextJumat.imam || nextJumat.khatib}</p>
                  <p className="text-[11px] text-[#0d8a5e] font-semibold mt-1">Imam Rawatib / Tamu</p>
                </div>
                <div className="rounded-xl sm:rounded-2xl bg-white p-3.5 sm:p-4 border border-emerald-100/70 shadow-2xs transition-all hover:border-[#0d8a5e]/30 hover:shadow-xs">
                  <span className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Muadzin</span>
                  <p className="font-bold text-[#0a1f18] text-sm sm:text-base mt-1 line-clamp-1">{nextJumat.muadzin || '-'}</p>
                  <p className="text-[11px] text-[#0d8a5e] font-semibold mt-1">Adzan & Pengumuman</p>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Header Kajian & Indikator Geser khusus mobile */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-800">
              Agenda Kajian & Khutbah
            </h3>
            {jadwal.length > 1 && (
              <span className="inline-flex md:hidden items-center justify-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                <span>Geser ke samping</span>
                <ArrowRight size={11} />
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center font-bold text-slate-400 py-12 flex justify-center items-center gap-2">
              <RefreshCw size={20} className="animate-spin text-emerald-600" />
              <span>Memuat agenda majelis ilmu...</span>
            </div>
          ) : (
            <div className="flex overflow-x-auto gap-3.5 pb-4 pt-1 snap-x snap-mandatory scrollbar-none -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-8 md:overflow-visible md:pb-0">
              {jadwal.length > 0 ? (
                jadwal.map((item, i) => (
                  <div
                    key={i}
                    onClick={() => setSelectedKajian(item)}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] border border-slate-200/90 bg-white shadow-xs transition-all hover:-translate-y-1 hover:border-[#0d8a5e]/30 hover:shadow-xl w-[250px] sm:w-[280px] md:w-auto shrink-0 snap-start justify-between"
                  >
                    {/* AREA GAMBAR KHATIB */}
                    <div className="relative h-36 sm:h-44 md:h-56 w-full overflow-hidden bg-slate-900 shrink-0">
                      <KajianCardMedia item={item} />

                      {/* Overlay status HANYA ditampilkan jika menggunakan foto kustom */}
                      {isCustomPosterImage(item.image) && (
                        <div className="absolute top-3 right-3 md:top-4 md:right-4 z-20">
                          <span
                            className={`rounded-full px-2.5 py-1 md:px-3.5 md:py-1.5 text-[8px] font-black tracking-widest uppercase backdrop-blur-md ${
                              item.status === 'terjadwal'
                                ? 'bg-indigo-600/90 text-white'
                                : item.status === 'selesai'
                                ? 'bg-emerald-600/90 text-white'
                                : 'bg-red-500/90 text-white'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* KONTEN TEXT */}
                    <div className="flex flex-col p-4 sm:p-5 md:p-7 flex-1 justify-between">
                      <div>
                        <div className="mb-2 md:mb-3 flex items-center gap-2">
                          <div className="inline-flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg bg-emerald-50 text-[#0d8a5e] transition-colors group-hover:bg-[#0d8a5e] group-hover:text-white shrink-0">
                            <CalendarDays size={14} />
                          </div>
                          <p className="text-[9px] md:text-[10px] font-black tracking-widest text-[#0d8a5e] uppercase">
                            {item.jenis_kegiatan}
                          </p>
                        </div>

                        <h3 className="font-serif-elegant text-base sm:text-lg md:text-xl font-bold text-[#0a1f18] line-clamp-1 mb-1">
                          {item.khotib}
                        </h3>

                        <p className="text-xs text-slate-500 line-clamp-2 italic font-medium leading-relaxed">
                          &ldquo;{item.tema || 'Tema kajian insya Allah disampaikan pada sesi majelis'}&rdquo;
                        </p>
                      </div>

                      <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-[10px] md:text-[11px] font-bold text-slate-500 flex items-center gap-1.5">
                          <span>
                            {new Date(item.tanggal).toLocaleDateString('id-ID', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                          {item.waktu && (
                            <span className="text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-mono text-[9px] font-bold">
                              {item.waktu} WIB
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] md:text-[11px] font-bold text-[#0d8a5e] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Detail <ArrowRight size={12} />
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full col-span-3 text-center p-8 md:p-12 text-slate-400 bg-white rounded-2xl md:rounded-3xl border border-slate-100 text-xs sm:text-sm">
                  Belum ada jadwal kajian terbaru.
                </div>
              )}
            </div>
          )}

          {/* MODAL DETAIL KAJIAN */}
          {selectedKajian && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
                onClick={() => setSelectedKajian(null)}
              />

              <div
                className="animate-pop relative z-10 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-2xl sm:rounded-[2.5rem] bg-white shadow-2xl md:flex-row md:overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedKajian(null)}
                  className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition-colors"
                >
                  <X size={18} />
                </button>

                <div className="h-64 w-full shrink-0 overflow-hidden bg-slate-900 md:h-auto md:w-1/2">
                  <KajianModalMedia item={selectedKajian} />
                </div>

                <div className="flex flex-col justify-between overflow-y-auto p-8 md:w-1/2">
                  <div>
                    <span className="rounded-lg bg-emerald-50 px-3 py-1 text-[9px] font-black tracking-widest text-[#0d8a5e] uppercase">
                      {selectedKajian.jenis_kegiatan}
                    </span>
                    <h3 className="font-serif-elegant mt-3 mb-2 text-2xl font-bold text-[#0a1f18]">
                      {selectedKajian.khotib}
                    </h3>
                    <div className="my-4 space-y-3">
                      <div>
                        <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Tema Ceramah</p>
                        <p className="text-sm font-medium text-slate-700 italic mt-0.5">
                          "{selectedKajian.tema || 'Tema kajian belum ditentukan'}"
                        </p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Waktu & Tanggal</p>
                        <p className="text-xs font-bold text-slate-800 mt-0.5">
                          {new Date(selectedKajian.tanggal).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                          {selectedKajian.waktu && ` • Pukul ${selectedKajian.waktu} WIB`}
                        </p>
                      </div>
                      {selectedKajian.link && (
                        <div>
                          <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Tautan Siaran</p>
                          <a
                            href={selectedKajian.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-emerald-600 hover:underline break-all"
                          >
                            {selectedKajian.link}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedKajian(null)}
                    className="mt-6 w-full rounded-2xl bg-[#0a1f18] py-3.5 text-xs font-black tracking-widest text-white transition-all hover:bg-[#0d8a5e] active:scale-95"
                  >
                    TUTUP DETAIL
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* --- 3. INVENTARIS / FASILITAS SLIDE --- */}
        <section id="fasilitas" className="scroll-mt-32 overflow-hidden">
          <div className="relative overflow-hidden min-h-[260px] sm:min-h-[360px] md:min-h-[400px] rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] bg-[#0a1f18] text-white shadow-2xl transition-all duration-700">
            {/* Tombol Manual Slide */}
            <div className="absolute right-4 sm:right-8 bottom-3 sm:bottom-6 z-30 flex gap-1.5 sm:gap-2">
              <button
                onClick={() => setActiveSlide(0)}
                className={`h-2 sm:h-2.5 rounded-full transition-all ${activeSlide === 0 ? 'w-6 sm:w-8 bg-[#d4af37]' : 'w-2 sm:w-2.5 bg-white/20'}`}
                title="Ringkasan Fasilitas"
              />
              <button
                onClick={() => setActiveSlide(1)}
                className={`h-2 sm:h-2.5 rounded-full transition-all ${activeSlide === 1 ? 'w-6 sm:w-8 bg-[#d4af37]' : 'w-2 sm:w-2.5 bg-white/20'}`}
                title="Tabel Aset Fisik"
              />
            </div>

            {/* SLIDE 1: Ringkas Inventaris */}
            <div
              className={`flex flex-col transition-all duration-700 md:flex-row w-full min-h-[260px] sm:min-h-[360px] md:min-h-[400px] ${
                activeSlide === 0
                  ? 'translate-x-0 opacity-100'
                  : 'pointer-events-none absolute inset-0 -translate-x-full opacity-0'
              }`}
            >
              <div className="relative z-10 flex-1 p-4 sm:p-8 md:p-12 lg:p-14 flex flex-col justify-center">
                <p className="mb-2 sm:mb-4 flex items-center gap-2 text-[10px] font-black tracking-widest text-[#d4af37] uppercase">
                  <span className="h-px w-4 sm:w-6 bg-[#d4af37]" /> Manajemen Fasilitas
                </p>
                <h2 className="font-serif-elegant mb-2 sm:mb-4 text-lg sm:text-2xl md:text-3xl lg:text-5xl leading-tight font-bold">
                  Kenyamanan Ibadah <br className="hidden sm:block" /> Jamaah Selalu Terjaga
                </h2>
                <p className="max-w-lg text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                  Kami merawat aset fisik dan sarana penunjang ibadah secara berkala. Seluruh aset terinventarisasi
                  secara teratur untuk memastikan operasional masjid senantiasa optimal dan transparan bagi seluruh jamaah.
                </p>
              </div>

              <div className="flex items-center justify-center bg-[#071510] p-4 sm:p-8 md:p-10 md:w-1/3 self-stretch rounded-b-2xl sm:rounded-b-[2.5rem] md:rounded-b-none md:rounded-r-[2.5rem] lg:rounded-r-[3rem]">
                <div className="text-center py-2 sm:py-0">
                  <p className="font-serif-elegant text-5xl sm:text-7xl md:text-8xl font-bold text-white">
                    {totalFasilitas}
                  </p>
                  <p className="mt-1.5 sm:mt-3 border-t border-[#0d8a5e]/30 pt-2 sm:pt-3 text-[10px] font-black tracking-widest text-[#0d8a5e] uppercase">
                    Aset Utama Tercatat
                  </p>
                  <div className="mt-3.5 sm:mt-6 flex flex-col items-center gap-1.5 sm:gap-2">
                    <button
                      onClick={() => setActiveSlide(1)}
                      className="text-[11px] sm:text-xs font-bold text-[#d4af37] hover:text-white uppercase tracking-wider underline flex items-center justify-center gap-1 transition-colors"
                    >
                      Buka Pratinjau Aset <ArrowRight size={11} />
                    </button>
                    <Link
                      href="/fasilitas"
                      className="text-[11px] sm:text-xs font-bold text-emerald-400 hover:text-white uppercase tracking-wider flex items-center justify-center gap-1 bg-emerald-950/60 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full border border-emerald-800/40 hover:bg-emerald-900/60 transition-colors"
                    >
                      <span>Lihat Halaman Detail Penuh</span>
                      <ExternalLink size={10} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* SLIDE 2: Tabel Fasilitas Lengkap */}
            <div
              className={`p-4 sm:p-8 md:p-12 pb-12 sm:pb-12 transition-all duration-700 ${
                activeSlide === 1
                  ? 'translate-x-0 opacity-100'
                  : 'pointer-events-none absolute inset-0 translate-x-full opacity-0'
              }`}
            >
              <div className="mb-3.5 sm:mb-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-black tracking-widest text-[#d4af37] uppercase">Daftar Terverifikasi</p>
                  <h2 className="font-serif-elegant text-lg sm:text-2xl font-bold md:text-3xl text-white">Inventaris Fasilitas</h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href="/fasilitas"
                    className="inline-flex items-center gap-1 rounded-full bg-[#0d8a5e] px-3 py-1.5 text-[11px] sm:text-xs font-bold text-white hover:bg-emerald-500 shadow-md transition-all active:scale-95 whitespace-nowrap"
                  >
                    <span>Buka Halaman Detail</span>
                    <ArrowRight size={12} />
                  </Link>
                  <button
                    onClick={() => setActiveSlide(0)}
                    className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] sm:text-xs font-bold text-white hover:bg-white/20 transition-colors whitespace-nowrap"
                  >
                    Kembali ke Ringkasan
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xs">
                <table className="w-full text-left text-[11px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                      <th className="px-2.5 py-2.5 sm:p-4">Nama Barang</th>
                      <th className="px-2 py-2.5 sm:p-4 text-center">Jumlah</th>
                      <th className="px-2 py-2.5 sm:p-4 text-center">Kondisi</th>
                      <th className="px-2.5 py-2.5 sm:p-4">Lokasi<span className="hidden sm:inline"> Penempatan</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {fasilitas.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 px-3 text-center text-xs text-slate-400">
                          Belum ada data inventaris yang tercatat. Buka halaman detail untuk informasi selengkapnya.
                        </td>
                      </tr>
                    ) : (
                      fasilitas.slice(0, 5).map((item, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="px-2.5 py-2.5 sm:p-4 font-bold text-white">{item.nama_barang}</td>
                          <td className="px-2 py-2.5 sm:p-4 text-center font-mono whitespace-nowrap">{item.jumlah} Unit</td>
                          <td className="px-2 py-2.5 sm:p-4 text-center">
                            <span
                              className={`rounded-md px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] font-black uppercase ${
                                item.kondisi === 'baik'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-amber-500/20 text-amber-300'
                              }`}
                            >
                              {item.kondisi}
                            </span>
                          </td>
                          <td className="px-2.5 py-2.5 sm:p-4 text-slate-300 truncate max-w-[85px] sm:max-w-none">{item.lokasi || '-'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* --- 4. TRANSPARANSI KEUANGAN SLIDE --- */}
        <section id="keuangan" className="scroll-mt-32 overflow-hidden">
          <div className="relative min-h-[420px] rounded-[2.5rem] bg-[#0d8a5e] p-6 text-center text-white shadow-2xl transition-all duration-700 md:rounded-[3rem] md:p-12 lg:p-16">
            {/* Background Icon Decor */}
            <div className="pointer-events-none absolute -top-8 -right-8 opacity-10 mix-blend-overlay">
              <Wallet size={280} />
            </div>

            {/* Indicator Slide */}
            <div className="absolute right-8 bottom-6 z-30 flex gap-2">
              <button
                onClick={() => setActiveKeuanganSlide(0)}
                className={`h-2.5 rounded-full transition-all ${
                  activeKeuanganSlide === 0 ? 'w-8 bg-white' : 'w-2.5 bg-white/30'
                }`}
                title="Saldo Kas"
              />
              <button
                onClick={() => setActiveKeuanganSlide(1)}
                className={`h-2.5 rounded-full transition-all ${
                  activeKeuanganSlide === 1 ? 'w-8 bg-white' : 'w-2.5 bg-white/30'
                }`}
                title="Arus Kas Terbaru"
              />
            </div>

            {/* SLIDE 1: TOTAL SALDO */}
            <div
              className={`transition-all duration-700 ${
                activeKeuanganSlide === 0
                  ? 'relative z-10 scale-100 opacity-100'
                  : 'pointer-events-none absolute inset-0 scale-95 opacity-0'
              }`}
            >
              <p className="mb-4 flex items-center justify-center gap-3 text-[10px] font-black tracking-widest text-emerald-100 uppercase">
                <span className="h-px w-6 bg-emerald-200" /> Transparansi Terbuka Real-Time{' '}
                <span className="h-px w-6 bg-emerald-200" />
              </p>
              <h2 className="font-serif-elegant mb-6 text-3xl font-bold md:text-5xl">
                Total Saldo Kas Umat
              </h2>

              {loading ? (
                <div className="mx-auto h-20 w-3/4 animate-pulse rounded-3xl bg-emerald-700/50" />
              ) : (
                <div className="inline-block rounded-3xl border border-emerald-400/40 bg-emerald-900/30 px-8 py-6 backdrop-blur-xs shadow-xl">
                  <p className="font-serif-elegant text-4xl font-bold tracking-tight drop-shadow-lg md:text-6xl">
                    <span className="mr-2 align-top text-xl text-emerald-300 md:text-3xl">Rp</span>
                    {saldo.toLocaleString('id-ID')}
                  </p>
                </div>
              )}

              <p className="mx-auto mt-7 max-w-md text-xs leading-relaxed font-medium text-emerald-50 opacity-80 md:text-sm">
                Dana diperbarui secara otomatis. Setiap rupiah yang disalurkan melalui infaq dan sedekah tercatat
                dengan amanah demi kemakmuran masjid dan jamaah.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/keuangan"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-black text-emerald-950 hover:bg-emerald-100 transition-all shadow-lg hover:shadow-xl active:scale-95"
                >
                  <span>Buka Halaman Detail Transparansi</span>
                  <ArrowRight size={14} />
                </Link>

                <button
                  onClick={() => setActiveKeuanganSlide(1)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-4 py-2.5 text-xs font-bold text-white transition-colors"
                >
                  Lihat 4 Aliran Terakhir <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* SLIDE 2: TABEL TRANSAKSI TERAKHIR */}
            <div
              className={`transition-all duration-700 ${
                activeKeuanganSlide === 1
                  ? 'relative z-10 translate-y-0 opacity-100'
                  : 'pointer-events-none absolute inset-0 translate-y-10 opacity-0'
              }`}
            >
              <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-3xl mx-auto">
                <div>
                  <p className="text-[10px] font-black tracking-widest text-emerald-200 uppercase">Aktivitas Terakhir</p>
                  <h2 className="font-serif-elegant text-2xl font-bold md:text-4xl">Aliran Arus Kas</h2>
                </div>
                <Link
                  href="/keuangan"
                  className="inline-flex items-center gap-1.5 rounded-full bg-white/15 hover:bg-white/25 px-4 py-2 text-xs font-bold text-white transition-colors self-start sm:self-auto"
                >
                  <span>Lihat Seluruh Mutasi Kas</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-white/15 bg-emerald-900/40 backdrop-blur-md">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-emerald-800/60 text-[9px] font-black tracking-widest text-emerald-200 uppercase">
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3">Keterangan</th>
                        <th className="px-4 py-3 text-right">Nominal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {dataKeuangan.slice(0, 4).map((trx, idx) => (
                        <tr key={idx} className="transition-colors hover:bg-white/5">
                          <td className="px-4 py-3 font-medium opacity-75">{trx.tanggal}</td>
                          <td className="max-w-[180px] truncate px-4 py-3 font-bold md:max-w-xs">
                            {trx.keterangan}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-black ${
                              trx.tipe === 'masuk' ? 'text-emerald-200' : 'text-red-200'
                            }`}
                          >
                            {trx.tipe === 'masuk' ? '+' : '-'} Rp {Number(trx.nominal).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={() => setActiveKeuanganSlide(0)}
                className="mt-6 text-xs font-bold text-white/80 hover:text-white underline underline-offset-4"
              >
                ← Kembali ke Total Saldo
              </button>
            </div>
          </div>
        </section>

        {/* --- 5. KOTAK SARAN & ASPIRASI JAMAAH --- */}
        <section id="saran" className="scroll-mt-40 md:scroll-mt-48">
          <div data-theme="dark" className="rounded-[2.5rem] md:rounded-[3rem] bg-gradient-to-br from-[#0a1f18] via-[#0f2e24] to-[#164436] p-6 sm:p-10 md:p-14 text-white shadow-2xl border border-emerald-900/60 relative overflow-hidden">
            {/* Background pattern decor */}
            <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="pointer-events-none absolute -bottom-10 -right-10 opacity-10">
              <MessageSquareHeart size={300} />
            </div>

            <div className="relative z-10 space-y-10">
              {/* Header Section */}
              <div className="text-center max-w-2xl mx-auto space-y-3">
                <p className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-black tracking-widest text-[#d4af37] uppercase">
                  <MessageSquareHeart size={13} />
                  <span>Musyawarah & Aspirasi Jamaah</span>
                </p>
                <h2 className="font-serif-elegant text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                  Kotak Saran & Masukan Jamaah
                </h2>
                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-medium">
                  "Agama adalah nasehat." (HR. Muslim). Setiap masukan, kritik konstruktif, dan usulan jamaah sangat berharga demi kemakmuran dan kenyamanan ibadah bersama di Masjid {identitas?.nama || 'Al-Mukhlisin'}.
                </p>
              </div>

              {/* Two Column Grid: Left Form, Right Preview Respon DKM */}
              <div className="grid gap-8 lg:grid-cols-12 items-start">
                {/* Form Input (Left: 7 cols) */}
                <div className="lg:col-span-7 bg-white/10 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-white/15 shadow-xl">
                  <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-500/20 text-emerald-300 rounded-xl border border-emerald-400/30">
                        <Send size={18} />
                      </div>
                      <h3 className="font-bold text-base md:text-lg text-white">
                        Sampaikan Aspirasi Anda
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-700/50">
                      Bisa Anonim
                    </span>
                  </div>

                  {saranSuccess ? (
                    <div className="p-6 text-center space-y-3 bg-emerald-900/60 rounded-2xl border border-emerald-500/40">
                      <div className="w-12 h-12 bg-emerald-400 text-emerald-950 rounded-full flex items-center justify-center mx-auto shadow-lg">
                        <CheckCircle size={28} />
                      </div>
                      <h4 className="font-bold text-white text-base">Jazakallahu Khairan!</h4>
                      <p className="text-xs text-emerald-200 leading-relaxed max-w-sm mx-auto">
                        Alhamdulillah, aspirasi Anda telah tersimpan dan akan segera ditinjau oleh pengurus DKM.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleKirimSaran} className="space-y-4">
                      {/* Opsi Kirim Sebagai Anonim */}
                      <div className="flex items-center justify-between p-3 rounded-2xl bg-black/20 border border-white/10">
                        <div className="text-xs">
                          <span className="font-bold text-white block">Kirim sebagai Anonim</span>
                          <span className="text-[10px] text-slate-300">
                            Nama tampil sebagai "Hamba Allah"
                          </span>
                        </div>
                        <input
                          type="checkbox"
                          checked={saranIsAnonim}
                          onChange={(e) => setSaranIsAnonim(e.target.checked)}
                          className="h-4 w-4 rounded-sm border-white/30 text-emerald-500 focus:ring-emerald-400 cursor-pointer"
                        />
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3">
                        {!saranIsAnonim ? (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-200 mb-1">
                              Nama Lengkap / Panggilan
                            </label>
                            <input
                              type="text"
                              value={saranNama}
                              onChange={(e) => setSaranNama(e.target.value)}
                              placeholder="Contoh: Pak Hendra / Ibu Siti"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-400 focus:bg-white/10"
                            />
                          </div>
                        ) : (
                          <div>
                            <label className="block text-[11px] font-bold text-slate-200 mb-1">
                              Nama Pengirim
                            </label>
                            <input
                              type="text"
                              disabled
                              value="Hamba Allah"
                              className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs text-slate-400 font-medium cursor-not-allowed"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-[11px] font-bold text-slate-200 mb-1">
                            No. WhatsApp (Opsional)
                          </label>
                          <input
                            type="tel"
                            value={saranNoHp}
                            onChange={(e) => setSaranNoHp(e.target.value)}
                            placeholder="Contoh: 081234567890"
                            className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-400 focus:bg-white/10"
                          />
                        </div>
                      </div>

                      <CustomDropdown
                        label="Kategori Aspirasi"
                        theme="dark"
                        value={saranKategori}
                        onChange={(val) => setSaranKategori(val as KategoriSaran)}
                        options={saranDropdownOptions}
                      />

                      <div>
                        <label className="block text-[11px] font-bold text-slate-200 mb-1">
                          Isi Masukan, Saran, atau Kritik Konstruktif <span className="text-[#d4af37]">*</span>
                        </label>
                        <textarea
                          required
                          rows={3}
                          value={saranPesan}
                          onChange={(e) => setSaranPesan(e.target.value)}
                          placeholder="Tuliskan saran atau masukan Anda dengan bahasa santun demi perbaikan bersama..."
                          className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-emerald-400 focus:bg-white/10"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={saranSubmitting || !saranPesan.trim()}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-[#0d8a5e] hover:brightness-110 text-white font-bold text-xs tracking-wide shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Send size={14} />
                        <span>{saranSubmitting ? 'Mengirimkan...' : 'Kirim Aspirasi Sekarang'}</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* Preview Cuplikan Respon DKM & Aspirasi Masuk (Right: 5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black tracking-widest text-[#d4af37] uppercase">
                        Aspirasi Jamaah
                      </p>
                      <h3 className="font-serif-elegant text-xl font-bold text-white">
                        Masukan & Respon Terkini
                      </h3>
                    </div>
                    <Link
                      href="/saran"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white underline underline-offset-4"
                    >
                      <span>Lihat Semua</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  {saranList.length === 0 ? (
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10 text-center text-xs text-slate-300">
                      Belum ada aspirasi masuk. Sampaikan masukan atau saran pertama Anda melalui formulir di samping.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {saranList.slice(0, 2).map((item) => (
                        <div
                          key={item.id}
                          className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3 hover:border-emerald-400/40 transition-colors"
                        >
                          <div className="flex items-center justify-between text-[11px] gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-bold text-white truncate">{item.nama}</span>
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-white/10 text-emerald-300 shrink-0">
                                {item.kategori}
                              </span>
                            </div>
                            {item.tanggapan_dkm ? (
                              <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <CheckCircle size={10} /> Direspon
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-amber-300 bg-amber-950/70 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                <Clock size={10} /> Ditinjau
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-200 italic font-medium line-clamp-2">
                            "{item.pesan}"
                          </p>

                          {item.tanggapan_dkm ? (
                            <div className="bg-emerald-950/70 p-3 rounded-xl border border-emerald-500/30 space-y-1">
                              <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                                <ShieldCheck size={12} className="text-emerald-400" />
                                <span>Tanggapan Resmi DKM</span>
                              </div>
                              <p className="text-xs text-white leading-relaxed font-medium line-clamp-3">
                                {item.tanggapan_dkm}
                              </p>
                            </div>
                          ) : (
                            <div className="bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/20 flex items-center gap-2 text-[10px] text-amber-200">
                              <Clock size={11} className="text-amber-400 shrink-0" />
                              <span>Aspirasi ini telah masuk dan sedang dipelajari oleh pengurus DKM.</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Link
                    href="/saran"
                    className="block w-full py-3.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 text-center text-xs font-bold text-emerald-200 hover:text-white border border-white/15 transition-all shadow-md"
                  >
                    Buka Halaman Khusus Saran & Kritik Jamaah &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-200 bg-white pt-14 sm:pt-20 pb-28 md:pb-10">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-16 grid gap-12 lg:grid-cols-12">
            {/* Info Masjid */}
            <div className="lg:col-span-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-[#0a1f18] border border-emerald-900/40 flex items-center justify-center shadow-sm overflow-hidden">
                  <img
                    src={identitas?.logo_url || '/icon.svg'}
                    alt={identitas?.nama || "Masjid Al-Mukhlisin"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="font-serif-elegant text-2xl md:text-3xl font-bold text-[#0a1f18] block leading-none">
                  {identitas?.nama || 'Al-Mukhlisin'}
                </span>
              </div>
              <p className="mb-8 max-w-md text-sm leading-relaxed font-medium text-slate-500">
                Menjadi pusat ibadah yang makmur, melayani jamaah dengan sistem modern, transparansi penuh, dan
                berlandaskan Al-Qur'an serta As-Sunnah.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-600 transition-all hover:border-[#0d8a5e] hover:bg-[#0d8a5e] hover:text-white shadow-2xs"
                >
                  <Shield size={16} /> Portal Pengurus
                </Link>
                <Link
                  href="/saran"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-600 hover:text-white shadow-2xs"
                >
                  <MessageSquareHeart size={16} /> Kotak Saran
                </Link>
                <Link
                  href="/unduh"
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-gradient-to-r from-[#0a1f18] to-emerald-900 px-5 py-3 text-xs font-bold text-white shadow-md transition-all hover:from-emerald-700 hover:to-teal-600 hover:scale-105 active:scale-95"
                >
                  <Smartphone size={16} className="text-emerald-300" />
                  <span>Unduh Aplikasi APK</span>
                  <span className="rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-amber-950 uppercase">
                    Android
                  </span>
                </Link>
              </div>
            </div>

            {/* Kontak & Alamat */}
            <div className="lg:col-span-5">
              <h4 className="mb-6 font-bold text-[#0a1f18]">Informasi & Lokasi</h4>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm text-slate-500">
                  <MapPin className="mt-0.5 shrink-0 text-[#0d8a5e]" size={18} />
                  <div>
                    <span className="block font-medium text-slate-700">Kp. Jalan Cagak RT.005 RW.004 Desa Lagadar</span>
                    <span className="inline-block mt-1.5 font-mono text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      ID 01.4.13.04.06.000158
                    </span>
                  </div>
                </li>
                <li className="flex gap-3 text-sm text-slate-500">
                  <Clock className="mt-0.5 shrink-0 text-[#0d8a5e]" size={18} />
                  <span>Buka 24 Jam untuk Ibadah & Syiar</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 text-center md:flex-row md:text-left">
            <p className="text-xs font-bold text-slate-400">
              &copy; {currentYear} Masjid {identitas?.nama || 'Al-Mukhlisin'}. All rights reserved.
            </p>
            <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
              Sistem Informasi & Manajemen Masjid Terpadu
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Quick Action Button khusus Mobile */}
      <div className="fixed bottom-[5.5rem] right-4 z-40 md:hidden">
        <a
          href="#saran"
          className="flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-[#0d8a5e] text-white font-bold text-xs shadow-2xl shadow-emerald-950/50 hover:scale-105 active:scale-95 transition-all border border-emerald-400/40"
          title="Kirim Saran Jamaah"
        >
          <MessageSquareHeart size={16} />
          <span>Kotak Saran</span>
        </a>
      </div>

      {/* Mobile Bottom Navigation Bar (7 Tabs: Beranda, Kas, Jamaah, Agenda, Zakat, Aset, Laporan) */}
      <MobileBottomNav variant="public" />
    </div>
  );
}
