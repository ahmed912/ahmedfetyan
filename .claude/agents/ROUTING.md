# Model routing: least tokens, no loss of quality

Send each piece of work to the cheapest model that can do it. Escalate one level on failure, never skip upward.

| Work | Agent | Model |
|---|---|---|
| Plan, structure, hard decisions, reviewing a failed approach | architect | opus |
| Write or fix code from a plan section | builder | sonnet |
| Build, test, screenshot, grep, upload, summarize logs | runner | haiku |

## How to hand over
1. The architect writes one plan file. The plan file is the shared memory between models.
2. Brief each agent in under 10 lines: plan file path, section number, files to touch, acceptance check. Never paste the conversation.
3. Agents reply in 3 to 5 lines. The caller reads the reply, not the logs.
4. A builder that fails the same check twice stops and reports; the architect then decides. Do not loop.
5. The runner does all repeated test runs so the builder's context stays small.

## What costs the most
Long conversation history, reading whole large files, and repeated test logs. Keep briefs short, read by function, and return summaries.
