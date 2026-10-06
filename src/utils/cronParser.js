/**
 * Cron Expression Parser, Plain-English Translator & Schedule Predictor
 */

export function parseCronExpression(cronStr) {
  if (!cronStr || !cronStr.trim()) {
    return { valid: false, error: 'Empty cron expression' };
  }

  const parts = cronStr.trim().split(/\s+/);
  if (parts.length !== 5) {
    return {
      valid: false,
      error: 'Standard cron requires exactly 5 fields: (minute hour day-of-month month day-of-week).',
    };
  }

  const [min, hour, dom, mon, dow] = parts;

  // Simple human translation heuristics
  let human = '';

  const formatHour = (h) => {
    const num = parseInt(h, 10);
    if (isNaN(num)) return h;
    const ampm = num >= 12 ? 'PM' : 'AM';
    const h12 = num % 12 === 0 ? 12 : num % 12;
    return `${h12} ${ampm}`;
  };

  if (min === '*' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    human = 'Every single minute';
  } else if (min.startsWith('*/') && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    human = `Every ${min.slice(2)} minutes`;
  } else if (min === '0' && hour === '*' && dom === '*' && mon === '*' && dow === '*') {
    human = 'Every hour, on the hour';
  } else if (min === '0' && hour.startsWith('*/') && dom === '*' && mon === '*' && dow === '*') {
    human = `Every ${hour.slice(2)} hours`;
  } else if (dom === '*' && mon === '*' && dow === '1-5') {
    human = `At ${hour.padStart(2, '0')}:${min.padStart(2, '0')}, Monday through Friday (Weekdays)`;
  } else if (dom === '*' && mon === '*' && dow === '*') {
    human = `At ${hour.padStart(2, '0')}:${min.padStart(2, '0')} every day`;
  } else if (dom === '1' && mon === '*' && dow === '*') {
    human = `At ${hour.padStart(2, '0')}:${min.padStart(2, '0')}, on the 1st day of every month`;
  } else {
    human = `At minute ${min}, hour ${hour}, day-of-month ${dom}, month ${mon}, day-of-week ${dow}`;
  }

  // Calculate next run occurrences (next 6 occurrences)
  const nextRuns = [];
  const start = new Date();
  let candidate = new Date(start.getTime() + 60000);
  candidate.setSeconds(0, 0);

  const matchPart = (val, pattern, minVal, maxVal) => {
    if (pattern === '*') return true;
    if (pattern.startsWith('*/')) {
      const step = parseInt(pattern.slice(2), 10);
      return val % step === 0;
    }
    if (pattern.includes('-')) {
      const [startRange, endRange] = pattern.split('-').map(Number);
      return val >= startRange && val <= endRange;
    }
    if (pattern.includes(',')) {
      return pattern.split(',').map(Number).includes(val);
    }
    return parseInt(pattern, 10) === val;
  };

  let loops = 0;
  while (nextRuns.length < 6 && loops < 10000) {
    loops++;
    const cMin = candidate.getMinutes();
    const cHour = candidate.getHours();
    const cDom = candidate.getDate();
    const cMon = candidate.getMonth() + 1;
    const cDow = candidate.getDay();

    if (
      matchPart(cMin, min, 0, 59) &&
      matchPart(cHour, hour, 0, 23) &&
      matchPart(cDom, dom, 1, 31) &&
      matchPart(cMon, mon, 1, 12) &&
      matchPart(cDow, dow, 0, 6)
    ) {
      nextRuns.push(new Date(candidate));
      candidate = new Date(candidate.getTime() + 60000);
    } else {
      candidate = new Date(candidate.getTime() + 60000);
    }
  }

  return {
    valid: true,
    parts: { min, hour, dom, mon, dow },
    humanText: human,
    nextRuns,
  };
}

export const CRON_PRESETS = [
  { label: 'Every 5 Minutes', cron: '*/5 * * * *' },
  { label: 'Every 15 Minutes', cron: '*/15 * * * *' },
  { label: 'Every Hour', cron: '0 * * * *' },
  { label: 'Daily at Midnight', cron: '0 0 * * *' },
  { label: 'Daily at 9:00 AM', cron: '0 9 * * *' },
  { label: 'Weekdays at 9:00 AM', cron: '0 9 * * 1-5' },
  { label: 'Every Sunday at Midnight', cron: '0 0 * * 0' },
  { label: '1st of Every Month', cron: '0 0 1 * *' },
];
