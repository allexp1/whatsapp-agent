# SchoolChatSummarizer API Documentation

This document provides detailed API reference for the SchoolChatSummarizer service, including input schemas, output formats, error responses, and comprehensive usage examples.

## Table of Contents

- [Input Schema](#input-schema)
- [Output Format](#output-format)
- [API Methods](#api-methods)
- [Error Responses](#error-responses)
- [Usage Examples](#usage-examples)
- [Type Definitions](#type-definitions)

## Input Schema

### SummarizerInput

The main input structure for processing WhatsApp messages.

```typescript
interface SummarizerInput {
  messages: InputMessage[];        // Array of WhatsApp messages
  subscribed_chats: string[];      // List of chat IDs to process
  period: Period;                  // Time range for filtering
}
```

### InputMessage

Individual message structure.

```typescript
interface InputMessage {
  chat_id: string;      // Unique identifier for the chat/group
  sender_id: string;    // Unique identifier for the sender
  timestamp: string;    // ISO-8601 formatted timestamp
  text: string;         // Message content
}
```

### Period

Time period for filtering messages.

```typescript
interface Period {
  start: string;    // ISO-8601 timestamp (inclusive)
  end: string;      // ISO-8601 timestamp (exclusive)
}
```

### Example Input

```json
{
  "messages": [
    {
      "chat_id": "class_5a_math",
      "sender_id": "teacher_sarah",
      "timestamp": "2024-01-15T08:30:00.000Z",
      "text": "Math homework: Complete exercises 1-10 on page 42 for tomorrow."
    },
    {
      "chat_id": "class_5a_general",
      "sender_id": "principal_david",
      "timestamp": "2024-01-15T07:45:00.000Z",
      "text": "Assembly moved from 10am to 2pm tomorrow"
    }
  ],
  "subscribed_chats": ["class_5a_math", "class_5a_general"],
  "period": {
    "start": "2024-01-15T00:00:00.000Z",
    "end": "2024-01-16T00:00:00.000Z"
  }
}
```

## Output Format

### SummarizerOutput

The main output structure containing processed results.

```typescript
interface SummarizerOutput {
  period: Period;                    // The processed time period
  run_time: string;                  // ISO-8601 timestamp of processing
  extracted_items: ExtractedOutputItem[];  // Array of categorized items
}
```

### ExtractedOutputItem

Individual extracted and categorized item.

```typescript
interface ExtractedOutputItem {
  type: 'homework' | 'schedule_change' | 'announcement';
  chat_id: string;       // Source chat ID
  sender_id: string;     // Original sender ID
  timestamp: string;     // ISO-8601 timestamp
  content: string;       // Extracted/cleaned content
}
```

### Example Output

```json
{
  "period": {
    "start": "2024-01-15T00:00:00.000Z",
    "end": "2024-01-16T00:00:00.000Z"
  },
  "run_time": "2024-01-15T14:30:00.000Z",
  "extracted_items": [
    {
      "type": "homework",
      "chat_id": "class_5a_math",
      "sender_id": "teacher_sarah",
      "timestamp": "2024-01-15T08:30:00.000Z",
      "content": "Math homework: Complete exercises 1-10 on page 42 for tomorrow"
    },
    {
      "type": "schedule_change",
      "chat_id": "class_5a_general",
      "sender_id": "principal_david",
      "timestamp": "2024-01-15T07:45:00.000Z",
      "content": "Assembly moved from 10am to 2pm tomorrow"
    }
  ]
}
```

## API Methods

### SchoolChatSummarizer Constructor

```typescript
constructor(options?: SummarizerOptions)
```

#### Parameters

- `options` (optional): Configuration options

```typescript
interface SummarizerOptions {
  minConfidence?: number;      // Minimum confidence (0-1), default: 0.5
  debug?: boolean;             // Enable debug logging, default: false
  sortByTimestamp?: boolean;   // Sort output by timestamp, default: true
}
```

#### Example

```typescript
const summarizer = new SchoolChatSummarizer({
  minConfidence: 0.6,
  debug: true,
  sortByTimestamp: true
});
```

### process Method

Main method for processing messages.

```typescript
async process(input: SummarizerInput): Promise<SummarizerOutput>
```

#### Parameters

- `input`: SummarizerInput object containing messages, subscriptions, and time period

#### Returns

- Promise resolving to SummarizerOutput

#### Throws

- Error with descriptive message if validation fails or processing errors occur

### processSingleMessage Method

Process a single message without time filtering.

```typescript
processSingleMessage(
  message: InputMessage,
  subscribedChats: string[]
): ExtractedOutputItem | null
```

#### Parameters

- `message`: Single message to process
- `subscribedChats`: Array of subscribed chat IDs

#### Returns

- ExtractedOutputItem if message is classified with sufficient confidence
- null if message is not from subscribed chat or confidence is too low

### getStats Method

Get statistics from the last processing run.

```typescript
getStats(): SummarizerStats
```

#### Returns

```typescript
interface SummarizerStats {
  totalMessages: number;          // Total input messages
  filteredMessages: number;       // Messages after filtering
  classifiedMessages: number;     // Successfully classified
  itemsByType: {
    homework: number;
    schedule_change: number;
    announcement: number;
  };
  processingTime: number;         // Processing time in ms
}
```

## Error Responses

### Validation Errors

The service validates input and throws descriptive errors:

```javascript
// Missing required field
{
  "error": "Input is required"
}

// Invalid array type
{
  "error": "messages must be an array"
}

// Invalid timestamp
{
  "error": "period.start must be a valid ISO 8601 timestamp"
}

// Invalid time range
{
  "error": "period.start must be before period.end"
}

// Invalid message structure
{
  "error": "Invalid message at index 0: missing required fields"
}
```

### Processing Errors

```javascript
// General processing error
{
  "error": "Failed to process messages: [specific error message]"
}
```

## Usage Examples

### Basic Usage

```typescript
import { SchoolChatSummarizer } from './SchoolChatSummarizer';

async function processMessages() {
  const summarizer = new SchoolChatSummarizer();
  
  try {
    const output = await summarizer.process({
      messages: [...],
      subscribed_chats: ['class_5a_math'],
      period: {
        start: '2024-01-15T00:00:00.000Z',
        end: '2024-01-16T00:00:00.000Z'
      }
    });
    
    console.log(output);
  } catch (error) {
    console.error('Processing failed:', error.message);
  }
}
```

### Advanced Filtering with Multiple Chats

```typescript
const input = {
  messages: [
    // Messages from various chats
    { chat_id: 'class_5a_math', ... },
    { chat_id: 'class_5a_english', ... },
    { chat_id: 'class_5b_math', ... },  // Not subscribed
    { chat_id: 'parents_5a', ... }
  ],
  subscribed_chats: [
    'class_5a_math',
    'class_5a_english',
    'parents_5a'
  ],
  period: {
    start: '2024-01-15T00:00:00.000Z',
    end: '2024-01-16T00:00:00.000Z'
  }
};

const output = await summarizer.process(input);
// Only messages from subscribed chats will be processed
```

### Hebrew Content Support

```typescript
const hebrewInput = {
  messages: [
    {
      chat_id: 'class_5a_hebrew',
      sender_id: 'teacher_rachel',
      timestamp: '2024-01-15T09:00:00.000Z',
      text: 'שיעורי בית: לקרוא פרק 5 ולכתוב סיכום. להגשה ביום רביעי'
    }
  ],
  subscribed_chats: ['class_5a_hebrew'],
  period: {
    start: '2024-01-15T00:00:00.000Z',
    end: '2024-01-16T00:00:00.000Z'
  }
};

const output = await summarizer.process(hebrewInput);
```

### Real-time Processing

```typescript
// Process messages as they arrive
async function handleIncomingMessage(message: InputMessage) {
  const summarizer = new SchoolChatSummarizer({
    minConfidence: 0.7
  });
  
  const result = summarizer.processSingleMessage(
    message,
    ['class_5a_math', 'class_5a_general']
  );
  
  if (result) {
    console.log(`New ${result.type}: ${result.content}`);
    // Send notification, update UI, etc.
  }
}
```

### Batch Processing with Statistics

```typescript
async function processDailyMessages() {
  const summarizer = new SchoolChatSummarizer({
    debug: true,
    minConfidence: 0.5
  });
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const input = {
    messages: await fetchMessagesFromDatabase(),
    subscribed_chats: await getUserSubscriptions(),
    period: {
      start: today.toISOString(),
      end: tomorrow.toISOString()
    }
  };
  
  const output = await summarizer.process(input);
  const stats = summarizer.getStats();
  
  console.log('Daily Summary:', {
    totalProcessed: stats.totalMessages,
    relevant: stats.filteredMessages,
    extracted: stats.classifiedMessages,
    breakdown: stats.itemsByType,
    performance: `${stats.processingTime}ms`
  });
  
  return output;
}
```

### Error Handling

```typescript
async function safeProcess(input: SummarizerInput) {
  const summarizer = new SchoolChatSummarizer();
  
  try {
    // Validate input before processing
    if (!input.messages || input.messages.length === 0) {
      console.log('No messages to process');
      return null;
    }
    
    const output = await summarizer.process(input);
    return output;
    
  } catch (error) {
    if (error.message.includes('Invalid message')) {
      console.error('Data validation error:', error.message);
      // Handle invalid message format
    } else if (error.message.includes('timestamp')) {
      console.error('Time validation error:', error.message);
      // Handle timestamp issues
    } else {
      console.error('Unexpected error:', error.message);
      // Handle other errors
    }
    return null;
  }
}
```

## Type Definitions

### Complete TypeScript Interfaces

```typescript
// Input Types
interface InputMessage {
  chat_id: string;
  sender_id: string;
  timestamp: string;
  text: string;
}

interface Period {
  start: string;
  end: string;
}

interface SummarizerInput {
  messages: InputMessage[];
  subscribed_chats: string[];
  period: Period;
}

// Output Types
interface ExtractedOutputItem {
  type: 'homework' | 'schedule_change' | 'announcement';
  chat_id: string;
  sender_id: string;
  timestamp: string;
  content: string;
}

interface SummarizerOutput {
  period: Period;
  run_time: string;
  extracted_items: ExtractedOutputItem[];
}

// Configuration Types
interface SummarizerOptions {
  minConfidence?: number;
  debug?: boolean;
  sortByTimestamp?: boolean;
}

// Statistics Types
interface SummarizerStats {
  totalMessages: number;
  filteredMessages: number;
  classifiedMessages: number;
  itemsByType: {
    homework: number;
    schedule_change: number;
    announcement: number;
  };
  processingTime: number;
}
```

---

For more information:
- [Main Documentation](./README.md)
- [Developer Guide](./DEVELOPER.md)
- [Test Report](./src/tests/TEST_REPORT.md)