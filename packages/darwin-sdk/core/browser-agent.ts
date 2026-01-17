import { Stagehand } from "@browserbasehq/stagehand";
import type { AgentResult } from "@browserbasehq/stagehand";
import { injectTimerOverlay, stopTimerOverlay } from "./timer-overlay";

export interface BrowserAgentConfig {
  website: string;
  task: string;
  model?: string;
  maxSteps?: number;
  env?: "LOCAL" | "BROWSERBASE";
  apiKey?: string;
  projectId?: string;
  verbose?: 0 | 1 | 2;
  systemPrompt?: string;
  thinkingFormat?: string;
  onEvent?: (type: "think" | "action" | "status" | "error", data: any) => void;
}

export class BrowserAgent {
  private stagehand: Stagehand | null = null;
  private config: BrowserAgentConfig;

  constructor(config: BrowserAgentConfig) {
    this.config = {
      model: "google/gemini-3-flash-preview",
      maxSteps: 20,
      env: "LOCAL",
      verbose: 1, // Default to info level
      ...config,
    };
  }

  /**
   * Initialize the Stagehand instance
   */
  async init(): Promise<void> {
    const stagehandConfig: any = {
      env: this.config.env,
      experimental: true, // Required for hybrid mode and streaming
      verbose: this.config.verbose, // Pass verbosity to Stagehand
    };

    if (this.config.env === "BROWSERBASE") {
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

    console.log("Initializing Stagehand browser agent...");
    this.stagehand = new Stagehand(stagehandConfig);
    await this.stagehand.init();
    console.log("Stagehand initialized successfully");
  }

  /**
   * Execute the task and stream output
   */
  async execute(): Promise<AgentResult> {
    if (!this.stagehand) {
      throw new Error("Agent not initialized. Call init() first.");
    }

    // Default thinking format instructions
    const defaultThinkingFormat = `Keep your thinking concise and focused. Use 2-3 short sentences maximum. Be direct and avoid long paragraphs.`;
    
    const thinkingFormatInstructions = this.config.thinkingFormat || defaultThinkingFormat;

    // Default system prompt that encourages thinking
    const defaultSystemPrompt = `<role>
You are a helpful browser automation assistant specialized in web interaction and task execution.
</role>

<workflow>
Before taking any action, you MUST use the 'think' tool to explain:
1. What you're observing on the page
2. What you're trying to accomplish
3. Why you're choosing this specific action
4. What you expect to happen
</workflow>

<thinking_format>
${thinkingFormatInstructions}
</thinking_format>

<rules>
- Always use the 'think' tool before calling other tools like screenshot, ariaTree, click, scroll, etc.
- This helps users understand your reasoning process and improves transparency.
- After thinking, proceed with your action.
</rules>`;

    const agent = this.stagehand.agent({
      mode: "hybrid",
      model: this.config.model,
      stream: true, // Enable streaming mode
      systemPrompt: this.config.systemPrompt || defaultSystemPrompt,
    });

    const page = this.stagehand.context.pages()[0];
    console.log(`Navigating to: ${this.config.website}`);
    await page.goto(this.config.website);
    console.log("Page loaded, starting task execution...");

    // Inject timer overlay into the page
    await injectTimerOverlay(page);

    // Emit initial status
    if (this.config.onEvent) {
      this.config.onEvent('status', { status: 'running' });
    }

    // Track seen thoughts to avoid duplicates
    const seenThoughts = new Set<string>();

    // Track step history to force thinking
    let stepNumber = 0;
    let lastStepToolCalls: any[] = [];
    let lastStepHadThink = false;

    const streamResult = await agent.execute({
      instruction: this.config.task,
      maxSteps: this.config.maxSteps,
      callbacks: {
        // Intercept steps before execution to force thinking
        prepareStep: async (stepContext: any) => {
          stepNumber++;
          
          // Always require thinking at the start of each step (except first step)
          // OR if the previous step had actions without thinking
          const shouldRequireThinking = stepNumber > 1 && (!lastStepHadThink || lastStepToolCalls.some((tc: any) => tc.toolName !== 'think'));
          
          if (shouldRequireThinking) {
            const messages = stepContext.messages || [];
            
            // Add a user message requiring thinking before actions
            messages.push({
              role: 'user',
              content: 'CRITICAL: Before taking any action in this step, you MUST first use the "think" tool to explain what you observe, what you plan to do, and why. Only after using the think tool should you proceed with other actions.'
            });
            
            return {
              ...stepContext,
              messages: messages,
            };
          }
          
          return stepContext;
        },
        // Capture think tool calls when steps finish
        onStepFinish: async (event: any) => {
          // Store tool calls from this step
          if (event.toolCalls) {
            lastStepToolCalls = event.toolCalls;
            lastStepHadThink = event.toolCalls.some((tc: any) => tc.toolName === 'think');
            
            for (const toolCall of event.toolCalls) {
              if (toolCall.toolName === 'think') {
                // Extract thought from think tool call
                const thought = toolCall.args?.thought || 
                              toolCall.args?.text || 
                              toolCall.args?.input ||
                              toolCall.input ||
                              toolCall.args || '';
                
                if (thought) {
                  const thoughtText = typeof thought === 'string' 
                    ? thought 
                    : JSON.stringify(thought, null, 2);
                  
                  // Avoid duplicates
                  if (!seenThoughts.has(thoughtText)) {
                    seenThoughts.add(thoughtText);
                    console.log('\n💭 Thinking:', thoughtText);
                    // Emit event if callback provided
                    if (this.config.onEvent) {
                      this.config.onEvent('think', { thought: thoughtText });
                    }
                  }
                }
              } else if (toolCall.toolName !== 'think') {
                // Show other tool calls
                console.log(`\n🔧 Action: ${toolCall.toolName}`);
                // Emit event if callback provided
                if (this.config.onEvent) {
                  this.config.onEvent('action', { toolName: toolCall.toolName, args: toolCall.args });
                }
              }
            }
          } else {
            lastStepToolCalls = [];
            lastStepHadThink = false;
          }
        },
      },
    });

    // Stream fullStream to capture think tool calls in real-time
    for await (const event of streamResult.fullStream) {
      const eventAny = event as any;
      
      // Look for think tool calls in the stream
      if (event.type === 'tool-call' && eventAny.toolName === 'think') {
        // Extract thinking from think tool calls
        const thought = eventAny.args?.thought || 
                       eventAny.args?.text || 
                       eventAny.args?.input ||
                       eventAny.input ||
                       eventAny.args || '';
        
        if (thought) {
          const thoughtText = typeof thought === 'string' 
            ? thought 
            : JSON.stringify(thought, null, 2);
          
          // Avoid duplicates
          if (!seenThoughts.has(thoughtText)) {
            seenThoughts.add(thoughtText);
            console.log('\n💭 Thinking:', thoughtText);
            // Emit event if callback provided
            if (this.config.onEvent) {
              this.config.onEvent('think', { thought: thoughtText });
            }
          }
        }
      } else if (event.type === 'tool-call' && eventAny.toolName !== 'think') {
        // Show other tool calls (avoid duplicates with onStepFinish)
        // Only log if we haven't seen it in onStepFinish
        // For now, we'll let onStepFinish handle most tool calls
      } else if (event.type === 'tool-result' && eventAny.toolName === 'think') {
        // Think tool results - sometimes the result contains the thought
        const result = eventAny.result;
        if (result) {
          const resultText = typeof result === 'string' 
            ? result 
            : JSON.stringify(result, null, 2);
          
          if (!seenThoughts.has(resultText)) {
            seenThoughts.add(resultText);
            console.log('\n💭 Thought Result:', resultText);
          }
        }
      }
    }

    // Also stream textStream for any reasoning text
    for await (const delta of streamResult.textStream) {
      if (delta && delta.trim()) {
        // Filter out control characters
        const cleanDelta = delta.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        if (cleanDelta.trim()) {
          process.stdout.write(cleanDelta);
        }
      }
    }

    // Get the final result after streaming completes
    const finalResult = await streamResult.result;
    
    // Stop the timer when task completes
    await stopTimerOverlay(page);
    
    // Sanitize the message to remove control characters
    if (finalResult.message) {
      const sanitized = finalResult.message
        .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
        .replace(/<ctrl\d+>/gi, '') // Remove <ctrlXX> patterns
        .trim();
      
      // Only update if there's actual content after sanitization
      if (sanitized) {
        finalResult.message = sanitized;
      } else {
        // If message was only control characters, provide a default
        finalResult.message = finalResult.success 
          ? 'Task completed successfully' 
          : 'Task completed but may not have reached the goal';
      }
    }
    
    // Extract reasoning from the final close action if available
    if (finalResult.actions && finalResult.actions.length > 0) {
      const closeAction = finalResult.actions.find((action: any) => action.type === 'close');
      if (closeAction && closeAction.reasoning) {
        // Sanitize reasoning too
        let reasoning = closeAction.reasoning;
        if (typeof reasoning === 'string') {
          reasoning = reasoning
            .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
            .replace(/<ctrl\d+>/gi, '')
            .trim();
        }
        if (reasoning) {
          console.log('\n💭 Final Reasoning:', reasoning);
        }
      }
    }
    
    return finalResult;
  }


  /**
   * Close the browser and cleanup
   */
  async close(): Promise<void> {
    if (this.stagehand) {
      await this.stagehand.close();
    }
  }
}
