# Windows persistence verification on 11 October 2026

Evidence source: evidence.zip uploaded by Aveek. Raw archive files are retained under evidence/uploaded-windows/evidence. The local-workflow files are also available at evidence/local-workflow for easy review.

- 10:41:18 EDT: initial create attempt failed with fetch failed. No request/response was recorded. The backend connection was unavailable; the exact cause is not established by the log.
- 10:42:41 EDT: create completed with HTTP 200 for health, generation, list and retrieval; empty notes returned HTTP 400.
- 10:43:54 EDT: verify retrieved the same topic and rejected empty notes with HTTP 400.
- User confirmed in this conversation: “Yes I restarted the app”. Exact stop/start times were not separately recorded. Restart occurrence is user-attested; content preservation is supported by the response logs.
- Node runtime in the local logs: v24.14.1. Provider: mock. Model: paragraph-aware-demo.
- Topic ID: cmv3xmzio0002c5as03jeiosr. Original notes, summary, all 6 flashcards and all 5 questions match the saved response; question/card comparison ignores order.
- Scope: one successful create and one verify following an application restart. This does not prove database-server restart, power-loss durability, repeated full trials, live Gemini quality or browser interaction.

The uploaded environment.txt is dated 3 October and records an older dirty working tree. It is historical context, not the exact commit identity of this 11 October run. The included dependency audit reports 7 high-severity vulnerabilities; its execution date is not established by its contents, so it is not treated as a fresh audit.
