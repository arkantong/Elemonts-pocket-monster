# Template daftar skill Elemonts

[Unduh Template-Skill-Elemonts.xlsx](./Template-Skill-Elemonts.xlsx).

Template berbahasa Indonesia, tanpa dropdown, macro, atau rumus. Isi jawaban dengan teks biasa.

| Sheet | Cara memakai |
| --- | --- |
| MULAI DI SINI | Petunjuk dan arti kolom |
| CONTOH SAJA | Empat contoh pengisian, bukan keputusan game |
| ISI SKILL | 100 baris jawaban kosong; kode SK-001 dst. disediakan |
| REFERENSI | File/link/timestamp serta tiga tempat gambar yang dapat ditempel melalui Insert > Pictures |
| ACUAN SKILL | 24 skill dari implementasi saat template dibuat; bukan balancing final |
| DAFTAR MONSTER | Nama dan elemen gameplay 37 monster dari implementasi |

Mulai dengan nama skill dan monster pengguna pada kolom biru. Kolom hijau bisa diisi **USULKAN** jika belum punya bayangan. Kolom abu untuk referensi dan catatan bersifat opsional. Kode SK-001 adalah kode isian untuk diskusi, bukan ID skill di program.

Satu baris menjelaskan satu skill dan cara gerak penggunanya. Jika animasi berbeda antar-monster, gunakan baris terpisah walaupun nama skill sama. Jika animasi sama, beberapa pengguna boleh ditulis dalam satu sel.

Data acuan tidak otomatis mengubah konsep yang sudah disepakati. File Excel bentuk monster tetap khusus tampilan. Efek visual juga tidak otomatis mengubah power, akurasi, PP, status, atau cara memperoleh skill. Perubahan aturan dapat ditulis eksplisit pada Catatan tambahan.

Simpan jawaban sebagai salinan, misalnya `Skill-Elemonts-Jawaban-Tim-v1.xlsx`, lalu kirim bersama file referensi bila ada. Gunakan Excel, LibreOffice, atau aplikasi spreadsheet yang kompatibel untuk mengisi; preview GitHub tidak berfungsi sebagai editor.

## Pembuatan ulang

Ekspor data dari repo dengan Node/tsx:

```sh
npx tsx -e 'import {SKILLS,ROSTER,learnset} from "./src/game/data.ts"; console.log(JSON.stringify({skills:Object.values(SKILLS),roster:ROSTER,users:Object.fromEntries(Object.values(SKILLS).map(s=>[s.id,s.id==="struggle"?"Semua monster; aksi cadangan ketika PP habis":ROSTER.filter(r=>learnset(r.id,60).includes(s.id)).map(r=>r.name).join(", ")]))}))' > /tmp/elemonts-skill-source.json
python scripts/build-skill-template.py /tmp/elemonts-skill-source.json
```

Generator membutuhkan `openpyxl`. File hasil dibuka ulang untuk memeriksa 100 baris jawaban kosong, 24 skill, 37 monster, serta tidak adanya dropdown dan formula.
