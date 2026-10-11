# Setup Guide

## Tested environment

- Windows
- Node.js 24.14.1
- npm 11.11.0
- Git 2.45.1.windows.1
- Native PostgreSQL 18 service
- Vite 8.1.5

The PostgreSQL patch version remains to be recorded.
Clean-copy installation verification is pending.

## 1. Obtain the project

Run in PowerShell:

git clone --branch dev https://github.com/sulpya00/studysmart-js.git
cd studysmart-js

Alternatively, extract the project ZIP and open PowerShell in the folder
containing package.json, client, and server.

The baseline release tag will be recorded after release preparation.
Use that tag to reproduce the submitted version.

## 2. Install dependencies

Install Node.js and Git, then run from the project root:

node --version
npm.cmd --version
npm.cmd ci

Use the tested Node version listed above. The root package-lock.json
controls dependency installation for both client and server workspaces.

## 3. Prepare PostgreSQL

Install and start PostgreSQL 18.

Open pgAdmin and connect using your local PostgreSQL credentials.
Create an empty database named studysmart.

For isolated setup testing, create studysmart_baseline_test instead
and use that name in DATABASE_URL.

The included Docker Compose file provides PostgreSQL 16 as an alternative.
It was not used in the recorded Windows smoke tests. Avoid running both
database services on the same port.

## 4. Configure the backend

If server/.env does not exist, run:

Copy-Item server/.env.example server/.env

Open it:

notepad server/.env

Set DATABASE_URL to match your local username, password, port, and database:

postgresql://postgres:YOUR_DATABASE_PASSWORD@localhost:5432/studysmart?schema=public

URL-encode special characters in credentials used in this URL.
Use the test database name instead when performing isolated setup testing.

Keep AI_PROVIDER=mock for the first run. No AI API key is needed for mock.
Default ports are 4000 for the API and 5173 for the frontend.

Keep .env private. Do not commit it or include its contents in evidence.
The .env.example file contains shareable placeholders.

## 5. Prepare the database schema

Run:

npm.cmd run db:generate
npm.cmd run db:push

These generate the Prisma client and synchronize the database schema.
Use a fresh database for setup verification. Review any data-loss warning
before applying schema changes to an existing database.

## 6. Start the application

Run:

npm.cmd run dev

Keep the terminal running.
Open http://localhost:5173 in the browser.

API health: http://localhost:4000/api/health

The health endpoint reports API availability and the configured default
provider. It does not verify database connectivity or live AI generation.

## 7. Check the minimum workflow

1. Enter a synthetic email such as baseline@example.test.
2. Select the mock/demo model.
3. Enter a title and meaningful notes of at least 40 characters.
4. Generate a study pack.
5. Check the summary, flashcards, and questions.
6. Refresh and reopen the topic through History.
7. Stop the app with Ctrl+C, run npm.cmd run dev again, and reopen the topic.

The prototype does not verify passwords. Email identifies saved history
but does not authenticate identity. Use local, non-sensitive test data.

## 8. Check Gemini separately

Add your GEMINI_API_KEY and selected GEMINI_MODEL to server/.env.
Restart the application and select the Gemini model in the interface.

gemini-3.1-flash-lite succeeded in the test on 2026-10-03.
Availability depends on the provider account.

Generate a new topic. In browser Developer Tools, inspect the study-pack
request's aiProvider and aiModel and the response's provider and model.
Retain provider errors as evidence without exposing credentials.

The dropdown shown when reopening a saved topic should not be treated
as proof of the provider that originally generated it.

## 9. Build the frontend

Run:

npm.cmd run build

Build output is created in client/dist.
This checks frontend compilation, not production deployment.

## Troubleshooting

- Database connection failure: check the PostgreSQL service, credentials,
  port, and database name.
- Missing Prisma client or tables: run db:generate and db:push.
- PowerShell script-policy error: use npm.cmd instead of npm.
- Port conflict: stop the conflicting application or update related
  port, proxy, and origin settings consistently.
- Gemini failure: preserve the error and use mock for functional testing
  while investigating provider configuration or availability.
## Windows Prisma engine file lock

If prisma generate reports EPERM while renaming query_engine-windows.dll.node,
stop the running StudySmart application and close Prisma Studio, then retry.
Leave PostgreSQL running. This resolved the error during baseline preparation.
