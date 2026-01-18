export interface Agent {
  id: string;
  name: string;
  website: string;
  model: string;
  status: "active" | "inactive";
  lastRun: string;
  successRate: number;
  totalRuns: number;
}

export interface Session {
  id: string;
  agentId: string;
  agentName: string;
  task: string;
  status: "running" | "completed" | "error" | "cancelled";
  duration: string;
  steps: number;
  maxSteps: number;
  startedAt: string;
  completedAt?: string;
}

export interface Activity {
  id: string;
  agentName: string;
  task: string;
  status: "running" | "completed" | "error";
  timestamp: string;
}

export const mockAgents: Agent[] = [
  {
    id: "agent-1",
    name: "E-commerce Scraper",
    website: "https://shop.example.com",
    model: "gpt-4o",
    status: "active",
    lastRun: "2 minutes ago",
    successRate: 94,
    totalRuns: 156,
  },
  {
    id: "agent-2",
    name: "News Aggregator",
    website: "https://news.example.com",
    model: "claude-3-sonnet",
    status: "active",
    lastRun: "5 minutes ago",
    successRate: 98,
    totalRuns: 89,
  },
  {
    id: "agent-3",
    name: "Form Automation",
    website: "https://forms.example.com",
    model: "gpt-4o-mini",
    status: "inactive",
    lastRun: "1 hour ago",
    successRate: 87,
    totalRuns: 234,
  },
  {
    id: "agent-4",
    name: "Data Extraction Bot",
    website: "https://data.example.com",
    model: "gpt-4o",
    status: "active",
    lastRun: "10 minutes ago",
    successRate: 91,
    totalRuns: 78,
  },
];

export const mockSessions: Session[] = [
  {
    id: "sess-001",
    agentId: "agent-1",
    agentName: "E-commerce Scraper",
    task: "Extract product prices from catalog",
    status: "running",
    duration: "2m 34s",
    steps: 12,
    maxSteps: 25,
    startedAt: "2 minutes ago",
  },
  {
    id: "sess-002",
    agentId: "agent-2",
    agentName: "News Aggregator",
    task: "Collect top headlines",
    status: "completed",
    duration: "1m 45s",
    steps: 8,
    maxSteps: 15,
    startedAt: "5 minutes ago",
    completedAt: "3 minutes ago",
  },
  {
    id: "sess-003",
    agentId: "agent-3",
    agentName: "Form Automation",
    task: "Submit contact form",
    status: "error",
    duration: "45s",
    steps: 3,
    maxSteps: 10,
    startedAt: "1 hour ago",
    completedAt: "59 minutes ago",
  },
  {
    id: "sess-004",
    agentId: "agent-4",
    agentName: "Data Extraction Bot",
    task: "Extract user reviews",
    status: "completed",
    duration: "3m 12s",
    steps: 18,
    maxSteps: 20,
    startedAt: "15 minutes ago",
    completedAt: "12 minutes ago",
  },
  {
    id: "sess-005",
    agentId: "agent-1",
    agentName: "E-commerce Scraper",
    task: "Monitor inventory levels",
    status: "completed",
    duration: "2m 08s",
    steps: 14,
    maxSteps: 25,
    startedAt: "30 minutes ago",
    completedAt: "28 minutes ago",
  },
];

export const mockActivities: Activity[] = [
  {
    id: "act-1",
    agentName: "E-commerce Scraper",
    task: "Navigating to product page",
    status: "running",
    timestamp: "Just now",
  },
  {
    id: "act-2",
    agentName: "News Aggregator",
    task: "Collected 15 headlines",
    status: "completed",
    timestamp: "3 minutes ago",
  },
  {
    id: "act-3",
    agentName: "Form Automation",
    task: "Failed to locate submit button",
    status: "error",
    timestamp: "59 minutes ago",
  },
  {
    id: "act-4",
    agentName: "Data Extraction Bot",
    task: "Extracted 42 reviews",
    status: "completed",
    timestamp: "12 minutes ago",
  },
  {
    id: "act-5",
    agentName: "E-commerce Scraper",
    task: "Inventory check completed",
    status: "completed",
    timestamp: "28 minutes ago",
  },
];

export interface Task {
  id: string;
  name: string;
  description: string;
  type: "scrape" | "form" | "navigate" | "monitor" | "custom";
  targetUrl: string;
  status: "active" | "paused" | "draft";
  lastRun: string | null;
  successRate: number;
  totalRuns: number;
  createdAt: string;
}

export const mockTasks: Task[] = [
  {
    id: "task-1",
    name: "Extract Product Prices",
    description: "Scrape pricing data from e-commerce catalog pages",
    type: "scrape",
    targetUrl: "https://shop.example.com/products",
    status: "active",
    lastRun: "5 minutes ago",
    successRate: 96,
    totalRuns: 234,
    createdAt: "2 weeks ago",
  },
  {
    id: "task-2",
    name: "Submit Contact Forms",
    description: "Automate contact form submissions for lead generation",
    type: "form",
    targetUrl: "https://leads.example.com/contact",
    status: "active",
    lastRun: "1 hour ago",
    successRate: 89,
    totalRuns: 156,
    createdAt: "1 month ago",
  },
  {
    id: "task-3",
    name: "Monitor Stock Levels",
    description: "Track inventory changes on competitor websites",
    type: "monitor",
    targetUrl: "https://competitor.example.com/inventory",
    status: "paused",
    lastRun: "3 days ago",
    successRate: 94,
    totalRuns: 89,
    createdAt: "3 weeks ago",
  },
  {
    id: "task-4",
    name: "Checkout Flow Testing",
    description: "Navigate through checkout process to verify functionality",
    type: "navigate",
    targetUrl: "https://shop.example.com/checkout",
    status: "active",
    lastRun: "30 minutes ago",
    successRate: 91,
    totalRuns: 67,
    createdAt: "1 week ago",
  },
  {
    id: "task-5",
    name: "News Headlines Collector",
    description: "Collect top headlines from news aggregator sites",
    type: "scrape",
    targetUrl: "https://news.example.com",
    status: "active",
    lastRun: "2 minutes ago",
    successRate: 98,
    totalRuns: 445,
    createdAt: "2 months ago",
  },
  {
    id: "task-6",
    name: "User Review Extraction",
    description: "Extract and analyze user reviews from product pages",
    type: "custom",
    targetUrl: "https://reviews.example.com",
    status: "draft",
    lastRun: null,
    successRate: 0,
    totalRuns: 0,
    createdAt: "1 day ago",
  },
];

export const mockMetrics = {
  totalAgents: 12,
  agentsTrend: 8.3,
  activeSessions: 3,
  sessionsTrend: 15.2,
  successRate: 92.4,
  successTrend: 2.1,
  tasksCompleted: 1247,
  tasksTrend: 12.5,
};

export const mockSparklineData = [
  { value: 88 },
  { value: 90 },
  { value: 87 },
  { value: 91 },
  { value: 89 },
  { value: 92 },
  { value: 94 },
  { value: 91 },
  { value: 93 },
  { value: 92 },
];
