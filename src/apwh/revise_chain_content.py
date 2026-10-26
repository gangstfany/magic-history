"""Build the published chain array from the reviewed, structured APWH source.

The snapshot and chain-review-revisions.json remain historical inputs/ledgers;
causal-chains.json is the current content source, including contextual notes.
"""
import json
import re
from pathlib import Path

def revise_chain_content(world):
    chains=json.loads(Path(__file__).with_name('causal-chains.json').read_text())
    assert len(chains)==49 and sum(len(c['stops']) for c in chains)==225
    assert len({c['id'] for c in chains})==len(chains)
    for chain in chains:
        size=len(chain['stops'])
        assert all(len(chain[field])==size for field in ('labels','evidence','links','stepNotes')),chain['id']
        assert all(chain['labels']) and all(chain['evidence']),chain['id']
    payload=json.dumps(chains,ensure_ascii=False,indent=2).replace('<','\\u003c').replace('\n','\n  ')
    world,count=re.subn(r'const CHAINS = [\s\S]*?\n  \];',lambda _: 'const CHAINS = '+payload+';',world,count=1)
    assert count==1,'Missing or duplicate causal-chain source array'
    return world
