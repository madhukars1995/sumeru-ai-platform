import { config } from '../config/environment';

interface PollingJob {
  id: string;
  callback: () => Promise<void> | void;
  interval: number;
  lastRun: number;
  isRunning: boolean;
  retryCount: number;
  maxRetries: number;
}

class PollingManager {
  private jobs: Map<string, PollingJob> = new Map();
  private intervals: Map<string, number> = new Map();
  private isVisible = true;
  private globalLastCall = 0; // Track last API call globally

  constructor() {
    this.setupVisibilityListener();
  }

  private setupVisibilityListener() {
    if (typeof document !== 'undefined') {
      const handleVisibilityChange = () => {
        this.isVisible = !document.hidden;
        this.updatePollingState();
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);
      window.addEventListener('focus', () => { this.isVisible = true; this.updatePollingState(); });
      window.addEventListener('blur', () => { this.isVisible = false; this.updatePollingState(); });
    }
  }

  private updatePollingState() {
    if (this.isVisible) {
      this.resumeAll();
    } else {
      this.pauseAll();
    }
  }

  private pauseAll() {
    this.intervals.forEach((intervalId, jobId) => {
      clearInterval(intervalId);
      this.intervals.delete(jobId);
    });
  }

  private resumeAll() {
    this.jobs.forEach((job, jobId) => {
      if (!this.intervals.has(jobId)) {
        this.startJob(jobId);
      }
    });
  }

  private async executeJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job || job.isRunning) return;

    const now = Date.now();
    const timeSinceLastRun = now - job.lastRun;
    const timeSinceGlobalCall = now - this.globalLastCall;
    
    // Prevent excessive calls with multiple layers of protection
    const minInterval = config.performance.minPollingInterval;
    if (timeSinceLastRun < job.interval || timeSinceLastRun < minInterval || timeSinceGlobalCall < minInterval) {
      return;
    }

    job.isRunning = true;
    job.lastRun = now;
    this.globalLastCall = now; // Update global last call time

    try {
      await job.callback();
      job.retryCount = 0; // Reset retry count on success
    } catch (error) {
      job.retryCount++;
      console.warn(`Polling job ${jobId} failed (attempt ${job.retryCount}):`, error);
      
      if (job.retryCount >= job.maxRetries) {
        console.error(`Max retries reached for ${jobId}, stopping polling`);
        this.stopJob(jobId);
      }
    } finally {
      job.isRunning = false;
    }
  }

  private startJob(jobId: string) {
    const job = this.jobs.get(jobId);
    if (!job || this.intervals.has(jobId)) return;

    // Execute immediately only if enough time has passed
    const now = Date.now();
    const timeSinceGlobalCall = now - this.globalLastCall;
    if (timeSinceGlobalCall >= config.performance.minPollingInterval) {
      this.executeJob(jobId);
    }

    // Set up interval with longer intervals
    const intervalId = setInterval(() => {
      this.executeJob(jobId);
    }, Math.max(job.interval, config.performance.minPollingInterval));

    this.intervals.set(jobId, intervalId);
    
    // Debug logging
    if (import.meta.env.DEV) {
      console.log(`🔍 POLLING: Started job ${jobId} with ${job.interval}ms interval`);
    }
  }

  private stopJob(jobId: string) {
    const intervalId = this.intervals.get(jobId);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(jobId);
    }
    this.jobs.delete(jobId);
    
    // Debug logging
    if (import.meta.env.DEV) {
      console.log(`🔍 POLLING: Stopped job ${jobId}`);
    }
  }

  // Public API
  public registerJob(
    id: string,
    callback: () => Promise<void> | void,
    interval: number,
    maxRetries: number = 3
  ) {
    // Stop existing job if it exists
    this.stopJob(id);

    // Ensure minimum interval
    const adjustedInterval = Math.max(interval, config.performance.minPollingInterval);

    const job: PollingJob = {
      id,
      callback,
      interval: adjustedInterval,
      lastRun: 0,
      isRunning: false,
      retryCount: 0,
      maxRetries
    };

    this.jobs.set(id, job);

    // Start the job if visible
    if (this.isVisible) {
      this.startJob(id);
    }

    // Debug logging
    if (import.meta.env.DEV) {
      console.log(`🔍 POLLING: Registered job ${id} with ${adjustedInterval}ms interval`);
    }

    return () => this.stopJob(id); // Return cleanup function
  }

  public unregisterJob(id: string) {
    this.stopJob(id);
  }

  public triggerJob(id: string) {
    const job = this.jobs.get(id);
    if (job) {
      this.executeJob(id);
    }
  }

  public getJobStats() {
    return {
      totalJobs: this.jobs.size,
      activeIntervals: this.intervals.size,
      isVisible: this.isVisible,
      jobs: Array.from(this.jobs.keys()),
      globalLastCall: this.globalLastCall
    };
  }

  public clearAll() {
    this.jobs.forEach((_, jobId) => this.stopJob(jobId));
  }
}

// Singleton instance
export const pollingManager = new PollingManager();

// React hook for easy integration
export const usePollingManager = () => {
  return {
    registerJob: pollingManager.registerJob.bind(pollingManager),
    unregisterJob: pollingManager.unregisterJob.bind(pollingManager),
    triggerJob: pollingManager.triggerJob.bind(pollingManager),
    getStats: pollingManager.getJobStats.bind(pollingManager)
  };
}; 