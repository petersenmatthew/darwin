#!/usr/bin/env node

// Load environment variables from root .env file
// This MUST run before any other imports
const path = require('path');
require('dotenv').config({ 
  path: path.resolve(__dirname, '../../../.env') 
});

// Polyfill for SlowBuffer (removed in Node.js 21+)
// This MUST run before any modules that use SlowBuffer are loaded
if (typeof global.SlowBuffer === 'undefined') {
  const { Buffer } = require('buffer');
  
  // SlowBuffer was a subclass of Buffer with a prototype.equal method
  // Create a proper polyfill that matches the old API
  function SlowBuffer(...args) {
    return Buffer.from(...args);
  }
  
  // Copy Buffer prototype methods
  SlowBuffer.prototype = Object.create(Buffer.prototype);
  SlowBuffer.prototype.constructor = SlowBuffer;
  
  // Add the equal method if it doesn't exist
  if (!SlowBuffer.prototype.equal) {
    SlowBuffer.prototype.equal = Buffer.prototype.equals || function(other) {
      return Buffer.compare(this, other) === 0;
    };
  }
  
  global.SlowBuffer = SlowBuffer;
  globalThis.SlowBuffer = SlowBuffer;
}

// Now require and start the server
const { startDarwin } = require('./dist/main.js');
startDarwin();
