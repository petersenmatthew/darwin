import { spawn, execSync } from "child_process";
import * as fs from "fs";

// Find claude executable - check common locations
function findClaudeExecutable(): string {
  // Common installation paths for claude CLI
  const possiblePaths = [
    "/opt/homebrew/bin/claude",      // macOS ARM (Homebrew)
    "/usr/local/bin/claude",          // macOS Intel / Linux
    "/usr/bin/claude",                // Linux system
    `${process.env.HOME}/.local/bin/claude`, // User local install
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Fallback: try to find via `which` command
  try {
    const whichResult = execSync("which claude", { encoding: "utf-8" }).trim();
    if (whichResult && fs.existsSync(whichResult)) {
      return whichResult;
    }
  } catch {
    // `which` failed, continue
  }

  // Last resort: hope it's in PATH
  return "claude";
}

const CLAUDE_PATH = findClaudeExecutable();
console.log(`[claude-helper] Using claude at: ${CLAUDE_PATH}`);

export function runClaude(instruction: string, cwd: string) {
  return new Promise((resolve, reject) => {
    const claude = spawn(
      CLAUDE_PATH,
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
    claude.on("close", (code, signal) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        // Build error message from available info, avoiding empty/undefined
        const errorMsg =
          stderr.trim() ||
          stdout.trim() ||
          (signal ? `Claude process killed by signal ${signal}` : null) ||
          `Claude exited with code ${code}`;
        reject(new Error(errorMsg));
      }
    });
    claude.on("error", (err) =>
      reject(new Error(err.message || "Failed to spawn Claude CLI")),
    );
  });
}
