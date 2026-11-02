# Challenge 1 — Ghost Commit

**Target account:** [@dev-null-sec99](https://github.com/dev-null-sec99)

This profile looks abandoned: no public repositories, no followers, and a bio that says old work was cleaned up.

**Your job:** Find the flag hidden in a staging leak that is no longer visible in the GitHub UI.

Rules:

- Open-source OSINT only (public GitHub data, `api.github.com`, direct commit URLs).
- The flag format is `flag{...}`.
- Hints cost points — ask your instructor if you are stuck.

Local practice (same story, simulated API):

1. Open the simulator home and start at the target profile.
2. Query public events for the target login (GitHub-compatible path under `/api/github/...`).

When deployed to real GitHub, replace the simulator host with `https://api.github.com` and `https://github.com`.
