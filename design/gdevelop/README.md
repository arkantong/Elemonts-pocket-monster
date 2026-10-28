# Elemonts: scene battle 2D GDevelop

Versi 0.1.19. GDevelop 5.6.285 sudah dipasang di environment pada `/workspace/shared/gdevelop/`. Proyek `elemonts-battle.json` sudah dibuka langsung di editor tersebut dan scene berisi Garden, Partner, Opponent serta bayangan kontak. Runtime scene yang sama terhubung ke battle aplikasi, bukan sekadar file contoh yang terpisah dari game.

## Membuka dan mengedit

1. Clone repository ini, atau ekstrak `downloads/Elemonts-GDevelop-2D-v0.1.19.zip` dengan struktur folder utuh.
2. Buka GDevelop → Open project → `design/gdevelop/elemonts-battle.json`.
3. Scene `BattleGarden` memakai resolusi logis 960×1200. Partner ada di (215,1000); lawan di (755,700). Ukuran visual maksimum 365 dan 245 unit, dengan celah horizontal sekitar 235 unit. Saat melepas serangan fisik, partner sementara mendekati lawan lalu kembali.
4. Objek Partner/Opponent memiliki animasi bernama `pyroo:back`, `croobit:front`, dan seterusnya. Pyroo/Croobit memiliki empat pose; monster lain memakai satu ilustrasi lama. Ubah aset/animasi melalui object editor.
5. JavaScript event memuat idle, masuk, lunge, hit, KO dan reduced motion. Mode preview mandiri menampilkan Pyroo melawan Croobit. Preview scene bukan versi penuh aturan permainan, menu, save, atau Duel.

Pengeditan posisi/ukuran instance dipakai sebagai titik awal animasi. Untuk mengirim perubahan dari editor ke game utama, simpan lalu pindahkan data instance/animasi ke generator dan jalankan `npm run design:2d`. Saat ini belum ada sinkronisasi dua arah otomatis. Generator menghasilkan ulang file project, sehingga simpan eksperimen manual pada salinan sebelum menjalankannya.

## Sumber dan integrasi

- `characters-atlas.png`: artwork sumber, tidak ditimpa. `scripts/gdevelop/extract-sprites.sh` memotong sel aset secara mekanis; ImageMagick diperlukan hanya untuk ekstraksi ulang.
- `public/art/monsters-2d/`: delapan sprite PNG transparan Pyroo/Croobit.
- `src/game/conceptFrames.json`: batas tubuh/posisi kaki untuk normalisasi tampilan.
- `scripts/gdevelop/generate-project.mts`: scene, resource registry, dan proyek editor.
- `scripts/gdevelop/battle-events.js`: event visual bersama untuk aplikasi dan editor.
- `public/gdevelop/`: runtime lokal, scene data, boot dan event visual. `vendor/` tidak memuat library Three.js. Modul resource manager generik bawaan GDevelop tetap ada, tanpa aset atau rendering 3D.
- `src/components/BattleScene2D.tsx`: penghubung state battle dengan scene; memvalidasi sumber pesan iframe dan menampilkan cadangan bila pemuatan gagal.
- Battle rules, damage, EXP, energi, capture, PP, save dan multiplayer tetap di sistem game yang sudah ada. Scene hanya membaca state dan memainkan animasinya.

Runtime dimuat hanya ketika battle dibuka. Tidak membutuhkan akun GDevelop, layanan AI, server cloud GDevelop, atau API key. Game single player tetap offline di APK. Untuk memperbarui salinan engine dari instalasi lokal: `node scripts/gdevelop/import-runtime.mjs`; daftar file dan SHA ada di `public/gdevelop/runtime-info.json`.

Iframe yang sedang memuat tetap boleh melakukan render; ilustrasi cadangan menutupinya sampai frame pertama siap. Jangan menyembunyikannya dengan `opacity:0` sebelum scene siap: Chromium dapat menahan `requestAnimationFrame` pada iframe tak terlihat sehingga inisialisasi tertahan. Perbandingan resolusi logis disesuaikan dengan viewport agar sprite tidak gepeng.

## Batas saat ini

Karakter baru mengikuti siluet, warna dan proporsi concept sheet, tetapi merupakan gambar ulang; bukan salinan piksel 100%. Ada pose idle belakang/depan dan hit untuk kedua karakter, bukan animasi rangka anggota tubuh atau rangkaian frame lengkap untuk setiap jurus. Serangan memakai gerak sprite dan efek prosedural. Sebanyak 35 bentuk lain belum digambar ulang. Studi Blender tetap disimpan di `design/characters/`, tetapi tidak digunakan dalam game 2D ini.

Validasi memakai browser Chromium dan runtime GDevelop, termasuk Canvas tanpa WebGL. Editor desktop berhasil membuka proyek dan menampilkan scene. Preview native editor dalam mode headless belum berhasil diverifikasi; validasi gameplay dilakukan melalui runtime di aplikasi. Belum diuji pada Android fisik.

Pemeriksaan visual meliputi telinga/ekor api Pyroo, moncong/sirip Croobit, palet koral/mint/krim, proporsi sprite, arah pandang, celah antarmonster, font dan ikon kontrol, serta area aman. Gambar ulang tidak meniru setiap piksel dan pose pada concept sheet. Layout menu mempertahankan alur sebelumnya; label aksi dan aturan battle tidak diganti. Pada layar 320×640, kontrol dapat digulir vertikal tanpa terpotong.

Untuk QA: `npm run android:sync` lalu `npx playwright test tests/gdevelop-2d.spec.ts tests/battle-animation.spec.ts tests/home-safe-area.spec.ts tests/pet-home.spec.ts tests/music.spec.ts`. Test production membutuhkan `dist/` hasil build, bukan hanya Vite development. Pengujian dilakukan pada 320×640, 390×844 dan 1280×900. Browser plugin tidak tersedia; menggunakan Playwright/Chromium. Build PWA produksi juga diuji dengan reload dan serangan elemen saat koneksi offline.
