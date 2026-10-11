# Sprint Reflection

## Completed

I located the existing Git repository after initially opening a separate
extracted project folder. I retained its history and used the dev branch
as the working baseline.

I ran the existing application and checked mock generation, saved-topic
reopening, and persistence after restarting the application. I inspected
the request and response fields to confirm that mock and Gemini selections
reached the backend. Gemini generation succeeded with gemini-3.1-flash-lite.
The frontend also built successfully.

I added an environment template, captured environment and build records,
and created smoke-test and risk/issue logs. The main study features already
existed before this sprint; the work focused on verifying and documenting
the engineering baseline.

## Issues and remaining work

The login uses email as an identifier without password verification.
The model dropdown can also suggest Gemini when reopening material that
was generated with mock. I recorded these limitations rather than treating
them as working authentication or reliable generation-source display.

No blocker prevented the smoke tests completed so far. Clean-copy setup,
final documentation, screenshots, and the baseline commit and tag still
need to be completed before submission.

## Lessons learned

Multiple extracted copies made it easy to work outside the Git repository.
I will use one identified working repository and link evidence to its
revision. I also learned that a selected dropdown value and an API health
response do not establish which provider generated saved material;
request and response inspection supplied stronger evidence.

## Next sprint

I plan to begin the structured tests defined in Assignment 4, focusing
first on input validation, generated-output structure, and persistence.
I will preserve failures and use the findings to select a bounded
improvement. The model-display issue is a candidate for investigation;
a broader authentication redesign requires a separate scope decision.
