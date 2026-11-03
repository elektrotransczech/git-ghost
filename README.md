# Ghost Commit CTF (Challenge 1)

GitHub OSINT challenge: an empty-looking user account, a boring decoy repository, and a **ghost commit** on a deleted branch. Students follow public events to a commit SHA, read `.env.staging`, and decode `STAGE_TOKEN`.

This repo ships everything needed to run the challenge **locally** (simulator + git objects) and to **plant** the same trap on real GitHub when you supply burner-account tokens.

## Quick start (local)

```bash
# 1) Optional: regenerate decoy git bundle + challenge-data.json (committed bundle works out of the box)
./scripts/init-local-challenge.sh

# 2) Run the GitHub API / UI simulator
cd simulator && npm run dev
# → http://127.0.0.1:43124

# 3) Optional: Agent SDK verifier + GitHub fixtures
cd ghost-commit-ctf
npx @grok/agent-sdk tool call verify_flag --input '{"submission":"flag{...}"}'
npx @grok/agent-sdk serve --dev --dir .
# curl fixture: POST .../ghost-commit-ctf/v1/channels/github with fixtures/github/pull_request.opened.json
```

## Layout

| Path | Purpose |
| --- | --- |
| `challenge/STUDENT_PROMPT.md` | Handout for students |
| `challenge/SOLUTION.md` | Instructor walkthrough (spoiler) |
| `challenge/challenge-data.json` | Generated SHAs, mock events API payload |
| `decoy-repo/json-schema-validator-go/` | Boring Go utility + real git graph |
| `simulator/` | Next.js stand-in for GitHub UI + `api.github.com` paths |
| `ghost-commit-ctf/` | Agent SDK agent (`verify_flag`, `bot/channels/github.ts`) |
| `scripts/setup-github-challenge.sh` | Automates Account A/B planting on live GitHub |

## Live GitHub deployment

1. Create burner accounts `dev-null-sec99` and `acme-internal-tools` (see student brief for bios).
2. Export fine-grained PATs:

```bash
export ACCOUNT_A_TOKEN=ghp_...
export ACCOUNT_B_TOKEN=ghp_...
./scripts/setup-github-challenge.sh
```

3. Distribute `challenge/STUDENT_PROMPT.md`. Confirm the events breadcrumb:

```bash
curl -s "https://api.github.com/users/dev-null-sec99/events/public" | head
```

**Note:** GitHub public events expire after ~90 days. For long-lived runs, add a secondary breadcrumb (star list, buried PR comment, or tagged ref) — see `challenge/SOLUTION.md`.

## Flag

Default: `flag{oH_Y0u_G0T_N0ting}` (override with `CTF_FLAG` when running scripts).
