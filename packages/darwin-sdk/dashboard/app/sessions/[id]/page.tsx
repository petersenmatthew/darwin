"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Navbar } from "@/components/dashboard/navbar";
import { AgentExecution } from "@/components/AgentExecution";
import { EvolutionProgressSidebar } from "@/components/evolve/evolution-progress-sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api-client";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [totalIterations, setTotalIterations] = useState(1);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await apiClient.getSessionStatus(sessionId);
        setSession(data);
        const running = data.status === "running" || data.status === "initializing";
        setIsRunning(running);
        
        // Extract iteration count from logs if available
        if (data.logsCount) {
          // Try to determine iterations from logs or default to 1
          setTotalIterations(1);
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchSession();
      // Poll for status updates
      const interval = setInterval(fetchSession, 2000);
      return () => clearInterval(interval);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="p-6">
          <div className="text-center py-12">Loading session...</div>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="p-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Session not found</p>
            <Button asChild>
              <Link href="/">Back to Dashboard</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const isEvolution = session?.isEvolution || false;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - Session Details */}
        <main className="flex-1 p-6 min-w-0 overflow-y-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-semibold tracking-tight">Session Details</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Session ID: <code className="text-xs">{sessionId}</code>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Website:</span>
                  <div className="font-mono text-xs mt-1">{session.config?.website || "N/A"}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Task:</span>
                  <div className="mt-1">{session.config?.task || "N/A"}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1 font-medium">{session.status}</div>
                </div>
                {session.createdAt && (
                  <div>
                    <span className="text-muted-foreground">Started:</span>
                    <div className="mt-1">
                      {new Date(session.createdAt).toLocaleString()}
                    </div>
                  </div>
                )}
                {session.completedAt && (
                  <div>
                    <span className="text-muted-foreground">Completed:</span>
                    <div className="mt-1">
                      {new Date(session.completedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {session.result && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Success:</span>
                    <div className={`mt-1 font-medium ${session.result.success ? "text-green-500" : "text-red-500"}`}>
                      {session.result.success ? "Yes" : "No"}
                    </div>
                  </div>
                  {session.result.message && (
                    <div>
                      <span className="text-muted-foreground">Message:</span>
                      <div className="mt-1">{session.result.message}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <AgentExecution sessionId={sessionId} />
        </main>

        {/* Right Sidebar - Evolution Progress (only for evolution sessions) */}
        {isEvolution && (
          <aside className="w-96 border-l border-border bg-background shrink-0 flex flex-col">
            <div className="h-full overflow-y-auto">
              <EvolutionProgressSidebar
                isRunning={isRunning}
                totalIterations={totalIterations}
                sessionId={sessionId}
                onCreatePR={() => {
                  console.log("Create PR clicked");
                }}
              />
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
