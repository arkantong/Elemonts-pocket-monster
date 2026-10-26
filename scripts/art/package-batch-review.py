"""Arrange actual Blender renders into labeled review sheets and zip deliverables."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import zipfile
root=Path(__file__).resolve().parents[2]
p=root/'design/characters/batch-01-v1'
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
for name,desc in [('pyroo','Rubah mochi / api'),('croobit','Buaya mungil / air')]:
    sheet=Image.new('RGB',(1600,1770),'#fff7ed');d=ImageDraw.Draw(sheet)
    d.text((50,28),'ELEMONTS  /  POCKET PALS',font=ImageFont.truetype(font,24),fill='#765a83')
    d.text((50,68),name.title()+' — Studi 3D 01',font=ImageFont.truetype(font,46),fill='#382344')
    d.text((50,128),desc+'  |  Render asli Blender • tahap review bentuk',font=ImageFont.truetype(font,23),fill='#765a83')
    for idx,(view,label) in enumerate([('three-quarter','01 / TIGA PEREMPAT'),('front','02 / DEPAN'),('side','03 / SAMPING'),('back','04 / BELAKANG')]):
        x=(idx%2)*800;y=185+(idx//2)*780
        im=Image.open(p/f'{name}-{view}.png').convert('RGB').resize((730,730))
        sheet.paste(im,(x+35,y));d.text((x+38,y+733),label,font=ImageFont.truetype(font,21),fill='#5d4b7b')
    d.text((50,1740),'Editable .blend + .glb • Belum rig / animasi • Belum mengganti karakter dalam game',font=ImageFont.truetype(font,19),fill='#765a83')
    sheet.save(p/f'{name}-review.jpg',quality=94)
with zipfile.ZipFile(root/'downloads/elemonts-character-study-01.zip','w',zipfile.ZIP_DEFLATED) as z:
    for f in sorted(p.iterdir()):
        if f.is_file() and not f.name.endswith('.blend1'):z.write(f,'Elemonts-Character-Study-01/'+f.name)
    z.write(root/'scripts/art/build-batch-01.py','Elemonts-Character-Study-01/build-batch-01.py')
print('Packaged review sheets and editable models.')
