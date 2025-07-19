/**
 * Test data for SchoolChatSummarizer tests
 * Contains various message types in English and Hebrew
 */

import { InputMessage, SummarizerInput } from '../types';

// Helper function to create a message
export function createMessage(
  text: string,
  chat_id: string = 'chat_001',
  sender_id: string = 'teacher_001',
  timestamp: string = '2025-01-15T10:00:00.000Z'
): InputMessage {
  return { chat_id, sender_id, timestamp, text };
}

// Helper function to create test input
export function createTestInput(
  messages: InputMessage[],
  subscribed_chats: string[] = ['chat_001', 'chat_002'],
  period: { start: string; end: string } = {
    start: '2025-01-01T00:00:00.000Z',
    end: '2025-01-31T23:59:59.999Z'
  }
): SummarizerInput {
  return { messages, subscribed_chats, period };
}

// Test Messages - Homework
export const HOMEWORK_MESSAGES = {
  english: {
    math_basic: createMessage(
      'Math homework: Please complete exercises 1-10 on page 45. Due tomorrow.',
      'chat_001',
      'teacher_001',
      '2025-01-15T10:00:00.000Z'
    ),
    science_detailed: createMessage(
      'Science assignment: Read chapter 5 about photosynthesis and answer questions 1-5 on page 89. Submit by Friday.',
      'chat_001',
      'teacher_002',
      '2025-01-15T11:30:00.000Z'
    ),
    english_project: createMessage(
      'English project: Write a 500-word essay on your favorite book. Include introduction, body, and conclusion. Due next Monday.',
      'chat_002',
      'teacher_003',
      '2025-01-15T14:00:00.000Z'
    ),
    multiple_subjects: createMessage(
      'Homework for tomorrow: Math pages 23-24, English worksheet 5, History read chapter 3',
      'chat_001',
      'teacher_001',
      '2025-01-16T08:00:00.000Z'
    ),
  },
  hebrew: {
    math_basic: createMessage(
      'שיעורי בית במתמטיקה: לפתור תרגילים 1-15 בעמוד 67. להגשה מחר.',
      'chat_002',
      'teacher_004',
      '2025-01-15T12:00:00.000Z'
    ),
    literature: createMessage(
      'ספרות: לקרוא את הפרק השלישי ולכתוב סיכום של עמוד. להגשה ביום רביעי.',
      'chat_001',
      'teacher_005',
      '2025-01-15T13:00:00.000Z'
    ),
    mixed_language: createMessage(
      'שיעורי בית: Math exercises 5-10, תנ"ך - לקרוא פרק ב, Geography map on page 34',
      'chat_002',
      'teacher_001',
      '2025-01-16T09:00:00.000Z'
    ),
  },
};

// Test Messages - Schedule Changes
export const SCHEDULE_MESSAGES = {
  english: {
    class_cancelled: createMessage(
      'Important: Math class tomorrow is cancelled due to teacher illness. Students should use the time for self-study.',
      'chat_001',
      'principal_001',
      '2025-01-15T16:00:00.000Z'
    ),
    time_change: createMessage(
      'Schedule change: PE class moved from 10:00 to 14:00 tomorrow. Please bring your sports uniform.',
      'chat_001',
      'teacher_006',
      '2025-01-15T17:00:00.000Z'
    ),
    room_change: createMessage(
      'Notice: Science lab will be in room 205 instead of room 102 for the rest of the week.',
      'chat_002',
      'teacher_002',
      '2025-01-15T18:00:00.000Z'
    ),
    early_dismissal: createMessage(
      'Early dismissal today at 12:30 due to staff meeting. Buses will arrive accordingly.',
      'chat_001',
      'principal_001',
      '2025-01-16T07:00:00.000Z'
    ),
  },
  hebrew: {
    class_cancelled: createMessage(
      'שימו לב: שיעור היסטוריה מחר מבוטל. המורה בהשתלמות. נא להתכונן לשיעור אנגלית במקום.',
      'chat_002',
      'coordinator_001',
      '2025-01-15T19:00:00.000Z'
    ),
    time_change: createMessage(
      'שינוי במערכת: שיעור מוזיקה עובר מ-11:00 ל-13:00. נא להביא את החלילית.',
      'chat_001',
      'teacher_007',
      '2025-01-15T20:00:00.000Z'
    ),
    multiple_changes: createMessage(
      'שינויים למחר: מתמטיקה בכיתה 301 במקום 201, חינוך גופני מתחיל ב-9:00 במקום 8:00',
      'chat_002',
      'coordinator_001',
      '2025-01-16T06:30:00.000Z'
    ),
  },
};

// Test Messages - Announcements
export const ANNOUNCEMENT_MESSAGES = {
  english: {
    field_trip: createMessage(
      'Reminder: Science museum field trip next Tuesday. Permission slips must be returned by Friday. Cost is $15.',
      'chat_001',
      'teacher_002',
      '2025-01-15T21:00:00.000Z'
    ),
    parent_meeting: createMessage(
      'Parent-teacher conferences scheduled for next Thursday, 16:00-19:00. Please sign up for a time slot.',
      'chat_001',
      'principal_001',
      '2025-01-15T22:00:00.000Z'
    ),
    school_event: createMessage(
      'School talent show on February 5th at 18:00. Students interested in participating should register by January 25th.',
      'chat_002',
      'coordinator_002',
      '2025-01-16T10:00:00.000Z'
    ),
    urgent_notice: createMessage(
      'URGENT: Water fountain on 2nd floor is broken. Please use fountains on other floors until repairs are complete.',
      'chat_001',
      'maintenance_001',
      '2025-01-16T11:00:00.000Z'
    ),
  },
  hebrew: {
    ceremony: createMessage(
      'להורים: טקס סיום השנה יתקיים ב-15.6 בשעה 17:00. נא לשריין את התאריך.',
      'chat_002',
      'principal_001',
      '2025-01-16T12:00:00.000Z'
    ),
    permission_slip: createMessage(
      'תזכורת: טופס אישור לטיול השנתי חייב להיות מוגש עד יום ראשון. הטיול ב-20.3.',
      'chat_001',
      'teacher_008',
      '2025-01-16T13:00:00.000Z'
    ),
    dress_code: createMessage(
      'חשוב: מחר יום צילומים. כל התלמידים צריכים להגיע עם חולצה לבנה.',
      'chat_002',
      'coordinator_001',
      '2025-01-16T14:00:00.000Z'
    ),
  },
};

// Edge case messages
export const EDGE_CASE_MESSAGES = {
  empty: createMessage('', 'chat_001'),
  whitespace_only: createMessage('   \n\t  ', 'chat_001'),
  very_short: createMessage('Hi', 'chat_001'),
  very_long: createMessage('a'.repeat(5000), 'chat_001'),
  special_characters: createMessage('!@#$%^&*(){}[]|\\:;"\'<>,.?/', 'chat_001'),
  emojis_only: createMessage('😊📚✏️📝', 'chat_001'),
  mixed_emojis: createMessage('Math homework 📚: Complete exercises 1-5 ✏️', 'chat_001'),
  numbers_only: createMessage('12345 67890', 'chat_001'),
  url_in_message: createMessage(
    'Check homework at https://school.example.com/homework/math/page45',
    'chat_001'
  ),
  malformed_homework: createMessage('hmwrk mt pg 45-47 tmrw', 'chat_001'),
  ambiguous_content: createMessage(
    'Tomorrow we will discuss the test schedule and homework policy',
    'chat_001'
  ),
  multiple_types: createMessage(
    'Class cancelled tomorrow. Instead, complete homework pages 30-35. Field trip forms due Friday.',
    'chat_001'
  ),
  non_school_content: createMessage(
    'Happy birthday to Sarah! 🎂 Hope you have a wonderful day!',
    'chat_001'
  ),
  casual_conversation: createMessage(
    'Thanks for the update. Can someone share the notes from yesterday?',
    'chat_001',
    'parent_001'
  ),
};

// Invalid input test cases
export const INVALID_INPUTS = {
  null_messages: {
    messages: null as any,
    subscribed_chats: ['chat_001'],
    period: { start: '2025-01-01T00:00:00.000Z', end: '2025-01-31T23:59:59.999Z' }
  },
  empty_subscriptions: {
    messages: [HOMEWORK_MESSAGES.english.math_basic],
    subscribed_chats: [],
    period: { start: '2025-01-01T00:00:00.000Z', end: '2025-01-31T23:59:59.999Z' }
  },
  invalid_period: {
    messages: [HOMEWORK_MESSAGES.english.math_basic],
    subscribed_chats: ['chat_001'],
    period: { start: '2025-01-31T23:59:59.999Z', end: '2025-01-01T00:00:00.000Z' }
  },
  malformed_timestamp: {
    messages: [{
      chat_id: 'chat_001',
      sender_id: 'teacher_001',
      timestamp: 'not-a-valid-timestamp',
      text: 'Test message'
    }],
    subscribed_chats: ['chat_001'],
    period: { start: '2025-01-01T00:00:00.000Z', end: '2025-01-31T23:59:59.999Z' }
  },
  missing_required_fields: {
    messages: [{
      chat_id: 'chat_001',
      sender_id: 'teacher_001',
      // Missing timestamp
      text: 'Test message'
    } as any],
    subscribed_chats: ['chat_001'],
    period: { start: '2025-01-01T00:00:00.000Z', end: '2025-01-31T23:59:59.999Z' }
  }
};

// Large batch test data
export function generateLargeBatch(count: number = 1000): InputMessage[] {
  const messages: InputMessage[] = [];
  const messageTemplates = [
    ...Object.values(HOMEWORK_MESSAGES.english),
    ...Object.values(HOMEWORK_MESSAGES.hebrew),
    ...Object.values(SCHEDULE_MESSAGES.english),
    ...Object.values(SCHEDULE_MESSAGES.hebrew),
    ...Object.values(ANNOUNCEMENT_MESSAGES.english),
    ...Object.values(ANNOUNCEMENT_MESSAGES.hebrew),
  ];

  for (let i = 0; i < count; i++) {
    const template = messageTemplates[i % messageTemplates.length];
    const timestamp = new Date(2025, 0, 1 + Math.floor(i / 100), 10, i % 60, 0);
    
    messages.push({
      ...template,
      chat_id: i % 3 === 0 ? 'chat_001' : i % 3 === 1 ? 'chat_002' : 'chat_003',
      sender_id: `teacher_${(i % 10).toString().padStart(3, '0')}`,
      timestamp: timestamp.toISOString(),
      text: `${template.text} [Batch ${i}]`
    });
  }

  return messages;
}

// Test scenarios
export const TEST_SCENARIOS = {
  mixed_languages: [
    HOMEWORK_MESSAGES.english.math_basic,
    HOMEWORK_MESSAGES.hebrew.math_basic,
    SCHEDULE_MESSAGES.english.class_cancelled,
    SCHEDULE_MESSAGES.hebrew.class_cancelled,
    ANNOUNCEMENT_MESSAGES.english.field_trip,
    ANNOUNCEMENT_MESSAGES.hebrew.ceremony,
  ],
  
  all_homework: [
    ...Object.values(HOMEWORK_MESSAGES.english),
    ...Object.values(HOMEWORK_MESSAGES.hebrew),
  ],
  
  all_schedule_changes: [
    ...Object.values(SCHEDULE_MESSAGES.english),
    ...Object.values(SCHEDULE_MESSAGES.hebrew),
  ],
  
  all_announcements: [
    ...Object.values(ANNOUNCEMENT_MESSAGES.english),
    ...Object.values(ANNOUNCEMENT_MESSAGES.hebrew),
  ],
  
  edge_cases: Object.values(EDGE_CASE_MESSAGES),
  
  out_of_period: [
    createMessage('Math homework due tomorrow', 'chat_001', 'teacher_001', '2024-12-31T23:59:59.999Z'),
    createMessage('Science test next week', 'chat_001', 'teacher_002', '2025-02-01T00:00:00.000Z'),
  ],
  
  non_subscribed: [
    createMessage('Important announcement', 'chat_999', 'teacher_001', '2025-01-15T10:00:00.000Z'),
    createMessage('Homework assignment', 'unsubscribed_chat', 'teacher_002', '2025-01-15T11:00:00.000Z'),
  ],
  
  duplicates: [
    createMessage('Math homework page 45', 'chat_001', 'teacher_001', '2025-01-15T10:00:00.000Z'),
    createMessage('Math homework page 45', 'chat_001', 'teacher_001', '2025-01-15T10:00:00.000Z'),
    createMessage('Math homework page 45', 'chat_001', 'teacher_001', '2025-01-15T10:00:00.000Z'),
  ],
};