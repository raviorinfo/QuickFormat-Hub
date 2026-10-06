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
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';
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
      toast.success(`PDF loaded (${doc.numPages} pages)`);
    } catch (err) {
      toast.error('Failed to load PDF file. Please ensure it is a valid PDF.');
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

  return (
    <div className={`space-y-6 ${isZenMode ? 'fixed inset-4 z-50 bg-slate-900/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl overflow-y-auto' : ''}`}>
      {/* Header & Single H1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Client-Side PDF Rasterizer & AST Parser</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            PDF Reader & Markdown Extractor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Read and navigate PDF files locally while extracting structured GitHub-flavored Markdown.
          </p>
        </div>

        {/* Global Export Bar */}
        <div className="flex items-center gap-2 flex-wrap">
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
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Markdown (.md)</span>
          </button>
        </div>
      </div>

      {/* Main Dual Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT PANE: Visual PDF Reader Canvas */}
        <div className="flex flex-col rounded-2xl glass-panel shadow-xl overflow-hidden editor-pane border border-slate-200/80 dark:border-slate-800/80">
          <WindowHeader
            title={fileName || 'PDF Document'}
            badge="PDF"
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          >
            {/* Navigation & Zoom in header */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Page Navigator */}
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
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

              {/* Zoom Buttons */}
              <div className="flex items-center gap-0.5 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setZoomScale((z) => Math.max(0.6, z - 0.15))}
                  className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3 h-3" />
                </button>
                <span className="px-1 font-mono text-[10px] text-slate-500">
                  {Math.round(zoomScale * 100)}%
                </span>
                <button
                  onClick={() => setZoomScale((z) => Math.min(2.0, z + 0.15))}
                  className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3 h-3" />
                </button>
              </div>

              {/* Upload PDF */}
              <label className="px-2 py-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-brand-500 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-xs font-medium flex items-center gap-1 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open</span>
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handlePdfUpload}
                  className="hidden"
                />
              </label>
            </div>
          </WindowHeader>

          {/* Canvas Viewport */}
          <div className="p-4 bg-slate-100/70 dark:bg-slate-950/80 flex items-center justify-center overflow-auto max-h-[600px] min-h-[480px]">
            <canvas
              ref={canvasRef}
              className="rounded-lg shadow-2xl border border-slate-300 dark:border-slate-800 max-w-full bg-white transition-transform"
            />
          </div>
        </div>

        {/* RIGHT PANE: Extracted Markdown Editor / Preview */}
        <div className="flex flex-col rounded-2xl glass-panel shadow-xl overflow-hidden editor-pane border border-slate-200/80 dark:border-slate-800/80 min-h-[520px]">
          <WindowHeader
            title="Extracted Markdown"
            badge={activeTab === 'preview' ? 'HTML' : 'MD'}
            charsCount={extractedMarkdown.length}
            linesCount={extractedMarkdown ? extractedMarkdown.split('\n').length : 0}
            fontSize={fontSize}
            onFontSizeChange={setFontSize}
            isZenMode={isZenMode}
            onToggleZen={() => setIsZenMode(!isZenMode)}
          >
            {/* View Mode Toggle & Scope */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded-lg">
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    activeTab === 'preview'
                      ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => setActiveTab('source')}
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                    activeTab === 'source'
                      ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
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
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-0.5 text-slate-800 dark:text-slate-200 text-[11px] focus:outline-none focus:border-brand-500"
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
                <RefreshCw className="w-8 h-8 animate-spin text-brand-500 mb-2" />
                <p className="text-sm font-medium">Extracting typographic Markdown...</p>
              </div>
            ) : activeTab === 'preview' ? (
              <div
                className={`markdown-body ${fontSizeClass} text-slate-900 dark:text-slate-100 leading-relaxed p-2`}
                dangerouslySetInnerHTML={{ __html: previewHtml }}
              />
            ) : (
              <textarea
                value={extractedMarkdown}
                onChange={(e) => setExtractedMarkdown(e.target.value)}
                rows={20}
                className={`w-full flex-1 p-3 font-mono ${fontSizeClass} bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed min-h-[460px]`}
                placeholder="Extracted Markdown will appear here..."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
