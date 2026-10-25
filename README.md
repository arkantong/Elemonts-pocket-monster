# Elemonts

Prototipe game Android portrait: merawat, menangkap, mengoleksi, dan bertarung bersama monster di Nusaraya. Implementasi mengikuti dokumen konsep pengguna v1–v4 dan roster 37 bentuk monster.

[Unduh APK Android 0.1.4 (debug)](downloads/elemonts-0.1.4-debug.apk) · [SHA-256](downloads/SHA256SUMS). Di halaman file GitHub, gunakan tombol Download raw file. Paket ini untuk uji internal.

## Menjalankan game

Prasyarat: Node.js 24 dan npm. Tidak memerlukan API key.

```sh
npm ci
npm run dev
```

Preview: `http://localhost:5173`. Saat pertama dibuka, pilih English (pilihan awal) atau Bahasa Indonesia, lalu pilih salah satu dari lima starter. Bahasa bisa diganti langsung melalui Settings/Pengaturan → Language/Bahasa tanpa mereset progres. Pilihan bahasa disimpan terpisah di perangkat ini; impor cadangan game tidak menggantinya. Progres disimpan otomatis di perangkat/browser. Ekspor dan impor cadangan tersedia di Pengaturan. Jangan menghapus data aplikasi tanpa cadangan.

Petualangan baru wajib menyelesaikan latihan menangkap: Masuk Wild → Terjang → Tas → Mococapsule → Koleksi. Pertemuan latihan aman dan penangkapan pertamanya pasti berhasil. Progres setiap langkah tersimpan; setelah selesai, aturan Wild biasa berlaku. Save lama tetap dapat digunakan tanpa mengulang tutorial. Lihat [catatan tutorial menangkap](docs/qa/CAPTURE-TUTORIAL.md).

Untuk menjalankan hasil build, termasuk server Duel:

```sh
npm run build
npm start
```

Buka `http://localhost:3001`. Single-player APK bekerja offline; server hanya diperlukan untuk Duel. Build web juga memiliki service worker untuk pemakaian offline setelah aset selesai tersimpan.

## Android

Prasyarat: JDK 21 lengkap (termasuk javac), Android SDK platform 36 dan build-tools 36.0.0. Minimum Android 7/API 24. WebView yang mendukung WebGL diperlukan untuk model 3D; portrait 2D ditampilkan jika WebGL gagal dibuat.

```sh
npm run android:sync
cd android
./gradlew assembleDebug
```

Hasil: `android/app/build/outputs/apk/debug/app-debug.apk`. Atau `npm run android:open` untuk Android Studio. APK debug untuk uji internal; belum merupakan paket Play Store yang ditandatangani untuk rilis. Workflow GitHub Actions juga menyiapkan artifact APK setelah pengujian lulus.

Unduh APK di atas ke HP, buka berkasnya, lalu ikuti permintaan izin instalasi dari sumber tersebut bila Android menampilkannya. Android 7 atau lebih baru diperlukan.

Orientasi dikunci portrait. Aset, font dan suara disertakan dalam aplikasi. Tombol kembali Android menutup dialog terlebih dahulu. Ekspor cadangan Android menggunakan file cache dan share sheet native.

## Duel Wi-Fi lokal

1. Jalankan `npm run build` lalu `npm start` pada komputer yang berada di Wi-Fi yang sama dengan kedua HP. Server menampilkan alamat LAN, misalnya `http://192.168.1.10:3001`.
2. Di kedua HP, buka Arena → Duel dan isi alamat LAN tersebut.
3. Pilih maksimal empat monster. Pemain pertama membuat room, lalu membagikan kode enam angka.
4. Pemain kedua memasukkan kode dan bergabung. Server menyelesaikan giliran setelah kedua pemain mengirim pilihan.

Penyetaraan level 25 dapat dipilih pembuat room. Poin stat dan personality tetap berlaku; makanan/dekorasi tidak memengaruhi Duel. Duel tidak mengubah energi, HP permanen, EXP, atau gold. Putus koneksi mengakhiri Duel tanpa hadiah. Room kedaluwarsa setelah 30 menit tanpa aktivitas.

Versi ini membutuhkan server LAN pada komputer, belum host/discovery otomatis langsung dari HP. HTTP/WebSocket lokal diizinkan oleh konfigurasi Android. Server memvalidasi tim, aksi, dan giliran; simpanan offline bukan otoritas anti-cheat. Jangan mengekspos server prototipe ini sebagai layanan publik tanpa autentikasi dan pengamanan tambahan.

[Lihat contoh animasi battle 0.1.3](docs/qa/videos/battle-animation.mp4) · [Catatan animasi dan daftar skill](docs/qa/BATTLE-ANIMATION.md)

## Fitur yang dapat dimainkan

- Lima pilihan starter; rumah dengan monster 3D real-time, sapaan, animasi reaksi, makanan, dan efek suara opsional.
- 37 entri ensiklopedia; 35 bentuk dapat diperoleh melalui capture/evolusi, dua mythical dikunci untuk event berikutnya.
- Encounter Wild berdasarkan rarity, battle giliran, tiga skill, penggantian monster, critical/akurasi, efek terbakar/lambat, pertahanan, ramuan, capture empat tier, animasi kapsul, dan kabur.
- EXP dibagi ke peserta termasuk KO ketika menang; satu energi per peserta, tanpa biaya tambahan KO. Capture/kabur tidak memotong energi. Monster baru 5/20 energi. Energi nol menghalangi masuk Wild.
- Evolusi level 16/32 untuk starter dan level 22 untuk Wild; skill yang dipelajari dapat dipasang melalui Koleksi.
- Trainer lima kesempatan harian, reset 05.00 WIB; hadiah gold/intimasi tanpa EXP atau biaya energi.
- Lima Gym elemen dan final cup tiga babak; syarat empat anggota, level/intimasi, medali, hadiah, pemulihan HP/skill tiap babak.
- Personality ±10%, pembagian poin stat sampai 20 termasuk lima awal, reset alokasi, pengorbanan duplikat bentuk dasar dan pertukaran gold.
- Toko gold, lima fungsi makanan, dekorasi tim, tiket Trainer dan mailbox tiga kapsul harian.
- Autosave berversi, validasi simpanan, battle yang bisa dilanjutkan setelah reload, backup/impor, pemulihan energi berdasarkan waktu.

## Batas prototipe dan keputusan balancing

Lihat [keputusan implementasi](docs/design/IMPLEMENTATION.md). Nilai yang belum ditetapkan pengguna merupakan usulan yang dapat diubah, bukan aturan final yang diklaim berasal dari dokumen.

Model 3D dan 37 portrait individual kini mengikuti bentuk, palet warna, dan ciri khas sheet “Daftar Monster” dari workbook desain pengguna. Lihat [lembar visual 37 monster](docs/qa/screenshots/monster-roster-37.png) dan [catatan pembaruan visual](docs/qa/MONSTER-APPEARANCE.md). Bentuk masih berupa mesh prosedural versi konsep; model artistik final, rig, dan animasi serangan spesifik tetap perlu dipoles. Kolom elemen pada workbook hanya referensi visual; elemen battle mengikuti konsep sebelumnya. Lingkungan memakai ilustrasi 3D prarender; monster di atasnya dirender real-time dengan Three.js. Tidak ada peta berjalan, sesuai konsep.

Belum ada pembelian uang sungguhan, iklan, cloud save, atau event mythical aktif. Belum diuji pada perangkat Android fisik; performa GPU, lifecycle Android, share sheet, serta koneksi antardua HP perlu acceptance test perangkat sebelum rilis publik. Save offline memakai jam perangkat dan belum menangkal manipulasi waktu.

## Struktur dan tools

- `src/game`: roster, balancing, state, validasi, mesin battle murni.
- `src/screens`: Rumah, Koleksi, Jelajah, Arena/Trainer/Gym/Duel, Toko, Battle.
- `src/components`: model Three.js, primitive UI, Pengaturan.
- `server`: room WebSocket, validasi tim/aksi dan penyelesaian giliran.
- `android`: proyek native Capacitor.
- `tests`: aturan domain dan alur Playwright.

React + Vite + TypeScript, Three.js, Capacitor, Motion, Howler, Zod, WebSocket, Playwright, Vitest. UI memakai arahan [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) dan [anti-slop](https://github.com/miqdadbadjuber/anti-slop); alasan desain dan penyimpangan referensi tercatat di [DESIGN.md](DESIGN.md). Rive, dotLottie, dan Kenney tidak ditambahkan karena belum ada aset yang dibutuhkan dari ketiganya.

Lihat [catatan QA bahasa dan screenshot](docs/qa/LANGUAGE.md).

## Pemeriksaan

```sh
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright memakai Chromium sistem jika tersedia, atau browser bawaannya. `CHROMIUM_PATH` dapat menentukan lokasi browser. Pengujian mencakup starter, makanan, hadiah harian, koleksi/filter, capture, Trainer, stat/skill/duplikat, backup, ukuran layar dan Duel dua konteks browser.
