import { useEffect, useRef, useCallback } from 'react';
import { config } from '../config/environment';

interface UseSmartPollingOptions {
  interval: number;
  enabled?: boolean;
  immediate?: boolean;
  maxRetries?: number;
}

export const useSmartPolling = (
  callback: () => Promise<void> | void,
  options: UseSmartPollingOptions
) => {
  const { interval, enabled = true, immediate = true, maxRetries = 3 } = options;
  const intervalRef = useRef<number>();
  const retryCountRef = useRef(0);
  const isVisibleRef = useRef(true);
  const lastCallRef = useRef(0);

  // Check if component is visible
  const checkVisibility = useCallback(() => {
    if (typeof document !== 'undefined') {
      isVisibleRef.current = !document.hidden;
    }
  }, []);

  // Throttle function to prevent excessive calls
  const throttledCallback = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallRef.current;
    
    // Prevent calls more frequent than 5 seconds
    if (timeSinceLastCall < 5000) {
      return;
    }

    try {
      await callback();
      retryCountRef.current = 0; // Reset retry count on success
      lastCallRef.current = now;
    } catch (error) {
      retryCountRef.current++;
      console.warn(`Polling callback failed (attempt ${retryCountRef.current}):`, error);
      
      // Stop polling after max retries
      if (retryCountRef.current >= maxRetries) {
        console.error('Max retries reached, stopping polling');
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = undefined;
        }
      }
    }
  }, [callback, maxRetries]);

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      return;
    }

    // Set up visibility listener
    const handleVisibilityChange = () => {
      checkVisibility();
      
      if (isVisibleRef.current) {
        // Resume polling when visible
        if (!intervalRef.current) {
          throttledCallback();
          intervalRef.current = setInterval(throttledCallback, interval);
        }
      } else {
        // Pause polling when hidden
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = undefined;
        }
      }
    };

    // Initial setup
    checkVisibility();
    
    if (immediate && isVisibleRef.current) {
      throttledCallback();
    }

    if (isVisibleRef.current) {
      intervalRef.current = setInterval(throttledCallback, interval);
    }

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);
    window.addEventListener('blur', handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = undefined;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, [enabled, immediate, interval, throttledCallback, checkVisibility]);

  // Manual trigger function
  const trigger = useCallback(() => {
    throttledCallback();
  }, [throttledCallback]);

  return { trigger };
}; 