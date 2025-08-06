import { config } from '../config/environment';

interface PollingDebugInfo {
  component: string;
  interval: number;
  timestamp: number;
  stack: string;
}

class PollingDebugger {
  private static instance: PollingDebugger;
  private intervals: Map<number, PollingDebugInfo> = new Map();
  private originalSetInterval: typeof setInterval;
  private originalClearInterval: typeof clearInterval;
  private isEnabled = false;

  constructor() {
    this.originalSetInterval = window.setInterval;
    this.originalClearInterval = window.clearInterval;
  }

  static getInstance(): PollingDebugger {
    if (!PollingDebugger.instance) {
      PollingDebugger.instance = new PollingDebugger();
    }
    return PollingDebugger.instance;
  }

  enable() {
    if (this.isEnabled) return;
    
    this.isEnabled = true;
    
    // Override setInterval
    window.setInterval = ((callback: TimerHandler, delay: number, ...args: any[]) => {
      const intervalId = this.originalSetInterval(callback, delay, ...args);
      
      const stack = new Error().stack || '';
      const component = this.extractComponentFromStack(stack);
      
      this.intervals.set(intervalId, {
        component,
        interval: delay,
        timestamp: Date.now(),
        stack
      });
      
      // Only log in development and for short intervals (likely polling)
      if (import.meta.env.DEV && delay < 10000) {
        console.warn(`🔍 POLLING DEBUG: setInterval called by ${component} with ${delay}ms delay`);
      }
      
      return intervalId;
    }) as typeof setInterval;
    
    // Override clearInterval
    window.clearInterval = ((intervalId: number | undefined) => {
      if (intervalId !== undefined) {
        const info = this.intervals.get(intervalId);
        if (info) {
          this.intervals.delete(intervalId);
        }
      }
      
      return this.originalClearInterval(intervalId);
    }) as typeof clearInterval;
    
    if (import.meta.env.DEV) {
      console.log('🔍 PollingDebugger enabled - tracking all setInterval calls');
    }
  }

  disable() {
    if (!this.isEnabled) return;
    
    this.isEnabled = false;
    window.setInterval = this.originalSetInterval;
    window.clearInterval = this.originalClearInterval;
    
    console.log('🔍 PollingDebugger disabled');
  }

  private extractComponentFromStack(stack: string): string {
    const lines = stack.split('\n');
    for (const line of lines) {
      if (line.includes('.tsx') || line.includes('.ts')) {
        const match = line.match(/at\s+\w+\s+\((.+\.tsx?):\d+:\d+\)/);
        if (match) {
          const filePath = match[1];
          const fileName = filePath.split('/').pop()?.replace('.tsx', '').replace('.ts', '') || 'unknown';
          return fileName;
        }
      }
    }
    return 'unknown';
  }

  getActiveIntervals(): PollingDebugInfo[] {
    return Array.from(this.intervals.values());
  }

  getStats() {
    const intervals = this.getActiveIntervals();
    const byComponent = intervals.reduce((acc, info) => {
      acc[info.component] = (acc[info.component] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      totalActive: intervals.length,
      byComponent,
      intervals: intervals.map(info => ({
        component: info.component,
        interval: info.interval,
        age: Date.now() - info.timestamp
      }))
    };
  }

  clearAll() {
    this.intervals.forEach((info, id) => {
      console.warn(`🔍 POLLING DEBUG: Force clearing interval from ${info.component}`);
      this.originalClearInterval(id);
    });
    this.intervals.clear();
  }
}

export const pollingDebugger = PollingDebugger.getInstance();

// Temporarily disable auto-enabling to avoid startup issues
// if (import.meta.env.DEV) {
//   // Delay enabling to avoid startup issues
//   setTimeout(() => {
//     pollingDebugger.enable();
//   }, 2000);
// } 