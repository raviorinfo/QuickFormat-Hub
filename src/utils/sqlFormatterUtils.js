/**
 * Pure client-side SQL Query Tokenizer, Formatter, and Minifier
 */

export const SQL_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
  'FULL JOIN', 'CROSS JOIN', 'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'ON', 'GROUP BY',
  'ORDER BY', 'HAVING', 'LIMIT', 'OFFSET', 'UNION', 'UNION ALL', 'INSERT INTO', 'VALUES',
  'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE', 'ALTER TABLE', 'WITH',
  'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'IN', 'NOT IN', 'BETWEEN', 'LIKE',
  'IS NULL', 'IS NOT NULL', 'EXISTS', 'NOT EXISTS', 'DISTINCT', 'COUNT', 'SUM', 'AVG',
  'MIN', 'MAX', 'OVER', 'PARTITION BY', 'ROW_NUMBER', 'RANK', 'DENSE_RANK', 'COALESCE'
];

const MAJOR_CLAUSES = [
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET',
  'UNION', 'UNION ALL', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'WITH'
];

const JOIN_CLAUSES = [
  'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL JOIN', 'CROSS JOIN',
  'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'JOIN'
];

export function formatSql(sql, options = {}) {
  if (!sql || !sql.trim()) return '';

  const {
    keywordCase = 'upper', // 'upper' | 'lower' | 'preserve'
    indent = '  ', // 2 spaces or 4 spaces
    commaBreak = false,
  } = options;

  // Clean comments and normalize spacing
  let cleaned = sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Protect string literals
  const stringLiterals = [];
  cleaned = cleaned.replace(/'(?:''|[^'])*'/g, (match) => {
    stringLiterals.push(match);
    return `__SQL_STR_${stringLiterals.length - 1}__`;
  });

  // Regex to match major clauses
  const allClauses = [
    ...MAJOR_CLAUSES,
    ...JOIN_CLAUSES,
    'AND', 'OR', 'ON'
  ];

  // Case normalization for keywords
  const keywordRegex = new RegExp(`\\b(${SQL_KEYWORDS.join('|')})\\b`, 'gi');
  cleaned = cleaned.replace(keywordRegex, (match) => {
    if (keywordCase === 'upper') return match.toUpperCase();
    if (keywordCase === 'lower') return match.toLowerCase();
    return match;
  });

  // Break lines before major clauses
  MAJOR_CLAUSES.forEach((clause) => {
    const reg = new RegExp(`\\s*\\b(${clause})\\b\\s*`, 'gi');
    cleaned = cleaned.replace(reg, '\n$1 ');
  });

  JOIN_CLAUSES.forEach((clause) => {
    const reg = new RegExp(`\\s*\\b(${clause})\\b\\s*`, 'gi');
    cleaned = cleaned.replace(reg, `\n${indent}$1 `);
  });

  // AND / OR inside WHERE clauses
  const andOrRegex = /\s*\b(AND|OR)\b\s*/gi;
  cleaned = cleaned.replace(andOrRegex, `\n${indent}$1 `);

  // Comma formatting
  if (commaBreak) {
    cleaned = cleaned.replace(/,\s*/g, `,\n${indent}`);
  }

  // Restore string literals
  stringLiterals.forEach((lit, idx) => {
    cleaned = cleaned.replace(`__SQL_STR_${idx}__`, lit);
  });

  // Clean trailing spaces and multiple blank lines
  return cleaned
    .split('\n')
    .map((line) => line.trimEnd())
    .filter((line, i, arr) => line || (i > 0 && arr[i - 1]))
    .join('\n')
    .trim();
}

export function minifySql(sql) {
  if (!sql || !sql.trim()) return '';
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function analyzeSqlQuery(sql) {
  if (!sql || !sql.trim()) {
    return { queryType: 'Unknown', tableCount: 0, joinCount: 0 };
  }

  const upper = sql.toUpperCase();
  let queryType = 'Query';
  if (/^\s*SELECT/i.test(upper)) queryType = 'SELECT (Read)';
  else if (/^\s*INSERT/i.test(upper)) queryType = 'INSERT (Write)';
  else if (/^\s*UPDATE/i.test(upper)) queryType = 'UPDATE (Mutate)';
  else if (/^\s*DELETE/i.test(upper)) queryType = 'DELETE (Remove)';
  else if (/^\s*CREATE/i.test(upper)) queryType = 'DDL (Create)';
  else if (/^\s*WITH/i.test(upper)) queryType = 'CTE (With)';

  const joinMatches = upper.match(/\bJOIN\b/g);
  const joinCount = joinMatches ? joinMatches.length : 0;

  const fromMatches = upper.match(/\bFROM\s+([a-zA-Z0-9_."]+)/gi) || [];
  const tableCount = fromMatches.length + joinCount;

  return { queryType, tableCount, joinCount };
}

export const SAMPLE_SQL = `with quarterly_revenue as (select o.customer_id, c.company_name, c.country, sum(o.total_amount) as gross_revenue, count(o.order_id) as total_orders from orders o inner join customers c on o.customer_id = c.id where o.status = 'completed' and o.created_at >= '2026-01-01' group by o.customer_id, c.company_name, c.country having sum(o.total_amount) > 10000) select qr.company_name, qr.country, qr.gross_revenue, rank() over (partition by qr.country order by qr.gross_revenue desc) as country_rank from quarterly_revenue qr order by qr.gross_revenue desc limit 50;`;
