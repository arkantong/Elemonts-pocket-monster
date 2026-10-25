# Battle animation — 0.1.3

Referensi: tiga video pengguna diperiksa melalui sampel frame. Pola yang diambil adalah persiapan → serangan → benturan → reaksi lawan → pemulihan pose. Aset karakter dan video referensi tidak dimasukkan ke game.

## Implementasi

- Semua 24 skill saat ini memiliki presentasi: Terjang/Usaha terakhir dan Netral memakai gerak maju serta slash, Bertahan memakai shield; tujuh elemen mendapat bentuk dan warna efek berbeda. Tingkat 1/2/3 menggunakan projectile, beam, dan storm/partikel lebih banyak. Ini variasi sistem efek, bukan 24 animasi skeletal buatan tangan.
- Monster melakukan wind-up, gerak maju untuk serangan fisik, recoil saat terkena, dan pose KO. Critical menambah getaran kamera ringan. Meleset tidak menampilkan benturan/damage palsu.
- Mesin battle menerbitkan frame aksi berurutan dengan snapshot HP dan log. UI menjalankannya sekitar 1,25 detik per aksi; HP/log baru diterapkan pada benturan sekitar 650 ms. Formula damage, elemen, PP, EXP dan energi tidak diubah.
- Tombol skill/tas/ganti/kabur terkunci selama playback. Hasil battle muncul setelah urutan selesai. Timer dibersihkan saat layar ditutup. Load save lama melewati playback historis.
- Duel membalik sisi actor dan snapshot untuk pemain kedua. Tidak menebak jenis skill dari teks log.
- Preferensi reduced motion meniadakan projectile, shake dan gerak model; label skill tetap terlihat dan waktu aksi dipersingkat.
- Suara hit diputar saat benturan jika efek suara aktif.

## Artefak

- [Video contoh](videos/battle-animation.mp4)
- [Frame benturan](screenshots/battle-attack-impact.png)
- [Daftar 24 skill untuk revisi di Excel](../design/SKILL-ANIMATION.csv)

Video direkam dari build yang berjalan di Chromium dengan battle fixture Pyroo/Croobit level 30 dan HP 500 agar beberapa aksi terlihat dalam satu rekaman. Fixture hanya berada di script rekaman, tidak mengubah balancing game. Rekaman tanpa audio.

## Batas

Model masih prosedural. Gerakan memakai transformasi seluruh model, belum rig per tulang untuk pukulan, tendangan, atau rahang seperti produksi Pokémon. Timing dan VFX saat ini usulan awal berdasarkan skill yang sudah tersedia. Belum diuji pada Android fisik.

## Verifikasi

25 tes unit lulus, termasuk event/HP intermediate untuk seluruh skill, miss, guard, serta pencegahan serangan dari monster yang sudah KO. Tes browser tambahan memeriksa input terkunci, skill yang tampil dan HP berubah pada impact. Delapan alur lain mencakup battle/capture/Trainer, Duel dua pemain, pergantian bahasa, backup dan mode offline. Tes Trainer disesuaikan agar menunggu akhir playback sebelum menentukan aksi berikutnya. Build Android debug dan verifikasi signature/zip alignment berhasil.

Browser plugin tidak tersedia. Pemeriksaan visual menggunakan Playwright + Chromium sistem, rekaman WebM kemudian dikonversi menjadi MP4 dengan ffmpeg. Tidak ada page error pada rekaman. Hasil ini bukan pengujian HP fisik atau klaim visual identik dengan video referensi.
