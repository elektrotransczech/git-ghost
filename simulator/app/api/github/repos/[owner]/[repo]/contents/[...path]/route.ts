import { NextResponse } from "next/server";
import { execSync } from "child_process";
import path from "path";
import { getChallengeData } from "@/lib/challenge";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ owner: string; repo: string; path: string[] }> },
) {
  const { owner, repo, path: segments } = await ctx.params;
  const filePath = segments.join("/");
  const data = getChallengeData();
  const full = `${owner}/${repo}`;

  if (full !== data.decoyRepo.fullName) {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const ref = url.searchParams.get("ref") ?? data.decoyRepo.mainHeadSha;
  const { ensureDecoyRepo } = await import("@/lib/ensureDecoyRepo");
  const gitRoot = ensureDecoyRepo();

  try {
    const content = execSync(`git show ${ref}:${filePath}`, {
      cwd: gitRoot,
      encoding: "utf8",
    });
    return NextResponse.json({
      name: filePath.split("/").pop(),
      path: filePath,
      sha: ref,
      size: Buffer.byteLength(content, "utf8"),
      content: Buffer.from(content, "utf8").toString("base64"),
      encoding: "base64",
    });
  } catch {
    return NextResponse.json({ message: "Not Found" }, { status: 404 });
  }
}
