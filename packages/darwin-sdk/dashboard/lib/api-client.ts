// API client for communicating with the Express API server
// In browser, we need to use the full URL since process.env isn't available
const API_BASE_URL = typeof window !== 'undefined' 
  ? (process.env.NEXT_PUBLIC_DARWIN_API_URL || 'http://localhost:3002')
  : (process.env.DARWIN_API_URL || 'http://localhost:3002');

export interface AgentConfig {
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
  targetAppPath?: string;
}

export interface AgentSession {
  sessionId: string;
  status: string;
  config: {
    website: string;
    task: string;
  };
}

export class DarwinAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async checkStatus(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${this.baseUrl}/api/status`);
    if (!response.ok) {
      throw new Error(`API server not available: ${response.statusText}`);
    }
    return response.json();
  }

  async startAgent(config: AgentConfig): Promise<AgentSession> {
    const response = await fetch(`${this.baseUrl}/api/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start agent');
    }

    return response.json();
  }

  async runAgentSync(config: AgentConfig): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/run-sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to run agent');
    }

    return response.json();
  }

  async getConfig(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/config`);
    if (!response.ok) {
      throw new Error('Failed to get config');
    }
    return response.json();
  }

  async getSessionStatus(sessionId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/session/${sessionId}`);
    if (!response.ok) {
      throw new Error('Failed to get session status');
    }
    return response.json();
  }

  getStreamUrl(sessionId: string): string {
    return `${this.baseUrl}/api/stream/${sessionId}`;
  }

  async startEvolve(config: AgentConfig): Promise<AgentSession> {
    const response = await fetch(`${this.baseUrl}/api/evolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to start evolution');
    }

    return response.json();
  }

  async getAllSessions(): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/api/sessions`);
    if (!response.ok) {
      throw new Error('Failed to get sessions');
    }
    return response.json();
  }

  async getMetrics(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/metrics`);
    if (!response.ok) {
      throw new Error('Failed to get metrics');
    }
    return response.json();
  }
}

export const apiClient = new DarwinAPIClient();
