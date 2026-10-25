# Tutorial wajib menangkap — 0.1.4

Pemain baru sekarang benar-benar menangkap satu monster Wild sebelum membuka petualangan bebas. Tutorial lama hanya menjelaskan konsep melalui modal yang bisa ditutup; latihan baru mengikuti aksi nyata dan hasilnya menjadi anggota Koleksi serta tim.

## Perilaku

1. Pilih bahasa dan starter. Pembukaan latihan tidak dapat dilewati dengan menutup dialog, Escape, atau tombol kembali yang mengirim event cancel.
2. Tekan **Mulai latihan menangkap**, lalu **Masuk Wild**. Navigasi fitur lain dikunci selama latihan; mengganti hash rute tidak melewati panduan.
3. Gunakan **Terjang**, skill pertama. Target latihan adalah Flicklet level 2. Target bertahan; damage latihan tidak membuatnya KO dan pemain tidak diserang.
4. Setelah animasi selesai, panduan menandai **Tas**, kemudian **Mococapsule**. Aksi yang belum sesuai langkah dinonaktifkan dan juga ditolak pada transisi state.
5. Kapsul pertama pada latihan dijamin berhasil, memakai satu Mococapsule, dan menampilkan hasil capture sebenarnya. Peluang pasti berhasil ini hanya berlaku selama latihan.
6. Tekan **Selesai** untuk menambahkan teman baru ke Koleksi/tim, lalu **Lihat teman baruku** untuk mengakhiri latihan. Monster tertangkap memiliki 5 energi; energi starter tidak berkurang.

Panduan menjelaskan bahwa HP rendah membantu penangkapan, target tidak boleh KO, kapsul terpakai setiap percobaan, dan tangkapan Wild normal bisa gagal. Semua teks baru mendukung Indonesia serta Inggris.

## Penyimpanan dan kompatibilitas

`Save.captureTutorial` menyimpan langkah intro, explore, weaken, bag, capsule, caught, atau done. Dialog Tas dibuka kembali ketika memuat langkah capsule. Menutup Tas mengembalikan panduan ke langkah bag. Setelah done, tutorial tidak ditampilkan lagi.

Field baru bersifat opsional sehingga simpanan lama tetap dibaca tanpa reset maupun pemaksaan tangkapan baru. Memilih starter pada petualangan baru selalu memulai latihan. Untuk mencoba dari save lama di HP, ekspor cadangan terlebih dahulu melalui Pengaturan, lalu gunakan fitur Mulai petualangan baru secara manual. Aplikasi tidak menghapus save lama saat update.

## Validasi

- Alur target: pilih bahasa/starter → latihan wajib → melemahkan target → Tas/kapsul → hasil capture → Koleksi → reload tanpa pengulangan.
- Browser plugin not available. Pengujian menggunakan Playwright dan Chromium sistem pada `http://localhost:5173` serta hasil produksi `http://localhost:3001`.
- Viewport: 390 × 900 (Indonesia, produksi, termasuk reload offline) dan 1440 × 900 (Inggris). Tes regresi juga memeriksa lebar 375, 768, dan 1440.
- Unit test mencakup kelima starter, penolakan skip/aksi salah, HP nonlethal, capture dan pengurangan kapsul, hasil tersimpan, transisi selesai, kompatibilitas save lama, serta KO/kegagalan capture pada battle normal.
- Hasil akhir: **32 unit test lulus** (`npm test`) dan **12 tes antarmuka lulus** (`npx playwright test`, termasuk regresi feeding, koleksi, toko, Trainer, Duel, backup/recovery, bahasa, dan offline).
- Tes antarmuka memeriksa dialog wajib, navigasi, reload pada langkah Tas dan hasil akhir, penutupan Tas, hasil Koleksi, dan tidak adanya JavaScript page error. Screenshot selama validasi disimpan di luar repositori.
- TypeScript/Vite build, sinkronisasi Capacitor, dan Android assembleDebug berhasil. APK: `com.elemonts.game`, versionCode 5, versionName 0.1.4, Android 7/API 24 atau lebih baru. Signature serta alignment APK diperiksa.

Belum diuji pada HP Android fisik. Tombol kembali native, performa WebView/GPU, dan instalasi update pada perangkat tetap perlu dicoba melalui APK.

## Berkas utama

- `src/components/CaptureGuide.tsx`: panduan langkah dan dialog awal/selesai.
- `src/game/state.ts`: progres tutorial, validasi aksi, dan hasil tangkapan.
- `src/game/battle.ts`: penangkapan pasti serta damage nonlethal khusus latihan.
- `src/App.tsx`, `Explore.tsx`, `Battle.tsx`: integrasi alur dan penanda tombol.
- `tests/capture-tutorial.test.ts`, `tests/capture-tutorial.spec.ts`: aturan dan alur pengguna.
