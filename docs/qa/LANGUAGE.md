# QA bahasa — Elemonts 0.1.1

## Perilaku

- Instalasi pertama atau perangkat yang belum memilih bahasa menampilkan layar English/Bahasa Indonesia. English dipilih awal; pemain menekan Continue/Lanjutkan untuk melanjutkan ke pilihan starter.
- Settings/Pengaturan → Language/Bahasa mengubah bahasa saat itu juga. Tidak perlu menutup aplikasi dan tidak mereset progres atau battle.
- Preferensi disimpan di `elemonts.language.v1`, terpisah dari `elemonts-save-v1`. Impor cadangan dan mulai petualangan baru tidak menghapus pilihan bahasa perangkat. Instalasi ulang yang menghapus data akan menampilkan pilihan awal lagi.
- Nama monster, ID elemen, ID skill, format save, dan pesan server tetap dalam bentuk kanonis. Terjemahan diterapkan pada tampilan, termasuk pesan battle lama yang tersimpan.
- Menu, onboarding, tutorial, elemen/rarity, personality, deskripsi monster, skill, item, toko, Trainer/Gym/Duel, pesan validasi, backup, dan label aksesibilitas mendukung kedua bahasa. Nama monster tetap sama.
- Angka dan waktu ditampilkan mengikuti locale. Reset harian tetap 05.00 WIB (UTC+7) di kedua bahasa.

## Pemeriksaan

Hasil akhir: 21 tes Vitest lulus, 8 alur Playwright lulus (53 detik), build TypeScript/Vite lulus, Android assembleDebug lulus, signature APK dan zip alignment valid. Hasil ini berasal dari eksekusi lokal di cloud; belum mengklaim hasil workflow GitHub Actions.

Pengujian unit mencakup semua deskripsi roster dan item, nama skill/personality/elemen, log battle dinamis, serta data yang tidak berubah ketika diterjemahkan. Alur browser mencakup English awal, pilihan Indonesia sebelum starter, penggantian dua arah dalam Pengaturan, persistensi setelah reload, save yang tidak berubah, filter Water dengan ID `Air`, serta log Wild berbahasa Inggris. Alur game sebelumnya tetap diuji dengan preferensi Indonesia eksplisit.

Browser plugin tidak tersedia; screenshot dan interaksi menggunakan Playwright dengan Chromium sistem. Screenshot portrait 390×844 diperiksa langsung; tidak ada page error maupun overflow horizontal pada pemeriksaan visual. Layar pilihan awal mengikuti palet sage/hijau, kartu krem, tipografi Fredoka/Nunito Sans, dan tombol utama game. Pengaturan mempertahankan tata letak dialog serta menambahkan pilihan bahasa di atas kontrol suara. Salinan teks bilingual pada pilihan awal disengaja agar kedua pilihan mudah ditemukan.

## Screenshot

- [Pilihan pertama buka](screenshots/language-first-launch.png)
- [Rumah English](screenshots/home-english.png)
- [Settings English](screenshots/settings-english.png)
- [Pengaturan Indonesia](screenshots/settings-indonesian.png)

## Android

APK debug 0.1.1: application ID `com.elemonts.game`, versionCode 2, minimum API 24, target API 36. Build `assembleDebug` dan pemeriksaan signature APK berhasil. SHA-256 tersedia di `downloads/SHA256SUMS`.

Belum dijalankan pada emulator atau HP Android fisik. Pemeriksaan perangkat, performa GPU, lifecycle, dan share sheet tetap perlu dilakukan sebelum rilis publik. Ini prototipe internal.
