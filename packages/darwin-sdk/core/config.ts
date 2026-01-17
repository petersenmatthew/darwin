import * as fs from "fs";
import * as path from "path";
import type { BrowserAgentConfig } from "./browser-agent";

export interface DarwinConfig {
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

const DEFAULT_CONFIG_PATH = path.join(process.cwd(), "darwin.config.json");

/**
 * Load configuration from a JSON file
 */
export function loadConfig(configPath?: string): DarwinConfig {
  const configFile = configPath || DEFAULT_CONFIG_PATH;

  if (!fs.existsSync(configFile)) {
    throw new Error(
      `Config file not found: ${configFile}\n` +
        `Create a darwin.config.json file with your website and task configuration.`
    );
  }

  try {
    const content = fs.readFileSync(configFile, "utf-8");
    const config = JSON.parse(content) as DarwinConfig;

    // Validate required fields
    if (!config.website) {
      throw new Error("Config must include 'website' field");
    }
    if (!config.task) {
      throw new Error("Config must include 'task' field");
    }

    return config;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON in config file: ${configFile}`);
    }
    throw error;
  }
}

/**
 * Save configuration to a JSON file
 */
export function saveConfig(config: DarwinConfig, configPath?: string): void {
  const configFile = configPath || DEFAULT_CONFIG_PATH;
  fs.writeFileSync(configFile, JSON.stringify(config, null, 2), "utf-8");
}

/**
 * Create a default configuration file
 */
export function createDefaultConfig(configPath?: string): void {
  const configFile = configPath || DEFAULT_CONFIG_PATH;

  if (fs.existsSync(configFile)) {
    throw new Error(`Config file already exists: ${configFile}`);
  }

  const defaultConfig: DarwinConfig = {
    website: "https://example.com",
    task: "Navigate the website, describe what you see, and critique the UI/UX design. Think out loud about your observations and any issues you notice.",
    model: "google/gemini-3-flash-preview",
    maxSteps: 20,
    verbose: 2,
    env: "LOCAL",
    viewport: {
      width: 1288,
      height: 711,
    },
    systemPrompt:
      "You are a helpful browser automation assistant that navigates websites like a human would. You must continuously think out loud and critique the UI as you navigate. Use the 'think' tool frequently to share your reasoning, observations, and decision-making process. Actively critique the user interface - identify confusing elements, accessibility issues, poor visual hierarchy, navigation difficulties, and highlight both good and bad UX patterns. Move the cursor naturally, scroll smoothly, and take your time to ensure accuracy.",
  };

  saveConfig(defaultConfig, configFile);
  console.log(`Created default config file: ${configFile}`);
}

/**
 * Convert DarwinConfig to BrowserAgentConfig
 */
export function toBrowserAgentConfig(config: DarwinConfig): BrowserAgentConfig {
  return {
    website: config.website,
    task: config.task,
    model: config.model,
    maxSteps: config.maxSteps,
    verbose: config.verbose,
    env: config.env,
    apiKey: config.apiKey,
    projectId: config.projectId,
    integrations: config.integrations,
    systemPrompt: config.systemPrompt,
    viewport: config.viewport,
  };
}
