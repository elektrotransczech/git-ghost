import Link from "next/link";
import { notFound } from "next/navigation";
import { getChallengeData } from "@/lib/challenge";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ login: string }>;
}) {
  const { login } = await params;
  const data = getChallengeData();
  const { target, decoyOwner } = data.accounts;

  if (login === target.login) {
    return (
      <Profile
        login={target.login}
        name={target.name}
        bio={target.bio}
        repos={target.publicRepos}
        hint="Nothing here in the UI — check public events."
      />
    );
  }

  if (login === decoyOwner.login) {
    const [owner, repoName] = data.decoyRepo.fullName.split("/");
    return (
      <div className="space-y-6">
        <Profile
          login={decoyOwner.login}
          name={decoyOwner.name}
          bio={decoyOwner.bio}
          repos={decoyOwner.publicRepos}
        />
        <section className="rounded-lg border border-[var(--gh-border)] p-5">
          <h2 className="text-sm font-medium text-[var(--gh-muted)]">Repositories</h2>
          <ul className="mt-3 space-y-2">
            <li>
              <Link href={`/repos/${owner}/${repoName}`} className="font-medium">
                json-schema-validator-go
              </Link>
              <p className="text-sm text-[var(--gh-muted)]">Public · Go · Updated Apr 2024</p>
            </li>
          </ul>
        </section>
      </div>
    );
  }

  notFound();
}

function Profile({
  login,
  name,
  bio,
  repos,
  hint,
}: {
  login: string;
  name: string;
  bio: string;
  repos: number;
  hint?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--gh-border)] text-xl font-bold">
          {login.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-semibold">{name}</h1>
          <p className="text-[var(--gh-muted)]">@{login}</p>
          <p className="mt-3 max-w-xl text-sm">{bio}</p>
          <p className="mt-2 text-sm text-[var(--gh-muted)]">
            {repos} public repositories · 0 followers
          </p>
          {hint ? <p className="mt-4 text-sm text-[var(--gh-green)]">{hint}</p> : null}
        </div>
      </div>
    </div>
  );
}
