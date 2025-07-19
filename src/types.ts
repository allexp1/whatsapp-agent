/**
 * Main input/output TypeScript interfaces for SchoolChatSummarizer
 */

/**
 * Input message structure matching the original requirements
 */
export interface InputMessage {
  /** Unique identifier for the chat/group */
  chat_id: string;
  
  /** Unique identifier for the message sender */
  sender_id: string;
  
  /** ISO-8601 formatted timestamp of when the message was sent */
  timestamp: string;
  
  /** The text content of the message */
  text: string;
}

/**
 * Time period for filtering messages
 */
export interface Period {
  /** ISO-8601 formatted start timestamp (inclusive) */
  start: string;
  
  /** ISO-8601 formatted end timestamp (exclusive) */
  end: string;
}

/**
 * Main input structure for the SchoolChatSummarizer
 */
export interface SummarizerInput {
  /** Array of WhatsApp messages to process */
  messages: InputMessage[];
  
  /** Array of chat IDs that the user has subscribed to */
  subscribed_chats: string[];
  
  /** Time period for filtering messages */
  period: Period;
}

/**
 * Output item structure for extracted content
 */
export interface ExtractedOutputItem {
  /** Type of the extracted content */
  type: 'homework' | 'schedule_change' | 'announcement';
  
  /** Chat ID where the message was found */
  chat_id: string;
  
  /** Sender ID of the message */
  sender_id: string;
  
  /** ISO-8601 formatted timestamp */
  timestamp: string;
  
  /** The extracted/cleaned content */
  content: string;
}

/**
 * Main output structure from the SchoolChatSummarizer
 */
export interface SummarizerOutput {
  /** The period that was processed */
  period: Period;
  
  /** ISO-8601 formatted timestamp of when the summarizer ran */
  run_time: string;
  
  /** Array of extracted items */
  extracted_items: ExtractedOutputItem[];
}

/**
 * Options for configuring the SchoolChatSummarizer
 */
export interface SummarizerOptions {
  /** Minimum confidence level for including items (0-1) */
  minConfidence?: number;
  
  /** Enable debug logging */
  debug?: boolean;
  
  /** Sort extracted items by timestamp */
  sortByTimestamp?: boolean;
}

/**
 * Statistics about the summarization process
 */
export interface SummarizerStats {
  /** Total messages processed */
  totalMessages: number;
  
  /** Messages after filtering */
  filteredMessages: number;
  
  /** Messages successfully classified */
  classifiedMessages: number;
  
  /** Breakdown by type */
  itemsByType: {
    homework: number;
    schedule_change: number;
    announcement: number;
  };
  
  /** Processing time in milliseconds */
  processingTime: number;
}