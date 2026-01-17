#!/usr/bin/env node

// Load environment variables from root .env file
// This MUST run before any other imports
import * as path from 'path';
import * as dotenv from 'dotenv';
dotenv.config({ 
  path: path.resolve(__dirname, '../../../.env') 
});

// Polyfill for SlowBuffer (removed in Node.js 21+)
// This MUST run before any modules that use SlowBuffer are loaded
if (typeof (global as any).SlowBuffer === 'undefined') {
  const { Buffer } = require('buffer');
  
  // SlowBuffer was a subclass of Buffer with a prototype.equal method
  // Create a proper polyfill that matches the old API
  function SlowBuffer(...args: any[]) {
    return Buffer.from(...args);
  }
  
  // Copy Buffer prototype methods
  SlowBuffer.prototype = Object.create(Buffer.prototype);
  SlowBuffer.prototype.constructor = SlowBuffer;
  
  // Add the equal method if it doesn't exist
  if (!SlowBuffer.prototype.equal) {
    SlowBuffer.prototype.equal = Buffer.prototype.equals || function(this: Buffer, other: any) {
      return Buffer.compare(this, other) === 0;
    };
  }
  
  (global as any).SlowBuffer = SlowBuffer;
  (globalThis as any).SlowBuffer = SlowBuffer;
}

// Now require and start the server
import { startDarwin } from './main';
startDarwin();
