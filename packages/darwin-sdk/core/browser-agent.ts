// Polyfill is loaded via --require flag in package.json scripts
// Ensure environment variables are loaded
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from project root
const envPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });
dotenv.config(); // Also try current directory

import { Stagehand } from "@browserbasehq/stagehand";
import type { AgentResult } from "@browserbasehq/stagehand";
import chalk from "chalk";

export interface BrowserAgentConfig {
  website: string;
  task: string;
  model?: string;
  maxSteps?: number;
  verbose?: 0 | 1 | 2;
  env?: "LOCAL" | "BROWSERBASE";
  apiKey?: string;
  projectId?: string;
  integrations?: string[];
  systemPrompt?: string;
  viewport?: { width: number; height: number };
}

export interface StepLog {
  stepNumber: number;
  finishReason: string;
  toolCalls?: Array<{
    toolName: string;
    args?: any;
  }>;
  reasoning?: string;
  timestamp: Date;
}

export class BrowserAgent {
  private stagehand: Stagehand | null = null;
  private config: BrowserAgentConfig;
  private logs: StepLog[] = [];

  constructor(config: BrowserAgentConfig) {
    this.config = {
      model: "google/gemini-3-flash-preview",
      maxSteps: 20,
      verbose: 2,
      env: "LOCAL",
      viewport: { width: 1288, height: 711 },
      ...config,
    };
  }

  /**
   * Initialize the Stagehand instance with headful browser
   */
  async init(): Promise<void> {
    const stagehandConfig: any = {
      env: this.config.env,
      verbose: this.config.verbose,
      experimental: true, // Required for hybrid mode
    };

    // Configure for LOCAL headful browser
    if (this.config.env === "LOCAL") {
      stagehandConfig.localBrowserLaunchOptions = {
        headless: false, // Show browser window
        viewport: this.config.viewport,
        devtools: false, // Can be enabled for debugging
      };
    } else if (this.config.env === "BROWSERBASE") {
      // For BROWSERBASE, we still need experimental mode
      // Use config values or fall back to environment variables
      stagehandConfig.apiKey =
        this.config.apiKey || process.env.BROWSERBASE_API_KEY;
      stagehandConfig.projectId =
        this.config.projectId || process.env.BROWSERBASE_PROJECT_ID;

      if (!stagehandConfig.apiKey || !stagehandConfig.projectId) {
        throw new Error(
          "BROWSERBASE mode requires API key and project ID. " +
            "Set BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID environment variables, " +
            "or provide them in the config."
        );
      }
    }

    this.stagehand = new Stagehand(stagehandConfig);
    await this.stagehand.init();

    console.log(chalk.green("✓ Browser agent initialized"));
    console.log(chalk.cyan(`  Environment: ${this.config.env}`));
    console.log(chalk.cyan(`  Model: ${this.config.model}`));
    console.log(chalk.cyan(`  Website: ${this.config.website}`));
    console.log(chalk.cyan(`  Task: ${this.config.task}`));
  }

  /**
   * Execute the task on the website with continuous logging
   */
  async execute(): Promise<AgentResult> {
    if (!this.stagehand) {
      throw new Error("Agent not initialized. Call init() first.");
    }

    const page = this.stagehand.context.pages()[0];

    // Navigate to the website
    console.log(chalk.blue(`\n🌐 Navigating to: ${this.config.website}`));
    await page.goto(this.config.website);

    // Create agent with hybrid mode for human-like interaction and streaming enabled
    const agent = this.stagehand.agent({
      mode: "hybrid", // Combines DOM and coordinate-based actions
      model: this.config.model,
      stream: true, // Enable streaming for real-time continuous logging
      systemPrompt:
        this.config.systemPrompt
          ? `${this.config.systemPrompt}

CRITICAL: You must continuously think out loud and critique the UI as you navigate. Use the 'think' tool BEFORE every action to share your reasoning, observations, and decision-making process. Think out loud about what you're seeing, what you're trying to accomplish, why you're choosing specific actions, and critique the UI/UX.`
          : `You are a helpful browser automation assistant that navigates websites like a human would.

CRITICAL: You must continuously think out loud and critique the UI as you navigate.

Your responsibilities:
1. THINKING PROCESS: Use the 'think' tool BEFORE every action to share your reasoning, observations, and decision-making process. Think out loud about:
   - What you're seeing on the page
   - What you're trying to accomplish
   - Why you're choosing specific actions
   - What you expect to happen
   - Any concerns or uncertainties

2. UI CRITIQUE: Actively critique the user interface and user experience:
   - Identify confusing or unclear elements
   - Point out accessibility issues
   - Note poor visual hierarchy or design choices
   - Comment on navigation difficulties
   - Highlight good UX patterns you encounter
   - Suggest improvements when you notice problems

3. NAVIGATION BEHAVIOR:
   - Move the cursor naturally and pause briefly before actions
   - Scroll smoothly to find elements
   - Read and understand the page content before acting
   - Take your time to ensure accuracy
   - Provide clear reasoning for each action you take

Always share your thoughts - don't just act silently. Your thinking process is valuable for understanding and improving the website.`,
      integrations: this.config.integrations,
    });

    // Build the full instruction
    const instruction = `${this.config.task}\n\nWebsite: ${this.config.website}`;

    console.log(chalk.yellow(`\n🤖 Starting task execution...`));
    console.log(chalk.gray(`   Instruction: ${this.config.task}`));
    console.log(chalk.gray(`   Max steps: ${this.config.maxSteps}\n`));

    // Execute with streaming for real-time continuous logging
    const streamResult = await agent.execute({
      instruction,
      maxSteps: this.config.maxSteps,
      highlightCursor: true, // Show visual cursor movement
      callbacks: {
        prepareStep: async (stepContext: any) => {
          const stepNum = stepContext?.stepNumber ?? stepContext?.step ?? 0;
          console.log(
            chalk.magenta(`\n📋 Step ${stepNum}/${this.config.maxSteps}`)
          );
          return stepContext;
        },
        onChunk: async (chunk: any) => {
          // Chunk might be wrapped in { chunk: ... } structure based on debug output
          const actualChunk = chunk.chunk || chunk;
          
          // Debug: log chunk structure to see what we're receiving
          if (this.config.verbose && this.config.verbose >= 2) {
            console.log(chalk.gray(`[DEBUG] onChunk - keys: ${Object.keys(actualChunk).join(", ")}, type: ${actualChunk.type}`));
          }
          
          // Handle text deltas - agent's reasoning/thinking
          if (actualChunk.type === "text-delta" || actualChunk.type === "text") {
            const text = actualChunk.textDelta || actualChunk.text || actualChunk.content || "";
            if (text && text.trim()) {
              // Log all text as reasoning/thinking in real-time
              console.log(chalk.bold.yellow(`\n   💭 REAL-TIME THINKING:`));
              process.stdout.write(chalk.yellow(`      ${text}`));
            }
          } else if (actualChunk.type === "tool-call") {
            if (actualChunk.toolName === "think") {
              console.log(chalk.bold.magenta(`\n   💭 THINKING (real-time):`));
              // Extract thought from various possible formats
              let thought = "";
              if (actualChunk.args) {
                if (typeof actualChunk.args === "string") {
                  thought = actualChunk.args;
                } else if (actualChunk.args.thought) {
                  thought = actualChunk.args.thought;
                } else if (actualChunk.args.text) {
                  thought = actualChunk.args.text;
                } else {
                  thought = JSON.stringify(actualChunk.args);
                }
              }
              
              if (thought) {
                const lines = thought.split("\n");
                lines.forEach((line: string) => {
                  if (line.trim()) {
                    console.log(chalk.magenta(`      ${line.trim()}`));
                  }
                });
              } else {
                console.log(chalk.magenta(`      (thinking...)`));
              }
            } else {
              const emoji = this.getToolEmoji(actualChunk.toolName);
              console.log(chalk.cyan(`   ${emoji} ${actualChunk.toolName}`));
              const args = this.formatToolArgs(actualChunk.args, actualChunk.toolName);
              if (args) {
                console.log(chalk.gray(`      ${args}`));
              }
            }
          } else if (actualChunk.type === "tool-result" && actualChunk.toolName === "think") {
            // Log think tool results
            console.log(chalk.bold.magenta(`\n   💭 THINKING RESULT:`));
            if (actualChunk.result) {
              const result = typeof actualChunk.result === "string" ? actualChunk.result : JSON.stringify(actualChunk.result);
              const lines = result.split("\n");
              lines.forEach((line: string) => {
                if (line.trim()) {
                  console.log(chalk.magenta(`      ${line.trim()}`));
                }
              });
            }
          } else {
            // Log any other chunk types for debugging
            if (this.config.verbose && this.config.verbose >= 2) {
              console.log(chalk.gray(`[DEBUG] Unhandled chunk type: ${actualChunk.type || "unknown"}`));
            }
          }
        },
        onStepFinish: async (event: any) => {
          // stepNumber might be in different fields
          const stepNumber = event.stepNumber ?? event.step ?? event.stepIndex ?? 0;
          const stepLog: StepLog = {
            stepNumber: stepNumber,
            finishReason: event.finishReason || "unknown",
            timestamp: new Date(),
          };

          // Log all available event data for debugging (if verbose)
          if (this.config.verbose && this.config.verbose >= 2) {
            console.log(chalk.gray(`[DEBUG] Step ${stepLog.stepNumber} event keys: ${Object.keys(event).join(", ")}`));
            if (event.text) console.log(chalk.gray(`[DEBUG] event.text: ${String(event.text).substring(0, 100)}...`));
            if (event.responseText) console.log(chalk.gray(`[DEBUG] event.responseText: ${String(event.responseText).substring(0, 100)}...`));
            if (event.reasoning) console.log(chalk.gray(`[DEBUG] event.reasoning: ${String(event.reasoning).substring(0, 100)}...`));
            if (event.message) console.log(chalk.gray(`[DEBUG] event.message: ${String(event.message).substring(0, 100)}...`));
            if (event.content) {
              const contentStr = typeof event.content === "string" ? event.content : JSON.stringify(event.content);
              console.log(chalk.gray(`[DEBUG] event.content: ${contentStr.substring(0, 200)}...`));
            }
          }

          // Check for reasoning/thinking in various possible fields
          // The 'content' field often contains the reasoning text in streaming responses
          let reasoningText = "";
          if (event.content) {
            // content might be an array or string
            if (Array.isArray(event.content)) {
              // Extract text from content array (common in streaming responses)
              reasoningText = event.content
                .map((item: any) => {
                  if (typeof item === "string") return item;
                  if (item && typeof item === "object") {
                    if (item.text) return item.text;
                    if (item.content) return item.content;
                    if (item.type === "text") return item.text || "";
                  }
                  return "";
                })
                .filter((text: string) => text && text.trim().length > 0)
                .join("\n");
            } else if (typeof event.content === "string") {
              reasoningText = event.content;
            }
          }
          
          // Also check other fields
          if (!reasoningText && event.text) {
            reasoningText = String(event.text);
          } else if (!reasoningText && event.responseText) {
            reasoningText = String(event.responseText);
          } else if (!reasoningText && event.reasoning) {
            reasoningText = String(event.reasoning);
          } else if (!reasoningText && event.message) {
            reasoningText = String(event.message);
          }

          // Log reasoning/thinking if found
          if (reasoningText && reasoningText.trim().length > 0) {
            console.log(chalk.bold.yellow(`\n   🧠 STEP ${stepLog.stepNumber} THINKING:`));
            const lines = reasoningText.trim().split("\n");
            lines.forEach((line: string) => {
              if (line.trim()) {
                console.log(chalk.yellow(`      ${line.trim()}`));
              }
            });
            stepLog.reasoning = reasoningText;
          }

          // Log tool calls with special handling for 'think' tool
          if (event.toolCalls && event.toolCalls.length > 0) {
            stepLog.toolCalls = event.toolCalls.map((tc: any) => ({
              toolName: tc.toolName || "unknown",
              args: tc.args,
            }));

            // Separate think tool calls from other tools
            const thinkCalls = event.toolCalls.filter((tc: any) => tc.toolName === "think");
            const otherCalls = event.toolCalls.filter((tc: any) => tc.toolName !== "think");

            // Display think tool calls prominently
            if (thinkCalls.length > 0) {
              console.log(chalk.bold.magenta(`\n   💭 THINKING:`));
              thinkCalls.forEach((tc: any) => {
                if (tc.args && tc.args.thought) {
                  const thought = tc.args.thought;
                  // Display the full thought process
                  const lines = thought.split("\n");
                  lines.forEach((line: string) => {
                    if (line.trim()) {
                      console.log(chalk.magenta(`      ${line.trim()}`));
                    }
                  });
                } else if (tc.args && typeof tc.args === "string") {
                  console.log(chalk.magenta(`      ${tc.args}`));
                }
              });
            }

            // Display other tools
            if (otherCalls.length > 0) {
              console.log(chalk.cyan(`   🔧 Actions:`));
              otherCalls.forEach((tc: any) => {
                const toolName = tc.toolName || "unknown";
                const emoji = this.getToolEmoji(toolName);
                console.log(chalk.gray(`     ${emoji} ${toolName}`));
                if (tc.args && Object.keys(tc.args).length > 0 && toolName !== "think") {
                  // Show relevant args (but not full objects for readability)
                  const relevantArgs = this.formatToolArgs(tc.args, toolName);
                  if (relevantArgs) {
                    console.log(chalk.gray(`       ${relevantArgs}`));
                  }
                }
              });
            }
          }

          // Also check event.text if we haven't found reasoning yet
          if (event.text && !reasoningText) {
            const text = String(event.text).trim();
            if (text.length > 0) {
              reasoningText = text;
              console.log(chalk.bold.yellow(`\n   🧠 STEP ${stepLog.stepNumber} THOUGHT PROCESS:`));
              const lines = text.split("\n");
              lines.forEach((line: string) => {
                if (line.trim()) {
                  console.log(chalk.yellow(`      ${line.trim()}`));
                }
              });
              stepLog.reasoning = text;
            }
          }

          // If no reasoning found at all, log that we're looking for it
          if (!reasoningText && this.config.verbose && this.config.verbose >= 1) {
            console.log(chalk.gray(`   (No reasoning text found for step ${stepLog.stepNumber})`));
          }

          // Log finish reason
          if (event.finishReason) {
            const reasonEmoji =
              event.finishReason === "stop" ? "✓" : event.finishReason === "tool_calls" ? "🔧" : "⚠️";
            console.log(
              chalk.gray(`   ${reasonEmoji} Finish reason: ${event.finishReason}`)
            );
          }

          this.logs.push(stepLog);
        },
        onFinish: async (event: any) => {
          // Final summary when streaming completes
          console.log(chalk.green(`\n✅ Task execution completed!`));
        },
        onError: async (error: any) => {
          console.error(chalk.red(`\n❌ Error during execution: ${error.message}`));
        },
      },
    });

    // Process the stream for real-time logging
    console.log(chalk.blue(`\n📡 Streaming agent execution (real-time thinking enabled)...\n`));
    
    // Consume the text stream for real-time output
    // This streams all of the agent's reasoning/thinking as it generates
    if (streamResult.textStream) {
      const textStreamPromise = (async () => {
        for await (const delta of streamResult.textStream) {
          // Stream all text as agent's thought process in real-time
          if (delta.trim().length > 0) {
            process.stdout.write(chalk.yellow(delta));
          }
        }
      })();
      
      // Wait for both the result and text stream
      const [result] = await Promise.all([
        streamResult.result,
        textStreamPromise,
      ]);

      console.log(chalk.green(`\n\n✅ Task execution completed!`));
      console.log(chalk.cyan(`   Total steps: ${result.actions?.length || 0}`));
      console.log(chalk.cyan(`   Success: ${result.success ? "Yes" : "No"}`));
      if (result.message) {
        console.log(chalk.cyan(`   Message: ${result.message}`));
      }

      return result;
    } else {
      // Fallback if textStream is not available
      const result = await streamResult.result;
      
      console.log(chalk.green(`\n✅ Task execution completed!`));
      console.log(chalk.cyan(`   Total steps: ${result.actions?.length || 0}`));
      console.log(chalk.cyan(`   Success: ${result.success ? "Yes" : "No"}`));
      if (result.message) {
        console.log(chalk.cyan(`   Message: ${result.message}`));
      }

      return result;
    }
  }

  /**
   * Get tool emoji for display
   */
  private getToolEmoji(toolName: string): string {
    const emojiMap: Record<string, string> = {
      think: "💭",
      click: "👆",
      type: "⌨️",
      scroll: "📜",
      goto: "🌐",
      screenshot: "📸",
      extract: "🔍",
      wait: "⏳",
      act: "🎬",
      fillForm: "📝",
      ariaTree: "🌳",
      keys: "⌨️",
      navback: "⬅️",
      search: "🔎",
      dragAndDrop: "🖱️",
      clickAndHold: "👆",
      fillFormVision: "👁️",
    };
    return emojiMap[toolName] || "🔧";
  }

  /**
   * Format tool arguments for display
   */
  private formatToolArgs(args: any, toolName: string): string {
    if (!args || typeof args !== "object") {
      return args ? String(args).substring(0, 100) : "";
    }

    // For specific tools, show relevant info
    if (toolName === "click" && args.x !== undefined && args.y !== undefined) {
      return `at (${args.x}, ${args.y})`;
    }
    if (toolName === "type" && args.text) {
      return `"${args.text.substring(0, 50)}${args.text.length > 50 ? "..." : ""}"`;
    }
    if (toolName === "goto" && args.url) {
      return args.url;
    }
    if (toolName === "scroll" && args.direction) {
      return args.direction;
    }
    if (toolName === "extract" && args.instruction) {
      return `"${args.instruction.substring(0, 50)}${args.instruction.length > 50 ? "..." : ""}"`;
    }

    // For other tools, show a summary
    const keys = Object.keys(args);
    if (keys.length === 0) return "";
    if (keys.length === 1) {
      const value = args[keys[0]];
      return `${keys[0]}: ${typeof value === "string" ? value.substring(0, 50) : JSON.stringify(value).substring(0, 50)}`;
    }
    return `${keys.length} parameters`;
  }

  /**
   * Get all step logs
   */
  getLogs(): StepLog[] {
    return this.logs;
  }

  /**
   * Print a summary of all logs
   */
  printLogSummary(): void {
    console.log(chalk.blue("\n📊 Execution Summary"));
    console.log(chalk.gray("─".repeat(50)));
    
    let totalThoughts = 0;
    let totalActions = 0;
    
    this.logs.forEach((log) => {
      console.log(
        chalk.cyan(`\nStep ${log.stepNumber}:`) +
          ` ${log.finishReason} at ${log.timestamp.toLocaleTimeString()}`
      );
      
      if (log.toolCalls && log.toolCalls.length > 0) {
        const thoughts = log.toolCalls.filter((tc) => tc.toolName === "think");
        const actions = log.toolCalls.filter((tc) => tc.toolName !== "think");
        
        totalThoughts += thoughts.length;
        totalActions += actions.length;
        
        if (thoughts.length > 0) {
          console.log(chalk.magenta(`  💭 ${thoughts.length} thinking step(s)`));
          thoughts.forEach((tc) => {
            if (tc.args && typeof tc.args === "object" && tc.args.thought) {
              const preview = tc.args.thought.substring(0, 80);
              console.log(chalk.gray(`     "${preview}${tc.args.thought.length > 80 ? "..." : ""}"`));
            }
          });
        }
        
        if (actions.length > 0) {
          actions.forEach((tc) => {
            const emoji = this.getToolEmoji(tc.toolName);
            console.log(chalk.gray(`  ${emoji} ${tc.toolName}`));
          });
        }
      }
      
      if (log.reasoning && log.reasoning.length > 0) {
        const preview = log.reasoning.substring(0, 100);
        console.log(chalk.yellow(`  🧠 ${preview}${log.reasoning.length > 100 ? "..." : ""}`));
      }
    });
    
    console.log(chalk.blue(`\n📈 Totals:`));
    console.log(chalk.cyan(`   Total steps: ${this.logs.length}`));
    console.log(chalk.magenta(`   Thinking steps: ${totalThoughts}`));
    console.log(chalk.cyan(`   Action steps: ${totalActions}`));
  }

  /**
   * Close the browser and cleanup
   */
  async close(): Promise<void> {
    if (this.stagehand) {
      await this.stagehand.close();
      console.log(chalk.green("✓ Browser closed"));
    }
  }
}
