import { NextResponse } from "next/server";
import { getChallengeData } from "@/lib/challenge";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ login: string }> },
) {
  const { login } = await ctx.params;
  const data = getChallengeData();

  if (login !== data.accounts.target.login) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(data.eventsPublic);
}
