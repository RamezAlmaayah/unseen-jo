"""Read-only validation of original bytes, prepared uploads and responsive files."""
import hashlib,json
from pathlib import Path
from PIL import Image,ImageOps
root=Path('docs/evidence/phase08')
manifest=json.loads((root/'import-package.json').read_text(encoding='utf-8'))
acquired=json.loads((root/'media-acquisition.json').read_text(encoding='utf-8'))
for p in acquired['photos']:
    raw=Path(p['originalPath']).read_bytes()
    assert hashlib.sha1(raw).hexdigest()==p['sha1'],p['id']
    assert hashlib.sha256(raw).hexdigest()==p['sha256'],p['id']
results=[]
for p in manifest['photos']:
    upload=Path(p['uploadPath']).read_bytes()
    assert len(upload)==p['uploadBytes']<=5242880
    assert hashlib.sha256(upload).hexdigest()==p['uploadSha256']
    assert p['rightsEligible'] and p['identityStatus']=='visually checked'
    with Image.open(p['originalPath']) as image:
        source=ImageOps.exif_transpose(image)
        for v in p['renditions']:
            raw=Path(v['path']).read_bytes()
            assert len(raw)==v['bytes'] and hashlib.sha256(raw).hexdigest()==v['sha256']
            with Image.open(v['path']) as resized:
                assert resized.format=='WEBP' and resized.size==(v['width'],v['height'])
                assert resized.width<=source.width and resized.height<=source.height
                assert abs(resized.height-source.height*resized.width/source.width)<=1
    results.append({'name':p['id']+' original/upload/derivative hashes, dimensions, no upscaling, license and visual-check record','status':'passed'})
out={'scope':'Real local downloaded files and genuine Pillow decoding/hash checks; no hosted upload, approval or rendering claim','originals':len(acquired['photos']),'preparedPhotos':len(manifest['photos']),'derivatives':sum(len(p['renditions']) for p in manifest['photos']),'results':results}
Path('docs/validation/phase08-media.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf-8')
print(f"PASS {out['originals']} unchanged originals, {out['preparedPhotos']} prepared photos and {out['derivatives']} responsive derivatives")
