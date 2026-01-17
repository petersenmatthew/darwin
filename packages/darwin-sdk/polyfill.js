// Polyfill for SlowBuffer (removed in Node.js 21+)
// This must be loaded BEFORE any Stagehand imports

// Load environment variables early from .env file
try {
  const path = require("path");
  const fs = require("fs");
  
  // Try loading from project root (two levels up from packages/darwin-sdk)
  const rootEnvPath = path.resolve(__dirname, "../../../.env");
  if (fs.existsSync(rootEnvPath)) {
    require("dotenv").config({ path: rootEnvPath });
  }
  
  // Also try current directory
  const localEnvPath = path.resolve(__dirname, ".env");
  if (fs.existsSync(localEnvPath)) {
    require("dotenv").config({ path: localEnvPath });
  }
} catch (e) {
  // Ignore if dotenv isn't available or .env doesn't exist
}

// CRITICAL: Patch the buffer module itself to export SlowBuffer
const Module = require("module");
const originalRequire = Module.prototype.require;

// Intercept buffer module requires
Module.prototype.require = function(id) {
  const result = originalRequire.apply(this, arguments);
  
  // If requiring buffer module, add SlowBuffer to it
  if (id === "buffer" && result && typeof result === "object") {
    if (!result.SlowBuffer) {
      result.SlowBuffer = result.Buffer;
    }
  }
  
  return result;
};

// Set SlowBuffer on all global objects immediately
const { Buffer } = originalRequire.call(Module, "buffer");

// Set on all possible global scopes
global.SlowBuffer = Buffer;
if (typeof process !== "undefined") {
  process.SlowBuffer = Buffer;
}
if (typeof globalThis !== "undefined") {
  globalThis.SlowBuffer = Buffer;
}
if (!Buffer.SlowBuffer) {
  Buffer.SlowBuffer = Buffer;
}

// Ensure Buffer.prototype.equal exists
if (!Buffer.prototype.equal) {
  Buffer.prototype.equal = function(other) {
    if (!Buffer.isBuffer(other)) {
      return false;
    }
    if (this.length !== other.length) {
      return false;
    }
    let result = 0;
    for (let i = 0; i < this.length; i++) {
      result |= this[i] ^ other[i];
    }
    return result === 0;
  };
}

// Also patch the buffer module's exports directly
try {
  const bufferModule = originalRequire.call(Module, "buffer");
  if (bufferModule && !bufferModule.SlowBuffer) {
    bufferModule.SlowBuffer = Buffer;
  }
} catch (e) {
  // Ignore if buffer module isn't available yet
}
