// Polyfill for SlowBuffer (removed in Node.js 21+)
// This must be loaded BEFORE any Stagehand imports

// Patch require to ensure SlowBuffer exists before any module loads
const Module = require("module");
const originalRequire = Module.prototype.require;

// Intercept require calls to patch SlowBuffer before buffer-equal-constant-time loads
Module.prototype.require = function(id: string) {
  // Ensure SlowBuffer exists before requiring anything
  if (typeof (global as any).SlowBuffer === "undefined") {
    const { Buffer } = require("buffer");
    (global as any).SlowBuffer = Buffer;
    
    // Ensure Buffer.prototype.equal exists
    if (!Buffer.prototype.equal) {
      Buffer.prototype.equal = function(other: Buffer): boolean {
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
  }
  
  return originalRequire.apply(this, arguments as any);
};

// Also set it immediately
if (typeof (global as any).SlowBuffer === "undefined") {
  const { Buffer } = require("buffer");
  (global as any).SlowBuffer = Buffer;
  
  if (!Buffer.prototype.equal) {
    Buffer.prototype.equal = function(other: Buffer): boolean {
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
}

// Export nothing - this is a side-effect module
export {};
