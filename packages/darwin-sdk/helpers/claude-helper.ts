import { spawn } from "child_process";
import { EventEmitter } from "events";

export interface StreamOptions {
  onStdout?: (data: string) => void;
  onStderr?: (data: string) => void;
}

export function runClaude(instruction: string, cwd: string, streamOptions?: StreamOptions) {
  return new Promise((resolve, reject) => {
    // Use --yolo flag to automatically approve all tool calls including file modifications
    // This allows Gemini CLI to actually modify files without asking for confirmation
    const gemini = spawn(
      "gemini",
      ["--yolo", "-p", instruction],
      {
        cwd,
        env: { ...process.env },
        stdio: ["pipe", "pipe", "pipe"],
      },
    );

    gemini.stdin.end();

    let stdout = "",
      stderr = "";
    
    // Stream stdout data as it comes in
    gemini.stdout.on("data", (d) => {
      const data = d.toString();
      stdout += data;
      if (streamOptions?.onStdout) {
        streamOptions.onStdout(data);
      }
    });
    
    // Stream stderr data as it comes in
    gemini.stderr.on("data", (d) => {
      const data = d.toString();
      stderr += data;
      if (streamOptions?.onStderr) {
        streamOptions.onStderr(data);
      }
    });
    
    gemini.on("close", (code) =>
      code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr)),
    );
    gemini.on("error", reject);
  });
}
