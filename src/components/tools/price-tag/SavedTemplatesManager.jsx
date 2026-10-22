import React, { useState, useEffect } from 'react';
import {
  Save,
  FolderOpen,
  Copy,
  Trash2,
  Edit2,
  Download,
  Upload,
  Check,
  X,
  FileCode,
  Tag,
  Grid,
  Package
} from 'lucide-react';
import { useToast } from '../../../context/ToastContext';

const STORAGE_KEY = 'qf_saved_price_tag_templates';

export function SavedTemplatesManager({
  currentDesign,
  currentSheetConfig,
  onLoadTemplate,
  onLoadSheetConfig,
}) {
  const toast = useToast();
  const [savedTemplates, setSavedTemplates] = useState(() => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const [newTemplateName, setNewTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('price-tag'); // 'price-tag' | 'ecommerce-label' | 'sheet-preset'
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  // Persist templates to localStorage
  const persistTemplates = (templates) => {
    setSavedTemplates(templates);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    } catch (err) {
      console.warn('Failed to save templates to localStorage', err);
    }
  };

  // Save current design as a new template
  const handleSaveCurrent = () => {
    const name = newTemplateName.trim() || `Design Preset ${savedTemplates.length + 1}`;
    const newEntry = {
      id: `tmpl-${Date.now()}`,
      name,
      type: templateType,
      createdAt: new Date().toISOString(),
      designData: currentDesign,
      sheetConfig: currentSheetConfig,
    };

    const updated = [newEntry, ...savedTemplates];
    persistTemplates(updated);
    setNewTemplateName('');
    toast.success(`Saved template: ${name}`);
  };

  // Duplicate a template
  const handleDuplicate = (template) => {
    const duplicate = {
      ...template,
      id: `tmpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    persistTemplates([duplicate, ...savedTemplates]);
    toast.success(`Duplicated ${template.name}`);
  };

  // Delete template
  const handleDelete = (id) => {
    const filtered = savedTemplates.filter((t) => t.id !== id);
    persistTemplates(filtered);
    toast.success('Deleted template');
  };

  // Start rename
  const handleStartRename = (template) => {
    setEditingId(template.id);
    setEditingName(template.name);
  };

  // Save rename
  const handleSaveRename = (id) => {
    if (!editingName.trim()) return;
    const updated = savedTemplates.map((t) =>
      t.id === id ? { ...t, name: editingName.trim() } : t
    );
    persistTemplates(updated);
    setEditingId(null);
    toast.success('Renamed template');
  };

  // Export templates as JSON file
  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedTemplates, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `quickformat-tag-templates-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Exported templates as JSON');
  };

  // Import templates from JSON file
  const handleImportJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const imported = JSON.parse(evt.target?.result);
        if (Array.isArray(imported)) {
          const merged = [...imported, ...savedTemplates];
          persistTemplates(merged);
          toast.success(`Imported ${imported.length} templates successfully!`);
        } else {
          toast.error('Invalid template JSON format');
        }
      } catch {
        toast.error('Failed to parse JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* 1. Save Current Configuration Card */}
      <div className="bg-white dark:bg-[#0c1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
            <Save className="w-3.5 h-3.5 text-sky-500" />
            <span>Save Current Design or Sheet Layout as Preset</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 text-slate-600 dark:text-slate-300"
              title="Backup templates to a JSON file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
            <label className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 text-slate-600 dark:text-slate-300 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON</span>
              <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
          <div className="sm:col-span-6 space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Preset Name
            </label>
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="e.g. My Festive Boutique Price Tag or Standard FBA Sheet"
              className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Preset Category
            </label>
            <select
              value={templateType}
              onChange={(e) => setTemplateType(e.target.value)}
              className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
            >
              <option value="price-tag">Price Tag Design</option>
              <option value="ecommerce-label">E-Commerce Label</option>
              <option value="sheet-preset">Sheet Arrangement</option>
            </select>
          </div>

          <div className="sm:col-span-3">
            <button
              type="button"
              onClick={handleSaveCurrent}
              className="w-full btn-primary py-2 px-3 text-xs font-bold flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Preset</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Saved Templates Library List */}
      <div className="bg-white dark:bg-[#0c1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
            <FolderOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Saved Presets & Template Library ({savedTemplates.length})</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Stored safely in browser localStorage</span>
        </div>

        {savedTemplates.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <FileCode className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <div className="text-xs font-semibold">No custom templates saved yet.</div>
            <div className="text-[11px]">
              Design your tag, enter a preset name above, and click "Save Preset" to reuse anytime.
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-sky-500/50 transition-all flex flex-col justify-between gap-3 shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded uppercase font-bold bg-sky-500/10 text-sky-600 dark:text-sky-400">
                      {tmpl.type}
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {new Date(tmpl.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {editingId === tmpl.id ? (
                    <div className="flex items-center gap-1 pt-1">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="text-xs p-1 rounded border flex-1"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveRename(tmpl.id)}
                        className="p-1 rounded text-emerald-500 hover:bg-emerald-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="p-1 rounded text-slate-400"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {tmpl.name}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-white/[0.06]">
                  <button
                    type="button"
                    onClick={() => {
                      if (tmpl.designData) onLoadTemplate(tmpl.designData);
                      if (tmpl.sheetConfig) onLoadSheetConfig(tmpl.sheetConfig);
                      toast.success(`Loaded preset: ${tmpl.name}`);
                    }}
                    className="btn-primary py-1 px-3 text-xs font-bold"
                  >
                    Load Preset
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleStartRename(tmpl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Rename preset"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(tmpl)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Duplicate preset"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tmpl.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Delete preset"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
