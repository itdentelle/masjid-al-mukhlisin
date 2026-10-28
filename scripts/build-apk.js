const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const outDownloads = path.join(rootDir, 'out/downloads');
const androidAssetsDownloads = path.join(rootDir, 'android/app/src/main/assets/public/downloads');
const jbrPath = 'C:\\Program Files\\Android\\Android Studio\\jbr';

function run(cmd, cwd = rootDir) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, JAVA_HOME: jbrPath } });
}

function cleanDownloads() {
  if (fs.existsSync(outDownloads)) {
    console.log('Cleaning out/downloads to prevent recursive APK bundle...');
    fs.rmSync(outDownloads, { recursive: true, force: true });
  }
  if (fs.existsSync(androidAssetsDownloads)) {
    console.log('Cleaning android assets downloads...');
    fs.rmSync(androidAssetsDownloads, { recursive: true, force: true });
  }
}

async function build() {
  console.log('=== 1. Building Next.js Static Export ===');
  run('npm run build');

  console.log('\n=== 2. Cleaning Download Folders (Preventing recursive APK) ===');
  cleanDownloads();

  console.log('\n=== 3. Syncing Capacitor Android ===');
  run('npx cap sync android');
  cleanDownloads();

  console.log('\n=== 4. Compiling Android APK with Gradle ===');
  const gradlewCmd = process.platform === 'win32' ? '.\\gradlew.bat assembleDebug' : './gradlew assembleDebug';
  run(gradlewCmd, path.join(rootDir, 'android'));

  console.log('\n=== 5. Copying APK to public/downloads ===');
  const sourceApk = path.join(rootDir, 'android/app/build/outputs/apk/debug/app-debug.apk');
  const destDir = path.join(rootDir, 'public/downloads');
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  const destApk = path.join(destDir, 'al-mukhlisin.apk');
  fs.copyFileSync(sourceApk, destApk);

  const stats = fs.statSync(destApk);
  const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
  console.log(`\n🎉 SUCCESS! APK ready at public/downloads/al-mukhlisin.apk`);
  console.log(`📦 Final Size: ${sizeMb} MB (Tanpa file APK di dalam APK!)`);
}

build().catch((err) => {
  console.error('\n❌ Build failed:', err);
  process.exit(1);
});
