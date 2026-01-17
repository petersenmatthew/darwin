import { Stagehand } from "@browserbasehq/stagehand";
import type { AgentResult } from "@browserbasehq/stagehand";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import * as dotenv from "dotenv";
import * as path from "path";
import chalk from "chalk";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

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
}

export class BrowserAgent {
  private stagehand: Stagehand | null = null;
  private config: BrowserAgentConfig;
  private elevenLabsClient: ElevenLabsClient | null = null;

  constructor(config: BrowserAgentConfig) {
    this.config = {
      model: "google/gemini-3-flash-preview",
      maxSteps: 20,
      env: "LOCAL",
      verbose: 1, // Default to info level
      ...config,
    };

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (apiKey) {
      this.elevenLabsClient = new ElevenLabsClient({ apiKey });
    } else {
      console.warn(chalk.yellow("ELEVENLABS_API_KEY not found. TTS will be disabled."));
    }
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

    if (this.config.env === "LOCAL") {
      stagehandConfig.localBrowserLaunchOptions = {
        headless: false, // Show browser window
        args: [
          "--disable-web-security",
          "--disable-features=IsolateOrigins,site-per-process",
          "--autoplay-policy=no-user-gesture-required",
        ],
      };
    }

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

    this.stagehand = new Stagehand(stagehandConfig);
    await this.stagehand.init();
  }

  /**
   * Generate speech audio from text using ElevenLabs
   */
  private async generateSpeech(text: string): Promise<string | null> {
    if (!this.elevenLabsClient) return null;

    try {
      const audioStream = await this.elevenLabsClient.textToSpeech.convert(
        "JBFqnCBsd6RMkjVDRZzb", // Default voice ID
        {
          outputFormat: "mp3_44100_128",
          text: text,
          modelId: "eleven_multilingual_v2",
        }
      );

      const chunks: any[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);
      return audioBuffer.toString("base64");
    } catch (error) {
      console.error(chalk.red("ElevenLabs TTS Error:"), error);
      return null;
    }
  }

  /**
   * Inject the 3D Agent Overlay into the page
   */
  private async injectOverlay(page: any) {
    try {
      await page.evaluate(() => {
        (window as any).createAgentOverlay = () => {
          if (document.getElementById("agent-overlay")) return;

          console.log("Injecting Agent Overlay...");

          const container = document.createElement("div");
          container.id = "agent-overlay";
          container.style.position = "fixed";
          container.style.bottom = "20px";
          container.style.left = "20px";
          container.style.width = "250px";
          container.style.height = "250px";
          container.style.zIndex = "2147483647";
          container.style.pointerEvents = "none";
          container.style.borderRadius = "50%";
          container.style.overflow = "hidden";
          container.style.border = "4px solid yellow"; // Loading state
          container.style.backgroundColor = "rgba(0,0,0,0.8)";
          container.style.transition = "border-color 0.5s";
          container.innerHTML =
            '<div style="color:white; text-align:center; padding-top:100px; font-family:sans-serif;">Initializing Agent...</div>';

          document.body.appendChild(container);

          const mod = document.createElement("script");
          mod.type = "module";
          mod.textContent = `
                    import { TalkingHead } from "https://esm.sh/@met4citizen/talkinghead@1.7.0";
                    
                    (async () => {
                        try {
                            const node = document.getElementById('agent-overlay');
                            if (!node) return;
                            node.innerHTML = '';
                            
                            const head = new TalkingHead(node, {
                                cameraView: "head",
                                avatarMood: "neutral",
                                lipsyncModules: ["en"],
                                cameraDistance: 1.5
                            });

                            await head.loadAvatar("https://models.readyplayer.me/64b73eac23865614945417e9.glb");
                            
                            node.style.borderColor = '#00ff00'; // Ready state
                            node.style.backgroundColor = 'rgba(0,0,0,0.5)';
                            
                            head.start();
                            window.agentHead = head;
                            console.log("Agent Head Ready");
                        } catch(e) {
                            console.error("Agent Head Init Failed:", e);
                            const node = document.getElementById('agent-overlay');
                            if(node) {
                                node.style.borderColor = 'red';
                                node.innerHTML = '<div style="color:red; text-align:center; padding-top:100px;">Load Failed</div>';
                            }
                        }
                    })();
                `;
          document.body.appendChild(mod);
        };

        (window as any).createAgentOverlay();

        // Persistence logic
        const observer = new MutationObserver(() => {
          if (!document.getElementById("agent-overlay")) {
            (window as any).createAgentOverlay();
          }
        });
        observer.observe(document.body, { childList: true });
      });
    } catch (e) {
      console.error(chalk.red(`Failed to inject overlay: ${e}`));
    }
  }

  /**
   * Send audio to the browser overlay to speak
   */
  private async speakInBrowser(base64Audio: string, text: string) {
    if (!this.stagehand) return;
    const page = this.stagehand.context.pages()[0];
    if (!page) return;

    try {
      const dataUri = `data:audio/mpeg;base64,${base64Audio}`;
      await page.evaluate(
        ({ uri, text }) => {
          // Try to use the 3D Head first
          if ((window as any).agentHead) {
            fetch(uri)
              .then((res) => res.arrayBuffer())
              .then((buffer) => {
                (window as any).agentHead.speakAudio(buffer, { text: text });
              })
              .catch((e) => console.error("Head Playback error:", e));
          } else {
            // Fallback: Play audio directly if head isn't ready
            console.log("Agent Head not ready, playing audio only.");
            const audio = new Audio(uri);
            audio.play().catch((e) => console.error("Audio Playback error:", e));
          }
        },
        { uri: dataUri, text }
      );
    } catch (error) {
      console.error("Failed to speak in browser:", error);
    }
  }

  /**
   * Execute the task and stream output
   */
  async execute(): Promise<AgentResult> {
    if (!this.stagehand) {
      throw new Error("Agent not initialized. Call init() first.");
    }

    const agent = this.stagehand.agent({
      mode: "hybrid",
      model: this.config.model,
      stream: true, // Enable streaming mode
      systemPrompt:
        this.config.systemPrompt ||
        "You are a helpful browser automation assistant. Think out loud before every action.",
    });

    const page = this.stagehand.context.pages()[0];
    await page.goto(this.config.website);

    // Inject the 3D model overlay
    await this.injectOverlay(page);

    const seenThoughts = new Set<string>();
    let stepNumber = 0;
    let lastStepHadThink = false;
    let lastStepToolCalls: any[] = [];

    const streamResult = await agent.execute({
      instruction: this.config.task,
      maxSteps: this.config.maxSteps,
      callbacks: {
        prepareStep: async (stepContext: any) => {
          stepNumber++;
          // Re-inject overlay on each step to ensure it persists
          await this.injectOverlay(this.stagehand!.context.pages()[0]);

          const shouldRequireThinking =
            stepNumber > 1 &&
            (!lastStepHadThink ||
              lastStepToolCalls.some((tc: any) => tc.toolName !== "think"));

          if (shouldRequireThinking) {
            const messages = stepContext.messages || [];
            messages.push({
              role: "user",
              content:
                'CRITICAL: Before taking any action in this step, you MUST first use the "think" tool to explain what you observe, what you plan to do, and why.',
            });
            return { ...stepContext, messages };
          }
          return stepContext;
        },
        onStepFinish: async (event: any) => {
          if (event.toolCalls) {
            lastStepToolCalls = event.toolCalls;
            lastStepHadThink = event.toolCalls.some(
              (tc: any) => tc.toolName === "think"
            );

            for (const toolCall of event.toolCalls) {
              if (toolCall.toolName === "think") {
                const thought =
                  toolCall.args?.thought ||
                  toolCall.args?.text ||
                  toolCall.args?.input ||
                  toolCall.input ||
                  toolCall.args ||
                  "";

                if (thought) {
                  const thoughtText =
                    typeof thought === "string"
                      ? thought
                      : JSON.stringify(thought, null, 2);

                  if (!seenThoughts.has(thoughtText)) {
                    seenThoughts.add(thoughtText);
                    console.log("\n💭 Thinking:", thoughtText);

                    // Narrate using elevenlabs
                    const base64Audio = await this.generateSpeech(thoughtText);
                    if (base64Audio) {
                      await this.speakInBrowser(base64Audio, thoughtText);
                    }
                  }
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

    // Stream real-time thinking
    for await (const event of streamResult.fullStream) {
      const eventAny = event as any;
      if (event.type === "tool-call" && eventAny.toolName === "think") {
        const thought =
          eventAny.args?.thought ||
          eventAny.args?.text ||
          eventAny.args?.input ||
          eventAny.input ||
          eventAny.args ||
          "";

        if (thought) {
          const thoughtText =
            typeof thought === "string" ? thought : JSON.stringify(thought);
          if (!seenThoughts.has(thoughtText)) {
            seenThoughts.add(thoughtText);
            console.log("\n💭 Thinking:", thoughtText);

            // Real-time narration
            this.generateSpeech(thoughtText).then((audio) => {
              if (audio) this.speakInBrowser(audio, thoughtText);
            });
          }
        }
      }
    }

    const finalResult = await streamResult.result;
    return finalResult;
  }

  async close(): Promise<void> {
    if (this.stagehand) {
      await this.stagehand.close();
    }
  }
}