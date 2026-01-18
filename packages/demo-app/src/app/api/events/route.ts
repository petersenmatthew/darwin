import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Get the correct path to events.json (should be in the demo-app directory)
// When Next.js runs, process.cwd() is typically the directory where package.json is located
const EVENTS_FILE_PATH = path.join(process.cwd(), 'events.json');
const SAVED_EVENTS_FILE_PATH = path.join(process.cwd(), 'saved-events.json');
const TASK_COUNTS_FILE_PATH = path.join(process.cwd(), 'task-counts.json');

// Helper function to get or initialize task counts
function getTaskCounts(): Record<string, number> {
  if (fs.existsSync(TASK_COUNTS_FILE_PATH)) {
    try {
      const fileContent = fs.readFileSync(TASK_COUNTS_FILE_PATH, 'utf-8');
      return JSON.parse(fileContent);
    } catch (error) {
      console.error('Error reading task-counts.json:', error);
      return {};
    }
  }
  return {};
}

// Helper function to save task counts
function saveTaskCounts(counts: Record<string, number>) {
  fs.writeFileSync(TASK_COUNTS_FILE_PATH, JSON.stringify(counts, null, 2), 'utf-8');
}

// Helper function to get next task index for a given task name
function getNextTaskIndex(taskName: string): number {
  const counts = getTaskCounts();
  const currentCount = counts[taskName] || 0;
  counts[taskName] = currentCount + 1;
  saveTaskCounts(counts);
  return counts[taskName];
}

// Helper function to generate task_id
function generateTaskId(taskName: string): string {
  const index = getNextTaskIndex(taskName);
  // Normalize task name: remove special chars, replace spaces with hyphens, uppercase
  const normalizedTask = taskName
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .toUpperCase();
  return `${normalizedTask}-${index}`;
}

// Helper function to get current session ID from events
function getCurrentSessionId(events: any[]): string | null {
  // Find the most recent session_started event
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].event === 'session_started' && events[i].session_id) {
      return events[i].session_id;
    }
  }
  // If no session_started found, use the session_id from the first event (if any)
  return events.length > 0 && events[0].session_id ? events[0].session_id : null;
}

// Helper function to save events to saved-events.json
function saveEventsToHistory(eventsToSave: any[]) {
  if (eventsToSave.length === 0) return;

  let savedEvents: any[] = [];
  if (fs.existsSync(SAVED_EVENTS_FILE_PATH)) {
    try {
      const fileContent = fs.readFileSync(SAVED_EVENTS_FILE_PATH, 'utf-8');
      savedEvents = JSON.parse(fileContent);
      if (!Array.isArray(savedEvents)) {
        savedEvents = [];
      }
    } catch (error) {
      console.error('Error reading saved-events.json:', error);
      savedEvents = [];
    }
  }

  // Append the events to saved-events.json
  savedEvents.push(...eventsToSave);
  fs.writeFileSync(SAVED_EVENTS_FILE_PATH, JSON.stringify(savedEvents, null, 2), 'utf-8');
}

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();
    const eventType = eventData.event;
    const eventSessionId = eventData.session_id;

    // Read existing events or initialize empty array
    let events: any[] = [];
    if (fs.existsSync(EVENTS_FILE_PATH)) {
      try {
        const fileContent = fs.readFileSync(EVENTS_FILE_PATH, 'utf-8');
        events = JSON.parse(fileContent);
        if (!Array.isArray(events)) {
          events = [];
        }
      } catch (error) {
        console.error('Error reading events.json:', error);
        events = [];
      }
    }

    // Handle session_started: clear events.json and start fresh
    if (eventType === 'session_started') {
      // Save any existing events to history before clearing
      if (events.length > 0) {
        saveEventsToHistory(events);
      }
      
      // Extract task name from event data (could be in task field or task_name)
      const taskName = eventData.task || eventData.task_name || 'UNKNOWN-TASK';
      const taskId = generateTaskId(taskName);
      
      // Add task_id to the session_started event
      eventData.task_id = taskId;
      eventData.task_name = taskName;
      
      // Start fresh with just this session_started event
      events = [eventData];
      fs.writeFileSync(EVENTS_FILE_PATH, JSON.stringify(events, null, 2), 'utf-8');
      return NextResponse.json({ success: true, eventCount: events.length });
    }

    // Handle session_ended: save session events to history and clear events.json
    if (eventType === 'session_ended') {
      // Get task_id from session_started event if available
      const sessionStartedEvent = events.find(e => e.event === 'session_started');
      if (sessionStartedEvent && sessionStartedEvent.task_id) {
        eventData.task_id = sessionStartedEvent.task_id;
        eventData.task_name = sessionStartedEvent.task_name;
      }
      
      // Add the session_ended event to current events
      events.push(eventData);
      
      // Get all events from this session
      const sessionEvents = events.filter(e => e.session_id === eventSessionId);
      
      // Save session events to history
      saveEventsToHistory(sessionEvents);
      
      // Clear events.json (start fresh for next session)
      events = [];
      fs.writeFileSync(EVENTS_FILE_PATH, JSON.stringify(events, null, 2), 'utf-8');
      return NextResponse.json({ success: true, eventCount: 0 });
    }

    // For all other events: only keep events from current session
    const currentSessionId = getCurrentSessionId(events);
    
    // If we have a current session, filter to only keep events from that session
    if (currentSessionId) {
      // Only process if the incoming event matches the current session
      if (eventSessionId === currentSessionId) {
        // Filter to only keep events from current session
        events = events.filter(e => e.session_id === currentSessionId);
        
        // Get task_id from the session_started event in current events
        const sessionStartedEvent = events.find(e => e.event === 'session_started');
        if (sessionStartedEvent && sessionStartedEvent.task_id) {
          // Add task_id to all events in this session
          eventData.task_id = sessionStartedEvent.task_id;
          eventData.task_name = sessionStartedEvent.task_name;
        }
        
        // Add the new event
        events.push(eventData);
      } else {
        // Event from a different session - don't add it to current events.json
        // It will be saved when that session ends
        console.log(`Event from different session (${eventSessionId}) ignored in events.json, current session: ${currentSessionId}`);
        return NextResponse.json({ success: true, eventCount: events.length });
      }
    } else {
      // No current session found - this can happen if session_started hasn't been processed yet
      // or if events.json was cleared. In this case, we'll add the event anyway.
      // If it's a session_started event, it will be handled properly on the next call.
      console.warn(`No current session found in events.json, adding event with session_id: ${eventSessionId}`);
      events.push(eventData);
    }

    // Always write back to file (only current session events)
    try {
      fs.writeFileSync(EVENTS_FILE_PATH, JSON.stringify(events, null, 2), 'utf-8');
    } catch (writeError) {
      console.error('Error writing to events.json:', writeError);
      throw writeError;
    }

    return NextResponse.json({ success: true, eventCount: events.length });
  } catch (error) {
    console.error('Error writing event to file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to write event' },
      { status: 500 }
    );
  }
}
