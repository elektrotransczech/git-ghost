#!/usr/bin/env bash
# Plants Challenge 1 on REAL GitHub (requires two PATs). Review --dry-run steps before running.
set -euo pipefail

: "${ACCOUNT_A_TOKEN:?Set ACCOUNT_A_TOKEN (dev-null-sec99)}"
: "${ACCOUNT_B_TOKEN:?Set ACCOUNT_B_TOKEN (acme-internal-tools)}"
: "${ACCOUNT_A_LOGIN:=dev-null-sec99}"
: "${ACCOUNT_B_LOGIN:=acme-internal-tools}"
: "${REPO_NAME:=json-schema-validator-go}"
: "${CTF_FLAG:=flag{git_h1story_n3v3r_f0rg3ts}}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DECOY="$ROOT/decoy-repo/json-schema-validator-go"
BRANCH=temp-staging-test
B64="$(printf '%s' "$CTF_FLAG" | base64 -w0 2>/dev/null || printf '%s' "$CTF_FLAG" | base64)"

api_a() { curl -sfS -H "Authorization: Bearer ${ACCOUNT_A_TOKEN}" -H "Accept: application/vnd.github+json" "$@"; }
api_b() { curl -sfS -H "Authorization: Bearer ${ACCOUNT_B_TOKEN}" -H "Accept: application/vnd.github+json" "$@"; }

echo "== Ensure decoy repo exists on ${ACCOUNT_B_LOGIN} =="
if ! api_b "https://api.github.com/repos/${ACCOUNT_B_LOGIN}/${REPO_NAME}" >/dev/null 2>&1; then
  api_b -X POST "https://api.github.com/user/repos" -d "{\"name\":\"${REPO_NAME}\",\"private\":false,\"description\":\"JSON Schema validator CLI\"}"
fi

echo "== Push main history from local decoy (Account B) =="
cd "$DECOY"
git remote remove origin 2>/dev/null || true
git remote add origin "https://x-access-token:${ACCOUNT_B_TOKEN}@github.com/${ACCOUNT_B_LOGIN}/${REPO_NAME}.git"
git push -u origin main --force

echo "== Account A: fork + ghost branch =="
FORK="https://x-access-token:${ACCOUNT_A_TOKEN}@github.com/${ACCOUNT_A_LOGIN}/${REPO_NAME}.git"
git remote add fork "$FORK" 2>/dev/null || git remote set-url fork "$FORK"
git checkout -B "$BRANCH"
cat > .env.staging <<EOF
AWS_SECRET_KEY=AKIAIOSFODNN7EXAMPLE
STAGE_TOKEN=${B64}
EOF
git add .env.staging
git -c user.name="${ACCOUNT_A_LOGIN}" -c user.email="staging-admin@internal-dev-null.local" \
  commit -m "test staging creds before scrubbing"
GHOST_SHA="$(git rev-parse HEAD)"
git push fork "$BRANCH" -f

echo "== Push ghost object to upstream via temporary collaborator (keeps SHA after fork delete) =="
api_b -X PUT "https://api.github.com/repos/${ACCOUNT_B_LOGIN}/${REPO_NAME}/collaborators/${ACCOUNT_A_LOGIN}" -d '{"permission":"push"}'
sleep 5
git push "https://x-access-token:${ACCOUNT_A_TOKEN}@github.com/${ACCOUNT_B_LOGIN}/${REPO_NAME}.git" "$GHOST_SHA:refs/heads/${BRANCH}"
api_b -X DELETE "https://api.github.com/repos/${ACCOUNT_B_LOGIN}/${REPO_NAME}/git/refs/heads/${BRANCH}"
api_b -X DELETE "https://api.github.com/repos/${ACCOUNT_B_LOGIN}/${REPO_NAME}/collaborators/${ACCOUNT_A_LOGIN}" || true

echo "== Scrub Account A fork =="
git push fork --delete "$BRANCH" 2>/dev/null || true
api_a -X DELETE "https://api.github.com/repos/${ACCOUNT_A_LOGIN}/${REPO_NAME}" 2>/dev/null || true
git checkout main
rm -f .env.staging

echo "Done. Ghost SHA: ${GHOST_SHA}"
echo "Verify events: curl -s https://api.github.com/users/${ACCOUNT_A_LOGIN}/events/public | jq '.[0]'"
