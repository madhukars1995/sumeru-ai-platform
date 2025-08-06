// Environment Configuration
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001',
    timeout: 10000,
    retryAttempts: 3,
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debugMode: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
    realTimeUpdates: import.meta.env.VITE_ENABLE_REALTIME_UPDATES !== 'false',
  },

  // UI Configuration
  ui: {
    theme: import.meta.env.VITE_DEFAULT_THEME || 'dark',
    animations: import.meta.env.VITE_ENABLE_ANIMATIONS !== 'false',
    pollingIntervals: {
      agents: 30000, // 30 seconds (reasonable for real-time updates)
      tasks: 60000,  // 1 minute (for task status updates)
      files: 120000, // 2 minutes (for file changes)
      conversations: 30000, // 30 seconds (for conversation updates)
      analytics: 300000, // 5 minutes (for analytics updates)
    },
  },

  // Development Settings
  dev: {
    mode: import.meta.env.DEV,
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
    mockData: import.meta.env.VITE_USE_MOCK_DATA === 'true',
  },

  // Performance Settings
  performance: {
    maxConcurrentRequests: 2, // Reduced to prevent overwhelming
    requestDebounceMs: 500, // Reduced for better responsiveness
    cacheExpiryMs: 5 * 60 * 1000, // 5 minutes (reasonable cache time)
    minPollingInterval: 10000, // 10 seconds minimum between any API calls
  },
} as const;

// Type-safe config access
export type Config = typeof config; 