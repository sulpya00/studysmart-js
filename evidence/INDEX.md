# Evidence index
- environment.json: validation host, runtime and original ZIP digest.
- install.log: npm ci --ignore-scripts; successful package installation.
- build.log: frontend production build.
- prisma-generate.log: Prisma client generation, not database connectivity.
- syntax.json: 17 backend JavaScript syntax checks.
- core-run-1 and core-run-2: fixed input, generated output and per-check results from separate processes.
- http/results.json and http.log: five isolated HTTP tests; missing-key error is expected negative-test evidence.
- source-manifest.json: hashes of application/config files in the validation copy.
- local-workflow: created only when the student executes the supplied local script.

The initial automated evidence did not include a database run. The later uploaded local-workflow records now establish mock persistence after a user-confirmed application restart. Screenshots are included in screenshots/; no live provider result is included. The ACID fixture was authored for testing on 11 October 2026. All four facts are provided explicitly; this does not test difficult academic content or long-note behavior.

Update: local-workflow contains the uploaded failed create attempt, successful create, saved response and successful verify. review.md records the content comparison and restart attestation. uploaded-windows/evidence preserves the full supplied evidence archive, including older environment/build/audit records; these are not all new runs.

S01–S03: screenshots/saved-summary.png, screenshots/saved-flashcards.png and screenshots/practice-question.png. Supplied by Aveek on 11 October. The first question only is shown.

Git baseline: git-baseline.md records the supplied commit and successful push output.
