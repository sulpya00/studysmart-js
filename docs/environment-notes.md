# Validation environment
Fresh automated checks: Linux, Node v24.19.0, npm 11.9.0. Exact platform and source ZIP SHA256 are in evidence/environment.json. Package lock retained. Install used npm ci --ignore-scripts, then explicit Prisma generation. This is not identical to a normal installation with all lifecycle scripts enabled.

220 packages installed. Frontend build passed with Vite 8.1.5. Prisma client 6.19.0 generated. All 17 backend JavaScript files passed syntax checks. PostgreSQL and Docker executables were unavailable. No user credentials from the source archive were copied or used. External AI was not called. The npm environment emitted an http-proxy configuration warning and node-domexception deprecation warning; neither blocked this run.

Evidence timestamps use UTC. The assignment memo date uses America/New_York. These Linux checks complement, but do not replace, a Windows clean-restart test. The health endpoint does not check database readiness.
