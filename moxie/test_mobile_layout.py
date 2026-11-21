"""Regression coverage for the mobile Contents-to-intro spacing contract."""
import re
import unittest
from pathlib import Path

P = Path(__file__).resolve().parent


class MobileLayoutTests(unittest.TestCase):
    def test_contents_counts_clearance_once_and_leaves_28px_to_stripe(self):
        for path in (P / 'jaack-moxie.css', P / 'dist/style.css'):
            with self.subTest(css=path.name):
                css = path.read_text()
                media = re.search(
                    r'@media\s*\(max-width:\s*639px\)\s*\{'
                    r'((?:[^{}]|\{[^{}]*\})*)\}',
                    css[css.index('/* Moxie —'):],
                ).group(1)
                spacing = re.search(r'\.mobile-menu\s*\+\s*\.layout\s*\{([^}]+)\}', media).group(1)
                self.assertNotIn('--jk-top-clearance', spacing)
                layout_top = int(re.search(r'padding-top:\s*(\d+)px', spacing).group(1))
                intro = re.findall(r'(?:^|\})\s*\.intro\s*\{([^}]+)\}', css)[-1]
                intro_top = int(re.search(r'padding:\s*(\d+)px', intro).group(1))
                self.assertEqual(layout_top + intro_top, 28)
                self.assertRegex(css, r'\.deck-theme \.intro::before\{height:5px;margin:0 0 14px\}')
                self.assertIn('.mobile-menu{margin-top:var(--jk-top-clearance);top:var(--jk-top-clearance)}', css)
                # Other layouts, including desktop TOCs, retain their original clearance.
                self.assertIn('.layout{gap:40px;padding-top:var(--jk-top-clearance);padding-bottom:40px}', css)
                self.assertEqual(css.count('.mobile-menu + .layout'), 1)

    def test_built_contents_precedes_layout_and_guide_intro(self):
        pages = 0
        for path in (P / 'dist').glob('*/**/index.html'):
            html = path.read_text()
            if '<details class="mobile-menu">' not in html:
                continue
            pages += 1
            self.assertRegex(html, r'</details><div class="layout with-toc">')
            self.assertIn('<main id="content"><header class="intro">', html)
        self.assertGreater(pages, 0)

    def test_local_app_is_deferred_and_copied_to_build(self):
        self.assertEqual((P / 'app.js').read_bytes(), (P / 'dist/app.js').read_bytes())
        for lang in ('it', 'en'):
            html = (P / 'dist' / lang / 'guides/mono-green-landfall/index.html').read_text()
            self.assertIn('<script src="/app.js" defer></script>', html)


if __name__ == '__main__':
    unittest.main()
