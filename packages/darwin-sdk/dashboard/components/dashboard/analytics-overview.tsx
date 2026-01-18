"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Clock, MousePointerClick, Eye, ArrowRight } from "lucide-react";
import Link from "next/link";

interface TaskAnalytics {
  taskName: string;
  taskId: string;
  totalRuns: number;
  averageDuration?: number;
  averagePageViews?: number;
  averageClicks?: number;
}

export function AnalyticsOverview() {
  const [analytics, setAnalytics] = useState<TaskAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data.tasks || []);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (ms?: number) => {
    if (!ms) return "N/A";
    const seconds = Math.round(ms / 1000);
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const totalRuns = analytics.reduce((sum, task) => sum + task.totalRuns, 0);
  const avgDuration = analytics.length > 0
    ? analytics.reduce((sum, task) => sum + (task.averageDuration || 0), 0) / analytics.length
    : 0;
  const avgPageViews = analytics.length > 0
    ? analytics.reduce((sum, task) => sum + (task.averagePageViews || 0), 0) / analytics.length
    : 0;
  const avgClicks = analytics.length > 0
    ? analytics.reduce((sum, task) => sum + (task.averageClicks || 0), 0) / analytics.length
    : 0;

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/analytics" className="flex items-center gap-1">
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            Loading analytics...
          </div>
        ) : analytics.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No analytics data available yet. Run some tasks to see metrics.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3" />
                  Total Runs
                </div>
                <div className="text-2xl font-semibold">{totalRuns}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Avg Duration
                </div>
                <div className="text-2xl font-semibold">{formatDuration(avgDuration)}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Eye className="h-3 w-3" />
                  Avg Page Views
                </div>
                <div className="text-2xl font-semibold">{avgPageViews.toFixed(1)}</div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MousePointerClick className="h-3 w-3" />
                  Avg Clicks
                </div>
                <div className="text-2xl font-semibold">{avgClicks.toFixed(1)}</div>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-muted-foreground mb-2">Tasks Tracked</div>
              <div className="text-sm font-medium">{analytics.length}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
