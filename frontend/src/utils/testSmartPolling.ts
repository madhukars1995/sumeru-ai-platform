import { smartPollingManager } from './smartPollingManager';

export const testSmartPolling = () => {
  console.log('🧪 Testing Smart Polling System...');

  // Test 1: Register a test job
  let testCallCount = 0;
  smartPollingManager.registerJob(
    'test-job',
    async () => {
      testCallCount++;
      console.log(`✅ Test job executed (call #${testCallCount})`);
      
      // Simulate some work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Simulate occasional failures
      if (testCallCount % 5 === 0) {
        throw new Error('Simulated failure');
      }
    },
    5000, // 5 seconds
    'high',
    3
  );

  // Test 2: Register another job with different priority
  smartPollingManager.registerJob(
    'test-job-low',
    async () => {
      console.log('✅ Low priority test job executed');
      await new Promise(resolve => setTimeout(resolve, 50));
    },
    10000, // 10 seconds
    'low',
    2
  );

  // Test 3: Get stats after a delay
  setTimeout(() => {
    const stats = smartPollingManager.getStats();
    console.log('📊 Smart Polling Stats:', stats);
    
    // Test 4: Test adaptive mode toggle
    console.log('🔄 Testing adaptive mode toggle...');
    smartPollingManager.setAdaptiveMode(false);
    setTimeout(() => {
      smartPollingManager.setAdaptiveMode(true);
      console.log('✅ Adaptive mode tests completed');
    }, 1000);
    
  }, 15000);

  // Test 5: Clean up after 30 seconds
  setTimeout(() => {
    console.log('🧹 Cleaning up test jobs...');
    smartPollingManager.stopJob('test-job');
    smartPollingManager.stopJob('test-job-low');
    smartPollingManager.clearStats();
    console.log('✅ Smart polling tests completed');
  }, 30000);

  return {
    stopTests: () => {
      smartPollingManager.stopJob('test-job');
      smartPollingManager.stopJob('test-job-low');
      smartPollingManager.clearStats();
      console.log('🛑 Smart polling tests stopped');
    }
  };
};

// Auto-run tests in development
if (import.meta.env.DEV) {
  // Uncomment to run tests automatically
  // setTimeout(() => testSmartPolling(), 2000);
} 