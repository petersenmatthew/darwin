"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogViewer } from "./LogViewer";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

interface AgentExecutionProps {
  sessionId: string;
  onCancel?: () => void;
}

interface LogEntry {
  type: "think" | "action" | "status" | "error" | "result" | "log";
  timestamp: string;
  message: string;
  data?: any;
}

export function AgentExecution({ sessionId, onCancel }: AgentExecutionProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<string>("initializing");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!sessionId) return;

    // Fetch initial session status
    apiClient.getSessionStatus(sessionId)
      .then((session) => {
        setStatus(session.status);
        if (session.result) {
          setResult(session.result);
        }
        if (session.error) {
          setError(session.error);
        }
      })
      .catch((err) => {
        console.error("Failed to get session status:", err);
      });

    // Connect to Server-Sent Events stream
    const streamUrl = apiClient.getStreamUrl(sessionId);
    console.log("Connecting to SSE stream:", streamUrl);
    const eventSource = new EventSource(streamUrl);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log("SSE connection opened");
      setLogs((prev) => [
        ...prev,
        {
          type: "status",
          timestamp: new Date().toISOString(),
          message: "Connected to log stream",
        },
      ]);
    };

    eventSource.addEventListener("status", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        console.log("Received status event:", data);
        setStatus(data.status || "running");
        // Also add as log entry if message is present
        if (data.message) {
          setLogs((prev) => [
            ...prev,
            {
              type: "status",
              timestamp: new Date().toISOString(),
              message: data.message || `Status: ${data.status}`,
              data: data,
            },
          ]);
        }
      } catch (err) {
        console.error("Failed to parse status event:", err);
      }
    });

    eventSource.addEventListener("think", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setLogs((prev) => [
          ...prev,
          {
            type: "think",
            timestamp: data.timestamp || new Date().toISOString(),
            message: data.message || "",
            data: data.data,
          },
        ]);
      } catch (err) {
        console.error("Failed to parse think event:", err);
      }
    });

    eventSource.addEventListener("action", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setLogs((prev) => [
          ...prev,
          {
            type: "action",
            timestamp: data.timestamp || new Date().toISOString(),
            message: data.message || "",
            data: data.data,
          },
        ]);
      } catch (err) {
        console.error("Failed to parse action event:", err);
      }
    });


    eventSource.addEventListener("error", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setError(data.message || "An error occurred");
        setLogs((prev) => [
          ...prev,
          {
            type: "error",
            timestamp: data.timestamp || new Date().toISOString(),
            message: data.message || "",
            data: data.data,
          },
        ]);
      } catch (err) {
        // If parsing fails, it might be a connection error
        if (event.data === undefined || event.data === "") {
          console.error("SSE connection error");
        } else {
          console.error("Failed to parse error event:", err);
        }
      }
    });

    eventSource.addEventListener("log", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setLogs((prev) => [
          ...prev,
          {
            type: "log",
            timestamp: data.timestamp || new Date().toISOString(),
            message: data.message || "",
            data: data.data,
          },
        ]);
      } catch (err) {
        console.error("Failed to parse log event:", err);
      }
    });

    eventSource.addEventListener("result", (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        setResult(data);
        setStatus("completed");
        // Don't add result logs - they will be replaced with a friendly message in LogViewer
        // Close the connection after receiving result
        setTimeout(() => {
          eventSource.close();
        }, 1000);
      } catch (err) {
        console.error("Failed to parse result event:", err);
      }
    });

    eventSource.onerror = (err) => {
      console.error("EventSource error:", err);
      console.error("EventSource readyState:", eventSource.readyState);
      // EventSource.CONNECTING = 0, EventSource.OPEN = 1, EventSource.CLOSED = 2
      if (eventSource.readyState === EventSource.CLOSED) {
        setError("Connection to log stream closed. Check if the Express API server is running.");
        setLogs((prev) => [
          ...prev,
          {
            type: "error",
            timestamp: new Date().toISOString(),
            message: "Connection to log stream closed",
          },
        ]);
      }
    };

    // Cleanup on unmount
    return () => {
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [sessionId]);

  const handleCancel = async () => {
    setStatus("cancelled");
    setLogs((prev) => [
      ...prev,
      {
        type: "status",
        timestamp: new Date().toISOString(),
        message: "Agent cancelled by user",
        data: { status: "cancelled" },
      },
    ]);
    if (onCancel) onCancel();
  };

  const getStatusColor = () => {
    switch (status) {
      case "initializing":
        return "text-yellow-500 dark:text-yellow-400";
      case "running":
        return "text-primary";
      case "completed":
        return "text-green-500 dark:text-green-400";
      case "error":
        return "text-destructive";
      case "cancelled":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-3 h-full flex flex-col">
      <Card className="flex-shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Agent Execution</CardTitle>
              <CardDescription className="text-xs">
                Session ID: <code className="text-xs">{sessionId}</code>
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className={cn("font-semibold", getStatusColor())}>
                {status.toUpperCase()}
              </div>
              {(status === "running" || status === "initializing") && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {result && (
          <CardContent>
            <div className="space-y-2">
              <div className="font-semibold">Result:</div>
              <div className={result.success ? "text-green-500 dark:text-green-400" : "text-destructive"}>
                {result.success ? "Success" : "Failed"}
              </div>
              {result.message && (
                <div className="text-sm text-muted-foreground">{result.message}</div>
              )}
            </div>
          </CardContent>
        )}
        {error && (
          <CardContent>
            <div className="text-destructive">Error: {error}</div>
          </CardContent>
        )}
      </Card>

      <div className="flex-1 min-h-0">
        <LogViewer logs={logs} className="h-full" />
      </div>
    </div>
  );
}
