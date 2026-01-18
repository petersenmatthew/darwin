import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Path to saved-events.json in the demo-app directory
// When Next.js runs, process.cwd() is the dashboard directory (packages/darwin-sdk/dashboard)
// We need to go: ../../demo-app/saved-events.json
const getSavedEventsPath = () => {
  const cwd = process.cwd();
  // If we're in the dashboard directory, go up to packages, then into demo-app
  if (cwd.endsWith('dashboard')) {
    return path.join(cwd, '../../demo-app/saved-events.json');
  }
  // Fallback: try to find it relative to current working directory
  return path.join(cwd, '../../demo-app/saved-events.json');
};

const SAVED_EVENTS_FILE_PATH = getSavedEventsPath();

interface Event {
  event: string;
  session_id: string;
  task_id?: string;
  task_name?: string;
  timestamp: number;
  page_name?: string;
  [key: string]: any;
}

interface TaskMetrics {
  taskId: string;
  taskName: string;
  runIndex: number;
  sessionId: string;
  startTime: number;
  endTime?: number;
  duration?: number; // in milliseconds
  pageViews: number;
  clicks: number;
  pageClicks: number; // navigation_clicked events
  buttonClicks: number; // button_clicked events
  scrollEvents: number; // scroll events
  formInteractions: number;
  timeToFirstPage?: number; // time from session_start to first page_view
  pagesVisited: string[];
  events: Event[];
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
    duration: number[]; // percentage change per run
    pageViews: number[];
    clicks: number[];
    timeToFirstPage: number[];
  };
}

function parseTaskId(taskId: string): { taskName: string; index: number } | null {
  // Format: TASK-NAME-INDEX
  const match = taskId.match(/^(.+)-(\d+)$/);
  if (!match) return null;
  return {
    taskName: match[1].replace(/-/g, ' '),
    index: parseInt(match[2], 10),
  };
}

function calculateMetrics(events: Event[]): TaskMetrics | null {
  if (events.length === 0) return null;

  const sessionStarted = events.find(e => e.event === 'session_started');
  const sessionEnded = events.find(e => e.event === 'session_ended');
  
  if (!sessionStarted) return null;

  const taskId = sessionStarted.task_id || 'UNKNOWN-TASK-0';
  const taskName = sessionStarted.task_name || 'Unknown Task';
  const startTime = sessionStarted.timestamp;
  
  // Use session_ended timestamp if available, otherwise use the last event's timestamp as fallback
  let endTime = sessionEnded?.timestamp;
  if (!endTime && events.length > 0) {
    // Find the last event by timestamp
    const sortedEvents = [...events].sort((a, b) => b.timestamp - a.timestamp);
    const lastEvent = sortedEvents[0];
    if (lastEvent && lastEvent.timestamp > startTime) {
      endTime = lastEvent.timestamp;
    }
  }
  
  const duration = endTime ? endTime - startTime : undefined;

  // Calculate metrics
  const pageViews = events.filter(e => e.event === 'page_viewed').length;
  const pageClicks = events.filter(e => e.event === 'navigation_clicked').length;
  const buttonClicks = events.filter(e => e.event === 'button_clicked').length;
  const scrollEvents = events.filter(e => e.event === 'scroll').length;
  const clicks = pageClicks + buttonClicks; // Total clicks for backward compatibility
  const formInteractions = events.filter(e => 
    e.event.startsWith('form_')
  ).length;

  // Time to first page view
  const firstPageView = events.find(e => e.event === 'page_viewed');
  const timeToFirstPage = firstPageView 
    ? firstPageView.timestamp - startTime 
    : undefined;

  // Unique pages visited
  const pagesVisited = Array.from(
    new Set(events.filter(e => e.page_name).map(e => e.page_name!))
  );

  const parsed = parseTaskId(taskId);
  const runIndex = parsed?.index || 0;

  return {
    taskId,
    taskName,
    runIndex,
    sessionId: sessionStarted.session_id,
    startTime,
    endTime,
    duration,
    pageViews,
    clicks,
    pageClicks,
    buttonClicks,
    scrollEvents,
    formInteractions,
    timeToFirstPage,
    pagesVisited,
    events,
  };
}

function groupEventsBySession(events: Event[]): Event[][] {
  const sessions: Record<string, Event[]> = {};
  
  for (const event of events) {
    const sessionId = event.session_id;
    if (!sessions[sessionId]) {
      sessions[sessionId] = [];
    }
    sessions[sessionId].push(event);
  }

  return Object.values(sessions);
}

function calculateImprovementTrend(runs: TaskMetrics[]): TaskAnalytics['improvementTrend'] {
  if (runs.length < 2) return undefined;

  const duration: number[] = [];
  const pageViews: number[] = [];
  const clicks: number[] = [];
  const timeToFirstPage: number[] = [];

  for (let i = 1; i < runs.length; i++) {
    const prev = runs[i - 1];
    const curr = runs[i];

    if (prev.duration && curr.duration) {
      const change = ((prev.duration - curr.duration) / prev.duration) * 100;
      duration.push(change);
    }

    if (prev.pageViews && curr.pageViews) {
      const change = ((prev.pageViews - curr.pageViews) / prev.pageViews) * 100;
      pageViews.push(change);
    }

    if (prev.clicks && curr.clicks) {
      const change = ((prev.clicks - curr.clicks) / prev.clicks) * 100;
      clicks.push(change);
    }

    if (prev.timeToFirstPage && curr.timeToFirstPage) {
      const change = ((prev.timeToFirstPage - curr.timeToFirstPage) / prev.timeToFirstPage) * 100;
      timeToFirstPage.push(change);
    }
  }

  return { duration, pageViews, clicks, timeToFirstPage };
}

export async function GET(request: NextRequest) {
  try {
    // Read saved-events.json
    if (!fs.existsSync(SAVED_EVENTS_FILE_PATH)) {
      return NextResponse.json({ 
        tasks: [],
        message: 'No analytics data available yet'
      });
    }

    const fileContent = fs.readFileSync(SAVED_EVENTS_FILE_PATH, 'utf-8');
    const allEvents: Event[] = JSON.parse(fileContent);
    
    if (!Array.isArray(allEvents) || allEvents.length === 0) {
      return NextResponse.json({ 
        tasks: [],
        message: 'No events found'
      });
    }

    // Group events by session
    const sessionGroups = groupEventsBySession(allEvents);

    // Calculate metrics for each session
    const allTaskMetrics: TaskMetrics[] = [];
    for (const sessionEvents of sessionGroups) {
      const metrics = calculateMetrics(sessionEvents);
      if (metrics) {
        allTaskMetrics.push(metrics);
      }
    }

    // Group metrics by task
    const taskGroups: Record<string, TaskMetrics[]> = {};
    for (const metrics of allTaskMetrics) {
      const key = metrics.taskName;
      if (!taskGroups[key]) {
        taskGroups[key] = [];
      }
      taskGroups[key].push(metrics);
    }

    // Sort runs by index for each task
    for (const taskName in taskGroups) {
      taskGroups[taskName].sort((a, b) => a.runIndex - b.runIndex);
    }

    // Build analytics for each task
    const analytics: TaskAnalytics[] = [];
    for (const taskName in taskGroups) {
      const runs = taskGroups[taskName];
      
      // Calculate averages
      const durations = runs.filter(r => r.duration).map(r => r.duration!);
      const pageViews = runs.map(r => r.pageViews);
      const clicks = runs.map(r => r.clicks);
      const timeToFirstPage = runs.filter(r => r.timeToFirstPage).map(r => r.timeToFirstPage!);

      const averageDuration = durations.length > 0
        ? durations.reduce((a, b) => a + b, 0) / durations.length
        : undefined;
      const averagePageViews = pageViews.length > 0
        ? pageViews.reduce((a, b) => a + b, 0) / pageViews.length
        : undefined;
      const averageClicks = clicks.length > 0
        ? clicks.reduce((a, b) => a + b, 0) / clicks.length
        : undefined;
      const averageTimeToFirstPage = timeToFirstPage.length > 0
        ? timeToFirstPage.reduce((a, b) => a + b, 0) / timeToFirstPage.length
        : undefined;

      const improvementTrend = calculateImprovementTrend(runs);

      analytics.push({
        taskName,
        taskId: runs[0]?.taskId || `${taskName}-0`,
        totalRuns: runs.length,
        runs,
        averageDuration,
        averagePageViews,
        averageClicks,
        averageTimeToFirstPage,
        improvementTrend,
      });
    }

    // Sort by task name
    analytics.sort((a, b) => a.taskName.localeCompare(b.taskName));

    return NextResponse.json({ tasks: analytics });
  } catch (error) {
    console.error('Error reading analytics:', error);
    return NextResponse.json(
      { error: 'Failed to read analytics data', details: String(error) },
      { status: 500 }
    );
  }
}
