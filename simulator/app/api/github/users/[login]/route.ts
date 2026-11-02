import { NextResponse } from "next/server";
import { getChallengeData } from "@/lib/challenge";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ login: string }> },
) {
  const { login } = await ctx.params;
  const data = getChallengeData();
  const { target, decoyOwner } = data.accounts;

  if (login === target.login) {
    return NextResponse.json({
      login: target.login,
      name: target.name,
      bio: target.bio,
      public_repos: target.publicRepos,
      followers: target.followers,
      following: 12,
      type: "User",
      html_url: `http://127.0.0.1:43124/users/${target.login}`,
    });
  }

  if (login === decoyOwner.login) {
    return NextResponse.json({
      login: decoyOwner.login,
      name: decoyOwner.name,
      bio: decoyOwner.bio,
      public_repos: decoyOwner.publicRepos,
      followers: 3,
      type: "Organization",
      html_url: `http://127.0.0.1:43124/users/${decoyOwner.login}`,
    });
  }

  return NextResponse.json({ message: "Not Found" }, { status: 404 });
}
