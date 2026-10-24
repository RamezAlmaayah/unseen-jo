"""Inspect real hosted samples without modifying any image or CMS metadata."""
import json, math
from pathlib import Path
from PIL import Image, ImageChops, ImageStat

path=Path('docs/validation/hosted-image-delivery.json')
report=json.loads(path.read_text(encoding='utf-8'))
originals={r['slug']:r for r in report['results'] if r['width']=='original'}
for row in report['results']:
    with Image.open(row['path']) as image:
        row['actualWidth'],row['actualHeight']=image.size
        if row['width']=='original': continue
        with Image.open(originals[row['slug']]['path']) as original:
            reference=original.convert('RGB').resize(image.size,Image.Resampling.LANCZOS)
            difference=ImageChops.difference(reference,image.convert('RGB'))
            mse=sum(v*v for v in ImageStat.Stat(difference).rms)/3
            row['psnrAgainstLanczosReferenceDb']=round(10*math.log10(255*255/mse),2) if mse else None
            row['upscaled']=image.width>original.width or image.height>original.height
            assert not row['upscaled']
path.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
scores=[r['psnrAgainstLanczosReferenceDb'] for r in report['results'] if 'psnrAgainstLanczosReferenceDb' in r]
print(f'Hosted originals and variants inspected; no sampled upscaling. PSNR {min(scores)} to {max(scores)} dB (pixel comparison, not a perceptual guarantee).')
