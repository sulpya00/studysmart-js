# RU-08 issue-log supplement

This supplement preserves prior issue logs and adds evidence-driven actions.

| ID | Finding / risk | Evidence | Priority and next action | Status |
| --- | --- | --- | --- | --- |
| R08-01 | Requested counts not always attainable without padding | mock-final, F05/F06, 6 of 18 runs | High: keep count failures visible; review whether explicit shortfall is acceptable under approved criteria | Open |
| R08-02 | Later sections omitted by eight-paragraph mock summary cap | mock source; final 12-paragraph F02 | High: score coverage and assess distribution before revising generator | Open |
| R08-03 | Gemini quality and latency remain unmeasured in this package | No live run available here | High: run 18 fixed requests, preserve exceptions, score paired summaries and items | Pending local run |
| R08-04 | Structural checks cannot establish correctness or educational value | Structural metrics only; blank review templates | High: perform item-level source review; no learning-effectiveness claims | Open |
| R08-05 | Live provider timeout, quota and malformed-response handling not exercised | HTTP probes only test missing key plus request validation | Medium: controlled integration failure probes after baseline live run | Open |
| R08-06 | Current saved-content fidelity and restart durability not retested | Direct service and isolated HTTP scope | High if persistence is claimed: compare saved/retrieved fields and restart results in isolated test DB | Pending |
| R08-07 | Earlier identity/authentication and dependency concerns remain outside scope | Prior project issue logs | Keep open; no resolution claimed by these results | Carry forward |
| R08-T01 | Harness miscounted limiter requests | http-local vs http-corrected | Corrected counting to reflect middleware order | Harness issue resolved |

Next sequence: live run -> manual review -> compare results with existing success criteria -> select defect -> fix and rerun affected checks -> finalize evidence review and walkthrough. Preserve failed runs and use new output directories.
