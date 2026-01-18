import { Stagehand } from "@browserbasehq/stagehand";
import { injectTimerOverlay, stopTimerOverlay } from "./timer-overlay";
import { injectAnalyticsOverlay, removeAnalyticsOverlay } from "./analytics-overlay";
import { injectReasoningOverlay, updateReasoningText, removeReasoningOverlay } from "./reasoning-overlay";

export interface BrowserAgentConfig {
  website: string;
  task: string;
  taskName?: string; // Task name/title for analytics (separate from task description)
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

export interface ThoughtEntry {
  step: number;
  text: string;
  timestamp: string;
  source: 'stream' | 'step_finish' | 'tool_result' | 'final_reasoning';
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
  async execute(): Promise<{ thoughts: ThoughtEntry[]; result: any; steps: number }> {
    if (!this.stagehand) {
      throw new Error("Agent not initialized. Call init() first.");
    }

    // Default thinking format instructions   

    // Default system prompt that encourages thinking
    const defaultSystemPrompt = `<role>
You are a simulating a human who is helpful specialized in web interaction and task execution.
</role>

<workflow>
Before taking any action, you MUST use the 'think' tool to explain:
1. What you're observing on the page
2. What you're trying to accomplish
3. Why you're choosing this specific action
4. What you expect to happen
</workflow>

<thinking_format>
- Keep your thinking super concise and focused and try to use the least amount of words possible.
- Use 1-2 short sentences maximum. NO MORE THAN 2.
- ANYTIME something is not compeltely as expected, point it out and critique and make a real suggestion. You should be doing this as much as possible.
- Visibly say stuff like "I thought it would be here", you want to visbly critque the UI
- Make suggestions for improvements to the UI based on what is confusing or not working as expected.
- Be direct and avoid long paragraphs.
</thinking_format>

<rules>
- Always use the 'think' tool before calling other tools like screenshot, click, scroll, etc.
- NEVER USE THE ariaTree tool.
- Write your reasoning thoughts in full english, no "/" or similar characters.
- Don't mention that you are an agent with tools, you are a HUMAN who is going through a site. 
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

    // Inject task information into the page for analytics tracking
    // Use taskName for analytics (title), fallback to task (description) if not provided
    const taskForAnalytics = this.config.taskName || this.config.task;
    await page.evaluate((task: string) => {
      if (typeof window !== 'undefined') {
        // Store task in localStorage so the demo app can access it
        localStorage.setItem('darwin_task', task);
        // Also set it on window for immediate access
        (window as any).__darwinTask = task;
      }
    }, taskForAnalytics);

    // Inject timer overlay into the page
    await injectTimerOverlay(page);
    
    // Inject analytics notification overlay
    await injectAnalyticsOverlay(page);
    
    // Inject reasoning subtitle overlay
    await injectReasoningOverlay(page);

    // Emit initial status
    if (this.config.onEvent) {
      this.config.onEvent('status', { status: 'running' });
    }

    // Track seen thoughts to avoid duplicates
    const thoughts: ThoughtEntry[] = [];
    const seenThoughts = new Set<string>();

    // Clean up reasoning text by removing JSON-like prefixes and brackets
    const cleanReasoningText = (text: string): string => {
      if (!text) return text;
      
      let cleaned = text.trim();
      
      // Remove JSON-like prefixes like { "reasoning": or {"reasoning":
      cleaned = cleaned.replace(/^\s*\{\s*["']?reasoning["']?\s*:\s*/i, '');
      
      // Remove leading/trailing braces and quotes
      cleaned = cleaned.replace(/^\s*\{+\s*/, '');
      cleaned = cleaned.replace(/\s*\}+\s*$/, '');
      cleaned = cleaned.replace(/^\s*\[+\s*/, '');
      cleaned = cleaned.replace(/\s*\]+$/, '');
      
      // Remove leading/trailing quotes if the entire string is quoted
      if ((cleaned.startsWith('"') && cleaned.endsWith('"')) || 
          (cleaned.startsWith("'") && cleaned.endsWith("'"))) {
        cleaned = cleaned.slice(1, -1);
      }
      
      // Remove common JSON prefixes
      cleaned = cleaned.replace(/^\s*["']?thought["']?\s*:\s*/i, '');
      cleaned = cleaned.replace(/^\s*["']?text["']?\s*:\s*/i, '');
      cleaned = cleaned.replace(/^\s*["']?input["']?\s*:\s*/i, '');
      
      return cleaned.trim();
    };

    const addThought = (text: string, source: ThoughtEntry['source'], step: number) => {
      // Clean the text before processing
      const cleanedText = cleanReasoningText(text);
      
      if (!cleanedText || !seenThoughts.has(cleanedText)) {
        seenThoughts.add(cleanedText);
        thoughts.push({
          step,
          text: cleanedText,
          timestamp: new Date().toISOString(),
          source,
        });
        console.log('\n💭 Thinking:', cleanedText);
        
        // Update reasoning overlay in real-time (fire and forget to not block)
        updateReasoningText(page, cleanedText).catch((err) => {
          // Log error for debugging but don't block execution
          console.error('Failed to update reasoning overlay:', err);
        });
      }
    };

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

                  addThought(thoughtText, 'step_finish', stepNumber);
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

          addThought(thoughtText, 'stream', stepNumber);
        }
      } else if (event.type === 'tool-result' && eventAny.toolName === 'think') {
        // Think tool results - sometimes the result contains the thought
        const result = eventAny.result;
        if (result) {
          const resultText = typeof result === 'string'
            ? result
            : JSON.stringify(result, null, 2);

          addThought(resultText, 'tool_result', stepNumber);
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
    
    // Clear reasoning overlay when task completes
    await updateReasoningText(page, '');
    
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
          addThought(reasoning, 'final_reasoning', stepNumber);
        }
      }
    }

    return { thoughts, result: finalResult, steps: stepNumber };
  }


  /**
   * Close the browser and cleanup
   */
  async close(): Promise<void> {
    if (this.stagehand) {
      const page = this.stagehand.context.pages()[0];
      
      // Send session_ended event before closing
      try {
        // Wait for the event to be sent with a timeout
        await Promise.race([
          page.evaluate(async (task: string) => {
            if (typeof window !== 'undefined') {
              // Get session and user IDs
              const sessionId = sessionStorage.getItem('analytics_session_id') || 
                              localStorage.getItem('analytics_session_id');
              const userId = localStorage.getItem('analytics_user_id') || 
                            sessionStorage.getItem('analytics_user_id');
              
              if (!sessionId) {
                console.warn('No session ID found, cannot send session_ended event');
                return;
              }
              
              // Try to use the exposed trackEvent function
              if ((window as any).__darwinTrackEvent) {
                const sessionDuration = (window as any).__darwinSessionStartTime 
                  ? Date.now() - (window as any).__darwinSessionStartTime 
                  : undefined;
                
                // Get task name from localStorage (set by browser agent) or use task parameter
                const taskName = localStorage.getItem('darwin_task') || task;
                await (window as any).__darwinTrackEvent('session_ended', {
                  page_name: window.location.pathname,
                  session_duration: sessionDuration,
                  task: taskName,
                  task_name: taskName,
                });
              } else {
                // Fallback: send directly via fetch and wait for it
                try {
                  // Get task name from localStorage (set by browser agent) or use task parameter
                  const taskName = localStorage.getItem('darwin_task') || task;
                  const response = await fetch('/api/events', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      event: 'session_ended',
                      session_id: sessionId,
                      user_id: userId,
                      timestamp: Date.now(),
                      page_name: window.location.pathname,
                      task: taskName,
                      task_name: taskName,
                    }),
                  });
                  
                  if (!response.ok) {
                    console.error('Failed to send session_ended event:', response.statusText);
                  }
                } catch (e) {
                  console.error('Error sending session_ended event:', e);
                }
              }
            }
          }, this.config.task),
          new Promise((resolve) => setTimeout(resolve, 3000)) // 3 second timeout
        ]);
      } catch (error) {
        console.error('Error sending session_ended event:', error);
      }
      if (page) {
        await removeAnalyticsOverlay(page);
        await removeReasoningOverlay(page);
      }
      await this.stagehand.close();
    }
  }
}
