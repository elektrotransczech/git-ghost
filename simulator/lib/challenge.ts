import fs from "fs";
import path from "path";

export type ChallengeData = {
  flag: string;
  accounts: {
    target: {
      login: string;
      name: string;
      bio: string;
      publicRepos: number;
      followers: number;
    };
    decoyOwner: {
      login: string;
      name: string;
      bio: string;
      publicRepos: number;
    };
  };
  decoyRepo: {
    fullName: string;
    defaultBranch: string;
    mainHeadSha: string;
    ghostCommitSha: string;
    ghostBranch: string;
    ghostRef: string;
  };
  eventsPublic: Array<Record<string, unknown>>;
};

let cached: ChallengeData | null = null;

export function getChallengeData(): ChallengeData {
  if (cached) return cached;
  const file = path.join(process.cwd(), "..", "challenge", "challenge-data.json");
  const raw = fs.readFileSync(file, "utf8");
  cached = JSON.parse(raw) as ChallengeData;
  return cached;
}

