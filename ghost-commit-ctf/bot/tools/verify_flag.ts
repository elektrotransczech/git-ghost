import fs from "node:fs";
import path from "node:path";
import { defineTool } from "@grok/agent-sdk/tools";
import * as z from "zod/v4";

const inputSchema = z.object({
  submission: z.string().min(3).describe("Flag string submitted by the student"),
});

function expectedFlag(): string {
  const fromEnv = process.env.CTF_FLAG?.trim();
  if (fromEnv) return fromEnv;
  const dataPath = path.join(process.cwd(), "..", "challenge", "challenge-data.json");
  if (fs.existsSync(dataPath)) {
    const parsed = JSON.parse(fs.readFileSync(dataPath, "utf8")) as { flag?: string };
    if (parsed.flag) return parsed.flag;
  }
  return "flag{git_h1story_n3v3r_f0rg3ts}";
}

export default defineTool({
  name: "verify_flag",
  description: "Check whether a CTF flag submission matches Challenge 1",
  execution: "server",
  effect: "read",
  inputSchema,
  async execute({ submission }) {
    const normalized = submission.trim();
    const ok = normalized === expectedFlag();
    return {
      correct: ok,
      formatValid: /^flag\{[^}]+\}$/.test(normalized),
      message: ok
        ? "Correct — ghost commit recovered."
        : "Incorrect flag. Re-check the staging token in .env.staging.",
    };
  },
});
