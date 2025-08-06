import { config } from '../config/environment';

interface SmartPollingJob {
  id: string;
  callback: () => Promise<void>;
  interval: number;
  lastRun: number;
  isRunning: boolean;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
  isActive: boolean;
  consecutiveFailures: number;
  adaptiveInterval: number;
}

interface PollingStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageResponseTime: number;
  lastCallTime: number;
}

class SmartPollingManager {
  private jobs: Map<string, SmartPollingJob> = new Map();
  private intervals: Map<string, number> = new Map();
  private isVisible = true;
  private globalLastCall = 0;
  private stats: Map<string, PollingStats> = new Map();
  private adaptiveMode = true;
  private maxConcurrentJobs = 2;

  constructor() {
    this.setupVisibilityListener();
    this.startGlobalThrottle();
  }

  private setupVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isVisible = !document.hidden;
        if (this.isVisible) {
          this.resumeAll();
        } else {
          this.pauseAll();
        }
      });
    }
  }

  private startGlobalThrottle() {
    // Global throttle to prevent API spam
    setInterval(() => {
      const now = Date.now();
      if (now - this.globalLastCall < config.performance.minPollingInterval) {
        return;
      }
      
      // Execute one job at a time to prevent overwhelming the server
      this.executeNextJob();
    }, config.performance.minPollingInterval);
  }

  private executeNextJob() {
    const now = Date.now();
    const availableJobs = Array.from(this.jobs.values())
      .filter(job => job.isActive && !job.isRunning)
      .filter(job => now - job.lastRun >= job.adaptiveInterval)
      .sort((a, b) => {
        // Sort by priority first, then by time since last run
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const aPriority = priorityOrder[a.priority];
        const bPriority = priorityOrder[b.priority];
        
        if (aPriority !== bPriority) {
          return bPriority - aPriority;
        }
        
        return (now - a.lastRun) - (now - b.lastRun);
      });

    if (availableJobs.length === 0) return;

    const job = availableJobs[0];
    this.executeJob(job.id);
  }

  private async executeJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job || job.isRunning) return;

    const now = Date.now();
    const timeSinceGlobalCall = now - this.globalLastCall;
    
    // Prevent excessive calls
    if (timeSinceGlobalCall < config.performance.minPollingInterval) {
      return;
    }

    job.isRunning = true;
    job.lastRun = now;
    this.globalLastCall = now;

    const startTime = performance.now();
    const stats = this.stats.get(jobId) || {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageResponseTime: 0,
      lastCallTime: 0
    };

    try {
      await job.callback();
      
      // Update success stats
      const responseTime = performance.now() - startTime;
      stats.totalCalls++;
      stats.successfulCalls++;
      stats.averageResponseTime = (stats.averageResponseTime * (stats.totalCalls - 1) + responseTime) / stats.totalCalls;
      stats.lastCallTime = now;
      job.consecutiveFailures = 0;
      
      // Adaptive interval adjustment for successful calls
      if (this.adaptiveMode && responseTime < 1000) {
        job.adaptiveInterval = Math.min(job.adaptiveInterval * 1.1, job.interval);
      }
      
    } catch (error) {
      // Update failure stats
      stats.totalCalls++;
      stats.failedCalls++;
      stats.lastCallTime = now;
      job.consecutiveFailures++;
      
      console.warn(`Smart polling job ${jobId} failed (attempt ${job.retryCount + 1}):`, error);
      
      // Adaptive interval adjustment for failures
      if (this.adaptiveMode) {
        job.adaptiveInterval = Math.min(job.adaptiveInterval * 1.5, job.interval * 2);
      }
      
      job.retryCount++;
      if (job.retryCount >= job.maxRetries) {
        console.error(`Max retries reached for ${jobId}, pausing job`);
        job.isActive = false;
      }
    } finally {
      job.isRunning = false;
      this.stats.set(jobId, stats);
    }
  }

  registerJob(
    id: string,
    callback: () => Promise<void>,
    interval: number,
    priority: 'high' | 'medium' | 'low' = 'medium',
    maxRetries: number = 3
  ) {
    // Clean up existing job if it exists
    this.stopJob(id);

    const job: SmartPollingJob = {
      id,
      callback,
      interval,
      lastRun: 0,
      isRunning: false,
      retryCount: 0,
      maxRetries,
      priority,
      isActive: true,
      consecutiveFailures: 0,
      adaptiveInterval: interval
    };

    this.jobs.set(id, job);
    
    // Initialize stats
    this.stats.set(id, {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      averageResponseTime: 0,
      lastCallTime: 0
    });

    console.log(`Smart polling job registered: ${id} (${priority} priority, ${interval}ms interval)`);
  }

  stopJob(id: string) {
    const job = this.jobs.get(id);
    if (job) {
      job.isActive = false;
      console.log(`Smart polling job stopped: ${id}`);
    }
  }

  pauseAll() {
    this.jobs.forEach(job => {
      job.isActive = false;
    });
    console.log('All smart polling jobs paused');
  }

  resumeAll() {
    this.jobs.forEach(job => {
      job.isActive = true;
    });
    console.log('All smart polling jobs resumed');
  }

  getStats() {
    const globalStats = {
      totalJobs: this.jobs.size,
      activeJobs: Array.from(this.jobs.values()).filter(j => j.isActive).length,
      runningJobs: Array.from(this.jobs.values()).filter(j => j.isRunning).length,
      globalLastCall: this.globalLastCall,
      adaptiveMode: this.adaptiveMode
    };

    const jobStats = Array.from(this.jobs.entries()).map(([id, job]) => ({
      id,
      priority: job.priority,
      isActive: job.isActive,
      isRunning: job.isRunning,
      consecutiveFailures: job.consecutiveFailures,
      adaptiveInterval: job.adaptiveInterval,
      stats: this.stats.get(id)
    }));

    return { globalStats, jobStats };
  }

  setAdaptiveMode(enabled: boolean) {
    this.adaptiveMode = enabled;
    console.log(`Smart polling adaptive mode: ${enabled ? 'enabled' : 'disabled'}`);
  }

  clearStats() {
    this.stats.clear();
    console.log('Smart polling stats cleared');
  }
}

export const smartPollingManager = new SmartPollingManager();

// React hook for using the smart polling manager
export const useSmartPolling = () => {
  return {
    registerJob: smartPollingManager.registerJob.bind(smartPollingManager),
    stopJob: smartPollingManager.stopJob.bind(smartPollingManager),
    getStats: smartPollingManager.getStats.bind(smartPollingManager),
    setAdaptiveMode: smartPollingManager.setAdaptiveMode.bind(smartPollingManager),
    clearStats: smartPollingManager.clearStats.bind(smartPollingManager)
  };
}; 