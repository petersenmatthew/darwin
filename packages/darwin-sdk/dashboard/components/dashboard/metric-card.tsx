"use client";

import React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  trendLabel?: string;
  sparklineData?: { value: number }[];
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({
  title,
  value,
  trend,
  trendLabel = "vs last period",
  sparklineData,
  icon,
  className,
}: MetricCardProps) {
  const isPositiveTrend = trend !== undefined && trend > 0;
  const isNeutralTrend = trend !== undefined && trend === 0;
  const isNegativeTrend = trend !== undefined && trend < 0;
  
  // Determine trend color: green for positive, red for negative, gray for neutral
  const trendColor = isPositiveTrend 
    ? "#22c55e" 
    : isNeutralTrend 
    ? "#6b7280" 
    : "#ef4444";

  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-2xl font-bold">{value}</div>
            {trend !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {isPositiveTrend ? (
                  <TrendingUp className="h-3 w-3 text-success" />
                ) : isNegativeTrend ? (
                  <TrendingDown className="h-3 w-3 text-destructive" />
                ) : null}
                <span
                  className={cn(
                    "text-xs font-medium",
                    isPositiveTrend 
                      ? "text-success" 
                      : isNeutralTrend 
                      ? "text-muted-foreground" 
                      : "text-destructive"
                  )}
                >
                  {isPositiveTrend ? "+" : ""}
                  {trend}%
                </span>
                <span className="text-xs text-muted-foreground">
                  {trendLabel}
                </span>
              </div>
            )}
          </div>
          {sparklineData && (
            <div className="h-10 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sparklineData}>
                  <defs>
                    <linearGradient id="sparkGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={trendColor} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={trendColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={trendColor}
                    strokeWidth={1.5}
                    fill="url(#sparkGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
