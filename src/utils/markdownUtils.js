/**
 * Markdown utilities for QuickFormat Hub
 */

export function calculateMetrics(text) {
  if (!text) {
    return { words: 0, characters: 0, lines: 0, readingTimeMinutes: 0 };
  }

  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const characters = text.length;
  const lines = text.split('\n').length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return { words, characters, lines, readingTimeMinutes };
}

export function generateStandaloneHtml(renderedHtml, title = 'Exported Document') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --accent: #38bdf8;
      --border: #334155;
      --code-bg: #020617;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f8fafc;
        --card-bg: #ffffff;
        --text: #0f172a;
        --text-muted: #64748b;
        --accent: #0284c7;
        --border: #e2e8f0;
        --code-bg: #f1f5f9;
      }
    }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      line-height: 1.7;
      background: var(--bg);
      color: var(--text);
      max-width: 860px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }
    h1, h2, h3, h4 { color: var(--text); font-weight: 700; margin-top: 2rem; margin-bottom: 0.75rem; }
    h1 { font-size: 2.25rem; border-bottom: 2px solid var(--border); padding-bottom: 0.5rem; }
    h2 { font-size: 1.75rem; border-bottom: 1px solid var(--border); padding-bottom: 0.4rem; }
    h3 { font-size: 1.35rem; }
    p { margin-bottom: 1.25rem; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    ul, ol { padding-left: 2rem; margin-bottom: 1.25rem; }
    li { margin-bottom: 0.4rem; }
    blockquote {
      border-left: 4px solid var(--accent);
      margin: 1.5rem 0;
      padding: 0.5rem 0 0.5rem 1.25rem;
      background: var(--card-bg);
      border-radius: 0 0.5rem 0.5rem 0;
      color: var(--text-muted);
    }
    pre {
      background: var(--code-bg);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 1.25rem;
      overflow-x: auto;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.9rem;
      margin: 1.5rem 0;
    }
    code:not(pre code) {
      font-family: 'JetBrains Mono', monospace;
      background: rgba(56, 189, 248, 0.15);
      color: var(--accent);
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.88em;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.75rem 0;
    }
    th, td {
      border: 1px solid var(--border);
      padding: 0.75rem 1rem;
      text-align: left;
    }
    th {
      background: var(--card-bg);
      font-weight: 600;
    }
    hr {
      border: none;
      border-top: 1px solid var(--border);
      margin: 2.5rem 0;
    }
    @media print {
      body { background: white !important; color: black !important; max-width: 100%; padding: 0; }
      pre { background: #f8fafc !important; color: black !important; border: 1px solid #ccc !important; }
      th { background: #f1f5f9 !important; color: black !important; }
    }
  </style>
</head>
<body>
  ${renderedHtml}
</body>
</html>`;
}

export const SAMPLE_MARKDOWN = `# QuickFormat Hub Architecture Overview

Welcome to **QuickFormat Hub** — the next-generation, zero-latency browser utility suite designed for engineers, analysts, and content creators.

> "True developer productivity happens when utilities are instant, client-side, and respect data privacy completely."

---

## ⚡ Core Capability Matrix

| Tool Feature | Client-Side Engine | Export Formats | Latency |
| :--- | :--- | :--- | :--- |
| **JSON to CSV** | Recursive Flattener | CSV, TSV, Excel, JSON | < 5ms |
| **Markdown Editor** | Real-time AST Parser | Clean HTML, Print PDF, MD | Instant |
| **Text & Code Diff** | Myers LCS + Token Diff | Patch, Side-by-Side | Instant |

---

## 🚀 Key Advantages

- **Zero Cloud Leakage**: All computation executes strictly in your browser JS engine.
- **Offline First**: Runs without continuous internet connectivity.
- **Instant Preview**: Real-time rendering as you type.

### Example Code Block

Here is how modern client-side data parsing works in JavaScript:

\`\`\`javascript
// Client-side JSON flattening pipeline
export function parseAndFormat(payload) {
  const dataset = JSON.parse(payload);
  const flattened = dataset.map((item) => flattenRecord(item));
  return generateCsvStream(flattened, { delimiter: ',' });
}
\`\`\`

### Roadmap Checklist
- [x] High-performance JSON flattener
- [x] Live Markdown to HTML & PDF print engine
- [x] Side-by-side intra-line diff highlights
- [ ] Direct WebAssembly compression modules
`;
