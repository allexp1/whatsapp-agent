// Demonstration of the MessageFilter module functionality
// This file shows how to use the filter module and demonstrates its capabilities

console.log('=== SchoolChatSummarizer Message Filter Demo ===\n');

// Since we're in a CommonJS environment, we'll demonstrate the module structure
// In a real implementation, this would be imported from the compiled TypeScript

// Mock implementation to demonstrate the logic
class MessageFilter {
  constructor(options = {}) {
    this.options = {
      enableCache: true,
      cacheSize: 1000,
      ...options
    };
    this.cache = new Map();
  }

  filter(input) {
    // Validate input
    this.validateInput(input);

    const stats = {
      totalProcessed: 0,
      filteredBySubscription: 0,
      filteredByTimePeriod: 0,
      duplicatesRemoved: 0,
      finalCount: 0
    };

    const { messages, subscribed_chats, period } = input;
    stats.totalProcessed = messages.length;

    // Create a Set for faster subscription lookups
    const subscribedChatsSet = new Set(subscribed_chats);

    // Filter by subscription
    const subscribedMessages = messages.filter(message => {
      const isSubscribed = subscribedChatsSet.has(message.chat_id);
      if (!isSubscribed) {
        stats.filteredBySubscription++;
      }
      return isSubscribed;
    });

    // Filter by time period
    const timeFilteredMessages = subscribedMessages.filter(message => {
      const inPeriod = this.isMessageInPeriod(message, period);
      if (!inPeriod) {
        stats.filteredByTimePeriod++;
      }
      return inPeriod;
    });

    // Remove duplicates
    const uniqueMessages = this.removeDuplicates(timeFilteredMessages);
    stats.duplicatesRemoved = timeFilteredMessages.length - uniqueMessages.length;
    stats.finalCount = uniqueMessages.length;

    return {
      messages: uniqueMessages,
      stats
    };
  }

  validateInput(input) {
    if (!input) {
      throw new Error('Filter input cannot be null or undefined');
    }

    if (!Array.isArray(input.messages)) {
      throw new Error('Messages must be an array');
    }

    if (!Array.isArray(input.subscribed_chats)) {
      throw new Error('Subscribed chats must be an array');
    }

    if (!input.period || typeof input.period !== 'object') {
      throw new Error('Period must be an object with start and end properties');
    }

    if (!this.isValidTimestamp(input.period.start)) {
      throw new Error('Period start must be a valid ISO-8601 timestamp');
    }

    if (!this.isValidTimestamp(input.period.end)) {
      throw new Error('Period end must be a valid ISO-8601 timestamp');
    }

    const startDate = new Date(input.period.start);
    const endDate = new Date(input.period.end);

    if (startDate >= endDate) {
      throw new Error('Period start must be before period end');
    }

    // Validate message structure
    for (const message of input.messages) {
      if (!message || typeof message !== 'object') {
        throw new Error('Each message must be an object');
      }

      if (!message.chat_id || typeof message.chat_id !== 'string') {
        throw new Error('Each message must have a valid chat_id string');
      }

      if (!message.sender_id || typeof message.sender_id !== 'string') {
        throw new Error('Each message must have a valid sender_id string');
      }

      if (!message.timestamp || !this.isValidTimestamp(message.timestamp)) {
        throw new Error('Each message must have a valid ISO-8601 timestamp');
      }

      if (typeof message.text !== 'string') {
        throw new Error('Each message must have a text property of type string');
      }
    }
  }

  isValidTimestamp(timestamp) {
    if (!timestamp || typeof timestamp !== 'string') {
      return false;
    }

    const date = new Date(timestamp);
    return !isNaN(date.getTime()) && date.toISOString() === timestamp;
  }

  isMessageInPeriod(message, period) {
    const messageDate = new Date(message.timestamp);
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);

    return messageDate >= startDate && messageDate < endDate;
  }

  removeDuplicates(messages) {
    const seen = new Set();
    const uniqueMessages = [];

    for (const message of messages) {
      const key = this.getMessageKey(message);
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMessages.push(message);
      }
    }

    return uniqueMessages;
  }

  getMessageKey(message) {
    const key = `${message.chat_id}:${message.sender_id}:${message.timestamp}:${message.text}`;
    
    // Use cache if enabled
    if (this.options.enableCache && this.cache.size < this.options.cacheSize) {
      this.cache.set(key, true);
    }
    
    return key;
  }

  clearCache() {
    this.cache.clear();
  }

  getCacheSize() {
    return this.cache.size;
  }
}

// Demo usage
const filter = new MessageFilter();

// Sample messages
const sampleMessages = [
  {
    chat_id: 'school_parents_chat',
    sender_id: 'parent_001',
    timestamp: '2025-01-19T08:00:00.000Z',
    text: 'Good morning! Does anyone know if school is open today?'
  },
  {
    chat_id: 'school_parents_chat',
    sender_id: 'parent_002',
    timestamp: '2025-01-19T08:05:00.000Z',
    text: 'Yes, school is open. Regular schedule.'
  },
  {
    chat_id: 'school_parents_chat',
    sender_id: 'parent_003',
    timestamp: '2025-01-19T08:10:00.000Z',
    text: 'Thanks! My child forgot their lunch box.'
  },
  {
    chat_id: 'sports_team_chat',
    sender_id: 'coach_001',
    timestamp: '2025-01-19T08:15:00.000Z',
    text: 'Practice at 4 PM today. Bring water bottles!'
  },
  {
    chat_id: 'school_parents_chat',
    sender_id: 'parent_001',
    timestamp: '2025-01-19T14:00:00.000Z',
    text: 'Reminder: Parent-teacher meeting tomorrow at 6 PM'
  },
  // Duplicate message (same content from same person at same time)
  {
    chat_id: 'school_parents_chat',
    sender_id: 'parent_001',
    timestamp: '2025-01-19T08:00:00.000Z',
    text: 'Good morning! Does anyone know if school is open today?'
  },
  // Old message (outside time period)
  {
    chat_id: 'school_parents_chat',
    sender_id: 'parent_004',
    timestamp: '2025-01-18T10:00:00.000Z',
    text: 'Yesterday\'s homework was challenging!'
  }
];

// Filter configuration
const filterInput = {
  messages: sampleMessages,
  subscribed_chats: ['school_parents_chat'], // Only interested in school chat
  period: {
    start: '2025-01-19T00:00:00.000Z',
    end: '2025-01-20T00:00:00.000Z'
  }
};

console.log('Input Configuration:');
console.log('- Total messages:', sampleMessages.length);
console.log('- Subscribed chats:', filterInput.subscribed_chats);
console.log('- Time period: Jan 19, 2025 (00:00 - 24:00 UTC)');
console.log('\n');

// Apply filter
const result = filter.filter(filterInput);

console.log('Filter Results:');
console.log('- Total processed:', result.stats.totalProcessed);
console.log('- Filtered by subscription:', result.stats.filteredBySubscription);
console.log('- Filtered by time period:', result.stats.filteredByTimePeriod);
console.log('- Duplicates removed:', result.stats.duplicatesRemoved);
console.log('- Final message count:', result.stats.finalCount);
console.log('\n');

console.log('Filtered Messages:');
result.messages.forEach((msg, index) => {
  console.log(`\n${index + 1}. [${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.sender_id}:`);
  console.log(`   "${msg.text}"`);
});

console.log('\n=== Demo Complete ===');

// Export for use in other modules
module.exports = { MessageFilter };