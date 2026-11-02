import fs from "fs";
import path from "path";
import { execSync } from "child_process";

export function decoyRepoPath(): string {
  return path.join(process.cwd(), "..", "decoy-repo", "json-schema-validator-go");
}

export function ensureDecoyRepo(): string {
  const repo = decoyRepoPath();
  const gitDir = path.join(repo, ".git");
  if (fs.existsSync(gitDir)) {
    return repo;
  }

  const bundle = path.join(process.cwd(), "..", "challenge", "decoy.bundle");
  if (!fs.existsSync(bundle)) {
    throw new Error(
      "Decoy git repo missing. Run ./scripts/init-local-challenge.sh from the repo root.",
    );
  }

  if (fs.existsSync(repo)) {
    fs.rmSync(repo, { recursive: true, force: true });
  }
  fs.mkdirSync(path.dirname(repo), { recursive: true });
  execSync(`git clone "${bundle}" "${repo}"`, { stdio: "pipe" });
  return repo;
}
