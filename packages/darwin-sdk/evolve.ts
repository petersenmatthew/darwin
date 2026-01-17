// Polyfill is loaded via --require flag in package.json scripts
import { BrowserAgent } from "./core/browser-agent";
import { toBrowserAgentConfig, loadConfig } from "./core/config";

// Example usage of BrowserAgent
// Run with: npx ts-node evolve.ts

async function main() {
  try {
    // Try to load config, or use defaults
    let config;
    try {
      config = toBrowserAgentConfig(loadConfig());
    } catch {
      // Use default config if file doesn't exist
      config = {
        website: "https://example.com",
        task: "Navigate the website and describe what you see",
        model: "google/gemini-3-flash-preview",
        maxSteps: 20,
        verbose: 2,
        env: "LOCAL",
      };
    }

    const agent = new BrowserAgent(config);

    try {
      await agent.init();
      const result = await agent.execute();
      agent.printLogSummary();
    } finally {
      await agent.close();
    }
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
