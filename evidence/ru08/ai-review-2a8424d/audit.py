"""Recompute mechanical measures only; qualitative review is in CONTENT-REVIEW.md.
Run from repository root: python evidence/ru08/ai-review-2a8424d/audit.py
Prints JSON to stdout and never modifies raw evidence.
"""
import json, hashlib
from pathlib import Path
p=Path('evidence/ru08/gemini-windows-1/runs.jsonl')
rows=[json.loads(x) for x in p.read_text().splitlines()]
measures=[]
for r in rows:
    inp=len(r['input']['content'].split())
    summary=len(r['output']['summary'].split())
    measures.append(dict(fixture=r['fixture'],repeat=r['repeat'],inputWords=inp,summaryWords=summary,baselineWords=len(r['baseline']['text'].split()),validCards=r['metrics']['validCards'],validQuestions=r['metrics']['validQuestions'],missingOptionsQuestionIds=[i for i,q in enumerate(r['output']['questions'],1) if not isinstance(q.get('options'),list)]))
print(json.dumps(dict(source=str(p),sourceSha256=hashlib.sha256(p.read_bytes()).hexdigest(),reviewType='Mechanical measures; not semantic scores',runs=measures,shortRuns=len([r for r in measures if r['inputWords']<=250]),shortRunsExpanded=len([r for r in measures if r['inputWords']<=250 and r['summaryWords']>r['inputWords']]),validCards=sum(r['validCards'] for r in measures),validQuestions=sum(r['validQuestions'] for r in measures)),indent=2))
