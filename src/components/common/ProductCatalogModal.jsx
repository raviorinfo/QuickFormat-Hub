import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Upload,
  Download,
  Edit2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Barcode,
  ExternalLink,
  RefreshCw,
  X,
  FileSpreadsheet
} from 'lucide-react';
import {
  getProductCatalog,
  saveProduct,
  deleteProduct,
  checkSkuDuplicate,
  importProductsFromCsv,
  exportProductsToCsv,
  generateCatalogSampleCsv,
} from '../../utils/productCatalogUtils';
import { validateRetailGtin, calculateEan13CheckDigit } from '../../utils/barcodeUtils';

export default function ProductCatalogModal({
  isOpen,
  onClose,
  onSelectProduct,
  title = 'Product Catalog & SKU Hub',
}) {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [skuError, setSkuError] = useState('');
  const [gtinStatus, setGtinStatus] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importCsvText, setImportCsvText] = useState('');
  const [importStatus, setImportStatus] = useState(null);

  const refreshList = () => {
    setProducts(getProductCatalog());
  };

  useEffect(() => {
    if (isOpen) {
      refreshList();
      setIsEditing(false);
      setShowImport(false);
      setImportStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category || 'General')))];

  const filteredProducts = products.filter((p) => {
    const matchesCat = selectedCategory === 'all' || (p.category || 'General') === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.sku && p.sku.toLowerCase().includes(q)) ||
      (p.gtin && p.gtin.includes(q)) ||
      (p.brand && p.brand.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleStartAdd = () => {
    setEditFormData({
      id: '',
      name: '',
      sku: `SKU-${Date.now().toString().slice(-4)}`,
      gtin: '8901030' + Math.floor(10000 + Math.random() * 90000),
      category: 'Electronics',
      brand: 'My Brand',
      sellingPrice: 999,
      mrp: 1499,
      currency: 'INR',
      description: '',
      url: 'https://quickformat.com/product',
    });
    setSkuError('');
    setGtinStatus(null);
    setIsEditing(true);
  };

  const handleStartEdit = (product) => {
    setEditFormData({ ...product });
    setSkuError('');
    setGtinStatus(null);
    setIsEditing(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!editFormData.name.trim()) {
      alert('Product Name is required.');
      return;
    }
    if (!editFormData.sku.trim()) {
      setSkuError('Internal SKU is mandatory.');
      return;
    }
    if (checkSkuDuplicate(editFormData.sku, editFormData.id)) {
      setSkuError(`SKU '${editFormData.sku}' is already registered.`);
      return;
    }

    try {
      saveProduct(editFormData);
      refreshList();
      setIsEditing(false);
      setEditFormData(null);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete product "${name}" from catalog?`)) {
      deleteProduct(id);
      refreshList();
    }
  };

  const handleExportCsv = () => {
    const csv = exportProductsToCsv(products);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `product_catalog_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportCsv = () => {
    if (!importCsvText.trim()) return;
    const res = importProductsFromCsv(importCsvText);
    setImportStatus(res);
    if (res.success) {
      refreshList();
      setImportCsvText('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{title}</h3>
                <span className="px-2 py-0.5 text-xs font-semibold text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-full">
                  {products.length} Products
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Centralized SKU inventory. 1-click populate across Barcode, Price Tag, QR, and Thank You Card.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button
              onClick={() => setShowImport(!showImport)}
              className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" /> Import CSV
            </button>
            <button
              onClick={handleStartAdd}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Import Banner Modal/Drawer */}
        {showImport && (
          <div className="p-4 bg-slate-950 border-b border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Bulk Import Products (CSV or Tab-Delimited)
              </span>
              <button
                type="button"
                onClick={() => setImportCsvText(generateCatalogSampleCsv())}
                className="text-xs text-blue-400 hover:underline"
              >
                Load Sample CSV Template
              </button>
            </div>
            <textarea
              rows={3}
              value={importCsvText}
              onChange={(e) => setImportCsvText(e.target.value)}
              placeholder="Paste comma or tab-delimited text from Excel / Google Sheets..."
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 text-xs font-mono focus:outline-none focus:border-blue-500"
            />
            {importStatus && (
              <div
                className={`text-xs p-2.5 rounded-lg ${
                  importStatus.success
                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                }`}
              >
                {importStatus.success ? (
                  <span>
                    Successfully imported {importStatus.importedCount} product(s)!
                    {importStatus.skippedCount > 0 && ` (${importStatus.skippedCount} duplicate/invalid skipped)`}
                  </span>
                ) : (
                  <span>{importStatus.error}</span>
                )}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowImport(false)}
                className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
              <button
                onClick={handleImportCsv}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
              >
                Parse & Import Records
              </button>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="px-6 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, SKU, GTIN or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Package className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-sm font-medium">No products found matching your filter.</p>
              <button onClick={handleStartAdd} className="text-xs text-blue-400 hover:underline">
                Add a new product
              </button>
            </div>
          ) : (
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/60 text-slate-400 uppercase tracking-wider text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Product Name & Category</th>
                    <th className="px-4 py-3">Internal SKU</th>
                    <th className="px-4 py-3">Retail GTIN / Barcode</th>
                    <th className="px-4 py-3">Pricing (Selling / MRP)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-200">{p.name}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-300 font-medium">
                            {p.category}
                          </span>
                          <span>•</span>
                          <span>{p.brand}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                          {p.sku}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">
                        {p.gtin ? (
                          <span className="flex items-center gap-1.5">
                            <Barcode className="w-3.5 h-3.5 text-slate-400" />
                            {p.gtin}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-emerald-400">
                          {p.currency === 'INR' ? '₹' : '$'}
                          {p.sellingPrice}
                        </div>
                        {p.mrp > p.sellingPrice && (
                          <div className="text-[11px] text-slate-400 line-through">
                            {p.currency === 'INR' ? '₹' : '$'}
                            {p.mrp}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {onSelectProduct && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectProduct(p);
                                onClose();
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs shadow-sm transition-colors"
                            >
                              Select & Apply
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(p)}
                            title="Edit Product"
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(p.id, p.name)}
                            title="Delete Product"
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Submodal Drawer */}
        {isEditing && editFormData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85">
            <div className="w-full max-w-xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h4 className="text-base font-bold text-white">
                  {editFormData.id ? 'Edit Product Record' : 'Create New Product Record'}
                </h4>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Internal SKU *</label>
                    <input
                      type="text"
                      required
                      value={editFormData.sku}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setEditFormData({ ...editFormData, sku: val });
                        if (checkSkuDuplicate(val, editFormData.id)) {
                          setSkuError(`SKU '${val}' is already registered.`);
                        } else {
                          setSkuError('');
                        }
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    />
                    {skuError && <span className="text-[11px] text-rose-400 block mt-1">{skuError}</span>}
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Retail GTIN / Barcode (EAN-13)</label>
                    <input
                      type="text"
                      value={editFormData.gtin}
                      onChange={(e) => setEditFormData({ ...editFormData, gtin: e.target.value })}
                      placeholder="e.g. 8901030365737"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Category</label>
                    <input
                      type="text"
                      value={editFormData.category}
                      onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Brand Name</label>
                    <input
                      type="text"
                      value={editFormData.brand}
                      onChange={(e) => setEditFormData({ ...editFormData, brand: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-400 block mb-1">Selling Price</label>
                    <input
                      type="number"
                      value={editFormData.sellingPrice}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, sellingPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">MRP</label>
                    <input
                      type="number"
                      value={editFormData.mrp}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, mrp: parseFloat(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">Currency</label>
                    <select
                      value={editFormData.currency}
                      onChange={(e) => setEditFormData({ ...editFormData, currency: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Product Page URL</label>
                  <input
                    type="text"
                    value={editFormData.url}
                    onChange={(e) => setEditFormData({ ...editFormData, url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm"
                  >
                    Save Product Record
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Catalog is stored in 100% private browser storage. No server transmission.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close Catalog
          </button>
        </div>
      </div>
    </div>
  );
}
