export const CURRENT_APP_VERSION = {
  version: '1.1.1',
  versionCode: 3,
  releaseDate: '2026-10-30',
  name: 'Al-Mukhlisin Mobile',
};

export interface RemoteVersionInfo {
  version: string;
  versionCode: number;
  releaseDate: string;
  apkUrl: string;
  directDownloadUrl?: string;
  changelog: string[];
  forceUpdate?: boolean;
}

const REMOTE_VERSION_URL =
  'https://raw.githubusercontent.com/dwkysss/masjid-al-mukhlisin/main/public/version.json';

export async function checkAppUpdate(): Promise<{
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: RemoteVersionInfo | null;
}> {
  try {
    const res = await fetch(`${REMOTE_VERSION_URL}?_t=${Date.now()}`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) {
      // Fallback local check
      const localRes = await fetch(`/version.json?_t=${Date.now()}`);
      if (localRes.ok) {
        const localData: RemoteVersionInfo = await localRes.json();
        return {
          hasUpdate: localData.versionCode > CURRENT_APP_VERSION.versionCode,
          currentVersion: CURRENT_APP_VERSION.version,
          latestVersion: localData,
        };
      }
      return {
        hasUpdate: false,
        currentVersion: CURRENT_APP_VERSION.version,
        latestVersion: null,
      };
    }

    const data: RemoteVersionInfo = await res.json();
    const hasUpdate = (data.versionCode || 0) > CURRENT_APP_VERSION.versionCode;

    return {
      hasUpdate,
      currentVersion: CURRENT_APP_VERSION.version,
      latestVersion: data,
    };
  } catch (error) {
    console.warn('Gagal memeriksa pembaruan aplikasi:', error);
    return {
      hasUpdate: false,
      currentVersion: CURRENT_APP_VERSION.version,
      latestVersion: null,
    };
  }
}

