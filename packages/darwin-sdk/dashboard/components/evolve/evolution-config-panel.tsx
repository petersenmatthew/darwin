"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ClipboardList,
  Globe,
  Settings2,
  Play,
  Plus,
} from "lucide-react";
import {
  CreateTaskDialog,
  type TaskConfig,
} from "@/components/dashboard/create-task-dialog";
import { getSavedTasks, saveTask, type SavedTask } from "@/lib/task-storage";
import { toast } from "sonner";

export interface EvolutionConfig {
  taskId: string | "new";
  taskConfig?: TaskConfig;
  port: number;
  maxSteps: number;
  evolutionIterations: number;
}

interface EvolutionConfigPanelProps {
  onStartEvolution: (config: EvolutionConfig) => void;
  isRunning: boolean;
}

export function EvolutionConfigPanel({
  onStartEvolution,
  isRunning,
}: EvolutionConfigPanelProps) {
  const [savedTasks, setSavedTasks] = useState<SavedTask[]>([]);
  const [config, setConfig] = useState<EvolutionConfig>({
    taskId: "",
    port: 3000,
    maxSteps: 40,
    evolutionIterations: 1,
  });

  const [showCreateTask, setShowCreateTask] = useState(false);

  // Load saved tasks on mount
  useEffect(() => {
    const tasks = getSavedTasks();
    setSavedTasks(tasks);
    
    // Set default task if available and no task is selected
    if (tasks.length > 0) {
      setConfig((prev) => {
        if (!prev.taskId || prev.taskId === "new") {
          return { ...prev, taskId: tasks[0].id };
        }
        return prev;
      });
    }
  }, []);

  // Listen for storage changes (when tasks are saved from other tabs/components)
  useEffect(() => {
    const handleStorageChange = () => {
      const tasks = getSavedTasks();
      setSavedTasks(tasks);
    };

    window.addEventListener("storage", handleStorageChange);
    // Also check periodically for changes within the same tab
    const interval = setInterval(handleStorageChange, 1000);
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleStartEvolution = () => {
    // Find the selected saved task
    const selectedTask = savedTasks.find((t) => t.id === config.taskId);
    const taskConfig: TaskConfig | undefined = selectedTask
      ? {
          name: selectedTask.name,
          description: selectedTask.description,
        }
      : undefined;
    
    const finalConfig: EvolutionConfig = {
      ...config,
      taskConfig,
    };
    onStartEvolution(finalConfig);
  };

  const handleTaskCreated = (task: TaskConfig) => {
    // Save the task
    const savedTask = saveTask(task);
    setSavedTasks((prev) => [...prev, savedTask]);
    
    // Set it as the selected task
    setConfig((prev) => ({ ...prev, taskId: savedTask.id }));
    setShowCreateTask(false);
    
    toast.success("Task saved", {
      description: `"${task.name}" has been saved and selected.`,
    });
  };

  return (
    <>
      <div className="flex flex-col gap-6 p-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-semibold">Evolution Pipeline</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure and run UI evolution experiments
          </p>
        </div>

        {/* Task Selection */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              Task Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            {savedTasks.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  No saved tasks yet
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Create a task from the dropdown to get started
                </p>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => setShowCreateTask(true)}
                >
                  <Plus className="h-4 w-4" />
                  Create New Task
                </Button>
              </div>
            ) : (
              <Select
              value={config.taskId !== "new" ? config.taskId : savedTasks[0]?.id || ""}
              onValueChange={(v) => {
                if (v === "create-new") {
                  setShowCreateTask(true);
                } else {
                  setConfig((prev) => ({ ...prev, taskId: v }));
                }
              }}
            >
              <SelectTrigger className="w-full h-12 py-2.5">
                <SelectValue placeholder="Select a task" />
              </SelectTrigger>
              <SelectContent>
                {savedTasks.map((task) => (
                  <SelectItem key={task.id} value={task.id}>
                    {task.name}
                  </SelectItem>
                ))}
                <SelectItem value="create-new" className="text-primary">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    <span className="font-medium">Create New</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            )}
          </CardContent>
        </Card>

        {/* Target URL */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Target URL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              <div className="flex items-center">
                <div className="flex h-10 items-center rounded-l-md border border-r-0 border-border bg-muted px-3">
                  <span className="text-sm text-muted-foreground font-mono">
                    http://localhost:
                  </span>
                </div>
                <Input
                  type="number"
                  value={config.port}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      port: parseInt(e.target.value) || 3000,
                    }))
                  }
                  className="w-24 rounded-l-none font-mono"
                  min={1}
                  max={65535}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter the port where your local development server is running.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Evolution Settings */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-muted-foreground" />
              Evolution Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            {/* Max Steps */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Maximum Steps</Label>
                <span className="rounded-md bg-muted px-2 py-0.5 text-sm font-mono">
                  {config.maxSteps}
                </span>
              </div>
              <Slider
                value={[config.maxSteps]}
                onValueChange={([v]) =>
                  setConfig((prev) => ({ ...prev, maxSteps: v }))
                }
                min={5}
                max={100}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Maximum actions the agent can take per evolution run.
              </p>
            </div>

            {/* Iterations */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Evolution Iterations</Label>
                <span className="rounded-md bg-muted px-2 py-0.5 text-sm font-mono">
                  {config.evolutionIterations}
                </span>
              </div>
              <Slider
                value={[config.evolutionIterations]}
                onValueChange={([v]) =>
                  setConfig((prev) => ({ ...prev, evolutionIterations: v }))
                }
                min={1}
                max={20}
                step={1}
              />
              <p className="text-xs text-muted-foreground">
                Number of evolution cycles to run for optimization.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="pt-0">
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-medium">Run Summary</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <span className="text-muted-foreground">Task</span>
                <span className="font-medium truncate">
                  {savedTasks.find((t) => t.id === config.taskId)?.name || "No task selected"}
                </span>
                <span className="text-muted-foreground">Target</span>
                <span className="font-mono text-xs">
                  localhost:{config.port}
                </span>
                <span className="text-muted-foreground">Max Steps</span>
                <span className="font-mono">{config.maxSteps}</span>
                <span className="text-muted-foreground">Iterations</span>
                <span className="font-mono">{config.evolutionIterations}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        <Button
          size="lg"
          className="w-full gap-2 h-12 text-base"
          onClick={handleStartEvolution}
          disabled={isRunning || !config.taskId || !savedTasks.find((t) => t.id === config.taskId)}
        >
          {isRunning ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Evolution Running...
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Start Evolution
            </>
          )}
        </Button>
      </div>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        onTaskCreated={handleTaskCreated}
      />
    </>
  );
}
