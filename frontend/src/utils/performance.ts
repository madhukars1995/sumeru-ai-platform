import React from 'react';

// Performance optimization utilities

// Debounce function to limit how often a function can be called
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttle function to limit function execution rate
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Memoization helper for expensive calculations
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  resolver?: (...args: Parameters<T>) => string
): T {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = resolver ? resolver(...args) : JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

// Virtual scrolling helper
export function createVirtualScroller<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const totalHeight = items.length * itemHeight;
  const visibleCount = Math.ceil(containerHeight / itemHeight);
  
  return {
    getVisibleRange(scrollTop: number) {
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.min(start + visibleCount + overscan, items.length);
      const visibleStart = Math.max(0, start - overscan);
      
      return {
        start: visibleStart,
        end,
        items: items.slice(visibleStart, end),
        offsetY: visibleStart * itemHeight,
      };
    },
    totalHeight,
  };
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map();
  
  startTimer(name: string): () => void {
    const start = performance.now();
    return () => {
      const duration = performance.now() - start;
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      this.metrics.get(name)!.push(duration);
    };
  }
  
  getAverageTime(name: string): number {
    const times = this.metrics.get(name);
    if (!times || times.length === 0) return 0;
    return times.reduce((a, b) => a + b, 0) / times.length;
  }
  
  getMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    for (const [name, times] of this.metrics) {
      result[name] = {
        average: this.getAverageTime(name),
        count: times.length,
      };
    }
    return result;
  }
  
  clear(): void {
    this.metrics.clear();
  }
}

// Memory usage monitoring
export function getMemoryUsage(): { used: number; total: number; percentage: number } {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      used: memory.usedJSHeapSize,
      total: memory.totalJSHeapSize,
      percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
    };
  }
  return { used: 0, total: 0, percentage: 0 };
}

// React hook for performance tracking
export function usePerformanceTracking(componentName: string) {
  const renderStart = React.useRef(performance.now());
  
  React.useEffect(() => {
    const renderTime = performance.now() - renderStart.current;
    console.log(`${componentName} render time:`, renderTime.toFixed(2), 'ms');
  });
}

// Async operation with timeout
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
}

// Batch updates for React state
export function createBatchUpdater<T>(
  setState: React.Dispatch<React.SetStateAction<T>>,
  delay: number = 16
) {
  let timeout: ReturnType<typeof setTimeout>;
  let pendingUpdates: Array<React.SetStateAction<T>> = [];
  
  return (update: React.SetStateAction<T>) => {
    pendingUpdates.push(update);
    
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      if (pendingUpdates.length > 0) {
        setState((prev) => {
          let current = prev;
          for (const update of pendingUpdates) {
            current = typeof update === 'function' ? (update as any)(current) : update;
          }
          pendingUpdates = [];
          return current;
        });
      }
    }, delay);
  };
} 