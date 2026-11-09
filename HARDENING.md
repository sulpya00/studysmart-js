# RU-10 | Artifact audit and clean-run record

**Question.** Can another graduate student reproduce the local mock workflow from a source-only handoff, without the developer’s credentials, existing database or installed modules?

**Result.** On November 3, 2026, a fresh Linux extraction-equivalent directory passed installation, Prisma generation and schema sync, the Vite build, 9/9 mock checks, 30/30 provider-output validation checks, and one F01 create/list/reopen scenario. The actual response contained six cards and five questions. The empty-input control returned 400. The terminal record includes exit statuses and the generated topic identifier. Error logs from intentional negative cases were retained.

## November 8 Windows follow-up

A Windows v24.14.1 result recorded with all nine mock tests passing at 20:01:45.690 UTC (3:01:45 p.m. EST), followed by a replay summary showing 30 passes and zero failures. The deliberate INVALID_STUDY_PACK / HTTP 502 message appeared before that passing summary. The student also reported the topic “Short complete notes” in history.

The setup exposed P1001 when the database was unreachable, a prepared-statement s0 conflict during history reads, and a command run from the server subdirectory. Instructions now explain process startup order and the project-root working directory. The reviewer environment template includes pgbouncer=true as a compatibility adjustment. The original November 3 template missed this connection-reuse case.

[Windows evidence and limitations](evidence/ru10/windows-2026-11-08/README.md) records exactly what the student supplied. The transcribed records supplement the original Linux evidence. They support the two passing Windows suites and the reported topic appearance. The Windows session’s complete save/reopen JSON, uninterrupted installation log, and sustained multi-client validation remain unavailable.

## Audit findings and dispositions

| Observed friction or assumption | Change made for this handoff | Verification |
|---|---|---|
| The RU-08 evidence ZIP omitted the client and database schema. An earlier full archive included a local server/.env and installed modules. | Used the public source at aa1cde2 as the reference, packaged the runtime paths and two historical regression inputs, and excluded local configuration and dependencies. | Built the client and served the application from newly installed workspaces. Unchanged packaged source files are listed with hashes in source-inventory.json. |
| The upstream README described an earlier CISC 699 checkpoint and left the clean run pending. It also described screenshots as future work although the pinned source already contains them. | Replaced it in the submission copy with a CISC 695 reviewer guide, concrete success criteria and links within this ZIP. | Checked relative Markdown links in the packaged documents. |
| Native PostgreSQL could not initialize under an unprivileged service account in this environment. Early schema-sync attempts also failed before a usable listener was available. | Added a separately locked, loopback-only PGlite helper and review-specific template. Start the service first and wait for its listening message. Kept native PostgreSQL instructions and a separate template. | Fresh-run transcript shows schema synchronization and a saved topic read through Prisma. The successful simulation changes the database runtime, not the application source. |
| An older workflow script assumed the original four-concept fixture would always fill a request for six cards. Midpoint validation explicitly expects four unique cards for that fixture. | Used the six-concept F01 fixture for the full-count workflow, and retained the shortfall as a separate regression case. | M01, M08 and M09 cover shortfall/count behavior. The F01 check verifies six and five, matching reopened card fronts and question prompts, the original notes and the summary. |
| Vite briefly returned a proxy connection error while Express was starting. Even a healthy API can have an unavailable database. | Waited for the proxied health response, then added a test through the Vite proxy that creates a study pack, finds its ID in history and reads it back. | See the final command in the clean-run transcript. |
| Prior output directories could be confused with a new run. | Preserved recorded results under evidence/ru10 and directed reviewer runs to review-output. | Clean run wrote to new output directories and copied result records into this package. |

## Evidence and interpretation

The root lockfile and client/server source correspond to **aa1cde2aa68e795e6d51c2a350528031a47ebfed**. The ZIP is a curated runnable handoff. The linked commit retains the broader repository history and prior assignments. The RU-10 additions cover configuration, reviewer tooling, evidence and documentation. They have not been pushed to the repository.

The clean run started with no node_modules, client build, review database or private .env. It could reuse the host npm download cache. PGlite uses the PostgreSQL wire protocol and a single underlying connection. Its passing result supports local setup and the tested request sequence. Native PostgreSQL deployment, concurrent use, browser clicks, service restarts, and live-model answer quality were outside this run. Only the root HTML and proxied API were exercised in the client path. Current dependency security status was not reassessed. The historical dependency audit at the pinned commit reported seven high-severity findings.

### Inspect the evidence

- [Clean-run transcript](evidence/ru10/clean-run.txt) records dependency installation, build, schema sync and validation commands.
- [Database startup](evidence/ru10/database-start.txt) and [application startup](evidence/ru10/app-start.txt) show service readiness.
- [Mock results](evidence/ru10/midpoint/results.json) contain the nine named checks. [Replay results](evidence/ru10/replay/results.json) distinguish recorded responses, deliberately malformed inputs and local HTTP stub checks. A replay is not a live model request.
- [Source inventory](source-inventory.json) records the origin and SHA-256 of packaged baseline files. [Validation fixture](validation/ru08/fixtures.json) includes F01. The historical replay source is under evidence/ru08/gemini-windows-1.
