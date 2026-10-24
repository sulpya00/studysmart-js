# RU-08 Gemini content review

Review date: October 23, 2026 (America/New_York).
Evidence commit: 2a8424d, containing a live run against application commit 52e7f1c.
Reviewer: ChatGPT/Codex, AI-assisted qualitative review. Student verification is pending. This addendum supersedes the earlier statement that live Gemini evidence is unavailable; it does not replace or alter raw evidence.

## Scope and method

Read all 18 summaries, 108 flashcards and 90 question objects in evidence/ru08/gemini-windows-1/runs.jsonl against each fixture's supplied notes. Read all 18 lead-sentence baselines. Findings below identify exact fixture, repeat and item numbers (one-based). Source-grounding review judges whether a statement is supported by the provided notes; it does not claim that every unsupported statement is factually false. Distractors were considered as alternatives, not counted automatically as unsupported factual claims. Key points were not separately scored.

This is one AI review, not an independent human assessment or inter-rater study. No accuracy percentage or coverage score has been assigned. The original human-review.json remains unchanged and unscored. The item-level findings are actionable examples, not an exhaustive count of every questionable phrase. Future numerical scoring should use the existing rubric and identify the actual reviewer.

## Verified structural and timing evidence

18/18 calls returned six cards and five raw questions; 17/18 packs passed every structural check. All packs passed exact normalized duplicate-prompt checks. Median direct-service latency was 3.660 seconds, with a range of 2.541–18.327 seconds. All 108 cards passed the existing structural checks; 89/90 question objects passed those checks. These are schema/shape results, not semantic correctness rates.

F05 repeat 3 question 5 has an unexpected property instead of options. The controller's cleanQuestions filter requires Array.isArray(question.options), so source inspection predicts that this object would be dropped. The resulting pack would have four usable questions if the remaining workflow succeeds. This is not a live HTTP or database observation of that run.

## Findings with traceability

| ID | Evidence location | Observation | Interpretation / action |
| --- | --- | --- | --- |
| CR01 | F05/R3/Q5 | Missing options property; choices appear under a different property name | Real provider schema violation; validate provider output before accepting it and explicitly report shortfalls |
| CR02 | F05/R3/C3 and Q3 | Adds the ACID model and its expansion, absent from the single source sentence | Unambiguous source-grounding failure under the existing no-added-information instruction; do not call it a factual-error finding |
| CR03 | F05/R1/C1,C6; F05/R2/C1,C6; F05/R3/C1,C2 | Multiple cards restate indivisibility/all-or-nothing behavior | Exact-string uniqueness does not establish distinct learning content; record semantic repetition and permit a justified shortfall |
| CR04 | F05/R2/Q5 explanation; F05/R3 summary | Claims atomicity ensures valid/consistent database states, beyond the source's all-or-nothing statement | Overclaim relative to source; human reviewer should assess conceptual accuracy separately |
| CR05 | F06/R3/C2 | Supplies a definitive durability guarantee, including power loss and crashes, despite unresolved source conflict | External knowledge enters a source-only task and can undermine the summary's uncertainty; retain conflict framing across every artifact |
| CR06 | F06/R1/C4 | Defines committed transactions as finalized and intended permanently stored; source does not define commitment | Another unsupported addition, even if plausible domain knowledge |
| CR07 | F06/R3/Q5 | Says contradictions are irreconcilable; source only says the disagreement is unresolved | Stronger certainty than evidence warrants; use unresolved wording |
| CR08 | F01/R1–R2 summaries; F03/R1–R3 summaries; F02/R3/C2; F04/R1/C6 | Narrows foreign-key references from a key to a primary key | Added specificity not established by the supplied notes; revise source-grounding checks |
| CR09 | F02/R3 summary | Names Isolation but does not explain hiding intermediate changes; describes deadlocks as conflicts without the cycle criterion | Broad topic mention does not establish definition coverage; score expected facts individually |
| CR10 | All 15 short-input runs | Summaries are longer than their source inputs | The fixed three-to-five-sentence prompt can expand short notes; decide whether concision is a success criterion before declaring a failure |

## Positive signals

F01, F03 and F04 generally preserve the main ACID/key topics and produce recognizable study material. F04 does not simply repeat both copies of the source in its generated summary, while the extractive baseline does. This shows consolidation, though not perfect factual precision.

All three F06 summaries explicitly acknowledge the unresolved contradiction instead of silently choosing a side. That positive summary behavior does not extend reliably to every card.

The F02 generated summaries reach late-source topics, including backups and transaction logs. Each matching baseline uses the first four sentences, covering ACID but omitting those late topics. This supports broader topical reach on this one long fixture; it does not establish a general accuracy advantage. F02/R3 still loses important definition details.

## Baseline interpretation and length

The baseline is capped by generated-summary word count and keeps whole leading sentences. It is not a fixed-length, independently tuned comparison. For each short fixture the generated summary is long enough to let the baseline include the entire source, producing a coverage ceiling and sometimes retaining repetition. Thus short-input baseline coverage cannot establish summarization quality by itself.

| Fixture | Input words | Gemini summary words, R1/R2/R3 | Baseline words, R1/R2/R3 |
| --- | ---: | --- | --- |
| F01 | 50 | 128 / 110 / 109 | 50 / 50 / 50 |
| F02 | 327 | 115 / 123 / 126 | 109 / 109 / 109 |
| F03 | 56 | 126 / 120 / 132 | 56 / 56 / 56 |
| F04 | 100 | 127 / 114 / 111 | 100 / 100 / 100 |
| F05 | 7 | 84 / 87 / 98 | 7 / 7 / 7 |
| F06 | 29 | 61 / 79 / 55 | 29 / 29 / 29 |

Counts use whitespace splitting, including bullet markers. The long-input prompt asks for approximately 120–180 words; F02/R1 has 115, a small deviation that should not automatically be treated as a hard failure. The other two are within the range. Raw timing and length measurements are reproducible; the qualitative findings require reviewer judgment.

## Main decision

Prioritize source-grounded output and schema validation before additional features. Count completion alone is a weak success measure: the mock accepts shortfalls, whereas Gemini satisfies counts partly through repeated interpretations and unsupported additions on sparse notes. Neither provider should be declared better overall from these results.

The next change should combine strict output-shape checks with explicit sparse/conflicting-note behavior. Define acceptance for an honestly explained shortfall before changing the expected results. Keep this live run as the before-fix baseline, rerun the same fixtures after a change, and add new held-out notes to reduce overfitting to these six fixtures.
