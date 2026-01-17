import express from "express";
import cors from "cors";
import * as fs from "fs";
import * as path from "path";
import { BrowserAgent, ThoughtEntry } from "./browser-agent";
import { loadConfig, toBrowserAgentConfig, type DarwinConfig } from "./config";
import { sessionManager } from "./agent-sessions";
import { Analyst } from "./analyst";
import { AnalyticsSnapshot } from "../helpers/analytic-types";
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
      
      // Create session and add event callback
      const sessionId = sessionManager.createSession(agentConfig);
      agentConfig.onEvent = (type, data) => {
        if (type === 'think') {
          sessionManager.addLog(sessionId, 'think', data.thought || JSON.stringify(data));
        } else if (type === 'action') {
          sessionManager.addLog(sessionId, 'action', data.toolName || JSON.stringify(data));
        } else if (type === 'status') {
          sessionManager.addLog(sessionId, 'status', data.status || JSON.stringify(data));
        } else if (type === 'error') {
          sessionManager.addLog(sessionId, 'error', data.message || JSON.stringify(data));
        }
      };

      const agent = new BrowserAgent(agentConfig);

      // Start intercepting console logs BEFORE agent operations
      sessionManager.startLogging(sessionId);
      sessionManager.addLog(sessionId, "status", "Agent session created, initializing...");
      
      // Test that console interception is working
      console.log("✓ Console interception active for session:", sessionId);

      // Run agent asynchronously and return immediately
      agent
        .init()
        .then(() => {
          sessionManager.updateSessionStatus(sessionId, "running");
          sessionManager.addLog(sessionId, "status", "Agent initialized, starting execution...");
          return agent.execute();
        })
        .then((executeResult) => {
          sessionManager.setSessionResult(sessionId, executeResult.result);
          sessionManager.stopLogging();
          return agent.close();
        })
        .catch((error) => {
          sessionManager.setSessionError(sessionId, error.message);
          sessionManager.stopLogging();
          return agent.close();
        });

      res.json({
        sessionId,
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

  // Server-Sent Events endpoint for streaming logs
  app.get("/api/stream/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    // Send initial status and existing logs
    const sendEvent = (type: string, data: any) => {
      res.write(`event: ${type}\n`);
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    sendEvent("status", {
      status: session.status,
      sessionId: session.id,
      message: `Status: ${session.status}`,
    });

    // Send existing logs
    session.logs.forEach((log) => {
      sendEvent(log.type, {
        message: log.message,
        data: log.data,
        timestamp: log.timestamp.toISOString(),
      });
    });

    // Listen for new logs
    const logHandler = (sid: string, logEntry: any) => {
      if (sid === sessionId) {
        sendEvent(logEntry.type, {
          message: logEntry.message,
          data: logEntry.data,
          timestamp: logEntry.timestamp.toISOString(),
        });
      }
    };

    const statusHandler = (sid: string, status: string) => {
      if (sid === sessionId) {
        sendEvent("status", { 
          status, 
          sessionId: sid,
          message: `Status changed to: ${status}`,
        });
      }
    };

    const completedHandler = (sid: string, result: any) => {
      if (sid === sessionId) {
        sendEvent("result", {
          success: result.success,
          message: result.message,
        });
        // Close connection after a delay
        setTimeout(() => {
          res.end();
        }, 1000);
      }
    };

    const errorHandler = (sid: string, error: string) => {
      if (sid === sessionId) {
        sendEvent("error", { message: error });
      }
    };

    sessionManager.on("session:log", logHandler);
    sessionManager.on("session:status", statusHandler);
    sessionManager.on("session:completed", completedHandler);
    sessionManager.on("session:error", errorHandler);

    // Cleanup on client disconnect
    req.on("close", () => {
      sessionManager.off("session:log", logHandler);
      sessionManager.off("session:status", statusHandler);
      sessionManager.off("session:completed", completedHandler);
      sessionManager.off("session:error", errorHandler);
      res.end();
    });
  });

  // Get session status
  app.get("/api/session/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const session = sessionManager.getSession(sessionId);

    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    res.json({
      id: session.id,
      status: session.status,
      config: {
        website: session.config.website,
        task: session.config.task,
      },
      result: session.result
        ? {
            success: session.result.success,
            message: session.result.message,
          }
        : undefined,
      error: session.error,
      createdAt: session.createdAt.toISOString(),
      completedAt: session.completedAt?.toISOString(),
      logsCount: session.logs.length,
    });
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
        const { thoughts } = await agent.execute();

        res.json({
          status: "completed",
          success: true,
          thoughtCount: thoughts.length,
          thoughts: thoughts,
        });
      } finally {
        await agent.close();
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Full pipeline: Run agents → Analyze → Evolve (Claude updates code)
  app.post("/api/evolve", async (req, res) => {
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
        targetAppPath,
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

      console.log(chalk.blue("🚀 Starting evolution pipeline..."));

      // Step 1: Run the browser agent
      console.log(chalk.cyan("Step 1: Running browser agent..."));
      const agentConfig = toBrowserAgentConfig(config);
      const agent = new BrowserAgent(agentConfig);

      let thoughts: ThoughtEntry[] = [];
      try {
        await agent.init();
        const executeResult = await agent.execute();
        thoughts = executeResult.thoughts;
        console.log(chalk.green(`✓ Agent completed with ${thoughts.length} thoughts`));
      } finally {
        await agent.close();
      }

      // Step 2: Load events from events.json
      console.log(chalk.cyan("Step 2: Loading analytics events..."));
      const eventsFilePath = targetAppPath
        ? path.join(targetAppPath, "events.json")
        : path.join(process.cwd(), "../demo-app/events.json");

      let analyticsSnapshot: AnalyticsSnapshot = { events: [] };
      if (fs.existsSync(eventsFilePath)) {
        try {
          const eventsContent = fs.readFileSync(eventsFilePath, "utf-8");
          const events = JSON.parse(eventsContent);
          analyticsSnapshot = { events: Array.isArray(events) ? events : [] };
          console.log(chalk.green(`✓ Loaded ${analyticsSnapshot.events.length} events`));
        } catch (error) {
          console.log(chalk.yellow("⚠ Could not parse events.json, using empty events"));
        }
      } else {
        console.log(chalk.yellow("⚠ No events.json found, using empty events"));
      }

      // Step 3: Run the analyst
      console.log(chalk.cyan("Step 3: Analyzing data with Gemini..."));
      const appPath = targetAppPath || path.resolve(process.cwd(), "../demo-app");
      const analyst = new Analyst(appPath);
      const analysis = await analyst.analyze(analyticsSnapshot, thoughts);
      console.log(chalk.green(`✓ Analysis complete: ${analysis.mainProblems.length} issues found`));
      console.log(chalk.gray(`  Summary: ${analysis.summary}`));

      // Step 4: Evolve the codebase with Claude
      console.log(chalk.cyan("Step 4: Evolving codebase with Claude..."));
      const evolutionResult = await analyst.evolve(analysis);
      console.log(chalk.green("✓ Evolution complete!"));

      res.json({
        status: "completed",
        pipeline: {
          thoughts: thoughts.length,
          events: analyticsSnapshot.events.length,
          issues: analysis.mainProblems.length,
          analysis: analysis,
        },
        evolution: {
          stdout: evolutionResult.stdout,
          stderr: evolutionResult.stderr,
        },
      });
    } catch (error: any) {
      console.error(chalk.red(`Pipeline error: ${error.message}`));
      res.status(500).json({ error: error.message });
    }
  });

  app.listen(API_PORT, () => {
    console.log(chalk.green(`✓ Darwin Core API listening on port ${API_PORT}`));
    console.log(chalk.cyan(`  Dashboard should be running on http://localhost:3001`));
  });
}
