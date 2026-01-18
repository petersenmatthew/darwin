"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/dashboard/navbar";
import { MetricCard } from "@/components/dashboard/metric-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { SessionsTable } from "@/components/dashboard/sessions-table";
import { apiClient } from "@/lib/api-client";
import { Bot, Zap, CheckCircle2, ListTodo } from "lucide-react";

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    totalAgents: 0,
    agentsTrend: 0,
    activeSessions: 0,
    sessionsTrend: 0,
    successRate: 0,
    successTrend: 0,
    tasksCompleted: 0,
    tasksTrend: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await apiClient.getMetrics();
        setMetrics(data);
      } catch (error) {
        console.error("Failed to fetch metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
    // Refresh metrics every 5 seconds
    const interval = setInterval(fetchMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your browser agents and track performance
          </p>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard
            title="Total Sessions"
            value={metrics.totalAgents}
            trend={metrics.agentsTrend}
            icon={<Bot className="h-4 w-4" />}
          />
          <MetricCard
            title="Active Sessions"
            value={metrics.activeSessions}
            trend={metrics.sessionsTrend}
            icon={<Zap className="h-4 w-4" />}
          />
          <MetricCard
            title="Success Rate"
            value={`${metrics.successRate}%`}
            trend={metrics.successTrend}
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <MetricCard
            title="Tasks Completed"
            value={metrics.tasksCompleted.toLocaleString()}
            trend={metrics.tasksTrend}
            trendLabel="this week"
            icon={<ListTodo className="h-4 w-4" />}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Quick Actions & Recent Sessions */}
          <div className="lg:col-span-3">
            <QuickActions />
          </div>

          {/* Activity Feed */}
          <div className="lg:col-span-9">
            <ActivityFeed />
          </div>
        </div>

        {/* Sessions Table */}
        <SessionsTable />
      </main>
    </div>
  );
}
