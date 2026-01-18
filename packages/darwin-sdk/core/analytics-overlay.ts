/**
 * Analytics Notification Overlay Component
 * 
 * Injects a visual notification overlay into browser pages to show when analytics events are tracked.
 */

export interface AnalyticsOverlayOptions {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  maxNotifications?: number;
  autoDismissDelay?: number;
}

const DEFAULT_OPTIONS: Required<AnalyticsOverlayOptions> = {
  position: 'top-left',
  maxNotifications: 5,
  autoDismissDelay: 3000,
};

/**
 * Get CSS styles for overlay position
 */
function getPositionStyles(position: string): string {
  const positions: Record<string, { top?: string; bottom?: string; left?: string; right?: string }> = {
    'top-right': { top: '20px', right: '20px' },
    'top-left': { top: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-left': { bottom: '20px', left: '20px' },
  };

  const pos = positions[position] || positions['top-left'];
  return Object.entries(pos)
    .map(([key, value]) => `${key}: ${value};`)
    .join(' ');
}

/**
 * Generate the analytics overlay HTML and CSS
 */
function generateAnalyticsOverlayHTML(options: Required<AnalyticsOverlayOptions>): string {
  const positionStyles = getPositionStyles(options.position);

  return `
    <div id="darwin-analytics-overlay" style="
      position: fixed;
      ${positionStyles}
      z-index: 999998;
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
      max-width: 320px;
    ">
    </div>
    <style>
      @keyframes darwin-notification-slide-in-right {
        from {
          opacity: 0;
          transform: translateX(100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes darwin-notification-slide-in-left {
        from {
          opacity: 0;
          transform: translateX(-100%);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      
      @keyframes darwin-notification-slide-in-bottom {
        from {
          opacity: 0;
          transform: translateY(100%);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes darwin-notification-slide-in-top {
        from {
          opacity: 0;
          transform: translateY(-100%);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes darwin-notification-slide-out-right {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(100%);
        }
      }
      
      @keyframes darwin-notification-slide-out-left {
        from {
          opacity: 1;
          transform: translateX(0);
        }
        to {
          opacity: 0;
          transform: translateX(-100%);
        }
      }
      
      @keyframes darwin-notification-slide-out-bottom {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(100%);
        }
      }
      
      @keyframes darwin-notification-slide-out-top {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-100%);
        }
      }
      
      .darwin-notification {
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px) saturate(180%);
        -webkit-backdrop-filter: blur(20px) saturate(180%);
        border: 1px solid rgba(255, 255, 255, 0.18);
        border-radius: 16px;
        padding: 14px 16px;
        color: #000000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
        font-size: 13px;
        box-shadow: 
          0 8px 32px rgba(0, 0, 0, 0.2),
          inset 0 1px 0 rgba(255, 255, 255, 0.2),
          inset 0 -1px 0 rgba(255, 255, 255, 0.1);
        pointer-events: auto;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      
      .darwin-notification::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      }
      
      .darwin-notification:hover {
        transform: translateY(-2px);
        background: rgba(255, 255, 255, 0.15);
        box-shadow: 
          0 12px 40px rgba(0, 0, 0, 0.3),
          inset 0 1px 0 rgba(255, 255, 255, 0.3),
          inset 0 -1px 0 rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.25);
      }
      
      .darwin-notification-header {
        display: flex;
        align-items: center;
        margin-bottom: 6px;
      }
      
      .darwin-notification-event-name {
        font-weight: 600;
        color: #000000;
        font-size: 14px;
        letter-spacing: -0.01em;
      }
      
      .darwin-notification-properties {
        margin-top: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(0, 0, 0, 0.15);
        font-size: 11px;
        color: rgba(0, 0, 0, 0.9);
        line-height: 1.5;
        max-height: 60px;
        overflow-y: auto;
      }
      
      .darwin-notification-property {
        display: flex;
        justify-content: space-between;
        gap: 12px;
        margin-bottom: 4px;
      }
      
      .darwin-notification-property-key {
        font-weight: 500;
        color: rgba(0, 0, 0, 0.95);
      }
      
      .darwin-notification-property-value {
        color: rgba(0, 0, 0, 0.85);
        text-align: right;
        word-break: break-word;
        max-width: 180px;
      }
      
      .darwin-notification-timestamp {
        margin-top: 6px;
        font-size: 10px;
        color: rgba(0, 0, 0, 0.7);
        text-align: right;
      }
    </style>
  `;
}

/**
 * Format event properties for display
 */
function formatPropertyValue(value: any): string {
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? '...' : '');
    } catch {
      return '[Object]';
    }
  }
  if (typeof value === 'string' && value.length > 30) {
    return value.substring(0, 30) + '...';
  }
  return String(value);
}

/**
 * Create a notification element for an analytics event
 */
function createNotificationElement(eventName: string, eventProperties?: Record<string, any>, position: string = 'top-left'): HTMLElement {
  const notification = document.createElement('div');
  notification.className = 'darwin-notification';
  
  // Get animation classes based on position
  const animations: Record<string, { slideIn: string; slideOut: string }> = {
    'top-right': { slideIn: 'darwin-notification-slide-in-right', slideOut: 'darwin-notification-slide-out-right' },
    'top-left': { slideIn: 'darwin-notification-slide-in-left', slideOut: 'darwin-notification-slide-out-left' },
    'bottom-right': { slideIn: 'darwin-notification-slide-in-right', slideOut: 'darwin-notification-slide-out-right' },
    'bottom-left': { slideIn: 'darwin-notification-slide-in-left', slideOut: 'darwin-notification-slide-out-left' },
  };
  const anim = animations[position] || animations['top-left'];
  notification.style.animation = `${anim.slideIn} 0.3s ease-out`;
  
  const timestamp = new Date().toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
  
  const properties = eventProperties || {};
  const propertyKeys = Object.keys(properties).filter(key => 
    key !== 'session_id' && key !== 'user_id' && key !== 'timestamp' && key !== 'page_name' && key !== 'event' && key !== 'scroll_position'
  );
  
  notification.innerHTML = `
    <div class="darwin-notification-header">
      <div class="darwin-notification-icon"></div>
      <div class="darwin-notification-event-name">${eventName}</div>
    </div>
    ${propertyKeys.length > 0 ? `
      <div class="darwin-notification-properties">
        ${propertyKeys.slice(0, 3).map(key => `
          <div class="darwin-notification-property">
            <span class="darwin-notification-property-key">${key}:</span>
            <span class="darwin-notification-property-value">${formatPropertyValue(properties[key])}</span>
          </div>
        `).join('')}
        ${propertyKeys.length > 3 ? `<div style="color: #64748b; font-size: 10px; margin-top: 4px;">+${propertyKeys.length - 3} more</div>` : ''}
      </div>
    ` : ''}
    <div class="darwin-notification-timestamp">${timestamp}</div>
  `;
  
  return notification;
}

/**
 * Inject analytics overlay into a browser page
 */
export async function injectAnalyticsOverlay(
  page: any,
  options: AnalyticsOverlayOptions = {}
): Promise<void> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  await page.evaluate((overlayHTML: string, opts: Required<AnalyticsOverlayOptions>) => {
    // Remove existing overlay if it exists
    const existingOverlay = document.getElementById('darwin-analytics-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create overlay container
    const overlayContainer = document.createElement('div');
    overlayContainer.innerHTML = overlayHTML;
    document.body.appendChild(overlayContainer);

    const overlay = document.getElementById('darwin-analytics-overlay');
    if (!overlay) return;

    // Store options on window for the notification function
    (window as any).__darwinAnalyticsOptions = opts;
    
    // Track session start time - try to get it from timer overlay, otherwise use current time
    let sessionStartTime = Date.now();
    try {
      // Check if timer overlay has already started by looking for the timer element
      const timer = document.getElementById('darwin-timer');
      if (timer) {
        // Timer exists, use current time as session start (timer was likely just started)
        sessionStartTime = Date.now();
      }
    } catch (e) {
      // Use current time as session start
      sessionStartTime = Date.now();
    }
    (window as any).__darwinSessionStartTime = sessionStartTime;
    
    // Helper function to format relative time (MM:SS:SSS)
    function formatRelativeTime(elapsedMs: number): string {
      const milliseconds = Math.floor(elapsedMs % 1000);
      const seconds = Math.floor((elapsedMs / 1000) % 60);
      const minutes = Math.floor(elapsedMs / 1000 / 60);
      
      const format = (num: number, pad: number = 2) => num.toString().padStart(pad, '0');
      return `${format(minutes)}:${format(seconds)}:${format(milliseconds, 3)}`;
    }
    
    // Helper function to get animation classes based on position
    function getAnimationClasses(position: string): { slideIn: string; slideOut: string } {
      const animations: Record<string, { slideIn: string; slideOut: string }> = {
        'top-right': { slideIn: 'darwin-notification-slide-in-right', slideOut: 'darwin-notification-slide-out-right' },
        'top-left': { slideIn: 'darwin-notification-slide-in-left', slideOut: 'darwin-notification-slide-out-left' },
        'bottom-right': { slideIn: 'darwin-notification-slide-in-right', slideOut: 'darwin-notification-slide-out-right' },
        'bottom-left': { slideIn: 'darwin-notification-slide-in-left', slideOut: 'darwin-notification-slide-out-left' },
      };
      return animations[position] || animations['bottom-right'];
    }

    // Intercept the trackEvent function
    const originalTrackEvent = (window as any).trackEvent;
    
    (window as any).showAnalyticsNotification = function(eventName: string, eventProperties?: Record<string, any>) {
      // Check if overlay exists
      const overlay = document.getElementById('darwin-analytics-overlay');
      if (!overlay) return;
      
      // Get options with safe fallbacks - use opts from closure or stored options or defaults
      const storedOptions = (window as any).__darwinAnalyticsOptions;
      const currentOptions = storedOptions || opts;
      
      // Safely extract values with defaults
      const position = (currentOptions?.position) || 'top-left';
      const maxNotifications = (currentOptions?.maxNotifications !== undefined) ? currentOptions.maxNotifications : 5;
      const autoDismissDelay = (currentOptions?.autoDismissDelay !== undefined) ? currentOptions.autoDismissDelay : 3000;
      
      // Get animation classes
      const animations: Record<string, { slideIn: string; slideOut: string }> = {
        'top-right': { slideIn: 'darwin-notification-slide-in-right', slideOut: 'darwin-notification-slide-out-right' },
        'top-left': { slideIn: 'darwin-notification-slide-in-left', slideOut: 'darwin-notification-slide-out-left' },
        'bottom-right': { slideIn: 'darwin-notification-slide-in-right', slideOut: 'darwin-notification-slide-out-right' },
        'bottom-left': { slideIn: 'darwin-notification-slide-in-left', slideOut: 'darwin-notification-slide-out-left' },
      };
      const anim = animations[position] || animations['top-left'];
      
      // Format property value helper
      function formatPropertyValue(value: any): string {
        if (value === null || value === undefined) return 'null';
        if (typeof value === 'object') {
          try {
            return JSON.stringify(value).substring(0, 50) + (JSON.stringify(value).length > 50 ? '...' : '');
          } catch {
            return '[Object]';
          }
        }
        if (typeof value === 'string' && value.length > 30) {
          return value.substring(0, 30) + '...';
        }
        return String(value);
      }
      
      // Create notification element
      const notification = document.createElement('div');
      notification.className = 'darwin-notification';
      notification.style.animation = `${anim.slideIn} 0.3s ease-out`;
      
      // Calculate relative timestamp from session start
      const sessionStart = (window as any).__darwinSessionStartTime || Date.now();
      const elapsed = Date.now() - sessionStart;
      
      // Format relative time (MM:SS:SSS)
      const formatRelativeTime = (elapsedMs: number): string => {
        const milliseconds = Math.floor(elapsedMs % 1000);
        const seconds = Math.floor((elapsedMs / 1000) % 60);
        const minutes = Math.floor(elapsedMs / 1000 / 60);
        const format = (num: number, pad: number = 2) => num.toString().padStart(pad, '0');
        return `${format(minutes)}:${format(seconds)}:${format(milliseconds, 3)}`;
      };
      
      const timestamp = formatRelativeTime(elapsed);
      
      const properties = eventProperties || {};
      const propertyKeys = Object.keys(properties).filter(key => 
        key !== 'session_id' && key !== 'user_id' && key !== 'timestamp' && key !== 'page_name' && key !== 'event' && key !== 'scroll_position'
      );
      
      notification.innerHTML = `
        <div class="darwin-notification-header">
          <div class="darwin-notification-event-name">${eventName}</div>
        </div>
        ${propertyKeys.length > 0 ? `
          <div class="darwin-notification-properties">
            ${propertyKeys.slice(0, 3).map(key => `
              <div class="darwin-notification-property">
                <span class="darwin-notification-property-key">${key}:</span>
                <span class="darwin-notification-property-value">${formatPropertyValue(properties[key])}</span>
              </div>
            `).join('')}
            ${propertyKeys.length > 3 ? `<div style="color: rgba(0, 0, 0, 0.7); font-size: 10px; margin-top: 4px;">+${propertyKeys.length - 3} more</div>` : ''}
          </div>
        ` : ''}
        <div class="darwin-notification-timestamp">${timestamp}</div>
      `;
      
      overlay.appendChild(notification);

      // Remove old notifications if we exceed max
      const notifications = overlay.querySelectorAll('.darwin-notification');
      if (notifications.length > maxNotifications) {
        const oldest = notifications[0] as HTMLElement;
        oldest.style.animation = `${anim.slideOut} 0.3s ease-in forwards`;
        setTimeout(() => {
          if (oldest.parentNode) {
            oldest.remove();
          }
        }, 300);
      }

      // Auto-dismiss after delay
      setTimeout(() => {
        if (notification.parentNode) {
          notification.style.animation = `${anim.slideOut} 0.3s ease-in forwards`;
          setTimeout(() => {
            if (notification.parentNode) {
              notification.remove();
            }
          }, 300);
        }
      }, autoDismissDelay);
    };

    // Hook into Amplitude's track function
    if ((window as any).amplitude) {
      const originalAmplitudeTrack = (window as any).amplitude.track;
      (window as any).amplitude.track = function(eventName: string, eventData?: any) {
        // Show notification if function exists
        if ((window as any).showAnalyticsNotification) {
          try {
            (window as any).showAnalyticsNotification(eventName, eventData);
          } catch (err) {
            // Silently fail if notification fails
          }
        }
        // Call original
        return originalAmplitudeTrack.call(this, eventName, eventData);
      };
    }

    // Intercept fetch calls to /api/events to catch trackEvent calls
    const originalFetch = window.fetch;
    (window as any).__originalFetch = originalFetch;
    
    window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      
      if (url.includes('/api/events') && init?.method === 'POST' && init?.body) {
        try {
          const bodyStr = typeof init.body === 'string' ? init.body : 
                         init.body instanceof Blob ? null :
                         (init.body as any)?.toString?.() || null;
          
          if (bodyStr) {
            try {
              const body = JSON.parse(bodyStr);
              if (body && body.event && (window as any).showAnalyticsNotification) {
                // Show notification for the event
                setTimeout(() => {
                  try {
                    (window as any).showAnalyticsNotification(body.event, body);
                  } catch (err) {
                    // Silently fail if notification fails
                  }
                }, 0);
              }
            } catch (parseError) {
              // Ignore parse errors
            }
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
      
      return originalFetch.call(this, input, init);
    };
  }, generateAnalyticsOverlayHTML(mergedOptions), mergedOptions);
}

/**
 * Show an analytics notification (called from intercepted trackEvent)
 */
export async function showAnalyticsNotification(
  page: any,
  eventName: string,
  eventProperties?: Record<string, any>
): Promise<void> {
  await page.evaluate((name: string, props?: Record<string, any>) => {
    if ((window as any).showAnalyticsNotification) {
      (window as any).showAnalyticsNotification(name, props);
    }
  }, eventName, eventProperties);
}

/**
 * Remove analytics overlay from a browser page
 */
export async function removeAnalyticsOverlay(page: any): Promise<void> {
  await page.evaluate(() => {
    const overlay = document.getElementById('darwin-analytics-overlay');
    if (overlay) {
      overlay.remove();
    }

    // Restore original functions if they were stored
    if ((window as any).__originalAmplitudeTrack) {
      (window as any).amplitude.track = (window as any).__originalAmplitudeTrack;
    }
    
    if ((window as any).__originalFetch) {
      window.fetch = (window as any).__originalFetch;
    }
    
    delete (window as any).showAnalyticsNotification;
    delete (window as any).__darwinAnalyticsOptions;
    delete (window as any).__originalFetch;
  });
}
