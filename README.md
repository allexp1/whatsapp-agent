# SchoolChatSummarizer

An intelligent WhatsApp message processing service that extracts and categorizes educational content from school chat groups. The service automatically identifies homework assignments, schedule changes, and important announcements from WhatsApp messages, helping parents stay organized and informed.

## 🌟 Features

- **Smart Message Filtering**: Processes only messages from subscribed chats within a specified time period
- **Content Classification**: Automatically categorizes messages into:
  - 📚 Homework assignments
  - 📅 Schedule changes
  - 📢 Important announcements
- **Multi-language Support**: Works with both English and Hebrew content
- **Structured Output**: Returns clean, organized JSON with extracted information
- **Performance Optimized**: Efficiently processes large volumes of messages
- **Comprehensive Testing**: Includes a full test suite with 100% passing tests

## 📋 Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Usage Examples](#usage-examples)
- [API Reference](#api-reference)
- [Architecture Overview](#architecture-overview)
- [Contributing](#contributing)
- [License](#license)

## 🚀 Installation

### Prerequisites

- Node.js (v16.0.0 or higher)
- npm or yarn package manager

### Install

```bash
# Clone the repository
git clone <repository-url>
cd whatsapp-agent

# Install dependencies
npm install

# Or using yarn
yarn install
```

## 🎯 Quick Start

### Basic Usage

```typescript
import { SchoolChatSummarizer } from './src/SchoolChatSummarizer';

// Create an instance
const summarizer = new SchoolChatSummarizer({
  minConfidence: 0.5,
  debug: true,
  sortByTimestamp: true
});

// Prepare input
const input = {
  messages: [
    {
      chat_id: "class_5a_math",
      sender_id: "teacher_sarah",
      timestamp: "2024-01-15T08:30:00.000Z",
      text: "Please complete exercises 1-10 on page 42 for tomorrow."
    }
  ],
  subscribed_chats: ["class_5a_math"],
  period: {
    start: "2024-01-15T00:00:00.000Z",
    end: "2024-01-16T00:00:00.000Z"
  }
};

// Process messages
const output = await summarizer.process(input);
console.log(JSON.stringify(output, null, 2));
```

### Running the Demo

```bash
# Run the TypeScript demo
npx ts-node src/demo.ts

# Or run the JavaScript demo
node src/demo.js
```

## 💡 Usage Examples

### Processing Multiple Chat Groups

```typescript
const input = {
  messages: [
    // Math homework
    {
      chat_id: "class_5a_math",
      sender_id: "teacher_sarah",
      timestamp: "2024-01-15T08:30:00.000Z",
      text: "Math homework: Complete chapter 5 exercises"
    },
    // Schedule change
    {
      chat_id: "class_5a_general",
      sender_id: "principal",
      timestamp: "2024-01-15T07:00:00.000Z",
      text: "Assembly moved from 10am to 2pm tomorrow"
    },
    // Parent announcement
    {
      chat_id: "parents_5a",
      sender_id: "principal",
      timestamp: "2024-01-15T12:00:00.000Z",
      text: "Parent-teacher conferences next Tuesday"
    }
  ],
  subscribed_chats: [
    "class_5a_math",
    "class_5a_general",
    "parents_5a"
  ],
  period: {
    start: "2024-01-15T00:00:00.000Z",
    end: "2024-01-16T00:00:00.000Z"
  }
};

const output = await summarizer.process(input);
```

### Processing a Single Message

```typescript
const message = {
  chat_id: "class_5a_english",
  sender_id: "teacher_john",
  timestamp: "2024-01-15T09:00:00.000Z",
  text: "Read chapter 5 and write a summary"
};

const result = summarizer.processSingleMessage(
  message,
  ["class_5a_english"]
);

if (result) {
  console.log(`Type: ${result.type}`);
  console.log(`Content: ${result.content}`);
}
```

### Getting Processing Statistics

```typescript
const output = await summarizer.process(input);
const stats = summarizer.getStats();

console.log(`Total messages: ${stats.totalMessages}`);
console.log(`Filtered: ${stats.filteredMessages}`);
console.log(`Classified: ${stats.classifiedMessages}`);
console.log(`Homework: ${stats.itemsByType.homework}`);
console.log(`Schedule changes: ${stats.itemsByType.schedule_change}`);
console.log(`Announcements: ${stats.itemsByType.announcement}`);
console.log(`Processing time: ${stats.processingTime}ms`);
```

## 📚 API Reference

### SchoolChatSummarizer Class

#### Constructor

```typescript
new SchoolChatSummarizer(options?: SummarizerOptions)
```

**Options:**
- `minConfidence` (number, default: 0.5): Minimum confidence level for including items (0-1)
- `debug` (boolean, default: false): Enable debug logging
- `sortByTimestamp` (boolean, default: true): Sort extracted items by timestamp

#### Methods

##### `process(input: SummarizerInput): Promise<SummarizerOutput>`

Processes an array of messages and returns extracted items.

**Input:**
```typescript
{
  messages: InputMessage[];        // Array of WhatsApp messages
  subscribed_chats: string[];      // Chat IDs to process
  period: {                        // Time range to filter
    start: string;                 // ISO-8601 timestamp
    end: string;                   // ISO-8601 timestamp
  };
}
```

**Output:**
```typescript
{
  period: Period;                  // The processed time period
  run_time: string;               // When the processing occurred
  extracted_items: ExtractedOutputItem[];  // Categorized items
}
```

##### `processSingleMessage(message: InputMessage, subscribedChats: string[]): ExtractedOutputItem | null`

Processes a single message without time filtering.

##### `getStats(): SummarizerStats`

Returns statistics from the last processing run.

### Input/Output Types

See [API.md](./API.md) for detailed schema definitions and more examples.

## 🏗️ Architecture Overview

The SchoolChatSummarizer follows a modular architecture with three main components:

```
┌─────────────────────────────────────────┐
│         SchoolChatSummarizer            │
│  (Main orchestrator and public API)     │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┴────────────┬─────────────────┐
    │                         │                 │
┌───▼──────────┐   ┌─────────▼────────┐   ┌───▼──────────┐
│MessageFilter │   │ContentExtractor  │   │ContentClassifier│
│              │   │                  │   │                │
│ • Time range │   │ • Text cleanup   │   │ • Categorization│
│ • Subscription│   │ • Entity extract │   │ • Confidence   │
│   filtering  │   │ • Multi-language │   │   scoring      │
└──────────────┘   └──────────────────┘   └────────────────┘
```

### Key Components

1. **SchoolChatSummarizer**: Main class that orchestrates the entire process
2. **MessageFilter**: Filters messages by subscription and time period
3. **ContentExtractor**: Cleans text and extracts relevant content
4. **ContentClassifier**: Categorizes messages and assigns confidence scores

For detailed architecture information, see [DEVELOPER.md](./DEVELOPER.md).

## 🧪 Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run JavaScript tests
node src/tests/run-tests-js.js

# Run specific test file
node src/tests/edge-cases.test.js
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests to ensure everything passes
5. Commit your changes (`git commit -m 'Add amazing feature'`)

### Code Style

- Use TypeScript for new features
- Follow the existing code structure
- Add JSDoc comments for public APIs
- Write tests for new functionality

### Pull Request Process

1. Update documentation for any API changes
2. Ensure all tests pass
3. Update the README if needed
4. Submit a pull request with a clear description

### Reporting Issues

Please use the issue tracker to report bugs or request features. Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- System information (Node version, OS)

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Built with TypeScript and Node.js
- Inspired by the need to simplify parent-school communication
- Special thanks to all contributors

---

For more detailed information:
- 📖 [API Documentation](./API.md) - Detailed API reference
- 🔧 [Developer Guide](./DEVELOPER.md) - Architecture and development details
- 🧪 [Test Report](./src/tests/TEST_REPORT.md) - Testing coverage and results