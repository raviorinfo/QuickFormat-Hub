/**
 * Unix Timestamp, Epoch, and Timezone conversion utilities
 */

export const MAJOR_TIMEZONES = [
  { id: 'UTC', label: 'UTC (Coordinated Universal Time)', tz: 'UTC' },
  { id: 'EST', label: 'New York (EDT / EST)', tz: 'America/New_York' },
  { id: 'PST', label: 'San Francisco (PDT / PST)', tz: 'America/Los_Angeles' },
  { id: 'LON', label: 'London (BST / GMT)', tz: 'Europe/London' },
  { id: 'BER', label: 'Berlin / Paris (CEST / CET)', tz: 'Europe/Berlin' },
  { id: 'IST', label: 'India (IST)', tz: 'Asia/Kolkata' },
  { id: 'TYO', label: 'Tokyo (JST)', tz: 'Asia/Tokyo' },
  { id: 'SYD', label: 'Sydney (AEST)', tz: 'Australia/Sydney' },
];

export function parseTimestampInput(input) {
  if (!input || !String(input).trim()) {
    return null;
  }

  const raw = String(input).trim();
  let dateObj = null;

  // Check if purely numeric
  if (/^-?\d+$/.test(raw)) {
    const num = parseInt(raw, 10);
    // If < 10 digits or around 10 digits -> seconds, else ms
    if (Math.abs(num) < 1e11) {
      dateObj = new Date(num * 1000);
    } else {
      dateObj = new Date(num);
    }
  } else {
    // Try parse as date string
    const parsed = Date.parse(raw);
    if (!isNaN(parsed)) {
      dateObj = new Date(parsed);
    }
  }

  if (!dateObj || isNaN(dateObj.getTime())) {
    return { error: 'Invalid timestamp or date format. Enter epoch seconds/ms or ISO date.' };
  }

  const ms = dateObj.getTime();
  const sec = Math.floor(ms / 1000);

  // Relative human time
  const nowMs = Date.now();
  const diffSec = Math.floor((ms - nowMs) / 1000);
  let relativeText = 'just now';

  if (Math.abs(diffSec) >= 1) {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    if (Math.abs(diffSec) < 60) {
      relativeText = rtf.format(diffSec, 'second');
    } else if (Math.abs(diffSec) < 3600) {
      relativeText = rtf.format(Math.round(diffSec / 60), 'minute');
    } else if (Math.abs(diffSec) < 86400) {
      relativeText = rtf.format(Math.round(diffSec / 3600), 'hour');
    } else if (Math.abs(diffSec) < 2592000) {
      relativeText = rtf.format(Math.round(diffSec / 86400), 'day');
    } else {
      relativeText = rtf.format(Math.round(diffSec / 2592000), 'month');
    }
  }

  // Timezones table
  const timezones = MAJOR_TIMEZONES.map((tzDef) => {
    try {
      const formatted = new Intl.DateTimeFormat('en-US', {
        timeZone: tzDef.tz,
        dateStyle: 'full',
        timeStyle: 'medium',
      }).format(dateObj);
      return { ...tzDef, formatted };
    } catch {
      return { ...tzDef, formatted: dateObj.toUTCString() };
    }
  });

  return {
    dateObj,
    seconds: sec,
    milliseconds: ms,
    iso8601: dateObj.toISOString(),
    utcString: dateObj.toUTCString(),
    localString: dateObj.toLocaleString(),
    relativeText,
    timezones,
    error: null,
  };
}
