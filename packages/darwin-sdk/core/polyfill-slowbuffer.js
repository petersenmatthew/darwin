// Polyfill for SlowBuffer (removed in Node.js 21+)
// Add this at the top of main.js or before requiring stagehand
if (typeof globalThis.SlowBuffer === 'undefined') {
  const { Buffer } = require('buffer');
  globalThis.SlowBuffer = Buffer;
}
