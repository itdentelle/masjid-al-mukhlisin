import * as XLSX from 'xlsx';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

/**
 * Universal Excel exporter that works seamlessly on:
 * 1. Android APK (Capacitor Native via Filesystem & native Share dialog)
 * 2. Mobile Browsers (Chrome / Safari via Web Share API Level 2 or Blob)
 * 3. Desktop Browsers (Direct Blob download / XLSX.writeFile)
 */
export async function exportExcelFile(wb: XLSX.WorkBook, fileName: string): Promise<boolean> {
  const safeFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;

  // 1. Android / iOS Native App (Capacitor)
  if (Capacitor.isNativePlatform()) {
    try {
      const base64Data = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
      
      const savedFile = await Filesystem.writeFile({
        path: safeFileName,
        data: base64Data,
        directory: Directory.Cache,
      });

      await Share.share({
        title: safeFileName,
        files: [savedFile.uri],
        dialogTitle: 'Buka atau Simpan File Excel',
      });
      return true;
    } catch (nativeErr: any) {
      // If user dismissed share dialog, consider it completed without error
      if (
        nativeErr?.message?.includes('canceled') ||
        nativeErr?.message?.includes('cancelled') ||
        nativeErr?.name === 'AbortError'
      ) {
        return true;
      }
      console.warn('Native share failed, fallback to web download:', nativeErr);
    }
  }

  // 2. Mobile Browser / Desktop Web Browser
  try {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const blob = new Blob([wbout], { type: mimeType });

    // Web Share API with files (Android Chrome & iOS Safari on mobile)
    if (
      typeof window !== 'undefined' &&
      typeof navigator !== 'undefined' &&
      navigator.canShare &&
      typeof File !== 'undefined'
    ) {
      const file = new File([blob], safeFileName, { type: mimeType });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: safeFileName,
            text: `Laporan: ${safeFileName}`,
          });
          return true;
        } catch (shareErr: any) {
          if (shareErr.name === 'AbortError') {
            return true; // user cancelled dialog
          }
          console.warn('Web Share failed, fallback to anchor tag:', shareErr);
        }
      }
    }

    // 3. Desktop standard anchor download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', safeFileName);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 1500);
    return true;
  } catch (webErr) {
    console.error('Blob export failed, fallback to XLSX.writeFile:', webErr);
    try {
      XLSX.writeFile(wb, safeFileName);
      return true;
    } catch (xlsxErr) {
      console.error('Semua metode ekspor gagal:', xlsxErr);
      alert('Gagal mengunduh file Excel di perangkat ini.');
      return false;
    }
  }
}
