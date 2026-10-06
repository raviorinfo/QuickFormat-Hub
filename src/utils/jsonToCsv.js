/**
 * Utility functions for JSON parsing, flattening, and converting to CSV/TSV
 */

export function flattenObject(obj, prefix = '', delimiter = '.', res = {}) {
  if (obj === null || obj === undefined) {
    res[prefix] = '';
    return res;
  }

  if (typeof obj !== 'object' || obj instanceof Date) {
    res[prefix] = obj;
    return res;
  }

  if (Array.isArray(obj)) {
    // If it's an array of primitives, join them
    const allPrimitives = obj.every(
      (item) => item === null || typeof item !== 'object'
    );
    if (allPrimitives) {
      res[prefix] = obj.join('; ');
      return res;
    }
    // Array of objects
    obj.forEach((item, index) => {
      const arrayKey = prefix ? `${prefix}[${index}]` : `[${index}]`;
      flattenObject(item, arrayKey, delimiter, res);
    });
    return res;
  }

  for (const key of Object.keys(obj)) {
    const propKey = prefix ? `${prefix}${delimiter}${key}` : key;
    const val = obj[key];
    if (
      val !== null &&
      typeof val === 'object' &&
      !Array.isArray(val) &&
      !(val instanceof Date)
    ) {
      flattenObject(val, propKey, delimiter, res);
    } else if (Array.isArray(val)) {
      const allPrimitives = val.every(
        (item) => item === null || typeof item !== 'object'
      );
      if (allPrimitives) {
        res[propKey] = val.join('; ');
      } else {
        val.forEach((item, index) => {
          flattenObject(item, `${propKey}[${index}]`, delimiter, res);
        });
      }
    } else {
      res[propKey] = val;
    }
  }

  return res;
}

export function parseJsonInput(rawInput) {
  if (!rawInput || !rawInput.trim()) {
    throw new Error('Input is empty. Please provide JSON text or load sample data.');
  }

  let parsed;
  try {
    parsed = JSON.parse(rawInput);
  } catch (err) {
    // Match line/column if possible
    const match = err.message.match(/at position (\d+)/);
    let extra = '';
    if (match && match[1]) {
      const pos = parseInt(match[1], 10);
      const lines = rawInput.slice(0, pos).split('\n');
      const lineNum = lines.length;
      const colNum = lines[lines.length - 1].length + 1;
      extra = ` (Line ${lineNum}, Column ${colNum})`;
    }
    throw new Error(`Invalid JSON syntax${extra}: ${err.message}`);
  }

  // Normalize into an array of items
  let records = [];
  if (Array.isArray(parsed)) {
    records = parsed;
  } else if (typeof parsed === 'object' && parsed !== null) {
    // Check if the object contains a property that is an array
    const arrayKeys = Object.keys(parsed).filter((k) => Array.isArray(parsed[k]));
    if (arrayKeys.length === 1 && parsed[arrayKeys[0]].length > 0) {
      records = parsed[arrayKeys[0]];
    } else {
      // Single object wrapped
      records = [parsed];
    }
  } else {
    throw new Error('JSON must be an array of objects or a single JSON object.');
  }

  if (records.length === 0) {
    throw new Error('JSON array is empty. No records found to convert.');
  }

  return records;
}

export function jsonToCsv(records, options = {}) {
  const {
    flatten = true,
    delimiter = ',',
    includeHeaders = true,
    quoteAll = false,
    flattenDelimiter = '.',
  } = options;

  if (!records || records.length === 0) {
    return { csv: '', headers: [], rows: [] };
  }

  // Process rows
  const processedRows = records.map((record) => {
    if (typeof record !== 'object' || record === null) {
      return { value: record };
    }
    return flatten
      ? flattenObject(record, '', flattenDelimiter)
      : record;
  });

  // Collect all unique headers across all records to prevent missing keys
  const headerSet = new Set();
  processedRows.forEach((row) => {
    Object.keys(row).forEach((k) => headerSet.add(k));
  });
  const headers = Array.from(headerSet);

  function escapeField(val) {
    if (val === null || val === undefined) {
      return quoteAll ? '""' : '';
    }
    const str = String(val);
    const mustQuote =
      quoteAll ||
      str.includes(delimiter) ||
      str.includes('"') ||
      str.includes('\n') ||
      str.includes('\r');

    if (mustQuote) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  const csvLines = [];

  if (includeHeaders) {
    csvLines.push(headers.map(escapeField).join(delimiter));
  }

  const tableRows = [];

  processedRows.forEach((row) => {
    const rowValues = headers.map((h) => (row[h] !== undefined ? row[h] : ''));
    csvLines.push(rowValues.map(escapeField).join(delimiter));
    tableRows.push(rowValues);
  });

  return {
    csv: csvLines.join('\r\n'),
    headers,
    rows: tableRows,
    rowCount: processedRows.length,
    colCount: headers.length,
  };
}

export const SAMPLE_JSON = JSON.stringify(
  [
    {
      id: "ORD-9401",
      customer: {
        name: "Elena Rostova",
        email: "elena.rostova@techmail.io",
        location: {
          city: "Berlin",
          country: "Germany",
          postalCode: "10115"
        }
      },
      plan: "Enterprise Pro",
      billing: {
        amount: 249.50,
        currency: "EUR",
        status: "Paid",
        method: "Stripe"
      },
      features: ["SSO", "Dedicated IP", "24/7 SLA"],
      active: true,
      lastLogin: "2026-10-04T08:14:22Z"
    },
    {
      id: "ORD-9402",
      customer: {
        name: "Kenji Takahashi",
        email: "kenji.t@nexuscorp.jp",
        location: {
          city: "Tokyo",
          country: "Japan",
          postalCode: "160-0022"
        }
      },
      plan: "Team Growth",
      billing: {
        amount: 89.00,
        currency: "USD",
        status: "Paid",
        method: "Credit Card"
      },
      features: ["Custom Domain", "Unlimited API"],
      active: true,
      lastLogin: "2026-10-05T12:45:10Z"
    },
    {
      id: "ORD-9403",
      customer: {
        name: "Marcus Vance",
        email: "m.vance@cloudbridge.ca",
        location: {
          city: "Toronto",
          country: "Canada",
          postalCode: "M5V 3L9"
        }
      },
      plan: "Starter Solo",
      billing: {
        amount: 29.00,
        currency: "USD",
        status: "Pending",
        method: "PayPal"
      },
      features: ["Basic Analytics"],
      active: false,
      lastLogin: "2026-09-28T19:30:00Z"
    },
    {
      id: "ORD-9404",
      customer: {
        name: "Amina Al-Mansoor",
        email: "amina@fintechgulf.ae",
        location: {
          city: "Dubai",
          country: "UAE",
          postalCode: "00000"
        }
      },
      plan: "Enterprise Pro",
      billing: {
        amount: 249.50,
        currency: "USD",
        status: "Paid",
        method: "Wire Transfer"
      },
      features: ["SSO", "Audit Logs", "Custom Contracts"],
      active: true,
      lastLogin: "2026-10-06T06:20:11Z"
    }
  ],
  null,
  2
);
