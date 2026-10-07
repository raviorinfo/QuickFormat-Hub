/**
 * Utility functions for JSON Tree View, Formatting, Sorting, and JSONPath evaluation
 */

export function parseJsonWithPosition(raw) {
  if (!raw || !raw.trim()) {
    return { error: 'Empty JSON input. Paste JSON or choose a preset.' };
  }

  try {
    const data = JSON.parse(raw);
    return { data, error: null };
  } catch (err) {
    const match = err.message.match(/at position (\d+)/);
    let line = 1;
    let col = 1;
    if (match && match[1]) {
      const pos = parseInt(match[1], 10);
      const lines = raw.slice(0, pos).split('\n');
      line = lines.length;
      col = lines[lines.length - 1].length + 1;
    }
    return {
      error: `Syntax Error at Line ${line}, Col ${col}: ${err.message}`,
      line,
      col,
    };
  }
}

export function sortJsonKeys(data) {
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(sortJsonKeys);
  }
  const sorted = {};
  Object.keys(data)
    .sort()
    .forEach((key) => {
      sorted[key] = sortJsonKeys(data[key]);
    });
  return sorted;
}

export function calculateJsonStats(data) {
  let keyCount = 0;
  let maxDepth = 0;
  let arrayCount = 0;
  let objectCount = 0;

  function traverse(item, depth = 1) {
    if (depth > maxDepth) maxDepth = depth;
    if (item === null || typeof item !== 'object') return;

    if (Array.isArray(item)) {
      arrayCount++;
      item.forEach((sub) => traverse(sub, depth + 1));
    } else {
      objectCount++;
      const keys = Object.keys(item);
      keyCount += keys.length;
      keys.forEach((k) => traverse(item[k], depth + 1));
    }
  }

  traverse(data, 1);
  return { keyCount, maxDepth, arrayCount, objectCount };
}

/**
 * Lightweight client-side JSONPath evaluator
 * Supports:
 * - $ (root)
 * - $.key or $['key']
 * - $.array[0] or $.array[*]
 * - $..key (recursive descent)
 * - $.array[*].key
 */
export function evaluateJsonPath(data, path) {
  if (!path || !path.trim() || path.trim() === '$') {
    return { result: data, count: 1 };
  }

  const clean = path.trim();
  if (!clean.startsWith('$')) {
    return { error: 'JSONPath must start with "$"', result: null };
  }

  try {
    // Recursive search: $..prop
    if (clean.startsWith('$..')) {
      const targetProp = clean.slice(3).replace(/[^\w-]/g, '');
      const matches = [];

      function findProp(node) {
        if (!node || typeof node !== 'object') return;
        if (Array.isArray(node)) {
          node.forEach(findProp);
        } else {
          for (const k of Object.keys(node)) {
            if (k === targetProp) {
              matches.push(node[k]);
            }
            findProp(node[k]);
          }
        }
      }

      findProp(data);
      return { result: matches, count: matches.length };
    }

    // Tokenize path: $.users[0].name -> ['users', 0, 'name']
    const tokens = [];
    const tokenRegex = /\.?([a-zA-Z0-9_-]+)|\[(\d+|\*|'[^']+'|"[^"]+")\]/g;
    let match;
    const stripped = clean.slice(1); // remove '$'

    while ((match = tokenRegex.exec(stripped)) !== null) {
      if (match[1] !== undefined) {
        tokens.push(match[1]);
      } else if (match[2] !== undefined) {
        let inside = match[2];
        if (inside === '*') {
          tokens.push('*');
        } else if (/^\d+$/.test(inside)) {
          tokens.push(parseInt(inside, 10));
        } else {
          tokens.push(inside.replace(/['"]/g, ''));
        }
      }
    }

    let current = [data];

    for (const token of tokens) {
      const next = [];
      for (const item of current) {
        if (item === null || item === undefined) continue;

        if (token === '*') {
          if (Array.isArray(item)) {
            next.push(...item);
          } else if (typeof item === 'object') {
            next.push(...Object.values(item));
          }
        } else if (typeof token === 'number') {
          if (Array.isArray(item) && item[token] !== undefined) {
            next.push(item[token]);
          }
        } else {
          if (typeof item === 'object' && item[token] !== undefined) {
            next.push(item[token]);
          }
        }
      }
      current = next;
    }

    return {
      result: current.length === 1 ? current[0] : current,
      count: current.length,
    };
  } catch (err) {
    return { error: `Evaluation error: ${err.message}`, result: null };
  }
}

export const SAMPLE_JSON_VIEWER = JSON.stringify(
  {
    store: {
      name: "NeoTech Cyberstore",
      location: "Neo-Tokyo Central District",
      established: 2026,
      verified: true,
      inventory: [
        {
          id: "ITM-001",
          title: "Quantum Neural Interface v4",
          category: "Hardware",
          price: 1299.99,
          tags: ["bci", "neural", "low-latency"],
          inStock: true,
          specs: {
            channels: 1024,
            wireless: true,
            latencyMs: 0.4
          }
        },
        {
          id: "ITM-002",
          title: "Holographic Workspace Display",
          category: "Displays",
          price: 849.50,
          tags: ["ar", "spatial", "4k"],
          inStock: false,
          specs: {
            resolution: "8K Stereo",
            fovDegrees: 110,
            refreshRateHz: 240
          }
        },
        {
          id: "ITM-003",
          title: "Encrypted Hardware Key Vault",
          category: "Security",
          price: 199.00,
          tags: ["crypto", "fido2", "airgapped"],
          inStock: true,
          specs: {
            encryption: "Post-Quantum Dilithium",
            tamperProof: true
          }
        }
      ],
      support: {
        email: "support@neotech.jp",
        phone: "+81 3-5555-0199",
        hours: "24/7 Global Dispatch"
      }
    }
  },
  null,
  2
);
