import json, unittest
from pathlib import Path
HERE=Path(__file__).resolve().parent

class CorrectionsTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.units=json.loads((HERE/'content-corrected.json').read_text())
        cls.rows={r['id']:r for u in cls.units for r in u['records']}

    def test_no_original_record_removed(self):
        original=json.loads((HERE/'content-audit-data.json').read_text())
        self.assertTrue({r['id'] for u in original for r in u['records']} <= self.rows.keys())
        self.assertEqual(len(self.rows),240)

    def test_fixed_dates_and_topics(self):
        self.assertEqual(self.rows['apwh-u1-baghdad-abbasid-knowledge-hub']['startYear'],762)
        self.assertEqual(self.rows['apwh-u3-ming-qing-restoration-expansion']['endYear'],1759)
        self.assertIn('1641',' '.join(self.rows['apwh-u3-tokugawa-confucian-sakoku-hierarchy']['evidence']))
        self.assertIn('5.1',self.rows['apwh-u5-seneca-declaration-sentiments']['topicCodes'])

    def test_graph_relations_are_reciprocal(self):
        for r in self.rows.values():
            for field,other in [('causeStudyPointIds','effectStudyPointIds'),('effectStudyPointIds','causeStudyPointIds'),('relatedStudyPointIds','relatedStudyPointIds')]:
                for target in r[field]:
                    self.assertIn(r['id'],self.rows[target][other])
                    self.assertEqual(r['connectionNotes'][target],self.rows[target]['connectionNotes'][r['id']])
        rights=self.rows['apwh-u9-paris-universal-rights-global-norm']
        self.assertNotIn('apwh-u9-paris-kyoto-burden-sharing-debate',rights['effectStudyPointIds'])

    def test_new_core_coverage_is_substantive_and_sourced(self):
        new=[r for r in self.rows.values() if r.get('authorship')=='teacher-created']
        self.assertEqual(len(new),9)
        for r in new:
            self.assertGreaterEqual(len(r['evidence']),2)
            self.assertTrue(r['sourceUrls'])
            self.assertTrue(r['relatedStudyPointIds'] or r['causeStudyPointIds'] or r['effectStudyPointIds'])
        text=json.dumps(new).lower()
        for term in ['reformation','trent','nanak','adam smith','marx','social darwinism','champa','civil-service']:
            self.assertIn(term,text)

    def test_geography_and_retained_qualifiers(self):
        trent=self.rows['apwh-u3-trent-catholic-reform-trent']
        self.assertEqual(trent['locationNumber'],'35')
        self.assertEqual(next(x['name'] for x in self.units[2]['locations'] if x['number']=='35'),'Trent')
        paris=self.rows['apwh-u9-paris-voluntary-climate-governance-limits']
        self.assertNotIn('relies more on voluntary',' '.join(paris['connectionNotes'].values()))
        self.assertIn('https://polioeradication.org/about-polio/history-of-polio/',self.rows['apwh-u9-geneva-vaccination-smallpox-eradication']['revisionSources'])

if __name__=='__main__':unittest.main()
