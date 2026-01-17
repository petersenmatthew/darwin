import { EventEmitter } from "events";
import type { BrowserAgentConfig } from "./browser-agent";
import type { AgentResult } from "@browserbasehq/stagehand";

export interface AgentSession {
  id: string;
  status: "initializing" | "running" | "completed" | "error" | "cancelled";
  config: BrowserAgentConfig;
  result?: AgentResult;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
  logs: LogEntry[];
}

export interface LogEntry {
  type: "think" | "action" | "status" | "error" | "log" | "result";
  timestamp: Date;
  message: string;
  data?: any;
}

class AgentSessionManager extends EventEmitter {
  private sessions = new Map<string, AgentSession>();
  private originalConsoleLog: typeof console.log;
  private originalConsoleError: typeof console.error;
  private originalConsoleWarn: typeof console.warn;
  private currentSessionId: string | null = null;

  constructor() {
    super();
    // Store original console methods
    this.originalConsoleLog = console.log;
    this.originalConsoleError = console.error;
    this.originalConsoleWarn = console.warn;
  }

  createSession(config: BrowserAgentConfig): string {
    const id = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const session: AgentSession = {
      id,
      status: "initializing",
      config,
      createdAt: new Date(),
      logs: [],
    };
    this.sessions.set(id, session);
    this.emit("session:created", id);
    return id;
  }

  getSession(id: string): AgentSession | undefined {
    return this.sessions.get(id);
  }

  updateSessionStatus(id: string, status: AgentSession["status"]): void {
    const session = this.sessions.get(id);
    if (session) {
      session.status = status;
      this.addLog(id, "status", `Status changed to: ${status}`);
      this.emit("session:status", id, status);
    }
  }

  setSessionResult(id: string, result: AgentResult): void {
    const session = this.sessions.get(id);
    if (session) {
      session.result = result;
      session.status = "completed";
      session.completedAt = new Date();
      this.addLog(id, "result", result.message || "Task completed");
      this.emit("session:completed", id, result);
    }
  }

  setSessionError(id: string, error: string): void {
    const session = this.sessions.get(id);
    if (session) {
      session.error = error;
      session.status = "error";
      session.completedAt = new Date();
      this.addLog(id, "error", error);
      this.emit("session:error", id, error);
    }
  }

  addLog(sessionId: string, type: LogEntry["type"], message: string, data?: any): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const logEntry: LogEntry = {
      type,
      timestamp: new Date(),
      message,
      data,
    };

    session.logs.push(logEntry);
    
    // Keep only last 1000 logs
    if (session.logs.length > 1000) {
      session.logs = session.logs.slice(-1000);
    }

    this.emit("session:log", sessionId, logEntry);
  }

  // Intercept console.log for a specific session
  startLogging(sessionId: string): void {
    this.currentSessionId = sessionId;
    
    // Helper to strip ANSI color codes (from chalk)
    const stripAnsi = (str: string): string => {
      // eslint-disable-next-line no-control-regex
      return str.replace(/\u001b\[[0-9;]*m/g, '');
    };
    
    // Helper to format console arguments
    const formatMessage = (args: any[]): string => {
      return args.map(arg => {
        if (typeof arg === 'string') {
          return stripAnsi(arg);
        } else if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}\n${arg.stack}`;
        } else {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
      }).join(' ');
    };
    
    // Override console methods to capture logs
    console.log = (...args: any[]) => {
      const message = formatMessage(args);
      
      // Check if it's a thinking message
      if (message.includes('💭 Thinking:') || message.includes('Thinking:')) {
        const thought = message.replace(/.*(?:💭 Thinking:|Thinking:)\s*/, '').trim();
        if (thought) {
          this.addLog(sessionId, "think", thought);
        }
      } else if (message.includes('🔧 Action:') || message.includes('Action:')) {
        const action = message.replace(/.*(?:🔧 Action:|Action:)\s*/, '').trim();
        this.addLog(sessionId, "action", action);
      } else if (message.trim()) {
        // Regular log - only add if not empty
        this.addLog(sessionId, "log", message);
      }
      
      // Also call original console.log
      this.originalConsoleLog(...args);
    };

    console.error = (...args: any[]) => {
      const message = formatMessage(args);
      if (message.trim()) {
        this.addLog(sessionId, "error", message);
      }
      this.originalConsoleError(...args);
    };

    console.warn = (...args: any[]) => {
      const message = formatMessage(args);
      if (message.trim()) {
        this.addLog(sessionId, "log", `WARN: ${message}`);
      }
      this.originalConsoleWarn(...args);
    };
    
    // Also intercept console.info and console.debug
    const originalConsoleInfo = console.info;
    console.info = (...args: any[]) => {
      const message = formatMessage(args);
      if (message.trim()) {
        this.addLog(sessionId, "log", message);
      }
      originalConsoleInfo(...args);
    };
    
    const originalConsoleDebug = console.debug;
    console.debug = (...args: any[]) => {
      const message = formatMessage(args);
      if (message.trim()) {
        this.addLog(sessionId, "log", `DEBUG: ${message}`);
      }
      originalConsoleDebug(...args);
    };
  }

  stopLogging(): void {
    // Restore original console methods
    console.log = this.originalConsoleLog;
    console.error = this.originalConsoleError;
    console.warn = this.originalConsoleWarn;
    // Note: console.info and console.debug are restored to their original state
    // They should be restored if we stored them, but for now we'll leave them
    this.currentSessionId = null;
  }

  cleanupOldSessions(): void {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, session] of this.sessions.entries()) {
      if (
        (session.status === "completed" || session.status === "error") &&
        session.completedAt &&
        session.completedAt.getTime() < oneHourAgo
      ) {
        this.sessions.delete(id);
      }
    }
  }
}

export const sessionManager = new AgentSessionManager();

// Cleanup old sessions every 30 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    sessionManager.cleanupOldSessions();
  }, 30 * 60 * 1000);
}
