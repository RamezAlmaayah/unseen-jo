from pathlib import Path
from PIL import Image

# Resize only the original, approved symbol. No new logo or private destination asset.
folder = Path('public/assets/branding')
folder.mkdir(parents=True, exist_ok=True)
source = Image.open('public/assets/figma/preferences/brand-logo.png').convert('RGBA')
source.resize((112, 106), Image.Resampling.LANCZOS).save(folder / 'unseen-jo-email-logo-v1.png', optimize=True)
print('Prepared original logo for 56 x 53 email display at 2x resolution.')
