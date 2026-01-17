/**
 * Timer Overlay Component
 * 
 * Injects a visual timer overlay into browser pages to track task execution time.
 */

export interface TimerOverlayOptions {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
}

const DEFAULT_OPTIONS: Required<TimerOverlayOptions> = {
  position: 'top-right',
  color: '#00ff00',
  backgroundColor: 'rgba(0, 0, 0, 0.85)',
  fontSize: 16,
};

/**
 * Get CSS styles for timer position
 */
function getPositionStyles(position: string): string {
  const positions: Record<string, { top?: string; bottom?: string; left?: string; right?: string }> = {
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
  };

  const pos = positions[position] || positions['top-right'];
  return Object.entries(pos)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
}

/**
 * Generate the timer HTML and CSS
 */
function generateTimerHTML(options: Required<TimerOverlayOptions>): string {
  const positionStyles = getPositionStyles(options.position);

  return `
    <div style="
      position: fixed;
      ${positionStyles}
      background: ${options.backgroundColor};
      color: ${options.color};
      padding: 12px 20px;
      border-radius: 8px;
      font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
      font-size: ${options.fontSize}px;
      font-weight: bold;
      z-index: 999999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      border: 2px solid ${options.color}33;
      backdrop-filter: blur(10px);
      user-select: none;
      pointer-events: none;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <span style="
          display: inline-block;
          width: 8px;
          height: 8px;
          background: ${options.color};
          border-radius: 50%;
          animation: darwin-pulse 2s infinite;
        "></span>
        <span id="darwin-timer-text">00:00:00</span>
      </div>
    </div>
    <style>
      @keyframes darwin-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
    </style>
  `;
}


/**
 * Inject timer overlay into a browser page
 */
export async function injectTimerOverlay(
  page: any,
  options: TimerOverlayOptions = {}
): Promise<void> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  await page.evaluate((timerHTML: string) => {
    // Remove existing timer if it exists
    const existingTimer = document.getElementById('darwin-timer');
    if (existingTimer) {
      existingTimer.remove();
    }

    // Clear any existing interval
    if ((window as any).__darwinTimerInterval) {
      clearInterval((window as any).__darwinTimerInterval);
    }

    // Create timer container
    const timerContainer = document.createElement('div');
    timerContainer.id = 'darwin-timer';
    timerContainer.innerHTML = timerHTML;

    document.body.appendChild(timerContainer);

    // Start timer
    const startTime = Date.now();
    const timerText = document.getElementById('darwin-timer-text');
    
    const formatTime = (elapsedMs: number): string => {
      const seconds = Math.floor((elapsedMs / 1000) % 60);
      const minutes = Math.floor((elapsedMs / 1000 / 60) % 60);
      const hours = Math.floor(elapsedMs / 1000 / 60 / 60);
      
      const format = (num: number) => num.toString().padStart(2, '0');
      return `${format(hours)}:${format(minutes)}:${format(seconds)}`;
    };
    
    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const formatted = formatTime(elapsed);
      if (timerText) {
        timerText.textContent = formatted;
      }
    };

    // Update every 100ms for smooth display
    const intervalId = setInterval(updateTimer, 100);
    updateTimer(); // Initial update

    // Store interval ID on window for cleanup if needed
    (window as any).__darwinTimerInterval = intervalId;
  }, generateTimerHTML(mergedOptions));
}

/**
 * Stop the timer overlay (keeps it visible with final time)
 */
export async function stopTimerOverlay(page: any): Promise<void> {
  await page.evaluate(() => {
    // Stop the interval
    if ((window as any).__darwinTimerInterval) {
      clearInterval((window as any).__darwinTimerInterval);
      delete (window as any).__darwinTimerInterval;
    }

    // Update the indicator to show it's stopped (change pulsing dot to solid)
    const timer = document.getElementById('darwin-timer');
    if (timer) {
      const dot = timer.querySelector('span[style*="animation"]') as HTMLElement;
      if (dot) {
        dot.style.animation = 'none';
        dot.style.opacity = '1';
      }
    }
  });
}

/**
 * Remove timer overlay from a browser page
 */
export async function removeTimerOverlay(page: any): Promise<void> {
  await page.evaluate(() => {
    const timer = document.getElementById('darwin-timer');
    if (timer) {
      timer.remove();
    }

    if ((window as any).__darwinTimerInterval) {
      clearInterval((window as any).__darwinTimerInterval);
      delete (window as any).__darwinTimerInterval;
    }
  });
}
