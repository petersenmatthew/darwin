"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./status-badge";
import { apiClient } from "@/lib/api-client";
import { Eye, MoreHorizontal, Download, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function SessionsTable() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await apiClient.getAllSessions();
        setSessions(data);
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
    // Refresh sessions every 3 seconds
    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Recent Sessions</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sessions">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Session ID</TableHead>
                <TableHead className="text-xs">Agent</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Task</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs hidden sm:table-cell">Duration</TableHead>
                <TableHead className="text-xs hidden lg:table-cell">Steps</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Started</TableHead>
                <TableHead className="text-xs w-10">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    Loading sessions...
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No sessions yet. Create a task to get started.
                  </TableCell>
                </TableRow>
              ) : (
                sessions.slice(0, 10).map((session) => (
                <TableRow key={session.id} className="group">
                  <TableCell className="font-mono text-xs">
                    {session.id}
                  </TableCell>
                  <TableCell className="font-medium text-sm">
                    {session.agentName}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate hidden md:table-cell">
                    {session.task}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={session.status} />
                  </TableCell>
                  <TableCell className="text-sm hidden sm:table-cell">
                    {session.duration}
                  </TableCell>
                  <TableCell className="text-sm hidden lg:table-cell">
                    <span className="text-muted-foreground">
                      {session.steps}/{session.maxSteps}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                    {session.startedAt}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="mr-2 h-4 w-4" />
                          Download Logs
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
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
        </div>
      </CardContent>
    </Card>
  );
}
