# AI usage record for Hard Stop 3

Date: 11 October 2026
Tool: ChatGPT Codex. Exact model/version was not exposed and is not inferred.

## Purpose and representative prompts
The initial prompt supplied the full Hard Stop 3 assignment and rubric. Subsequent exact prompts included “It is the same package that I sent last time”, “Let's start”, “Since I already have that package that's already connected to github, how does that work?”, “fetch failed”, and “Yes I restarted the app”. Aveek also supplied terminal results, evidence.zip and three screenshots. These inputs supported baseline inspection, test execution, troubleshooting, evidence interpretation and documentation.

## Outputs and locations
AI wrote validation/core-checks.mjs, validation/http-checks.mjs and validation/local-workflow.mjs; added the placeholder environment example; and drafted the memo, validation documentation and issue log. The complete memo text and new validation documents were AI drafted or revised. Raw test logs came from executed commands, not invented examples. The assistant did not modify application source during this task.

## Assistant verification
The assistant inspected the mock/provider selection, controllers, history service and JSON parser; ran two direct-function test processes, five isolated HTTP checks, installation, build, Prisma generation and syntax checks; and retained two failed uniqueness checks per core run. It compared the uploaded saved and retrieved material and inspected the screenshots. The initial failed connection attempt remains in the evidence.

## Student actions supported by this conversation
Aveek ran the local create and verify commands, supplied their results, confirmed restarting the application, and provided screenshots of saved material. Aveek also ran the Git review, commit and push commands and supplied the output. The recorded baseline is dev commit 07e9f97ad973c2dcee1edaccbda5f56568260c08. These actions demonstrate participation in local execution; they do not imply that every AI-written line was independently reviewed.

## Critical review and limitations
The duplicate mock items and awkward consistency prompt remain unresolved. Keyword coverage is a narrow check, not proof of educational effectiveness. No fresh live Gemini/Ollama test or vulnerability audit is claimed. Screenshot S03 shows the first question before answer selection, so it does not validate answer checking. The application restart is user-confirmed, not instrumented. Final student review of the written submission remains to be completed; record corrections after reading it rather than claiming review in advance.
