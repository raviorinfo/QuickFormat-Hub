import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  Download,
  Copy,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sparkles,
  BookOpen,
  RefreshCw,
  Eye,
  FileCode,
  Layers,
  FileCheck,
  Printer
} from 'lucide-react';
import {
  loadPdfDocument,
  renderPdfPage,
  extractPageTextAsMarkdown,
  extractEntirePdfAsMarkdown,
} from '../../utils/pdfExtractor';
import { createSamplePdfBytes } from '../../utils/samplePdf';
import { useToast } from '../../context/ToastContext';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
import { StatCard } from '../common/StatCard';
import { triggerConfetti } from '../../utils/confetti';
import { marked } from 'marked';

export function PdfToMarkdownTool() {
  const toast = useToast();
  const canvasRef = useRef(null);

  const [pdfDoc, setPdfDoc] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.15);
  const [fileName, setFileName] = useState('engineering_spec_demo.pdf');

  const [extractedMarkdown, setExtractedMarkdown] = useState('');
  const [activeTab, setActiveTab] = useState('preview'); // 'preview' | 'source'
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractScope, setExtractScope] = useState('all'); // 'all' | 'page'

  // UX & Accessibility state
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  const fontSizeClass =
    fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-base' : 'text-sm';

  // Load initial demo PDF
  useEffect(() => {
    let active = true;
    const initDemo = async () => {
      try {
        const bytes = createSamplePdfBytes();
        const doc = await loadPdfDocument(bytes);
        if (active) {
          setPdfDoc(doc);
          setTotalPages(doc.numPages);
          setCurrentPage(1);
          setFileName('engineering_spec_demo.pdf');
        }
      } catch (err) {
        console.error('Failed to initialize demo PDF:', err);
      }
    };
    initDemo();
    return () => {
      active = false;
    };
  }, []);

  // Render canvas whenever pdfDoc, currentPage, or zoomScale changes
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;
    let cancelled = false;

    renderPdfPage(pdfDoc, currentPage, canvasRef.current, zoomScale).catch((err) => {
      if (!cancelled) console.error('Error rendering page:', err);
    });

    return () => {
      cancelled = true;
    };
  }, [pdfDoc, currentPage, zoomScale]);

  // Extract Markdown whenever pdfDoc or extractScope changes
  useEffect(() => {
    if (!pdfDoc) return;
    let active = true;

    const performExtraction = async () => {
      setIsExtracting(true);
      try {
        let md = '';
        if (extractScope === 'all') {
          md = await extractEntirePdfAsMarkdown(pdfDoc);
        } else {
          md = await extractPageTextAsMarkdown(pdfDoc, currentPage);
        }
        if (active) {
          setExtractedMarkdown(md);
        }
      } catch (err) {
        console.error('Extraction error:', err);
      } finally {
        if (active) setIsExtracting(false);
      }
    };

    performExtraction();

    return () => {
      active = false;
    };
  }, [pdfDoc, currentPage, extractScope]);

  // Handle local PDF upload
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      toast.info(`Loading "${file.name}"...`);
      const buffer = await file.arrayBuffer();
      const doc = await loadPdfDocument(buffer);
      setPdfDoc(doc);
      setTotalPages(doc.numPages);
      setCurrentPage(1);
      setFileName(file.name);
      toast.success(`Loaded "${file.name}" (${doc.numPages} pages)`);
    } catch {
      toast.error('Failed to load PDF file.');
    }
    e.target.value = '';
  };

  // Download Markdown (.md)
  const handleDownloadMarkdown = () => {
    const baseName = fileName.replace(/\.[^/.]+$/, '');
    const blob = new Blob([extractedMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${baseName}_extracted.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    triggerConfetti();
    toast.success('Downloaded extracted Markdown (.md)!');
  };

  // Rendered preview HTML from extracted Markdown
  const previewHtml = marked.parse(extractedMarkdown || '*No text extracted.*');

  const wordCount = extractedMarkdown ? extractedMarkdown.split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-4 z-50 bg-[#060911]/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl overflow-y-auto' : ''}`}>
      {/* Studio Tool Hero Header */}
      <ToolHeroHeader
        icon={BookOpen}
        category="Docs & Extraction"
        badge="PDF.js • WebAssembly"
        title="PDF Reader & Markdown Extractor"
        description="Inspect and navigate multi-page PDF documents locally while extracting structured GitHub-flavored Markdown tables, headers, and paragraphs."
        actions={
          <>
            <CopyButton
              text={extractedMarkdown}
              label="Copy Markdown"
              copiedLabel="Markdown Copied!"
              targetElementId="markdown-extracted-view"
              variant="default"
            />

            <button
              onClick={handleDownloadMarkdown}
              id="btn-download-pdf-md"
              className="btn-primary"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Markdown (.md)</span>
            </button>
          </>
        }
      />

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Total Pages"
          value={`${totalPages} Pages`}
          subtext={`Current page ${currentPage}`}
          color="sky"
        />
        <StatCard
          icon={ZoomIn}
          label="Canvas Zoom"
          value={`${Math.round(zoomScale * 100)}% Scale`}
          subtext="Vector rasterization"
          color="emerald"
        />
        <StatCard
          icon={Layers}
          label="Extraction Scope"
          value={extractScope === 'all' ? 'Entire Doc' : `Page ${currentPage}`}
          subtext="Wasm parser mode"
          color="purple"
        />
        <StatCard
          icon={FileText}
          label="Extracted Words"
          value={`${wordCount.toLocaleString()} Words`}
          subtext={`${extractedMarkdown.length.toLocaleString()} chars`}
          color="amber"
        />
      </div>

      {/* Main Dual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT PANE: Visual PDF Reader Canvas */}
        <div className="flex flex-col rounded-2xl glass-panel shadow-xl overflow-hidden editor-pane border border-slate-200/80 dark:border-white/[0.08]">
          <WindowHeader
            title={fileName || 'PDF Document'}
            badge="PDF"
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          >
            {/* Navigation & Zoom in header */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Page Navigator */}
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-lg text-xs border border-slate-200/60 dark:border-white/[0.08]">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="px-1.5 font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-lg text-xs border border-slate-200/60 dark:border-white/[0.08]">
                <button
                  onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.15))}
                  className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setZoomScale((z) => Math.min(2.5, z + 0.15))}
                  className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Upload PDF */}
              <label
                className="px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 hover:bg-sky-500 hover:text-white transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer border border-sky-500/20"
                title="Upload custom PDF"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Upload</span>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
            </div>
          </WindowHeader>

          {/* Canvas Render viewport */}
          <div className="p-4 flex-1 flex items-center justify-center overflow-auto max-h-[600px] bg-slate-200/40 dark:bg-[#050811]/90">
            <div className="shadow-2xl rounded-lg overflow-hidden border border-slate-300 dark:border-white/[0.1] bg-white">
              <canvas ref={canvasRef} className="block max-w-full" />
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Extracted Markdown */}
        <div className="flex flex-col rounded-2xl glass-panel shadow-xl overflow-hidden editor-pane border border-slate-200/80 dark:border-white/[0.08]">
          <WindowHeader
            title="Extracted Markdown"
            badge="Markdown"
            charsCount={extractedMarkdown.length}
            linesCount={extractedMarkdown ? extractedMarkdown.split('\n').length : 0}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
          >
            <div className="flex items-center gap-2">
              {/* Tab Switcher */}
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-lg text-xs border border-slate-200/60 dark:border-white/[0.08]">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded font-semibold transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => setActiveTab('source')}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded font-semibold transition-colors ${
                    activeTab === 'source'
                      ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <FileCode className="w-3 h-3" />
                  <span>Source</span>
                </button>
              </div>

              {/* Scope Switcher */}
              <select
                value={extractScope}
                onChange={(e) => setExtractScope(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-white/[0.1] rounded-lg px-2 py-0.5 text-slate-800 dark:text-slate-200 text-[11px] focus:outline-none focus:border-sky-500"
              >
                <option value="all">Full Doc</option>
                <option value="page">This Page</option>
              </select>

              <CopyButton
                text={extractedMarkdown}
                label="Copy"
                copiedLabel="Copied!"
                targetElementId="markdown-extracted-view"
                variant="subtle"
              />
            </div>
          </WindowHeader>

          {/* Content */}
          <div
            id="markdown-extracted-view"
            className="p-4 flex-1 flex flex-col overflow-auto max-h-[600px] transition-all"
          >
            {isExtracting ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin text-sky-500 mb-2" />
                <p className="text-sm font-medium">Extracting typographic Markdown...</p>
              </div>
            ) : activeTab === 'preview' ? (
              <div
                className={`markdown-body ${fontSizeClass} text-slate-900 dark:text-slate-100 leading-relaxed p-2`}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <div className="p-1 flex-1 flex flex-col">
                <textarea
                  value={extractedMarkdown}
                  onChange={(e) => setExtractedMarkdown(e.target.value)}
                  rows={20}
                  className={`w-full flex-1 p-3 font-mono code-viewport bg-slate-50 dark:bg-[#050811] ${fontSizeClass} border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed min-h-[460px]`}
                  placeholder="Extracted Markdown will appear here..."
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
