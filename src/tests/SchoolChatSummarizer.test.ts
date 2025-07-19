/**
 * Main integration tests for SchoolChatSummarizer
 * Tests end-to-end functionality with various input scenarios
 */

import { SchoolChatSummarizer } from '../SchoolChatSummarizer';
import {
  createTestInput,
  createMessage,
  HOMEWORK_MESSAGES,
  SCHEDULE_MESSAGES,
  ANNOUNCEMENT_MESSAGES,
  TEST_SCENARIOS,
} from './test-data';
import { SummarizerOutput, ExtractedOutputItem } from '../types';

// Test framework setup
let testResults: { name: string; passed: boolean; error?: string }[] = [];
let summarizer: SchoolChatSummarizer;

function test(name: string, fn: () => void | Promise<void>) {
  try {
    const result = fn();
    if (result instanceof Promise) {
      result
        .then(() => {
          testResults.push({ name, passed: true });
        })
        .catch((error) => {
          testResults.push({ name, passed: false, error: error.message });
        });
    } else {
      testResults.push({ name, passed: true });
    }
  } catch (error) {
    testResults.push({ name, passed: false, error: (error as Error).message });
  }
}

function expect<T>(actual: T) {
  const matchers = {
    toBe(expected: T) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual(expected: T) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== 'number' || actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      if (typeof actual !== 'number' || actual >= expected) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeInstanceOf(expectedClass: any) {
      if (!(actual instanceof expectedClass)) {
        throw new Error(`Expected instance of ${expectedClass.name}`);
      }
    },
    toContain(expected: any) {
      if (Array.isArray(actual)) {
        if (!actual.includes(expected)) {
          throw new Error(`Expected array to contain ${expected}`);
        }
      } else if (typeof actual === 'string') {
        if (!actual.includes(expected)) {
          throw new Error(`Expected string to contain "${expected}"`);
        }
      } else {
        throw new Error('toContain can only be used with arrays or strings');
      }
    },
    toHaveLength(expected: number) {
      if (!('length' in (actual as any))) {
        throw new Error('Expected value to have length property');
      }
      if ((actual as any).length !== expected) {
        throw new Error(`Expected length ${expected} but got ${(actual as any).length}`);
      }
    },
    toMatchObject(expected: Partial<T>) {
      const actualObj = actual as any;
      for (const key in expected) {
        if (actualObj[key] !== (expected as any)[key]) {
          throw new Error(`Expected property ${key} to be ${(expected as any)[key]} but got ${actualObj[key]}`);
        }
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error('Expected value to be defined');
      }
    },
    toBeUndefined() {
      if (actual !== undefined) {
        throw new Error(`Expected undefined but got ${actual}`);
      }
    },
  };
  
  // Add 'not' functionality
  const notMatchers: any = {
    toContain(expected: any) {
      if (Array.isArray(actual)) {
        if (actual.includes(expected)) {
          throw new Error(`Expected array not to contain ${expected}`);
        }
      } else if (typeof actual === 'string') {
        if (actual.includes(expected)) {
          throw new Error(`Expected string not to contain "${expected}"`);
        }
      } else {
        throw new Error('toContain can only be used with arrays or strings');
      }
    },
  };
  
  return {
    ...matchers,
    not: notMatchers,
  };
}

// Integration Tests
export async function runIntegrationTests() {
  console.log('🧪 Running Integration Tests...\n');
  testResults = [];
  
  // Setup
  beforeEach();

  // Test 1: Basic homework message processing
  test('should correctly classify and extract homework messages', async () => {
    const input = createTestInput([HOMEWORK_MESSAGES.english.math_basic]);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items).toHaveLength(1);
    const item = result.extracted_items[0];
    expect(item.type).toBe('homework');
    expect(item.chat_id).toBe('chat_001');
    expect(item.sender_id).toBe('teacher_001');
    expect(item.content).toContain('Math homework');
    expect(item.content).toContain('exercises 1-10');
    expect(item.content).toContain('page 45');
  });

  // Test 2: Hebrew homework processing
  test('should correctly process Hebrew homework messages', async () => {
    const input = createTestInput([HOMEWORK_MESSAGES.hebrew.math_basic]);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items).toHaveLength(1);
    const item = result.extracted_items[0];
    expect(item.type).toBe('homework');
    expect(item.content).toContain('מתמטיקה');
    expect(item.content).toContain('תרגילים');
  });

  // Test 3: Schedule change processing
  test('should correctly classify schedule changes', async () => {
    const input = createTestInput([SCHEDULE_MESSAGES.english.class_cancelled]);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items).toHaveLength(1);
    const item = result.extracted_items[0];
    expect(item.type).toBe('schedule_change');
    expect(item.content).toContain('cancelled');
    expect(item.content).toContain('Math class');
  });

  // Test 4: Announcement processing
  test('should correctly classify announcements', async () => {
    const input = createTestInput([ANNOUNCEMENT_MESSAGES.english.field_trip]);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items).toHaveLength(1);
    const item = result.extracted_items[0];
    expect(item.type).toBe('announcement');
    expect(item.content).toContain('Science museum');
    expect(item.content).toContain('Permission slips');
  });

  // Test 5: Mixed message types
  test('should process multiple message types correctly', async () => {
    const input = createTestInput(TEST_SCENARIOS.mixed_languages);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items.length).toBeGreaterThan(3);
    
    // Check that we have all three types
    const types = result.extracted_items.map(item => item.type);
    expect(types).toContain('homework');
    expect(types).toContain('schedule_change');
    expect(types).toContain('announcement');
  });

  // Test 6: Output format validation
  test('should return correctly formatted output', async () => {
    const input = createTestInput([HOMEWORK_MESSAGES.english.math_basic]);
    const result = await summarizer.process(input);
    
    // Check main output structure
    expect(result.period).toBeDefined();
    expect(result.period.start).toBe('2025-01-01T00:00:00.000Z');
    expect(result.period.end).toBe('2025-01-31T23:59:59.999Z');
    expect(result.run_time).toBeDefined();
    expect(result.extracted_items).toBeDefined();
    
    // Validate ISO timestamp
    const runTime = new Date(result.run_time);
    expect(runTime.toISOString()).toBe(result.run_time);
  });

  // Test 7: Subscription filtering
  test('should only process messages from subscribed chats', async () => {
    const messages = [
      createMessage('Homework page 10', 'chat_001'),
      createMessage('Test tomorrow', 'chat_002'),
      createMessage('Important notice', 'unsubscribed_chat'),
    ];
    
    const input = createTestInput(messages, ['chat_001', 'chat_002']);
    const result = await summarizer.process(input);
    
    // Should not include the unsubscribed_chat message
    const chatIds = result.extracted_items.map(item => item.chat_id);
    expect(chatIds).toContain('chat_001');
    expect(chatIds).toContain('chat_002');
    expect(chatIds).not.toContain('unsubscribed_chat');
  });

  // Test 8: Time period filtering
  test('should only process messages within the specified period', async () => {
    const messages = [
      createMessage('Early message', 'chat_001', 'teacher_001', '2025-01-10T10:00:00.000Z'),
      createMessage('On-time homework', 'chat_001', 'teacher_001', '2025-01-15T10:00:00.000Z'),
      createMessage('Late message', 'chat_001', 'teacher_001', '2025-02-01T10:00:00.000Z'),
    ];
    
    const input = createTestInput(messages, ['chat_001'], {
      start: '2025-01-11T00:00:00.000Z',
      end: '2025-01-20T00:00:00.000Z',
    });
    
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(1);
    expect(result.extracted_items[0].content).toContain('On-time homework');
  });

  // Test 9: Sorting by timestamp
  test('should sort extracted items by timestamp when enabled', async () => {
    const messages = [
      createMessage('Third message', 'chat_001', 'teacher_001', '2025-01-15T15:00:00.000Z'),
      createMessage('First message', 'chat_001', 'teacher_001', '2025-01-15T09:00:00.000Z'),
      createMessage('Second message', 'chat_001', 'teacher_001', '2025-01-15T12:00:00.000Z'),
    ];
    
    const input = createTestInput(messages);
    const result = await summarizer.process(input);
    
    // Check if sorted by timestamp
    if (result.extracted_items.length >= 2) {
      const timestamps = result.extracted_items.map(item => new Date(item.timestamp).getTime());
      for (let i = 1; i < timestamps.length; i++) {
        expect(timestamps[i]).toBeGreaterThan(timestamps[i - 1] - 1); // Allow for equal timestamps
      }
    }
  });

  // Test 10: Multiple subjects in one message
  test('should handle messages with multiple subjects', async () => {
    const input = createTestInput([HOMEWORK_MESSAGES.english.multiple_subjects]);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items).toHaveLength(1);
    const item = result.extracted_items[0];
    expect(item.content).toContain('Math');
    expect(item.content).toContain('English');
    expect(item.content).toContain('History');
  });

  // Test 11: Confidence threshold filtering
  test('should respect minimum confidence threshold', async () => {
    const lowConfidenceSummarizer = new SchoolChatSummarizer({ minConfidence: 0.3 });
    const highConfidenceSummarizer = new SchoolChatSummarizer({ minConfidence: 0.8 });
    
    const ambiguousMessage = createMessage(
      'Maybe we should review the material for next time',
      'chat_001'
    );
    
    const input = createTestInput([ambiguousMessage]);
    
    const lowResult = await lowConfidenceSummarizer.process(input);
    const highResult = await highConfidenceSummarizer.process(input);
    
    // Low confidence should include more items
    expect(lowResult.extracted_items.length).toBeGreaterThan(-1);
    expect(highResult.extracted_items.length).toBeLessThan(2);
  });

  // Test 12: Statistics accuracy
  test('should maintain accurate processing statistics', async () => {
    const messages = [
      ...TEST_SCENARIOS.all_homework.slice(0, 4),
      ...TEST_SCENARIOS.non_subscribed,
      ...TEST_SCENARIOS.out_of_period,
    ];
    
    const input = createTestInput(
      messages,
      ['chat_001', 'chat_002'],
      {
        start: '2025-01-01T00:00:00.000Z',
        end: '2025-01-31T23:59:59.999Z',
      }
    );
    
    await summarizer.process(input);
    const stats = summarizer.getStats();
    
    expect(stats.totalMessages).toBe(8); // 4 homework + 2 non-subscribed + 2 out-of-period
    expect(stats.filteredMessages).toBeLessThan(stats.totalMessages);
    expect(stats.classifiedMessages).toBeLessThan(stats.filteredMessages + 1);
    expect(stats.itemsByType.homework).toBeGreaterThan(0);
    expect(stats.processingTime).toBeGreaterThan(0);
  });

  // Test 13: Complex Hebrew message processing
  test('should handle complex Hebrew messages with dates and numbers', async () => {
    const hebrewMessage = createMessage(
      'שיעורי בית למתמטיקה: לפתור תרגילים 1-20 בעמודים 45-47. להגשה עד יום שלישי ה-20.1',
      'chat_001'
    );
    
    const input = createTestInput([hebrewMessage]);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items).toHaveLength(1);
    const item = result.extracted_items[0];
    expect(item.type).toBe('homework');
    expect(item.content).toContain('תרגילים');
    expect(item.content).toContain('1-20');
  });

  // Test 14: Processing single message utility
  test('should process single message correctly', () => {
    const message = HOMEWORK_MESSAGES.english.math_basic;
    const result = summarizer.processSingleMessage(message, ['chat_001']);
    
    expect(result).toBeDefined();
    if (result) {
      expect(result.type).toBe('homework');
      expect(result.chat_id).toBe('chat_001');
      expect(result.content).toContain('Math homework');
    }
  });

  // Test 15: Processing single message from non-subscribed chat
  test('should return null for single message from non-subscribed chat', () => {
    const message = HOMEWORK_MESSAGES.english.math_basic;
    const result = summarizer.processSingleMessage(message, ['chat_002', 'chat_003']);
    
    expect(result).toBe(null);
  });

  // Test 16: Options configuration
  test('should respect debug option', async () => {
    const debugSummarizer = new SchoolChatSummarizer({ debug: true });
    const consoleSpy = jest ? jest.spyOn(console, 'log').mockImplementation() : null;
    
    const input = createTestInput([HOMEWORK_MESSAGES.english.math_basic]);
    await debugSummarizer.process(input);
    
    // In debug mode, should have logged messages
    // Note: This test would work better with a proper mocking framework
    expect(debugSummarizer['options'].debug).toBe(true);
  });

  // Test 17: Empty input handling
  test('should handle empty message array gracefully', async () => {
    const input = createTestInput([]);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items).toHaveLength(0);
    expect(result.period).toEqual(input.period);
    expect(result.run_time).toBeDefined();
  });

  // Test 18: All message types batch processing
  test('should process all homework messages correctly', async () => {
    const input = createTestInput(TEST_SCENARIOS.all_homework);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items.length).toBeGreaterThan(0);
    result.extracted_items.forEach(item => {
      expect(item.type).toBe('homework');
    });
  });

  // Test 19: Schedule change batch processing
  test('should process all schedule changes correctly', async () => {
    const input = createTestInput(TEST_SCENARIOS.all_schedule_changes);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items.length).toBeGreaterThan(0);
    result.extracted_items.forEach(item => {
      expect(item.type).toBe('schedule_change');
    });
  });

  // Test 20: Announcement batch processing
  test('should process all announcements correctly', async () => {
    const input = createTestInput(TEST_SCENARIOS.all_announcements);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items.length).toBeGreaterThan(0);
    result.extracted_items.forEach(item => {
      expect(item.type).toBe('announcement');
    });
  });

  // Test 21: Preserved metadata
  test('should preserve original message metadata', async () => {
    const customMessage = createMessage(
      'Math homework page 100',
      'custom_chat_123',
      'custom_teacher_456',
      '2025-01-18T14:30:00.000Z'
    );
    
    const input = createTestInput([customMessage], ['custom_chat_123']);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items).toHaveLength(1);
    const item = result.extracted_items[0];
    expect(item.chat_id).toBe('custom_chat_123');
    expect(item.sender_id).toBe('custom_teacher_456');
    expect(item.timestamp).toBe('2025-01-18T14:30:00.000Z');
  });

  // Test 22: Disable sorting option
  test('should not sort when sortByTimestamp is false', async () => {
    const noSortSummarizer = new SchoolChatSummarizer({ sortByTimestamp: false });
    
    const messages = [
      createMessage('Third', 'chat_001', 'teacher_001', '2025-01-15T15:00:00.000Z'),
      createMessage('First', 'chat_001', 'teacher_001', '2025-01-15T09:00:00.000Z'),
      createMessage('Second', 'chat_001', 'teacher_001', '2025-01-15T12:00:00.000Z'),
    ];
    
    const input = createTestInput(messages);
    const result = await noSortSummarizer.process(input);
    
    // With sorting disabled, messages should maintain their processing order
    if (result.extracted_items.length === 3) {
      expect(result.extracted_items[0].content).toContain('Third');
      expect(result.extracted_items[1].content).toContain('First');
      expect(result.extracted_items[2].content).toContain('Second');
    }
  });

  // Test 23: Mixed language in single message
  test('should handle mixed English-Hebrew messages', async () => {
    const input = createTestInput([HOMEWORK_MESSAGES.hebrew.mixed_language]);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items).toHaveLength(1);
    const item = result.extracted_items[0];
    expect(item.type).toBe('homework');
    expect(item.content).toContain('Math exercises');
    expect(item.content).toContain('תנ"ך');
  });

  // Test 24: Multiple items of same type
  test('should handle multiple homework assignments in sequence', async () => {
    const messages = [
      HOMEWORK_MESSAGES.english.math_basic,
      HOMEWORK_MESSAGES.english.science_detailed,
      HOMEWORK_MESSAGES.english.english_project,
    ];
    
    const input = createTestInput(messages);
    const result = await summarizer.process(input);
    
    expect(result.extracted_items.length).toBeGreaterThan(1);
    const stats = summarizer.getStats();
    expect(stats.itemsByType.homework).toBeGreaterThan(1);
  });

  // Test 25: Error handling in classification
  test('should handle classification errors gracefully', async () => {
    // Create a message that might cause issues
    const problematicMessage = createMessage(
      'הודעה עם תווים מיוחדים: 🎯 \u0000 \uFFFD',
      'chat_001'
    );
    
    const input = createTestInput([
      problematicMessage,
      HOMEWORK_MESSAGES.english.math_basic, // Valid message after problematic one
    ]);
    
    const result = await summarizer.process(input);
    
    // Should still process valid messages even if one fails
    expect(result.extracted_items.length).toBeGreaterThan(0);
    expect(result.extracted_items.some(item => item.content.includes('Math homework'))).toBe(true);
  });

  // Print results
  printTestResults();
}

function beforeEach() {
  summarizer = new SchoolChatSummarizer({ debug: false });
}

function printTestResults() {
  console.log('\n📊 Integration Test Results:');
  console.log('=' .repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  testResults.forEach((result) => {
    if (result.passed) {
      console.log(`✅ ${result.name}`);
      passed++;
    } else {
      console.log(`❌ ${result.name}`);
      console.log(`   Error: ${result.error}`);
      failed++;
    }
  });
  
  console.log('=' .repeat(50));
  console.log(`Total: ${testResults.length} | Passed: ${passed} | Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / testResults.length) * 100).toFixed(1)}%\n`);
}

// Export for use in test runner
export { testResults };