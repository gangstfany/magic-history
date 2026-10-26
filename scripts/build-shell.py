"""Build the shared homepage without reading any course data or source."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
(ROOT / 'index.html').write_text((ROOT / 'src/site/index.template.html').read_text())
print('Built shared index.html')
