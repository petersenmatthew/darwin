import type { TaskConfig } from "@/components/dashboard/create-task-dialog";

export interface SavedTask extends TaskConfig {
  id: string;
  createdAt: string;
}

const STORAGE_KEY = "savedTasks";

export function saveTask(task: TaskConfig): SavedTask {
  const savedTask: SavedTask = {
    ...task,
    id: `task-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  
  const savedTasks = getSavedTasks();
  savedTasks.push(savedTask);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTasks));
  
  return savedTask;
}

export function getSavedTasks(): SavedTask[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored);
  } catch (error) {
    console.error("Failed to load saved tasks:", error);
    return [];
  }
}

export function deleteTask(taskId: string): void {
  const tasks = getSavedTasks();
  const filtered = tasks.filter((t) => t.id !== taskId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function updateTask(taskId: string, updates: Partial<TaskConfig>): SavedTask | null {
  const tasks = getSavedTasks();
  const index = tasks.findIndex((t) => t.id === taskId);
  
  if (index === -1) return null;
  
  const updated = { ...tasks[index], ...updates };
  tasks[index] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  
  return updated;
}
