# RU-08 technical evidence starter package

Prepared October 23, 2026 (America/New_York). Raw timestamps use UTC.
Base repository: https://github.com/sulpya00/studysmart-js
Base commit: 52e7f1ca9d5d8fc5718b1c2845b3b93c98e6537b (dev).
This package adds evaluation files only. No application source changes or GitHub push were made. This is an interim evidence package, not a completed submission.

## Question and measurement boundary

How reliably does Study Smart generate structurally complete, source-grounded study material across normal and difficult notes?

Measurement points: fixture -> generateStudyPack -> provider -> raw output and timer. Separately: HTTP request -> JSON parser -> rate limiter -> request validation -> mock generation -> output cleanup -> response. Database saving, history retrieval, UI behavior and learning outcomes are outside these new tests. Earlier persistence evidence remains historical evidence, not a new persistence test.

## Run on Windows

1. Open your current repository folder. Check `git rev-parse HEAD`. This package was tested against the commit above; review compatibility if your source has changed.
2. Extract the ZIP elsewhere, then copy its `validation/ru08`, `docs/ru08` and `evidence/ru08` folders into the matching folders of your repository. Preserve existing files; do not overwrite any prior run.
3. Open PowerShell in the repository root. If dependencies are already installed and Prisma is generated, skip installation. Otherwise use `npm.cmd ci` and `npm.cmd run db:generate`.
4. Run the local control and HTTP probes in new directories:

```powershell
node validation/ru08/benchmark.mjs mock evidence/ru08/mock-windows-1
node validation/ru08/http-probes.mjs evidence/ru08/http-windows-1
```

5. For live Gemini, your existing `server/.env` must contain `GEMINI_API_KEY` and `GEMINI_MODEL`. Keep the key local. The command uses the configured model and makes 18 sequential generation requests (six fixtures, three repetitions), subject to your provider quota and billing. No app server or database needs to run for this direct-service test.

```powershell
node --env-file=server/.env validation/ru08/benchmark.mjs gemini evidence/ru08/gemini-windows-1
```

6. Share `evidence/ru08/gemini-windows-1` after checking its contents. Do not share `.env`. The harness does not record environment-variable values other than the model identifier. Inspect any provider error text before sharing. Each completed request is saved immediately in `runs.jsonl`; an interrupted process may lack the final summary. Do not merge interrupted and complete runs silently.

Output directories must be new; use a new suffix for reruns. No Python is needed: fixtures.json is already generated. make-fixtures.py is supplied only to document fixture construction.

## Fixed method

Six synthetic database-note fixtures: 50-word complete notes; 327-word multi-section notes; 56-word bullet notes; 100-word repeated notes; seven-word sparse notes; 29-word contradictory notes. Word counts use whitespace splitting, including bullet symbols. The 7-word fixture still exceeds the HTTP content minimum in characters.

Each run requests six flashcards and five questions. Three sequential repetitions per fixture; fixed fixture-major order; no warmup and no harness-level retries. Application code does not explicitly set temperature or seed. SDK-level behavior is not controlled by this harness. The same committed generation service and prompt are used for mock and Gemini, but mock is only a workflow control, not an educational-quality competitor.

Timing uses performance.now around the generation-service call, including response parsing. Successful-call median/min/max are reported separately from errors; failed-call timings remain in raw logs. Tiny mock timings do not estimate live API latency. Eighteen requests are a small convenience sample, not a load test or population estimate. Three deterministic mock repetitions are not independent quality observations.

Metadata captures Node, platform, CPU, memory, commit, working-tree status, script/fixture/lock/source SHA-256 hashes, selected model and parameters. Dependency installation: npm ci --ignore-scripts followed by npm run db:generate in this execution environment. No database connection was required for these probes.

## Acceptance and review rules

Existing requested-count criteria remain unchanged: a run meets counts only with exactly six cards and five questions. Shortfalls remain visible even when avoiding invented material is the better behavior. Do not relabel them full acceptance passes.

New diagnostic checks: nonempty summary; card fronts/backs present; each question has four distinct nonempty options, its answer among them, and an explanation; exact normalized duplicate front/prompt counts. Normalization lowercases and collapses whitespace; it does not detect semantic duplicates. RETURNED means the service completed, not that its content passed every criterion. Exit zero means no generation exceptions; inspect summary.json for actual counts and checks.

For each successful output, human-review.json contains expected facts for both the generated summary and a lead-sentence baseline. Fill covered as 1 (fully and correctly preserved), 0.5 (partially preserved), or 0 (missing/incorrect), plus reviewer and rationale. Coverage = sum of scores / number of expected facts, reported per fixture and repetition. Keep original blank templates alongside completed reviews. Do not treat an unresolved contradiction as resolved factual truth.

The baseline takes whole leading source sentences up to the generated summary's word count. It may use fewer words because it never truncates a sentence; report actual lengths. This is a simple paired diagnostic baseline whose budget depends on output length, not an independently fixed competitive benchmark. Review coverage for both texts without assuming Gemini is better.

Also review every summary, card answer, correct answer and explanation for unsupported factual claims, errors, semantic duplicates and usefulness. Record exact item IDs and supporting source passages in separate review notes. Distractors are intentionally incorrect alternatives; evaluate whether one answer is uniquely defensible rather than counting every distractor as a hallucination. Report reviewer identity, review date, number of outputs reviewed, and unresolved judgments. Student review is pending; no accuracy score or superiority claim is currently supported.

## Recorded results

See REVIEW.md for results and limitations, ISSUES.md for priorities, and AI-USAGE.md for this session's disclosure. Retained evidence includes both preliminary and final runs. Use mock-final and http-corrected for current results.

## Still required for submission

Live Gemini results; completed content review and baseline comparison; current persistence validation if retained as part of the core question; interpretation against approved success criteria; final report and recorded walkthrough. No supervisor discussion or student review is claimed.
