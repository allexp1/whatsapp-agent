/**
 * Content Classifier for WhatsApp messages
 * Rule-based classification into homework, schedule changes, and announcements
 */

import { ContentExtractor } from '../extractor/ContentExtractor';
import {
  HOMEWORK_PATTERNS,
  SCHEDULE_PATTERNS,
  ANNOUNCEMENT_PATTERNS,
  IMPORTANCE_INDICATORS,
} from '../extractor/patterns';
import {
  ContentItem,
  HomeworkItem,
  ScheduleChangeItem,
  AnnouncementItem,
  ClassificationResult,
} from '../extractor/types';

export class ContentClassifier {
  private extractor: ContentExtractor;

  constructor() {
    this.extractor = new ContentExtractor();
  }

  /**
   * Classify a message into homework, schedule change, or announcement
   */
  public classifyMessage(
    message: string,
    metadata: {
      chat_id: string;
      sender_id: string;
      timestamp: Date;
    }
  ): ClassificationResult | null {
    try {
      // Extract content and entities
      const extracted = this.extractor.extractContent(message);
      const { processedText, subjects, dates, pages, exerciseNumbers } = extracted;

      // Calculate importance score
      const importance = this.extractor.calculateImportance(processedText);

      // Skip messages with very low importance
      if (importance < 0.1) {
        return null;
      }

      // Check for homework patterns first (highest priority)
      const homeworkScore = this.calculateHomeworkScore(processedText);
      if (homeworkScore > 0.6) {
        return this.createHomeworkItem(
          processedText,
          message,
          metadata,
          subjects,
          dates,
          pages,
          exerciseNumbers || [],
          homeworkScore
        );
      }

      // Check for schedule change patterns
      const scheduleScore = this.calculateScheduleChangeScore(processedText);
      if (scheduleScore > 0.6) {
        return this.createScheduleChangeItem(
          processedText,
          message,
          metadata,
          subjects,
          dates,
          scheduleScore
        );
      }

      // Check if it's an important announcement
      const announcementScore = this.calculateAnnouncementScore(processedText, importance);
      if (announcementScore > 0.4) {
        return this.createAnnouncementItem(
          processedText,
          message,
          metadata,
          dates,
          announcementScore
        );
      }

      // Message doesn't fit any category with sufficient confidence
      return null;
    } catch (error) {
      console.error('Error classifying message:', error);
      return null;
    }
  }

  /**
   * Calculate homework classification score
   */
  private calculateHomeworkScore(text: string): number {
    let score = 0;

    // Check for homework keywords
    if (HOMEWORK_PATTERNS.keywords.test(text)) {
      score += 0.5;
    }

    // Check for page references
    if (HOMEWORK_PATTERNS.pages.test(text)) {
      score += 0.3;
    }

    // Check for exercise references
    if (HOMEWORK_PATTERNS.exercise.test(text)) {
      score += 0.3;
    }

    // Check for chapter references
    if (HOMEWORK_PATTERNS.chapter.test(text)) {
      score += 0.2;
    }

    // Check for action words
    const actionWords = /\b(complete|finish|solve|write|read|prepare|submit|do|make|השלים|לפתור|לכתוב|לקרוא|להכין|להגיש|לעשות)\b/i;
    if (actionWords.test(text)) {
      score += 0.2;
    }

    // Check for due date indicators
    const dueDateIndicators = /\b(due|deadline|by|until|before|submit by|להגשה|עד|לפני)\b/i;
    if (dueDateIndicators.test(text)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate schedule change classification score
   */
  private calculateScheduleChangeScore(text: string): number {
    let score = 0;

    // Check for schedule change keywords
    if (SCHEDULE_PATTERNS.keywords.test(text)) {
      score += 0.5;
    }

    // Check for time change patterns
    if (SCHEDULE_PATTERNS.timeChange.test(text)) {
      score += 0.4;
    }

    // Check for cancellation patterns
    if (SCHEDULE_PATTERNS.cancellation.test(text)) {
      score += 0.5;
    }

    // Check for location change patterns
    if (SCHEDULE_PATTERNS.locationChange.test(text)) {
      score += 0.3;
    }

    // Check for time references
    const timeReference = /\b(\d{1,2}:\d{2}|morning|afternoon|evening|בוקר|צהריים|ערב)\b/i;
    if (timeReference.test(text)) {
      score += 0.2;
    }

    // Check for day references
    const dayReference = /\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת)\b/i;
    if (dayReference.test(text)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate announcement classification score
   */
  private calculateAnnouncementScore(text: string, baseImportance: number): number {
    let score = baseImportance;

    // Check for event patterns
    if (ANNOUNCEMENT_PATTERNS.event.test(text)) {
      score += 0.3;
    }

    // Check for permission slip patterns
    if (ANNOUNCEMENT_PATTERNS.permissionSlip.test(text)) {
      score += 0.4;
    }

    // Check for urgent patterns
    if (ANNOUNCEMENT_PATTERNS.urgent.test(text)) {
      score += 0.3;
    }

    // Check for reminder patterns
    if (ANNOUNCEMENT_PATTERNS.reminder.test(text)) {
      score += 0.2;
    }

    // Check if it contains important information indicators
    const infoIndicators = /\b(please note|attention|important|for your information|FYI|שימו לב|חשוב|לידיעתכם)\b/i;
    if (infoIndicators.test(text)) {
      score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Create a homework item
   */
  private createHomeworkItem(
    processedText: string,
    originalMessage: string,
    metadata: { chat_id: string; sender_id: string; timestamp: Date },
    subjects: string[],
    dates: Date[],
    pages: string | undefined,
    exerciseNumbers: string[],
    confidence: number
  ): ClassificationResult {
    const homeworkItem: HomeworkItem = {
      type: 'homework',
      chat_id: metadata.chat_id,
      sender_id: metadata.sender_id,
      timestamp: metadata.timestamp,
      content: processedText,
      original_message: originalMessage,
      subject: subjects[0], // Take the first detected subject
      due_date: dates[0], // Take the first detected date as due date
      assignment_type: this.detectAssignmentType(processedText),
      pages,
    };

    return {
      item: homeworkItem,
      confidence,
    };
  }

  /**
   * Create a schedule change item
   */
  private createScheduleChangeItem(
    processedText: string,
    originalMessage: string,
    metadata: { chat_id: string; sender_id: string; timestamp: Date },
    subjects: string[],
    dates: Date[],
    confidence: number
  ): ClassificationResult {
    const changeType = this.detectChangeType(processedText);
    
    const scheduleItem: ScheduleChangeItem = {
      type: 'schedule_change',
      chat_id: metadata.chat_id,
      sender_id: metadata.sender_id,
      timestamp: metadata.timestamp,
      content: processedText,
      original_message: originalMessage,
      subject: subjects[0],
      change_type: changeType,
    };

    // Extract time information if available
    if (changeType === 'time_change' && dates.length >= 2) {
      scheduleItem.original_time = dates[0];
      scheduleItem.new_time = dates[1];
    } else if (dates.length > 0) {
      scheduleItem.new_time = dates[0];
    }

    // Extract location information if it's a location change
    if (changeType === 'location_change') {
      const locationMatch = processedText.match(/\b(?:room|class|חדר|כיתה)\s*(\w+)/i);
      if (locationMatch) {
        scheduleItem.new_location = locationMatch[1];
      }
    }

    return {
      item: scheduleItem,
      confidence,
    };
  }

  /**
   * Create an announcement item
   */
  private createAnnouncementItem(
    processedText: string,
    originalMessage: string,
    metadata: { chat_id: string; sender_id: string; timestamp: Date },
    dates: Date[],
    confidence: number
  ): ClassificationResult {
    const announcementItem: AnnouncementItem = {
      type: 'announcement',
      chat_id: metadata.chat_id,
      sender_id: metadata.sender_id,
      timestamp: metadata.timestamp,
      content: processedText,
      original_message: originalMessage,
      announcement_type: this.detectAnnouncementType(processedText),
      urgency: this.detectUrgency(processedText),
      related_date: dates[0],
    };

    return {
      item: announcementItem,
      confidence,
    };
  }

  /**
   * Detect assignment type from text
   */
  private detectAssignmentType(text: string): 'exercise' | 'project' | 'reading' | 'other' {
    if (/\b(exercise|תרגיל|תרגילים)\b/i.test(text)) {
      return 'exercise';
    }
    if (/\b(project|פרויקט|עבודה)\b/i.test(text)) {
      return 'project';
    }
    if (/\b(read|reading|chapter|pages|לקרוא|קריאה|פרק|עמודים)\b/i.test(text)) {
      return 'reading';
    }
    return 'other';
  }

  /**
   * Detect schedule change type
   */
  private detectChangeType(text: string): 'time_change' | 'location_change' | 'cancellation' | 'reschedule' {
    if (SCHEDULE_PATTERNS.cancellation.test(text)) {
      return 'cancellation';
    }
    if (SCHEDULE_PATTERNS.locationChange.test(text)) {
      return 'location_change';
    }
    if (SCHEDULE_PATTERNS.timeChange.test(text)) {
      return 'time_change';
    }
    return 'reschedule';
  }

  /**
   * Detect announcement type
   */
  private detectAnnouncementType(text: string): 'event' | 'permission_slip' | 'notice' | 'other' {
    if (ANNOUNCEMENT_PATTERNS.event.test(text)) {
      return 'event';
    }
    if (ANNOUNCEMENT_PATTERNS.permissionSlip.test(text)) {
      return 'permission_slip';
    }
    if (ANNOUNCEMENT_PATTERNS.reminder.test(text) || ANNOUNCEMENT_PATTERNS.urgent.test(text)) {
      return 'notice';
    }
    return 'other';
  }

  /**
   * Detect urgency level
   */
  private detectUrgency(text: string): 'high' | 'medium' | 'low' {
    if (IMPORTANCE_INDICATORS.high.test(text)) {
      return 'high';
    }
    if (IMPORTANCE_INDICATORS.medium.test(text)) {
      return 'medium';
    }
    if (IMPORTANCE_INDICATORS.low.test(text)) {
      return 'low';
    }
    return 'medium'; // Default to medium
  }

  /**
   * Batch classify multiple messages
   */
  public classifyMessages(
    messages: Array<{
      text: string;
      chat_id: string;
      sender_id: string;
      timestamp: Date;
    }>
  ): ClassificationResult[] {
    const results: ClassificationResult[] = [];

    for (const message of messages) {
      const result = this.classifyMessage(message.text, {
        chat_id: message.chat_id,
        sender_id: message.sender_id,
        timestamp: message.timestamp,
      });

      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Get classification statistics for debugging
   */
  public getClassificationStats(
    messages: Array<{ text: string; chat_id: string; sender_id: string; timestamp: Date }>
  ): {
    total: number;
    classified: number;
    homework: number;
    scheduleChanges: number;
    announcements: number;
    avgConfidence: number;
  } {
    const results = this.classifyMessages(messages);
    
    const stats = {
      total: messages.length,
      classified: results.length,
      homework: 0,
      scheduleChanges: 0,
      announcements: 0,
      totalConfidence: 0,
    };

    for (const result of results) {
      stats.totalConfidence += result.confidence;
      
      switch (result.item.type) {
        case 'homework':
          stats.homework++;
          break;
        case 'schedule_change':
          stats.scheduleChanges++;
          break;
        case 'announcement':
          stats.announcements++;
          break;
      }
    }

    return {
      total: stats.total,
      classified: stats.classified,
      homework: stats.homework,
      scheduleChanges: stats.scheduleChanges,
      announcements: stats.announcements,
      avgConfidence: stats.classified > 0 ? stats.totalConfidence / stats.classified : 0,
    };
  }
}