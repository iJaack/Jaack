"""Compatibility entry point: publish the bilingual hub, not the retired single page."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name('build_hub.py')),run_name='__main__')
