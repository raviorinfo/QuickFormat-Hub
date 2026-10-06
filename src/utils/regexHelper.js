/**
 * Regex Test Engine, Match Highlighter & Common Pattern Library
 */

export function executeRegex(pattern, flags, testText) {
  if (!pattern) {
    return { valid: true, matches: [], error: null };
  }

  try {
    const safeFlags = flags.includes('g') ? flags : `${flags}g`;
    const regex = new RegExp(pattern, safeFlags);
    const matches = [];

    let match;
    let limit = 0;
    while ((match = regex.exec(testText)) !== null && limit < 1000) {
      limit++;
      matches.push({
        index: match.index,
        matchText: match[0],
        groups: match.slice(1),
        length: match[0].length,
      });

      if (match[0].length === 0) {
        regex.lastIndex++;
      }
    }

    return { valid: true, matches, error: null };
  } catch (err) {
    return { valid: false, matches: [], error: err.message };
  }
}

export const REGEX_PATTERNS = [
  {
    name: 'Email Address',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    description: 'Matches standard RFC-compliant email addresses',
    sample: 'Contact support@quickformat.app or ceo.alex@globaltech.co.uk today!',
  },
  {
    name: 'URL / Web Address',
    pattern: 'https?:\\/\\/[\\w\\.-]+(?:\\.[a-zA-Z]{2,})[\\w\\/\\?%&=.-]*',
    flags: 'g',
    description: 'Matches HTTP/HTTPS web links with query parameters',
    sample: 'Visit https://quickformat.app/v2/tools?category=dev or http://localhost:5173.',
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    description: 'Matches valid IPv4 addresses from 0.0.0.0 to 255.255.255.255',
    sample: 'Server bound to 127.0.0.1 and gateway 192.168.1.254.',
  },
  {
    name: 'ISO 8601 Date & Time',
    pattern: '\\d{4}-\\d{2}-\\d{2}(?:T\\d{2}:\\d{2}:\\d{2}(?:\\.\\d+)?Z)?',
    flags: 'g',
    description: 'Matches YYYY-MM-DD and full ISO-8601 timestamps',
    sample: 'Event created on 2026-10-06T15:30:00Z and expires 2026-12-31.',
  },
  {
    name: 'Hex Color Code',
    pattern: '#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\\b',
    flags: 'g',
    description: 'Matches 3-digit and 6-digit CSS hex colors',
    sample: 'Theme uses #0284c7 for brand, #fff for background, and #1e293b for borders.',
  },
  {
    name: 'UUID v4',
    pattern: '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}',
    flags: 'g',
    description: 'Matches standard random UUID v4 identifiers',
    sample: 'Generated token: 550e8400-e29b-41d4-a716-446655440000.',
  },
];
