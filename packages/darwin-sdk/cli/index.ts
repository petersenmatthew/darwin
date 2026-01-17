#!/usr/bin/env node
// Polyfill is loaded via --require flag in package.json scripts
// Load environment variables from .env file
import * as dotenv from "dotenv";
import * as path from "path";
import * as fs from "fs";

// Load .env from project root (two levels up from packages/darwin-sdk)
const envPath = path.resolve(__dirname, "../../../.env");
dotenv.config({ path: envPath });

// Also try loading from current directory
dotenv.config();

import { Command } from "commander";
import { BrowserAgent, ThoughtEntry } from "../core/browser-agent";
import { Analyst } from "../core/analyst";
import { AnalyticsSnapshot } from "../helpers/analytic-types";
import {
  loadConfig,
  saveConfig,
  createDefaultConfig,
  toBrowserAgentConfig,
  type DarwinConfig,
} from "../core/config";
import chalk from "chalk";

const program = new Command();

program
  .name("darwin")
  .description("Darwin: Browser automation with Stagehand")
  .version("0.0.1");

program
  .command("init")
  .description("Create a default configuration file")
  .option("-c, --config <path>", "Path to config file", "darwin.config.json")
  .action((options) => {
    try {
      createDefaultConfig(options.config);
      console.log(chalk.green("✓ Configuration file created!"));
      console.log(
        chalk.cyan(
          `\nEdit ${options.config} to set your website and task, then run:`
        )
      );
      console.log(chalk.yellow("  darwin run\n"));
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command("run")
  .description("Run the browser agent with the configured task")
  .option("-c, --config <path>", "Path to config file", "darwin.config.json")
  .option("-w, --website <url>", "Override website URL")
  .option("-t, --task <task>", "Override task description")
  .option("-m, --model <model>", "Override model")
  .option("-s, --steps <number>", "Override max steps", parseInt)
  .option("--env <env>", "Environment: LOCAL or BROWSERBASE", "LOCAL")
  .action(async (options) => {
    try {
      // Load config
      let config: DarwinConfig;
      try {
        config = loadConfig(options.config);
      } catch (error: any) {
        if (error.message.includes("not found")) {
          console.error(chalk.red(error.message));
          console.log(
            chalk.yellow(
              `\nRun 'darwin init' to create a configuration file.\n`
            )
          );
          process.exit(1);
        }
        throw error;
      }

      // Override with command line options
      if (options.website) config.website = options.website;
      if (options.task) config.task = options.task;
      if (options.model) config.model = options.model;
      if (options.steps) config.maxSteps = options.steps;
      if (options.env) config.env = options.env as "LOCAL" | "BROWSERBASE";

      // Validate
      if (!config.website) {
        throw new Error("Website is required. Set it in config or use --website");
      }
      if (!config.task) {
        throw new Error("Task is required. Set it in config or use --task");
      }

      // Create and run agent
      const agentConfig = toBrowserAgentConfig(config);
      const agent = new BrowserAgent(agentConfig);

      try {
        await agent.init();
        const { thoughts } = await agent.execute();

        console.log(chalk.green(`\n✓ Task completed`));
        console.log(chalk.cyan(`  Thoughts captured: ${thoughts.length}`));

        // Output thoughts as JSON
        console.log(chalk.cyan(`\n📋 Thoughts JSON:`));
        console.log(JSON.stringify(thoughts, null, 2));

        process.exit(0);
      } finally {
        await agent.close();
      }
    } catch (error: any) {
      console.error(chalk.red(`\nError: ${error.message}`));
      if (error.stack && process.env.DEBUG) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

program
  .command("config")
  .description("Manage configuration")
  .option("-c, --config <path>", "Path to config file", "darwin.config.json")
  .option("--set-website <url>", "Set website URL")
  .option("--set-task <task>", "Set task description")
  .option("--set-model <model>", "Set model")
  .option("--set-steps <number>", "Set max steps", parseInt)
  .action((options) => {
    try {
      let config: DarwinConfig;
      try {
        config = loadConfig(options.config);
      } catch (error: any) {
        if (error.message.includes("not found")) {
          // Create default config if it doesn't exist
          createDefaultConfig(options.config);
          config = loadConfig(options.config);
    } else {
          throw error;
        }
      }

      // Update config values
      if (options.setWebsite) config.website = options.setWebsite;
      if (options.setTask) config.task = options.setTask;
      if (options.setModel) config.model = options.setModel;
      if (options.setSteps) config.maxSteps = options.setSteps;

      // Save updated config
      saveConfig(config, options.config);
      console.log(chalk.green(`✓ Configuration updated: ${options.config}`));
      console.log(chalk.cyan(JSON.stringify(config, null, 2)));
    } catch (error: any) {
      console.error(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

program
  .command("evolve")
  .description("Run the full evolution pipeline: agent → analyze → claude updates code")
  .option("-c, --config <path>", "Path to config file", "darwin.config.json")
  .option("-w, --website <url>", "Override website URL")
  .option("-t, --task <task>", "Override task description")
  .option("-m, --model <model>", "Override model")
  .option("-s, --steps <number>", "Override max steps", parseInt)
  .option("--env <env>", "Environment: LOCAL or BROWSERBASE", "LOCAL")
  .option("--target <path>", "Target app path for Claude to modify", "../demo-app")
  .action(async (options) => {
    try {
      // Load config
      let config: DarwinConfig;
      try {
        config = loadConfig(options.config);
      } catch (error: any) {
        if (error.message.includes("not found")) {
          console.error(chalk.red(error.message));
          console.log(
            chalk.yellow(
              `\nRun 'darwin init' to create a configuration file.\n`
            )
          );
          process.exit(1);
        }
        throw error;
      }

      // Override with command line options
      if (options.website) config.website = options.website;
      if (options.task) config.task = options.task;
      if (options.model) config.model = options.model;
      if (options.steps) config.maxSteps = options.steps;
      if (options.env) config.env = options.env as "LOCAL" | "BROWSERBASE";

      // Validate
      if (!config.website) {
        throw new Error("Website is required. Set it in config or use --website");
      }
      if (!config.task) {
        throw new Error("Task is required. Set it in config or use --task");
      }

      const targetAppPath = path.resolve(process.cwd(), options.target);

      console.log(chalk.blue("\n🧬 Darwin Evolution Pipeline\n"));
      console.log(chalk.gray(`  Website: ${config.website}`));
      console.log(chalk.gray(`  Task: ${config.task}`));
      console.log(chalk.gray(`  Target: ${targetAppPath}\n`));


      // Clear events.json before starting
      const eventsFilePath = path.join(targetAppPath, "events.json");
      console.log(chalk.cyan("Clearing previous events..."));
      fs.writeFileSync(eventsFilePath, "[]", "utf-8");
      console.log(chalk.green("✓ Events cleared\n"));

      // Step 1: Run the browser agent
      console.log(chalk.cyan("Step 1: Running browser agent..."));
      const agentConfig = toBrowserAgentConfig(config);
      const agent = new BrowserAgent(agentConfig);

      let thoughts: ThoughtEntry[] = [];
      try {
        await agent.init();
        const executeResult = await agent.execute();
        thoughts = executeResult.thoughts;
        console.log(chalk.green(`✓ Agent completed with ${thoughts.length} thoughts\n`));
      } finally {
        await agent.close();
      }

      // Step 2: Load events from events.json
      console.log(chalk.cyan("Step 2: Loading analytics events..."));

      let analyticsSnapshot: AnalyticsSnapshot = { events: [] };
      if (fs.existsSync(eventsFilePath)) {
        try {
          const eventsContent = fs.readFileSync(eventsFilePath, "utf-8");
          const events = JSON.parse(eventsContent);
          analyticsSnapshot = { events: Array.isArray(events) ? events : [] };
          console.log(chalk.green(`✓ Loaded ${analyticsSnapshot.events.length} events\n`));
        } catch (error) {
          console.log(chalk.yellow("⚠ Could not parse events.json, using empty events\n"));
        }
      } else {
        console.log(chalk.yellow("⚠ No events.json found, using empty events\n"));
      }

      // Step 3: Run the analyst
      console.log(chalk.cyan("Step 3: Analyzing data with Gemini..."));
      const analyst = new Analyst(targetAppPath);
      const analysis = await analyst.analyze(analyticsSnapshot, thoughts);
      console.log(chalk.green(`✓ Analysis complete: ${analysis.mainProblems.length} issues found`));
      console.log(chalk.gray(`  Summary: ${analysis.summary}\n`));

      if (analysis.mainProblems.length > 0) {
        console.log(chalk.yellow("  Issues found:"));
        analysis.mainProblems.forEach((problem, i) => {
          console.log(chalk.gray(`    ${i + 1}. [${problem.severity}] ${problem.affectedArea}: ${problem.hypothesis}`));
        });
        console.log("");
      }

      // Step 4: Evolve the codebase with Claude
      console.log(chalk.cyan("Step 4: Evolving codebase with Claude..."));
      const evolutionResult = await analyst.evolve(analysis);
      console.log(chalk.green("\n✓ Evolution complete!\n"));

      if (evolutionResult.stdout) {
        console.log(chalk.gray("Claude output:"));
        console.log(evolutionResult.stdout);
      }

      process.exit(0);
    } catch (error: any) {
      console.error(chalk.red(`\nError: ${error.message}`));
      if (error.stack && process.env.DEBUG) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

program.parse(process.argv);
