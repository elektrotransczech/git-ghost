import Link from "next/link";
import { notFound } from "next/navigation";
import { getChallengeData } from "@/lib/challenge";

async function fetchCommit(owner: string, repo: string, sha: string) {
  const base = process.env.SIMULATOR_INTERNAL_URL ?? "http://127.0.0.1:43124";
  const res = await fetch(`${base}/api/github/repos/${owner}/${repo}/commits/${sha}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json() as Promise<{
    sha: string;
    commit: { message: string; author: { name: string; email: string } };
    files: { filename: string; raw_url: string }[];
  }>;
}

async function fetchFileContent(rawUrl: string) {
  const res = await fetch(rawUrl, { cache: "no-store" });
  if (!res.ok) return null;
  const json = (await res.json()) as { content: string; encoding: string };
  if (json.encoding !== "base64") return null;
  return Buffer.from(json.content, "base64").toString("utf8");
}

export default async function CommitPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string; sha: string }>;
}) {
  const { owner, repo, sha } = await params;
  const data = getChallengeData();
  if (`${owner}/${repo}` !== data.decoyRepo.fullName) {
    notFound();
  }

  const commit = await fetchCommit(owner, repo, sha);
  if (!commit) notFound();

  const envFile = commit.files.find((f) => f.filename === ".env.staging");
  const envContent = envFile ? await fetchFileContent(envFile.raw_url) : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[var(--gh-muted)]">
          <Link href={`/repos/${owner}/${repo}`}>
            {owner}/{repo}
          </Link>{" "}
          / commit <span className="font-mono text-[var(--gh-text)]">{sha.slice(0, 7)}</span>
        </p>
        <h1 className="mt-2 text-xl font-semibold">{commit.commit.message}</h1>
        <p className="mt-2 text-sm text-[var(--gh-muted)]">
          {commit.commit.author.name} &lt;{commit.commit.author.email}&gt;
        </p>
      </div>

      {envContent ? (
        <section className="rounded-lg border border-[var(--gh-border)] overflow-hidden">
          <div className="border-b border-[var(--gh-border)] bg-[var(--gh-canvas)] px-4 py-2 text-sm font-mono">
            .env.staging
          </div>
          <pre className="overflow-x-auto p-4 text-sm leading-relaxed">{envContent}</pre>
        </section>
      ) : (
        <p className="text-sm text-[var(--gh-muted)]">No .env.staging in this commit.</p>
      )}
    </div>
  );
}
