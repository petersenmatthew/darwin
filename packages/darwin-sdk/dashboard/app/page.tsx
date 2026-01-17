"use client";

import { useState } from "react";
import { AgentConfigForm } from "@/components/AgentConfigForm";
import { AgentExecution } from "@/components/AgentExecution";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";

export default function Dashboard() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartAgent = async (config: any) => {
    setIsLoading(true);
    try {
      const result = await apiClient.startAgent(config);
      // The Express API returns a simple response, we'll use a timestamp as session ID
      setSessionId(result.sessionId || `session-${Date.now()}`);
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewAgent = () => {
    setSessionId(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Darwin Orchestrator</h1>
          <p className="text-muted-foreground mt-2">
            Configure and run browser agents with real-time monitoring
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <AgentConfigForm
              onSubmit={handleStartAgent}
              isLoading={isLoading}
            />
          </div>

          <div>
            {sessionId ? (
              <AgentExecution
                sessionId={sessionId}
                onCancel={handleNewAgent}
              />
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                  <p className="text-muted-foreground">
                    Configure and start an agent to see execution logs here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
