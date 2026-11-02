# Challenge 1 — Solution (instructors only)

## Intended solve path

1. Visit `dev-null-sec99` — empty profile, suspicious bio.
2. `GET https://api.github.com/users/dev-null-sec99/events/public` (or simulator equivalent).
3. Find `PushEvent` / `DeleteEvent` on `acme-internal-tools/json-schema-validator-go` with branch `temp-staging-test` and note `head` / commit SHA.
4. Open `https://github.com/acme-internal-tools/json-schema-validator-go/commit/<SHA>` (commit objects remain addressable even when the branch is deleted).
5. Read `.env.staging`, base64-decode `STAGE_TOKEN`:

```bash
echo 'ZmxhZ3tnaXRfaDFzdG9yeV9uM3Yzcl9mMHJnM3RzfQ==' | base64 -d
# flag{git_h1story_n3v3r_f0rg3ts}
```

## Operator notes

- Public events expire after ~90 days on real GitHub; use starring, PR comments, or a persistent ref for long-lived events.
- Run `scripts/setup-github-challenge.sh` with Account A/B tokens to plant the ghost commit on live GitHub.
- Local ghost SHA and events live in `challenge/challenge-data.json` (regenerate with `scripts/init-local-challenge.sh`).
