"""Build the complete site and its reviewed World History module."""
from pathlib import Path
import runpy,sys
source=Path(__file__).resolve().parents[1]/'src/apwh'
sys.path.insert(0,str(source))
runpy.run_path(str(source/'build.py'),run_name='__main__')
