import {
  FileSpreadsheet,
  FileCode,
  FileText,
  BookOpen,
  GitCompare,
  Binary,
  Link2,
  ShieldAlert,
  Terminal,
  Lock,
  Layers,
  Clock,
  Search,
  ListTree,
  ShieldCheck,
  Fingerprint,
  Database,
} from 'lucide-react';

export const ALL_TOOLS = [
  // Data & Format
  { path: '/json-to-csv', label: 'JSON to CSV', icon: FileSpreadsheet, category: 'Data' },
  { path: '/csv-to-json', label: 'CSV to JSON', icon: FileCode, category: 'Data' },
  { path: '/json-viewer', label: 'JSON Tree & Query', icon: ListTree, category: 'Data' },
  { path: '/json-to-types', label: 'JSON to Types', icon: Layers, category: 'Data' },
  { path: '/base64-tool', label: 'Base64 Tool', icon: Binary, category: 'Data' },

  // Security & Privacy
  { path: '/security-headers', label: 'Security Headers', icon: ShieldCheck, category: 'Security' },
  { path: '/hash-generator', label: 'Hash & Secrets', icon: Fingerprint, category: 'Security' },
  { path: '/jwt-inspector', label: 'JWT Inspector', icon: Lock, category: 'Security' },
  { path: '/pii-redactor', label: 'PII Redactor', icon: ShieldAlert, category: 'Security' },

  // Docs & Text
  { path: '/markdown-editor', label: 'Markdown Editor', icon: FileText, category: 'Docs' },
  { path: '/pdf-to-markdown', label: 'PDF Reader', icon: BookOpen, category: 'Docs' },
  { path: '/text-diff', label: 'Text Diff', icon: GitCompare, category: 'Docs' },

  // Dev & API
  { path: '/timestamp-converter', label: 'Epoch Timestamp', icon: Clock, category: 'Dev' },
  { path: '/sql-formatter', label: 'SQL Formatter', icon: Database, category: 'Dev' },
  { path: '/uuid-generator', label: 'UUID & ULID', icon: Binary, category: 'Dev' },
  { path: '/curl-converter', label: 'cURL to Code', icon: Terminal, category: 'Dev' },
  { path: '/url-parser', label: 'URL Parser', icon: Link2, category: 'Dev' },
  { path: '/cron-scheduler', label: 'Cron Scheduler', icon: Clock, category: 'Dev' },
  { path: '/regex-tester', label: 'Regex Tester', icon: Search, category: 'Dev' },
];
