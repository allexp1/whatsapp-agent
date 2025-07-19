#!/usr/bin/env node

/**
 * JavaScript test runner for SchoolChatSummarizer
 * Uses the JavaScript implementation for testing
 */

const { SchoolChatSummarizer } = require('../index.js');

// Test framework
let passedTests = 0;
let failedTests = 0;
let currentTest = '';

const test = (name, fn) => {
  currentTest = name;
  try {
    fn();
    console.log('\x1b[32m✓\x1b[0m', name);
    passedTests++;
  } catch (error) {
    console.log('\x1b[31m✗\x1b[0m', name);
    console.log('  Error:', error.message);
    failedTests++;
  }
};

const expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
  },
  toEqual: (expected) => {
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
    }
  },
  toBeGreaterThan: (expected) => {
    if (!(actual > expected)) {
      throw new Error(`Expected ${actual} to be greater than ${expected}`);
    }
  },
  toContain: (expected) => {
    if (!actual.includes(expected)) {
      throw new Error(`Expected "${actual}" to contain "${expected}"`);
    }
  },
  toThrow: () => {
    let threw = false;
    try {
      actual();
    } catch (e) {
      threw = true;
    }
    if (!threw) {
      throw new Error('Expected function to throw an error');
    }
  }
});

console.log('=== Running SchoolChatSummarizer Tests ===\n');

// Test 1: Basic functionality
test('should process messages and return correct format', async () => {
  const summarizer = new SchoolChatSummarizer();
  const input = {
    messages: [
      {
        chat_id: 'class_5a',
        sender_id: 'teacher1',
        timestamp: new Date().toISOString(),
        text: 'Homework: Complete exercises 1-10 on page 42'
      }
    ],
    subscribed_chats: ['class_5a'],
    period: {
      start: new Date(Date.now() - 86400000).toISOString(),
      end: new Date(Date.now() + 86400000).toISOString()
    }
  };
  
  const result = await summarizer.process(input);
  expect(result.period).toEqual(input.period);
  expect(result.extracted_items.length).toBe(1);
  expect(result.extracted_items[0].type).toBe('homework');
});

// Test 2: Subscription filtering
test('should filter out messages from non-subscribed chats', async () => {
  const summarizer = new SchoolChatSummarizer();
  const input = {
    messages: [
      {
        chat_id: 'class_5a',
        sender_id: 'teacher1',
        timestamp: new Date().toISOString(),
        text: 'Math homework due tomorrow'
      },
      {
        chat_id: 'class_6b',
        sender_id: 'teacher2',
        timestamp: new Date().toISOString(),
        text: 'Science project due Friday'
      }
    ],
    subscribed_chats: ['class_5a'],
    period: {
      start: new Date(Date.now() - 86400000).toISOString(),
      end: new Date(Date.now() + 86400000).toISOString()
    }
  };
  
  const result = await summarizer.process(input);
  expect(result.extracted_items.length).toBe(1);
  expect(result.extracted_items[0].chat_id).toBe('class_5a');
});

// Test 3: Time period filtering
test('should filter messages by time period', async () => {
  const summarizer = new SchoolChatSummarizer();
  const now = Date.now();
  const input = {
    messages: [
      {
        chat_id: 'class_5a',
        sender_id: 'teacher1',
        timestamp: new Date(now - 100000).toISOString(), // Recent
        text: 'Homework for today'
      },
      {
        chat_id: 'class_5a',
        sender_id: 'teacher1',
        timestamp: new Date(now - 172800000).toISOString(), // 2 days ago
        text: 'Old homework'
      }
    ],
    subscribed_chats: ['class_5a'],
    period: {
      start: new Date(now - 86400000).toISOString(), // 24 hours ago
      end: new Date(now).toISOString()
    }
  };
  
  const result = await summarizer.process(input);
  expect(result.extracted_items.length).toBe(1);
  expect(result.extracted_items[0].content).toContain('today');
});

// Test 4: Message classification
test('should correctly classify different message types', async () => {
  const summarizer = new SchoolChatSummarizer();
  const input = {
    messages: [
      {
        chat_id: 'class_5a',
        sender_id: 'teacher1',
        timestamp: new Date().toISOString(),
        text: 'Homework: Read chapter 5'
      },
      {
        chat_id: 'class_5a',
        sender_id: 'teacher2',
        timestamp: new Date().toISOString(),
        text: 'PE class cancelled today'
      },
      {
        chat_id: 'class_5a',
        sender_id: 'principal',
        timestamp: new Date().toISOString(),
        text: 'Reminder: Field trip permission slips due Friday'
      }
    ],
    subscribed_chats: ['class_5a'],
    period: {
      start: new Date(Date.now() - 86400000).toISOString(),
      end: new Date(Date.now() + 86400000).toISOString()
    }
  };
  
  const result = await summarizer.process(input);
  expect(result.extracted_items.length).toBe(3);
  
  const types = result.extracted_items.map(item => item.type);
  expect(types).toContain('homework');
  expect(types).toContain('schedule_change');
  expect(types).toContain('announcement');
});

// Test 5: Empty input handling
test('should handle empty messages array', async () => {
  const summarizer = new SchoolChatSummarizer();
  const input = {
    messages: [],
    subscribed_chats: ['class_5a'],
    period: {
      start: new Date(Date.now() - 86400000).toISOString(),
      end: new Date().toISOString()
    }
  };
  
  const result = await summarizer.process(input);
  expect(result.extracted_items.length).toBe(0);
});

// Test 6: Invalid input validation
test('should throw error for missing messages array', async () => {
  const summarizer = new SchoolChatSummarizer();
  const input = {
    subscribed_chats: ['class_5a'],
    period: {
      start: new Date(Date.now() - 86400000).toISOString(),
      end: new Date().toISOString()
    }
  };
  
  expect(async () => await summarizer.process(input)).toThrow();
});

// Test 7: Hebrew message support
test('should support Hebrew messages', async () => {
  const summarizer = new SchoolChatSummarizer();
  const input = {
    messages: [
      {
        chat_id: 'class_5a',
        sender_id: 'teacher1',
        timestamp: new Date().toISOString(),
        text: 'שיעורי בית: להשלים תרגילים 1-5 בעמוד 30'
      }
    ],
    subscribed_chats: ['class_5a'],
    period: {
      start: new Date(Date.now() - 86400000).toISOString(),
      end: new Date(Date.now() + 86400000).toISOString()
    }
  };
  
  const result = await summarizer.process(input);
  expect(result.extracted_items.length).toBe(1);
  expect(result.extracted_items[0].type).toBe('homework');
});

// Test 8: Statistics tracking
test('should track processing statistics', async () => {
  const summarizer = new SchoolChatSummarizer();
  const input = {
    messages: [
      {
        chat_id: 'class_5a',
        sender_id: 'teacher1',
        timestamp: new Date().toISOString(),
        text: 'Math homework due tomorrow'
      },
      {
        chat_id: 'class_6b',
        sender_id: 'teacher2',
        timestamp: new Date().toISOString(),
        text: 'Science project'
      }
    ],
    subscribed_chats: ['class_5a'],
    period: {
      start: new Date(Date.now() - 86400000).toISOString(),
      end: new Date(Date.now() + 86400000).toISOString()
    }
  };
  
  await summarizer.process(input);
  const stats = summarizer.getStats();
  
  expect(stats.totalMessages).toBe(2);
  expect(stats.filteredMessages).toBe(1);
  expect(stats.classifiedMessages).toBe(1);
  expect(stats.itemsByType.homework).toBe(1);
  expect(stats.processingTime).toBeGreaterThan(0);
});

// Test 9: Short message filtering
test('should filter out very short messages', async () => {
  const summarizer = new SchoolChatSummarizer();
  const input = {
    messages: [
      {
        chat_id: 'class_5a',
        sender_id: 'parent1',
        timestamp: new Date().toISOString(),
        text: 'OK'
      },
      {
        chat_id: 'class_5a',
        sender_id: 'parent2',
        timestamp: new Date().toISOString(),
        text: '👍'
      },
      {
        chat_id: 'class_5a',
        sender_id: 'teacher1',
        timestamp: new Date().toISOString(),
        text: 'Homework: Complete page 42'
      }
    ],
    subscribed_chats: ['class_5a'],
    period: {
      start: new Date(Date.now() - 86400000).toISOString(),
      end: new Date(Date.now() + 86400000).toISOString()
    }
  };
  
  const result = await summarizer.process(input);
  expect(result.extracted_items.length).toBe(1);
  expect(result.extracted_items[0].content).toContain('page 42');
});

// Test 10: Timestamp sorting
test('should sort items by timestamp when sortByTimestamp is true', async () => {
  const summarizer = new SchoolChatSummarizer({ sortByTimestamp: true });
  const now = Date.now();
  const input = {
    messages: [
      {
        chat_id: 'class_5a',
        sender_id: 'teacher1',
        timestamp: new Date(now - 3600000).toISOString(), // 1 hour ago
        text: 'Second homework'
      },
      {
        chat_id: 'class_5a',
        sender_id: 'teacher2',
        timestamp: new Date(now - 7200000).toISOString(), // 2 hours ago
        text: 'First homework'
      }
    ],
    subscribed_chats: ['class_5a'],
    period: {
      start: new Date(now - 86400000).toISOString(),
      end: new Date(now).toISOString()
    }
  };
  
  const result = await summarizer.process(input);
  expect(result.extracted_items.length).toBe(2);
  expect(result.extracted_items[0].content).toContain('First');
  expect(result.extracted_items[1].content).toContain('Second');
});

// Summary
console.log('\n=== Test Summary ===');
console.log(`Total tests: ${passedTests + failedTests}`);
console.log(`\x1b[32mPassed: ${passedTests}\x1b[0m`);
console.log(`\x1b[31mFailed: ${failedTests}\x1b[0m`);

if (failedTests > 0) {
  console.log('\n\x1b[31mSome tests failed!\x1b[0m');
  process.exit(1);
} else {
  console.log('\n\x1b[32mAll tests passed!\x1b[0m');
  process.exit(0);
}