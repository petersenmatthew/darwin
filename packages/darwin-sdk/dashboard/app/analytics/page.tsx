"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingDown, TrendingUp, Clock, MousePointerClick, Eye, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getSavedTasks } from "@/lib/task-storage";

interface TaskMetrics {
  taskId: string;
  taskName: string;
  runIndex: number;
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  pageViews: number;
  clicks: number;
  pageClicks: number;
  buttonClicks: number;
  scrollEvents: number;
  formInteractions: number;
  timeToFirstPage?: number;
  pagesVisited: string[];
}

interface TaskAnalytics {
  taskName: string;
  taskId: string;
  totalRuns: number;
  runs: TaskMetrics[];
  averageDuration?: number;
  averagePageViews?: number;
  averageClicks?: number;
  averageTimeToFirstPage?: number;
  improvementTrend?: {
    duration: number[];
    pageViews: number[];
    clicks: number[];
    timeToFirstPage: number[];
  };
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<TaskAnalytics[]>([]);
  const [selectedTask, setSelectedTask] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [taskTitleMap, setTaskTitleMap] = useState<Record<string, string>>({});

  // Load saved tasks to create a mapping from description to title
  useEffect(() => {
    const savedTasks = getSavedTasks();
    const mapping: Record<string, string> = {};
    savedTasks.forEach(task => {
      // Map description to title (name)
      mapping[task.description] = task.name;
    });
    setTaskTitleMap(mapping);
  }, []);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data.tasks || []);
        if (data.tasks && data.tasks.length > 0 && !selectedTask) {
          setSelectedTask(data.tasks[0].taskName);
        }
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    // Refresh every 10 seconds
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, [selectedTask]);

  const selectedTaskData = analytics.find(t => t.taskName === selectedTask);
  const getTaskTitle = (taskName: string) => {
    return taskTitleMap[taskName] || taskName;
  };

  // Format data for charts
  const durationData = selectedTaskData?.runs.map(run => ({
    run: `Run ${run.runIndex}`,
    duration: run.duration ? Math.round(run.duration / 1000) : 0, // Convert to seconds
    label: `Run ${run.runIndex}`,
  })) || [];

  const pageViewsData = selectedTaskData?.runs.map(run => ({
    run: `Run ${run.runIndex}`,
    pageViews: run.pageViews,
    label: `Run ${run.runIndex}`,
  })) || [];

  const pageClicksData = selectedTaskData?.runs.map(run => ({
    run: `Run ${run.runIndex}`,
    pageClicks: run.pageClicks || 0,
    label: `Run ${run.runIndex}`,
  })) || [];

  const buttonClicksData = selectedTaskData?.runs.map(run => ({
    run: `Run ${run.runIndex}`,
    buttonClicks: run.buttonClicks || 0,
    label: `Run ${run.runIndex}`,
  })) || [];

  const scrollEventsData = selectedTaskData?.runs.map(run => ({
    run: `Run ${run.runIndex}`,
    scrollEvents: run.scrollEvents || 0,
    label: `Run ${run.runIndex}`,
  })) || [];

  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getTrend = (values: number[]) => {
    if (values.length < 2) return null;
    const recent = values.slice(-3);
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const first = values[0];
    if (first === 0) return null;
    const change = ((first - avg) / first) * 100;
    return change;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track task performance and improvement over time
          </p>
        </div>

        {analytics.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                No analytics data available yet. Run some tasks to see metrics.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Task Selector */}
            <div className="mb-6">
              <Select value={selectedTask} onValueChange={setSelectedTask}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue placeholder="Select a task" />
                </SelectTrigger>
                <SelectContent>
                  {analytics.map((task) => {
                    // Use title if available, otherwise fall back to taskName
                    const displayTitle = taskTitleMap[task.taskName] || task.taskName;
                    return (
                      <SelectItem key={task.taskName} value={task.taskName}>
                        {displayTitle} ({task.totalRuns} {task.totalRuns === 1 ? 'run' : 'runs'})
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedTaskData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedTaskData.totalRuns}</div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatDuration(selectedTaskData.averageDuration)}
                      </div>
                      {selectedTaskData.improvementTrend?.duration && 
                       selectedTaskData.improvementTrend.duration.length > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          {getTrend(selectedTaskData.improvementTrend.duration) !== null &&
                           getTrend(selectedTaskData.improvementTrend.duration)! > 0 ? (
                            <>
                              <TrendingDown className="h-3 w-3 text-success" />
                              <span className="text-xs text-success">
                                {Math.abs(getTrend(selectedTaskData.improvementTrend.duration)!).toFixed(1)}% faster
                              </span>
                            </>
                          ) : (
                            <>
                              <TrendingUp className="h-3 w-3 text-destructive" />
                              <span className="text-xs text-destructive">
                                {getTrend(selectedTaskData.improvementTrend.duration) !== null
                                  ? `${Math.abs(getTrend(selectedTaskData.improvementTrend.duration)!).toFixed(1)}% slower`
                                  : "No trend"}
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Avg Page Views</CardTitle>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedTaskData.averagePageViews?.toFixed(1) || "N/A"}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">Avg Clicks</CardTitle>
                      <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {selectedTaskData.averageClicks?.toFixed(1) || "N/A"}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Duration Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Task Duration Over Time</CardTitle>
                      <CardDescription>
                        Time taken to complete the task (in seconds)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={durationData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="run" />
                          <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="duration" fill="#8884d8" name="Duration (s)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Page Views Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Page Views Over Time</CardTitle>
                      <CardDescription>
                        Number of pages viewed per run
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pageViewsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="run" />
                          <YAxis label={{ value: 'Page Views', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="pageViews" fill="#82ca9d" name="Page Views" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Page Clicks Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Page Clicks Over Time</CardTitle>
                      <CardDescription>
                        Number of navigation clicks per run
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pageClicksData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="run" />
                          <YAxis label={{ value: 'Page Clicks', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="pageClicks" fill="#0088fe" name="Page Clicks" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Scroll Events Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Scroll Events Over Time</CardTitle>
                      <CardDescription>
                        Number of scroll interactions per run
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={scrollEventsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="run" />
                          <YAxis label={{ value: 'Scroll Events', angle: -90, position: 'insideLeft' }} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="scrollEvents" fill="#ffc658" name="Scroll Events" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Run Details Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Run Details</CardTitle>
                    <CardDescription>
                      Detailed metrics for each run of {getTaskTitle(selectedTaskData.taskName)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Run</th>
                            <th className="text-left p-2">Duration</th>
                            <th className="text-left p-2">Page Views</th>
                            <th className="text-left p-2">Clicks</th>
                            <th className="text-left p-2">Time to First Page</th>
                            <th className="text-left p-2">Pages Visited</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedTaskData.runs.map((run) => (
                            <tr key={run.runIndex} className="border-b">
                              <td className="p-2">
                                <Badge variant="outline">Run {run.runIndex}</Badge>
                              </td>
                              <td className="p-2">{formatDuration(run.duration)}</td>
                              <td className="p-2">{run.pageViews}</td>
                              <td className="p-2">{run.clicks}</td>
                              <td className="p-2">
                                {formatDuration(run.timeToFirstPage)}
                              </td>
                              <td className="p-2">
                                <div className="flex flex-wrap gap-1">
                                  {run.pagesVisited.slice(0, 3).map((page, idx) => (
                                    <Badge key={idx} variant="secondary" className="text-xs">
                                      {page}
                                    </Badge>
                                  ))}
                                  {run.pagesVisited.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{run.pagesVisited.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}
