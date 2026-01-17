import express from "express";
import cors from "cors";
import { BrowserAgent } from "./browser-agent";
import { loadConfig, toBrowserAgentConfig, type DarwinConfig } from "./config";
import chalk from "chalk";

export function startDarwin() {
  const app = express();
  const API_PORT = 3002;

  app.use(cors());
  app.use(express.json());

  app.get("/api/status", (req, res) => {
    res.json({ status: "ready", service: "Darwin Browser Agent API" });
  });

  app.get("/api/config", (req, res) => {
    try {
      const config = loadConfig();
      res.json(config);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  });

  app.post("/api/run", async (req, res) => {
    try {
      const {
        website,
        task,
        model,
        maxSteps,
        env,
        apiKey,
        projectId,
        systemPrompt,
        thinkingFormat,
      } = req.body;

      if (!website || !task) {
        return res.status(400).json({
          error: "Both 'website' and 'task' are required",
        });
      }

      // Load base config if available, otherwise use request body
      let config: DarwinConfig;
      try {
        config = loadConfig();
        // Override with request body values
        if (website) config.website = website;
        if (task) config.task = task;
        if (model) config.model = model;
        if (maxSteps) config.maxSteps = maxSteps;
        if (env) config.env = env;
        if (apiKey) config.apiKey = apiKey;
        if (projectId) config.projectId = projectId;
        if (systemPrompt) config.systemPrompt = systemPrompt;
        if (thinkingFormat) config.thinkingFormat = thinkingFormat;
      } catch {
        // No config file, use request body only
        config = {
          website,
          task,
          model: model || "google/gemini-3-flash-preview",
          maxSteps: maxSteps || 20,
          env: (env as "LOCAL" | "BROWSERBASE") || "LOCAL",
          apiKey,
          projectId,
          systemPrompt,
          thinkingFormat,
        };
      }

      const agentConfig = toBrowserAgentConfig(config);
      const agent = new BrowserAgent(agentConfig);

      // Run agent asynchronously and return immediately
      agent
        .init()
        .then(() => agent.execute())
        .then(() => {
          console.log(chalk.green("Task completed via API"));
          return agent.close();
        })
        .catch((error) => {
          console.error(chalk.red(`API task error: ${error.message}`));
          return agent.close();
        });

      res.json({
        status: "started",
        message: "Browser agent task started",
        config: {
          website: config.website,
          task: config.task,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/run-sync", async (req, res) => {
    try {
      const {
        website,
        task,
        model,
        maxSteps,
        env,
        apiKey,
        projectId,
        systemPrompt,
        thinkingFormat,
      } = req.body;

      if (!website || !task) {
        return res.status(400).json({
          error: "Both 'website' and 'task' are required",
        });
      }

      // Load base config if available
      let config: DarwinConfig;
      try {
        config = loadConfig();
        if (website) config.website = website;
        if (task) config.task = task;
        if (model) config.model = model;
        if (maxSteps) config.maxSteps = maxSteps;
        if (env) config.env = env;
        if (apiKey) config.apiKey = apiKey;
        if (projectId) config.projectId = projectId;
        if (systemPrompt) config.systemPrompt = systemPrompt;
        if (thinkingFormat) config.thinkingFormat = thinkingFormat;
      } catch {
        config = {
          website,
          task,
          model: model || "google/gemini-3-flash-preview",
          maxSteps: maxSteps || 20,
          env: (env as "LOCAL" | "BROWSERBASE") || "LOCAL",
          apiKey,
          projectId,
          systemPrompt,
          thinkingFormat,
        };
      }

      const agentConfig = toBrowserAgentConfig(config);
      const agent = new BrowserAgent(agentConfig);

      try {
        await agent.init();
        const result = await agent.execute();

        res.json({
          status: "completed",
          success: result.success,
          message: result.message,
          actions: result.actions?.length || 0,
        });
      } finally {
        await agent.close();
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(API_PORT, () => {
    console.log(chalk.green(`✓ Darwin Core API listening on port ${API_PORT}`));
    console.log(chalk.cyan(`  Dashboard should be running on http://localhost:3001`));
  });
}
