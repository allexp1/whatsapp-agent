/**
 * Content Extractor for WhatsApp messages
 * Handles text preprocessing and entity extraction
 */

import {
  SUBJECT_PATTERNS,
  HOMEWORK_PATTERNS,
  DATE_PATTERNS,
  ABBREVIATIONS,
  STOP_WORDS,
} from './patterns';
import { ExtractionOptions } from './types';

export class ContentExtractor {
  private options: Required<ExtractionOptions>;

  constructor(options: ExtractionOptions = {}) {
    this.options = {
      expandAbbreviations: true,
      extractDates: true,
      extractSubjects: true,
      normalizeText: true,
      ...options,
    };
  }

  /**
   * Main extraction method - processes text and extracts entities
   */
  public extractContent(text: string): {
    processedText: string;
    subjects: string[];
    dates: Date[];
    pages?: string;
    exerciseNumbers?: string[];
  } {
    let processedText = text;

    // Normalize text if enabled
    if (this.options.normalizeText) {
      processedText = this.normalizeText(processedText);
    }

    // Expand abbreviations if enabled
    if (this.options.expandAbbreviations) {
      processedText = this.expandAbbreviations(processedText);
    }

    // Extract entities
    const subjects = this.options.extractSubjects ? this.extractSubjects(processedText) : [];
    const dates = this.options.extractDates ? this.extractDates(processedText) : [];
    const pages = this.extractPages(processedText);
    const exerciseNumbers = this.extractExerciseNumbers(processedText);

    return {
      processedText,
      subjects,
      dates,
      pages,
      exerciseNumbers,
    };
  }

  /**
   * Normalize text by cleaning whitespace and formatting
   */
  private normalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .replace(/[""]/g, '"') // Normalize quotes
      .replace(/['']/g, "'") // Normalize apostrophes
      .trim();
  }

  /**
   * Expand common abbreviations
   */
  private expandAbbreviations(text: string): string {
    let expanded = text;
    
    // Sort abbreviations by length (longest first) to avoid partial replacements
    const sortedAbbreviations = Object.entries(ABBREVIATIONS)
      .sort(([a], [b]) => b.length - a.length);
    
    for (const [abbr, full] of sortedAbbreviations) {
      // Use word boundaries to avoid replacing parts of words
      const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
      expanded = expanded.replace(regex, full);
    }
    
    return expanded;
  }

  /**
   * Extract subjects from text
   */
  private extractSubjects(text: string): string[] {
    const subjects = new Set<string>();
    
    for (const [subject, pattern] of Object.entries(SUBJECT_PATTERNS)) {
      if (pattern.test(text)) {
        subjects.add(subject);
      }
    }
    
    return Array.from(subjects);
  }

  /**
   * Extract dates from text
   */
  private extractDates(text: string): Date[] {
    const dates: Date[] = [];
    const now = new Date();
    
    // Extract relative dates
    const relativeMatches = text.match(DATE_PATTERNS.relative);
    if (relativeMatches) {
      for (const match of relativeMatches) {
        const date = this.parseRelativeDate(match.toLowerCase(), now);
        if (date) dates.push(date);
      }
    }
    
    // Extract numeric dates (MM/DD or DD/MM)
    const numericMatches = text.matchAll(new RegExp(DATE_PATTERNS.numeric, 'g'));
    for (const match of numericMatches) {
      const date = this.parseNumericDate(match[1], match[2], match[3]);
      if (date) dates.push(date);
    }
    
    // Extract textual dates
    const textualMatches = text.matchAll(new RegExp(DATE_PATTERNS.textual, 'g'));
    for (const match of textualMatches) {
      const date = this.parseTextualDate(match[0]);
      if (date) dates.push(date);
    }
    
    return dates;
  }

  /**
   * Parse relative date expressions
   */
  private parseRelativeDate(text: string, baseDate: Date): Date | null {
    const date = new Date(baseDate);
    
    if (text.includes('today') || text.includes('היום')) {
      return date;
    } else if (text.includes('tomorrow') || text.includes('מחר')) {
      date.setDate(date.getDate() + 1);
      return date;
    } else if (text.includes('yesterday') || text.includes('אתמול')) {
      date.setDate(date.getDate() - 1);
      return date;
    } else if (text.includes('next week') || text.includes('השבוע הבא')) {
      date.setDate(date.getDate() + 7);
      return date;
    } else if (text.includes('this week') || text.includes('השבוע')) {
      // Return the end of current week (Friday)
      const dayOfWeek = date.getDay();
      const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
      date.setDate(date.getDate() + daysUntilFriday);
      return date;
    }
    
    return null;
  }

  /**
   * Parse numeric date (MM/DD or DD/MM format)
   */
  private parseNumericDate(day: string, month: string, year?: string): Date | null {
    try {
      const currentYear = new Date().getFullYear();
      const yearNum = year ? parseInt(year) : currentYear;
      const monthNum = parseInt(month) - 1; // JavaScript months are 0-indexed
      const dayNum = parseInt(day);
      
      // Try DD/MM format (common in Israel)
      let date = new Date(yearNum, monthNum, dayNum);
      
      // If date seems invalid, try MM/DD format
      if (date.getMonth() !== monthNum) {
        date = new Date(yearNum, dayNum - 1, parseInt(month));
      }
      
      // Validate the date
      if (!isNaN(date.getTime())) {
        return date;
      }
    } catch (error) {
      // Invalid date
    }
    
    return null;
  }

  /**
   * Parse textual date (e.g., "December 25" or "25 December")
   */
  private parseTextualDate(text: string): Date | null {
    const months: { [key: string]: number } = {
      'january': 0, 'jan': 0, 'ינואר': 0,
      'february': 1, 'feb': 1, 'פברואר': 1,
      'march': 2, 'mar': 2, 'מרץ': 2,
      'april': 3, 'apr': 3, 'אפריל': 3,
      'may': 4, 'מאי': 4,
      'june': 5, 'jun': 5, 'יוני': 5,
      'july': 6, 'jul': 6, 'יולי': 6,
      'august': 7, 'aug': 7, 'אוגוסט': 7,
      'september': 8, 'sep': 8, 'sept': 8, 'ספטמבר': 8,
      'october': 9, 'oct': 9, 'אוקטובר': 9,
      'november': 10, 'nov': 10, 'נובמבר': 10,
      'december': 11, 'dec': 11, 'דצמבר': 11,
    };
    
    try {
      const words = text.toLowerCase().split(/\s+/);
      let day: number | null = null;
      let month: number | null = null;
      
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Check if word is a month
        if (months.hasOwnProperty(word)) {
          month = months[word];
          
          // Check adjacent words for day
          if (i > 0 && /^\d+$/.test(words[i - 1])) {
            day = parseInt(words[i - 1]);
          } else if (i < words.length - 1 && /^\d+$/.test(words[i + 1])) {
            day = parseInt(words[i + 1]);
          }
        }
        
        // Check if word is a day number
        if (/^\d+$/.test(word)) {
          const num = parseInt(word);
          if (num >= 1 && num <= 31 && !day) {
            day = num;
          }
        }
      }
      
      if (day && month !== null) {
        const year = new Date().getFullYear();
        const date = new Date(year, month, day);
        
        // If date is in the past, assume next year
        if (date < new Date()) {
          date.setFullYear(year + 1);
        }
        
        return date;
      }
    } catch (error) {
      // Invalid date
    }
    
    return null;
  }

  /**
   * Extract page numbers from text
   */
  private extractPages(text: string): string | undefined {
    const match = text.match(HOMEWORK_PATTERNS.pages);
    if (match) {
      return match[0];
    }
    return undefined;
  }

  /**
   * Extract exercise numbers from text
   */
  private extractExerciseNumbers(text: string): string[] {
    const exercises: string[] = [];
    const matches = text.matchAll(new RegExp(HOMEWORK_PATTERNS.exercise, 'g'));
    
    for (const match of matches) {
      if (match[2]) {
        exercises.push(match[2]);
      }
    }
    
    return exercises;
  }

  /**
   * Calculate text importance based on keywords and structure
   */
  public calculateImportance(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    const contentWords = words.filter(word => !STOP_WORDS.has(word));
    
    if (contentWords.length === 0) return 0;
    
    // Base importance on ratio of content words
    let importance = contentWords.length / words.length;
    
    // Boost importance for certain patterns
    if (HOMEWORK_PATTERNS.keywords.test(text)) importance += 0.3;
    if (DATE_PATTERNS.numeric.test(text) || DATE_PATTERNS.relative.test(text)) importance += 0.2;
    if (/[!]/.test(text)) importance += 0.1; // Exclamation marks
    if (/\b(urgent|important|דחוף|חשוב)\b/i.test(text)) importance += 0.4;
    
    // Cap at 1.0
    return Math.min(importance, 1.0);
  }

  /**
   * Extract key phrases from text (for summary generation)
   */
  public extractKeyPhrases(text: string): string[] {
    const phrases: string[] = [];
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
      const words = sentence.trim().split(/\s+/);
      
      // Look for important phrase patterns
      for (let i = 0; i < words.length - 1; i++) {
        const word = words[i].toLowerCase();
        const nextWord = words[i + 1]?.toLowerCase();
        
        // Homework-related phrases
        if (HOMEWORK_PATTERNS.keywords.test(word) && nextWord) {
          phrases.push(`${words[i]} ${words[i + 1]}`);
        }
        
        // Subject + action phrases
        if (Object.values(SUBJECT_PATTERNS).some(p => p.test(word))) {
          if (i < words.length - 2) {
            phrases.push(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
          }
        }
      }
    }
    
    return [...new Set(phrases)]; // Remove duplicates
  }
}