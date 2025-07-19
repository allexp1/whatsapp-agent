/**
 * Test file for the content extraction and classification system
 */

import { ContentClassifier } from '../classifier/ContentClassifier';
import { ContentExtractor } from './ContentExtractor';

// Sample messages for testing
const testMessages = [
  // Homework messages
  {
    text: "Math homework for tomorrow: Complete exercises 1-5 on pages 42-43",
    chat_id: "class-5a",
    sender_id: "teacher-math",
    timestamp: new Date(),
  },
  {
    text: "Please read chapter 7 in the English book and prepare a summary for next week",
    chat_id: "class-5a",
    sender_id: "teacher-english",
    timestamp: new Date(),
  },
  {
    text: "Science project due Friday! Don't forget to submit your volcano models",
    chat_id: "class-5a",
    sender_id: "teacher-science",
    timestamp: new Date(),
  },
  {
    text: "שיעורי בית במתמטיקה: לפתור תרגילים 10-15 בעמוד 67",
    chat_id: "class-5a",
    sender_id: "teacher-math",
    timestamp: new Date(),
  },

  // Schedule change messages
  {
    text: "Tomorrow's math class is cancelled due to teacher training",
    chat_id: "class-5a",
    sender_id: "school-admin",
    timestamp: new Date(),
  },
  {
    text: "PE class moved from gym to outdoor field - bring appropriate shoes!",
    chat_id: "class-5a",
    sender_id: "teacher-sports",
    timestamp: new Date(),
  },
  {
    text: "Science class time changed from 10:00 to 11:30 on Thursday",
    chat_id: "class-5a",
    sender_id: "teacher-science",
    timestamp: new Date(),
  },
  {
    text: "שיעור האנגלית של מחר נדחה לשבוע הבא",
    chat_id: "class-5a",
    sender_id: "teacher-english",
    timestamp: new Date(),
  },

  // Announcement messages
  {
    text: "Important: School field trip next Tuesday! Permission slips must be returned by Monday",
    chat_id: "class-5a",
    sender_id: "school-admin",
    timestamp: new Date(),
  },
  {
    text: "Reminder: Parent-teacher meetings this Thursday evening from 6-8 PM",
    chat_id: "class-5a",
    sender_id: "school-admin",
    timestamp: new Date(),
  },
  {
    text: "Please bring $10 for the class party on Friday",
    chat_id: "class-5a",
    sender_id: "teacher-homeroom",
    timestamp: new Date(),
  },
  {
    text: "תזכורת: אסיפת הורים ביום רביעי בשעה 18:00",
    chat_id: "class-5a",
    sender_id: "school-admin",
    timestamp: new Date(),
  },

  // Messages that should be filtered out
  {
    text: "Good morning everyone!",
    chat_id: "class-5a",
    sender_id: "teacher-homeroom",
    timestamp: new Date(),
  },
  {
    text: "Thanks",
    chat_id: "class-5a",
    sender_id: "parent-123",
    timestamp: new Date(),
  },
];

// Test content extraction
console.log("=== TESTING CONTENT EXTRACTION ===\n");

const extractor = new ContentExtractor();

console.log("Testing text preprocessing and entity extraction:");
testMessages.slice(0, 3).forEach((msg, index) => {
  console.log(`\nMessage ${index + 1}: "${msg.text}"`);
  const extracted = extractor.extractContent(msg.text);
  console.log("Processed text:", extracted.processedText);
  console.log("Subjects:", extracted.subjects);
  console.log("Dates:", extracted.dates);
  console.log("Pages:", extracted.pages);
  console.log("Exercise numbers:", extracted.exerciseNumbers);
  console.log("Importance score:", extractor.calculateImportance(msg.text));
});

// Test content classification
console.log("\n\n=== TESTING CONTENT CLASSIFICATION ===\n");

const classifier = new ContentClassifier();

console.log("Classifying all test messages:");
testMessages.forEach((msg, index) => {
  console.log(`\nMessage ${index + 1}: "${msg.text}"`);
  const result = classifier.classifyMessage(msg.text, {
    chat_id: msg.chat_id,
    sender_id: msg.sender_id,
    timestamp: msg.timestamp,
  });

  if (result) {
    console.log(`Type: ${result.item.type}`);
    console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
    console.log(`Content: ${result.item.content}`);
    
    // Show type-specific fields
    switch (result.item.type) {
      case 'homework':
        console.log(`Subject: ${result.item.subject || 'N/A'}`);
        console.log(`Due date: ${result.item.due_date || 'N/A'}`);
        console.log(`Assignment type: ${result.item.assignment_type}`);
        console.log(`Pages: ${result.item.pages || 'N/A'}`);
        break;
      case 'schedule_change':
        console.log(`Subject: ${result.item.subject || 'N/A'}`);
        console.log(`Change type: ${result.item.change_type}`);
        console.log(`New time: ${result.item.new_time || 'N/A'}`);
        console.log(`New location: ${result.item.new_location || 'N/A'}`);
        break;
      case 'announcement':
        console.log(`Announcement type: ${result.item.announcement_type}`);
        console.log(`Urgency: ${result.item.urgency}`);
        console.log(`Related date: ${result.item.related_date || 'N/A'}`);
        break;
    }
  } else {
    console.log("Not classified (filtered out)");
  }
});

// Test batch classification
console.log("\n\n=== TESTING BATCH CLASSIFICATION ===\n");

const stats = classifier.getClassificationStats(testMessages);
console.log("Classification Statistics:");
console.log(`Total messages: ${stats.total}`);
console.log(`Classified messages: ${stats.classified}`);
console.log(`Homework: ${stats.homework}`);
console.log(`Schedule changes: ${stats.scheduleChanges}`);
console.log(`Announcements: ${stats.announcements}`);
console.log(`Average confidence: ${(stats.avgConfidence * 100).toFixed(1)}%`);
console.log(`Filtered out: ${stats.total - stats.classified}`);

// Test edge cases
console.log("\n\n=== TESTING EDGE CASES ===\n");

const edgeCases = [
  {
    text: "hw pg 10-15 tmrw asap!!!",
    description: "Heavily abbreviated homework",
  },
  {
    text: "Math class 2:30 -> 3:45, room 201 -> 305",
    description: "Time and location change",
  },
  {
    text: "URGENT: Permission slips for tomorrow's field trip due TODAY by 3 PM!",
    description: "Urgent announcement with deadline",
  },
  {
    text: "Read pages 50-60 in history, exercises 1,2,3 in math, and bring art supplies",
    description: "Multiple subjects and tasks",
  },
];

edgeCases.forEach((testCase) => {
  console.log(`\nTest case: ${testCase.description}`);
  console.log(`Message: "${testCase.text}"`);
  
  const result = classifier.classifyMessage(testCase.text, {
    chat_id: "test",
    sender_id: "test",
    timestamp: new Date(),
  });
  
  if (result) {
    console.log(`Classified as: ${result.item.type} (${(result.confidence * 100).toFixed(1)}% confidence)`);
  } else {
    console.log("Not classified");
  }
});