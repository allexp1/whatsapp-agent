/**
 * Message Filter Module
 * 
 * This module provides functionality for filtering WhatsApp messages
 * based on chat subscriptions, time periods, and duplicate removal.
 * 
 * @module filter
 */

// Export the main MessageFilter class
export { MessageFilter } from './MessageFilter';

// Export all types
export {
  WhatsAppMessage,
  TimePeriod,
  FilterInput,
  FilterOptions,
  FilterResult
} from './types';

// Export a default instance for convenience
import { MessageFilter } from './MessageFilter';
export default new MessageFilter();