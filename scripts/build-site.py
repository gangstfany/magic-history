"""Build independent course and shared-shell artifacts for static deployment."""
from pathlib import Path
import runpy, sys
ROOT = Path(__file__).resolve().parents[1]
source = ROOT / 'src/apwh'
sys.path.insert(0, str(source))
runpy.run_path(str(source / 'build.py'), run_name='__main__')
runpy.run_path(str(ROOT / 'scripts/build-shell.py'), run_name='__main__')
