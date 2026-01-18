"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Zap } from "lucide-react";
import Link from "next/link";
import { CreateTaskDialog } from "./create-task-dialog";
import { toast } from "sonner";
import { saveTask } from "@/lib/task-storage";

export function QuickActions() {
  const [showCreateTask, setShowCreateTask] = useState(false);

  return (
    <>
      <Card className="border-2 border-primary/20 bg-primary/5 shadow-lg h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 flex-1">
          <Button
            className="w-full justify-start gap-2 h-12 text-base"
            asChild
          >
            <Link href="/evolve">
              <Zap className="h-5 w-5" />
              Run Evolution Pipeline
            </Link>
          </Button>
          <Button
            variant="secondary"
            className="w-full justify-start gap-2 h-12 text-base"
            onClick={() => setShowCreateTask(true)}
          >
            <Plus className="h-5 w-5" />
            Create New Task
          </Button>
        </CardContent>
      </Card>

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
