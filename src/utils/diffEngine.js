/**
 * High-performance client-side text and code diff engine
 * Computes Myers LCS line-diff and intra-line word-level differences.
 */

export function computeLineDiff(originalText, modifiedText, options = {}) {
  const { ignoreWhitespace = false, ignoreCase = false } = options;

  const rawOrigLines = (originalText || '').split(/\r?\n/);
  const rawModLines = (modifiedText || '').split(/\r?\n/);

  const normalize = (line) => {
    let s = line;
    if (ignoreWhitespace) {
      s = s.replace(/\s+/g, ' ').trim();
    }
    if (ignoreCase) {
      s = s.toLowerCase();
    }
    return s;
  };

  const origNorm = rawOrigLines.map(normalize);
  const modNorm = rawModLines.map(normalize);

  const N = origNorm.length;
  const M = modNorm.length;

  // LCS Matrix calculation
  // For standard files, 2D array or bounded matrix
  const dp = Array.from({ length: N + 1 }, () => new Int32Array(M + 1));

  for (let i = 1; i <= N; i++) {
    for (let j = 1; j <= M; j++) {
      if (origNorm[i - 1] === modNorm[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Backtrack to build unified diff operations
  let i = N;
  let j = M;
  const operations = []; // 'equal' | 'delete' | 'insert'

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && origNorm[i - 1] === modNorm[j - 1]) {
      operations.push({
        type: 'equal',
        origLine: rawOrigLines[i - 1],
        modLine: rawModLines[j - 1],
        origIndex: i,
        modIndex: j,
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      operations.push({
        type: 'insert',
        origLine: null,
        modLine: rawModLines[j - 1],
        origIndex: null,
        modIndex: j,
      });
      j--;
    } else if (i > 0) {
      operations.push({
        type: 'delete',
        origLine: rawOrigLines[i - 1],
        modLine: null,
        origIndex: i,
        modIndex: null,
      });
      i--;
    }
  }

  operations.reverse();

  // Compute intra-line word diffs for modified pairs where a delete is immediately followed by insert
  let stats = { additions: 0, deletions: 0, unchanged: 0 };
  operations.forEach((op) => {
    if (op.type === 'insert') stats.additions++;
    else if (op.type === 'delete') stats.deletions++;
    else stats.unchanged++;
  });

  // Build aligned side-by-side rows
  const sideBySide = [];
  let k = 0;
  while (k < operations.length) {
    const curr = operations[k];

    if (curr.type === 'equal') {
      sideBySide.push({
        leftNum: curr.origIndex,
        leftContent: curr.origLine,
        leftType: 'equal',
        rightNum: curr.modIndex,
        rightContent: curr.modLine,
        rightType: 'equal',
        wordDiff: null,
      });
      k++;
    } else if (curr.type === 'delete') {
      // Check if next is insert (a modification)
      const next = operations[k + 1];
      if (next && next.type === 'insert') {
        const wordDiff = computeWordDiff(curr.origLine, next.modLine, options);
        sideBySide.push({
          leftNum: curr.origIndex,
          leftContent: curr.origLine,
          leftType: 'delete',
          rightNum: next.modIndex,
          rightContent: next.modLine,
          rightType: 'insert',
          wordDiff,
        });
        k += 2;
      } else {
        sideBySide.push({
          leftNum: curr.origIndex,
          leftContent: curr.origLine,
          leftType: 'delete',
          rightNum: null,
          rightContent: '',
          rightType: 'empty',
          wordDiff: null,
        });
        k++;
      }
    } else if (curr.type === 'insert') {
      sideBySide.push({
        leftNum: null,
        leftContent: '',
        leftType: 'empty',
        rightNum: curr.modIndex,
        rightContent: curr.modLine,
        rightType: 'insert',
        wordDiff: null,
      });
      k++;
    }
  }

  return {
    operations,
    sideBySide,
    stats,
  };
}

/**
 * Word-level token diffing for intra-line highlights
 */
export function computeWordDiff(str1, str2, options = {}) {
  const { ignoreCase = false } = options;
  if (str1 === null || str2 === null) return null;

  const tokenize = (s) => (s || '').match(/\s+|\w+|[^\w\s]+/g) || [];
  const words1 = tokenize(str1);
  const words2 = tokenize(str2);

  const norm = (w) => (ignoreCase ? w.toLowerCase() : w);

  const n = words1.length;
  const m = words2.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (norm(words1[i - 1]) === norm(words2[j - 1])) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  let i = n;
  let j = m;
  const leftChunks = [];
  const rightChunks = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && norm(words1[i - 1]) === norm(words2[j - 1])) {
      leftChunks.push({ text: words1[i - 1], type: 'equal' });
      rightChunks.push({ text: words2[j - 1], type: 'equal' });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rightChunks.push({ text: words2[j - 1], type: 'insert' });
      j--;
    } else if (i > 0) {
      leftChunks.push({ text: words1[i - 1], type: 'delete' });
      i--;
    }
  }

  leftChunks.reverse();
  rightChunks.reverse();

  return { leftChunks, rightChunks };
}

export const SAMPLE_DIFF_ORIGINAL = `// Server Configuration v1.4.0
const config = {
  server: {
    host: "127.0.0.1",
    port: 3000,
    protocol: "http",
    cors: {
      origin: "*",
      credentials: false
    }
  },
  database: {
    client: "sqlite3",
    connection: {
      filename: "./dev.sqlite3"
    },
    useNullAsDefault: true,
    pool: { min: 2, max: 10 }
  },
  logging: {
    level: "debug",
    colorize: true
  },
  security: {
    rateLimit: 100,
    sessionTimeoutMs: 3600000
  }
};

module.exports = config;`;

export const SAMPLE_DIFF_MODIFIED = `// Server Configuration v2.0.0 — Production Ready
const config = {
  server: {
    host: "0.0.0.0",
    port: process.env.PORT || 8080,
    protocol: "https",
    cors: {
      origin: ["https://quickformat.app", "https://api.quickformat.app"],
      credentials: true
    }
  },
  database: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: { min: 5, max: 25 },
    idleTimeoutMillis: 30000
  },
  logging: {
    level: "info",
    colorize: false,
    format: "json"
  },
  security: {
    rateLimit: 500,
    sessionTimeoutMs: 7200000,
    enableHelmet: true
  }
};

export default config;`;
