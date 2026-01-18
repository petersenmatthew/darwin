"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity, RefreshCw, Bot, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

type FilterType = "all" | "running" | "completed" | "error";

const filterOptions: { value: FilterType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "running", label: "Running" },
  { value: "completed", label: "Completed" },
  { value: "error", label: "Errors" },
];

interface ActivityItem {
  id: string;
  agentName: string;
  task: string;
  status: "running" | "completed" | "error";
  timestamp: string;
}

function getStatusIcon(status: ActivityItem["status"]) {
  switch (status) {
    case "running":
      return <Loader2 className="h-4 w-4 text-chart-1 animate-spin" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-success" />;
    case "error":
      return <XCircle className="h-4 w-4 text-destructive" />;
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed() {
  const [filter, setFilter] = useState<FilterType>("all");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const eventSourcesRef = useRef<Map<string, EventSource>>(new Map());

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessions = await apiClient.getAllSessions();
        
        // Create activity items from sessions
        const newActivities: ActivityItem[] = sessions.map((session) => ({
          id: session.id,
          agentName: session.agentName || session.task?.substring(0, 30) || "Unknown",
          task: session.task || "No task",
          status: session.status === "running" || session.status === "initializing" 
            ? "running" 
            : session.status === "error" 
            ? "error" 
            : "completed",
          timestamp: session.startedAt || session.createdAt,
        }));

        setActivities(newActivities);

        // Set up SSE for active sessions
        sessions
          .filter((s) => s.status === "running" || s.status === "initializing")
          .forEach((session) => {
            if (!eventSourcesRef.current.has(session.id)) {
              const eventSource = new EventSource(apiClient.getStreamUrl(session.id));
              eventSourcesRef.current.set(session.id, eventSource);

              eventSource.addEventListener("status", () => {
                fetchSessions(); // Refresh on status change
              });

              eventSource.addEventListener("result", () => {
                fetchSessions();
                eventSource.close();
                eventSourcesRef.current.delete(session.id);
              });

              eventSource.addEventListener("error", () => {
                fetchSessions();
                eventSource.close();
                eventSourcesRef.current.delete(session.id);
              });
            }
          });
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      }
    };

    fetchSessions();
    
    if (autoRefresh) {
      const interval = setInterval(fetchSessions, 3000);
      return () => {
        clearInterval(interval);
        // Clean up event sources
        eventSourcesRef.current.forEach((es) => es.close());
        eventSourcesRef.current.clear();
      };
    } else {
      return () => {
        eventSourcesRef.current.forEach((es) => es.close());
        eventSourcesRef.current.clear();
      };
    }
  }, [autoRefresh]);

  const filteredActivities =
    filter === "all"
      ? activities
      : activities.filter((a) => a.status === filter);

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Live Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="auto-refresh"
              className="text-xs text-muted-foreground"
            >
              Auto
            </Label>
            <Switch
              id="auto-refresh"
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              className="scale-75"
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={() => {
                const fetchSessions = async () => {
                  try {
                    const sessions = await apiClient.getAllSessions();
                    const newActivities: ActivityItem[] = sessions.map((session) => ({
                      id: session.id,
                      agentName: session.agentName || session.task?.substring(0, 30) || "Unknown",
                      task: session.task || "No task",
                      status: session.status === "running" || session.status === "initializing" 
                        ? "running" 
                        : session.status === "error" 
                        ? "error" 
                        : "completed",
                      timestamp: session.startedAt || session.createdAt,
                    }));
                    setActivities(newActivities);
                  } catch (error) {
                    console.error("Failed to refresh:", error);
                  }
                };
                fetchSessions();
              }}
            >
              <RefreshCw
                className={cn("h-3.5 w-3.5", autoRefresh && "animate-spin")}
                style={{ animationDuration: "3s" }}
              />
            </Button>
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          {filterOptions.map((option) => (
            <Badge
              key={option.value}
              variant={filter === option.value ? "default" : "outline"}
              className={cn(
                "cursor-pointer text-xs",
                filter === option.value
                  ? "bg-foreground text-background hover:bg-foreground/90"
                  : "hover:bg-muted"
              )}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto p-0">
        <div className="divide-y divide-border">
          {filteredActivities.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No activities match the current filter
            </div>
          ) : (
            filteredActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="mt-0.5">{getStatusIcon(activity.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Bot className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium truncate">
                      {activity.agentName}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-0.5">
                    {activity.task}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
