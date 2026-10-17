# Midpoint mock output correction

Base: dev aa18a3556e0a560f85c74ed8aee9dbddf0e535c5.
Prepared October 16, 2026. This is a local proposed patch, not a GitHub push.

## Changes and acceptance boundary

The mock generator no longer cycles through statements to pad requested counts.
The original four-fact ACID fixture now returns four unique flashcards and four
unique questions. When more items are requested than returned, the API reports
the shortfall and the summary view displays it. This notice is generated for the
current response; it is not stored with history. Existing saved duplicate sets
are not rewritten: create a new topic to check the fix.

The consistency sentence is now recognized as a preserves statement, producing
the complete prompt "What does Consistency preserve?". Unrecognized statements
use a simple completion prompt instead of a truncated seven-word question.
Question explanations retain the corresponding source fact. The unrelated
healthy-habits distractor has been removed. Generic distractors and completion
prompts still require human quality review; these changes do not establish
educational usefulness or factual accuracy across subjects.

Reopening history no longer sets request counts from a saved output that may
contain fewer than the API minimum of three items. Current requested counts
remain available for subsequent generation.

## Retained evidence

- Before: `evidence/midpoint-before/core/results.json` — original C01–C12:
  10 pass, 2 fail (C04, C05), exit 1.
- After: `evidence/midpoint-after/original-core/results.json` — unchanged
  original suite: 9 pass, 3 fail (C01, C04, C05), exit 1.
- New explicit capped-output regression: `evidence/midpoint-after/regression`:
  M01–M09 all pass, exit 0. Includes the same ACID input, enough facts to fill
  requested counts, repeated notes, biology, incomplete notes, long notes,
  empty direct input and isolated HTTP shortfall responses.
- `npm run build` succeeded with Vite 8.1.5. Prisma client 6.19.0 was generated.
- Execution environment: Linux, Node v24.19.0, npm 11.9.0. Installation used
  `npm ci --ignore-scripts`, followed by `npm run db:generate`.

The original suite deliberately remains unchanged. C01 expects exactly six
cards; C04/C05 compare unique counts against six/five requested items. Those
criteria are still unmet for four facts. The new checks separately establish
uniqueness and an explicit shortfall. Missing items still count as failures
under SC2. No green full-acceptance claim is made.

The summary still has an eight-point limit. The incomplete-notes check confirms
that the mock does not invent a missing explanation, not that its output is
usable. No database, browser interaction, Gemini or Ollama validation was
performed in this patch session. Dependency remediation remains open.

## Apply on Windows

1. Stop the dev server. Preserve any uncommitted local edits before replacing files.
2. From the project folder, run `git rev-parse HEAD` and check the base above.
   If it differs, review changes before copying; do not blindly replace newer work.
3. Copy the ZIP's `client`, `server`, `validation`, `docs` and `evidence` folders
   into the project root, merging folders and replacing the three changed source
   files. This ZIP contains only the changed files and new evidence, not a full app.
4. Run `node validation/midpoint-checks.mjs evidence/midpoint-windows/regression`.
   Expected: M01–M09 pass. Then run `npm.cmd run build`.
5. Restart with `npm.cmd run dev`. Select mock, create a new ACID topic requesting
   six cards/five questions, and confirm four unique cards/four unique questions,
   the visible shortfall notices, the complete consistency prompt, answer reveal
   and correct/incorrect feedback. Reopen the new topic and verify saved content.
6. Share the test output and browser observation. A Windows save/reopen result,
   application/database restart evidence and a final validation commit remain next.

Do not run the original HTTP script into its default evidence directory for this
patch: it would overwrite historical results and its H04 still expects six cards.
The new regression script uses a separate output directory.

## AI assistance record

User context: instructor's Assignment 6 feedback, agreed next step to correct the
mock generator, and exact repository message:
`https://github.com/sulpya00/studysmart-js`.
Tool: ChatGPT/Codex; exact model identifier not available in this session.
AI prepared changes to mockProvider.js, aiController.js, App.jsx and
validation/midpoint-checks.mjs, ran the commands above, and drafted this note.
Student application, review and verification are pending. No supervisor meeting
is claimed; the user requested skipping it.
