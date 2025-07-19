/**
 * SchoolChatSummarizer - Main orchestrator for processing WhatsApp messages
 * Integrates MessageFilter, ContentExtractor, and ContentClassifier
 */

import { MessageFilter } from './modules/filter/MessageFilter';
import { ContentClassifier } from './modules/classifier/ContentClassifier';
import {
  SummarizerInput,
  SummarizerOutput,
  SummarizerOptions,
  SummarizerStats,
  ExtractedOutputItem,
  InputMessage,
} from './types';
import {
  WhatsAppMessage,
  FilterInput,
  FilterResult,
} from './modules/filter/types';
import { ClassificationResult } from './modules/extractor/types';

export class SchoolChatSummarizer {
  private messageFilter: MessageFilter;
  private contentClassifier: ContentClassifier;
  private options: Required<SummarizerOptions>;
  private stats: SummarizerStats;

  constructor(options: SummarizerOptions = {}) {
    this.messageFilter = new MessageFilter();
    this.contentClassifier = new ContentClassifier();
    
    // Set default options
    this.options = {
      minConfidence: options.minConfidence ?? 0.5,
      debug: options.debug ?? false,
      sortByTimestamp: options.sortByTimestamp ?? true,
    };

    // Initialize stats
    this.stats = {
      totalMessages: 0,
      filteredMessages: 0,
      classifiedMessages: 0,
      itemsByType: {
        homework: 0,
        schedule_change: 0,
        announcement: 0,
      },
      processingTime: 0,
    };
  }

  /**
   * Process input messages and return structured output
   */
  public async process(input: SummarizerInput): Promise<SummarizerOutput> {
    const startTime = Date.now();

    try {
      // Validate input
      this.validateInput(input);

      // Reset stats for this run
      this.resetStats();
      this.stats.totalMessages = input.messages.length;

      if (this.options.debug) {
        console.log(`Processing ${input.messages.length} messages...`);
      }

      // Step 1: Filter messages
      const filteredMessages = await this.filterMessages(input);
      this.stats.filteredMessages = filteredMessages.length;

      if (this.options.debug) {
        console.log(`Filtered to ${filteredMessages.length} messages`);
      }

      // Step 2: Classify filtered messages
      const classifiedItems = await this.classifyMessages(filteredMessages);
      this.stats.classifiedMessages = classifiedItems.length;

      if (this.options.debug) {
        console.log(`Classified ${classifiedItems.length} items`);
      }

      // Step 3: Convert to output format
      const extractedItems = this.convertToOutputFormat(classifiedItems);

      // Step 4: Sort if requested
      if (this.options.sortByTimestamp) {
        extractedItems.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      }

      // Calculate processing time
      this.stats.processingTime = Date.now() - startTime;

      // Return the formatted output
      return {
        period: input.period,
        run_time: new Date().toISOString(),
        extracted_items: extractedItems,
      };

    } catch (error) {
      this.stats.processingTime = Date.now() - startTime;
      
      if (this.options.debug) {
        console.error('Error processing messages:', error);
      }
      
      throw new Error(`Failed to process messages: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get statistics from the last run
   */
  public getStats(): SummarizerStats {
    return { ...this.stats };
  }

  /**
   * Validate input structure
   */
  private validateInput(input: SummarizerInput): void {
    if (!input) {
      throw new Error('Input is required');
    }

    if (!Array.isArray(input.messages)) {
      throw new Error('messages must be an array');
    }

    if (!Array.isArray(input.subscribed_chats)) {
      throw new Error('subscribed_chats must be an array');
    }

    if (!input.period || !input.period.start || !input.period.end) {
      throw new Error('period with start and end timestamps is required');
    }

    // Validate ISO 8601 timestamps
    const startDate = new Date(input.period.start);
    const endDate = new Date(input.period.end);

    if (isNaN(startDate.getTime())) {
      throw new Error('period.start must be a valid ISO 8601 timestamp');
    }

    if (isNaN(endDate.getTime())) {
      throw new Error('period.end must be a valid ISO 8601 timestamp');
    }

    if (startDate >= endDate) {
      throw new Error('period.start must be before period.end');
    }

    // Validate messages
    input.messages.forEach((msg, index) => {
      if (!msg.chat_id || !msg.sender_id || !msg.timestamp || !msg.text) {
        throw new Error(`Invalid message at index ${index}: missing required fields`);
      }

      const msgDate = new Date(msg.timestamp);
      if (isNaN(msgDate.getTime())) {
        throw new Error(`Invalid timestamp in message at index ${index}`);
      }
    });
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      totalMessages: 0,
      filteredMessages: 0,
      classifiedMessages: 0,
      itemsByType: {
        homework: 0,
        schedule_change: 0,
        announcement: 0,
      },
      processingTime: 0,
    };
  }

  /**
   * Filter messages using MessageFilter
   */
  private async filterMessages(input: SummarizerInput): Promise<WhatsAppMessage[]> {
    // Convert input messages to WhatsAppMessage format
    const whatsappMessages: WhatsAppMessage[] = input.messages.map(msg => ({
      chat_id: msg.chat_id,
      sender_id: msg.sender_id,
      timestamp: msg.timestamp,
      text: msg.text,
    }));

    // Create filter input
    const filterInput: FilterInput = {
      messages: whatsappMessages,
      subscribed_chats: input.subscribed_chats,
      period: input.period,
    };

    // Apply filter
    const filterResult: FilterResult = this.messageFilter.filter(filterInput);

    if (this.options.debug) {
      console.log('Filter stats:', filterResult.stats);
    }

    return filterResult.messages;
  }

  /**
   * Classify messages using ContentClassifier
   */
  private async classifyMessages(messages: WhatsAppMessage[]): Promise<ClassificationResult[]> {
    const results: ClassificationResult[] = [];

    for (const message of messages) {
      try {
        const classificationResult = this.contentClassifier.classifyMessage(
          message.text,
          {
            chat_id: message.chat_id,
            sender_id: message.sender_id,
            timestamp: new Date(message.timestamp),
          }
        );

        if (classificationResult && classificationResult.confidence >= this.options.minConfidence) {
          results.push(classificationResult);
          
          // Update stats
          this.stats.itemsByType[classificationResult.item.type]++;
        }
      } catch (error) {
        if (this.options.debug) {
          console.error(`Failed to classify message: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    return results;
  }

  /**
   * Convert classified items to output format
   */
  private convertToOutputFormat(classifiedItems: ClassificationResult[]): ExtractedOutputItem[] {
    return classifiedItems.map(result => ({
      type: result.item.type,
      chat_id: result.item.chat_id,
      sender_id: result.item.sender_id,
      timestamp: result.item.timestamp.toISOString(),
      content: result.item.content,
    }));
  }

  /**
   * Process a single message (utility method)
   */
  public processSingleMessage(
    message: InputMessage,
    subscribedChats: string[]
  ): ExtractedOutputItem | null {
    // Check if message is from subscribed chat
    if (!subscribedChats.includes(message.chat_id)) {
      return null;
    }

    // Try to classify the message
    const result = this.contentClassifier.classifyMessage(
      message.text,
      {
        chat_id: message.chat_id,
        sender_id: message.sender_id,
        timestamp: new Date(message.timestamp),
      }
    );

    if (result && result.confidence >= this.options.minConfidence) {
      return {
        type: result.item.type,
        chat_id: result.item.chat_id,
        sender_id: result.item.sender_id,
        timestamp: result.item.timestamp.toISOString(),
        content: result.item.content,
      };
    }

    return null;
  }
}