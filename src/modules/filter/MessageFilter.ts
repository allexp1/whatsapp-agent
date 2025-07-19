import {
  WhatsAppMessage,
  TimePeriod,
  FilterInput,
  FilterOptions,
  FilterResult
} from './types';

/**
 * MessageFilter class responsible for filtering WhatsApp messages
 * based on chat subscriptions, time periods, and removing duplicates.
 */
export class MessageFilter {
  private options: FilterOptions;
  private cache: Map<string, any> = new Map();

  /**
   * Creates a new instance of MessageFilter
   * @param options - Configuration options for the filter
   */
  constructor(options: FilterOptions = {}) {
    this.options = {
      enableCache: true,
      cacheSize: 1000,
      ...options
    };
  }

  /**
   * Filters messages based on the provided input criteria
   * @param input - The filter input containing messages, subscribed chats, and time period
   * @returns FilterResult containing filtered messages and statistics
   * @throws Error if input validation fails
   */
  public filter(input: FilterInput): FilterResult {
    // Validate input
    this.validateInput(input);

    const stats = {
      totalProcessed: 0,
      filteredBySubscription: 0,
      filteredByTimePeriod: 0,
      duplicatesRemoved: 0,
      finalCount: 0
    };

    // Extract and validate input data
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

  /**
   * Validates the input structure and data
   * @param input - The filter input to validate
   * @throws Error if validation fails
   */
  private validateInput(input: FilterInput): void {
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

  /**
   * Checks if a timestamp string is a valid ISO-8601 format
   * @param timestamp - The timestamp string to validate
   * @returns true if valid, false otherwise
   */
  private isValidTimestamp(timestamp: string): boolean {
    if (!timestamp || typeof timestamp !== 'string') {
      return false;
    }

    const date = new Date(timestamp);
    return !isNaN(date.getTime()) && date.toISOString() === timestamp;
  }

  /**
   * Checks if a message falls within the specified time period
   * @param message - The message to check
   * @param period - The time period to check against
   * @returns true if message is within period, false otherwise
   */
  private isMessageInPeriod(message: WhatsAppMessage, period: TimePeriod): boolean {
    const messageDate = new Date(message.timestamp);
    const startDate = new Date(period.start);
    const endDate = new Date(period.end);

    return messageDate >= startDate && messageDate < endDate;
  }

  /**
   * Removes duplicate messages based on chat_id, sender_id, timestamp, and text
   * @param messages - Array of messages to deduplicate
   * @returns Array of unique messages
   */
  private removeDuplicates(messages: WhatsAppMessage[]): WhatsAppMessage[] {
    const seen = new Set<string>();
    const uniqueMessages: WhatsAppMessage[] = [];

    for (const message of messages) {
      const key = this.getMessageKey(message);
      
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMessages.push(message);
      }
    }

    return uniqueMessages;
  }

  /**
   * Generates a unique key for a message based on its identifying properties
   * @param message - The message to generate a key for
   * @returns A unique string key
   */
  private getMessageKey(message: WhatsAppMessage): string {
    const key = `${message.chat_id}:${message.sender_id}:${message.timestamp}:${message.text}`;
    
    // Use cache if enabled
    if (this.options.enableCache && this.cache.size < this.options.cacheSize!) {
      this.cache.set(key, true);
    }
    
    return key;
  }

  /**
   * Clears the internal cache
   */
  public clearCache(): void {
    this.cache.clear();
  }

  /**
   * Gets the current cache size
   * @returns The number of items in the cache
   */
  public getCacheSize(): number {
    return this.cache.size;
  }
}