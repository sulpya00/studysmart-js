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

No screenshot, live provider result or database run is implied by these files. The ACID fixture was authored for testing on 11 October 2026. All four facts are provided explicitly; this does not test difficult academic content or long-note behavior.
