"""Render the planning documents and the reference-art storyboard wall."""
from pathlib import Path
import json,html,collections,hashlib
R=Path(__file__).resolve().parent
p=json.loads((R/'page-plan.json').read_text());inv=json.loads((R/'current-panel-inventory.json').read_text());by={x['id']:x for x in inv};s=p['summary']
chapters=[]
for ep in dict.fromkeys(x['episode'] for x in inv):
 old=[x for x in inv if x['episode']==ep];new=sorted({a['page'] for x in old for a in x['plannedAssignments']})
 chapters.append(dict(id=ep,current=[old[0]['currentPage'],old[-1]['currentPage']],planned=new))
fetch=json.loads((R.parent/'balakanda-v1/source-fetch-manifest.json').read_text())
refs={}
for x in fetch['records']:refs.setdefault(x['sarga'],[]).append({'language':x['language'],'url':x['url'],'status':'Inherited reference; not fetched or collated in this layout audit.'})
for pg in p['pages']:pg['publicationReferences']=[x for n in pg['sourceSargas'] for x in refs[n]]
p['chapterMap']=chapters
p['contentPolicy']={'dialogue':'70 proposed speech frames, from existing reported speech/requests/responses. Original planning paraphrases, not scripture quotations. Compare both publication sources before final lettering. No filler chatter, invented romance, curses/prayer texts or motives.','captions':'Name, place, time, an unseen cause or a necessary consequence only. Most action should be visible. Aim at two short caption blocks per page plus name/time labels; exceptions for complex legends/genealogy require an explicit review. Old narration remains a fact checklist, not the new page copy.','translation':'Approve the complete Hindi/English script, then author Gujarati/Kannada against the same stable beats. Review all four full narratives, every transition and the ending. Never use silent English fallback as a translated proof.','art':'Shared text-free art; script-aware live balloons. Plan painted space around identified speakers and complete actions. No empty band, crop-to-fit, stretched faces, tiny text or repeated scenery strips. Match every new/recomposed asset to its own reviewed bounds/hash.','scroll':'Narrative grouping sets page boundaries. Language/size controls may change height while preserving page and stable scene anchor. Targets are estimates; readable copy and complete art override them. If a page exceeds roughly1.85 reading viewports at Large, first widen the dialogue row or move a complete beat to the next page; never split a reply from its question to hit a cap.','native':'Keep current reader shell, horizontal swipe, typography and safe-area ownership. Browser proof buttons are not a request to add native previous/next. Replace one-panel-per-page data with explicit page.rows and multiple speech entries per frame; keep source IDs and chapter jump anchors. No implementation in this task.'}
(R/'page-plan.json').write_text(json.dumps(p,ensure_ascii=False,indent=2)+'\n')
# Reviewable complete Markdown plan.
lines=['# Bālakāṇḍa: complete page storyboard','', 'Status: planning draft, 2026-10-16. Full-book artwork and reader implementation have not started.','',f"Reviewed all{s['currentPanels']} current panels in{s['currentEpisodes']} episodes, covering{s['sourceSargas']} sarga arcs. Proposed{s['proposedPages']} pages with{s['proposedFrames']} frames, including{s['additionalShots']} additional shots that unpack existing content. All140 source panel IDs are retained in order; no source panel omitted.",'', '## Reading contract','']
for k,v in p['contentPolicy'].items():lines.append(f'- **{k.title()}**: {v}')
lines+=['','## Page-by-page plan','', 'Each line below is a storyboard instruction. Reference art is not proof that the new shot or balloon position has been illustrated. Hindi/English lines are draft source-based paraphrases; final translation and two-publication checks are pending.','']
for pg in p['pages']:
 lines += [f"## {pg['number']:02}. {pg['title']}",'',f"**{pg['rowCount']} rows** · current pages {', '.join(map(str,pg['currentPages']))} · sargas {', '.join(map(str,pg['sourceSargas']))} · {pg['dialogueBalloonCount']} dialogue frames.",'',f"Purpose: {pg['layoutReason']}",'',f"Entry: {pg['entryContext']}",'']
 for n,row in enumerate(pg['rows'],1):
  lines += [f"### Row {n} — {'full width' if len(row)==1 else 'two paired panels'}",'']
  for x in row:
   lines += [f"- **{x['id']}** · source `{x['sourcePanel']}` ({x['source']}) · {x['mode']}: {x['beat']}"]
   if x['draftHi']:lines += [f"  - {x['speaker'] or 'Caption'}: {x['draftHi']}",f"  - English: {x['draftEn']}"]
   lines += [f"  - Art: {x['artWork']}"]
 lines += ['',f"Scroll target: Standard {pg['scrollTarget']['standardViewportRange'][0]}–{pg['scrollTarget']['standardViewportRange'][1]} reading viewports; Large {pg['scrollTarget']['largeViewportRange'][0]}–{pg['scrollTarget']['largeViewportRange'][1]}. Authoring estimate, not measured final layout.",'',f"Next: {pg['transitionToNext']}",'']
 if pg['editorialNote']:lines += [f"Continuity/editorial: {pg['editorialNote']}",'']
lines+=['## Remaining review','']+[f'- {x}' for x in p['pending']]
(R/'PAGE-PLAN.md').write_text('\n'.join(lines)+'\n')
# Quantified current-book audit with every original page mapped.
metrics={k:json.loads((R/f'evidence/metrics-{k}.json').read_text()) for k in ['hi-standard','en-standard','hi-large','en-large']}
report=['# Whole-book audit and proposed repair','', 'Reviewed: 2026-10-16. Scope: current140-panel hi/en retelling, all29 episodes, all77 sarga arcs.','', '## What was inspected','', 'The complete Hindi and English narratives, all adjacent transitions, art action descriptions and source references were read. Current-run browser captures show all140 complete reviewed art frames at Standard and Large in both authored languages:560 states in28 contact sheets. Each screenshot was opened and visually inspected. Gujarati/Kannada full-book narratives do not yet exist; the four-language sample is not full-book coverage.','', 'Browser model:390px page,604px reading viewport; imported existing speech geometry and source fonts. The screenshots show full content even beyond604px, so the lower artwork can be reviewed. Empty percentage is max(0,(604 − contentHeight −8)/604)×100. This is a layout diagnosis, not a device measurement, interior-image emptiness metric or native certification.','', '| Browser state | Panels with ≥30% empty viewport | Panels with ≥50% empty viewport |','| --- | ---: | ---: |']
for k,m in metrics.items():report.append(f"| {k} | {sum(x['blankPercent']>=30 for x in m)} | {sum(x['blankPercent']>=50 for x in m)} |")
report+=['','## Findings, in reading order','', '1. **Opening/prologue — needs regrouping.** Current p5 leaves53% empty at Hindi Standard and compresses teaching plus a later royal recital. Proposed pages2–3 separate the emotional cause, Brahma’s instruction, writing, teaching and the clearly labelled later-time court.','2. **Journeys and legends — needs visible causes and timeline labels.** Solitary wide scenes leave repeated gaps. Proposed pages5–45 group related beats; present-day departures/arrivals remain explicit. Reported speech is moved to identified speakers where supported, while legends use short named teller captions.','3. **Conflicts — needs action–response shots.** Current panels such as bk-19-05, bk-20-05/06 and bk-21-04/05 pack gift/attack/defence, rise/fall/rescue or teaching/prayer/reprieve together. New shots separate those existing beats; they add no new plot.','4. **Mithila and marriages — preserve identities, vary emphasis.** Proposed pages46–55 give the bow break and central wedding full hero scenes; the other three couples remain individually named and fully illustrated. No crowd crop or invented vows.','5. **Parashurama and return — dialogue first, complete ending.** Proposed pages57–59 use the approved sample’s conversation anatomy. Pages60–62 restore Varuna’s bow handoff, the embrace, all four brides’ welcome, Yudhajit’s role and the quiet final scene.','6. **Languages and accessibility — plan, not certification.** Locale/size may grow page height; retain page and source-scene anchor. Up to two columns on phone. Screen-reader order must follow row/column and identify speakers. Minimum font/tap, contrast, scaling and gesture behaviour still require native checks.','', 'Strengths retained: source-linked stable identities, reviewed complete foreground frames, distinct character models and the full existing ending. No new reader controls or release changes are made.','', '## The repair','', f"{s['proposedPages']} pages:8 single-row emphasis pages,19 two-row pages and35 three-row pages. {s['proposedFrames']} planned frames include59 additional shots of already represented events.70 draft speech frames replace31 dialogue-bearing source panels; this is an authoring plan, not70 verified quotations. Captions lose repeated description; visual action and reactions carry the sequence. Page count is the outcome of the current storyboard, not a quota: final script/art review may revise it.",'', '## Worst empty pages and their destinations','', '| Current page | Stable panel | Hindi Standard empty | Proposed pages | Repair |','| ---: | --- | ---: | --- | --- |']
for x in inv:
 if x['measurements']['hi-standard']['blankPercent']>=50:report.append(f"| {x['currentPage']} | {x['id']} | {x['measurements']['hi-standard']['blankPercent']}% | {', '.join(map(str,sorted({a['page'] for a in x['plannedAssignments']})))} | Group/recompose complete beat; separate compressed cause or return label where needed. |")
report+=['','## Complete original-page inventory','', '| Current page | Stable panel | Hindi Standard empty | Proposed page:row | Diagnosis |','| ---: | --- | ---: | --- | --- |']
for x in inv:report.append(f"| {x['currentPage']} | {x['id']} | {x['measurements']['hi-standard']['blankPercent']}% | {', '.join(dict.fromkeys(str(a['page'])+':'+str(a['row']) for a in x['plannedAssignments']))} | {' '.join(x['diagnosis'])} |")
report+=['','## Captured review steps','', '| Step | Existing pages | General health | Current-run evidence |','| ---: | --- | --- | --- |']
for n in range(1,8):report.append(f"| {n} | {(n-1)*20+1}–{n*20} | Complete art loaded; captions dominate and density varies. Detailed per-panel findings above. | [Hindi Standard](evidence/current-hi-standard-{n}.png), [English Standard](evidence/current-en-standard-{n}.png), [Hindi Large](evidence/current-hi-large-{n}.png), [English Large](evidence/current-en-large-{n}.png) |")
report+=['','## Source and completion boundary','', 'Canonical source for this audit is the checked-in bilingual retelling and matching native book, not a newly collated Sanskrit edition. Existing sarga/publication links and complete original hi/en facts are preserved in the inventory and page plan. Historical154 fetch records point to a missing local /tmp cache; they are not current evidence of editorial comparison. New speech is a planning paraphrase of existing reported speech, requests or responses. Compare the exact passages in two publications before final lettering; author and read all four full scripts before illustration sign-off.','', 'The current episode-heading ranges underreport bridge panels in bk-06 (includes1.22) and bk-16 (includes1.48). The plan derives sources from actual panel sarga unions. New chapter jumps must land on the first relevant frame, including inside a shared page.','', 'No new full-book artwork, replacement reader, manifest activation, CDN upload, OTA, commit or release was performed. Native Standard/Large proof and final editorial/rights review remain pending.']
(R/'AUDIT.md').write_text('\n'.join(report)+'\n')
readme=f'''# Bālakāṇḍa layout plan

Review draft · 2026-10-16 · before artwork/reader implementation.

Open [the storyboard wall](index.html) through a local server rooted at `docs/content-parity/ramayan-comic`, or use the retained local review link: http://127.0.0.1:8744/comic/balakanda-layout-plan/ .

All140 current panels were reviewed, in Hindi and English at Standard/Large browser-model sizes. Every source panel is mapped, in order, to62 proposed pages with199 frames. The59 extra shots separate existing actions/reactions; they are not new story events.

| Layout | Proposed pages | Use |
| --- | ---: | --- |
| 1 row | 8 | Birth, emotional departures/resolutions, Ganga descent, renunciation, bow break and wedding emphasis |
| 2 rows | 19 | Establishment, paired scenes and calm transitions |
| 3 rows | 35 | Questions/answers, action/response and linked consequences |

70 draft dialogue frames (current book31) plus9 named teller captions. Silence remains useful; do not add chatter to a ceremony or invent scripture dialogue. The 62-page count may change after complete script/art review.

- [Complete page-by-page storyboard](PAGE-PLAN.md): every row/frame, draft Hindi/English speech, purpose, transition, scroll target and artwork instruction.
- [Full140-page audit](AUDIT.md): quantified spacing, per-panel diagnosis and28 current-run visual sheets.
- [Machine-readable plan](page-plan.json): source refs, stable scene IDs, chapter jumps, geometry intentions and inherited publication links.
- [Original panel inventory](current-panel-inventory.json): complete original Hindi/English facts, actual asset hashes/frames, measurements and proposed destinations.
- [Panel-to-page map](panel-to-page.csv): all199 planned frame assignments, including repeated source IDs for separately staged shots.
- [Validation](validation.json): coverage, ordering, source/native parity and image evidence checks.

Reference images in the wall are the existing art. They are not newly illustrated shots, approved final crops or final balloon placements. Long captions must be rewritten after plan acceptance; do not simply place the original prose above each thumbnail.

Natural scroll targets are authoring estimates, not tested output: a hero about1 viewport, a gentle page about1.05–1.35 Standard, and dense pages about1.2–1.6 Standard (Large may reach1.85). Complete art/readability wins over a cap. Keep the same page/scene when switching language or size; permit per-language height and balloon placement.

Next sequence: review this storyboard → compare changed speech against both publication sources and finalise the full hi/en script → author/review gu/kn against the same beats → approve representative dense/hero/legend layouts → commission/review art in episode batches → integrate the native rows renderer → inspect every page in all four languages at Standard/Large. No full-book build starts from this planning task.
'''
(R/'README.md').write_text(readme)
# Evidence hash index preserves exact captured bytes.
evidence=[dict(file=str(x.relative_to(R)),sha256=hashlib.sha256(x.read_bytes()).hexdigest()) for x in sorted((R/'evidence').glob('*.png'))]
(R/'evidence-index.json').write_text(json.dumps({'reviewedOn':'2026-10-16','scope':'Current-run browser-model capture; all28 sheets opened and inspected. Full foreground artwork retained.','captures':evidence},indent=2)+'\n')
print('Rendered complete page plan,140-panel audit and source map')
