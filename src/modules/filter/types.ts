/**
 * Represents a WhatsApp message object
 */
export interface WhatsAppMessage {
  /** Unique identifier for the chat/group */
  chat_id: string;
  
  /** Unique identifier for the message sender */
  sender_id: string;
  
  /** ISO-8601 formatted timestamp of when the message was sent */
  timestamp: string;
  
  /** The text content of the message */
  text: string;
  
  /** Additional properties that might exist on the message */
  [key: string]: any;
}

/**
 * Represents a time period for filtering messages
 */
export interface TimePeriod {
  /** ISO-8601 formatted start timestamp (inclusive) */
  start: string;
  
  /** ISO-8601 formatted end timestamp (exclusive) */
  end: string;
}

/**
 * Input structure for the message filter
 */
export interface FilterInput {
  /** Array of WhatsApp messages to filter */
  messages: WhatsAppMessage[];
  
  /** Array of chat IDs that the user has subscribed to */
  subscribed_chats: string[];
  
  /** Time period for filtering messages */
  period: TimePeriod;
}

/**
 * Configuration options for the MessageFilter
 */
export interface FilterOptions {
  /** Enable caching of frequently accessed data */
  enableCache?: boolean;
  
  /** Maximum number of items to cache */
  cacheSize?: number;
}

/**
 * Result of the filtering operation
 */
export interface FilterResult {
  /** Filtered messages that match all criteria */
  messages: WhatsAppMessage[];
  
  /** Statistics about the filtering operation */
  stats: {
    /** Total number of messages processed */
    totalProcessed: number;
    
    /** Number of messages filtered by subscription */
    filteredBySubscription: number;
    
    /** Number of messages filtered by time period */
    filteredByTimePeriod: number;
    
    /** Number of duplicate messages removed */
    duplicatesRemoved: number;
    
    /** Final number of messages after filtering */
    finalCount: number;
  };
}