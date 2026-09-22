"""Opt-in external evaluation; never imported by the app. Run explicitly with --run-gpt.
Uses OPENAI_API_KEY, sends only repository public/synthetic fixture facts, store=false.
Existing responses are reused. Delete an individual result to deliberately repeat it.
"""
import argparse
import json
import os
from pathlib import Path
import time
import urllib.request

parser = argparse.ArgumentParser()
parser.add_argument('--run-gpt', action='store_true', required=True)
parser.add_argument('--phase', action='store_true', help='Compare dated graha-dasha-gochar readings')
args = parser.parse_args()
out = Path(__file__).resolve().parents[2] / ('docs/evaluations/prashna-phase-2026-09-21' if args.phase else 'docs/evaluations/kundali-guidance-2026-09-18')
model = 'gpt-5.5-2026-04-23'
instructions = '''You are an independent evaluator writing a useful, plain-English Jyotish reading from supplied chart facts. You are not evaluating another answer. Answer the selected question in at most 250 words: a direct takeaway, two chart-linked interpretations with the supplied planet IDs as basis, three concrete practical next steps, and an honest timing limitation. Separate traditional interpretation from editorial practical advice. Do not claim scientifically established predictions, invent personal circumstances, guarantee outcomes, infer a profession or diagnose health. Period relevance alone is not favourable timing. If the subject is under 18, address a parent and avoid fixed career or ability labels. Do not use external tools. Do not repeat a technical chart dump.'''
if args.phase:
    instructions = '''Independently interpret the supplied public or synthetic chart for the selected question at BOTH supplied instants. You do not see our engine answer. Give at most 180 words per instant, then 100 words explaining what changed and why. Combine the natal chart, running Mahadasha/Antardasha and current gochar. Lead with a plain-language current-phase assessment and direction for that phase, then its specific chart reasons. Every proposed direction must connect to a named natal/dasha/transit fact; do not fill space with a generic business or career checklist. State conflicts and missing factors. Use exact supplied dasha intervals and distinguish Moon-relative transit judgement from Lagna-house topical links. Consider vedha when using a favourable transit rule. Do not invent dates, shadbala, divisional charts, an existing offer, current income, employer behaviour or guaranteed outcomes. Do not offer financial directives or employment guarantees. Treat this as a traditional interpretation, not a scientifically verified forecast. No external tools.'''
for case in json.loads((out / 'gpt-input.json').read_text()):
    dest = out / f"gpt-{case['id']}.json"
    if dest.exists():
        saved = json.loads(dest.read_text())
        if json.loads(saved['request']['input']) != case or saved['request']['instructions'] != instructions or saved['requestedModel'] != model:
            raise RuntimeError(f'Stale response for {case["id"]}; archive it before explicitly requesting a new evaluation')
        print(case['id'], 'cached', flush=True)
        continue
    payload = {'model': model, 'store': False, 'instructions': instructions, 'input': json.dumps(case), 'reasoning': {'effort': 'low'}, 'max_output_tokens': 4000 if args.phase else 2200}
    request = urllib.request.Request('https://api.openai.com/v1/responses', data=json.dumps(payload).encode(), headers={'Authorization': 'Bearer ' + os.environ['OPENAI_API_KEY'], 'Content-Type': 'application/json'})
    start = time.monotonic()
    with urllib.request.urlopen(request, timeout=150) as response:
        result = json.load(response)
    answer = '\n'.join(part['text'] for item in result.get('output', []) for part in item.get('content', []) if part.get('type') == 'output_text')
    record = {'caseId': case['id'], 'requestedModel': model, 'request': payload, 'responseId': result['id'], 'returnedModel': result['model'], 'status': result['status'], 'usage': result.get('usage'), 'seconds': round(time.monotonic() - start, 2), 'text': answer}
    dest.write_text(json.dumps(record, indent=2) + '\n')
    print(case['id'], result['status'], record['seconds'], 'seconds', flush=True)
    if result['status'] != 'completed' or not answer:
        raise RuntimeError('Incomplete output: inspect saved response before using the comparison')
