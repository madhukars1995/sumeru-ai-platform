// Test script to check all APIs
const API_BASE_URL = 'http://localhost:8001';

async function testAPI(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`✅ ${method} ${endpoint}:`, data);
    return { success: true, data };
  } catch (error) {
    console.log(`❌ ${method} ${endpoint}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testAllAPIs() {
  console.log('🧪 Testing all APIs...\n');
  
  // Test basic endpoints
  await testAPI('/');
  await testAPI('/api/chat/messages');
  await testAPI('/api/team');
  await testAPI('/api/files');
  await testAPI('/api/credits');
  await testAPI('/api/quotas');
  await testAPI('/api/model');
  await testAPI('/api/models/available');
  
  // Test sending a message
  await testAPI('/api/chat/messages', 'POST', {
    sender: 'Test User',
    message: 'Hello, this is a test message!',
    avatar: '👤',
    message_type: 'user'
  });
  
  console.log('\n🎯 API Testing Complete!');
}

// Run the tests
testAllAPIs(); 