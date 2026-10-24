# Keputusan implementasi prototipe 0.1

Sumber keputusan: dokumen konsep v1–v4 dan Excel pengguna. Pengguna mengizinkan development setelah v4. Rincian berikut adalah asumsi/usulan implementasi agar prototipe bisa dimainkan, dapat direvisi setelah uji bermain.

| Bagian | Usulan yang dipakai |
| --- | --- |
| Awal | Satu starter level 5, energi 20, 1.200 gold, delapan kapsul dan beberapa makanan/ramuan untuk tutorial |
| Stat | Base stat per keluarga/tahap, pertumbuhan HP +4/level dan stat lain +2/level, lalu alokasi poin dan personality ±10%, dibulatkan ke bawah |
| Level | Batas level sementara 60; kebutuhan EXP level berikutnya = level ×40. Level 50 tetap syarat Gym final, bukan batas game |
| EXP Wild | Hadiah = level lawan ×35, dibagi rata ke peserta termasuk KO, sisa pembulatan dibuang. Tim kalah tidak mendapat EXP, setiap peserta kehilangan satu energi |
| Partisipasi | Monster yang masuk arena dihitung peserta, meskipun belum menyerang; masuk ulang tidak menambah biaya |
| Energi | Satu biaya setelah menang/kalah, tidak setelah capture/kabur. Timer dimulai saat meninggalkan kondisi penuh; pemulihan berlaku seluruh koleksi |
| Intimasi | Wild menang +1 bagi peserta; Trainer/Gym menang +2; makanan +5. Maksimal 100, tiap 10 intimasi menghasilkan satu poin stat sampai batas 20 |
| Duplikat | Bentuk dasar keluarga yang sama, di luar tim: +2 poin; donor hilang. Tidak melebihi batas 20. Penjualan =75 gold |
| Capture | Faktor HP, rarity dan tier. Prime 1,5×, Elemen 2× jika elemen target sama dengan partner aktif, Genesis 3×. Peluang maksimum 95%, bukan jaminan tangkap |
| Elemen | Keunggulan 1,5×, arah lemah 0,75×; relasi yang tidak disebut netral. Dark/Holy dua arah 1,5× |
| Skill | Power, akurasi, PP, belajar level 1/10/20. Speed menentukan giliran; switch/item memiliki prioritas. Critical 7%. Fallback tersedia ketika semua PP habis |
| Status | Terbakar mengurangi serangan dan HP tiap giliran; lambat mengurangi Speed. Status tidak dibawa ke battle berikutnya |
| Seri | Jika kedua tim KO bersamaan karena efek akhir giliran, hasilnya seri tanpa hadiah. Di Wild, peserta tetap memakai satu energi |
| Makanan | Booster EXP ditafsirkan sebagai +120 EXP langsung; intimasi +5 langsung; energi +5. Dua buff encounter berlaku 10 menit dan saling mengganti |
| Buff elemen | Mengacu elemen partner pertama dalam tim; meningkatkan bobot lawan yang unggul atas partner 2× |
| Ekonomi | Wild menang 35 gold, Trainer 100, Gym 300. Tidak ada hadiah saat kalah, capture, kabur atau Duel; harga di katalog sementara |
| Gym | Level 10/18/26/34/42/50 dan intimasi 5/10/15/20/25/30 untuk semua empat anggota. Gym pertama–kelima satu pertandingan; final tiga babak. Kekalahan mengulang awal |
| Cup | HP/PP/status pulih setiap babak. Gold dan medali diberikan setelah babak ketiga. Tidak ada biaya energi |
| Duel | Server LAN pada komputer, room enam angka, pilihan penyetaraan level 25. Tidak menormalisasi stage, skill, personality atau poin tambahan. Tidak memberikan hadiah |
| Dekorasi | Kebun embun: +5 kapasitas energi dan pemulihan tiap 45 menit untuk anggota tim. Satu dekorasi, tidak ditumpuk |
| Hadiah harian | Klaim tiga kapsul melalui mailbox sekali tiap reset 05.00 WIB; hari yang terlewat tidak ditumpuk |
| Koleksi | Kapasitas sementara 120 individu, duplikat menggunakan slot |

Nama referensi Pebbit dinormalisasi menjadi Pebblit; swiftail menjadi Swifttail. Istilah elemen Angel/Holy ditampilkan Holy. Tier kapsul mengikuti ejaan v3: Mococapsule. Tidak menggunakan nama/asset yang diekstrak dari APK atau ROM referensi.

Prioritas setelah uji internal: authored model/rig/portrait 37 bentuk, animasi serangan spesifik, balancing durasi sesi, acceptance test dua Android fisik, lalu packaging release dan fitur tahap berikutnya. Preferensi sistem monetisasi/PvP kompetitif tidak diasumsikan sebagai sudah final.
