/**
 * High-performance client-side CSV to JSON parser & unflattening engine
 */

export function parseCsv(text, delimiter = 'auto') {
  if (!text || !text.trim()) {
    return [];
  }

  // Detect delimiter if auto
  let delim = delimiter;
  if (delim === 'auto') {
    const firstLine = text.split(/\r?\n/)[0] || '';
    const counts = {
      ',': (firstLine.match(/,/g) || []).length,
      ';': (firstLine.match(/;/g) || []).length,
      '\t': (firstLine.match(/\t/g) || []).length,
      '|': (firstLine.match(/\|/g) || []).length,
    };
    delim = Object.keys(counts).reduce((a, b) => (counts[a] > counts[b] ? a : b), ',');
    if (counts[delim] === 0) delim = ',';
  }

  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;
  let i = 0;
  const len = text.length;

  while (i < len) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        currentVal += '"';
        i += 2;
        continue;
      }
      inQuotes = !inQuotes;
      i++;
      continue;
    }

    if (!inQuotes && char === delim) {
      currentRow.push(currentVal);
      currentVal = '';
      i++;
      continue;
    }

    if (!inQuotes && (char === '\r' || char === '\n')) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentVal);
      currentVal = '';
      if (currentRow.length > 0 && !(currentRow.length === 1 && currentRow[0] === '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      i++;
      continue;
    }

    currentVal += char;
    i++;
  }

  // Flush last value
  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal);
    if (currentRow.length > 0 && !(currentRow.length === 1 && currentRow[0] === '')) {
      rows.push(currentRow);
    }
  }

  return { rows, detectedDelimiter: delim };
}

export function unflattenObject(flatObj, delimiter = '.') {
  const result = {};
  for (const key of Object.keys(flatObj)) {
    const value = flatObj[key];
    const parts = key.split(delimiter);
    let curr = result;
    for (let p = 0; p < parts.length; p++) {
      const part = parts[p];
      if (p === parts.length - 1) {
        curr[part] = value;
      } else {
        if (!curr[part] || typeof curr[part] !== 'object' || Array.isArray(curr[part])) {
          curr[part] = {};
        }
        curr = curr[part];
      }
    }
  }
  return result;
}

export function csvToJson(csvText, options = {}) {
  const {
    delimiter = 'auto',
    hasHeader = true,
    parseNumbers = true,
    parseBooleans = true,
    unflatten = true,
    unflattenDelimiter = '.',
    outputFormat = 'array', // 'array' | 'object'
  } = options;

  const { rows, detectedDelimiter } = parseCsv(csvText, delimiter);

  if (rows.length === 0) {
    return { json: '[]', records: [], rowCount: 0, colCount: 0, delimiter: detectedDelimiter };
  }

  let headers = [];
  let dataRows = [];

  if (hasHeader) {
    headers = rows[0].map((h, idx) => (h && h.trim() ? h.trim() : `column_${idx + 1}`));
    dataRows = rows.slice(1);
  } else {
    const maxCols = Math.max(...rows.map((r) => r.length));
    headers = Array.from({ length: maxCols }, (_, idx) => `column_${idx + 1}`);
    dataRows = rows;
  }

  const coerce = (val) => {
    if (val === null || val === undefined) return null;
    const str = String(val).trim();
    if (str === '') return '';

    if (parseBooleans) {
      if (str.toLowerCase() === 'true') return true;
      if (str.toLowerCase() === 'false') return false;
    }

    if (parseNumbers && !isNaN(Number(str)) && str !== '') {
      return Number(str);
    }

    return val;
  };

  const records = dataRows.map((row) => {
    const obj = {};
    headers.forEach((header, colIdx) => {
      const rawVal = row[colIdx] !== undefined ? row[colIdx] : '';
      obj[header] = coerce(rawVal);
    });

    return unflatten ? unflattenObject(obj, unflattenDelimiter) : obj;
  });

  let formattedOutput;
  if (outputFormat === 'object') {
    const keyed = {};
    records.forEach((rec, idx) => {
      const key = rec.id || `item_${idx + 1}`;
      keyed[key] = rec;
    });
    formattedOutput = JSON.stringify(keyed, null, 2);
  } else {
    formattedOutput = JSON.stringify(records, null, 2);
  }

  return {
    json: formattedOutput,
    records,
    headers,
    rowCount: records.length,
    colCount: headers.length,
    detectedDelimiter,
  };
}

export const SAMPLE_CSV = `id,customer.name,customer.email,customer.city,plan,billing.amount,billing.currency,active
ORD-101,Maya Lin,maya.lin@designworks.io,Stockholm,Enterprise,349.00,EUR,true
ORD-102,David O'Connor,david@celticfin.ie,Dublin,Growth,129.50,EUR,true
ORD-103,Sarah Chen,schen@singaporeai.sg,Singapore,Starter,49.00,USD,false
ORD-104,Lucas Rossi,lucas@milano-studio.it,Milan,Enterprise,349.00,EUR,true
ORD-105,Amara Okafor,amara@africatech.ng,Lagos,Growth,129.50,USD,true`;
