"""Elemonts rebranding design book. PDF only; concept drawings are not app changes.
Requires reportlab, Pillow, fontTools[woff], PyMuPDF for QA separately.
"""
from pathlib import Path
from math import sin,cos,pi
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor, Color, white
from fontTools.ttLib import TTFont as ConvertFont
from PIL import Image

R=Path(__file__).resolve().parents[1]
OUT=R/'docs/design/Elemonts-Design-Identity-Rebranding-v1.pdf'
TMP=Path('/tmp/elemonts-brand');TMP.mkdir(exist_ok=True)
for family,weight,name in [('fredoka',600,'Display'),('nunito-sans',400,'Body'),('nunito-sans',700,'Bold')]:
    f=ConvertFont(R/f'node_modules/@fontsource/{family}/files/{family}-latin-{weight}-normal.woff');f.flavor=None;f.save(TMP/f'{name}.ttf')
    pdfmetrics.registerFont(TTFont(name,str(TMP/f'{name}.ttf')))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold')
pdfmetrics.registerFont(TTFont('Symbols','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
W,H=960,640
GREEN='#294D34';INK='#233A2A';CREAM='#FFFEF8';BG='#F3F5EE';LEAF='#719753';ORANGE='#B94C1D';MUTED='#596555';LINE='#DFE4D6'
c=canvas.Canvas(str(OUT),pagesize=(W,H))
c.setTitle('Elemonts — Design Identity & Rebranding v1')
c.setAuthor('Elemonts / Codex')
c.setSubject('Panduan identitas desain lengkap; usulan rebranding untuk review tim, 25 Oktober 2026')
PAGE=0;N=28;BOOKMARKS=[]

def col(v):return HexColor(v)
def rect(x,y,w,h,fill=CREAM,stroke=None,r=0):
    c.setFillColor(col(fill));c.setStrokeColor(col(stroke or fill))
    if r:c.roundRect(x,H-y-h,w,h,r,fill=1,stroke=bool(stroke))
    else:c.rect(x,H-y-h,w,h,fill=1,stroke=bool(stroke))
def text(s,x,y,w,size=14,font='Body',color=INK):
    s=s.replace('→','<font name="Symbols">→</font>')
    p=Paragraph(s,ParagraphStyle('p',fontName=font,fontSize=size,leading=size*1.35,textColor=col(color)))
    _,h=p.wrap(w,2000)
    assert y+h<=(638 if y==617 else 604), (PAGE,s[:60],y,h)
    p.drawOn(c,x,H-y-h)
    return y+h
def line(x1,y1,x2,y2,color=LINE,width=1):
    c.setStrokeColor(col(color));c.setLineWidth(width);c.line(x1,H-y1,x2,H-y2)
def circle(x,y,r,fill=GREEN):
    c.setFillColor(col(fill));c.circle(x,H-y,r,stroke=0,fill=1)
def start(title,kicker='SISTEM IDENTITAS',sub='',dark=False):
    global PAGE
    if PAGE:c.showPage()
    PAGE+=1;bg=GREEN if dark else BG;fg=CREAM if dark else INK
    rect(0,0,W,H,bg)
    key=f'p{PAGE}';c.bookmarkPage(key);c.addOutlineEntry(f'{PAGE:02d} · {title}',key,0)
    BOOKMARKS.append((title,key))
    text(kicker.upper(),44,24,800,10,'Bold',LEAF if dark else GREEN)
    text(title,44,49,870,31,'Display',fg)
    if sub:text(sub,44,98,870,12,'Body',CREAM if dark else MUTED)
    line(44,611,916,611,LEAF if dark else LINE)
    text('ELEMONTS  /  DESIGN IDENTITY v1  /  USULAN REBRANDING',44,617,770,8,'Bold',CREAM if dark else MUTED)
    text(f'{PAGE:02d} / {N}',865,617,60,8,'Bold',CREAM if dark else GREEN)
def card(x,y,w,title,body,h=148,accent=GREEN):
    rect(x,y,w,h,CREAM,LINE,14);rect(x+16,y+18,5,23,accent,r=2)
    text(title,x+30,y+15,w-45,18,'Display')
    text(body,x+18,y+54,w-36,13)
def note(s,y=555):
    rect(44,y,872,44,'#E7EDDF',r=9);text(s,58,y+10,844,11)
def bullet(items,x,y,w,size=14):
    for a in items:
        circle(x+3,y+8,2,LEAF);y=text(a,x+16,y,w-16,size)+14
    return y
def picture(path,x,y,w,h):
    im=Image.open(path);iw,ih=im.size
    scale=min(w/iw,h/ih);dw,dh=iw*scale,ih*scale
    c.drawImage(str(path),x+(w-dw)/2,H-y-(h+dh)/2,dw,dh,mask='auto')
def monster(name,x,y,s=140):picture(R/f'public/art/monsters/{name}.png',x,y,s,s)
def crop_image(path,x,y,w,h):
    im=Image.open(path);iw,ih=im.size;scale=max(w/iw,h/ih);dw,dh=iw*scale,ih*scale
    c.saveState();p=c.beginPath();p.rect(x,H-y-h,w,h);c.clipPath(p,stroke=0)
    c.drawImage(str(path),x+(w-dw)/2,H-y-(h+dh)/2,dw,dh,mask='auto');c.restoreState()
def mark(x,y,s,color=GREEN):
    # Original proposed symbol: three seed/leaf lobes above a paw-shaped core.
    c.saveState();c.translate(x,H-y-s);c.scale(s/100,s/100);c.setFillColor(col(color))
    for cx,cy,angle in [(24,70,28),(50,83,0),(76,70,-28)]:
        c.saveState();c.translate(cx,cy);c.rotate(angle)
        p=c.beginPath();p.moveTo(0,-13);p.curveTo(-16,-4,-12,11,0,20);p.curveTo(12,11,16,-4,0,-13);p.close();c.drawPath(p,fill=1,stroke=0);c.restoreState()
    p=c.beginPath();p.moveTo(12,19);p.curveTo(9,38,34,58,50,58);p.curveTo(66,58,91,38,88,19);p.curveTo(85,0,64,10,50,10);p.curveTo(36,10,15,0,12,19);p.close();c.drawPath(p,fill=1,stroke=0)
    c.restoreState()
def logo(x,y,s=65,color=GREEN):
    mark(x,y,s,color);text('Elemonts',x+s+14,y+s*.13,480,s*.67,'Display',color)
def table(headers,rows,x=44,y=150,widths=None,rowh=64):
    widths=widths or [220,652]
    xx=x
    for h,w in zip(headers,widths):rect(xx,y,w,34,GREEN);text(h,xx+10,y+8,w-20,11,'Bold',CREAM);xx+=w
    yy=y+34
    for i,row in enumerate(rows):
        xx=x
        for val,w in zip(row,widths):
            rect(xx,yy,w,rowh,CREAM if i%2==0 else '#EAF0E4',LINE)
            text(str(val),xx+10,yy+10,w-20,11.5);xx+=w
        yy+=rowh
    return yy
def tag(label,x,y,w=125,color=GREEN):rect(x,y,w,25,color,r=12);text(label,x+9,y+5,w-18,9,'Bold',CREAM)
def phone(x,y,w=230,h=398):
    rect(x,y,w,h,INK,r=25);rect(x+7,y+7,w-14,h-14,CREAM,r=20)
    return x+17,y+20,w-34,h-40

# 01
start('Design identity','ELEMONTS / REBRANDING',dark=True)
logo(51,148,98,CREAM)
text('Teman kecil.<br/>Petualangan besar.',53,300,475,40,'Display',CREAM)
text('Brand book visual untuk tim desain, produksi aset, UI, dan pengembangan Android.',55,445,425,16,'Body',CREAM)
tag('DRAFT UNTUK REVIEW',55,536,170,ORANGE)
rect(610,145,276,383,'#E7EDDF',r=32)
monster('pyroo',632,175,234)
text('Rawat. Berteman.<br/>Bertualang.',635,430,225,26,'Display',GREEN)
text('25 Oktober 2026 · Versi 1.0',635,532,225,11,'Body',CREAM)

# 02
start('Cara menggunakan brand book ini','PETA DOKUMEN','Nama Elemonts dipakai sebagai nama kerja. Arah ini dapat diterapkan ulang jika nama merek berubah.')
card(44,144,278,'Acuan terpasang','Nama dunia Nusaraya, roster 37 monster, bahasa Indonesia/Inggris, serta fondasi warna hijau dan krem.',150)
card(341,144,278,'Usulan rebranding','Simbol logo, aturan visual, mockup, token desain, dan arahan komunikasi pada dokumen ini.',150,ORANGE)
card(638,144,278,'Aset produksi','Logo master, model/rig final, ikon lengkap, dan ekspor toko aplikasi perlu dibuat dari arah yang disetujui.',150)
items=[('03–04','Dasar merek & arah kreatif'),('05–08','Logo & identitas aplikasi'),('09–11','Warna & aksesibilitas'),('12–17','Tipografi, layout, komponen & ikon'),('18–20','Monster, evolusi & dunia'),('21–24','Contoh UI & gerakan'),('25–28','Promosi, bahasa, produksi & keputusan')]
for i,(pages,label) in enumerate(items):
    yy=320+(i%4)*49;xx=44+(i//4)*445
    text(pages,xx,yy,85,14,'Bold',GREEN);text(label,xx+83,yy,345,14)
note('Gambar monster di dokumen ini berasal dari aset prototipe saat ini. Contoh layout merupakan rancangan, bukan screenshot fitur baru.')

# 03
start('Satu identitas, tiga pengalaman','DASAR MEREK','Elemonts menghubungkan kedekatan sehari-hari dengan penemuan dan pertarungan.')
text('“Setiap monster layak menjadi teman dalam petualanganmu.”',55,155,810,29,'Display')
for x,title,body in [(44,'Rawat','Rasa hangat dan aman. Respons monster membuat interaksi kecil terasa bermakna.'),(341,'Berteman','Siluet dan kepribadian membuat pemain mengenali setiap makhluk sebagai individu.'),(638,'Bertualang','Penemuan, evolusi, dan battle menghadirkan rasa penasaran serta kebanggaan.')]:card(x,266,278,title,body,176)
text('Positioning',44,467,190,18,'Display',GREEN)
text('Petualangan monster di Nusaraya, tempat pemain merawat teman, mengembangkan koleksi, dan tumbuh bersama melalui battle.',245,464,655,15)
note('Target awal yang diusulkan: remaja dan dewasa penggemar monster, dengan tampilan yang tetap mudah dipahami pemain baru.')

# 04
start('Arah kreatif: jurnal petualangan yang hidup','ART DIRECTION','Hangat saat merawat, penuh energi saat bertarung, jelas ketika mengambil keputusan.')
crop_image(R/'public/art/nusaraya.png',44,150,520,330)
tag('ALAM • KEDEKATAN • RASA INGIN TAHU',60,167,300)
bullet(['Bentuk organik, sudut lembut, dan permukaan krem memberi rasa ramah.','Hijau membangun kesinambungan dunia. Warna elemen menjadi aksen karakter dan aksi.','Detail lingkungan mendukung cerita; ruang di sekitar monster dan tombol tetap bersih.','Saat battle, pose dan ritme lebih tegas tanpa mengubah identitas karakter.'],595,150,315,14)
note('Acuan lingkungan: ilustrasi Nusaraya yang sudah ada di prototipe. Kepadatan detail dan pencahayaan final masih perlu dipoles.')

# 05
start('Logo utama: Jejak Tunas','KONSEP LOGO ORIGINAL','Usulan simbol yang menyatukan jejak makhluk hidup dan pertumbuhan.')
rect(44,147,872,220,CREAM,LINE,18);logo(193,202,115)
card(44,390,278,'Jejak','Bagian bawah terasa seperti telapak makhluk: mengingatkan pada teman yang menemani perjalanan.',130)
card(341,390,278,'Tunas','Tiga bentuk atas memberi kesan tumbuh, hidup, dan berkembang bersama.',130)
card(638,390,278,'Nama yang terbaca','Wordmark membulat menggunakan Fredoka sebagai dasar. Detail huruf dapat disempurnakan saat finalisasi.',130)
note('Logo ini adalah usulan baru dalam PDF, bukan logo final yang telah dipasang di aplikasi. Hindari menganggapnya sudah disetujui.')

# 06
start('Sistem variasi logo','LOGO / LOCKUP','Gunakan satu keluarga bentuk agar identitas tetap dikenali pada ukuran dan media berbeda.')
rect(44,148,425,163,CREAM,LINE,16);logo(85,178,65);text('Primer horizontal',64,277,350,12,'Bold')
rect(490,148,426,163,GREEN,r=16);logo(531,178,65,CREAM);text('Versi negatif untuk latar gelap',510,277,370,12,'Bold',CREAM)
rect(44,333,425,180,'#E7EDDF',r=16);mark(213,356,75);text('Simbol tunggal',64,479,350,12,'Bold')
rect(490,333,426,180,CREAM,LINE,16);text('Elemonts',557,364,330,51,'Display',GREEN);text('Wordmark tanpa simbol',510,479,350,12,'Bold')
note('Versi satu warna memakai hijau, hitam, atau putih. Pertahankan bentuk yang sama pada semua versi.')

# 07
start('Ruang aman dan ukuran minimum','ATURAN LOGO','x = seperempat tinggi simbol. Sisakan minimal 1x ruang bebas di setiap sisi lockup.')
rect(85,166,540,190,'#E7EDDF',r=10);rect(112,193,486,136,CREAM,LINE)
logo(136,210,90)
line(85,150,112,150,GREEN,2);text('1x',83,126,50,13,'Bold')
text('Jangan menempatkan teks, ikon, atau tepi gambar di area hijau muda.',84,374,544,14)
mark(690,171,96);text('Ikon aplikasi',690,282,200,14,'Bold')
mark(690,327,32);mark(761,331,24);text('32 px',687,369,60,11);text('24 px',757,369,70,11)
table(['Penggunaan','Minimum yang disarankan'],[['Logo horizontal','120 px digital / 25 mm cetak; periksa keterbacaan pada ukuran nyata.'],['Simbol tunggal','24 px digital / 6 mm cetak. Di bawah itu, gunakan simbol yang disederhanakan.']],y=434,widths=[220,652],rowh=43)

# 08
start('Ikon aplikasi dan penggunaan yang dihindari','APLIKASI / LOGO','Logo harus tetap terbaca dalam ikon kecil, tema terang, tema gelap, dan mask Android.')
rect(64,163,185,185,GREEN,r=36);mark(100,195,113,CREAM)
rect(285,163,185,185,CREAM,LINE,36);mark(322,196,112,GREEN)
text('Dua varian konsep ikon aplikasi',64,368,410,16,'Display')
text('Gunakan simbol sebagai foreground terpisah. Untuk adaptive icon Android, uji mask lingkaran, rounded square, dan bentuk perangkat lain.',64,407,405,14)
bullet(['Jangan meregangkan atau memiringkan lockup.','Jangan mengubah warna setiap huruf.','Jangan menambahkan glow, bevel, atau bayangan berat.','Jangan menaruh logo langsung di area ilustrasi yang ramai.','Jangan memasukkan tagline kecil ke ikon aplikasi.'],520,164,370,15)
note('Ekspor toko Google Play: ikon listing 512 × 512 px. Adaptive icon mengikuti template Android; gunakan safe zone pusat 66 × 66 dp dari kanvas 108 × 108 dp.')

# 09
start('Palet utama: alam yang hangat','WARNA MEREK','Warna dasar memberi kesinambungan; aksen dipakai untuk membantu keputusan, bukan memenuhi layar.')
palette=[('Forest',GREEN,'Logo, CTA, navigasi aktif'),('Ink',INK,'Judul dan teks utama'),('Cream',CREAM,'Kartu dan dialog'),('Mist',BG,'Latar halaman'),('Leaf',LEAF,'Kemajuan dan aksen'),('Ember',ORANGE,'Penekanan penting'),('Muted',MUTED,'Teks pendukung')]
for i,(name,hx,use) in enumerate(palette):
    x=44+i*125;rect(x,157,116,150,hx,LINE,12);text(name,x,324,116,17,'Display');text(hx,x,352,116,12,'Bold');text(use,x,385,116,11.5)
text('Proporsi awal',44,465,180,18,'Display')
for x,w,hx,label in [(245,390,BG,'60% permukaan terang'),(635,195,GREEN,'30% hijau / tinta'),(830,65,ORANGE,'10%')]:
    rect(x,459,w,45,hx,LINE);text(label,x+8,473,w-16,10,'Bold',CREAM if hx!=BG else INK)
note('Rasio 60/30/10 adalah panduan komposisi materi merek, bukan aturan kaku untuk area battle yang memiliki ilustrasi dan warna elemen.')

# 10
start('Warna elemen dan warna status','WARNA FUNGSIONAL','Identitas elemen memakai warna + ikon + nama. Informasi penting tidak bergantung pada warna saja.')
elements=[('Api','#D95C29'),('Air','#238BA6'),('Listrik','#B58516'),('Tanah','#877052'),('Netral','#8C6FA0'),('Holy','#BF9F47'),('Dark','#535178')]
for i,(name,hx) in enumerate(elements):
    x=44+i*125;circle(x+45,202,40,hx);text(name,x,259,110,19,'Display');text(hx,x,290,110,12,'Bold')
table(['Status UI','Perilaku visual'],[['Berhasil','#294D34 + ikon centang + pesan hasil. Jangan hanya mengandalkan hijau.'],['Peringatan','#B94C1D + ikon perhatian + petunjuk tindakan.'],['Error / aksi gagal','#9B3434 + ikon + alasan yang jelas. Hindari kedipan merah berulang.'],['Nonaktif','#E4E8DF dengan teks #596555; tombol benar-benar tidak dapat dijalankan.']],y=343,widths=[200,672],rowh=43)
note('Warna elemen di atas mengikuti palet implementasi saat ini. Perubahan visual tidak mengubah hubungan elemen atau rumus battle.')

# 11
start('Kontras dan keterbacaan','AKSESIBILITAS','Target: minimal 4,5:1 untuk teks biasa; 3:1 untuk teks besar serta batas komponen penting.')
def lum(hx):
    vals=[int(hx[i:i+2],16)/255 for i in (1,3,5)]
    vals=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in vals]
    return .2126*vals[0]+.7152*vals[1]+.0722*vals[2]
def contrast(a,b):return (max(lum(a),lum(b))+.05)/(min(lum(a),lum(b))+.05)
pairs=[(INK,BG,'Teks utama'),(MUTED,CREAM,'Teks pendukung'),(CREAM,GREEN,'Tombol utama'),(ORANGE,CREAM,'Teks aksen'),(CREAM,LEAF,'Hindari untuk teks kecil')]
for i,(fg,bg,label) in enumerate(pairs):
    y=150+i*70;rect(44,y,360,55,bg,LINE,10);text('Elemonts · Aa 123',61,y+14,326,20,'Bold',fg)
    cr=contrast(fg,bg);text(f'{cr:.2f}:1',434,y+12,120,22,'Display',GREEN if cr>=4.5 else ORANGE)
    text(label+(' — lolos teks biasa' if cr>=4.5 else ' — gunakan teks gelap'),575,y+17,335,13)
note('Rasio dihitung dari warna solid sRGB. Teks di atas gambar, transparansi, dan kondisi fokus perlu diperiksa lagi pada desain final.')

# 12
start('Tipografi yang ramah dan jelas','TIPOGRAFI','Fredoka untuk karakter merek. Nunito Sans untuk membaca dan mengambil keputusan.')
text('Fredoka SemiBold',44,151,600,45,'Display',GREEN)
text('Teman kecil, petualangan besar.',44,218,840,30,'Display')
text('Aa Bb Cc Dd Ee Ff Gg 0123456789',44,267,840,25,'Display')
line(44,318,916,318)
text('Nunito Sans Regular / Bold',44,343,800,28,'Bold')
text('Lemahkan monster Wild, buka Tas, lalu pilih kapsul.<br/><b>Kurangi HP-nya tanpa membuat lawan KO.</b>',44,397,840,21)
text('ABCDEFGHIJKLMNOPQRSTUVWXYZ  ·  abcdefghijklmnopqrstuvwxyz  ·  0123456789',44,480,840,14)
note('Fredoka dan Nunito Sans memakai SIL Open Font License 1.1. Salinan lisensi ada di public/licenses proyek; sertakan saat mendistribusikan file font.')

# 13
start('Hierarki teks dan dua bahasa','TIPOGRAFI / LOKALISASI','Ukuran berikut adalah usulan awal untuk UI Android portrait, diuji lagi pada perangkat nyata.')
table(['Peran','Ukuran / tinggi baris','Penggunaan'],[['Judul layar','28 / 34 sp · Fredoka 600','Satu pesan utama per layar.'],['Judul bagian','20 / 26 sp · Fredoka 500–600','Bagian koleksi, panel, dan dialog.'],['Isi / instruksi','16 / 24 sp · Nunito 400','Tutorial, detail item, penjelasan skill.'],['Tombol / nama skill','15 / 20 sp · Nunito 700','Aksi harus mudah terbaca.'],['Label pendukung','12–13 / 18 sp · Nunito 600','PP, level, caption; bukan instruksi utama.']],y=150,widths=[220,270,382],rowh=57)
bullet(['Sediakan ruang ekstra sekitar 30% untuk terjemahan; jangan memotong instruksi penting.','Gunakan angka sejajar pada HP, PP, harga, dan statistik. Nama monster tetap sama di kedua bahasa.'],44,493,872,13)

# 14
start('Grid, jarak, dan bentuk','LAYOUT','Ruang yang konsisten membuat layar terasa tenang dan tombol mudah ditemukan.')
for i,v in enumerate([4,8,12,16,24,32]):
    x=44+i*142;rect(x,175,v*2,44,GREEN,r=3);text(f'{v} dp',x,234,125,17,'Bold')
table(['Token','Usulan penggunaan'],[['4 / 8 dp','Jarak ikon-teks dan rincian di dalam komponen.'],['12 / 16 dp','Padding komponen kecil dan margin layar ponsel.'],['24 / 32 dp','Jarak antarbagian utama dan materi promosi.'],['Radius 12 / 20 / 28 dp','Tombol / kartu / dialog besar; hindari terlalu banyak bentuk radius.']],y=293,widths=[260,612],rowh=48)
note('Target sentuh minimum 48 × 48 dp. Area aman mengikuti status bar, kamera layar, dan navigasi sistem; jangan menaruh CTA di bawahnya.')

# 15
start('Tombol, fokus, dan keadaan aksi','KOMPONEN / ACTION','Satu aksi utama pada setiap kelompok keputusan. Label menyebut tindakan yang akan dilakukan.')
states=[('Utama',GREEN,CREAM,'Masuk Wild'),('Sekunder','#E7EDDF',INK,'Lihat Koleksi'),('Nonaktif','#E4E8DF',MUTED,'Belum tersedia'),('Bahaya','#9B3434',CREAM,'Hapus data')]
for i,(label,bg,fg,button) in enumerate(states):
    x=44+i*220;text(label,x,151,200,16,'Bold');rect(x,190,200,55,bg,r=14);text(button,x+15,206,170,15,'Bold',fg)
rect(44,286,420,186,CREAM,LINE,16)
text('Fokus yang terlihat',63,302,380,21,'Display');rect(76,354,325,65,CREAM,ORANGE,18);rect(82,360,313,53,GREEN,r=13);text('Mulai latihan menangkap',103,375,275,16,'Bold',CREAM)
bullet(['Pressed: ubah kedalaman/warna ringan; jangan menggeser layout.','Loading: jelaskan proses dan cegah ketukan ganda.','Disabled: jelaskan syarat yang belum terpenuhi.','Aksi destruktif: tampilkan konsekuensi dan konfirmasi yang jelas.'],502,290,402,14)
note('Panduan wajib memberi outline pada aksi berikutnya. Outline fokus keyboard dan penanda tutorial harus tetap terlihat saat dipakai bersama.')

# 16
start('Kartu, indikator, dan navigasi','KOMPONEN / INFORMASI','Kartu monster, HP, dan menu memakai bahasa bentuk yang sama.')
rect(44,148,260,326,CREAM,LINE,20);monster('pyroo',87,169,173);text('Pyroo',64,348,200,25,'Display');tag('API',64,393,66,ORANGE);text('Lv. 5',210,399,70,12,'Bold');text('Teman petualanganmu',64,439,220,12,'Body',MUTED)
rect(334,148,582,137,CREAM,LINE,20);text('HP  38 / 54',354,166,520,18,'Bold');rect(354,211,535,16,'#E4E8DF',r=8);rect(354,211,376,16,GREEN,r=8);text('Angka + batang: hasil tetap terbaca ketika warna sulit dibedakan.',354,246,520,12)
rect(334,309,582,165,CREAM,LINE,20);text('Navigasi tetap',354,327,520,21,'Display')
for i,name in enumerate(['Rumah','Koleksi','Jelajah','Arena','Toko']):
    x=356+i*106;rect(x,380,98,62,'#E7EDDF' if i==2 else CREAM,r=12);circle(x+48,397,6,GREEN if i==2 else MUTED);text(name,x+7,418,85,11,'Bold',GREEN if i==2 else MUTED)
note('Contoh kartu adalah konsep komponen. Titik pada navigasi merupakan penanda posisi ikon; ikon produksi mengikuti grid pada halaman berikutnya.')

# 17
start('Ikon: sederhana pada ukuran kecil','IKONOGRAFI','Grid dasar 24 × 24 px, stroke sekitar 2 px, ujung membulat, dan satu gaya per keluarga ikon.')
def icon(kind,x,y,s,color=GREEN):
    c.saveState();c.translate(x,H-y-s);c.scale(s/24,s/24);c.setStrokeColor(col(color));c.setFillColor(col(color));c.setLineWidth(1.8);c.setLineCap(1);c.setLineJoin(1)
    p=c.beginPath()
    if kind=='Api':
        p.moveTo(12,22);p.curveTo(17,15,23,7,16,3);p.curveTo(8,-1,1,6,6,13);p.curveTo(7,8,11,11,12,22)
    elif kind=='Air':
        p.moveTo(12,22);p.curveTo(8,16,3,10,6,5);p.curveTo(9,0,17,0,19,6);p.curveTo(21,11,15,18,12,22)
    elif kind=='Listrik':
        for j,(a,b) in enumerate([(13,22),(5,10),(11,10),(9,2),(20,15),(13,15),(13,22)]): (p.moveTo if j==0 else p.lineTo)(a,b)
    elif kind=='Tanah':
        for j,(a,b) in enumerate([(2,4),(10,20),(15,11),(18,16),(23,4),(2,4)]):(p.moveTo if j==0 else p.lineTo)(a,b)
    elif kind=='Netral':
        for j in range(6):
            a=pi/3*j;(p.moveTo if j==0 else p.lineTo)(12+9*cos(a),12+9*sin(a))
        p.close()
    elif kind=='Holy':
        c.circle(12,12,5,fill=0,stroke=1)
        for j in range(8):a=pi/4*j;p.moveTo(12+8*cos(a),12+8*sin(a));p.lineTo(12+11*cos(a),12+11*sin(a))
    else:
        p.moveTo(16,22);p.curveTo(1,25,-2,4,12,2);p.curveTo(16,1,20,4,22,8);p.curveTo(9,3,6,18,16,22)
    c.drawPath(p,fill=0,stroke=1);c.restoreState()
for i,(name,hx) in enumerate(elements):
    x=44+i*125;rect(x,155,111,128,CREAM,LINE,16);icon(name,x+30,177,52,hx);text(name,x+10,250,92,14,'Bold')
card(44,322,425,'Aturan bentuk','Pakai metafora yang mudah dikenali. Jangan mencampur ikon 3D berbayang dengan ikon garis pada baris yang sama.',154)
card(490,322,426,'Aturan penggunaan','Ikon aksi penting disertai label. Keadaan aktif memiliki perubahan bentuk/latar selain warna. Uji pada 24 px dan 32 px.',154)
note('Tujuh ikon di atas adalah eksplorasi vektor untuk sistem elemen. Grid, stroke, dan keseimbangan optik perlu dirapikan pada master final.')

# 18
start('Bahasa bentuk monster','CHARACTER DIRECTION','Identitas setiap monster berasal dari siluet, proporsi, palet, dan ciri khas pada Excel desain.')
for i,name in enumerate(['pyroo','croobit','voltavi','mippo']):
    x=44+i*220;rect(x,152,204,235,CREAM,LINE,20);monster(name,x+12,159,180);text(name.capitalize(),x+18,349,165,22,'Display')
bullet(['Siluet harus tetap berbeda saat warna dihilangkan atau karakter dilihat dari jauh.','Mata, telinga, ekor, tanduk, dan bagian bercahaya menjadi penanda yang konsisten.','Kepribadian tampak dari pose: lincah, tenang, berat, atau penasaran sesuai karakter.'],44,414,872,15)
note('Contoh memakai portrait prototipe. Model 3D final, tekstur, dan rig belum ditetapkan hanya melalui gambar ini. Maskot utama juga belum dipilih.')

# 19
start('Evolusi dan ekspresi yang konsisten','CHARACTER SYSTEM','Evolusi memperkuat identitas keluarga sambil memperlihatkan pertumbuhan bentuk dan kekuatan.')
for i,(name,label) in enumerate([('pyroo','Pyroo'),('pyroar','Pyroar'),('infernox','Infernox')]):
    x=60+i*292;monster(name,x+30,150,200);text(label,x+23,364,244,25,'Display');text(f'Tahap {i+1}',x+24,404,244,12,'Bold',MUTED)
for x in [310,601]:text('→',x,247,60,30,'Bold',GREEN)
text('Lembar ekspresi minimum',44,463,310,19,'Display')
text('Netral / senang / penasaran / bersiap / terkena serangan / kelelahan. Pertahankan ciri wajah di semua pose dan dari semua sudut.',370,459,530,15)
note('Rangkaian ini menunjukkan keluarga evolusi yang sudah ada. Bentuk dan warna final mengacu pada revisi desain monster yang disetujui, bukan tebakan baru.')

# 20
start('Nusaraya sebagai ruang yang hidup','ENVIRONMENT DIRECTION','Lapisan depan, tengah, dan belakang membangun kedalaman tanpa menghalangi aksi.')
crop_image(R/'public/art/nusaraya.png',44,148,565,355)
for y,label in [(174,'BELAKANG · atmosfer'),(298,'TENGAH · ruang aksi'),(447,'DEPAN · bingkai alam')]:tag(label,60,y,210)
bullet(['Ruang tengah relatif bersih untuk dua monster dan efek serangan.','Vegetasi depan membingkai arena; hindari menutupi tubuh, HP, atau tombol.','Warna latar lebih tenang daripada fokus karakter.','Cuaca dan jam berbeda boleh mengubah suasana; identitas lokasi tetap dikenali.'],644,151,265,14)
note('Nuansa budaya atau arsitektur khusus Nusaraya belum ditetapkan. Jangan menambahkan identitas budaya tertentu sebagai fakta dunia tanpa keputusan tim.')

# 21
start('Contoh penerapan: rumah','MOCKUP KONSEPTUAL','Contoh arah komposisi; bukan perubahan fitur yang sudah diterapkan.')
px,py,pw,ph=phone(76,146,260,401)
text('Elemonts',px,py,pw,18,'Display');text('Selamat datang, teman.',px,py+42,pw,20,'Display')
rect(px,py+103,pw,173,'#E7EDDF',r=18);monster('pyroo',px+42,py+105,150)
text('Pyroo',px+12,py+253,pw-24,18,'Display');rect(px,py+295,pw,46,GREEN,r=13);text('Rawat temanmu',px+27,py+308,pw-40,14,'Bold',CREAM)
card(393,151,523,'Fokus pertama: hubungan','Monster menjadi titik perhatian. Sapaan singkat membangun suasana tanpa menutupi tindakan utama.',112)
card(393,280,523,'Informasi bertahap','Energi, intimasi, dan kebutuhan tampil ringkas. Detail bisa dibuka ketika pemain membutuhkannya.',112)
card(393,409,523,'Satu aksi utama','CTA mengikuti kebutuhan konteks. Tombol tambahan memakai gaya sekunder agar pemain tahu harus mulai dari mana.',112)
note('Mockup menunjukkan gaya visual, bukan menetapkan sistem kebutuhan baru atau mengubah fungsi makanan.')

# 22
start('Contoh penerapan: battle','MOCKUP KONSEPTUAL','Arena dan monster dominan; informasi hasil serta aksi berikutnya tetap mudah dibaca.')
px,py,pw,ph=phone(76,146,260,401)
text('Pertemuan di Nusaraya',px,py,pw,16,'Display')
rect(px,py+43,pw,160,'#E7EDDF',r=15);monster('pyroo',px-3,py+89,112);monster('croobit',px+112,py+60,100)
for x,label in [(px+8,'Pyroo'),(px+126,'Croobit')]:text(label,x,py+50,92,11,'Bold');rect(x,py+69,87,5,GREEN,r=2)
text('Apa yang akan Pyroo lakukan?',px,py+222,pw,14,'Bold')
for i,label in enumerate(['Terjang','Percik bara','Bertahan']):
    rect(px+i*76,py+255,70,45,'#E7EDDF',r=10);text(label,px+5+i*76,py+266,60,10,'Bold')
rect(px,py+315,pw,39,GREEN,r=12);text('Tangkap',px+72,py+325,110,13,'Bold',CREAM)
bullet(['HP selalu memiliki angka dan batang pada desain produksi.','Nama skill, PP, dan efek penting tampil sebelum aksi dipilih.','Saat animasi berlangsung, cegah input ganda dan beri status yang jelas.','Usulan rebranding: aksi Tangkap lebih terlihat untuk pertemuan Wild. Implementasi saat ini memakai Tas → kapsul.','Teks log mendukung aksi, tanpa menutupi arena atau menjadi satu-satunya penjelasan.'],392,151,515,14)
note('Tombol Tangkap langsung adalah usulan desain. Ketentuan menangkap, jumlah skill, serta rumus damage tetap mengikuti aturan game yang disepakati.')

# 23
start('Onboarding dan bahasa','EXPERIENCE IDENTITY','Panduan terasa seperti teman yang menunjukkan langkah berikutnya.')
rect(44,151,410,354,CREAM,LINE,20);tag('LATIHAN WAJIB  ·  3/4',64,175,201)
text('Sekarang buka Tas',64,225,365,27,'Display');text('HP lawan sudah berkurang. Buka Tas untuk memilih kapsul penangkap.',64,277,365,17)
rect(64,363,365,53,GREEN,r=14);text('Buka Tas',83,378,328,17,'Bold',CREAM)
text('Satu petunjuk, satu aksi, satu hasil yang terlihat.',64,452,365,13,'Body',MUTED)
bullet(['Tutorial menangkap wajib sudah ada pada prototipe 0.1.4: Wild → serangan → Tas → kapsul → Koleksi.','Berikan penanda pada tombol yang benar, lalu jelaskan hasilnya setelah animasi selesai.','Progres harus tetap bisa dilanjutkan setelah aplikasi ditutup.','English menjadi pilihan awal; pemain memilih English atau Bahasa Indonesia pada awal aplikasi dan dapat menggantinya di Pengaturan.'],495,154,412,15)
note('Teks contoh tetap ringkas. Instruksi tidak boleh memerlukan pemahaman istilah teknis seperti rig, VFX, atau state.')

# 24
start('Gerakan sebagai bagian dari identitas','MOTION DIRECTION','Lembut pada interaksi sehari-hari; tegas dan terarah pada battle.')
stages=[('01','Bersiap','Pose memberi tahu asal serangan.'),('02','Melepas','Gerak tubuh memulai efek.'),('03','Kontak','Benturan, reaksi, dan HP selaras.'),('04','Pulih','Kamera dan monster kembali siap.')]
for i,(n,title,desc) in enumerate(stages):
    x=44+i*220;rect(x,158,201,216,CREAM,LINE,16);text(n,x+17,177,160,24,'Display',LEAF);text(title,x+17,223,160,22,'Display');text(desc,x+17,275,164,14)
table(['Gerakan','Rentang awal untuk prototyping'],[['Respons UI','120–220 ms. Perubahan fokus dan tombol tidak menggeser layout.'],['Serangan biasa','Sekitar 1,5–2 detik; durasi final ditentukan melalui uji rasa battle.'],['Skill spesial','Sekitar 3–5 detik; pertimbangkan versi singkat untuk pengulangan.']],y=395,widths=[220,652],rowh=39)
note('Sediakan pengurangan gerakan/kilatan dan opsi guncangan kamera. Rentang waktu ini usulan desain, bukan klaim durasi implementasi sekarang.')

# 25
start('Grafis pendukung dan materi promosi','BRAND APPLICATION','Satu simbol kuat, satu pesan utama, dan satu fokus karakter pada setiap materi.')
rect(44,150,510,317,GREEN,r=18);logo(68,170,42,CREAM);text('Teman kecil,<br/>petualangan besar.',68,252,275,30,'Display',CREAM);monster('pyroo',340,247,192);tag('KENALI ELEMONTS',68,408,184,ORANGE)
rect(587,150,329,317,CREAM,LINE,18)
for row in range(3):
    for j in range(4):mark(610+j*73,175+row*90,36,'#D7E2CC')
text('Pola Jejak Tunas',607,424,280,17,'Display')
text('Banner contoh',44,488,270,17,'Bold');text('Pola digunakan sebagai aksen ringan',587,488,320,14,'Bold')
note('Jaga teks di area aman saat menyesuaikan format persegi, portrait, atau landscape. Jangan menambahkan fitur atau kualitas visual yang belum tersedia ke klaim promosi.')

# 26
start('Suara merek dalam tulisan','VERBAL IDENTITY','Ramah, jelas, dan membantu. Pemain memahami apa yang terjadi serta apa yang bisa dilakukan.')
text('Rawat. Berteman. Bertualang.',44,151,870,34,'Display',GREEN)
text('Care. Connect. Adventure.',44,203,870,24,'Display',MUTED)
table(['Situasi','Indonesia','English'],[['Tangkapan berhasil','Teman baru bergabung!','A new friend joins you!'],['Tangkapan gagal','Belum berhasil. Coba lemahkan lagi.','Not yet. Try weakening it further.'],['Monster lelah','Saatnya beristirahat.','Time for a rest.'],['Tutorial','Buka Tas, lalu pilih Mococapsule.','Open Bag, then choose Mococapsule.']],y=269,widths=[185,343,344],rowh=51)
note('Tagline adalah usulan. Nama Elemonts, Nusaraya, dan nama monster konsisten di kedua bahasa. Identitas audio akan dibahas terpisah setelah arah visual disepakati.')

# 27
start('Paket aset untuk produksi','HANDOFF TIM','Dokumen ini mengarahkan produksi. Berikut berkas yang perlu disiapkan setelah arah desain disetujui.')
table(['Kelompok','Berkas / keluaran','Yang harus diperiksa'],[['Logo','Master SVG/PDF; horizontal, simbol, positif/negatif; PNG transparan.','Ruang aman, satu warna, ukuran kecil, outline huruf pada master distribusi.'],['Aplikasi','Adaptive foreground/background; ikon listing; splash dan ukuran ekspor.','Mask Android, area aman, kontras, tidak ada teks terlalu kecil.'],['UI kit','Token warna/jarak/font; komponen dan semua state; mockup ID/EN.','Sentuh 48 dp, loading/disabled/error/focus, bahasa panjang.'],['Monster','Turnaround depan/samping/belakang; palet; model, tekstur, rig, animasi.','Siluet, ciri Excel, keluarga evolusi, gerak pada perangkat target.'],['Lingkungan','Arena, lapisan latar, pencahayaan, variasi yang dibutuhkan.','Ruang aksi bersih, karakter terbaca, biaya render.'],['Marketing','Template banner, kartu karakter, screenshot toko, pola pendukung.','Klaim sesuai fitur, ruang logo, konsistensi warna dan tipografi.']],y=147,widths=[130,390,352],rowh=61)
text('Penamaan usulan: elemonts_logo_primary_forest_v1.svg · elemonts_icon_adaptive_fg_v1.png · ui_button_primary_default_v1',44,563,872,10,'Body',MUTED)

# 28
start('Keputusan dan urutan rebranding','PENUTUP / SUMBER','Selesaikan identitas inti sebelum memperluasnya ke seluruh karakter dan layar.')
card(44,147,425,'Keputusan yang perlu dikunci','Nama merek final; logo dan simbol; tagline; palet; gaya 3D; maskot utama; target pemain; nuansa dunia Nusaraya.',140)
card(490,147,426,'Urutan implementasi','1. Setujui arah identitas. 2. Finalisasi master logo dan UI kit. 3. Poles dua monster serta satu battle. 4. Uji Android. 5. Perluas aset dan promosi.',140)
text('Kriteria siap diproduksi',44,316,410,21,'Display')
bullet(['Logo terbaca pada ukuran minimum dan semua mask ikon.','Teks serta kontrol memenuhi target kontras dan ukuran sentuh.','Monster sesuai acuan bentuk dan dapat dikenali lewat siluet.','Layar Indonesia/Inggris tetap rapi; animasi lancar di HP target.'],44,359,420,12.5)
text('Dasar dokumen',490,316,410,21,'Display')
text('Percakapan konsep Elemonts; roster dan implementasi 0.1.4; workbook bentuk 37 monster; ilustrasi Nusaraya dan portrait prototipe; font Fredoka serta Nunito Sans dari dependensi proyek.',490,359,410,13)
text('Usulan baru: Jejak Tunas, aturan lockup, sistem visual yang dirapikan, mockup, dan arahan promosi. Tidak mengubah aplikasi, nama resmi, atau aturan gameplay secara otomatis.',490,444,410,13)
note('Status: Design identity v1 untuk review rebranding. Dokumen ini tidak menyatakan logo sudah disetujui, merek terdaftar, atau semua aset sudah siap rilis.')

assert PAGE==N,(PAGE,N)
c.save()
print(OUT)
