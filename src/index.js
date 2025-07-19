/**
 * JavaScript entry point for SchoolChatSummarizer
 * This file provides a simple wrapper for testing purposes
 */

// Since we don't have TypeScript compilation set up,
// we'll create a mock implementation that demonstrates the functionality
const { MessageFilter } = require('./modules/filter/demo.js');

class SchoolChatSummarizer {
  constructor(options = {}) {
    this.options = {
      minConfidence: options.minConfidence ?? 0.5,
      debug: options.debug ?? false,
      sortByTimestamp: options.sortByTimestamp ?? true,
      ...options
    };
    
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

  async process(input) {
    const startTime = Date.now();
    
    try {
      // Validate input
      if (!input || !Array.isArray(input.messages)) {
        throw new Error('messages must be an array');
      }
      if (!Array.isArray(input.subscribed_chats)) {
        throw new Error('subscribed_chats must be an array');
      }
      if (!input.period || !input.period.start || !input.period.end) {
        throw new Error('period with start and end timestamps is required');
      }
      
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
      
      // Reset stats
      this.stats = {
        totalMessages: input.messages.length,
        filteredMessages: 0,
        classifiedMessages: 0,
        itemsByType: {
          homework: 0,
          schedule_change: 0,
          announcement: 0,
        },
        processingTime: 0,
      };
      
      // Filter by subscription and time period
      const subscribedSet = new Set(input.subscribed_chats);
      const filteredMessages = input.messages.filter(msg => {
        if (!subscribedSet.has(msg.chat_id)) return false;
        
        const msgDate = new Date(msg.timestamp);
        return msgDate >= startDate && msgDate < endDate;
      });
      
      this.stats.filteredMessages = filteredMessages.length;
      
      // Simple classification logic
      const extractedItems = [];
      
      for (const msg of filteredMessages) {
        const lowerText = msg.text.toLowerCase();
        let classified = false;
        
        // Skip very short messages
        if (msg.text.trim().length < 5) continue;
        
        // Homework detection
        if (lowerText.match(/homework|assignment|exercise|complete|due|submit|page|chapter|תרגיל|להגשה|עמוד/)) {
          extractedItems.push({
            type: 'homework',
            chat_id: msg.chat_id,
            sender_id: msg.sender_id,
            timestamp: msg.timestamp,
            content: this.extractContent(msg.text)
          });
          this.stats.itemsByType.homework++;
          classified = true;
        }
        // Schedule change detection
        else if (lowerText.match(/cancel|postpone|reschedule|moved|change|instead|ביטול|דחה|שינוי/)) {
          extractedItems.push({
            type: 'schedule_change',
            chat_id: msg.chat_id,
            sender_id: msg.sender_id,
            timestamp: msg.timestamp,
            content: this.extractContent(msg.text)
          });
          this.stats.itemsByType.schedule_change++;
          classified = true;
        }
        // Announcement detection
        else if (lowerText.match(/reminder|attention|important|notice|field trip|permission|conference|meeting|תזכורת|חשוב|טיול|אישור/)) {
          extractedItems.push({
            type: 'announcement',
            chat_id: msg.chat_id,
            sender_id: msg.sender_id,
            timestamp: msg.timestamp,
            content: this.extractContent(msg.text)
          });
          this.stats.itemsByType.announcement++;
          classified = true;
        }
        
        if (classified) {
          this.stats.classifiedMessages++;
        }
      }
      
      // Sort by timestamp if requested
      if (this.options.sortByTimestamp) {
        extractedItems.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      }
      
      this.stats.processingTime = Date.now() - startTime;
      
      return {
        period: input.period,
        run_time: new Date().toISOString(),
        extracted_items: extractedItems
      };
      
    } catch (error) {
      this.stats.processingTime = Date.now() - startTime;
      throw new Error(`Failed to process messages: ${error.message}`);
    }
  }
  
  extractContent(text) {
    // Simple content extraction - remove common prefixes and clean up
    return text
      .replace(/^(good morning|hi|hello|reminder|attention|please note)[:\s]*/i, '')
      .replace(/[!]+$/, '')
      .trim();
  }
  
  getStats() {
    return { ...this.stats };
  }
  
  processSingleMessage(message, subscribedChats) {
    if (!subscribedChats.includes(message.chat_id)) {
      return null;
    }
    
    const input = {
      messages: [message],
      subscribed_chats: subscribedChats,
      period: {
        start: new Date(Date.now() - 86400000).toISOString(), // 24 hours ago
        end: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
      }
    };
    
    try {
      const result = this.process(input);
      return result.extracted_items[0] || null;
    } catch (error) {
      return null;
    }
  }
}

module.exports = { SchoolChatSummarizer };