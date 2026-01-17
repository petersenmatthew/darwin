import { spawn } from "child_process";

export function runClaude(instruction: string, cwd: string) {
  return new Promise((resolve, reject) => {
    const claude = spawn(
      "claude",
      ["-p", "--dangerously-skip-permissions", instruction],
      {
        cwd,
        env: { ...process.env },
        stdio: ["pipe", "pipe", "pipe"],
      },
    );

    claude.stdin.end();

    let stdout = "",
      stderr = "";
    claude.stdout.on("data", (d) => (stdout += d));
    claude.stderr.on("data", (d) => (stderr += d));
    claude.on("close", (code) =>
      code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr)),
    );
    claude.on("error", reject);
  });
}
