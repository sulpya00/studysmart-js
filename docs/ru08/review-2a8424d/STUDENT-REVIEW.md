# RU-08 student review record

Date: October 23, 2026 (America/New_York)
Student: Aveek Sulpya
Evidence: Gemini run committed in 2a8424d; application baseline 52e7f1c.

## Review method and boundary

The assistant presented four selected findings in conversation, including source/output excerpts or a summarized comparison. The student explicitly agreed with each finding. This records guided review of those examples, not independent inspection of every raw output or completion of the 204 fact-coverage scoring entries. No test was rerun during this review.

| Check | Evidence | Finding presented | Student response |
| --- | --- | --- | --- |
| 1 | F05, repeat 3, card 3; related question 3 | Source defines atomicity only as all-or-nothing; the generated ACID content adds information absent from that source. The displayed example was card 3. | "YES" |
| 2 | F05, repeat 3, question 5 | Answer choices occur under an unexpected field instead of options. Static controller inspection predicts the malformed question would be discarded. | "Yes but how did another font come up here"; the student subsequently acknowledged the explanation with "ok". |
| 3 | F06, repeat 3, card 2 | A definitive durability explanation adds outside information instead of maintaining the source's unresolved disagreement. | "Yes" |
| 4 | F02, repeat 3, summary versus source and baseline | Generated summary reaches later topics such as backups and transaction logs but omits important details about isolation and circular waiting in deadlocks. | "yes" |

For check 2, the assistant explained that the unexpected key uses Bengali script, not a different font. The cause of this particular generation error is unknown. Syntactically valid JSON does not by itself ensure the required field names.

## Review outcome

The student accepted all four selected findings. These support prioritizing provider-output schema validation, source-grounding for sparse and contradictory notes, and fact-level summary coverage. Agreement with the examples does not approve an implementation, prove a fix, or establish an overall accuracy rate.

The rest of the qualitative review and the numerical coverage scores remain unverified by the student. In particular, semantic repetition and other findings in CONTENT-REVIEW.md must not be represented as separately confirmed solely from these four responses. The original human-review.json remains unmodified.

## AI usage log addendum

ChatGPT/Codex selected and explained the examples and drafted this record. The student's contribution was explicit agreement with each of the four findings and a follow-up question about the unexpected script in the malformed field. Exact responses are retained above rather than inventing independent student reasoning or a full audit.

Next technical step: prepare a targeted validation/prompt patch and regression checks, preserve the existing live run as before-fix evidence, then rerun relevant cases and the live evaluation. Implementation and after-fix results remain pending.
