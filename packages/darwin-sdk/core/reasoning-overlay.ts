/**
 * Reasoning Overlay Component
 * 
 * Injects a visual subtitle overlay into browser pages to display live agent reasoning.
 */

export interface ReasoningOverlayOptions {
  position?: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center';
  maxWidth?: number;
  fontSize?: number;
  lineHeight?: number;
  backgroundColor?: string;
  textColor?: string;
  padding?: number;
  borderRadius?: number;
  maxLines?: number;
  fadeDuration?: number;
}

const DEFAULT_OPTIONS: Required<ReasoningOverlayOptions> = {
  position: 'bottom-center',
  maxWidth: 800,
  fontSize: 16,
  lineHeight: 1.5,
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  textColor: '#000000',
  padding: 20,
  borderRadius: 16,
  maxLines: 3,
  fadeDuration: 150,
};

/**
 * Get CSS styles for reasoning position
 */
function getPositionStyles(position: string, maxWidth: number): { styles: string; transform: string } {
  const positions: Record<string, { bottom?: string; top?: string; left?: string; right?: string; transform?: string }> = {
    'bottom-center': { bottom: '40px', left: '50%', transform: 'translateX(-50%)' },
    'bottom-left': { bottom: '40px', left: '40px' },
    'bottom-right': { bottom: '40px', right: '40px' },
    'top-center': { top: '40px', left: '50%', transform: 'translateX(-50%)' },
  };

  const pos = positions[position] || positions['bottom-center'];
  const styles: string[] = [];
  
  if (pos.bottom !== undefined) styles.push(`bottom: ${pos.bottom};`);
  if (pos.top !== undefined) styles.push(`top: ${pos.top};`);
  if (pos.left !== undefined) styles.push(`left: ${pos.left};`);
  if (pos.right !== undefined) styles.push(`right: ${pos.right};`);
  
  styles.push(`max-width: ${maxWidth}px;`);
  styles.push(`width: auto;`);
  styles.push(`min-width: 200px;`);
  
  // Store transform separately for animation compatibility
  const transformValue = pos.transform || '';
  
  return { styles: styles.join(' '), transform: transformValue };
}

/**
 * Generate the reasoning overlay HTML and CSS
 */
function generateReasoningOverlayHTML(options: Required<ReasoningOverlayOptions>): string {
  const positionData = getPositionStyles(options.position, options.maxWidth);
  const baseTransform = positionData.transform;
  const isCenter = options.position.includes('center');
  const isBottom = options.position.includes('bottom');
  
  // Build transform for animations
  const fadeInTransform = isCenter 
    ? 'translateX(-50%) translateY(0)' 
    : 'translateY(0)';
  const fadeInFromTransform = isCenter
    ? `translateX(-50%) ${isBottom ? 'translateY(20px)' : 'translateY(-20px)'}`
    : (isBottom ? 'translateY(20px)' : 'translateY(-20px)');
  const fadeOutTransform = isCenter
    ? `translateX(-50%) ${isBottom ? 'translateY(20px)' : 'translateY(-20px)'}`
    : (isBottom ? 'translateY(20px)' : 'translateY(-20px)');

  return `
    <div id="darwin-reasoning-overlay" style="
      position: fixed;
      ${positionData.styles}
      ${baseTransform ? `transform: ${baseTransform};` : ''}
      background: ${options.backgroundColor};
      color: ${options.textColor};
      padding: ${options.padding}px;
      border-radius: ${options.borderRadius}px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
      font-size: ${options.fontSize}px;
      line-height: ${options.lineHeight};
      font-weight: 500;
      z-index: 999997;
      backdrop-filter: blur(20px) saturate(180%);
      -webkit-backdrop-filter: blur(20px) saturate(180%);
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: 
        0 8px 32px rgba(0, 0, 0, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.2),
        inset 0 -1px 0 rgba(255, 255, 255, 0.1);
      user-select: none;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      word-wrap: break-word;
      overflow-wrap: break-word;
      text-align: center;
      overflow: hidden;
      transition: all ${options.fadeDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
    ">
      <div id="darwin-reasoning-text" style="
        display: inline-block;
        max-width: 100%;
        margin: 0;
        position: relative;
        z-index: 1;
        word-wrap: break-word;
        overflow-wrap: break-word;
        text-align: center;
      "></div>
    </div>
    <style>
      #darwin-reasoning-overlay::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
        z-index: 2;
      }
      
      @keyframes darwin-reasoning-fade-in {
        from {
          opacity: 0;
          visibility: hidden;
          transform: ${fadeInFromTransform};
        }
        to {
          opacity: 1;
          visibility: visible;
          transform: ${fadeInTransform};
        }
      }
      
      @keyframes darwin-reasoning-fade-out {
        from {
          opacity: 1;
          visibility: visible;
          transform: ${fadeInTransform};
        }
        to {
          opacity: 0;
          visibility: hidden;
          transform: ${fadeOutTransform};
        }
      }
      
      @keyframes darwin-reasoning-text-update {
        0% {
          opacity: 0.7;
          transform: translateY(2px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes darwin-word-reveal {
        0% {
          opacity: 0;
          filter: blur(4px);
        }
        100% {
          opacity: 1;
          filter: blur(0px);
        }
      }
      
      #darwin-reasoning-overlay.show {
        opacity: 1;
        visibility: visible;
        animation: darwin-reasoning-fade-in ${options.fadeDuration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
      
      #darwin-reasoning-overlay.show #darwin-reasoning-text {
        animation: darwin-reasoning-text-update ${options.fadeDuration}ms cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      #darwin-reasoning-overlay .darwin-word {
        display: inline;
        margin-right: 0;
        opacity: 0;
        filter: blur(4px);
        animation: darwin-word-reveal 0.15s ease-out forwards;
        white-space: pre-wrap;
      }
      
      #darwin-reasoning-overlay .darwin-space {
        display: inline;
        margin-right: 0;
        white-space: pre;
      }
      
      #darwin-reasoning-overlay.hide {
        animation: darwin-reasoning-fade-out ${options.fadeDuration}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
      }
    </style>
  `;
}

/**
 * Inject reasoning overlay into a browser page
 */
export async function injectReasoningOverlay(
  page: any,
  options: ReasoningOverlayOptions = {}
): Promise<void> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

  await page.evaluate((overlayHTML: string, opts: Required<ReasoningOverlayOptions>) => {
    // Wait for body to be ready
    if (!document.body) {
      console.error('Document body not ready for reasoning overlay injection');
      return;
    }

    // Remove existing overlay if it exists
    const existingOverlay = document.getElementById('darwin-reasoning-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create overlay container
    const overlayContainer = document.createElement('div');
    overlayContainer.innerHTML = overlayHTML;
    document.body.appendChild(overlayContainer);

    // Expose function to update reasoning text with text generate effect
    (window as any).updateReasoningText = function(text: string) {
      try {
        const overlay = document.getElementById('darwin-reasoning-overlay');
        const textElement = document.getElementById('darwin-reasoning-text');
        
        if (!overlay || !textElement) {
          return; // Silently fail if elements don't exist
        }
        
        // Ensure text is a string and sanitize it
        const safeText = typeof text === 'string' ? text : String(text || '');
        
        if (safeText && safeText.trim()) {
          const trimmedText = safeText.trim();
          
          // If text is changing, trigger text generate effect
          if (textElement.textContent !== trimmedText) {
            // Remove show class briefly to trigger re-animation
            overlay.classList.remove('show', 'hide');
            void overlay.offsetHeight; // Force reflow
            
            // Clear existing content
            textElement.innerHTML = '';
            
            // Split text into words for the generate effect
            const words = trimmedText.split(/(\s+)/);
            const wordDelay = 20; // Very fast: 20ms per word
            let wordIndex = 0;
            
            // Create word spans with staggered animation
            words.forEach((word) => {
              if (word.trim()) {
                // Word with animation
                const span = document.createElement('span');
                span.textContent = word;
                span.className = 'darwin-word';
                span.style.animationDelay = (wordIndex * wordDelay) + 'ms';
                textElement.appendChild(span);
                wordIndex++;
              } else if (word.match(/\s+/)) {
                // Preserve whitespace
                const spaceSpan = document.createElement('span');
                spaceSpan.textContent = ' ';
                spaceSpan.className = 'darwin-space';
                textElement.appendChild(spaceSpan);
              }
            });
            
            // Add show class with fast transition
            requestAnimationFrame(() => {
              overlay.classList.add('show');
            });
          } else {
            // Text is the same, just ensure it's visible
            overlay.classList.remove('hide');
            overlay.classList.add('show');
          }
        } else {
          overlay.classList.remove('show');
          overlay.classList.add('hide');
          // Clear text after fade out
          setTimeout(() => {
            if (textElement) {
              textElement.innerHTML = '';
            }
          }, opts.fadeDuration || 150);
        }
      } catch (err) {
        // Silently handle any errors
        console.warn('Error in updateReasoningText:', err);
      }
    };
    
    // Verify the overlay was created
    const testOverlay = document.getElementById('darwin-reasoning-overlay');
    if (testOverlay) {
      console.log('Reasoning overlay injected successfully');
    } else {
      console.error('Reasoning overlay element NOT found in DOM after injection');
    }
  }, generateReasoningOverlayHTML(mergedOptions), mergedOptions);
  
  // Wait a bit to ensure injection completed
  await new Promise(resolve => setTimeout(resolve, 100));
}

/**
 * Update the reasoning text displayed in the overlay
 */
export async function updateReasoningText(
  page: any,
  text: string
): Promise<void> {
  try {
    if (!page) {
      return;
    }
    
    // Sanitize text to prevent evaluation errors
    // Replace any problematic characters and ensure it's a valid string
    const sanitizedText = (text || '').replace(/[\x00-\x1F\x7F-\x9F]/g, '').substring(0, 1000);
    
    await page.evaluate((reasoningText: string) => {
      try {
        // Check if we're in a valid context
        if (typeof window === 'undefined' || typeof document === 'undefined') {
          return;
        }
        
        if (typeof (window as any).updateReasoningText === 'function') {
          (window as any).updateReasoningText(reasoningText);
        }
      } catch (err) {
        // Silently handle errors in browser context
      }
    }, sanitizedText).catch(() => {
      // Silently handle evaluation errors
      // This can happen if the page context changes or is closed
    });
  } catch (error) {
    // Don't throw - just silently continue
    // This prevents breaking the agent execution if overlay update fails
  }
}

/**
 * Remove reasoning overlay from a browser page
 */
export async function removeReasoningOverlay(page: any): Promise<void> {
  await page.evaluate(() => {
    const overlay = document.getElementById('darwin-reasoning-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    delete (window as any).updateReasoningText;
  });
}
