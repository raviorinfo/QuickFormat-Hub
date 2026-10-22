/**
 * Shared Universal Spreadsheet & Delimited Text Parser
 * Supports:
 * - Standard CSV (comma-separated with quotes and multiline support)
 * - TSV (tab-separated, standard for Excel & Google Sheets copy-paste)
 * - Semicolon-separated CSV (European Excel exports)
 * 100% Client-Side, Air-Gapped, Zero External Data Transmission.
 */

/**
 * Detects delimiter in the input text (comma, tab, or semicolon).
 */
export function detectDelimiter(text) {
  if (!text) return ',';
  const firstLine = text.split(/\r?\n/)[0] || '';
  const tabs = (firstLine.match(/\t/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  const semicolons = (firstLine.match(/;/g) || []).length;

  if (tabs > commas && tabs > semicolons) return '\t';
  if (semicolons > commas && semicolons > tabs) return ';';
  return ',';
}

/**
 * Parses raw delimited text into an array of row arrays.
 * Handles quoted fields containing commas/newlines.
 */
export function parseDelimitedText(text, explicitDelimiter = null) {
  if (!text || !text.trim()) return [];

  const delimiter = explicitDelimiter || detectDelimiter(text);
  const rows = [];
  let currentRow = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n of \r\n
      }
      currentRow.push(currentField.trim());
      if (currentRow.some((f) => f.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  // Push last field & row if remaining
  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((f) => f.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Detects headers and returns column indices and normalized data rows.
 */
export function analyzeSpreadsheetData(rows) {
  if (!rows || rows.length === 0) {
    return { hasHeader: false, headers: [], dataRows: [] };
  }

  const firstRow = rows[0];
  const firstRowStr = firstRow.join(' ').toLowerCase();

  // Common header keywords across commerce tools
  const headerKeywords = [
    'name', 'product', 'title', 'sku', 'barcode', 'gtin', 'ean', 'upc',
    'code', 'price', 'mrp', 'selling', 'cost', 'discount', 'badge',
    'desc', 'description', 'payload', 'url', 'link', 'customer', 'note'
  ];

  const matchCount = firstRow.filter((cell) =>
    headerKeywords.some((kw) => cell.toLowerCase().includes(kw))
  ).length;

  const hasHeader = matchCount >= 1;
  const headers = hasHeader
    ? firstRow.map((h, i) => h || `Column ${i + 1}`)
    : firstRow.map((_, i) => `Column ${i + 1}`);

  const dataRows = hasHeader ? rows.slice(1) : rows;

  return {
    hasHeader,
    headers,
    dataRows,
    totalCount: dataRows.length,
  };
}

/**
 * Maps row columns by name or index.
 */
export function mapRowFields(row, columnMap) {
  const result = {};
  for (const [key, colIdx] of Object.entries(columnMap)) {
    result[key] = colIdx >= 0 && colIdx < row.length ? row[colIdx] : '';
  }
  return result;
}
