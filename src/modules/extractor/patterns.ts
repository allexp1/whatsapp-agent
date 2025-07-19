/**
 * Regex patterns and keywords for content classification
 */

/**
 * Subject patterns and keywords
 */
export const SUBJECT_PATTERNS: { [key: string]: RegExp } = {
  math: /\b(math|mathematics|algebra|geometry|calculus|מתמטיקה|חשבון|אלגברה|גאומטריה)\b/i,
  science: /\b(science|biology|chemistry|physics|lab|מדעים|ביולוגיה|כימיה|פיזיקה|מעבדה)\b/i,
  english: /\b(english|literature|reading|אנגלית|ספרות|קריאה)\b/i,
  hebrew: /\b(hebrew|עברית|לשון|דקדוק)\b/i,
  history: /\b(history|היסטוריה|תולדות)\b/i,
  geography: /\b(geography|גאוגרפיה|גיאוגרפיה)\b/i,
  sports: /\b(sports|gym|pe|physical education|ספורט|התעמלות|חינוך גופני)\b/i,
  art: /\b(art|drawing|painting|אמנות|ציור)\b/i,
  music: /\b(music|מוזיקה|נגינה)\b/i,
  technology: /\b(technology|computers|tech|טכנולוגיה|מחשבים)\b/i,
};

/**
 * Homework-related patterns
 */
export const HOMEWORK_PATTERNS = {
  keywords: /\b(homework|assignment|exercise|project|quiz|test|exam|pages|chapter|read|write|complete|solve|prepare|submit|due|deadline|שיעורי בית|תרגיל|מטלה|פרויקט|מבחן|בוחן|עמודים|פרק|לקרוא|לכתוב|להשלים|לפתור|להכין|להגיש|להגשה)\b/i,
  pages: /\b(pages?|עמודים?|עמ׳)\s*(\d+[-–]\d+|\d+)/i,
  exercise: /\b(exercise|תרגיל)\s*(\d+\.?\d*)/i,
  chapter: /\b(chapter|פרק)\s*(\d+)/i,
};

/**
 * Schedule change patterns
 */
export const SCHEDULE_PATTERNS = {
  keywords: /\b(changed|moved|cancelled|canceled|postponed|rescheduled|new time|new location|instead of|שונה|הועבר|בוטל|נדחה|זמן חדש|מיקום חדש|במקום)\b/i,
  timeChange: /\b(time changed|new time|moved to|rescheduled to|שעה שונתה|שעה חדשה|הועבר ל)\b/i,
  cancellation: /\b(cancelled|canceled|no class|class cancelled|בוטל|אין שיעור|השיעור בוטל)\b/i,
  locationChange: /\b(room|location|place|moved to room|חדר|מיקום|מקום|עבר לחדר)\b/i,
};

/**
 * Announcement patterns
 */
export const ANNOUNCEMENT_PATTERNS = {
  event: /\b(event|field trip|ceremony|performance|party|meeting|אירוע|טיול|טקס|הופעה|מסיבה|פגישה|אסיפת הורים)\b/i,
  permissionSlip: /\b(permission slip|form|signature|sign|return|אישור|טופס|חתימה|לחתום|להחזיר)\b/i,
  urgent: /\b(urgent|important|attention|immediately|asap|דחוף|חשוב|לתשומת לב|מיידי|בהקדם)\b/i,
  reminder: /\b(reminder|don't forget|remember|תזכורת|אל תשכחו|לזכור)\b/i,
};

/**
 * Date and time patterns
 */
export const DATE_PATTERNS = {
  // Matches: tomorrow, today, next week, etc.
  relative: /\b(today|tomorrow|yesterday|next\s+\w+|this\s+\w+|היום|מחר|אתמול|השבוע|בשבוע הבא)\b/i,
  // Matches: 12/25, 25.12, 25-12
  numeric: /\b(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?\b/,
  // Matches: December 25, 25 December, 25 Dec
  textual: /\b(\d{1,2})\s*(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|ינואר|פברואר|מרץ|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר)\b|\b(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|ינואר|פברואר|מרץ|אפריל|מאי|יוני|יולי|אוגוסט|ספטמבר|אוקטובר|נובמבר|דצמבר)\s*(\d{1,2})\b/i,
  // Matches: Monday, Tuesday, etc.
  weekday: /\b(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|Mon|Tue|Wed|Thu|Fri|Sat|Sun|ראשון|שני|שלישי|רביעי|חמישי|שישי|שבת|יום [א-ו]׳?)\b/i,
  // Matches: 10:30, 2:45 PM, 14:30
  time: /\b(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM|am|pm)?\b/,
};

/**
 * Common abbreviations to expand
 */
export const ABBREVIATIONS: { [key: string]: string } = {
  'hw': 'homework',
  'pgs': 'pages',
  'pg': 'page',
  'ch': 'chapter',
  'ex': 'exercise',
  'q': 'question',
  'asap': 'as soon as possible',
  'tmrw': 'tomorrow',
  'tmr': 'tomorrow',
  'thx': 'thanks',
  'pls': 'please',
  'plz': 'please',
  'u': 'you',
  'ur': 'your',
  'r': 'are',
  'b4': 'before',
  '2day': 'today',
  '2morrow': 'tomorrow',
  '2mrw': 'tomorrow',
  // Hebrew abbreviations
  'ש״ב': 'שיעורי בית',
  'עמ׳': 'עמודים',
  'תר׳': 'תרגיל',
};

/**
 * Stop words to filter out (for importance detection)
 */
export const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
  'of', 'with', 'by', 'from', 'about', 'as', 'is', 'was', 'are', 'were',
  'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
  'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what', 'which',
  'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every', 'some',
  'few', 'more', 'most', 'other', 'such', 'only', 'own', 'so', 'than',
  'too', 'very', 'just', 'now',
  // Hebrew stop words
  'של', 'את', 'על', 'עם', 'אל', 'מן', 'בין', 'כל', 'גם', 'רק', 'עוד',
  'היה', 'הוא', 'היא', 'הם', 'הן', 'אני', 'אתה', 'את', 'אנחנו', 'אתם',
]);

/**
 * Importance indicators for general announcements
 */
export const IMPORTANCE_INDICATORS = {
  high: /\b(urgent|important|critical|must|required|mandatory|deadline|דחוף|חשוב|קריטי|חובה|נדרש|דד-ליין)\b/i,
  medium: /\b(please|kindly|reminder|note|attention|בבקשה|תזכורת|שימו לב|לתשומת)\b/i,
  low: /\b(optional|if possible|maybe|perhaps|אופציונלי|אם אפשר|אולי)\b/i,
};