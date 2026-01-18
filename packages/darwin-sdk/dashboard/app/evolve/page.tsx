"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/dashboard/navbar";
import { EvolutionConfigPanel, type EvolutionConfig } from "@/components/evolve/evolution-config-panel";
import { apiClient } from "@/lib/api-client";

export default function EvolvePage() {
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);

  const handleStartEvolution = async (config: EvolutionConfig) => {
    try {
      setIsRunning(true);
      
      // Convert evolution config to agent config
      // Website URL is constructed from the port in the evolve config
      const website = `http://localhost:${config.port}`;
      const agentConfig = {
        website: website,
        task: config.taskConfig?.description || config.taskConfig?.name || "Run evolution", // Use description for agent execution
        taskName: config.taskConfig?.name || config.taskConfig?.description || "Run evolution", // Use name for analytics
        model: "google/gemini-3-flash-preview",
        maxSteps: config.maxSteps,
        env: "LOCAL" as const,
        targetAppPath: "../../demo-app",
      };

      const result = await apiClient.startEvolve(agentConfig);
      
      // Navigate to session detail page where evolution progress will be shown
      router.push(`/sessions/${result.sessionId}`);
    } catch (error: any) {
      alert(`Failed to start evolution: ${error.message}`);
      setIsRunning(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-4xl">
          <EvolutionConfigPanel
            onStartEvolution={handleStartEvolution}
            isRunning={isRunning}
          />
        </div>
      </main>
    </div>
  );
}
