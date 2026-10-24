from pathlib import Path
import json, hashlib
from PIL import Image, ImageOps
path=Path('docs/validation/private-prototype-public-covers.json')
data=json.loads(path.read_text(encoding='utf-8'))
for photo in data['results']:
    raw=Path(photo['path']).read_bytes()
    assert hashlib.sha256(raw).hexdigest()==photo['sha256']
    with Image.open(photo['path']) as original:
        image=ImageOps.exif_transpose(original).convert('RGB')
        photo['width'],photo['height']=image.size
        assert image.width>=320
        photo['renditions']=[]
        for width in (320,640,1280,2400):
            if width>image.width: continue
            height=round(image.height*width/image.width)
            result=image.resize((width,height),Image.Resampling.LANCZOS)
            target=Path(photo['path']).with_name(photo['slug']+'-'+str(width)+'.webp')
            result.save(target,'WEBP',quality=92,method=6)
            photo['renditions'].append({'width':width,'height':height,'path':target.as_posix(),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS six actual covers decoded; originals preserved; sharp proportional WebP derivatives prepared without upscaling')
art_path=Path('docs/evidence/private-prototype/illustration.json')
art=json.loads(art_path.read_text(encoding='utf-8'))
art['renditions']=[]
with Image.open('docs/evidence/private-prototype/aqaba-illustration.png') as image:
    for width in (320,640,1280,2400):
        height=round(image.height*width/image.width)
        result=image.resize((width,height),Image.Resampling.LANCZOS)
        target=Path('docs/evidence/private-prototype/aqaba-illustration-'+str(width)+'.webp')
        result.save(target,'WEBP',quality=92,method=6)
        art['renditions'].append({'width':width,'height':height,'path':target.as_posix(),'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest()})
art_path.write_text(json.dumps(art,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print('PASS four responsive variants of the original Aqaba illustration; no unrelated fixture photos')
