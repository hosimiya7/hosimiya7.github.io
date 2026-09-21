"""Build responsive WebP copies of the LP's screen captures (requires Pillow)."""
from pathlib import Path
import re

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
SCREENS = ROOT / "assets/images/screens"
OUTPUT = SCREENS / "optimized"
OUTPUT.mkdir(exist_ok=True)
html = (ROOT / "index.html").read_text(encoding="utf-8")
names = sorted(set(re.findall(r'assets/images/screens/(?:optimized/)?([\w-]+)\.webp', html)))
names = [name for name in names if not name.endswith("-480")]
original_total = full_total = small_total = 0


def save_webp(image, destination):
    # Keep the previous preview usable while an image is being encoded.
    temporary = destination.with_suffix(".webp.tmp")
    image.save(temporary, "WEBP", quality=90, method=6)
    temporary.replace(destination)


for name in names:
    source = SCREENS / f"{name}.webp"
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGBA")
        save_webp(image, OUTPUT / source.name)
        small = image.resize((480, round(image.height * 480 / image.width)), Image.Resampling.LANCZOS)
        save_webp(small, OUTPUT / f"{name}-480.webp")
    original_total += source.stat().st_size
    full_total += (OUTPUT / source.name).stat().st_size
    small_total += (OUTPUT / f"{name}-480.webp").stat().st_size
    print(f"{name}: {source.stat().st_size:,} -> {(OUTPUT / source.name).stat().st_size:,} / {(OUTPUT / f'{name}-480.webp').stat().st_size:,} bytes", flush=True)
print(f"Totals: original={original_total:,}, full={full_total:,}, 480px={small_total:,} bytes")
