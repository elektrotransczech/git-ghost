#!/usr/bin/env bash
# Builds decoy git history + dangling "ghost" commit for Challenge 1 (local simulator).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO="$ROOT/decoy-repo/json-schema-validator-go"
DATA="$ROOT/challenge/challenge-data.json"
FLAG="${CTF_FLAG:-flag{git_h1story_n3v3r_f0rg3ts}}"
B64="$(printf '%s' "$FLAG" | base64 -w0 2>/dev/null || printf '%s' "$FLAG" | base64)"

cd "$REPO"
if [[ ! -d .git ]]; then
  git init -b main
fi

git config user.name "acme-internal-tools"
git config user.email "tools-bot@acme-internal-tools.dev"

export GIT_AUTHOR_DATE="2024-03-12T10:00:00"
export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"
git add README.md .gitignore
git commit -m "chore: initial import from internal monorepo split"

export GIT_AUTHOR_DATE="2024-03-14T14:22:00"
export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"
git add go.mod
git commit -m "feat: add validate CLI skeleton"

export GIT_AUTHOR_DATE="2024-03-18T09:05:00"
export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"
mkdir -p cmd/validate schema
git add cmd/validate/main.go schema/example-user.json
git commit -m "feat: wire jsonschema compiler and example schema"

export GIT_AUTHOR_DATE="2024-04-02T16:40:00"
export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"
echo -e "\n## CI\n\nGitHub Actions runs \`go test ./...\` on push to main." >> README.md
git add README.md
git commit -m "docs: note CI expectations"

export GIT_AUTHOR_DATE="2024-04-19T11:15:00"
export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"
git commit --allow-empty -m "chore: bump module cache key"

MAIN_SHA="$(git rev-parse HEAD)"

# Ghost commit (Account A) — branch deleted, object kept via refs/ghost/staging
git config user.name "dev-null-sec99"
git config user.email "staging-admin@internal-dev-null.local"
export GIT_AUTHOR_DATE="2024-05-03T02:17:00"
export GIT_COMMITTER_DATE="$GIT_AUTHOR_DATE"

git checkout -B temp-staging-test
cat > .env.staging <<EOF
AWS_SECRET_KEY=AKIAIOSFODNN7EXAMPLE
STAGE_TOKEN=${B64}
EOF
git add .env.staging
git commit -m "test staging creds before scrubbing"
GHOST_SHA="$(git rev-parse HEAD)"

git update-ref refs/ghost/staging "$GHOST_SHA"
git checkout main
git branch -D temp-staging-test 2>/dev/null || true
rm -f .env.staging
git checkout -- . 2>/dev/null || true

mkdir -p "$(dirname "$DATA")"
cat > "$DATA" <<EOF
{
  "flag": "${FLAG}",
  "accounts": {
    "target": {
      "login": "dev-null-sec99",
      "name": "Dev Null",
      "bio": "Backend Engineer. Rust & Go. Cleaned up my old repos, moving to self-hosted GitLab.",
      "publicRepos": 0,
      "followers": 0
    },
    "decoyOwner": {
      "login": "acme-internal-tools",
      "name": "Acme Internal Tools",
      "bio": "Small utilities extracted from a former platform team. Mostly unmaintained.",
      "publicRepos": 1
    }
  },
  "decoyRepo": {
    "fullName": "acme-internal-tools/json-schema-validator-go",
    "defaultBranch": "main",
    "mainHeadSha": "${MAIN_SHA}",
    "ghostCommitSha": "${GHOST_SHA}",
    "ghostBranch": "temp-staging-test",
    "ghostRef": "refs/ghost/staging"
  },
  "eventsPublic": [
    {
      "type": "PushEvent",
      "actor": { "login": "dev-null-sec99" },
      "repo": { "name": "acme-internal-tools/json-schema-validator-go" },
      "payload": {
        "ref": "refs/heads/temp-staging-test",
        "before": "0000000000000000000000000000000000000000",
        "head": "${GHOST_SHA}",
        "commits": [
          {
            "sha": "${GHOST_SHA}",
            "message": "test staging creds before scrubbing",
            "author": {
              "name": "dev-null-sec99",
              "email": "staging-admin@internal-dev-null.local"
            }
          }
        ]
      },
      "created_at": "2024-05-03T02:18:04Z"
    },
    {
      "type": "DeleteEvent",
      "actor": { "login": "dev-null-sec99" },
      "repo": { "name": "acme-internal-tools/json-schema-validator-go" },
      "payload": {
        "ref": "refs/heads/temp-staging-test",
        "ref_type": "branch"
      },
      "created_at": "2024-05-03T02:21:11Z"
    }
  ]
}
EOF

BUNDLE="$ROOT/challenge/decoy.bundle"
git bundle create "$BUNDLE" --all

echo "Challenge data written to $DATA"
echo "Git bundle: $BUNDLE"
echo "Ghost commit SHA: $GHOST_SHA"
