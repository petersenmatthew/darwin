#!/usr/bin/env node
// Simple test script for Gemini CLI functionality - tests runClaude directly
import * as dotenv from "dotenv";
import * as path from "path";
import { runClaude } from "../helpers/claude-helper";
import chalk from "chalk";

// Load environment variables
const envPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });
dotenv.config();

async function testClaudeSimple() {
  try {
    console.log(chalk.blue("\n🧪 Testing Gemini CLI Functionality (Simple)\n"));

    // Get target app path from command line or use default
    const targetAppPath = process.argv[2] || path.resolve(__dirname, "../../demo-app");
    console.log(chalk.gray(`  Target app path: ${targetAppPath}\n`));

    // Create a simple test prompt
    const testPrompt = `You are an autonomous UX/UI improvement agent.

ROLE:
- You specialize in improving user experience and interface clarity
- You make minimal, high-impact code changes
- You prioritize accessibility, visual hierarchy, and usability
- You only change code when justified by evidence

CONTEXT:
The following UX issues were identified from real product analytics:

Issue 1:
- ID: test-1
- Severity: high
- Affected Area: Checkout page - Submit button
- Hypothesis: The primary action button may not be visually prominent enough
- Evidence:
  - Low click-through rate on primary CTA button
  - Users spending excessive time on form page
- Recommended Action:
  Increase button size, improve contrast, and add visual hierarchy

TASK:
- Improve the product UX/UI to address the issues above
- Modify ONLY the relevant files
- Keep changes minimal and focused
- Do NOT refactor unrelated code

OUTPUT RULES:
- Make the changes directly in the codebase
- Do not ask questions
- Do not explain theory
- If no change is needed, make no changes`;

    console.log(chalk.cyan("Test Prompt:"));
    console.log(chalk.gray(testPrompt.substring(0, 200) + "...\n"));

    // Test the runClaude function directly
    console.log(chalk.cyan("Calling Gemini CLI..."));
    console.log(chalk.yellow("  (This will spawn the 'gemini' CLI command)\n"));

    const result = await runClaude(testPrompt, targetAppPath) as {
      stdout: string;
      stderr: string;
    };

    console.log(chalk.green("\n✓ Gemini execution completed!\n"));

    if (result.stdout) {
      console.log(chalk.cyan("Gemini stdout:"));
      console.log(chalk.gray(result.stdout));
    }

    if (result.stderr) {
      console.log(chalk.yellow("\nGemini stderr:"));
      console.log(chalk.gray(result.stderr));
    }

    process.exit(0);
  } catch (error: any) {
    console.error(chalk.red(`\n❌ Error: ${error.message}`));
    if (error.stack && process.env.DEBUG) {
      console.error(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

testClaudeSimple();
