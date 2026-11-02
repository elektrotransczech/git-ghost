import { defaultGitHubAuth, githubChannel } from "@grok/agent-sdk/channels/github";

export default githubChannel({
  botName: "ghost-commit-ctf",
  // Local fixtures + replay; set cursorAccount when deploying to Cursor hosting.
  permissions: "read",

  onComment: (ctx, comment) => {
    const body = comment.comment.body?.trim() ?? "";
    if (!body.startsWith("/verify ")) {
      return null;
    }
    return {
      auth: defaultGitHubAuth(ctx, {
        userMessage: `Student submitted a flag attempt via comment. Extract the flag from their message (after /verify) and call the verify_flag tool. Reply briefly: correct, incorrect, or invalid format.`,
      }),
    };
  },

  onEvent: (ctx, event) => {
    if (event.type !== "pull_request") {
      return null;
    }
    const action = (event.payload as { action?: string }).action;
    if (action !== "opened") {
      return null;
    }
    return {
      auth: defaultGitHubAuth(ctx, {
        userMessage:
          "A PR was opened for the ghost-commit challenge. Summarize what the author should investigate (public events API, commit SHA, .env.staging) without giving the flag.",
      }),
    };
  },
});
