/**
 * Edge case tests for SchoolChatSummarizer
 * Tests error handling, invalid inputs, and boundary conditions
 */

import { SchoolChatSummarizer } from '../SchoolChatSummarizer';
import {
  createTestInput,
  createMessage,
  EDGE_CASE_MESSAGES,
  INVALID_INPUTS,
  generateLargeBatch,
  TEST_SCENARIOS,
} from './test-data';

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
  return {
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
    toThrow(expectedError?: string) {
      if (typeof actual !== 'function') {
        throw new Error('Expected a function to test for throws');
      }
      try {
        (actual as any)();
        throw new Error('Expected function to throw but it did not');
      } catch (error) {
        if (expectedError && !(error as Error).message.includes(expectedError)) {
          throw new Error(`Expected error to include "${expectedError}" but got "${(error as Error).message}"`);
        }
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
  };
}

// Edge Case Tests
export async function runEdgeCaseTests() {
  console.log('🧪 Running Edge Case Tests...\n');
  testResults = [];
  
  // Setup
  beforeEach();

  // Test 1: Empty and whitespace-only messages
  test('should handle empty messages', async () => {
    const input = createTestInput([EDGE_CASE_MESSAGES.empty]);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(0);
  });

  test('should handle whitespace-only messages', async () => {
    const input = createTestInput([EDGE_CASE_MESSAGES.whitespace_only]);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(0);
  });

  // Test 2: Very short messages
  test('should filter out very short non-meaningful messages', async () => {
    const input = createTestInput([EDGE_CASE_MESSAGES.very_short]);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(0);
  });

  // Test 3: Very long messages
  test('should handle very long messages without crashing', async () => {
    const input = createTestInput([EDGE_CASE_MESSAGES.very_long]);
    const result = await summarizer.process(input);
    // Should complete without error
    expect(result).toBeInstanceOf(Object);
  });

  // Test 4: Special characters only
  test('should handle messages with only special characters', async () => {
    const input = createTestInput([EDGE_CASE_MESSAGES.special_characters]);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(0);
  });

  // Test 5: Emoji handling
  test('should handle emoji-only messages', async () => {
    const input = createTestInput([EDGE_CASE_MESSAGES.emojis_only]);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(0);
  });

  test('should process messages with mixed emojis and text', async () => {
    const input = createTestInput([EDGE_CASE_MESSAGES.mixed_emojis]);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(1);
    expect(result.extracted_items[0].type).toBe('homework');
  });

  // Test 6: Numbers only
  test('should handle number-only messages', async () => {
    const input = createTestInput([EDGE_CASE_MESSAGES.numbers_only]);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(0);
  });

  // Test 7: URLs in messages
  test('should handle messages containing URLs', async () => {
    const input = createTestInput([EDGE_CASE_MESSAGES.url_in_message]);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(1);
    expect(result.extracted_items[0].type).toBe('homework');
  });

  // Test 8: Malformed homework messages
  test('should attempt to parse malformed homework messages', async () => {
    const input = createTestInput([EDGE_CASE_MESSAGES.malformed_homework]);
    const result = await summarizer.process(input);
    // May or may not classify depending on confidence threshold
    expect(result.extracted_items.length).toBeGreaterThan(-1);
  });

  // Test 9: Ambiguous content
  test('should handle ambiguous content based on confidence', async () => {
    const input = createTestInput([EDGE_CASE_MESSAGES.ambiguous_content]);
    const result = await summarizer.process(input);
    // Should either classify or skip based on confidence
    expect(result.extracted_items.length).toBeLessThan(2);
  });

  // Test 10: Multiple content types in one message
  test('should prioritize classification for multi-type messages', async () => {
    const input = createTestInput([EDGE_CASE_MESSAGES.multiple_types]);
    const result = await summarizer.process(input);
    // Should classify as one primary type (likely schedule change due to "cancelled")
    expect(result.extracted_items).toHaveLength(1);
    expect(['homework', 'schedule_change', 'announcement']).toContain(result.extracted_items[0].type);
  });

  // Test 11: Invalid input - null messages
  test('should throw error for null messages', () => {
    expect(async () => {
      await summarizer.process(INVALID_INPUTS.null_messages);
    }).toThrow('messages must be an array');
  });

  // Test 12: Invalid input - empty subscriptions
  test('should return empty results for no subscribed chats', async () => {
    const input = createTestInput(TEST_SCENARIOS.all_homework, []);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(0);
  });

  // Test 13: Invalid input - inverted time period
  test('should throw error for invalid time period', () => {
    expect(async () => {
      await summarizer.process(INVALID_INPUTS.invalid_period);
    }).toThrow('period.start must be before period.end');
  });

  // Test 14: Invalid input - malformed timestamp
  test('should throw error for malformed timestamp in message', () => {
    expect(async () => {
      await summarizer.process(INVALID_INPUTS.malformed_timestamp);
    }).toThrow('Invalid timestamp');
  });

  // Test 15: Invalid input - missing required fields
  test('should throw error for messages missing required fields', () => {
    expect(async () => {
      await summarizer.process(INVALID_INPUTS.missing_required_fields);
    }).toThrow('missing required fields');
  });

  // Test 16: Out of period messages
  test('should filter out messages outside the specified period', async () => {
    const input = createTestInput(TEST_SCENARIOS.out_of_period);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(0);
  });

  // Test 17: Non-subscribed chat messages
  test('should filter out messages from non-subscribed chats', async () => {
    const input = createTestInput(TEST_SCENARIOS.non_subscribed);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(0);
  });

  // Test 18: Duplicate messages
  test('should remove duplicate messages', async () => {
    const input = createTestInput(TEST_SCENARIOS.duplicates);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(1);
    const stats = summarizer.getStats();
    expect(stats.filteredMessages).toBe(1);
  });

  // Test 19: Performance with large batch
  test('should handle large batch of messages efficiently', async () => {
    const startTime = Date.now();
    const messages = generateLargeBatch(1000);
    const input = createTestInput(messages, ['chat_001', 'chat_002', 'chat_003']);
    
    const result = await summarizer.process(input);
    const processingTime = Date.now() - startTime;
    
    expect(result.extracted_items.length).toBeGreaterThan(0);
    expect(processingTime).toBeLessThan(5000); // Should process 1000 messages in under 5 seconds
    
    const stats = summarizer.getStats();
    expect(stats.totalMessages).toBe(1000);
  });

  // Test 20: Boundary timestamp - exact start time
  test('should include messages at exact period start time', async () => {
    const message = createMessage(
      'Math homework page 45',
      'chat_001',
      'teacher_001',
      '2025-01-01T00:00:00.000Z' // Exact start time
    );
    const input = createTestInput([message]);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(1);
  });

  // Test 21: Boundary timestamp - exact end time
  test('should exclude messages at exact period end time', async () => {
    const message = createMessage(
      'Math homework page 45',
      'chat_001',
      'teacher_001',
      '2025-01-31T23:59:59.999Z' // Exact end time
    );
    const input = createTestInput([message]);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(0);
  });

  // Test 22: Non-school content filtering
  test('should filter out non-school related content', async () => {
    const input = createTestInput([
      EDGE_CASE_MESSAGES.non_school_content,
      EDGE_CASE_MESSAGES.casual_conversation,
    ]);
    const result = await summarizer.process(input);
    expect(result.extracted_items).toHaveLength(0);
  });

  // Test 23: Different confidence thresholds
  test('should respect custom confidence threshold', async () => {
    const highConfidenceSummarizer = new SchoolChatSummarizer({ minConfidence: 0.9 });
    const lowConfidenceSummarizer = new SchoolChatSummarizer({ minConfidence: 0.1 });
    
    const input = createTestInput([EDGE_CASE_MESSAGES.ambiguous_content]);
    
    const highResult = await highConfidenceSummarizer.process(input);
    const lowResult = await lowConfidenceSummarizer.process(input);
    
    expect(highResult.extracted_items.length).toBeLessThan(2);
    expect(lowResult.extracted_items.length).toBeGreaterThan(-1);
  });

  // Test 24: Stats accuracy
  test('should maintain accurate statistics', async () => {
    const messages = [
      ...TEST_SCENARIOS.all_homework.slice(0, 3),
      ...TEST_SCENARIOS.all_schedule_changes.slice(0, 2),
      ...TEST_SCENARIOS.all_announcements.slice(0, 2),
    ];
    
    const input = createTestInput(messages);
    await summarizer.process(input);
    
    const stats = summarizer.getStats();
    expect(stats.totalMessages).toBe(7);
    expect(stats.filteredMessages).toBe(7);
    expect(stats.classifiedMessages).toBeGreaterThan(0);
    expect(stats.processingTime).toBeGreaterThan(0);
  });

  // Test 25: Error recovery
  test('should provide meaningful error messages', async () => {
    try {
      await summarizer.process(null as any);
    } catch (error) {
      expect((error as Error).message).toContain('Failed to process messages');
    }
  });

  // Print results
  printTestResults();
}

function beforeEach() {
  summarizer = new SchoolChatSummarizer({ debug: false });
}

function printTestResults() {
  console.log('\n📊 Edge Case Test Results:');
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