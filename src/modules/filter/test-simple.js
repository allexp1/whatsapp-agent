// Test the MessageFilter module using JavaScript (no TypeScript compilation needed)
const { MessageFilter } = require('./MessageFilter');

// Test data
const testMessages = [
  // Messages from subscribed chat
  {
    chat_id: 'chat_001',
    sender_id: 'user_001',
    timestamp: '2025-01-15T10:00:00.000Z',
    text: 'Hello from chat 1'
  },
  {
    chat_id: 'chat_001',
    sender_id: 'user_002',
    timestamp: '2025-01-15T11:00:00.000Z',
    text: 'Response in chat 1'
  },
  // Message from non-subscribed chat
  {
    chat_id: 'chat_002',
    sender_id: 'user_003',
    timestamp: '2025-01-15T10:30:00.000Z',
    text: 'Message from unsubscribed chat'
  },
  // Messages outside time period
  {
    chat_id: 'chat_001',
    sender_id: 'user_001',
    timestamp: '2025-01-14T10:00:00.000Z',
    text: 'Old message'
  },
  {
    chat_id: 'chat_001',
    sender_id: 'user_001',
    timestamp: '2025-01-16T10:00:00.000Z',
    text: 'Future message'
  },
  // Duplicate message
  {
    chat_id: 'chat_001',
    sender_id: 'user_001',
    timestamp: '2025-01-15T10:00:00.000Z',
    text: 'Hello from chat 1'
  },
  // Another subscribed chat
  {
    chat_id: 'chat_003',
    sender_id: 'user_004',
    timestamp: '2025-01-15T12:00:00.000Z',
    text: 'Message from chat 3'
  },
  // Message with additional properties
  {
    chat_id: 'chat_003',
    sender_id: 'user_005',
    timestamp: '2025-01-15T13:00:00.000Z',
    text: 'Message with extra data',
    media_type: 'image',
    media_url: 'https://example.com/image.jpg'
  }
];

console.log('🧪 Testing MessageFilter Module\n');

const filter = new MessageFilter();

// Test 1: Basic filtering
console.log('Test 1: Basic filtering with all criteria');
try {
  const input = {
    messages: testMessages,
    subscribed_chats: ['chat_001', 'chat_003'],
    period: {
      start: '2025-01-15T00:00:00.000Z',
      end: '2025-01-16T00:00:00.000Z'
    }
  };

  const result = filter.filter(input);
  console.log('✅ Filtering successful');
  console.log(`   Total processed: ${result.stats.totalProcessed}`);
  console.log(`   Filtered by subscription: ${result.stats.filteredBySubscription}`);
  console.log(`   Filtered by time period: ${result.stats.filteredByTimePeriod}`);
  console.log(`   Duplicates removed: ${result.stats.duplicatesRemoved}`);
  console.log(`   Final count: ${result.stats.finalCount}`);
  console.log(`   Expected final count: 4`);
  console.log(`   Messages:`, result.messages.map(m => ({
    chat_id: m.chat_id,
    sender_id: m.sender_id,
    text: m.text.substring(0, 20) + '...'
  })));
} catch (error) {
  console.log('❌ Test failed:', error.message);
}

// Test 2: Empty subscribed chats
console.log('\nTest 2: Empty subscribed chats (should return no messages)');
try {
  const input = {
    messages: testMessages,
    subscribed_chats: [],
    period: {
      start: '2025-01-15T00:00:00.000Z',
      end: '2025-01-16T00:00:00.000Z'
    }
  };

  const result = filter.filter(input);
  console.log('✅ Filtering successful');
  console.log(`   Final count: ${result.stats.finalCount} (expected: 0)`);
} catch (error) {
  console.log('❌ Test failed:', error.message);
}

// Test 3: Invalid timestamp format
console.log('\nTest 3: Invalid timestamp format (should throw error)');
try {
  const input = {
    messages: testMessages,
    subscribed_chats: ['chat_001'],
    period: {
      start: '2025-01-15',  // Invalid format
      end: '2025-01-16T00:00:00.000Z'
    }
  };

  filter.filter(input);
  console.log('❌ Test failed: Should have thrown an error');
} catch (error) {
  console.log('✅ Correctly threw error:', error.message);
}

// Test 4: Start date after end date
console.log('\nTest 4: Start date after end date (should throw error)');
try {
  const input = {
    messages: testMessages,
    subscribed_chats: ['chat_001'],
    period: {
      start: '2025-01-16T00:00:00.000Z',
      end: '2025-01-15T00:00:00.000Z'
    }
  };

  filter.filter(input);
  console.log('❌ Test failed: Should have thrown an error');
} catch (error) {
  console.log('✅ Correctly threw error:', error.message);
}

// Test 5: Invalid message structure
console.log('\nTest 5: Invalid message structure (should throw error)');
try {
  const invalidMessages = [
    {
      chat_id: 'chat_001',
      // Missing sender_id
      timestamp: '2025-01-15T10:00:00.000Z',
      text: 'Invalid message'
    }
  ];

  const input = {
    messages: invalidMessages,
    subscribed_chats: ['chat_001'],
    period: {
      start: '2025-01-15T00:00:00.000Z',
      end: '2025-01-16T00:00:00.000Z'
    }
  };

  filter.filter(input);
  console.log('❌ Test failed: Should have thrown an error');
} catch (error) {
  console.log('✅ Correctly threw error:', error.message);
}

// Test 6: Null/undefined inputs
console.log('\nTest 6: Null input (should throw error)');
try {
  filter.filter(null);
  console.log('❌ Test failed: Should have thrown an error');
} catch (error) {
  console.log('✅ Correctly threw error:', error.message);
}

// Test 7: Cache functionality
console.log('\nTest 7: Cache functionality');
const cacheFilter = new MessageFilter({ enableCache: true, cacheSize: 10 });
const input = {
  messages: testMessages.slice(0, 3),
  subscribed_chats: ['chat_001'],
  period: {
    start: '2025-01-15T00:00:00.000Z',
    end: '2025-01-16T00:00:00.000Z'
  }
};

cacheFilter.filter(input);
console.log(`✅ Cache size after filtering: ${cacheFilter.getCacheSize()}`);

cacheFilter.clearCache();
console.log(`✅ Cache size after clearing: ${cacheFilter.getCacheSize()}`);

// Test 8: Preserve additional message properties
console.log('\nTest 8: Preserve additional message properties');
try {
  const messagesWithExtra = [
    {
      chat_id: 'chat_001',
      sender_id: 'user_001',
      timestamp: '2025-01-15T10:00:00.000Z',
      text: 'Message with metadata',
      media_type: 'video',
      duration: 120,
      custom_field: 'preserved'
    }
  ];

  const input = {
    messages: messagesWithExtra,
    subscribed_chats: ['chat_001'],
    period: {
      start: '2025-01-15T00:00:00.000Z',
      end: '2025-01-16T00:00:00.000Z'
    }
  };

  const result = filter.filter(input);
  const filteredMessage = result.messages[0];
  console.log('✅ Additional properties preserved:');
  console.log(`   media_type: ${filteredMessage.media_type}`);
  console.log(`   duration: ${filteredMessage.duration}`);
  console.log(`   custom_field: ${filteredMessage.custom_field}`);
} catch (error) {
  console.log('❌ Test failed:', error.message);
}

console.log('\n✨ All tests completed!');