# Risk and issue log
Recorded 11 October 2026. Owner for follow-up: Aveek Sulpya. Source code is unchanged.

| ID | Finding and evidence | Priority | Status and next action |
|---|---|---|---|
| I01 | Email identifies users; README states passwords are not verified. Source review, not penetration testing. | High | Open. Use test data for demo; implement authentication before exposing user data. |
| I02 | C04 and C05 fail in both runs: 6 cards and 5 questions each contain only 4 unique items. | Medium | Open. Mock cycles facts to meet requested counts. Cap unique output or display a shortfall; rerun uniqueness tests. |
| I03 | No fresh PostgreSQL save/reopen/restart evidence in this environment. | High | Validation gap. Run local-workflow create and verify after restart. This is not an observed database failure. |
| I04 | Current dependency security status is not assessed; prior report mentioned 7 high vulnerabilities. | High | Unverified current status. Capture npm audit and review dependency paths before remediation. |
| I05 | README referenced absent server/.env.example. | Medium | Documentation fixed in validation copy by adding a placeholder-only example. Local credentials still required. |
| I06 | HTTP health endpoint returns ok without querying PostgreSQL. | Medium | Open. Treat health as process liveness only; use persistence checks for database readiness. |
| I07 | Mock summary uses at most 8 representative sentences; cards/questions derive from original notes. | Medium | Source-observed limit. Test long notes and reconcile the desired summary-first flow before midpoint. |
| I08 | Chat user message is stored before provider generation; failure can leave a message without a reply. | Medium | Source-observed risk, not fault-injection tested. Add a failed-request test and define retry behavior. |
