# RU-08 targeted fix and next live comparison

Prepared October 23, 2026 (America/New_York). Base: 2a8424d.
No GitHub push or live-provider run was performed in this patch session.

## What changed

1. New validateStudyPack.js validates live Gemini/Ollama study-pack shapes before controller cleanup or saving. It requires nonempty fields, four distinct question options, a matching answer, an explanation, bounded counts and exact-normalized unique prompts. Unexpected optional fields are stripped, not treated as fatal. Mock behavior remains unchanged for historical control compatibility.
2. Malformed provider output now produces HTTP 502 with a generic message instead of silently losing a question. This rejects the whole invalid pack; it does not repair it or automatically retry. It may reduce successfully returned packs while improving the reliability of accepted structures. A generated pack with no usable items is rejected.
3. Prompts request up to the target counts when source material is insufficient, prohibit external definitions/acronyms and semantic padding, retain attribution for contradictory claims, and emphasize defining conditions and concise short-note summaries.
4. Benchmark records validation issues and rejected raw outputs for synthetic test requests and hashes the new validator. A comparison script checks matching fixtures/model/parameters and reports structural/count/timing results without inventing semantic scores.

These are implementation changes, not proof of improved grounding. The original exact-count success criterion remains visible: returning fewer items still fails countsMet. Human agreement with four review findings did not approve a revised grading criterion. Shortfall acceptance requires explicit justification in the final report.

## Local evidence

- 30/30 validation checks passed: replay of all 18 previous Gemini packs, nine malformed variants, a valid shortfall, and two HTTP checks using a local Ollama-protocol stub.
- Replay accepted the 17 previously structurally valid packs and rejected F05/R3 with the missing options key. It is not a new Gemini generation run or a provider comparison.
- Stub HTTP test returned 502 through the study-pack route before reaching persistence. No database was used; the test does not establish persistence correctness.
- Stub valid-shortfall test returned one flashcard with a warning from the flashcards route.
- Existing M01–M09 checks passed; HTTP probe suite passed 23/23; frontend build passed.
- Runtime: Linux, Node v24.19.0. Dependencies reused from the identical-lockfile local checkout; no dependency update was made.

Evidence: evidence/ru08/fix-local, fix-midpoint, fix-http, and fix-build.txt. Original live results remain unchanged.

## Apply locally

1. In your repository, check `git status` and `git rev-parse HEAD`. Base is 2a8424d. Preserve uncommitted edits. If the three replacement files below have changed since that commit, merge instead of overwriting.
2. Extract this ZIP separately, then merge its server, validation, docs and evidence folders into the repository root. It replaces server/src/services/ai/aiService.js, server/src/services/ai/prompts.js and validation/ru08/benchmark.mjs, and adds the other supplied files. It includes the review notes and student confirmation record so these can be pushed together.
3. Run from the repository root:

```powershell
node validation/ru08/validation-regression.mjs evidence/ru08/fix-windows-1
npm.cmd run build
```

The validation test deliberately prints an invalid-study-pack error for its negative test; inspect the final pass/fail counts. Expected: 30 passes, zero failures. This test needs the already committed gemini-windows-1 raw file and installed/generated dependencies.

4. Run the live comparison using your existing local server/.env (18 additional provider calls, subject to quota/billing):

```powershell
node --env-file=server/.env validation/ru08/benchmark.mjs gemini evidence/ru08/gemini-windows-2
node validation/ru08/compare-runs.mjs evidence/ru08/gemini-windows-1 evidence/ru08/gemini-windows-2 evidence/ru08/comparison-1
```

Keep the same model, machine, inputs and request counts. Any rejected response is retained in runs.jsonl. Never reuse an output directory; choose a fresh suffix for another run. An interrupted run may lack summary.json and cannot be treated as complete. Do not share server/.env. Inspect provider error text before sharing results.

5. Push only the changed source/scripts/documentation and evidence, then share the commit. The next review must inspect whether sparse-note additions, repeated meaning, contradiction handling and definition coverage actually improved. Do not claim these are fixed solely because the local tests passed.

## AI usage and remaining limits

AI authored the validator, prompt revisions, regression harness, comparison helper and benchmark instrumentation; ran local checks; and drafted this note. Representative user context: accepted findings and instruction to compare, followed by "ok" to proceeding with the fix-and-rerun workflow. Exact model identifier unavailable. Student accepted four selected baseline findings in conversation; student patch application/review and live after-fix evaluation remain pending.

Shape validation cannot prove factual accuracy, detect all semantic duplicates or resolve contradictory source material. No automatic retries, output repair, timeout policy, database test, authentication fix or dependency remediation is claimed. Longer-term testing should add held-out notes beyond these six synthetic fixtures.
