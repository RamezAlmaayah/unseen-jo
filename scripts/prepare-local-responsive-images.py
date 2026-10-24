"""Reproducible display derivatives; approved Figma originals remain byte-for-byte intact."""
import hashlib, json
from pathlib import Path
from PIL import Image, ImageOps

assets = json.loads(Path('src/data/figma-assets.json').read_text(encoding='utf-8'))
out = Path('public/assets/responsive')
out.mkdir(parents=True, exist_ok=True)
manifest = {}
previous_path=Path('docs/validation/local-image-derivatives.json')
previous=json.loads(previous_path.read_text(encoding='utf-8')) if previous_path.exists() else {}
for asset in assets:
    source = Path('public' + asset['path'])
    if source.suffix.lower() not in ('.jpg', '.jpeg', '.png', '.webp'):
        continue
    data = source.read_bytes()
    if len(data) < 16000:
        continue
    digest = hashlib.sha256(data).hexdigest()
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        variants = []
        widths = (80, 160, 320) if any(term in source.name for term in ('logo', 'profile', 'compass', 'action', 'badges')) else (320, 640, 960, 1280, 1920, 2560)
        for width in sorted(set(w for w in (*widths, min(image.width, 2560)) if w <= image.width)):
            height = max(1, round(image.height * width / image.width))
            prior=next((v for v in previous.get(asset['path'],{}).get('variants',[]) if v['width']==width and previous[asset['path']]['originalSha256']==digest),None)
            legacy=Path('public'+prior['src']) if prior else out / f'{digest[:20]}-{width}.webp'
            if legacy.exists():
                encoded=legacy.read_bytes()
            else:
                from io import BytesIO
                stream=BytesIO()
                image.resize((width, height), Image.Resampling.LANCZOS).save(stream, 'WEBP', quality=92, method=4)
                encoded=stream.getvalue()
            target=out / f'{hashlib.sha256(encoded).hexdigest()[:20]}-{width}.webp'
            if not target.exists(): target.write_bytes(encoded)
            variants.append(dict(src='/' + target.as_posix().removeprefix('public/'), width=width, height=height, bytes=len(encoded), sha256=hashlib.sha256(encoded).hexdigest()))
        manifest[asset['path']] = dict(originalSha256=digest, width=image.width, height=image.height, variants=variants)
previous_path.write_text(json.dumps(manifest,indent=2)+'\n',encoding='utf-8')
runtime={path:dict(hashWidths=[[v['sha256'][:20],v['width']] for v in item['variants']]) for path,item in manifest.items()}
Path('src/data/responsive-images.json').write_text(json.dumps(runtime, separators=(',',':'))+'\n', encoding='utf-8')
referenced={Path('public'+v['src']).resolve() for item in manifest.values() for v in item['variants']}
for generated in out.glob('*.webp'):
    assert generated.resolve().parent==out.resolve()
    if generated.resolve() not in referenced: generated.unlink()
print(f'Prepared responsive WebP delivery for {len(manifest)} original paths; identical originals share variants.')
