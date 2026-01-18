"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/dashboard/navbar";
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
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { apiClient } from "@/lib/api-client";
import { Eye, MoreHorizontal, Download, Trash2, Search, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import { cn } from "@/lib/utils";

type SessionStatus = "all" | "initializing" | "running" | "completed" | "error" | "cancelled";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<SessionStatus>("all");

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

  useEffect(() => {
    fetchSessions();
    // Refresh sessions every 3 seconds
    const interval = setInterval(fetchSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.agentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.task?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      activeTab === "all" || 
      session.status === activeTab;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: sessions.length,
    initializing: sessions.filter((s) => s.status === "initializing").length,
    running: sessions.filter((s) => s.status === "running").length,
    completed: sessions.filter((s) => s.status === "completed").length,
    error: sessions.filter((s) => s.status === "error").length,
    cancelled: sessions.filter((s) => s.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="p-6">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Sessions</h1>
              <p className="text-sm text-muted-foreground mt-1">
                View and manage all browser agent sessions
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSessions}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>

          {/* Sessions Table with Tabs */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search sessions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </CardHeader>
            {/* Stats Cards */}
            <div className="px-6 pb-4">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-2xl font-semibold">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Completed</div>
                    <div className="text-2xl font-semibold">
                      {stats.completed}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-muted-foreground">Errors</div>
                    <div className="text-2xl font-semibold">
                      {stats.error}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as SessionStatus)}>
                <div className="px-6 pb-4">
                  <TabsList>
                    <TabsTrigger value="all">
                      All ({stats.total})
                    </TabsTrigger>
                    <TabsTrigger value="initializing">
                      Initializing ({stats.initializing})
                    </TabsTrigger>
                    <TabsTrigger value="running">
                      Running ({stats.running})
                    </TabsTrigger>
                    <TabsTrigger value="completed">
                      Completed ({stats.completed})
                    </TabsTrigger>
                    <TabsTrigger value="error">
                      Error ({stats.error})
                    </TabsTrigger>
                    <TabsTrigger value="cancelled">
                      Cancelled ({stats.cancelled})
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="mt-0">
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
                        ) : filteredSessions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                              {searchQuery
                                ? "No sessions match your search."
                                : activeTab === "all"
                                  ? "No sessions yet. Create a task to get started."
                                  : `No ${activeTab} sessions.`}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredSessions.map((session) => (
                            <TableRow key={session.id} className="group">
                              <TableCell className="font-mono text-xs">
                                <Link
                                  href={`/sessions/${session.id}`}
                                  className="hover:underline text-foreground"
                                >
                                  {session.id}
                                </Link>
                              </TableCell>
                              <TableCell className="font-medium text-sm">
                                {session.agentName || "Browser Agent"}
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate hidden md:table-cell">
                                {session.task || "N/A"}
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={session.status} />
                              </TableCell>
                              <TableCell className="text-sm hidden sm:table-cell">
                                {session.duration || "-"}
                              </TableCell>
                              <TableCell className="text-sm hidden lg:table-cell">
                                <span className="text-muted-foreground">
                                  {session.steps || 0}/{session.maxSteps || 20}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                                {session.startedAt
                                  ? new Date(session.startedAt).toLocaleString()
                                  : "-"}
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
                                    <DropdownMenuItem asChild>
                                      <Link href={`/sessions/${session.id}`}>
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </Link>
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
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
