# Baseline Smoke Tests

Date: 2026-10-03
Tester: Aveek Sulpya
Branch: dev
Starting commit: 1d008b5
Tested state: working copy with an uncommitted App.jsx change removing a decorative star.
Environment: Windows, Node 24.14.1, npm 11.11.0, native PostgreSQL 18 service.

These are manual smoke tests, not the full Assignment 4 evaluation.
Results below were observed by the student during local execution.

| ID | Check | Observed result | Status |
|---|---|---|---|
| SM-01 | Start application with npm.cmd run dev | Application opened in the browser. | Pass |
| SM-02 | GET /api/health | Returned status=ok and configured default provider=gemini. | Pass |
| SM-03 | Generate study material using mock | Summary, flashcards, and questions appeared. | Pass |
| SM-04 | Refresh and reopen saved topic | Saved study material remained available through History. | Pass |
| SM-05 | Restart application and reopen topic | Summary, flashcards, and questions remained available. | Pass |
| SM-06 | Verify mock request routing | Request and response identified mock and paragraph-aware-demo; response reported saved=true. | Pass |
| SM-07 | Verify Gemini generation | Request and response identified gemini and gemini-3.1-flash-lite; response reported saved=true. | Pass |
| SM-08 | Build frontend with npm.cmd run build | Vite 8.1.5 produced HTML, CSS, and JavaScript build artifacts. | Pass |

## Evidence

- evidence/environment.txt: environment and working-tree record.
- evidence/build-output.txt: captured frontend build output.
- UI and Network screenshots: to be added before submission.
- API health response timestamp: 2026-10-04T01:18:00.878Z.
- Mock routing test topic ID: cmut4yx6f000lc5kwv81h4ff5.
- Gemini test topic ID: cmut514is0014c5kwvc55teet.

## Limitations and findings

The health endpoint confirms API availability, not database or provider readiness.
The mock routing test used random text and provides no content-quality evidence.
The Gemini test used the Database Transactions sample notes.
Counts requested were six flashcards and five questions; exact returned counts were not separately recorded.
Application restart was tested; database-server restart was not.
Password verification is not implemented, and the model dropdown can be misleading when reopening topics.
Clean-copy setup and the full quality, failure-handling, and timing evaluations remain pending.

## Verification after dependency updates - 2026-10-03

- Frontend build: passed.
- Prisma Client 6.19.0 generation: passed after stopping the application.
- Existing saved topic reopening: passed.
- New mock study-pack generation: passed.
- New topic reopening after browser refresh: passed.
- Gemini generation was tested before the dependency update, not repeated afterward.

Two operational issues were observed:
1. Prisma generation initially failed with an EPERM engine-file rename error.
   Stopping the application and retrying resolved it; both logs were retained.
2. Browser requests during startup received ECONNREFUSED before Express
   began listening. Refreshing after API startup restored operation.

These checks were performed in the main working copy.
Clean-copy verification remains pending.
