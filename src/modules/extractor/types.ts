/**
 * TypeScript interfaces for content extraction and classification
 */

/**
 * Base interface for all extracted content items
 */
export interface ExtractedItem {
  type: 'homework' | 'schedule_change' | 'announcement';
  chat_id: string;
  sender_id: string;
  timestamp: Date;
  content: string; // The extracted/cleaned text
  original_message: string; // Original message for reference
}

/**
 * Homework-specific fields
 */
export interface HomeworkItem extends ExtractedItem {
  type: 'homework';
  subject?: string;
  due_date?: Date;
  assignment_type?: 'exercise' | 'project' | 'reading' | 'other';
  pages?: string; // e.g., "pages 10-15"
}

/**
 * Schedule change-specific fields
 */
export interface ScheduleChangeItem extends ExtractedItem {
  type: 'schedule_change';
  subject?: string;
  change_type: 'time_change' | 'location_change' | 'cancellation' | 'reschedule';
  original_time?: Date;
  new_time?: Date;
  original_location?: string;
  new_location?: string;
}

/**
 * Announcement-specific fields
 */
export interface AnnouncementItem extends ExtractedItem {
  type: 'announcement';
  announcement_type?: 'event' | 'permission_slip' | 'notice' | 'other';
  urgency?: 'high' | 'medium' | 'low';
  related_date?: Date;
}

/**
 * Union type for all content items
 */
export type ContentItem = HomeworkItem | ScheduleChangeItem | AnnouncementItem;

/**
 * Confidence level for classification
 */
export interface ClassificationResult {
  item: ContentItem;
  confidence: number; // 0-1 scale
}

/**
 * Processing options for extraction
 */
export interface ExtractionOptions {
  expandAbbreviations?: boolean;
  extractDates?: boolean;
  extractSubjects?: boolean;
  normalizeText?: boolean;
}

/**
 * Subject mapping type
 */
export type SubjectMap = {
  [key: string]: string;
};