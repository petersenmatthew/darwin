"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Zap, History } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import { StatusBadge } from "./status-badge";
import { CreateTaskDialog } from "./create-task-dialog";
import { toast } from "sonner";
import { saveTask } from "@/lib/task-storage";

export function QuickActions() {
  const [recentSessions, setRecentSessions] = useState<any[]>([]);
  const [showCreateTask, setShowCreateTask] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await apiClient.getAllSessions();
        setRecentSessions(data.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      }
    };

    fetchSessions();
    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button
              className="w-full justify-start gap-2"
              asChild
            >
              <Link href="/evolve">
                <Zap className="h-4 w-4" />
                Run Evolution Pipeline
              </Link>
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start gap-2"
              onClick={() => setShowCreateTask(true)}
            >
              <Plus className="h-4 w-4" />
              Create New Task
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentSessions.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No recent sessions
                </div>
              ) : (
                recentSessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/sessions/${session.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-medium truncate">
                      {session.agentName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {session.task}
                    </span>
                  </div>
                  <StatusBadge status={session.status} />
                </Link>
                ))
              )}
            </div>
            <div className="p-3 border-t border-border">
              <Button variant="ghost" size="sm" className="w-full" asChild>
                <Link href="/sessions">View All Sessions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        onTaskCreated={(task) => {
          try {
            saveTask(task);
            toast.success("Task saved", {
              description: `"${task.name}" has been saved successfully.`,
            });
          } catch (error) {
            console.error("Failed to save task:", error);
            toast.error("Failed to save task");
          }
          setShowCreateTask(false);
        }}
      />
    </>
  );
}
