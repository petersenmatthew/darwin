"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  BarChart2,
  Paintbrush,
  Check,
  Loader2,
  GitPullRequest,
  Clock,
  FileCode,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

type EvolutionStage = "exploring" | "analyzing" | "creating" | "complete" | "idle";

interface UIChange {
  id: string;
  component: string;
  description: string;
  type: "added" | "modified" | "removed";
  file: string;
  impact: "high" | "medium" | "low";
}

interface EvolutionProgressSidebarProps {
  isRunning: boolean;
  totalIterations: number;
  onCreatePR?: () => void;
  sessionId?: string;
}

const mockChanges: UIChange[] = [
  {
    id: "1",
    component: "HeroSection",
    description: "Increased CTA button contrast and size for better visibility",
    type: "modified",
    file: "components/hero-section.tsx",
    impact: "high",
  },
  {
    id: "2",
    component: "NavigationMenu",
    description: "Added hover animations and improved spacing between items",
    type: "modified",
    file: "components/navigation.tsx",
    impact: "medium",
  },
  {
    id: "3",
    component: "ProductCard",
    description: "New card layout with improved image aspect ratio",
    type: "added",
    file: "components/product-card.tsx",
    impact: "high",
  },
  {
    id: "4",
    component: "FooterLinks",
    description: "Reorganized link groups for better scannability",
    type: "modified",
    file: "components/footer.tsx",
    impact: "low",
  },
  {
    id: "5",
    component: "LoadingSpinner",
    description: "Replaced with skeleton loading for perceived performance",
    type: "modified",
    file: "components/loading.tsx",
    impact: "medium",
  },
];

const stages = [
  {
    id: "exploring",
    label: "Exploring Page",
    description: "Navigating through the application and discovering UI elements",
    icon: Search,
  },
  {
    id: "analyzing",
    label: "Analyzing Analytics",
    description: "Processing user behavior data and identifying improvement areas",
    icon: BarChart2,
  },
  {
    id: "creating",
    label: "Creating UI Changes",
    description: "Generating optimized component variations",
    icon: Paintbrush,
  },
];

export function EvolutionProgressSidebar({
  isRunning,
  totalIterations,
  onCreatePR,
  sessionId,
}: EvolutionProgressSidebarProps) {
  const [currentStage, setCurrentStage] = useState<EvolutionStage>("idle");
  const [stageProgress, setStageProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [changes, setChanges] = useState<UIChange[]>([]);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [startTime, setStartTime] = useState<Date | null>(null);

  // Listen to real session logs if sessionId is provided
  useEffect(() => {
    if (!sessionId) return;

    const streamUrl = typeof window !== 'undefined' 
      ? `${process.env.NEXT_PUBLIC_DARWIN_API_URL || 'http://localhost:3002'}/api/stream/${sessionId}`
      : `http://localhost:3002/api/stream/${sessionId}`;
    
    const eventSource = new EventSource(streamUrl);

    eventSource.addEventListener("status", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        const message = data.message || "";
        
        // Detect stages from log messages
        if (message.includes("Step 1: Running browser agent") || message.includes("Running browser agent")) {
          setCurrentStage("exploring");
          setCurrentIteration(1);
          setStageProgress(0);
          if (!startTime) setStartTime(new Date());
        } else if (message.includes("Step 2: Loading analytics") || message.includes("Loading analytics")) {
          setCurrentStage("analyzing");
          setStageProgress(0);
        } else if (message.includes("Step 3: Analyzing") || message.includes("Analyzing data")) {
          setCurrentStage("analyzing");
          setStageProgress(50);
        } else if (message.includes("Step 4: Evolving") || message.includes("Evolving codebase")) {
          setCurrentStage("creating");
          setStageProgress(0);
        } else if (message.includes("Evolution complete") || message.includes("Evolution pipeline completed")) {
          setCurrentStage("complete");
          setStageProgress(100);
          setChanges(mockChanges);
        }
        
        // Update progress based on status messages
        if (message.includes("completed") || message.includes("complete")) {
          setStageProgress(100);
        }
      } catch (err) {
        console.error("Failed to parse status event:", err);
      }
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [sessionId]);

  // Update elapsed time
  useEffect(() => {
    if (!isRunning || !startTime) {
      if (!isRunning && startTime) {
        // Calculate final elapsed time when stopped
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        setElapsedTime(elapsed);
      }
      return;
    }

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, startTime]);

  // Simulate evolution stages with iterations (fallback if no sessionId)
  useEffect(() => {
    if (sessionId) return; // Use real logs if sessionId provided
    if (!isRunning) {
      return;
    }

    setCurrentStage("exploring");
    setStageProgress(0);
    setElapsedTime(0);
    setChanges([]);
    setCurrentIteration(1);
    setStartTime(new Date());

    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Stage progression simulation for each iteration
    const stageTimings = [
      { stage: "exploring" as const, duration: 2000 },
      { stage: "analyzing" as const, duration: 2500 },
      { stage: "creating" as const, duration: 3000 },
    ];

    const iterationDuration = stageTimings.reduce((sum, s) => sum + s.duration, 0);
    
    // Run through all iterations
    for (let iteration = 0; iteration < totalIterations; iteration++) {
      const iterationOffset = iteration * iterationDuration;
      
      // Update iteration counter
      setTimeout(() => {
        setCurrentIteration(iteration + 1);
      }, iterationOffset);

      let stageOffset = 0;
      stageTimings.forEach(({ stage, duration }) => {
        setTimeout(() => {
          setCurrentStage(stage);
          setStageProgress(0);
        }, iterationOffset + stageOffset);

        // Progress within stage
        const progressInterval = duration / 100;
        for (let i = 1; i <= 100; i++) {
          setTimeout(() => {
            setStageProgress(i);
          }, iterationOffset + stageOffset + progressInterval * i);
        }

        stageOffset += duration;
      });
    }

    // Complete after all iterations
    const totalDuration = iterationDuration * totalIterations;
    setTimeout(() => {
      setCurrentStage("complete");
      setChanges(mockChanges);
      clearInterval(timer);
    }, totalDuration);

    return () => clearInterval(timer);
  }, [isRunning, totalIterations]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStageStatus = (stageId: string) => {
    const stageOrder = ["exploring", "analyzing", "creating"];
    const currentIndex = stageOrder.indexOf(currentStage);
    const stageIndex = stageOrder.indexOf(stageId);

    if (currentStage === "complete") return "complete";
    if (currentStage === "idle") return "pending";
    if (stageIndex < currentIndex) return "complete";
    if (stageIndex === currentIndex) return "active";
    return "pending";
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "medium":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "low":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "added":
        return <span className="text-emerald-400">+</span>;
      case "modified":
        return <span className="text-amber-400">~</span>;
      case "removed":
        return <span className="text-red-400">-</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-full flex-col border-l border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg",
              currentStage === "complete"
                ? "bg-emerald-500/20"
                : isRunning
                  ? "bg-blue-500/20"
                  : "bg-muted"
            )}
          >
            {currentStage === "complete" ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : isRunning ? (
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            ) : (
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="font-medium">Evolution Progress</h3>
            {isRunning && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(elapsedTime)}
                </div>
              </div>
            )}
          </div>
        </div>
        {(isRunning || currentStage === "complete") && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Iteration</span>
            <div className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5">
              <span className="text-sm font-semibold">{currentStage === "complete" ? totalIterations : currentIteration}</span>
              <span className="text-xs text-muted-foreground">/ {totalIterations}</span>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-6">
          {/* Progress Stages - Only show when running or complete */}
          {(isRunning || currentStage === "complete") && (
            <div className="flex flex-col gap-6">
              {/* Stages */}
              <div className="flex flex-col gap-4">
                {stages.map((stage, index) => {
                  const status = getStageStatus(stage.id);
                  const StageIcon = stage.icon;

                  return (
                    <div key={stage.id} className="relative">
                      {/* Connector line */}
                      {index < stages.length - 1 && (
                        <div
                          className={cn(
                            "absolute left-4 top-10 h-8 w-px",
                            status === "complete" ? "bg-emerald-500" : "bg-border"
                          )}
                        />
                      )}

                      <div className="flex gap-4">
                        {/* Stage Icon */}
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                            status === "complete"
                              ? "border-emerald-500 bg-emerald-500/20"
                              : status === "active"
                                ? "border-blue-500 bg-blue-500/20"
                                : "border-border bg-muted"
                          )}
                        >
                          {status === "complete" ? (
                            <Check className="h-4 w-4 text-emerald-400" />
                          ) : status === "active" ? (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                          ) : (
                            <StageIcon className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        {/* Stage Content */}
                        <div className="flex-1 pb-2">
                          <div className="flex items-center justify-between">
                            <span
                              className={cn(
                                "font-medium text-sm",
                                status === "pending" && "text-muted-foreground"
                              )}
                            >
                              {stage.label}
                            </span>
                            {status === "active" && (
                              <span className="text-xs text-muted-foreground font-mono">
                                {stageProgress}%
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {stage.description}
                          </p>

                          {/* Progress bar for active stage */}
                          {status === "active" && (
                            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                style={{ width: `${stageProgress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Iteration Progress */}
              {isRunning && currentStage !== "complete" && (
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground">Iteration Progress</span>
                    <span className="font-mono font-medium">
                      {currentIteration} / {totalIterations}
                    </span>
                  </div>
                  
                  {/* Iteration dots/steps */}
                  <div className="flex items-center gap-1.5 mb-4">
                    {Array.from({ length: totalIterations }).map((_, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "h-2 flex-1 rounded-full transition-all duration-300",
                          idx < currentIteration - 1
                            ? "bg-emerald-500"
                            : idx === currentIteration - 1
                              ? "bg-blue-500"
                              : "bg-muted"
                        )}
                      />
                    ))}
                  </div>

                  {/* Current stage progress */}
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-muted-foreground capitalize">
                      {currentStage} stage
                    </span>
                    <span className="font-mono">
                      {stageProgress}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${stageProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Completed State - Show Changes */}
              {currentStage === "complete" && changes.length > 0 && (
                <div className="flex flex-col gap-4 mt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Generated Changes</h4>
                    <span className="text-xs text-muted-foreground">
                      {changes.length} modifications
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {changes.map((change) => (
                      <div
                        key={change.id}
                        className="rounded-lg border border-border bg-background/50 p-3 transition-colors hover:bg-muted/50"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">
                              {getTypeIcon(change.type)}
                            </span>
                            <span className="font-medium text-sm">
                              {change.component}
                            </span>
                          </div>
                          <span
                            className={cn(
                              "rounded-full border px-2 py-0.5 text-xs font-medium",
                              getImpactColor(change.impact)
                            )}
                          >
                            {change.impact}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {change.description}
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <FileCode className="h-3 w-3" />
                          <span className="font-mono">{change.file}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                      <div className="text-lg font-semibold text-emerald-400">
                        {changes.filter((c) => c.type === "added").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Added</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                      <div className="text-lg font-semibold text-amber-400">
                        {changes.filter((c) => c.type === "modified").length}
                      </div>
                      <div className="text-xs text-muted-foreground">Modified</div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-center">
                      <div className="text-lg font-semibold text-blue-400">
                        {changes.filter((c) => c.impact === "high").length}
                      </div>
                      <div className="text-xs text-muted-foreground">High Impact</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </ScrollArea>

      {/* Footer with PR Button */}
      {currentStage === "complete" && (
        <div className="border-t border-border p-4">
          <Button className="w-full gap-2" size="lg" onClick={onCreatePR}>
            <GitPullRequest className="h-4 w-4" />
            Create GitHub PR
            <ArrowRight className="h-4 w-4 ml-auto" />
          </Button>
          <p className="text-xs text-muted-foreground text-center mt-2">
            This will create a pull request with all UI changes
          </p>
        </div>
      )}
    </div>
  );
}
