import { NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import { getChallengeData } from "@/lib/challenge";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ owner: string; repo: string; sha: string }> },
) {
  const { owner, repo, sha } = await ctx.params;
  const data = getChallengeData();
  const full = `${owner}/${repo}`;

  if (full !== data.decoyRepo.fullName) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  const { ensureDecoyRepo } = await import("@/lib/ensureDecoyRepo");
  const gitRoot = ensureDecoyRepo();

  try {
    execSync(`git cat-file -t ${sha}`, { cwd: gitRoot, stdio: "pipe" });
  } catch {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  const message = execSync(`git log -1 --format=%B ${sha}`, {
    cwd: gitRoot,
    encoding: "utf8",
  }).trim();
  const authorName = execSync(`git log -1 --format=%an ${sha}`, {
    cwd: gitRoot,
    encoding: "utf8",
  }).trim();
  const authorEmail = execSync(`git log -1 --format=%ae ${sha}`, {
    cwd: gitRoot,
    encoding: "utf8",
  }).trim();

  const files = execSync(`git diff-tree --no-commit-id --name-only -r ${sha}`, {
    cwd: gitRoot,
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter(Boolean);

  return NextResponse.json({
    sha,
    commit: {
      message,
      author: { name: authorName, email: authorEmail, date: "2024-05-03T02:17:00Z" },
    },
    html_url: `http://127.0.0.1:43124/repos/${owner}/${repo}/commit/${sha}`,
    files: files.map((filename) => ({
      filename,
      status: "added",
      raw_url: `http://127.0.0.1:43124/api/github/repos/${owner}/${repo}/contents/${filename}?ref=${sha}`,
    })),
  });
}
