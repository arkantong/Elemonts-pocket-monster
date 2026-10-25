# Visual monster — 0.1.2

Acuan: [workbook pengguna](../design/Daftar_Desain_37_Monster_Elemonts.xlsx), sheet **Daftar Monster**, 37 baris. Pengguna menegaskan workbook untuk bentuk dan tampilan saja. Elemen battle, kategori, personality bonus, skill, evolusi, dan balancing tetap mengikuti konsep sebelumnya. Status semua desain pada workbook: Konsep awal.

## Hasil

- Data visual per spesies berada di `src/game/appearance.json`: bentuk, palet, kepribadian visual dan ciri khas. Nama warna deskriptif dikonversi menjadi usulan warna hex.
- 37 model Three.js dibuat per bentuk: rubah, buaya, naga, burung, mamalia bertaring, titan, kerikil, badak/golem, kuda nil, kapas/bara, babi, phoenix, anjing laut, makhluk bulan, ubur-ubur, ikan, tupai, lynx, lebah, kadal, batu spiral, tetesan, penggali, kucing roh, pelari, tumbuhan, kelinci, kristal dan penjaga malam.
- Ekor, surai, sirip, tanduk, inti cahaya, sulur, tunas, spiral dan tanda tubuh membedakan konsep. Ekspresi dan tempo idle mengikuti kepribadian visual; tidak mengubah personality battle.
- Portrait tiap spesies dirender dari model yang sama. Koleksi, starter, tim, tas dan fallback WebGL memakai portrait individual. Rumah dan battle memakai mesh real-time.
- Deskripsi visual pada rumah, starter dan detail koleksi menggunakan ciri khas dari sheet, tersedia dalam English/Indonesia.

[Lihat seluruh 37 bentuk](screenshots/monster-roster-37.png).

## Batas kesesuaian

Model ini interpretasi prosedural atas deskripsi teks, belum model final yang disetujui pengguna. Detail seperti motif hati, fur/bulu, tekstur retakan, bentuk bunga kristal, dan gerak sirip masih disederhanakan. Tidak ada klaim seluruh detail sudah identik dengan ilustrasi final. Perlu iterasi art dan rig animasi sebelum rilis komersial.

## Verifikasi

Hasil: 23 tes unit lulus; delapan alur browser terverifikasi (tujuh lulus pada run akhir, tes offline diulang dan lulus setelah build aset selesai). Run offline pertama bertepatan dengan penggantian folder dist saat build; rerun menggunakan build stabil. Build TypeScript/Vite dan Android assembleDebug lulus; signature APK dan zip alignment valid. Screenshot rumah/pengaturan terbaru tidak menghasilkan page error atau overflow horizontal. Semua 37 PNG memiliki sudut transparan.

Tes memeriksa cakupan 37 ID roster, portrait PNG setiap bentuk, model valid dengan ukuran kamera konsisten, serta elemen battle yang tetap menggunakan data lama. Tes terjemahan juga mencakup 37 ciri khas. Lembar visual dirender melalui Chromium/Playwright dan diperiksa langsung. Browser plugin tidak tersedia; Chromium sistem digunakan. Pemeriksaan perangkat Android fisik masih diperlukan.

Untuk merender ulang portrait: jalankan dev server pada port 5173, lalu `node scripts/render-portraits.mjs`. Output dimasukkan ke repository agar aplikasi Android tetap offline dan tidak memerlukan renderer browser saat build.
