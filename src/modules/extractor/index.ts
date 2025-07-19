/**
 * Module exports for the content extraction and classification system
 */

// Export all types
export * from './types';

// Export patterns
export * from './patterns';

// Export main classes
export { ContentExtractor } from './ContentExtractor';
export { ContentClassifier } from '../classifier/ContentClassifier';

// Re-export commonly used types for convenience
export type {
  ExtractedItem,
  HomeworkItem,
  ScheduleChangeItem,
  AnnouncementItem,
  ContentItem,
  ClassificationResult,
  ExtractionOptions,
} from './types';