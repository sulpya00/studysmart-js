# StudySmart | Independent reviewer guide

StudySmart converts student notes into a summary, flashcards and practice questions. A reviewer can generate one synthetic topic, reopen it from history and check that the stored material matches the generated output.


## 1. Start an isolated reviewer database

Use Node.js 24.x and npm 11.x on a desktop with a terminal, browser, local filesystem access, network access for npm packages and Prisma engines, and free ports 4000, 5173 and 55432. The reviewer route runs on CPU. It needs no GPU, API key, Docker or existing PostgreSQL service. Tested versions are in [the transcript](evidence/ru10/clean-run.txt). On Windows PowerShell, use npm.cmd if script execution policy blocks npm.

In terminal A, run these commands in order. Leave the last command running.

```sh
npm ci
npm --prefix validation/ru10/database ci
npm --prefix validation/ru10/database start
```

Wait for “PGLiteSocketServer listening” on 127.0.0.1:55432. The separate lockfile pins a local PostgreSQL-compatible PGlite service for this single-reviewer simulation. Its data stays under validation/ru10/database/review-data. Use a fresh extraction for a new empty run.

## 2. Configure and launch the application

In terminal B at the same project root, copy server/.env.review.example to server/.env. In PowerShell use `Copy-Item server/.env.review.example server/.env`. On macOS/Linux use `cp server/.env.review.example server/.env`. For an existing configured copy, edit the reviewer URL in server/.env to include &pgbouncer=true and restart both services. Copy the template only when configuring a new extraction.

```sh
npm run db:generate
npm run db:push
npm run build
npm run dev
```

Expect a generated Prisma 6.19.0 client, a schema-sync confirmation and client/dist/index.html. Wait for both the Vite URL and “StudySmart API running” before testing. Leave both terminals running. Open http://localhost:5173. Vite forwards /api to Express on port 4000. Express validates requests, calls the selected provider, and uses Prisma to store study packs in the database. A GET to http://localhost:5173/api/health checks the proxy and API. A database write is checked separately below.

## 3. Reproduce a saved study pack

In terminal C at the root, run:

```sh
node validation/ru10/save-reopen.mjs
node validation/midpoint-checks.mjs review-output/midpoint-1
node validation/ru08/validation-regression.mjs review-output/replay-1
```

Run all three commands from the project root. The test email needs no separate account registration in this prototype. The first command submits F01 through the Vite proxy, requests six cards and five questions, checks the saved topic against the response and submits empty notes expecting HTTP 400. Look for PASS, a generated topicId, flashcards 6, questions 5 and reopened true. Each execution adds one synthetic topic. Sign in locally as ru10-reviewer@example.test, enter any demo password, open History and select “Short complete notes” to inspect it. To generate manually, use the F01 title and content from [the fixtures](validation/ru08/fixtures.json) and choose “Local demo — no external AI”.

The other commands exercise mock behavior and validation of recorded outputs. Expect nine midpoint passes and 30 replay/validation passes. An invalid-pack error in the replay console is expected for the deliberate HTTP 502 case. Use new output directory names for later runs. Stop terminal B and then terminal A with Ctrl+C after reviewing.

## 4. Native PostgreSQL or Docker alternative

For a native server, create a dedicated empty database studysmart_ru10 and a login role that owns it. Start PostgreSQL, copy server/.env.example to server/.env, and replace the username, password, host and port in DATABASE_URL. Percent-encode reserved characters in credentials. Use a disposable database for db:push. Install the root dependencies and follow sections 2 and 3, skipping the PGlite helper and review-template copy.

For Docker Compose, set the shell variable RU10_DB_PASSWORD to a local alphanumeric password and run `docker compose up -d --wait postgres` at the root. Use server/.env.example with that password. The supplied Compose file creates studysmart_ru10 on loopback port 5432. Run `docker compose stop postgres` to stop and retain the volume. This optional native-engine route was not executed in the RU-10 pass.

## Inputs, configuration and service assumptions

- No training dataset or database dump is needed. F01 and the other fixtures contain synthetic academic notes. The archived JSONL contains earlier generated answers for repeatable replay. Note content must be 40–20,000 characters and the title 2–120. Keep private class materials, identifiable notes, real accounts and credentials outside any handoff.
- Mock output depends on the note text and requested counts. No seed is needed. Short notes can yield fewer unique items and a warning. The API accepts an explicit provider/model per request, which can override the server default.
- Gemini requires server-side GEMINI_API_KEY, an accessible GEMINI_MODEL and outbound network access. Enter settings only in server/.env, restart the API and select the intended Gemini model in the UI. The note text is sent to that provider. Availability, quotas and generated wording vary. Select the local demo explicitly for repeatable checks.
- Ollama requires a running service at OLLAMA_BASE_URL (default http://localhost:11434) and an installed model matching OLLAMA_MODEL. Set both server variables and select the model. Model hardware needs depend on the chosen model. Live Ollama and Gemini were outside this run.
- Requests under /api/ai share a 20-per-minute limit. After a 429, wait a minute. Email-based history identification is a prototype shortcut. Use synthetic material in a local review environment.

## Troubleshooting

| Symptom | What to check |
|---|---|
| Missing package or Prisma engine | Run npm ci from the root, allow registry and engine downloads, then run db:generate. On Windows close the app and Prisma Studio before retrying a locked engine. |
| Schema engine error, P1001 or a failed save | Wait for the database listening message. Match the selected template and port. The reviewer URL uses connection_limit=1, sslmode=disable and pgbouncer=true on loopback. Run db:push again. |
| UI opens but requests fail | Confirm Vite is on 5173 and Express on 4000. If Vite picked another port, free 5173 and restart. Compare /api/health with the save/reopen check. |
| Prepared statement s0 already exists / 42P05 | Stop both services. Ensure the review DATABASE_URL includes &pgbouncer=true. Restart the database, wait for its listener, then restart the app. |
| MODULE_NOT_FOUND pointing into server/validation | Change to the extracted project root containing client, server and validation before running the script. |
| History looks empty | Use the same synthetic email as the script. Confirm the same database directory or native database is still selected. |
| Replay refuses to overwrite output | Supply a new directory under review-output. Keep evidence/ru10 for the recorded submission. |

## Submission evidence

[Audit and reproducibility findings](HARDENING.md) · [Clean-run transcript](evidence/ru10/clean-run.txt) · [Mock checks](evidence/ru10/midpoint/results.json) · [Replay checks](evidence/ru10/replay/results.json) · [AI usage and review](AI-USAGE.md) 