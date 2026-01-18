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

  // Filter out prompt logs and evolution-related logs
  // Note: result type logs are kept and shown separately as purple messages
  const filteredLogs = logs.filter((entry) => {
    // Keep result type logs - they'll be shown as purple messages
    if (entry.type === "result") {
      return false; // Filter out from main list, but show separately
    }
    // Filter out prompt logs
    if (entry.message && (entry.message.includes('📝 Prompt:') || entry.message.includes('Prompt:'))) {
      return false;
    }
    // Filter out evolution-related logs and JSON blocks, but keep Summary and Issue messages
    if (entry.message) {
      const msg = entry.message;
      if (
        msg.includes('🧬 Running evolution') ||
        msg.includes('📁 Target:') ||
        msg.includes('✅ Done!') ||
        msg.includes('✓ Evolution complete') ||
        msg.includes('Evolution complete!') ||
        msg.includes('Evolution pipeline started') ||
        msg.includes('✓ Parsed') ||
        (msg.includes('Parsed') && msg.includes('changes from output')) ||
        msg.includes('Step 4: Evolving') ||
        msg.includes('YOLO mode is enabled') ||
        msg.trim() === '---' ||
        msg.includes('```json') ||
        (msg.includes('```') && msg.includes('changes')) ||
        // Filter out JSON-like content (long explanations with quotes and colons)
        (msg.includes('"type":') && (msg.includes('"modified"') || msg.includes('"added"') || msg.includes('"removed"'))) ||
        (msg.includes('"file":') && msg.includes('"explanation":')) ||
        // Filter out cut-off JSON fragments
        (msg.includes('field to include') && msg.includes('border')) ||
        (msg.includes('This change directly addresses') && msg.includes('analytics'))
      ) {
        // Always allow Summary: and Issue [ messages through
        if (!msg.includes('Summary:') && !msg.includes('Issue [')) {
          return false;
        }
      }
    }
    return true;
  });

  // Check if there were any result logs to show a summary message
  // Only show once at the end if result logs were filtered out
  const hasResultLogs = logs.some((entry) => entry.type === "result");
  const resultLogEntry = hasResultLogs 
    ? logs.find((entry) => entry.type === "result")
    : null;

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
          {filteredLogs.length === 0 && !hasResultLogs ? (
            <div className="text-muted-foreground">No logs yet...</div>
          ) : (
            <>
              {filteredLogs.map((entry, index) => (
                <div
                  key={index}
                  className={cn("mb-1", getLogColor(entry.type))}
                >
                  <span className="text-muted-foreground text-[10px]">
                    [{new Date(entry.timestamp).toLocaleTimeString()}]
                  </span>{" "}
                  <span className="text-xs">{formatLogMessage(entry)}</span>
                </div>
              ))}
              {hasResultLogs && resultLogEntry && (
                <div className="mb-1 text-purple-500 dark:text-purple-400">
                  <span className="text-muted-foreground text-[10px]">
                    [{new Date(resultLogEntry.timestamp).toLocaleTimeString()}]
                  </span>{" "}
                  <span className="text-xs font-medium">{resultLogEntry.message || "Code changes have been generated"}</span>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
