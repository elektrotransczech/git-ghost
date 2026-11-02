import Link from "next/link";
import { notFound } from "next/navigation";
import { execSync } from "child_process";
import path from "path";
import { getChallengeData } from "@/lib/challenge";

export default async function RepoPage({
  params,
}: {
  params: Promise<{ owner: string; repo: string }>;
}) {
  const { owner, repo } = await params;
  const data = getChallengeData();
  const full = `${owner}/${repo}`;

  if (full !== data.decoyRepo.fullName) {
    notFound();
  }

  const { ensureDecoyRepo } = await import("@/lib/ensureDecoyRepo");
  const gitRoot = ensureDecoyRepo();
  const log = execSync("git log --oneline -5 main", { cwd: gitRoot, encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-[var(--gh-muted)]">
          <Link href={`/users/${owner}`}>{owner}</Link> / <span className="text-[var(--gh-text)]">{repo}</span>
        </p>
        <h1 className="mt-1 text-2xl font-semibold">{repo}</h1>
        <p className="mt-2 text-sm text-[var(--gh-muted)]">Public · main · boring utility repo</p>
      </div>

      <section className="rounded-lg border border-[var(--gh-border)]">
        <div className="border-b border-[var(--gh-border)] px-4 py-2 text-sm font-medium">Recent commits on main</div>
        <ul className="divide-y divide-[var(--gh-border)]">
          {log.map((line) => {
            const [sha, ...rest] = line.split(" ");
            const message = rest.join(" ");
            return (
              <li key={sha} className="flex items-center gap-3 px-4 py-3 text-sm">
                <Link href={`/repos/${owner}/${repo}/commit/${sha}`} className="font-mono text-xs">
                  {sha.slice(0, 7)}
                </Link>
                <span>{message}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="text-sm text-[var(--gh-muted)]">
        Branches visible in the UI: <code className="text-[var(--gh-text)]">main</code> only. Deleted staging branches
        do not appear here.
      </p>
    </div>
  );
}
