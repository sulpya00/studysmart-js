# Evidence-driven next steps and review disclosure

This is an additive update to the earlier RU-08 issue log. Raw test evidence remains unchanged.

| Issue | Updated state | Next action |
| --- | --- | --- |
| R08-03 live Gemini evidence | Completed: 18 raw results now committed in 2a8424d | Retain as baseline; add broader/held-out notes in follow-up |
| R08-04 content quality | AI qualitative review completed; student review still pending | Verify CR01–CR10 and complete fact-coverage scoring before claiming accuracy |
| CR01 malformed question | Confirmed in raw provider output | Add explicit schema validation and test rejection/controlled recovery; preserve error evidence |
| CR02–CR08 grounding and repetition | Demonstrated with specific items | Define sparse/conflict handling, revise prompt/output checks, and compare on unchanged fixtures |
| CR09 long-note definition coverage | Late topics reached but some defining detail omitted | Score expected facts rather than keyword mentions |
| CR10 short-note expansion | Measured in all 15 short-input runs | Decide whether a proportional summary length requirement is appropriate |
| R08-05 live failure handling | Still not exercised | Probe timeout/quota/malformed-response behavior under controlled conditions |
| R08-06 persistence | Still not retested in this package | Verify saved/retrieved content and restart durability if included in submission claims |

## Student review task

First inspect F05 repetition 3 (cards 3 and question 5) and F06 repetition 3 (card 2), alongside their original source inputs. These make the clearest grounding/schema cases. Record whether you agree, what you corrected, and why. Then complete the existing human-review.json scores for both generated and baseline summaries. Do not describe this AI review as your own completed assessment.

## AI usage entry

Date: October 23, 2026, America/New_York. Tool: ChatGPT/Codex; exact model identifier unavailable.
User prompts: supplied commit "2a8424d", followed by "ok" after the proposed content review.
AI actions: retrieved committed run outputs; read 18 summaries, 108 cards, 90 question objects and 18 baselines; compared them with supplied notes; drafted CONTENT-REVIEW.md and this issue-log addendum; generated a mechanical length/structure audit with a reproducible script.
Critical review: distinguished unsupported information from proven falsehoods; distinguished static controller prediction from live end-to-end execution; left human review scores blank; did not infer educational effectiveness or a general baseline advantage.
Student review: pending. No application code changes, new API calls, or GitHub push were made in this review step.
