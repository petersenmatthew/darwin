"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList } from "lucide-react";

interface CreateTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated?: (task: TaskConfig) => void;
  initialTask?: TaskConfig;
}

export interface TaskConfig {
  name: string;
  description: string;
}

const defaultConfig: TaskConfig = {
  name: "",
  description: "",
};

export function CreateTaskDialog({
  open,
  onOpenChange,
  onTaskCreated,
  initialTask,
}: CreateTaskDialogProps) {
  const [config, setConfig] = useState<TaskConfig>(initialTask || defaultConfig);

  // Update config when initialTask changes
  useEffect(() => {
    if (initialTask) {
      setConfig(initialTask);
    } else {
      setConfig(defaultConfig);
    }
  }, [initialTask, open]);

  const handleCreate = () => {
    onTaskCreated?.(config);
    if (!initialTask) {
      setConfig(defaultConfig);
    }
    onOpenChange(false);
  };

  // Reset when dialog closes
  useEffect(() => {
    if (!open) {
      if (!initialTask) {
        setConfig(defaultConfig);
      }
    }
  }, [open, initialTask]);

  const updateConfig = <K extends keyof TaskConfig>(
    key: K,
    value: TaskConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {initialTask ? "Edit Task" : "Create New Task"}
          </DialogTitle>
          <DialogDescription>
            {initialTask
              ? "Update the task details."
              : "Define a task for your browser agents to execute."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-name">Task Name</Label>
              <Input
                id="task-name"
                placeholder="e.g., Extract Product Prices"
                value={config.name}
                onChange={(e) => updateConfig("name", e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="task-desc">Description</Label>
              <Textarea
                id="task-desc"
                placeholder="Describe the task objective..."
                value={config.description}
                onChange={(e) => updateConfig("description", e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-transparent"
          >
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!config.name}>
            {initialTask ? "Save Changes" : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
