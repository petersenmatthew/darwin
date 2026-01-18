"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { type Task } from "@/lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Search,
  MoreHorizontal,
  Play,
  Pause,
  Pencil,
  Trash2,
  ExternalLink,
  Database,
  FileText,
  Navigation,
  Eye,
  Code,
} from "lucide-react";
import { CreateTaskDialog } from "@/components/dashboard/create-task-dialog";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { getSavedTasks, deleteTask, updateTask, saveTask, type SavedTask } from "@/lib/task-storage";
import { toast } from "sonner";

const typeIcons = {
  scrape: Database,
  form: FileText,
  navigate: Navigation,
  monitor: Eye,
  custom: Code,
};

const typeLabels = {
  scrape: "Scraping",
  form: "Form",
  navigate: "Navigation",
  monitor: "Monitor",
  custom: "Custom",
};

function TaskStatusBadge({ status }: { status: Task["status"] }) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "font-medium",
        status === "active" && "text-primary",
        status === "paused" && "text-primary",
        status === "draft" && "bg-muted text-muted-foreground"
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function TaskTypeBadge({ type }: { type: Task["type"] }) {
  const Icon = typeIcons[type];
  return (
    <Badge variant="outline" className="gap-1 font-normal">
      <Icon className="h-3 w-3" />
      {typeLabels[type]}
    </Badge>
  );
}

const Loading = () => null;

// Convert SavedTask to Task format for display
function savedTaskToTask(savedTask: SavedTask): Task {
  return {
    id: savedTask.id,
    name: savedTask.name,
    description: savedTask.description,
    type: "custom" as Task["type"], // Default to custom since we removed type from TaskConfig
    targetUrl: "", // Not stored anymore
    status: "draft" as Task["status"], // Default to draft for new tasks
    lastRun: null,
    successRate: 0,
    totalRuns: 0,
    createdAt: savedTask.createdAt,
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | Task["status"]>("all");

  // Load tasks from localStorage
  useEffect(() => {
    const loadTasks = () => {
      const savedTasks = getSavedTasks();
      const convertedTasks = savedTasks.map(savedTaskToTask);
      setTasks(convertedTasks);
    };
    
    loadTasks();
    
    // Listen for storage changes
    const handleStorageChange = () => {
      loadTasks();
    };
    
    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(loadTasks, 1000); // Check every second for same-tab updates
    
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: tasks.length,
    active: tasks.filter((t) => t.status === "active").length,
    paused: tasks.filter((t) => t.status === "paused").length,
    draft: tasks.filter((t) => t.status === "draft").length,
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Task deleted");
    }
  };

  const handleToggleStatus = (task: Task) => {
    const newStatus = task.status === "active" ? "paused" : "active";
    // Note: We're not storing status in SavedTask, so this is just for display
    // In a real app, you'd want to add status to the saved task structure
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t))
    );
    toast.success(`Task ${newStatus === "active" ? "activated" : "paused"}`);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
              <p className="text-sm text-muted-foreground">
                Manage and monitor your automation tasks
              </p>
            </div>
            <Button onClick={() => setShowCreateTask(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Task
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Total Tasks</div>
                <div className="text-2xl font-semibold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Active</div>
                <div className="text-2xl font-semibold">
                  {stats.active}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Paused</div>
                <div className="text-2xl font-semibold">
                  {stats.paused}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm text-muted-foreground">Drafts</div>
                <div className="text-2xl font-semibold text-muted-foreground">
                  {stats.draft}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters and Search */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  {(["all", "active", "paused", "draft"] as const).map((status) => (
                    <Button
                      key={status}
                      variant={filterStatus === status ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setFilterStatus(status)}
                      className="capitalize"
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Suspense fallback={<Loading />}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Task</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Success Rate</TableHead>
                      <TableHead className="text-right">Runs</TableHead>
                      <TableHead>Last Run</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTasks.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No tasks found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{task.name}</span>
                              <span className="text-xs text-muted-foreground line-clamp-1">
                                {task.description}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <TaskTypeBadge type={task.type} />
                          </TableCell>
                          <TableCell>
                            <TaskStatusBadge status={task.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            {task.totalRuns > 0 ? (
                              <span
                                className={cn(
                                  "font-mono"
                                )}
                              >
                                {task.successRate}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {task.totalRuns}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {task.lastRun || "Never"}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleToggleStatus(task)}>
                                  {task.status === "active" ? (
                                    <>
                                      <Pause className="mr-2 h-4 w-4" />
                                      Pause
                                    </>
                                  ) : (
                                    <>
                                      <Play className="mr-2 h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setEditingTask(task);
                                    setShowCreateTask(true);
                                  }}
                                >
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDeleteTask(task.id)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </main>

      <CreateTaskDialog
        open={showCreateTask}
        onOpenChange={(open) => {
          setShowCreateTask(open);
          if (!open) setEditingTask(null);
        }}
        initialTask={editingTask ? { name: editingTask.name, description: editingTask.description } : undefined}
        onTaskCreated={(task) => {
          if (editingTask) {
            // Update existing task
            const updated = updateTask(editingTask.id, task);
            if (updated) {
              setTasks((prev) =>
                prev.map((t) =>
                  t.id === editingTask.id ? savedTaskToTask(updated) : t
                )
              );
              toast.success("Task updated");
            }
          } else {
            // New task - save it
            saveTask(task);
            // Reload tasks
            const savedTasks = getSavedTasks();
            setTasks(savedTasks.map(savedTaskToTask));
            toast.success("Task created");
          }
          setShowCreateTask(false);
          setEditingTask(null);
        }}
      />
    </div>
  );
}
