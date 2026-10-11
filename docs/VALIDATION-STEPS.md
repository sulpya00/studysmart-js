# Hard Stop 3 validation steps
Run from the project root. This package preserves the original application source and adds tests and documentation. Never overwrite your existing private server/.env with the example. Use a test database and non-sensitive notes.

## Start on Windows
If using this extracted copy, copy your working server/.env into its server folder locally. Do not upload that file. Alternatively copy server/.env.example and enter your local settings.

```powershell
npm.cmd ci
npm.cmd run db:generate
npm.cmd run build
npm.cmd run dev
```
Your PostgreSQL service must be running with the existing schema. For a NEW empty test database only, use `npm.cmd run db:push` to initialize the schema. Do not apply schema changes blindly to an existing database.

## Capture persistence in another PowerShell window
Open the same project root and run:

```powershell
node validation/local-workflow.mjs create
```
This creates one test topic under a unique example.com email, checks list/retrieval and stored content, and checks empty-input rejection. It preserves the response and topic ID under evidence/local-workflow. It does not delete existing history.

Stop the running application with Ctrl+C, restart with `npm.cmd run dev`, then run:

```powershell
node validation/local-workflow.mjs verify
```
Record the stop/restart times in evidence/local-workflow/restart-note.txt. The script cannot independently prove that a restart occurred. Keep the create and verify JSON logs together. For a second complete run, archive evidence/local-workflow under a distinct name first, then repeat.

## Repeat the portable checks
```powershell
node validation/core-checks.mjs evidence/windows-core-1
node validation/core-checks.mjs evidence/windows-core-2
node validation/http-checks.mjs
```
The current core suite intentionally exits with code 1 because duplicate-card and duplicate-question checks fail. Do not remove the failures from evidence. HTTP checks start an isolated temporary server. They do not access the database.

## Remaining evidence
Capture the UI showing the fixed notes, summary, flashcards, questions and reopened topic. Use the test email in evidence/local-workflow/request.json to view its saved history. Capture one Gemini run separately if available and record its model, request, response and errors. Do not include API keys or database passwords. Run `npm.cmd audit --json > evidence/windows-audit.json` to capture the current dependency assessment. A failed audit is evidence, not a reason to force dependency upgrades before the baseline is recorded.

Review the AI log and record your actual review. Send the evidence/local-workflow folder and screenshots for incorporation into the memo.
