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
} from 'lucide-react';

export const ALL_TOOLS = [
  // Data & Format
  { path: '/json-to-csv', label: 'JSON to CSV', icon: FileSpreadsheet, category: 'Data' },
  { path: '/csv-to-json', label: 'CSV to JSON', icon: FileCode, category: 'Data' },
  { path: '/json-to-types', label: 'JSON to Types', icon: Layers, category: 'Data' },
  { path: '/base64-tool', label: 'Base64 Tool', icon: Binary, category: 'Data' },

  // Security & Privacy
  { path: '/pii-redactor', label: 'PII Redactor', icon: ShieldAlert, category: 'Security' },
  { path: '/jwt-inspector', label: 'JWT Inspector', icon: Lock, category: 'Security' },

  // Docs & Text
  { path: '/markdown-editor', label: 'Markdown Editor', icon: FileText, category: 'Docs' },
  { path: '/pdf-to-markdown', label: 'PDF Reader', icon: BookOpen, category: 'Docs' },
  { path: '/text-diff', label: 'Text Diff', icon: GitCompare, category: 'Docs' },

  // Dev & API
  { path: '/curl-converter', label: 'cURL to Code', icon: Terminal, category: 'Dev' },
  { path: '/url-parser', label: 'URL Parser', icon: Link2, category: 'Dev' },
  { path: '/cron-scheduler', label: 'Cron Scheduler', icon: Clock, category: 'Dev' },
  { path: '/regex-tester', label: 'Regex Tester', icon: Search, category: 'Dev' },
];
