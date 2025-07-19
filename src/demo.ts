/**
 * Demo script showing the complete flow of SchoolChatSummarizer
 */

import { SchoolChatSummarizer } from './SchoolChatSummarizer';
import { SummarizerInput } from './types';

// Sample input data
const sampleInput: SummarizerInput = {
  messages: [
    // Homework messages
    {
      chat_id: "class_5a_math",
      sender_id: "teacher_sarah",
      timestamp: "2024-01-15T08:30:00.000Z",
      text: "Good morning class! Don't forget to complete exercises 1-10 on page 42 for tomorrow."
    },
    {
      chat_id: "class_5a_english",
      sender_id: "teacher_john",
      timestamp: "2024-01-15T09:15:00.000Z",
      text: "Please read chapter 5 of Charlotte's Web and write a short summary. Due Wednesday."
    },
    {
      chat_id: "class_5a_science",
      sender_id: "teacher_mary",
      timestamp: "2024-01-15T10:00:00.000Z",
      text: "Science project proposals are due Friday. Remember to include your hypothesis!"
    },
    
    // Schedule change messages
    {
      chat_id: "class_5a_general",
      sender_id: "principal_david",
      timestamp: "2024-01-15T07:45:00.000Z",
      text: "ATTENTION: Tomorrow's assembly has been moved from 10am to 2pm in the main hall."
    },
    {
      chat_id: "class_5a_sports",
      sender_id: "coach_mike",
      timestamp: "2024-01-15T11:30:00.000Z",
      text: "PE class cancelled today due to rain. We'll have a makeup session on Thursday."
    },
    
    // Announcement messages
    {
      chat_id: "class_5a_general",
      sender_id: "teacher_sarah",
      timestamp: "2024-01-15T08:00:00.000Z",
      text: "Reminder: Permission slips for next week's field trip to the museum must be returned by Friday!"
    },
    {
      chat_id: "parents_5a",
      sender_id: "principal_david",
      timestamp: "2024-01-15T12:00:00.000Z",
      text: "Parent-teacher conferences are scheduled for next Tuesday evening. Please sign up for a time slot."
    },
    
    // Messages that should be filtered out (not subscribed)
    {
      chat_id: "class_6b_math",
      sender_id: "teacher_other",
      timestamp: "2024-01-15T09:00:00.000Z",
      text: "Class 6B: Complete worksheet 7 for tomorrow."
    },
    
    // Messages outside time period
    {
      chat_id: "class_5a_math",
      sender_id: "teacher_sarah",
      timestamp: "2024-01-14T15:00:00.000Z",
      text: "Yesterday's homework - complete exercises on page 38."
    },
    
    // Low importance messages that should be filtered out
    {
      chat_id: "class_5a_general",
      sender_id: "parent_jane",
      timestamp: "2024-01-15T10:30:00.000Z",
      text: "Thanks for the update!"
    },
    {
      chat_id: "class_5a_general",
      sender_id: "parent_bob",
      timestamp: "2024-01-15T10:31:00.000Z",
      text: "👍"
    }
  ],
  
  subscribed_chats: [
    "class_5a_math",
    "class_5a_english",
    "class_5a_science",
    "class_5a_general",
    "class_5a_sports",
    "parents_5a"
  ],
  
  period: {
    start: "2024-01-15T00:00:00.000Z",
    end: "2024-01-16T00:00:00.000Z"
  }
};

async function runDemo() {
  console.log('=== School Chat Summarizer Demo ===\n');
  
  try {
    // Create summarizer instance with debug enabled
    const summarizer = new SchoolChatSummarizer({
      minConfidence: 0.5,
      debug: true,
      sortByTimestamp: true
    });
    
    console.log('Processing messages...\n');
    
    // Process the input
    const output = await summarizer.process(sampleInput);
    
    // Get statistics
    const stats = summarizer.getStats();
    
    console.log('\n=== Processing Statistics ===');
    console.log(`Total messages: ${stats.totalMessages}`);
    console.log(`After filtering: ${stats.filteredMessages}`);
    console.log(`Successfully classified: ${stats.classifiedMessages}`);
    console.log(`- Homework: ${stats.itemsByType.homework}`);
    console.log(`- Schedule changes: ${stats.itemsByType.schedule_change}`);
    console.log(`- Announcements: ${stats.itemsByType.announcement}`);
    console.log(`Processing time: ${stats.processingTime}ms`);
    
    console.log('\n=== Final Output (JSON) ===\n');
    console.log(JSON.stringify(output, null, 2));
    
    // Also demonstrate single message processing
    console.log('\n=== Single Message Processing Example ===\n');
    
    const singleMessage = {
      chat_id: "class_5a_math",
      sender_id: "teacher_sarah",
      timestamp: "2024-01-15T14:00:00.000Z",
      text: "Urgent: Tomorrow's math test has been postponed to Friday due to scheduling conflicts."
    };
    
    const singleResult = summarizer.processSingleMessage(
      singleMessage,
      sampleInput.subscribed_chats
    );
    
    if (singleResult) {
      console.log('Single message classified as:', singleResult.type);
      console.log('Content:', singleResult.content);
    } else {
      console.log('Single message was not classified (low confidence or not relevant)');
    }
    
  } catch (error) {
    console.error('Error during demo:', error);
  }
}

// Run the demo
console.log('Starting demo...\n');
runDemo();