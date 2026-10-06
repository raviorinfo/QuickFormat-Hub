# ⚡ QuickFormat Hub

> **Ultra-Fast, Zero-Overhead, 100% Client-Side Web Utility Suite**  
> Every transformation, diff check, token inspection, and PII redaction runs **exclusively in your local browser memory** with zero server telemetry.

![QuickFormat Hub](https://img.shields.io/badge/Architecture-100%25%20Client--Side-emerald?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![React](https://img.shields.io/badge/React-19-cyan?style=flat-square)
![Tailwind](https://img.shields.io/badge/TailwindCSS-v3-sky?style=flat-square)
![Privacy](https://img.shields.io/badge/Privacy-Zero%20Data%20Sent%20to%20Cloud-purple?style=flat-square)

---

## 🚀 Key Highlights

- **🔒 100% Privacy by Architecture**: Zero server uploads, zero backend databases, zero telemetry. All processing runs in local browser memory.
- **⚡ 0ms Network Latency**: Offline-ready (PWA-enabled). Works seamlessly in air-gapped environments without an internet connection.
- **🖥️ macOS-Inspired Window Chrome**: Interactive traffic lights (`🔴 🟡 🟢`), format badges, live line/character counters, font-size steppers (`A- / A / A+`), and Zen fullscreen mode.
- **⌨️ Power-User Navigation**: Universal Command Palette (<kbd>Ctrl</kbd> + <kbd>K</kbd>), global drag-and-drop auto-routing, and keyboard shortcuts cheat sheet (<kbd>?</kbd>).
- **🔊 Zero-Dependency Audio Synthesizer**: Tactile mechanical clicks and success chimes synthesized on the fly via the HTML5 Web Audio API (with persistent mute toggle).
- **🎉 Celebratory Confetti Feedback**: In-browser canvas particle burst on file exports.
- **🛡️ Google AdSense & SEO Ready**: Includes comprehensive legal pages (`/privacy-policy`, `/terms-of-service`, `/about`, `/contact`), dynamic JSON-LD structured data schemas, `sitemap.xml`, and `robots.txt`.

---

## 🛠️ The 13 Client-Side Utilities

### 1. Data & Formats
- **JSON to CSV / Excel (`/json-to-csv`)**: Flattens nested JSON hierarchies into CSV or Excel-compatible TSV spreadsheets with sortable columns.
- **CSV to JSON (`/csv-to-json`)**: Automatic delimiter sniffing (comma, semicolon, tab, pipe) and dot-notation object unflattening.
- **JSON to TypeScript, Zod & SQL (`/json-to-types`)**: Generates strongly-typed TypeScript interfaces, runtime Zod validation schemas, JSON Schema Draft-07, and PostgreSQL DDL tables.
- **Base64 Encoder & Decoder (`/base64-tool`)**: UTF-8 string encoding/decoding and binary file/image Data URI generator with live image preview.

### 2. Security & Privacy
- **AI Prompt Sanitizer & PII Redactor (`/pii-redactor`)**: Detects and redacts SSNs, credit cards (Luhn validated), emails, phone numbers, IPv4/IPv6, and API keys before sending prompts to ChatGPT, Claude, or LLMs. Includes reversible local de-anonymization.
- **Offline JWT Token Inspector (`/jwt-inspector`)**: Decodes JWT headers and payload claims, formats standard RFC 7519 timestamps, and displays live expiration countdown timers completely offline.

### 3. Documents & Diff
- **Markdown Editor & Exporter (`/markdown-editor`)**: Real-time dual-pane editor with live HTML preview, reading metrics, clean print-to-PDF, and standalone HTML export.
- **PDF Reader & Markdown Extractor (`/pdf-to-markdown`)**: Private client-side PDF viewer powered by Mozilla PDF.js canvas with heuristic typography-to-Markdown AST extraction.
- **Text & Code Difference Checker (`/text-diff`)**: Myers LCS diff engine supporting side-by-side and unified views, intra-line character highlights, synchronized vertical scrolling, and unified `.patch` export.

### 4. Developer & API
- **cURL to Code Converter (`/curl-converter`)**: Transpiles terminal and browser DevTools cURL commands into JavaScript (Fetch), Python (Requests), Node.js (Axios), Go, PHP, and Ruby.
- **URL & Query Parameter Parser (`/url-parser`)**: Deconstructs URLs into protocol, host, path, and editable query parameters with live rebuilding and JSON export.
- **Cron Expression Visualizer (`/cron-scheduler`)**: Translates 5-part crontab syntax into human-readable English and calculates the next 10 exact execution timestamps.
- **RegEx Playground (`/regex-tester`)**: Real-time JavaScript regular expression tester with live match highlights, capture group table, and a curated pattern library.

---

## 📂 Project Structure

```text
├── public/
│   ├── manifest.json       # PWA manifest
│   ├── robots.txt          # Search engine crawler directives
│   ├── sitemap.xml         # XML sitemap covering all 13 tools & legal pages
│   └── sw.js               # Offline service worker cache
├── src/
│   ├── components/
│   │   ├── common/         # WindowHeader, CopyButton
│   │   ├── pages/          # PrivacyPolicyPage, TermsOfServicePage, AboutUsPage, ContactUsPage
│   │   ├── tools/          # 13 standalone, code-split tool components
│   │   ├── AdSlot.jsx      # Clean non-intrusive ad placement handler
│   │   ├── CommandPalette.jsx
│   │   ├── Footer.jsx      # Semantic crawlable navigation & legal directory
│   │   ├── Header.jsx      # Sticky navbar with audio toggle & shortcuts trigger
│   │   ├── HistoryDrawer.jsx
│   │   ├── ShortcutsModal.jsx
│   │   └── ToolsOverview.jsx # Deep SEO guides, specs, troubleshooting & JSON-LD schema
│   ├── context/            # ThemeContext, ToastContext
│   ├── utils/              # Audio synthesis, confetti, diff, PDF extractor, SEO data, router
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── tailwind.config.js
└── vite.config.js
```

---

## 💻 Getting Started Locally

### Prerequisites
- Node.js 18+ installed

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/raviorinfo/QuickFormat-Hub.git
cd QuickFormat-Hub

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
```

The production output will be generated in `dist/` with optimized, lazy-loaded chunk splitting for all tools.

---

## 📜 Legal & Compliance

QuickFormat Hub complies with:
- **Google AdSense Publisher Policies**: Mandatory third-party cookie disclosures, opt-out links to [aboutads.info](https://www.aboutads.info) and [Google Ads Settings](https://adssettings.google.com).
- **GDPR & CCPA/CPRA**: Zero server data collection, local memory isolation, and transparent cookie practices.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
