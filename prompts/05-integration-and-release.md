# 05 — Integration, Change drill, Estimate, Release (all four, on `master` after each gate)

## Prompt I-1 — Gate review (run at G2, G3, G4; paste master's `docs/STATUS.md` and CI summary)

```
Act as the release manager. Given STATUS.md, the CI results and the requirements, produce: (1) a table of every Must story with MET/NOT MET and the test that proves it; (2) the top 10 risks ranked by likelihood x impact with mitigation; (3) merge-conflict hot spots between the four branches in the last 3 days; (4) what each person should do next, in order. Be strict: "tests passing" is not "requirement met".
```

## Prompt I-2 — The change-request drill (handbook Stage 5; do this after G3 on a throwaway branch)

```
The Dean says: "Event organizers want a hard registration deadline per event, and when a student cancels within 2 hours of the deadline the seat should go to the waitlist only after a 10-minute grace window." Before coding: list which existing tests (by file and name) might break and why. Then change the code with minimal edits, list every function changed, re-run all tests, and report which broke and why. Check explicitly that the race condition did not return. Record the results for docs/CHANGE-NOTES.md.
```

## Prompt I-3 — Estimate (handbook Stage 7)

```
Estimate the remaining work for this project: break it into tasks, estimate hours each, add up, state assumptions, and flag hidden work (OTP-style iceberg items). Then compute COCOMO II (Effort = 2.94 x KSLOC^E x product of EMs, E about 1.10) for the actual KSLOC in the repo (give the command to count it) and compare to our gut estimate and to the Gemini estimate. Explain which we trust and how we will measure our real AI speedup (METR 2025 found experienced developers measured 19% slower while feeling faster). Fill docs/ESTIMATE.md.
```

## Prompt I-4 — Stretch order (only after G4)

1. Personalised "Because you joined…" rows (P1 Prompt D extension). 2. Natural-language search (P1 Prompt E). 3. 3D campus map polish (P2 Prompt E). 4. Calendar export (.ics). 5. PWA install + offline "My events". 6. pgvector recommendations via Gemini embeddings (free tier; verify limits).

## Prompt I-5 — Freeze and release

```
Feature freeze. Produce: release checklist (CI green on master 3 times in a row, nightly green, k6 thresholds met, Lighthouse budgets met, axe clean, vulns none high/critical, migrations apply from scratch, seed verify green, .env.example complete, README with a 5-minute quickstart and the demo script from PLAYBOOK §11, docs/STATUS.md final), the exact commands to tag v1.0.0, a rollback plan, and a "demo day failure plan" (what we do if Wi-Fi blocks SSE, if WebGL fails on the demo laptop, if the SMS provider is down, if the DB is slow).
```
