import React, { useState, useEffect } from 'react';
import { UploadCloud, FileSpreadsheet, FileCode, FileText, BookOpen, Binary, GitCompare } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export function GlobalDropzone({ onNavigate }) {
  const toast = useToast();
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer.types && e.dataTransfer.types.includes('Files')) {
        setIsDragging(true);
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (!files || files.length === 0) return;

      const file = files[0];
      const name = file.name.toLowerCase();

      let targetTool = '/text-diff';
      let toolName = 'Text & Code Diff';

      if (name.endsWith('.json')) {
        targetTool = '/json-to-csv';
        toolName = 'JSON to CSV';
      } else if (name.endsWith('.csv') || name.endsWith('.tsv')) {
        targetTool = '/csv-to-json';
        toolName = 'CSV to JSON';
      } else if (name.endsWith('.md') || name.endsWith('.markdown')) {
        targetTool = '/markdown-editor';
        toolName = 'Markdown Editor';
      } else if (name.endsWith('.pdf')) {
        targetTool = '/pdf-to-markdown';
        toolName = 'PDF Reader';
      } else if (
        name.endsWith('.png') ||
        name.endsWith('.jpg') ||
        name.endsWith('.jpeg') ||
        name.endsWith('.webp') ||
        name.endsWith('.svg') ||
        name.endsWith('.gif')
      ) {
        targetTool = '/base64-tool';
        toolName = 'Base64 Tool';
      }

      onNavigate(targetTool);
      toast.success(`Dropped "${file.name}" — Opened in ${toolName}!`);
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [onNavigate, toast]);

  if (!isDragging) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md pointer-events-none animate-fade-in">
      <div className="max-w-lg w-full p-10 rounded-3xl border-2 border-dashed border-brand-500 bg-white/95 dark:bg-slate-900/95 text-center shadow-2xl space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto shadow-inner">
          <UploadCloud className="w-8 h-8 animate-bounce" />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Drop File to Auto-Route
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            QuickFormat Hub automatically identifies JSON, CSV, PDF, Markdown, and Images!
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2 text-[11px] font-mono text-slate-400">
          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">.json</span>
          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">.csv</span>
          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">.pdf</span>
          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">.md</span>
          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800">.png</span>
        </div>
      </div>
    </div>
  );
}
