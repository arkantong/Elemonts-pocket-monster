# Formulir kebutuhan visual dan battle Elemonts

Dokumen kerja berbahasa Indonesia untuk pemilik game dan tim. Berisi 72 pertanyaan dalam 12 bagian, dengan nomor yang sama seperti daftar pertanyaan di percakapan.

- [Unduh PDF formulir — 47 halaman](./Elemonts-Formulir-Kebutuhan-Visual-dan-Battle-v1.pdf)
- [Unduh Word yang dapat diedit](./Elemonts-Formulir-Kebutuhan-Visual-dan-Battle-v1.docx)

## Cara mengisi

1. Baca **MAKSUD** dan **CARA MENJAWAB / PILIHAN**.
2. Gunakan **CONTOH KASUS + JAWABAN** hanya sebagai panduan; contoh bukan keputusan proyek.
3. Isi **JAWABAN KAMU / TIM**. Jika belum tahu, tulis **USULKAN** atau **BELUM TAHU**.
4. Bila ada referensi, isi **REF / LINK / TIMESTAMP**. Tempel gambar pada lembar referensi Word, atau kirim file terpisah dengan kode yang sama, misalnya `REF-01-kamera.jpg`.
5. Untuk video, tulis rentang menit:detik dan aspek yang disukai/tidak disukai. PDF tidak memiliki tombol unggah gambar.
6. Simpan salinan berisi jawaban, lalu buka kembali untuk memastikan isian tersimpan. Gunakan aplikasi PDF yang mendukung formulir; preview GitHub tidak berfungsi sebagai editor formulir.

Kolom PDF dapat diketik. Teks panjang dapat menggulir dan mungkin tidak seluruhnya tercetak; gunakan Word atau lampiran lanjutan untuk jawaban panjang. Dua lembar referensi disediakan dan dapat diduplikasi di Word.

## Isi PDF

| Halaman | Isi |
| --- | --- |
| 1–3 | Konteks, identitas, arti label, petunjuk, contoh pengisian |
| 4–5 | Cuplikan referensi video dan diagram aset/rig/animasi |
| 6–44 | 72 pertanyaan dengan kolom jawaban dan referensi |
| 45–46 | Lembar referensi gambar, video, dan file |
| 47 | Ringkasan prioritas dan cara mengirim kembali |

Cuplikan Lumi Master berasal dari video referensi yang dikirim pengguna. Cuplikan ini hanya bahan pembahasan dalam brief, bukan aset yang dipasang pada game. Diagram bentuk/rig juga ilustrasi, bukan desain monster final. Dokumen tidak mengganti aturan gameplay yang sudah disepakati.

## Pembuatan ulang

Sumber pertanyaan: [`brief-assets/questions.txt`](./brief-assets/questions.txt).

Jalankan `python scripts/build-design-workbook.py` dari repositori dengan `reportlab`, `python-docx`, dan `PyMuPDF` tersedia. Script menggunakan font DejaVu Sans dan dua cuplikan referensi lokal. Hasil PDF memiliki 72 kolom jawaban, 72 kolom referensi, dan kolom pendukung; seluruh kolom jawaban kosong pada template yang dibagikan.

Validasi: semua halaman PDF dirender untuk pemeriksaan tata letak; cakupan nomor pertanyaan dan keunikan nama field diperiksa; contoh isian berhasil disimpan dan dibaca ulang pada salinan uji. DOCX juga dikonversi ke PDF untuk pemeriksaan tata letak, tetapi hasil konversi itu tidak menggantikan PDF formulir utama.
