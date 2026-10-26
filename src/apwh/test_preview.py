from pathlib import Path
import html, re, unittest, json

HERE = Path(__file__).resolve().parent
ROOT=HERE.parents[1]
SOURCE = HERE / 'source-map-snapshot.html'

def world(text):
    return html.unescape(re.search(r'id="worldMapFrame"[^>]*srcdoc="([^"]*)"', text).group(1))

class PreviewTests(unittest.TestCase):
    def test_trade_panel_styles_are_shared_with_the_host(self):
        document = (ROOT / 'index.html').read_text()
        host_head = document.split('</head>', 1)[0]
        map_head = (ROOT/'world-map.html').read_text().split('</head>', 1)[0]
        selector = r'<style id="world-panel-styles">([\s\S]*?)</style>'
        host_css = re.search(selector, host_head)
        map_css = re.search(selector, map_head)
        self.assertIsNotNone(host_css, 'Mirrored trade content must receive its styles in the host head')
        self.assertIsNotNone(map_css)
        self.assertEqual(host_css[1], map_css[1])
        for name in ['.world-trade-picker', '.world-trade-pick', '.world-trade-kind', '.world-trade-current']:
            self.assertIn(name, host_css[1])
        self.assertRegex(host_css[1], r'\.world-trade-picker\s*\{[^}]*display:\s*grid')
        self.assertRegex(host_css[1], r'\.world-trade-pick\s*\{[^}]*text-align:\s*left')

    def test_nine_revised_units_keep_every_original_id(self):
        before = world(SOURCE.read_text())
        after = (ROOT/'world-map.html').read_text()
        scripts = lambda t: [s for s in re.findall(r'<script[^>]*>([\s\S]*?)</script>', t) if re.search(r'function publishUnit\dLocationStudy', s)]
        self.assertEqual(len(scripts(before)), 9)
        self.assertEqual(len(scripts(after)), 9)
        original=json.loads((HERE/'content-audit-data.json').read_text())
        corrected=json.loads((HERE/'content-corrected.json').read_text())
        for u,v in zip(original,corrected):
            self.assertTrue({r['id'] for r in u['records']} <= {r['id'] for r in v['records']})
            for r in v['records']:
                self.assertIn(r['id'],after)

    def test_complete_reading_and_collapsible_cards(self):
        text = (ROOT / 'index.html').read_text()
        w = (ROOT/'world-map.html').read_text()
        self.assertIn('data-preview-number', w)
        self.assertIn('data-preview-section', w)
        self.assertIn('locationStudyState.expandedStudyId === id ? null : id', w)
        self.assertNotIn('locationStudyState.expandedStudyId = records[0].id;', w)
        detail = w.split('function studyDetailHTML(record, api)')[1].split('function renderLocationStudy')[0]
        self.assertNotIn('studyDisclosureHTML(', detail)
        for label in ['Region', 'Summary', 'Why It Matters', 'Use It on the Exam', 'Key Terms', 'Evidence', 'Connections', 'People']:
            self.assertIn(label, detail)
        self.assertIn('backLocationStudyConnection', w)

if __name__ == '__main__':
    unittest.main()
