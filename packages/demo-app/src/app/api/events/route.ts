import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

// Get the correct path to events.json (should be in the demo-app directory)
// When Next.js runs, process.cwd() is typically the directory where package.json is located
const EVENTS_FILE_PATH = path.join(process.cwd(), 'events.json');

export async function POST(request: NextRequest) {
  try {
    const eventData = await request.json();

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

    // Append new event
    events.push(eventData);

    // Write back to file
    fs.writeFileSync(EVENTS_FILE_PATH, JSON.stringify(events, null, 2), 'utf-8');

    return NextResponse.json({ success: true, eventCount: events.length });
  } catch (error) {
    console.error('Error writing event to file:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to write event' },
      { status: 500 }
    );
  }
}
