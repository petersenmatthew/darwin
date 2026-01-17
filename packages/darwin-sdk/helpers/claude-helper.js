"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runClaude = runClaude;
const child_process_1 = require("child_process");
function runClaude(instruction, cwd) {
    return new Promise((resolve, reject) => {
        const claude = (0, child_process_1.spawn)("claude", ["-p", "--dangerously-skip-permissions", instruction], {
            cwd,
            env: { ...process.env },
            stdio: ["pipe", "pipe", "pipe"],
        });
        claude.stdin.end();
        let stdout = "", stderr = "";
        claude.stdout.on("data", (d) => (stdout += d));
        claude.stderr.on("data", (d) => (stderr += d));
        claude.on("close", (code) => code === 0 ? resolve({ stdout, stderr }) : reject(new Error(stderr)));
        claude.on("error", reject);
    });
}
