/**
 * Exhaustive Technical Documentation, Guides, FAQs, and Troubleshooting
 * for all 13 QuickFormat Hub utilities to ensure high-value, indexable content.
 */

export const TOOL_METADATA = {
  '/json-to-csv': {
    id: 'json-to-csv',
    path: '/json-to-csv',
    title: 'JSON to CSV / Excel Converter',
    badge: 'Converter & Flattener',
    h1: 'Convert JSON to CSV and Excel Online (Client-Side & Private)',
    description: 'Transform nested or flat JSON datasets into clean, structured CSV and TSV spreadsheets instantly in your browser with zero server uploads.',
    seoOverview: {
      intro: 'QuickFormat Hub’s JSON to CSV Converter is an ultra-fast, privacy-centric browser utility engineered for software engineers, data analysts, and product managers. Built to eliminate the friction of data transformation, it processes complex structured JSON payloads into tabular formats in milliseconds. By leveraging recursive flattening algorithms, the tool unfolds nested objects, multi-level dictionaries, and primitive arrays into clear dot-notation or custom-delimited table columns, ready for instant import into Microsoft Excel, Google Sheets, PostgreSQL, or Snowflake.',
      features: [
        'Deep Nested Object Flattening: Automatically decomposes nested JSON objects into clean dot-notated column headers (e.g. user.address.city).',
        'Multi-Delimiter Support: Export with standard commas (,), semicolons (; for European locales), or tabs (\\t for native Excel TSV).',
        'Interactive & Sortable Table Preview: Search, paginate, and sort rows directly in the browser before exporting.',
        'Zero-Latency Client-Side Parsing: 100% in-browser JavaScript V8 execution with zero server telemetry or remote network requests.',
        'Selective Quoting Engine: Choose between standard minimal RFC 4180 quoting or universal quoting for complex string payloads.',
      ],
      howTo: [
        '1. Paste your JSON array or object directly into the left editor pane, or drag-and-drop a .json file.',
        '2. Toggle "Flatten Nested Objects" if your dataset contains nested child structures or arrays.',
        '3. Select your desired delimiter (Comma, Semicolon, or Tab) and choose header preferences in the options toolbar.',
        '4. Click "Download CSV" for standard spreadsheet files or "Excel (.tsv)" for instant, tab-delimited Excel imports.',
      ],
      troubleshooting: [
        {
          title: 'Trailing Commas Syntax Error',
          desc: 'Standard JSON does not allow trailing commas after the last array item or property. The built-in Prettify button automatically detects and assists with format errors.',
        },
        {
          title: 'Mixed Schema Arrays',
          desc: 'If objects in your array have different keys, our parser performs a complete schema union across all records so no fields are dropped.',
        },
        {
          title: 'Embedded Commas & Line Breaks',
          desc: 'Values containing commas or newlines are automatically wrapped in double quotes according to RFC 4180 standards to prevent column misalignment.',
        },
      ],
      faqs: [
        {
          q: 'Is my JSON uploaded to any remote server or cloud database?',
          a: 'No. All processing, parsing, and CSV generation occur 100% inside your local browser memory via JavaScript. You can even disconnect your internet connection and convert files offline.',
        },
        {
          q: 'Can this tool open large JSON files containing thousands of records?',
          a: 'Yes. Because processing runs directly on your machine’s hardware, it easily handles multi-megabyte payloads and datasets with tens of thousands of rows.',
        },
        {
          q: 'How does nested array flattening work?',
          a: 'When flattening is enabled, child properties are flattened using dot notation (e.g., "customer.name"), and array elements are indexed (e.g., "tags.0", "tags.1") for clean spreadsheet columns.',
        },
        {
          q: 'Is the exported CSV compatible with Microsoft Excel and Google Sheets?',
          a: 'Yes. The output uses standard UTF-8 encoding with CRLF or LF line endings, which opens natively in Microsoft Excel, Apple Numbers, Google Sheets, and LibreOffice Calc.',
        },
        {
          q: 'What is the difference between CSV and TSV (Excel) mode?',
          a: 'CSV uses commas as separators, which requires quoting fields containing commas. TSV uses tab characters, which prevents issues with numerical decimal commas in European spreadsheets.',
        },
      ],
    },
  },

  '/csv-to-json': {
    id: 'csv-to-json',
    path: '/csv-to-json',
    title: 'CSV to JSON Converter & Unflattener',
    badge: 'Delimited to JSON Tree',
    h1: 'Convert CSV to JSON Online with Deep Object Unflattening',
    description: 'Transform CSV and TSV spreadsheets into structured JSON arrays and nested object trees with automatic type detection and delimiter sniffing.',
    seoOverview: {
      intro: 'The QuickFormat Hub CSV to JSON Converter seamlessly reverses tabular spreadsheet data into developer-ready JSON trees with automatic delimiter sniffing and dot-notation unflattening. Whether migrating legacy SQL exports, parsing customer CSV uploads, or seeding API databases, this tool reconstructs complex nested object hierarchies from dot-separated headers while coercing string primitives into proper JavaScript booleans and numbers.',
      features: [
        'Automatic Delimiter Sniffing: Accurately detects commas, semicolons, tabs, and pipes without manual configuration.',
        'Deep Object Unflattening: Reconstructs nested JSON hierarchies from dot-delimited headers (e.g., address.street into a child object).',
        'Smart Type Coercion: Automatically casts numbers, floating-point decimals, and booleans into native JSON primitives.',
        'RFC 4180 Compliance: Correctly parses multiline fields, quoted values, and escaped quotation marks.',
      ],
      howTo: [
        '1. Paste raw CSV or TSV data into the editor, or upload your file directly.',
        '2. Toggle "Auto-Detect Delimiter" or specify commas, semicolons, or tabs.',
        '3. Enable "Unflatten Dots" if your headers use nested dot notation (e.g., user.email).',
        '4. Copy the resulting JSON tree or download as a .json file.',
      ],
      troubleshooting: [
        {
          title: 'Mismatched Column Counts',
          desc: 'Ensure every row contains the same number of delimited fields as the header row, or that multiline text is enclosed in double quotes.',
        },
        {
          title: 'Preserving Leading Zeroes',
          desc: 'ZIP codes or phone numbers with leading zeroes can be preserved as strings by disabling numerical type coercion.',
        },
        {
          title: 'Special Characters in Headers',
          desc: 'Headers with whitespace or special characters are safely mapped to valid JSON property keys.',
        },
      ],
      faqs: [
        {
          q: 'Does this handle Excel export tab-delimited files (TSV)?',
          a: 'Yes. The automatic delimiter sniffer immediately identifies tab separation and parses the spreadsheet accurately.',
        },
        {
          q: 'How does dot-notation unflattening work?',
          a: 'Headers like "order.id" and "order.total" are converted into a nested object: {"order": {"id": 1, "total": 99.50}}.',
        },
        {
          q: 'Are multiline cells inside quotes supported?',
          a: 'Yes. Full RFC 4180 parsing allows cells with line breaks to remain intact inside a single JSON string property.',
        },
        {
          q: 'Is there a row or file size limit?',
          a: 'Because execution occurs client-side, the only limit is your browser’s available memory. Datasets with 50,000+ rows process smoothly.',
        },
        {
          q: 'Can I copy the output directly to my clipboard?',
          a: 'Yes, with one click using the animated Copy button with audio and visual feedback.',
        },
      ],
    },
  },

  '/markdown-editor': {
    id: 'markdown-editor',
    path: '/markdown-editor',
    title: 'Markdown Editor & Exporter',
    badge: 'Live Editor & PDF/HTML',
    h1: 'Live Markdown Editor, HTML Exporter & PDF Generator',
    description: 'Write, edit, and preview GitHub Flavored Markdown in real-time. Export self-contained HTML documents and generate clean, print-ready PDF files.',
    seoOverview: {
      intro: 'A distraction-free writing environment for technical documentation, release notes, and README files featuring live synchronized HTML preview, readability metrics, and print-to-PDF export. Powered by the high-performance marked.js parser, the editor supports tables, task lists, blockquotes, syntax highlighting blocks, and custom CSS styling.',
      features: [
        'Real-Time Dual Pane: Live synchronized preview updating keystroke-by-keystroke.',
        'Comprehensive Formatting Toolbar: Quick formatting for headings, tables, task lists, code blocks, and blockquotes.',
        'Clean Print to PDF: Specialized print stylesheets that hide toolbars and format documents cleanly for printing.',
        'Standalone HTML Export: Exports clean HTML with inline styling ready for publishing or sharing.',
      ],
      howTo: [
        '1. Type or paste your Markdown text in the left editor pane.',
        '2. Use the toolbar shortcuts to quickly insert headings, lists, or tables.',
        '3. Toggle between Split view, Editor-only, or Preview-only mode.',
        '4. Click "Export as HTML" or "Print / Save PDF" to generate your final document.',
      ],
      troubleshooting: [
        {
          title: 'Table Alignment Issues',
          desc: 'Ensure markdown tables have header separator rows with at least three hyphens per column (e.g. |---|---|).',
        },
        {
          title: 'HTML Tags Inside Markdown',
          desc: 'Raw HTML tags like <div> or <span> are supported and rendered in the live preview.',
        },
        {
          title: 'Print Margins & Headers',
          desc: 'In the browser print dialog, disable "Headers and footers" to remove URL stamps on exported PDFs.',
        },
      ],
      faqs: [
        {
          q: 'Is GitHub-Flavored Markdown (GFM) supported?',
          a: 'Yes. GFM features including task list checkboxes, tables, strikethrough (~~text~~), and auto-linking are enabled.',
        },
        {
          q: 'Can I export a PDF directly without watermarks?',
          a: 'Yes. The "Print / Save PDF" button triggers your browser’s native print engine with zero watermarks or third-party branding.',
        },
        {
          q: 'Does it calculate reading time and word count?',
          a: 'Yes. Real-time metrics in the header track total word count, character count, and estimated reading time.',
        },
        {
          q: 'Are my notes saved if I refresh the page?',
          a: 'Your current text remains active during your session and can be saved to your local scratchpad history with one click.',
        },
        {
          q: 'Can I use keyboard shortcuts?',
          a: 'Yes. Standard text editing shortcuts and QuickFormat Hub shortcuts (like ? for cheatsheet) are fully supported.',
        },
      ],
    },
  },

  '/pdf-to-markdown': {
    id: 'pdf-to-markdown',
    path: '/pdf-to-markdown',
    title: 'PDF Reader & Markdown Extractor',
    badge: 'PDF.js Reader & Parser',
    h1: 'Read PDFs and Extract Clean Markdown in Your Browser',
    description: 'Client-side PDF document reader with canvas rendering and intelligent text extraction converting PDF pages into structured Markdown.',
    seoOverview: {
      intro: 'A private, client-side document viewer and AST extractor powered by Mozilla’s PDF.js. Open, inspect, and navigate any PDF document in your browser while extracting structured Markdown based on font size, boldness, and layout heuristics. Ideal for developers extracting code samples, research papers, legal agreements, and corporate specifications without uploading private documents to cloud OCR services.',
      features: [
        'High-Resolution Canvas Viewport: Crisp client-side PDF rasterization with zoom controls and page steppers.',
        'Typographic AST Parsing: Automatically detects heading levels, paragraphs, and list items based on font metrics.',
        '100% Offline & Isolated: Powered by local PDF.js Web Worker without external API calls.',
        'Flexible Extraction Scope: Extract markdown for the currently viewed page or the entire document.',
      ],
      howTo: [
        '1. Drag-and-drop a PDF file or click "Open PDF" to load your document.',
        '2. Use the navigation controls to flip through pages and adjust zoom.',
        '3. Select extraction scope ("Full Document" or "Current Page Only").',
        '4. Switch between Formatted Preview and Markdown Source to copy or download as .md.',
      ],
      troubleshooting: [
        {
          title: 'Scanned Image PDFs',
          desc: 'This utility extracts digital vector text streams. Scanned raster images without an embedded text layer require OCR prior to extraction.',
        },
        {
          title: 'Password-Protected PDFs',
          desc: 'Encrypted PDFs must be unlocked prior to loading for security reasons.',
        },
        {
          title: 'Multi-Column Formatting',
          desc: 'Academic papers with multi-column layouts are parsed top-to-bottom according to reading flow coordinates.',
        },
      ],
      faqs: [
        {
          q: 'Is my confidential PDF uploaded to any server?',
          a: 'Never. The file is read directly from your local disk into browser memory via FileReader and rendered on an HTML5 canvas.',
        },
        {
          q: 'Does it preserve headings and formatting?',
          a: 'Yes. Our heuristic engine analyzes font size and weight to map larger text blocks to Markdown # and ## headers.',
        },
        {
          q: 'Can I use this without an active internet connection?',
          a: 'Yes. The PDF.js worker is bundled locally, making the tool 100% offline-ready.',
        },
        {
          q: 'How large of a PDF can I load?',
          a: 'Documents with hundreds of pages load smoothly, constrained only by your device’s available RAM.',
        },
        {
          q: 'Can I copy the extracted Markdown directly?',
          a: 'Yes. Use the animated Copy button in the window header for instant clipboard access.',
        },
      ],
    },
  },

  '/text-diff': {
    id: 'text-diff',
    path: '/text-diff',
    title: 'Text & Code Diff Checker',
    badge: 'Myers LCS Diff Engine',
    h1: 'Online Text & Code Difference Checker (Side-by-Side & Unified)',
    description: 'Compare two texts, code snippets, or configurations with side-by-side and unified views, intra-line character highlights, and unified .patch export.',
    seoOverview: {
      intro: 'High-performance difference comparison powered by the Myers Longest Common Subsequence (LCS) algorithm with intra-line character-level highlights and whitespace tolerance. Built for software engineers, devops teams, and legal reviewers who need to quickly verify code diffs, configuration drift, JSON schemas, or contract amendments.',
      features: [
        'Dual Display Modes: Toggle between Split Side-by-Side and Unified git-style diff presentations.',
        'Intra-Line Character Highlights: Pinpoints precise word and character changes within modified lines.',
        'Synchronized Scrolling: Toggle synchronized vertical scrolling between original and modified text panes.',
        'Unified Patch Export: Download standard .patch files compatible with git apply.',
      ],
      howTo: [
        '1. Paste your original text or code into the left pane.',
        '2. Paste the modified or updated version into the right pane.',
        '3. Toggle options such as "Ignore Whitespace" or "Case Sensitive" as needed.',
        '4. View additions (green) and deletions (red), and export the diff or patch.',
      ],
      troubleshooting: [
        {
          title: 'Large Whitespace Discrepancies',
          desc: 'Enable "Ignore Whitespace" to filter out indentation changes (e.g., spaces vs tabs) and focus solely on content differences.',
        },
        {
          title: 'Line Ending Differences (CRLF vs LF)',
          desc: 'Our diff engine normalizes Windows (\\r\\n) and Unix (\\n) line breaks automatically before computing differences.',
        },
        {
          title: 'Comparing Minified Code',
          desc: 'For best results with minified JavaScript or JSON, format/prettify the code before running the diff comparison.',
        },
      ],
      faqs: [
        {
          q: 'What algorithm is used to compute differences?',
          a: 'The engine uses the Myers LCS algorithm, the same mathematical diff foundation utilized by Git.',
        },
        {
          q: 'Can I generate a standard Git patch file?',
          a: 'Yes. Click "Download Patch" to export a standard unified .patch file with hunk headers (@@ -1,5 +1,6 @@).',
        },
        {
          q: 'Does it highlight character changes within a line?',
          a: 'Yes. Word and character changes within modified lines are highlighted with distinct contrast styling.',
        },
        {
          q: 'Can I lock scroll positions together?',
          a: 'Yes. The Link icon in the header enables synchronized scrolling between both comparison viewports.',
        },
        {
          q: 'Is my proprietary code kept private?',
          a: 'Absolutely. No code is transmitted over the network; all diffing runs entirely on your local CPU.',
        },
      ],
    },
  },

  '/base64-tool': {
    id: 'base64-tool',
    path: '/base64-tool',
    title: 'Base64 Encoder & Decoder',
    badge: 'Text, Images & Files',
    h1: 'Base64 Encoder, Decoder & Data URL Generator',
    description: 'Encode and decode Base64 strings, binary files, and images with automatic Data URI generation and live image previews in your browser.',
    seoOverview: {
      intro: 'A comprehensive Base64 encoding and decoding workbench supporting UTF-8 text strings, binary files, SVG vector assets, and raster images. Generate clean data URI strings (data:image/png;base64,...) for CSS stylesheets, HTML email templates, and API payloads with live image previews and payload size comparisons.',
      features: [
        'Full UTF-8 String Support: Safely encodes emoji, non-Latin alphabets, and multi-byte UTF-8 sequences.',
        'Binary File & Image Support: Drag-and-drop PNG, JPEG, SVG, or PDF files to generate Base64 strings.',
        'Data URI Formatter: Generates ready-to-use HTML img tags, CSS background-image rules, and raw Data URIs.',
        'Live Image Preview: Instantly decodes and previews Base64 image strings.',
      ],
      howTo: [
        '1. Select "Text Mode" for strings or "File Mode" for binary documents and images.',
        '2. Choose "Encode" or "Decode" depending on your operation.',
        '3. Enter text or drop your file into the input area.',
        '4. Copy the encoded Base64 or Data URI string with one click.',
      ],
      troubleshooting: [
        {
          title: 'Malformed UTF-8 Sequences in atob()',
          desc: 'Standard browser atob() fails on UTF-8 characters. Our encoder uses TextEncoder and TextDecoder to handle all Unicode characters flawlessly.',
        },
        {
          title: 'Data URI Header Stripping',
          desc: 'When decoding a Data URI, the tool automatically strips headers like "data:image/png;base64," before decoding.',
        },
        {
          title: 'Padding Characters (=)',
          desc: 'Proper Base64 padding (= or ==) is automatically validated and applied to maintain byte alignment.',
        },
      ],
      faqs: [
        {
          q: 'Why does Base64 increase file size?',
          a: 'Base64 uses 6 bits per character to represent 8-bit binary data, resulting in an expected ~33% overhead increase in size.',
        },
        {
          q: 'Can I encode images into CSS background data URIs?',
          a: 'Yes. In File Mode, the tool generates ready-to-paste CSS url("data:image/...") strings.',
        },
        {
          q: 'Does it handle non-ASCII international characters?',
          a: 'Yes. Full UTF-8 byte serialization prevents character corruption across any language.',
        },
        {
          q: 'Are uploaded files saved on a server?',
          a: 'Never. Files are read using the local browser FileReader API and encoded in client memory.',
        },
        {
          q: 'Can I decode Base64 back into a downloadable file?',
          a: 'Yes. In file mode, you can download decoded Base64 directly as a binary file.',
        },
      ],
    },
  },

  '/url-parser': {
    id: 'url-parser',
    path: '/url-parser',
    title: 'URL & Query Parameter Parser',
    badge: 'URL & Query Inspector',
    h1: 'Parse, Inspect & Rebuild URLs and Query Parameters',
    description: 'Deconstruct complex URLs into protocol, host, path, port, hash, and editable query parameters with live rebuilding and JSON export.',
    seoOverview: {
      intro: 'An interactive URL inspector designed for API developers, web engineers, and marketing tracking analysts. Deconstruct long, messy web addresses into structured components (protocol, hostname, port, pathname, search params, and hash fragments) with an editable key-value parameter table and instant URL rebuilding.',
      features: [
        'Component Deconstruction: Extracts protocol, host, port, path, and hash fragments instantly.',
        'Editable Query Parameter Table: Add, modify, or remove UTM parameters and API arguments with real-time URL updates.',
        'URL-Encoding & Decoding: Automatically decodes percent-encoded characters (%20, %2F, %3F) for clarity.',
        'Export as JSON: Export URL query parameters as a structured JSON key-value dictionary.',
      ],
      howTo: [
        '1. Paste any full URL or query string into the input field.',
        '2. Review the decomposed URL architecture in the overview cards.',
        '3. Edit query parameter keys and values in the interactive table.',
        '4. Copy the freshly reconstructed, properly encoded URL.',
      ],
      troubleshooting: [
        {
          title: 'Double URL-Encoding',
          desc: 'Parameters encoded multiple times (e.g. %2520) can be inspected and decoded using the parameter table.',
        },
        {
          title: 'Missing Protocol Scheme',
          desc: 'If a URL lacks a scheme (e.g. "example.com/path"), the parser automatically defaults to https:// for compliant parsing.',
        },
        {
          title: 'Duplicate Query Keys',
          desc: 'Handles URLs containing repeated query keys (e.g. ?tag=web&tag=api) by preserving each occurrence.',
        },
      ],
      faqs: [
        {
          q: 'What URL specifications are supported?',
          a: 'The tool uses the WHATWG URL standard implemented in modern browser engines.',
        },
        {
          q: 'Can I use this to clean marketing UTM tracking tags?',
          a: 'Yes. You can delete UTM parameters with one click and copy the clean destination URL.',
        },
        {
          q: 'How does it handle hashbang (#! / #) router URLs?',
          a: 'Fragment identifiers and single-page app routes are parsed into the hash component.',
        },
        {
          q: 'Can I export query parameters as JSON?',
          a: 'Yes. Click "Copy JSON" to export the entire query parameter dictionary.',
        },
        {
          q: 'Is my URL sent to any logging analytics?',
          a: 'No. The entire parse operation runs locally without sending your URL to any server.',
        },
      ],
    },
  },

  '/pii-redactor': {
    id: 'pii-redactor',
    path: '/pii-redactor',
    title: 'AI Prompt Sanitizer & PII Redactor',
    badge: 'PII Data Masking',
    h1: 'Sanitize Sensitive Data & Redact PII for AI Prompts Locally',
    description: 'Scrub Social Security numbers, credit cards, emails, IP addresses, phone numbers, and API keys before pasting logs into ChatGPT, Claude, or LLMs.',
    seoOverview: {
      intro: 'A privacy utility engineered to prevent confidential data leaks into public LLM platforms (ChatGPT, Claude, Gemini, Copilot). Using comprehensive pattern-matching algorithms, it scans raw customer logs, server crash dumps, and support tickets, replacing sensitive identifiers with consistent placeholders (e.g. [EMAIL_1], [PHONE_1]) while preserving the contextual structure needed for AI analysis.',
      features: [
        'Comprehensive PII Pattern Library: Detects Social Security Numbers (SSN), Credit Cards (Luhn validated), Emails, IPv4/IPv6, Phone Numbers, and API Keys.',
        'Reversible De-Anonymization: Download a local mapping dictionary to unmask sanitized AI responses back into real values.',
        'Configurable Entity Rules: Toggle individual entity detectors on or off based on your compliance needs.',
        '100% In-Browser Execution: Protects proprietary data from touching cloud services before LLM submission.',
      ],
      howTo: [
        '1. Paste your raw log, code snippet, or prompt into the Raw Input pane.',
        '2. Toggle desired PII entity categories (Credit Cards, SSN, API Keys, Emails, etc.).',
        '3. Copy the sanitized text and paste it safely into your AI tool.',
        '4. (Optional) Switch to "Unmask" mode to restore original values using your mapping key.',
      ],
      troubleshooting: [
        {
          title: 'Custom Identifier Patterns',
          desc: 'Internal UUIDs or organization-specific employee IDs can be sanitized using standard API key and token regex patterns.',
        },
        {
          title: 'Maintaining Mapping Keys',
          desc: 'Always download your local replacement mapping file before closing the tab if you intend to unmask the AI’s answer later.',
        },
        {
          title: 'False Positive Filtering',
          desc: 'Disable specific detectors (e.g., IPv4) if your text contains technical version strings that resemble IP addresses.',
        },
      ],
      faqs: [
        {
          q: 'Why should I sanitize data before sending it to AI models?',
          a: 'Public AI prompts may be retained for model training or human review, posing compliance risks under HIPAA, GDPR, and SOC2.',
        },
        {
          q: 'Can the AI still understand the context after sanitization?',
          a: 'Yes. Because entities are replaced with contextual tokens like [CUSTOMER_NAME_1] and [EMAIL_1], the AI retains semantic understanding.',
        },
        {
          q: 'How does the unmasking feature work?',
          a: 'A local mapping dictionary records which placeholder maps to which original value, allowing 100% local restoration of AI responses.',
        },
        {
          q: 'Are Luhn credit card checks performed?',
          a: 'Yes. The credit card detector verifies 13-19 digit cards using the Luhn checksum algorithm to minimize false positives.',
        },
        {
          q: 'Does QuickFormat Hub keep a copy of the unmasked data?',
          a: 'Never. Data exists solely in your browser’s volatile memory and is wiped upon closing the tab.',
        },
      ],
    },
  },

  '/curl-converter': {
    id: 'curl-converter',
    path: '/curl-converter',
    title: 'cURL to Code Converter',
    badge: 'Multi-Language Transpiler',
    h1: 'Convert cURL Commands to JavaScript, Python, Go, PHP & Node.js',
    description: 'Transform complex cURL command-line requests into production-ready API code across 6 languages with cookie, header, and payload parsing.',
    seoOverview: {
      intro: 'Convert raw cURL terminal commands into idiomatic API request code across modern languages and frameworks. Whether inspecting Chrome DevTools "Copy as cURL" requests or migrating terminal commands to backend code, this transpiler correctly extracts HTTP methods, custom headers, Basic/Bearer authentication, form data, and JSON request bodies into clean code.',
      features: [
        '6 Target Languages & Libraries: JavaScript (Fetch), Python (Requests), Node.js (Axios), Go (net/http), PHP (cURL), and Ruby (Net::HTTP).',
        'Full Flag Coverage: Parses -X, -H, -d, --data-raw, -u, -b (cookies), and query parameters accurately.',
        'Browser DevTools Integration: Paste "Copy as cURL (bash)" commands directly from Chrome, Firefox, or Safari.',
        'Syntax Highlighted & Copyable: One-click copy or file download for each programming language.',
      ],
      howTo: [
        '1. In your browser DevTools Network tab, right-click any request and select "Copy as cURL".',
        '2. Paste the cURL command into the input editor.',
        '3. Select your target language tab (JavaScript, Python, Axios, Go, etc.).',
        '4. Copy the generated code directly into your application codebase.',
      ],
      troubleshooting: [
        {
          title: 'Multiline Backslashes (\\)',
          desc: 'Terminal backslash line continuations are automatically normalized before parsing.',
        },
        {
          title: 'Escaped Quotes in Payloads',
          desc: 'Escaped double quotes in JSON payloads are unescaped and formatted cleanly.',
        },
        {
          title: 'Compressed Header Flags (--compressed)',
          desc: 'Headers related to transfer compression are normalized for clean HTTP client execution.',
        },
      ],
      faqs: [
        {
          q: 'Can I convert cURL commands copied from Chrome DevTools?',
          a: 'Yes. Commands copied via "Copy as cURL (bash)" or "Copy as cURL (cmd)" parse seamlessly.',
        },
        {
          q: 'Does it parse Bearer authorization headers?',
          a: 'Yes. -H "Authorization: Bearer ..." headers are extracted into standard client header dictionaries.',
        },
        {
          q: 'How does it handle URL-encoded form data (-d "a=1&b=2")?',
          a: 'Form data is converted into appropriate form-urlencoded payloads or JSON objects based on the target language.',
        },
        {
          q: 'Does it support multipart/form-data file uploads?',
          a: 'Yes. -F flags are mapped to FormData instances or multipart boundaries.',
        },
        {
          q: 'Is my secret API key sent across the internet?',
          a: 'No. The converter parses the command entirely client-side using JavaScript regular expressions.',
        },
      ],
    },
  },

  '/jwt-inspector': {
    id: 'jwt-inspector',
    path: '/jwt-inspector',
    title: 'Offline JWT Token Inspector & Countdown',
    badge: 'JWT Decoder & Timer',
    h1: 'Decode & Inspect JSON Web Tokens (JWT) Locally & Privately',
    description: 'Inspect JWT header metadata, payload claims, and real-time expiration countdowns completely offline with zero secret transmission.',
    seoOverview: {
      intro: 'A secure, offline-first JSON Web Token (JWT) analyzer engineered for backend developers, security engineers, and DevOps architects. Decodes base64url-encoded headers and claims, highlighting standard RFC 7519 fields (iss, sub, aud, exp, nbf, iat) with a live expiration countdown timer and cryptographic algorithm display.',
      features: [
        '100% In-Browser Execution: Prevents confidential production tokens and session cookies from leaking to external servers.',
        'Real-Time Expiration Countdown: Live countdown timer indicating whether a token is valid, expiring soon, or expired.',
        'RFC 7519 Standards Inspector: Automatically formats timestamps (exp, iat, nbf) into human-readable ISO and relative dates.',
        'Signature & Header Analysis: Inspects signing algorithms (RS256, HS256, ES256) and key IDs (kid).',
      ],
      howTo: [
        '1. Paste your encoded JSON Web Token (header.payload.signature) into the editor.',
        '2. Review the decoded Header claims and signing algorithm on the left.',
        '3. Inspect payload claims, user attributes, and permissions on the right.',
        '4. Check the live Expiration Status badge to confirm token validity.',
      ],
      troubleshooting: [
        {
          title: 'Invalid Base64URL Encoding',
          desc: 'JWTs use base64url encoding (- and _ instead of + and /). Our decoder normalizes these characters before decoding.',
        },
        {
          title: 'Expired Tokens (exp claim)',
          desc: 'If the current timestamp exceeds the exp claim, the interface clearly displays an "Expired" status badge.',
        },
        {
          title: 'Missing Signature Component',
          desc: 'Tokens with two segments (header.payload) can still be inspected for debugging unauthenticated claims.',
        },
      ],
      faqs: [
        {
          q: 'Why should I never use online JWT debuggers that send data to servers?',
          a: 'Pasting live JWTs with production credentials into server-based tools can expose session tokens to third-party logs.',
        },
        {
          q: 'Does this tool verify cryptographic signatures?',
          a: 'This utility focuses on decoding and inspecting claims. Cryptographic verification should be done with your public key in your backend.',
        },
        {
          q: 'What claims are automatically formatted?',
          a: 'Standard timestamp claims (exp, iat, nbf, auth_time) are converted into human-readable dates.',
        },
        {
          q: 'Can I use this tool while offline or air-gapped?',
          a: 'Yes. Disconnect your internet connection and inspect tokens with 100% local functionality.',
        },
        {
          q: 'Does it support nested or custom claims?',
          a: 'Yes. Any custom claim or nested object within the payload is parsed and formatted as readable JSON.',
        },
      ],
    },
  },

  '/json-to-types': {
    id: 'json-to-types',
    path: '/json-to-types',
    title: 'JSON to TypeScript, Zod & Schema Converter',
    badge: 'Code Generator',
    h1: 'Generate TypeScript Interfaces, Zod Schemas & SQL from JSON',
    description: 'Instantly generate strongly-typed TypeScript interfaces, Zod validation schemas, JSON Schema drafts, and PostgreSQL CREATE TABLE statements from raw JSON.',
    seoOverview: {
      intro: 'Accelerate your full-stack workflow by automatically inferring strongly-typed code contracts from raw JSON API responses. Generates TypeScript type definitions, runtime Zod validation schemas, JSON Schema specifications, and relational SQL CREATE TABLE statements with deep type inference and optional field detection.',
      features: [
        '4 Target Output Formats: TypeScript interfaces, Zod validation schemas, JSON Schema Draft-07, and SQL DDL tables.',
        'Deep Schema Inference: Infers nested object types, array union primitives, and optional properties.',
        'Custom Root Naming: Specify root interface or schema names (e.g. UserProfile, ApiResponse).',
        'One-Click Download & Copy: Export schema files (.ts, .sql, .json) with celebratory confetti feedback.',
      ],
      howTo: [
        '1. Paste your sample JSON payload into the left editor pane.',
        '2. Select your desired schema format tab (TypeScript, Zod, JSON Schema, or SQL).',
        '3. Customize the Root Type Name in the toolbar.',
        '4. Copy the generated schema code or download it directly to your codebase.',
      ],
      troubleshooting: [
        {
          title: 'Empty Arrays Type Inference',
          desc: 'Empty arrays ([]) are typed as any[] or unknown[] until sample items are added to infer their element types.',
        },
        {
          title: 'Union Types in Arrays',
          desc: 'Arrays containing multiple data types (e.g. [1, "test"]) are typed as unions (e.g. (number | string)[]).',
        },
        {
          title: 'Null Values Handling',
          desc: 'Properties with null values are typed as nullable primitives (e.g. string | null).',
        },
      ],
      faqs: [
        {
          q: 'Does it generate runtime Zod validation schemas?',
          a: 'Yes. Select the Zod tab to generate z.object({ ... }) schemas with z.string(), z.number(), and z.array() definitions.',
        },
        {
          q: 'Can it create SQL tables for relational databases?',
          a: 'Yes. The SQL tab generates PostgreSQL-compatible CREATE TABLE statements with appropriate column types.',
        },
        {
          q: 'Are nested objects split into separate TypeScript interfaces?',
          a: 'Yes. Child objects are extracted into clean, reusable interfaces for modular codebases.',
        },
        {
          q: 'How does it handle optional properties?',
          a: 'If sample data contains arrays where some objects lack certain keys, those properties are marked as optional (?:).',
        },
        {
          q: 'Is my proprietary JSON uploaded to any server?',
          a: 'No. The type inference engine runs 100% client-side in your local browser.',
        },
      ],
    },
  },

  '/cron-scheduler': {
    id: 'cron-scheduler',
    path: '/cron-scheduler',
    title: 'Cron Expression Visualizer & Timeline',
    badge: 'Cron Parser & Timeline',
    h1: 'Cron Expression Visualizer, Human Explainer & Schedule Timeline',
    description: 'Deconstruct crontab expressions into plain English, inspect field breakdowns, and calculate the next 10 exact execution timestamps.',
    seoOverview: {
      intro: 'Demystify complex cron schedules with a visual cron builder and natural language explainer. Translates 5-part cron syntax (minute, hour, day of month, month, day of week) into human-readable English, displays next upcoming execution timestamps, and provides a library of common cron presets for DevOps automation.',
      features: [
        'Natural Language Translation: Converts syntax like "*/15 0-6 * * 1-5" into plain English descriptions.',
        'Next 10 Execution Timestamps: Calculates precise future run dates and times with relative countdowns.',
        'Interactive Field Breakdown: Highlights each segment (Minute, Hour, Day, Month, Weekday) with valid ranges.',
        'Common Presets Library: One-click templates for hourly, daily midnight, weekday business hours, and weekly backups.',
      ],
      howTo: [
        '1. Type or paste any 5-field cron expression into the editor.',
        '2. Read the natural English explanation in the visual header.',
        '3. Inspect the field breakdown cards to verify each cron segment.',
        '4. Review the timeline of the next 10 upcoming execution timestamps.',
      ],
      troubleshooting: [
        {
          title: 'Sunday Numbering (0 vs 7)',
          desc: 'Standard crontab supports both 0 and 7 for Sunday. Our parser handles both conventions seamlessly.',
        },
        {
          title: 'Step Values (*/N)',
          desc: 'Expressions like */15 represent step intervals ("every 15 units starting from 0").',
        },
        {
          title: 'Day of Month vs Day of Week Logic',
          desc: 'In standard crontab, when both day-of-month and day-of-week are set, the job runs when either condition is met.',
        },
      ],
      faqs: [
        {
          q: 'What cron format does this tool support?',
          a: 'It supports standard POSIX / Unix crontab 5-part syntax (minute, hour, day-of-month, month, day-of-week).',
        },
        {
          q: 'Are execution timestamps calculated in my local timezone?',
          a: 'Yes. Future timestamps are calculated using your local browser system clock and timezone settings.',
        },
        {
          q: 'Does it support special characters like /, -, and *?',
          a: 'Yes. Ranges (1-5), lists (1,15,30), wildcards (*), and step values (*/10) are fully supported.',
        },
        {
          q: 'Can I copy the human-readable explanation?',
          a: 'Yes. Use the Copy button next to the explanation banner.',
        },
        {
          q: 'Is this suitable for verifying AWS EventBridge or GitHub Actions cron jobs?',
          a: 'Yes. It is ideal for verifying cron expressions before deploying scheduled workflows.',
        },
      ],
    },
  },

  '/regex-tester': {
    id: 'regex-tester',
    path: '/regex-tester',
    title: 'RegEx Tester & Match Visualizer',
    badge: 'JavaScript RegExp Engine',
    h1: 'Online Regular Expression Tester, Highlighter & Match Table',
    description: 'Test and debug JavaScript regular expressions in real-time with live match highlighting, capture group extraction, and a regex cheat sheet library.',
    seoOverview: {
      intro: 'A real-time Regular Expression testing playground powered by the native JavaScript RegExp engine. Features live match highlights, capture group extraction tables, flag toggles (g, i, m, s, u), and an integrated library of common patterns (email validation, IPv4/IPv6, UUIDs, dates, and URLs).',
      features: [
        'Real-Time Match Highlighting: Visualizes matching substrings instantly as you type.',
        'Capture Group Table: Inspect full match strings, capture group indices, and index offsets.',
        'Interactive Flag Toggles: Toggle Global (g), Case-Insensitive (i), Multiline (m), DotAll (s), and Unicode (u) flags.',
        'Curated Pattern Library: One-click insert for Email, URL, IP address, UUID v4, and Phone Number expressions.',
      ],
      howTo: [
        '1. Enter your regular expression pattern between the slashes (/.../).',
        '2. Toggle desired regex flags (g, i, m, s, u) in the toolbar.',
        '3. Enter or paste your sample test string in the input area.',
        '4. View highlighted matches and inspect captured group values in the table below.',
      ],
      troubleshooting: [
        {
          title: 'Catastrophic Backtracking Prevention',
          desc: 'Avoid nested quantifiers like (a+)+ on non-matching strings to prevent performance degradation.',
        },
        {
          title: 'Escaping Special Characters',
          desc: 'Metacharacters like ., *, +, ?, [, ], (, ), and \\ must be escaped with a backslash (\\.) to match literally.',
        },
        {
          title: 'Global Flag (g) for Multiple Matches',
          desc: 'Ensure the Global flag (g) is enabled if you want to find all occurrences rather than stopping at the first match.',
        },
      ],
      faqs: [
        {
          q: 'Which RegEx engine powers this tool?',
          a: 'It uses your browser’s native ECMAScript RegExp engine, ensuring 100% behavioral consistency with client and Node.js code.',
        },
        {
          q: 'Does it support named capture groups (?<name>...)?',
          a: 'Yes. Modern JavaScript named capture groups are supported and displayed in the capture table.',
        },
        {
          q: 'Can I copy the regex pattern with flags attached?',
          a: 'Yes. Click the Copy Pattern button in the window header to copy the full /pattern/flags literal.',
        },
        {
          q: 'Does it support the DotAll (s) flag?',
          a: 'Yes. Enabling the s flag allows the dot (.) metacharacter to match newline characters as well.',
        },
        {
          q: 'Is my test text transmitted to any server?',
          a: 'No. All regex evaluation executes locally within your browser tab.',
        },
      ],
    },
  },
  '/json-viewer': {
    id: 'json-viewer',
    path: '/json-viewer',
    title: 'JSON Formatter, Tree Viewer & JSONPath Query',
    badge: 'Interactive Tree & JSONPath',
    h1: 'Interactive JSON Formatter, Tree Viewer & Query Engine',
    description: 'Format, inspect, and evaluate JSON in an interactive collapsible tree view with real-time JSONPath filtering, key sorting, and in-browser schema validation.',
    seoOverview: {
      intro: 'QuickFormat Hub’s JSON Formatter & Tree Viewer offers interactive collapsible node inspection, color-coded tokens, and high-performance JSONPath query capabilities with zero server uploads.',
      features: [
        'Interactive Collapsible Tree: Explore nested objects and arrays with expand/collapse controls and node depth summaries.',
        'Real-Time JSONPath Querying: Filter JSON hierarchies using standard expressions like $.store.items[*].price.',
        'Alphabetical Key Sorting: Standardize JSON configurations and payloads for deterministic comparison.',
        'Schema Syntax Error Pointers: Accurately pinpoint line and column numbers of invalid syntax tokens.',
        'Zero-Latency Client-Side Parsing: Processes megabyte-scale JSON datasets in browser memory with zero network delay.',
      ],
      howTo: [
        '1. Paste your JSON payload into the left editor pane or select a preset.',
        '2. Switch between Tree View, JSONPath filter, or Formatted Code tabs.',
        '3. Use the search bar to filter keys and values instantly.',
        '4. Click "Copy JSON" or "Download JSON" to export formatted files.',
      ],
      troubleshooting: [
        {
          title: 'Syntax Error in JSONPath',
          desc: 'Ensure your JSONPath begins with the root symbol "$" (e.g. $.users[0].name or $..id).',
        },
      ],
      faqs: [
        {
          q: 'Can this viewer handle deeply nested JSON arrays?',
          a: 'Yes. The recursive tree architecture virtualizes and nests child nodes without stack overflow limits.',
        },
        {
          q: 'Does it send my JSON data anywhere?',
          a: 'No. All formatting, sorting, and tree rendering happen entirely in your local browser tab.',
        },
      ],
    },
  },
  '/security-headers': {
    id: 'security-headers',
    path: '/security-headers',
    title: 'HTTP Security Headers & CSP Evaluator',
    badge: 'OWASP Security Standard',
    h1: 'HTTP Security Headers & Content Security Policy (CSP) Evaluator',
    description: 'Inspect HTTP response headers and Content-Security-Policy (CSP) directives. Audit against XSS, clickjacking, and SSL stripping with instant security grades and hardened server snippets.',
    seoOverview: {
      intro: 'Evaluate web security posture by auditing critical HTTP response headers including HSTS, CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, and Permissions-Policy with hardened server config generation.',
      features: [
        'Executive Security Grading: Automated score from A+ to F based on OWASP security standards.',
        'Content-Security-Policy Audit: Flags unsafe-inline, unsafe-eval, and weak resource directives.',
        '1-Click Hardened Snippets: Copy production-ready configurations for Nginx, Apache, Cloudflare, Vercel, and Helmet.js.',
        'Zero-Data Transmission: Headers are evaluated in local memory without exposing server architecture.',
      ],
      howTo: [
        '1. Paste your HTTP response headers or Content-Security-Policy string.',
        '2. Review security findings, grade indicators, and flagged vulnerabilities.',
        '3. Copy the recommended hardened configuration for your server in the bottom generator.',
      ],
      troubleshooting: [
        {
          title: 'Missing Colon in Header Line',
          desc: 'Headers must follow the standard "Header-Name: Value" format for accurate parsing.',
        },
      ],
      faqs: [
        {
          q: 'What is the recommended HSTS max-age?',
          a: 'For production sites with HTTPS, max-age=31536000 (1 year) with includeSubDomains and preload is recommended by Google and Mozilla.',
        },
      ],
    },
  },
  '/hash-generator': {
    id: 'hash-generator',
    path: '/hash-generator',
    title: 'Web Crypto Hash & Secret Generator',
    badge: 'FIPS PUB 180-4',
    h1: 'Web Crypto Hash Checksum & Secret Generator (SHA-256, SHA-512, MD5, HMAC)',
    description: 'Compute SHA-256, SHA-512, MD5, and HMAC checksums directly in browser using native Web Crypto APIs. Verify file integrity and generate cryptographically secure secrets.',
    seoOverview: {
      intro: 'High-speed client-side cryptographic hashing engine utilizing browser-native window.crypto.subtle for hardware-accelerated SHA-256, SHA-512, and HMAC generation, plus local file checksum verification.',
      features: [
        'Hardware-Accelerated Web Crypto: Native C++ SubtleCrypto engine for zero-overhead cryptographic computation.',
        'Simultaneous Multi-Hash Digest: Generates SHA-256, SHA-512, SHA-384, MD5, and HMAC simultaneously.',
        'Local File Checksum: Drag and drop files to calculate SHA-256 checksums without uploading to a server.',
        'CSPRNG Secret Generator: Generate passwords and API keys with Shannon entropy bits scoring.',
      ],
      howTo: [
        '1. Enter text to compute simultaneous hashes or enter an HMAC secret key.',
        '2. Use the File Checksum tab to verify downloaded files or software distributions.',
        '3. Use Key Generator to produce cryptographically random API tokens.',
      ],
      troubleshooting: [
        {
          title: 'MD5 vs SHA-256',
          desc: 'MD5 is recommended only for non-security checksums and legacy deduplication. Use SHA-256 for cryptographic security.',
        },
      ],
      faqs: [
        {
          q: 'Does computing a file hash upload the file to any server?',
          a: 'No. The file is read via JavaScript FileReader directly into browser memory. Nothing leaves your computer.',
        },
      ],
    },
  },
  '/timestamp-converter': {
    id: 'timestamp-converter',
    path: '/timestamp-converter',
    title: 'Unix Timestamp & Timezone Converter',
    badge: 'POSIX Epoch',
    h1: 'Unix Timestamp & Epoch Timezone Converter (Seconds, Milliseconds & ISO 8601)',
    description: 'Convert seconds and milliseconds epoch timestamps to ISO 8601, UTC, and local timezones. Includes live real-time clock ticker, relative time, and global city timezone matrices.',
    seoOverview: {
      intro: 'Convert between Unix epoch timestamps and human-readable dates across multiple international timezones with sub-second accuracy and relative time calculations.',
      features: [
        'Live Real-Time Epoch Clock: Current Unix seconds and milliseconds ticker with pause control.',
        'Bidirectional Conversion: Converts epoch seconds/ms to ISO 8601, RFC 2822, and localized strings.',
        'Global City Timezone Matrix: Compare localized times across New York, London, Tokyo, Mumbai, and Sydney.',
        'Relative Time Math: Quickly add or subtract hours, days, and weeks.',
      ],
      howTo: [
        '1. Paste or type an epoch timestamp (seconds or milliseconds) or an ISO date string.',
        '2. View converted UTC, ISO 8601, and local timezone formats.',
        '3. Inspect the global timezone matrix or use quick adjust buttons.',
      ],
      troubleshooting: [
        {
          title: 'Seconds vs Milliseconds',
          desc: 'Timestamps with 10 digits are seconds (e.g. 1791350000); timestamps with 13 digits are milliseconds. The converter auto-detects both.',
        },
      ],
      faqs: [
        {
          q: 'What is the Year 2038 problem?',
          a: 'On Jan 19, 2038, 32-bit signed integers overflow. Modern 64-bit systems and JavaScript numbers (64-bit floats) handle dates billions of years into the future without issue.',
        },
      ],
    },
  },
  '/sql-formatter': {
    id: 'sql-formatter',
    path: '/sql-formatter',
    title: 'SQL Query Formatter & Minifier',
    badge: 'ANSI SQL / Postgres / MySQL',
    h1: 'SQL Query Formatter & Minifier Online (Client-Side & Private)',
    description: 'Format, beautify, and minify messy SQL queries. Configurable uppercase keyword casing, intelligent clause indentation, CTE support, and instant query statistics.',
    seoOverview: {
      intro: 'Beautify, structure, and minify SQL queries for PostgreSQL, MySQL, SQLite, BigQuery, and SQL Server. Highlights joins, common table expressions, and complex subqueries with zero server uploads.',
      features: [
        'Keyword Casing Control: Choose between UPPERCASE, lowercase, or preserved original keywords.',
        'Intelligent Clause Indentation: Automatic line breaks and indents for SELECT, JOIN, WHERE, and GROUP BY.',
        'Single-Line Minifier: Strip comments and whitespace to embed queries into application code or configs.',
        'Query Statistics: Instant detection of statement type, table counts, and relational joins.',
      ],
      howTo: [
        '1. Paste unformatted SQL into the left pane or pick a sample query preset.',
        '2. Choose your keyword casing and indent preferences in the options bar.',
        '3. Click "Copy Formatted SQL" or "Download SQL" to export.',
      ],
      troubleshooting: [
        {
          title: 'String Literals with Keywords',
          desc: 'Quoted string literals containing keywords are preserved intact and will not have their casing modified.',
        },
      ],
      faqs: [
        {
          q: 'Which SQL dialects are supported?',
          a: 'Standard ANSI SQL, PostgreSQL, MySQL, MariaDB, SQLite, BigQuery, and Microsoft SQL Server.',
        },
      ],
    },
  },
  '/uuid-generator': {
    id: 'uuid-generator',
    path: '/uuid-generator',
    title: 'UUID (v4/v7), ULID & NanoID Generator',
    badge: 'RFC 9562 & ULID',
    h1: 'UUID v4, UUID v7, ULID & NanoID Batch Generator & Inspector',
    description: 'Batch generate cryptographically secure UUID v4, timestamp-ordered UUID v7 (RFC 9562), ULID, and NanoIDs. Inspect and decode embedded creation timestamps directly in browser.',
    seoOverview: {
      intro: 'Generate batch identifiers conforming to UUID v4, the new RFC 9562 UUID v7 timestamp standard, ULID, and NanoID with custom formats (JSON array, CSV, newline) and embedded timestamp inspection.',
      features: [
        'RFC 9562 UUID v7 Support: The modern standard combining millisecond timestamp ordering with cryptographic randomness.',
        'Batch Generation: Produce up to 500 identifiers in a single click with instant copy and download.',
        'Embedded Timestamp Inspector: Decode UUIDv7 or ULID to reveal creation time and local date.',
        'Hardware CSPRNG: Uses window.crypto.getRandomValues for cryptographic uniqueness.',
      ],
      howTo: [
        '1. Select your identifier type (UUID v7, UUID v4, ULID, or NanoID).',
        '2. Set desired quantity and formatting options (casing, hyphens, braces).',
        '3. Click "Copy All" or download as a .txt or .json batch file.',
        '4. Paste any UUIDv7 or ULID into the inspector to verify its timestamp.',
      ],
      troubleshooting: [
        {
          title: 'Why use UUID v7 over UUID v4?',
          desc: 'UUID v7 is monotonically sortable by creation time, eliminating B-tree database index fragmentation in PostgreSQL and MySQL while retaining globally unique randomness.',
        },
      ],
      faqs: [
        {
          q: 'Are these UUIDs cryptographically random?',
          a: 'Yes. All random bits are sourced directly from the browser’s Cryptographically Secure Pseudo-Random Number Generator (CSPRNG).',
        },
      ],
    },
  },
};

