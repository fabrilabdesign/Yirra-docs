import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import type { McpServer } from "../mcp.js";
const exec = promisify(execFile);
const ROOT = process.env.GIT_ROOT || "/repos";

function repoSafe(repo: string) {
  const p = path.resolve(ROOT, repo);
  if (!p.startsWith(path.resolve(ROOT))) throw new Error("repo outside allowed root");
  return p;
}

export function gitServer(): McpServer {
  return {
    name: "git-mcp",
    tools: [
      { name: "recentCommits", description: "Last N commits on a branch", args: [
        { name: "repo", type: "string", required: true },
        { name: "branch", type: "string", required: true },
        { name: "n", type: "number", required: false }
      ]},
      { name: "diff", description: "Diff for a ref or range", args: [
        { name: "repo", type: "string", required: true },
        { name: "rev", type: "string", required: true }
      ]}
    ],
    handlers: {
      async recentCommits({ repo, branch, n = 10 }) {
        const cwd = repoSafe(repo);
        const { stdout } = await exec("git", ["--no-pager", "log", `-n`, String(n), branch, "--pretty=format:%h\t%an\t%ad\t%s"], { cwd });
        return stdout.split("\n").map(l => {
          const [hash, author, date, ...rest] = l.split("\t");
          return { hash, author, date, subject: rest.join("\t") };
        });
      },
      async diff({ repo, rev }) {
        const cwd = repoSafe(repo);
        const { stdout } = await exec("git", ["--no-pager", "diff", rev], { cwd, maxBuffer: 10 * 1024 * 1024 });
        return { rev, diff: stdout };
      }
    }
  };
}








