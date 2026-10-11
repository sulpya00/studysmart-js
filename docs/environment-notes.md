# Validation environment
Fresh automated checks: Linux, Node v24.19.0, npm 11.9.0. Exact platform and source ZIP SHA256 are in evidence/environment.json. Package lock retained. Install used npm ci --ignore-scripts, then explicit Prisma generation. This is not identical to a normal installation with all lifecycle scripts enabled.

220 packages installed. Frontend build passed with Vite 8.1.5. Prisma client 6.19.0 generated. All 17 backend JavaScript files passed syntax checks. PostgreSQL and Docker executables were unavailable. No user credentials from the source archive were copied or used. External AI was not called. The npm environment emitted an http-proxy configuration warning and node-domexception deprecation warning; neither blocked this run.

Evidence timestamps use UTC. The assignment memo date uses America/New_York. These Linux checks complement, but do not replace, a Windows clean-restart test. The health endpoint does not check database readiness.

Local follow-up on 11 October: uploaded logs record Node v24.14.1 and successful mock generation/storage/retrieval. Aveek confirmed an application restart between create and verify. The uploaded environment.txt describes 3 October, not the current commit. See evidence/local-workflow/review.md.

Git baseline: dev commit 07e9f97ad973c2dcee1edaccbda5f56568260c08 was committed and pushed after the local tests, according to supplied terminal output. See evidence/git-baseline.md for provenance and the distinction from the original source ZIP.
