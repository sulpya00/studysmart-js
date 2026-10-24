# Interim technical evidence review

## Results collected on October 23, 2026

| Evidence | Result | What it establishes |
| --- | --- | --- |
| mock-final: six fixtures x three repeats | 18/18 returned; 18/18 structurally valid; 18/18 exact duplicate-free | Narrow deterministic generation correctness |
| Requested counts | 12/18 met six cards and five questions | Count criterion still fails on sparse/conflicting inputs |
| Sparse fixture | One card and one question in each repeat | Shortfalls retained rather than padding |
| Conflicting fixture | Three cards and three questions in each repeat | Output count shortfall; requires factual framing review |
| http-corrected | 23/23 checks passed | Validation, sparse response warning, rate limit boundary and health after errors |
| existing-regression | M01–M09 passed | Existing mock behavior preserved |
| Frontend build | Passed | Build compatibility only |

Mock timing median 0.1643 ms, minimum 0.0373 ms, maximum 2.2410 ms, measured around direct calls on Linux / Node v24.19.0. These values are not Gemini latency, browser response time or an estimate of production capacity.

## Interpretation

The new tests support robustness of input validation and the deterministic path. They do not show semantic accuracy, effective learning, database durability, authentication security or live-provider reliability. Count attainment is 66.7% of calls but only six distinct fixtures were used; repeating a deterministic fixture does not increase input diversity.

AI inspection of source and retained output identifies an unresolved coverage limitation: the mock selects no more than eight representative paragraphs for its summary. The final long fixture has twelve paragraphs, so later sections require explicit coverage review. Item selection can reach later facts even while the summary omits them; question generation and summary coverage must therefore be assessed separately.

The contradictory fixture retains both claims and the unresolved-disagreement sentence in its summary. That is not evidence that its cards and questions handle contradictions safely. Human review remains pending. The application prompt simultaneously asks for exact item counts and prohibits adding absent information; sparse notes expose a tradeoff that should be resolved explicitly in acceptance criteria, without changing historical results.

## Test-development record

- Initial mock-local used a 106-word longest fixture. It was retained, then replaced for the final evaluation with a 327-word fixture that exercises the application's >250-word prompt condition. Do not pool these runs.
- Initial HTTP execution could not import PrismaClient after installation with lifecycle scripts disabled. Running npm run db:generate resolved that environment prerequisite; this was not an application assertion failure.
- http-local records 21 passes and one failure caused by a harness counting error: malformed JSON is rejected before the limiter. The corrected script counts nine limiter-consuming requests before its boundary loop. http-corrected records 23 passes. Both reports are retained; no application change was made to obtain the corrected result.
- Raw UTC timestamps fall on October 24; the local America/New_York date is October 23.

## Next decision

Prioritize content coverage and live Gemini robustness over new features. Run the fixed Gemini set, score paired summaries, inspect generated items, then choose the most consequential demonstrated defect. Do not infer an API retry/outage result from the missing-key test: it tests local configuration validation only.
