import Link from "next/link";
import { getChallengeData } from "@/lib/challenge";

export default function Home() {
  const data = getChallengeData();
  const target = data.accounts.target.login;
  const repo = data.decoyRepo.fullName;
  const [repoOwner, repoName] = repo.split("/");

  return (
    <div className="space-y-8">
      <section className="rounded-lg border border-[var(--gh-border)] bg-[var(--gh-canvas)] p-6">
        <h1 className="text-2xl font-semibold">Ghost Commit CTF — Challenge 1</h1>
        <p className="mt-3 max-w-2xl text-[var(--gh-muted)]">
          This simulator reproduces the GitHub footprint from the burner-account scenario:
          an empty-looking user profile, a boring decoy repository, and a staging commit that
          was pushed then deleted from the UI.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-[var(--gh-border)] p-5">
          <h2 className="font-medium">Student entry point</h2>
          <p className="mt-2 text-sm text-[var(--gh-muted)]">
            Start from the target account profile (zero public repositories).
          </p>
          <Link
            className="mt-4 inline-block rounded-md bg-[var(--gh-accent)] px-4 py-2 text-sm font-medium text-white no-underline hover:no-underline"
            href={`/users/${target}`}
          >
            Open @{target}
          </Link>
        </div>
        <div className="rounded-lg border border-[var(--gh-border)] p-5">
          <h2 className="font-medium">Decoy repository</h2>
          <p className="mt-2 text-sm text-[var(--gh-muted)]">
            Looks legitimate on main; the trap lives on a removed branch.
          </p>
          <Link className="mt-4 inline-block text-sm" href={`/repos/${repoOwner}/${repoName}`}>
            {repo}
          </Link>
        </div>
      </section>

      <section className="rounded-lg border border-dashed border-[var(--gh-border)] p-5 text-sm text-[var(--gh-muted)]">
        <p className="font-medium text-[var(--gh-text)]">API hints (same paths as GitHub)</p>
        <ul className="mt-2 list-inside list-disc space-y-1 font-mono text-xs">
          <li>
            <Link href={`/api/github/users/${target}/events/public`}>
              /api/github/users/{target}/events/public
            </Link>
          </li>
          <li>
            <Link href={`/api/github/users/${target}`}>/api/github/users/{target}</Link>
          </li>
        </ul>
      </section>
    </div>
  );
}
