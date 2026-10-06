import React, { useState, useMemo, useRef } from 'react';
import {
  FileText,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Table,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Download,
  Printer,
  Trash2,
  RefreshCw,
  Eye,
  FileCode,
  Columns,
  Clock,
  Sparkles
} from 'lucide-react';
import { marked } from 'marked';
import {
  calculateMetrics,
  generateStandaloneHtml,
  SAMPLE_MARKDOWN,
} from '../../utils/markdownUtils';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { triggerConfetti } from '../../utils/confetti';

// Configure marked
marked.setOptions({
  gfm: true,
  breaks: true,
});

export function MarkdownEditorTool() {
  const toast = useToast();
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'editor' | 'preview'
  const [activePreviewTab, setActivePreviewTab] = useState('rendered'); // 'rendered' | 'html-code'
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);

  const textareaRef = useRef(null);

  const metrics = useMemo(() => calculateMetrics(markdown), [markdown]);

  const renderedHtml = useMemo(() => {
    try {
      return marked.parse(markdown || '');
    } catch {
      return '<p class="text-rose-500">Error rendering Markdown preview.</p>';
    }
  }, [markdown]);

  const insertFormatting = (prefix, suffix = '', placeholder = 'text') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = markdown.substring(start, end);
    const textToInsert = selected ? `${prefix}${selected}${suffix}` : `${prefix}${placeholder}${suffix}`;

    const newMarkdown =
      markdown.substring(0, start) + textToInsert + markdown.substring(end);

    setMarkdown(newMarkdown);

    setTimeout(() => {
      textarea.focus();
      const cursorTarget = selected
        ? start + textToInsert.length
        : start + prefix.length + placeholder.length;
      textarea.setSelectionRange(cursorTarget, cursorTarget);
    }, 10);
  };

  const handleBold = () => insertFormatting('**', '**', 'bold text');
  const handleItalic = () => insertFormatting('*', '*', 'italic text');
  const handleH1 = () => insertFormatting('# ', '', 'Heading 1');
  const handleH2 = () => insertFormatting('## ', '', 'Heading 2');
  const handleH3 = () => insertFormatting('### ', '', 'Heading 3');
  const handleBulletList = () => insertFormatting('- ', '', 'List item');
  const handleNumberedList = () => insertFormatting('1. ', '', 'Numbered item');
  const handleTaskList = () => insertFormatting('- [ ] ', '', 'Task item');
  const handleQuote = () => insertFormatting('> ', '', 'Quoted thought');
  const handleCodeBlock = () => insertFormatting('```javascript\n', '\n```', '// Code snippet');
  const handleTable = () =>
    insertFormatting(
      '\n| Header 1 | Header 2 | Header 3 |\n| :--- | :---: | ---: |\n| Row 1 | Cell 2 | Cell 3 |\n| Row 2 | Cell 2 | Cell 3 |\n'
    );
  const handleLink = () => insertFormatting('[', '](https://example.com)', 'Link description');
  const handleImage = () => insertFormatting('![', '](https://via.placeholder.com/600x300)', 'Image Alt');
  const handleDivider = () => insertFormatting('\n\n---\n\n');

  const handleExportHtml = () => {
    const fullHtml = generateStandaloneHtml(renderedHtml, 'Exported Markdown — QuickFormat Hub');
    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `quickformat_doc_${Date.now()}.html`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerConfetti();
    toast.success('Downloaded standalone HTML file!');
  };

  const handlePrintToPdf = () => {
    toast.info('Opening print dialog for PDF generation...');
    setTimeout(() => window.print(), 200);
  };

  const fontSizeClass =
    fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-xs sm:text-sm';

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-0 z-50 p-6 bg-slate-950 overflow-y-auto' : ''}`}>
      {/* Header & Single H1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Real-Time AST Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Markdown Editor & PDF/HTML Exporter
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Write structured documents with live side-by-side preview, standalone HTML generation, and print-to-PDF.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <CopyButton
            text={() => renderedHtml}
            label="Copy HTML"
            copiedLabel="Copied HTML!"
            targetElementId="markdown-preview-card"
          />

          <button
            onClick={handleExportHtml}
            id="btn-export-html"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export HTML</span>
          </button>

          <button
            onClick={handlePrintToPdf}
            id="btn-print-pdf"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-all"
            title="Generate print-ready PDF using fine-tuned CSS media rules"
          >
            <Printer className="w-4 h-4" />
            <span>Print to PDF</span>
          </button>
        </div>
      </div>

      {/* Real-Time Metrics Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl glass-panel text-xs">
        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300 font-mono">
          <span>
            <strong className="text-slate-900 dark:text-white font-bold">{metrics.words}</strong> words
          </span>
          <span className="text-slate-400">•</span>
          <span>
            <strong className="text-slate-900 dark:text-white font-bold">{metrics.characters}</strong> chars
          </span>
          <span className="text-slate-400">•</span>
          <span>
            <strong className="text-slate-900 dark:text-white font-bold">{metrics.lines}</strong> lines
          </span>
          <span className="text-slate-400 hidden sm:inline">•</span>
          <span className="hidden sm:flex items-center gap-1 text-brand-600 dark:text-brand-400">
            <Clock className="w-3.5 h-3.5" />
            ~{metrics.readingTimeMinutes} min read
          </span>
        </div>

        {/* Layout View Toggles */}
        <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg">
          <button
            onClick={() => setViewMode('split')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'split'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="Split View"
          >
            <Columns className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('editor')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'editor'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="Editor Only"
          >
            <FileCode className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('preview')}
            className={`p-1.5 rounded text-xs transition-colors ${
              viewMode === 'preview'
                ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
            title="Preview Only"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <div className="flex items-center flex-wrap gap-1 p-2 rounded-xl glass-panel shadow-xs no-print">
        <button
          onClick={handleBold}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Bold (**text**)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          onClick={handleItalic}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Italic (*text*)"
        >
          <Italic className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></span>

        <button
          onClick={handleH1}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors font-bold text-xs"
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={handleH2}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors font-bold text-xs"
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleH3}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors font-bold text-xs"
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></span>

        <button
          onClick={handleBulletList}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Bulleted List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={handleNumberedList}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <button
          onClick={handleTaskList}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Task List Checkbox"
        >
          <CheckSquare className="w-4 h-4" />
        </button>

        <span className="w-px h-4 bg-slate-300 dark:bg-slate-700 mx-1"></span>

        <button
          onClick={handleQuote}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Blockquote"
        >
          <Quote className="w-4 h-4" />
        </button>
        <button
          onClick={handleCodeBlock}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Code Block"
        >
          <Code className="w-4 h-4" />
        </button>
        <button
          onClick={handleTable}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Table Template"
        >
          <Table className="w-4 h-4" />
        </button>
        <button
          onClick={handleLink}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Hyperlink"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleImage}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Image"
        >
          <ImageIcon className="w-4 h-4" />
        </button>
        <button
          onClick={handleDivider}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
          title="Divider"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="ml-auto flex items-center gap-1">
          <button
            onClick={() => {
              setMarkdown(SAMPLE_MARKDOWN);
              toast.success('Sample markdown restored');
            }}
            className="p-1.5 rounded-lg text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs flex items-center gap-1"
            title="Sample"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sample</span>
          </button>
          <button
            onClick={() => {
              setMarkdown('');
              toast.info('Editor cleared');
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* LEFT: Markdown Editor Pane */}
        {(viewMode === 'split' || viewMode === 'editor') && (
          <div
            className={`flex flex-col rounded-2xl glass-panel shadow-xl overflow-hidden editor-pane ${
              viewMode === 'editor' ? 'lg:col-span-2' : ''
            }`}
          >
            <WindowHeader
              title="Markdown Source"
              badge="MD"
              charsCount={markdown.length}
              linesCount={markdown.split('\n').length}
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
              isZenMode={isZenMode}
              onToggleZen={() => setIsZenMode(!isZenMode)}
            />
            <textarea
              ref={textareaRef}
              id="markdown-input-textarea"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="Start writing Markdown here..."
              rows={22}
              className={`w-full flex-1 p-4 font-mono ${fontSizeClass} bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[480px]`}
              spellCheck={false}
            />
          </div>
        )}

        {/* RIGHT: Live Preview Pane */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div
            id="markdown-preview-card"
            className={`flex flex-col rounded-2xl glass-panel shadow-xl overflow-hidden editor-pane ${
              viewMode === 'preview' ? 'lg:col-span-2' : ''
            }`}
          >
            <WindowHeader
              title="Formatted Preview"
              badge="HTML"
              fontSize={fontSize}
              onFontSizeChange={setFontSize}
            >
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg">
                <button
                  onClick={() => setActivePreviewTab('rendered')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    activePreviewTab === 'rendered'
                      ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Preview
                </button>
                <button
                  onClick={() => setActivePreviewTab('html-code')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    activePreviewTab === 'html-code'
                      ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Raw HTML
                </button>
              </div>
            </WindowHeader>

            {/* Preview Body */}
            <div className="p-6 flex-1 overflow-y-auto max-h-[560px] bg-slate-50/50 dark:bg-slate-950/40">
              {activePreviewTab === 'rendered' ? (
                <div
                  id="markdown-rendered-view"
                  className="markdown-body text-slate-900 dark:text-slate-100 text-sm"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              ) : (
                <pre className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap select-all">
                  {renderedHtml}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="hidden print-only-container">
        <div
          className="markdown-body p-6 text-black"
          dangerouslySetInnerHTML={{ __html: renderedHtml }}
        />
      </div>
    </div>
  );
}
