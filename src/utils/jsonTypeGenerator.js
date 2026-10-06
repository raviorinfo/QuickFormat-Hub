/**
 * Multi-Language Schema & Type Generator from JSON
 * Generates TypeScript, Zod Schema, Python Pydantic v2, and SQL DDL.
 */

function capitalize(str) {
  if (!str) return 'Root';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function inferType(val) {
  if (val === null || val === undefined) return 'any';
  if (typeof val === 'boolean') return 'boolean';
  if (typeof val === 'number') return Number.isInteger(val) ? 'integer' : 'number';
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(val)) return 'datetime';
    return 'string';
  }
  if (Array.isArray(val)) return 'array';
  if (typeof val === 'object') return 'object';
  return 'any';
}

// 1. TypeScript Generator
export function generateTypeScript(obj, rootName = 'RootObject') {
  const interfaces = [];

  function processObj(currentObj, name) {
    const lines = [];
    lines.push(`export interface ${name} {`);

    for (const [key, value] of Object.entries(currentObj)) {
      const type = inferType(value);
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;

      if (type === 'object' && value !== null) {
        const subName = `${name}_${capitalize(key)}`;
        processObj(value, subName);
        lines.push(`  ${safeKey}: ${subName};`);
      } else if (type === 'array') {
        if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
          const itemSubName = `${name}_${capitalize(key)}Item`;
          processObj(value[0], itemSubName);
          lines.push(`  ${safeKey}: ${itemSubName}[];`);
        } else if (value.length > 0) {
          const elemType = typeof value[0];
          lines.push(`  ${safeKey}: ${elemType}[];`);
        } else {
          lines.push(`  ${safeKey}: any[];`);
        }
      } else if (type === 'integer' || type === 'number') {
        lines.push(`  ${safeKey}: number;`);
      } else if (type === 'datetime') {
        lines.push(`  ${safeKey}: string; // ISO 8601 Date`);
      } else {
        lines.push(`  ${safeKey}: ${type};`);
      }
    }

    lines.push('}');
    interfaces.unshift(lines.join('\n'));
  }

  const target = Array.isArray(obj) ? (obj[0] || {}) : obj;
  processObj(target, rootName);
  return interfaces.join('\n\n');
}

// 2. Zod Schema Generator
export function generateZod(obj, rootName = 'Root') {
  const schemas = [];

  function processObj(currentObj, name) {
    const lines = [];
    lines.push(`export const ${name}Schema = z.object({`);

    for (const [key, value] of Object.entries(currentObj)) {
      const type = inferType(value);
      const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;

      if (type === 'object' && value !== null) {
        const subName = `${name}${capitalize(key)}`;
        processObj(value, subName);
        lines.push(`  ${safeKey}: ${subName}Schema,`);
      } else if (type === 'array') {
        if (value.length > 0 && typeof value[0] === 'object') {
          const itemSubName = `${name}${capitalize(key)}Item`;
          processObj(value[0], itemSubName);
          lines.push(`  ${safeKey}: z.array(${itemSubName}Schema),`);
        } else if (value.length > 0) {
          const elemType = typeof value[0];
          lines.push(`  ${safeKey}: z.array(z.${elemType}()),`);
        } else {
          lines.push(`  ${safeKey}: z.array(z.unknown()),`);
        }
      } else if (type === 'integer') {
        lines.push(`  ${safeKey}: z.number().int(),`);
      } else if (type === 'number') {
        lines.push(`  ${safeKey}: z.number(),`);
      } else if (type === 'datetime') {
        lines.push(`  ${safeKey}: z.string().datetime(),`);
      } else if (type === 'boolean') {
        lines.push(`  ${safeKey}: z.boolean(),`);
      } else {
        lines.push(`  ${safeKey}: z.string(),`);
      }
    }

    lines.push('});');
    lines.push(`export type ${name} = z.infer<typeof ${name}Schema>;`);
    schemas.unshift(lines.join('\n'));
  }

  const target = Array.isArray(obj) ? (obj[0] || {}) : obj;
  processObj(target, rootName);
  return `import { z } from 'zod';\n\n${schemas.join('\n\n')}`;
}

// 3. Python Pydantic v2 Generator
export function generatePydantic(obj, rootName = 'RootModel') {
  const models = [];

  function processObj(currentObj, name) {
    const lines = [];
    lines.push(`class ${name}(BaseModel):`);

    const entries = Object.entries(currentObj);
    if (entries.length === 0) {
      lines.push('    pass');
    }

    for (const [key, value] of entries) {
      const type = inferType(value);
      const pythonKey = key.replace(/[^a-zA-Z0-9_]/g, '_');

      if (type === 'object' && value !== null) {
        const subName = `${name}${capitalize(key)}`;
        processObj(value, subName);
        lines.push(`    ${pythonKey}: ${subName}`);
      } else if (type === 'array') {
        if (value.length > 0 && typeof value[0] === 'object') {
          const itemSubName = `${name}${capitalize(key)}Item`;
          processObj(value[0], itemSubName);
          lines.push(`    ${pythonKey}: List[${itemSubName}] = []`);
        } else if (value.length > 0) {
          const elemType = typeof value[0] === 'number' ? 'float' : typeof value[0];
          lines.push(`    ${pythonKey}: List[${elemType}] = []`);
        } else {
          lines.push(`    ${pythonKey}: List[Any] = []`);
        }
      } else if (type === 'integer') {
        lines.push(`    ${pythonKey}: int`);
      } else if (type === 'number') {
        lines.push(`    ${pythonKey}: float`);
      } else if (type === 'boolean') {
        lines.push(`    ${pythonKey}: bool`);
      } else if (type === 'datetime') {
        lines.push(`    ${pythonKey}: datetime`);
      } else {
        lines.push(`    ${pythonKey}: str`);
      }
    }

    models.unshift(lines.join('\n'));
  }

  const target = Array.isArray(obj) ? (obj[0] || {}) : obj;
  processObj(target, rootName);
  return `from pydantic import BaseModel, Field\nfrom typing import List, Optional, Any\nfrom datetime import datetime\n\n${models.join('\n\n')}`;
}

// 4. SQL DDL Generator
export function generateSql(obj, tableName = 'records') {
  const target = Array.isArray(obj) ? (obj[0] || {}) : obj;
  const lines = [`CREATE TABLE ${tableName} (`];
  lines.push('    id SERIAL PRIMARY KEY,');

  const entries = Object.entries(target).filter(([k]) => k !== 'id');
  entries.forEach(([key, value], idx) => {
    const isLast = idx === entries.length - 1;
    const colName = key.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const type = inferType(value);

    let sqlType = 'VARCHAR(255)';
    if (type === 'integer') sqlType = 'INTEGER';
    else if (type === 'number') sqlType = 'NUMERIC(12, 2)';
    else if (type === 'boolean') sqlType = 'BOOLEAN';
    else if (type === 'datetime') sqlType = 'TIMESTAMPTZ';
    else if (type === 'object' || type === 'array') sqlType = 'JSONB';

    lines.push(`    ${colName} ${sqlType}${isLast ? '' : ','}`);
  });

  lines.push(');');
  return lines.join('\n');
}

export const SAMPLE_SCHEMA_JSON = JSON.stringify(
  {
    orderId: "ORD-94819",
    customer: {
      name: "Marcus Vance",
      email: "m.vance@cloudbridge.ca",
      isVerified: true
    },
    items: [
      {
        sku: "PROD-102",
        title: "Pro Cloud Subscription",
        quantity: 1,
        unitPrice: 199.50
      }
    ],
    billingAddress: {
      street: "100 King St West",
      city: "Toronto",
      country: "Canada",
      postalCode: "M5X 1A9"
    },
    totalAmount: 199.50,
    status: "COMPLETED",
    createdAt: "2026-10-06T12:00:00Z"
  },
  null,
  2
);
