"""Explicitly requested responsive preparation; original source bytes stay untouched."""
import json, hashlib
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
root=Path('docs/evidence/phase08')
data=json.loads((root/'media-acquisition.json').read_text(encoding='utf-8'))
(root/'responsive').mkdir(exist_ok=True);(root/'upload').mkdir(exist_ok=True)
rows=[]
previous={p['id']:p for p in json.loads((root/'derivatives.json').read_text(encoding='utf-8'))} if (root/'derivatives.json').exists() else {}
for photo in data['photos']:
    original=root/'originals'/f"{photo['id']}.jpg"
    raw=original.read_bytes()
    assert hashlib.sha256(raw).hexdigest()==photo['sha256']
    cached=previous.get(photo['id'])
    if cached and cached.get('originalSha256')==photo['sha256'] and all(Path(v['path']).exists() and hashlib.sha256(Path(v['path']).read_bytes()).hexdigest()==v['sha256'] for v in cached['renditions']) and Path(cached['uploadPath']).exists() and hashlib.sha256(Path(cached['uploadPath']).read_bytes()).hexdigest()==cached['uploadSha256']:
        rows.append(cached)
        continue
    with Image.open(original) as source:
        image=ImageOps.exif_transpose(source).convert('RGB')
        variants=[]
        for width in sorted(set(min(w,image.width) for w in [320,640,1280,2400])):
            resized=image.resize((width,round(image.height*width/image.width)),Image.Resampling.LANCZOS)
            path=root/'responsive'/f"{photo['id']}-{width}.webp"
            resized.save(path,format='WEBP',quality=92,method=6)
            content=path.read_bytes();variants.append({'width':width,'height':resized.height,'path':str(path).replace('\\','/'),'bytes':len(content),'sha256':hashlib.sha256(content).hexdigest()})
        upload=original
        modifications='Original file unchanged. Responsive derivatives use proportional Lanczos resizing and WebP quality 92; display cropping may apply.'
        if len(raw)>5*1024*1024:
            image.thumbnail((4000,4000),Image.Resampling.LANCZOS)
            upload=root/'upload'/f"{photo['id']}.jpg"
            image.save(upload,quality=94,optimize=True)
            if upload.stat().st_size>5*1024*1024:
                image.thumbnail((3000,3000),Image.Resampling.LANCZOS);image.save(upload,quality=92,optimize=True)
            assert upload.stat().st_size<=5*1024*1024
            modifications='Storage upload resized without upscaling to fit the existing 5 MiB limit, JPEG quality 92–94; full-resolution source original preserved locally. Responsive WebP renditions are separate; display cropping may apply.'
        content=upload.read_bytes()
        rows.append({'id':photo['id'],'originalSha256':photo['sha256'],'originalWidth':photo['width'],'originalHeight':photo['height'],'uploadPath':str(upload).replace('\\','/'),'uploadBytes':len(content),'uploadSha256':hashlib.sha256(content).hexdigest(),'modifications':modifications,'renditions':variants})
for start in range(0,len(data['photos']),12):
    photos=data['photos'][start:start+12];sheet=Image.new('RGB',(1200,((len(photos)+3)//4)*225),'white');draw=ImageDraw.Draw(sheet)
    for index,p in enumerate(photos):
        with Image.open(p['originalPath']) as im:
            thumb=ImageOps.contain(ImageOps.exif_transpose(im).convert('RGB'),(294,190));x=(index%4)*300;y=(index//4)*225;sheet.paste(thumb,(x,y));draw.text((x+3,y+195),p['id'][:39],fill='black')
    sheet.save(root/'previews'/f'contact-{start//12+1}.jpg',quality=93)
(root/'derivatives.json').write_text(json.dumps(rows,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(f'Prepared {len(rows)} originals, {sum(len(r["renditions"]) for r in rows)} non-upscaled derivatives; originals unchanged.')
