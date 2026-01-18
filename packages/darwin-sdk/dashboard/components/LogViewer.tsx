"use client";

import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LogEntry {
  type: "think" | "action" | "status" | "error" | "result" | "log";
  timestamp: string;
  message: string;
  data?: any;
}

interface LogViewerProps {
  logs: LogEntry[];
  className?: string;
}

export function LogViewer({ logs, className }: LogViewerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "think":
        return "text-blue-500 dark:text-blue-400";
      case "action":
        return "text-green-500 dark:text-green-400";
      case "status":
        return "text-yellow-500 dark:text-yellow-400";
      case "error":
        return "text-destructive";
      case "result":
        return "text-purple-500 dark:text-purple-400";
      case "log":
        return "text-muted-foreground";
      default:
        return "text-foreground";
    }
  };

  const formatLogMessage = (entry: LogEntry) => {
    // Use message field if available, otherwise fall back to data
    if (entry.message) {
      return entry.message;
    }
    
    // Fallback for old format
    switch (entry.type) {
      case "think":
        return entry.data?.thought || entry.data?.text || JSON.stringify(entry.data);
      case "action":
        return `Action: ${entry.data?.toolName || entry.data?.action || JSON.stringify(entry.data)}`;
      case "status":
        return `Status: ${entry.data?.status || JSON.stringify(entry.data)}`;
      case "error":
        return `Error: ${entry.data?.message || JSON.stringify(entry.data)}`;
      case "result":
        return `Result: ${entry.data?.message || JSON.stringify(entry.data)}`;
      default:
        return JSON.stringify(entry.data);
    }
  };

  return (
    <Card className={cn("h-full flex flex-col", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Agent Logs</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 min-h-0 p-3">
        <div
          ref={scrollRef}
          className="h-full overflow-y-auto bg-muted rounded-md p-3 font-mono text-xs"
        >
          {logs.length === 0 ? (
            <div className="text-muted-foreground">No logs yet...</div>
          ) : (
            logs.map((entry, index) => (
              <div
                key={index}
                className={cn("mb-1", getLogColor(entry.type))}
              >
                <span className="text-muted-foreground text-[10px]">
                  [{new Date(entry.timestamp).toLocaleTimeString()}]
                </span>{" "}
                <span className="text-xs">{formatLogMessage(entry)}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
