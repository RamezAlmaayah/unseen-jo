"""Local derivatives of licensed originals; never uploads or changes CMS rows."""
import hashlib,json
from pathlib import Path
from PIL import Image,ImageOps
root=Path('docs/evidence/automated-publishing')
manifest=json.loads((root/'media-package.json').read_text(encoding='utf-8'))
out=root/'responsive';out.mkdir(exist_ok=True)
items=[]
for photo in manifest['photos']:
    original=Path(photo['path'])
    with Image.open(original) as source:
        source=ImageOps.exif_transpose(source).convert('RGB')
        variants=[]
        for width in (640,1280,2000,2560):
            if source.width<width: continue
            height=round(source.height*width/source.width)
            image=source.resize((width,height),Image.Resampling.LANCZOS)
            path=out/f"{photo['id']}-{width}.jpg"
            image.save(path,quality=90,optimize=True,subsampling=0)
            data=path.read_bytes()
            variants.append(dict(width=width,height=height,path=path.as_posix(),bytes=len(data),sha256=hashlib.sha256(data).hexdigest()))
    items.append(dict(id=photo['id'],original=photo['path'],originalSha256=hashlib.sha256(original.read_bytes()).hexdigest(),license=photo['license'],attribution=photo['attribution'],changes='Resized without upscaling; JPEG quality 90; metadata stripped. Same source licence applies to derivatives.',variants=variants))
(root/'responsive-manifest.json').write_text(json.dumps(dict(scope='Prepared locally only; not uploaded, not CMS approval',images=items),ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(f"Prepared {sum(len(p['variants']) for p in items)} responsive JPEGs from {len(items)} preserved originals")
