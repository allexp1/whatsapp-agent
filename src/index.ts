/**
 * School Chat Summarizer - Main exports
 */

// Main orchestrator
export { SchoolChatSummarizer } from './SchoolChatSummarizer';

// Types
export {
  SummarizerInput,
  SummarizerOutput,
  SummarizerOptions,
  SummarizerStats,
  InputMessage,
  Period,
  ExtractedOutputItem,
} from './types';

// Re-export individual modules for advanced usage
export { MessageFilter } from './modules/filter/MessageFilter';
export { ContentClassifier } from './modules/classifier/ContentClassifier';
export { ContentExtractor } from './modules/extractor/ContentExtractor';

// Re-export module types for advanced usage
export {
  WhatsAppMessage,
  FilterInput,
  FilterResult,
  FilterOptions,
  TimePeriod,
} from './modules/filter/types';

export {
  ContentItem,
  HomeworkItem,
  ScheduleChangeItem,
  AnnouncementItem,
  ClassificationResult,
  ExtractedItem,
  ExtractionOptions,
} from './modules/extractor/types';

// Export patterns for custom implementations
export {
  HOMEWORK_PATTERNS,
  SCHEDULE_PATTERNS,
  ANNOUNCEMENT_PATTERNS,
  IMPORTANCE_INDICATORS,
  DATE_PATTERNS,
  ABBREVIATIONS,
  SUBJECT_PATTERNS,
  STOP_WORDS,
} from './modules/extractor/patterns';