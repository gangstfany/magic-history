"""Apply reviewed prose to the original snapshot before building both pages."""
import json
from pathlib import Path

def revise_chain_content(world):
    ledger=json.loads(Path(__file__).with_name('chain-review-revisions.json').read_text())
    for edit in ledger['edits']:
        old,new=edit['old'],edit['new']
        assert world.count(old)==1, (edit['chain'],edit['field'],edit['index'],world.count(old))
        world=world.replace(old,new,1)
    return world
