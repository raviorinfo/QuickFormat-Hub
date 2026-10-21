import React, { useState, useEffect } from 'react';
import {
  X,
  FolderOpen,
  Search,
  Copy,
  Trash2,
  Edit2,
  Calendar,
  ExternalLink,
  Barcode,
  Tag,
  QrCode,
  HeartHandshake,
  Check,
} from 'lucide-react';
import {
  getSavedDesigns,
  deleteDesign,
  duplicateDesign,
  renameDesign,
} from '../../utils/savedDesignsUtils';

const TOOL_CONFIG = {
  barcode: { label: 'Barcode', icon: Barcode, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  'price-tag': { label: 'Price Tag', icon: Tag, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  'qr-code': { label: 'QR Code', icon: QrCode, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  'thank-you-card': { label: 'Thank You Card', icon: HeartHandshake, color: 'text-pink-400 bg-pink-500/10 border-pink-500/20' },
};

export default function SavedDesignsModal({
  isOpen,
  onClose,
  currentTool = null,
  onLoadDesign,
}) {
  const [designs, setDesigns] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState(currentTool || 'all');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');

  const refreshDesigns = () => {
    setDesigns(getSavedDesigns());
  };

  useEffect(() => {
    if (isOpen) {
      refreshDesigns();
      setActiveFilter(currentTool || 'all');
      setSearchQuery('');
    }
  }, [isOpen, currentTool]);

  useEffect(() => {
    const handleUpdate = () => refreshDesigns();
    window.addEventListener('qfh:saved-designs-updated', handleUpdate);
    return () => window.removeEventListener('qfh:saved-designs-updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const filteredDesigns = designs.filter((d) => {
    const matchesTool = activeFilter === 'all' || d.tool === activeFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.tool.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTool && matchesSearch;
  });

  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteDesign(id);
      refreshDesigns();
    }
  };

  const handleDuplicate = (id) => {
    duplicateDesign(id);
    refreshDesigns();
  };

  const startRename = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const saveRename = (id) => {
    if (editName.trim()) {
      renameDesign(id, editName.trim());
      refreshDesigns();
    }
    setEditingId(null);
  };

  const handleSelect = (design) => {
    if (onLoadDesign) {
      onLoadDesign(design);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-designs-title"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 text-indigo-400 border border-indigo-500/30">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 id="saved-designs-title" className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Saved Projects & Designs
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {filteredDesigns.length} Project{filteredDesigns.length === 1 ? '' : 's'}
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Reopen, duplicate, manage, or export your saved label layouts and graphics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3">
          {/* Tool Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Tools' },
              { id: 'barcode', label: 'Barcodes' },
              { id: 'price-tag', label: 'Price Tags' },
              { id: 'qr-code', label: 'QR Codes' },
              { id: 'thank-you-card', label: 'Cards' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  activeFilter === f.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by project name..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredDesigns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-4">
                <FolderOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-1">No Saved Designs Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mb-4">
                {searchQuery
                  ? 'No projects match your search keywords.'
                  : 'You have not saved any designs in this section yet. Click "Save Design" in any tool to save your work.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDesigns.map((design) => {
                const conf = TOOL_CONFIG[design.tool] || {
                  label: design.tool,
                  icon: Tag,
                  color: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
                };
                const IconComponent = conf.icon;
                const dateStr = new Date(design.updatedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });

                return (
                  <div
                    key={design.id}
                    className="group relative flex flex-col justify-between bg-slate-800/40 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5"
                  >
                    <div>
                      {/* Top Bar: Tool Tag & Actions */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${conf.color}`}
                        >
                          <IconComponent className="w-3 h-3" />
                          {conf.label}
                        </span>

                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleDuplicate(design.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                            title="Duplicate Project"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => startRename(design.id, design.name)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                            title="Rename"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(design.id, design.name)}
                            className="p-1 rounded text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Design Name (Editable or Display) */}
                      {editingId === design.id ? (
                        <div className="flex items-center gap-1.5 mb-2">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveRename(design.id)}
                            className="flex-1 px-2 py-1 text-xs bg-slate-950 border border-indigo-500 rounded text-slate-100 focus:outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => saveRename(design.id)}
                            className="p-1 rounded bg-indigo-600 text-white"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <h4 className="text-sm font-semibold text-slate-100 line-clamp-1 mb-1">
                          {design.name}
                        </h4>
                      )}

                      {/* Preview Thumbnail if available */}
                      {design.previewDataUrl ? (
                        <div className="w-full h-28 my-2 rounded-lg bg-slate-950 border border-slate-700/60 overflow-hidden flex items-center justify-center p-2">
                          <img
                            src={design.previewDataUrl}
                            alt={design.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-20 my-2 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-center text-slate-600 text-xs">
                          No Visual Preview
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata & Reopen Button */}
                    <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400 mt-2">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {dateStr}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleSelect(design)}
                        className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Open
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-900/90 text-xs text-slate-500">
          <span>Designs are safely stored in your local browser storage.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
