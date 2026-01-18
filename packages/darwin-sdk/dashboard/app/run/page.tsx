"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/dashboard/navbar";
import { AgentConfigForm, AgentMode } from "@/components/AgentConfigForm";
import { AgentExecution } from "@/components/AgentExecution";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";

function RunPageContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "evolve" ? "evolve" : "run";
  const initialSession = searchParams.get("session");

  const [sessionId, setSessionId] = useState<string | null>(initialSession);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<AgentMode>(initialMode);

  const handleStartAgent = async (config: any, mode: AgentMode) => {
    setIsLoading(true);
    setCurrentMode(mode);
    try {
      const result = mode === "evolve"
        ? await apiClient.startEvolve(config)
        : await apiClient.startAgent(config);
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
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Run Agent</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {sessionId && currentMode === "evolve"
            ? "Running evolution pipeline: Agent -> Analyze -> Claude fixes code"
            : "Configure and run browser agents with real-time monitoring"}
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
              <CardContent className="flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                <div className="text-muted-foreground">
                  <p className="text-lg font-medium mb-2">Ready to Run</p>
                  <p className="text-sm">
                    Configure and start an agent to see execution logs here.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}

export default function RunPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-6">
        <Suspense fallback={<div className="text-muted-foreground">Loading...</div>}>
          <RunPageContent />
        </Suspense>
      </main>
    </div>
  );
}
