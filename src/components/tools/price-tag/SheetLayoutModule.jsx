import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Grid,
  Printer,
  Download,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Layers,
  FileText,
  FileSpreadsheet,
  X,
  Sparkles,
  Plus,
  Minus
} from 'lucide-react';
import JsBarcode from 'jsbarcode';
import {
  PAPER_FORMATS,
  SHEET_PRESETS,
  calculateSheetArrangement,
} from '../../../utils/sheetLayoutEngine';
import { exportMultiPageSheetPdf, downloadCsv } from '../../../utils/exportUtils';
import { formatIndianCurrency } from '../../../utils/mrpTagUtils';
import { useToast } from '../../../context/ToastContext';

/**
 * Compact SVG Barcode renderer for individual sheet slots
 */
function SlotBarcode({ value, height = 16, compact = false }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (svgRef.current && value) {
      try {
        const showText = height >= 14 && !compact;
        JsBarcode(svgRef.current, String(value), {
          format: 'CODE128',
          width: compact ? 0.8 : 0.9,
          height: Math.max(6, height),
          displayValue: showText,
          fontSize: Math.max(5, Math.min(7.5, height * 0.45)),
          font: 'monospace',
          margin: 0,
          background: 'transparent',
          lineColor: '#000000',
        });
      } catch (err) {
        // Fallback silently if invalid characters
      }
    }
  }, [value, height, compact]);

  if (!value) return null;
  return <svg ref={svgRef} className="max-w-full h-auto mx-auto block" />;
}

/**
 * Rich WYSIWYG Slot Card rendered inside the sheet layout
 * Adapts typography, line wrapping, and vertical hierarchy dynamically as length & breadth decrease.
 */
function SheetLabelCard({ slot, scale, showCutGuides, textScale = 'standard' }) {
  const item = slot.item || {};
  const leftPx = slot.xMm * 3.78 * scale;
  const topPx = slot.yMm * 3.78 * scale;
  const widthPx = slot.widthMm * 3.78 * scale;
  const heightPx = slot.heightMm * 3.78 * scale;

  const w = slot.widthMm;
  const h = slot.heightMm;

  const userScaleMul = textScale === 'compact' ? 0.85 : textScale === 'large' ? 1.15 : 1.0;

  // Responsive proportional font size calculation based on physical millimeter dimensions
  const titleSizePx = Math.max(
    6.5,
    Math.min(12, (w * 0.11 + h * 0.08) * scale * userScaleMul)
  );

  const brandSizePx = Math.max(5.5, titleSizePx * 0.72);
  const variantSizePx = Math.max(5.5, titleSizePx * 0.72);
  const priceSizePx = Math.max(6.5, titleSizePx * 0.85);
  const bannerSizePx = Math.max(5.5, titleSizePx * 0.72);

  const isCompactH = h < 35;
  const isUltraCompact = h < 26 || w < 44;
  const barcodeHeight = isUltraCompact
    ? 7
    : isCompactH
    ? 10
    : Math.max(12, Math.min(22, Math.round(h * 0.26 * scale)));

  const barcodeVal = item.barcodeValue || item.barcode || item.sku || '';
  const numMrp = parseFloat(item.mrp) || 0;
  const numSelling = parseFloat(item.sellingPrice) || 0;
  const hasSelling = numSelling > 0 && numSelling < numMrp;
  const productName = item.name || item.productName || 'Product Label';

  return (
    <div
      style={{
        left: `${leftPx}px`,
        top: `${topPx}px`,
        width: `${widthPx}px`,
        height: `${heightPx}px`,
        backgroundColor: item.bg || '#ffffff',
        borderColor: item.borderColor || (showCutGuides ? '#94a3b8' : '#e2e8f0'),
        borderStyle: showCutGuides ? 'dashed' : (item.borderStyle || 'solid'),
        borderWidth: showCutGuides ? '1px' : '1px',
        borderRadius: `${Math.max(2, (item.cornerRadius || 4) * (scale * 0.5))}px`,
        fontFamily: item.fontFamily || 'system-ui, -apple-system, sans-serif',
      }}
      className={`absolute flex flex-col justify-between text-left overflow-hidden select-none box-border shadow-2xs ${
        isUltraCompact ? 'p-1' : 'p-1.5'
      }`}
    >
      {/* Top Banner if configured */}
      {(item.headerBg || item.badgeText || item.headerTitle) && (
        <div
          style={{
            backgroundColor: item.headerBg || '#0f172a',
            color: item.headerTextColor || (item.headerText?.startsWith('#') ? item.headerText : '#ffffff'),
            fontSize: `${bannerSizePx}px`,
            lineHeight: 1,
          }}
          className="font-bold text-center py-0.5 px-1 uppercase tracking-wider font-mono truncate rounded-xs -mx-0.5 -mt-0.5 mb-0.5"
        >
          {item.headerTitle || item.badgeText || 'MAXIMUM RETAIL PRICE'}
        </div>
      )}

      {/* Product Details - Auto-allocated with multi-line wrap (NO truncation ellipsis) */}
      <div className="flex-1 min-h-0 flex flex-col justify-center overflow-hidden my-0.5 leading-tight">
        {item.brand && !isUltraCompact && (
          <div
            style={{ fontSize: `${brandSizePx}px`, lineHeight: 1.1 }}
            className="font-bold uppercase tracking-wider text-slate-500 truncate mb-0.5"
          >
            {item.brand}
          </div>
        )}
        <div
          style={{
            fontSize: `${titleSizePx}px`,
            lineHeight: 1.15,
            wordBreak: 'break-word',
          }}
          className="font-bold text-slate-900 break-words line-clamp-2 overflow-hidden"
          title={productName}
        >
          {productName}
        </div>
        {(item.variant || item.packSize) && !isCompactH && (
          <div
            style={{ fontSize: `${variantSizePx}px`, lineHeight: 1.1 }}
            className="text-slate-500 truncate mt-0.5 font-medium"
          >
            {[item.variant, item.packSize].filter(Boolean).join(' • ')}
          </div>
        )}
      </div>

      {/* Barcode SVG */}
      {barcodeVal && (
        <div className="overflow-hidden flex justify-center py-0.5 shrink-0">
          <SlotBarcode value={barcodeVal} height={barcodeHeight} compact={isUltraCompact} />
        </div>
      )}

      {/* Pricing Footer */}
      <div
        style={{ fontSize: `${priceSizePx}px`, lineHeight: 1 }}
        className="flex items-baseline justify-between font-mono font-bold pt-0.5 border-t border-slate-100 shrink-0"
      >
        <span className="text-slate-900 font-black">
          MRP: {formatIndianCurrency(numMrp)}
        </span>
        {hasSelling && (
          <span className="text-emerald-700 font-extrabold">
            ₹{numSelling}
          </span>
        )}
      </div>
    </div>
  );
}

export function SheetLayoutModule({
  sheetConfig,
  setSheetConfig,
  itemsToPrint = [],
  fallbackItem = null,
}) {
  const toast = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(80); // percentage
  const [textScale, setTextScale] = useState('standard'); // 'compact' | 'standard' | 'large'
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const printableSheetRef = useRef(null);

  const {
    paperFormatId = 'a4',
    customPaperWidthMm = 210,
    customPaperHeightMm = 297,
    orientation = 'portrait',
    selectedPresetId = 'a4-24up',
    labelWidthMm = 70,
    labelHeightMm = 36,
    cols = 3,
    rows = 8,
    marginTopMm = 4.5,
    marginBottomMm = 4.5,
    marginLeftMm = 0,
    marginRightMm = 0,
    gapXmm = 0,
    gapYmm = 0,
    showCutGuides = true,
    readingOrder = 'row-first',
    alignment = 'center',
    printQuantityMode = 'auto',
  } = sheetConfig;

  // Internal quantity mode state ('fill-sheet' | 'custom-copies' | 'from-items' | 'single')
  const [quantityMode, setQuantityMode] = useState(() => {
    if (printQuantityMode && printQuantityMode !== 'auto') return printQuantityMode;
    return itemsToPrint.length > 1 ? 'from-items' : 'fill-sheet';
  });

  const [customCopies, setCustomCopies] = useState(24);

  // Sync internal quantityMode if sheetConfig changes externally
  useEffect(() => {
    if (sheetConfig.printQuantityMode && sheetConfig.printQuantityMode !== 'auto') {
      setQuantityMode(sheetConfig.printQuantityMode);
    }
  }, [sheetConfig.printQuantityMode]);

  // Run the automatic arrangement engine
  const layout = useMemo(() => {
    return calculateSheetArrangement({
      paperFormatId,
      customPaperWidthMm,
      customPaperHeightMm,
      orientation,
      labelWidthMm,
      labelHeightMm,
      cols: parseInt(cols, 10) || null,
      rows: parseInt(rows, 10) || null,
      marginTopMm: parseFloat(marginTopMm) || 0,
      marginBottomMm: parseFloat(marginBottomMm) || 0,
      marginLeftMm: parseFloat(marginLeftMm) || 0,
      marginRightMm: parseFloat(marginRightMm) || 0,
      gapXmm: parseFloat(gapXmm) || 0,
      gapYmm: parseFloat(gapYmm) || 0,
      items: itemsToPrint.length > 0 ? itemsToPrint : null,
      repeatItem: itemsToPrint.length === 0 ? fallbackItem : null,
      printQuantityMode: quantityMode,
      customCopies: parseInt(customCopies, 10) || 24,
      alignment,
      readingOrder,
      showCutGuides,
    });
  }, [
    paperFormatId,
    customPaperWidthMm,
    customPaperHeightMm,
    orientation,
    labelWidthMm,
    labelHeightMm,
    cols,
    rows,
    marginTopMm,
    marginBottomMm,
    marginLeftMm,
    marginRightMm,
    gapXmm,
    gapYmm,
    itemsToPrint,
    fallbackItem,
    quantityMode,
    customCopies,
    alignment,
    readingOrder,
    showCutGuides,
  ]);

  // Adjust current page if totalPages shrinks
  const totalPages = layout.totalPages || 1;
  const activePageIndex = Math.min(Math.max(1, currentPage), totalPages);
  const activePageData = layout.pages[activePageIndex - 1] || layout.pages[0];

  // Auto-fit Columns & Rows button handler
  const handleAutoFitGrid = () => {
    setSheetConfig((prev) => ({
      ...prev,
      cols: layout.maxFittingCols,
      rows: layout.maxFittingRows,
      selectedPresetId: 'custom-grid',
    }));
    toast.success(`Grid auto-fitted to sheet: ${layout.maxFittingCols} cols × ${layout.maxFittingRows} rows`);
  };

  // Label Dimension change handler (auto recalculates fitting cols and rows)
  const handleLabelDimensionChange = (dimension, value) => {
    const num = Math.max(5, parseFloat(value) || 10);
    setSheetConfig((prev) => {
      const nextW = dimension === 'width' ? num : prev.labelWidthMm;
      const nextH = dimension === 'height' ? num : prev.labelHeightMm;

      const paperW = prev.orientation === 'landscape' ? 297 : 210;
      const paperH = prev.orientation === 'landscape' ? 210 : 297;
      const usableW = Math.max(10, paperW - (prev.marginLeftMm || 0) - (prev.marginRightMm || 0));
      const usableH = Math.max(10, paperH - (prev.marginTopMm || 0) - (prev.marginBottomMm || 0));

      const fitCols = Math.max(1, Math.floor((usableW + (prev.gapXmm || 0)) / (nextW + (prev.gapXmm || 0))));
      const fitRows = Math.max(1, Math.floor((usableH + (prev.gapYmm || 0)) / (nextH + (prev.gapYmm || 0))));

      return {
        ...prev,
        [dimension === 'width' ? 'labelWidthMm' : 'labelHeightMm']: num,
        cols: fitCols,
        rows: fitRows,
        selectedPresetId: 'custom-grid',
      };
    });
  };

  // Preset selector handler
  const handleSelectPreset = (presetId) => {
    const preset = SHEET_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;

    setSheetConfig((prev) => ({
      ...prev,
      selectedPresetId: preset.id,
      paperFormatId: preset.paperFormat,
      labelWidthMm: preset.labelWidthMm,
      labelHeightMm: preset.labelHeightMm,
      cols: preset.cols,
      rows: preset.rows,
      marginTopMm: preset.marginTopMm,
      marginBottomMm: preset.marginBottomMm,
      marginLeftMm: preset.marginLeftMm,
      marginRightMm: preset.marginRightMm,
      gapXmm: preset.gapXmm,
      gapYmm: preset.gapYmm,
    }));
    toast.success(`Loaded preset: ${preset.name}`);
  };

  // Direct Browser Printing (Module 4.A) - Dedicated exact physical mm print iframe
  const handlePrint = () => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow.document;
      doc.open();

      let pagesHtml = '';
      layout.pages.forEach((page) => {
        let labelsHtml = '';
        page.labels.forEach((slot) => {
          const item = slot.item || {};
          const bValue = item.barcodeValue || item.barcode || item.sku || '';
          const w = slot.widthMm;
          const h = slot.heightMm;
          const userScaleMul = textScale === 'compact' ? 0.85 : textScale === 'large' ? 1.15 : 1.0;
          const titlePt = Math.max(5.5, Math.min(9.5, (w * 0.08 + h * 0.06) * userScaleMul));
          const subPt = Math.max(4.5, titlePt * 0.72);
          const pricePt = Math.max(5.5, titlePt * 0.85);
          const isCompact = h < 34 || w < 44;
          const isUltraCompact = h < 26 || w < 38;

          labelsHtml += `
            <div style="position: absolute; left: ${slot.xMm}mm; top: ${slot.yMm}mm; width: ${slot.widthMm}mm; height: ${slot.heightMm}mm; box-sizing: border-box; overflow: hidden; background: ${item.bg || '#ffffff'}; border: ${showCutGuides ? '0.25mm dashed #94a3b8' : '0.25mm solid #cbd5e1'}; border-radius: 1mm; padding: ${isUltraCompact ? '1mm' : '1.5mm'}; display: flex; flex-direction: column; justify-content: space-between; font-family: ${item.fontFamily || 'system-ui, -apple-system, sans-serif'};">
              ${(item.headerBg || item.badgeText || item.headerTitle) ? `
                <div style="background: ${item.headerBg || '#0f172a'}; color: ${item.headerTextColor || (item.headerText?.startsWith('#') ? item.headerText : '#ffffff')}; font-size: ${subPt}pt; font-weight: bold; text-align: center; padding: 0.4mm 0.6mm; text-transform: uppercase; border-radius: 0.5mm; margin-bottom: 0.5mm; line-height: 1;">
                  ${item.headerTitle || item.badgeText || 'MAXIMUM RETAIL PRICE'}
                </div>
              ` : ''}
              <div style="flex: 1; min-height: 0; display: flex; flex-direction: column; justify-content: center; overflow: hidden;">
                ${(item.brand && !isUltraCompact) ? `<div style="font-size: ${subPt}pt; color: #64748b; font-weight: bold; text-transform: uppercase; line-height: 1; margin-bottom: 0.3mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.brand}</div>` : ''}
                <div style="font-size: ${titlePt}pt; font-weight: bold; color: #0f172a; line-height: 1.15; word-break: break-word; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.name || item.productName || 'Product Name'}</div>
                ${((item.variant || item.packSize) && !isCompact) ? `<div style="font-size: ${subPt}pt; color: #64748b; line-height: 1; margin-top: 0.3mm; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${[item.variant, item.packSize].filter(Boolean).join(' • ')}</div>` : ''}
              </div>
              <div style="text-align: center; margin: 0.3mm 0;">
                ${bValue ? `<div style="font-family: monospace; font-size: ${Math.max(5, subPt)}pt; font-weight: bold; letter-spacing: 0.5px;">${bValue}</div>` : ''}
              </div>
              <div style="display: flex; justify-content: space-between; align-items: baseline; border-top: 0.25mm solid #e2e8f0; padding-top: 0.4mm;">
                <span style="font-size: ${pricePt}pt; font-weight: 900; color: #0f172a;">MRP: ₹${item.mrp || 0}</span>
                ${item.sellingPrice ? `<span style="font-size: ${pricePt * 0.9}pt; font-weight: bold; color: #059669;">Offer: ₹${item.sellingPrice}</span>` : ''}
              </div>
            </div>
          `;
        });

        pagesHtml += `
          <div style="width: ${layout.paperWidthMm}mm; height: ${layout.paperHeightMm}mm; position: relative; page-break-after: always; overflow: hidden; background: #ffffff;">
            ${labelsHtml}
          </div>
        `;
      });

      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QuickFormat Hub - Sheet Print (${layout.totalLabels} Labels)</title>
            <style>
              @page {
                size: ${layout.paperWidthMm}mm ${layout.paperHeightMm}mm ${orientation};
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                background: #ffffff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            </style>
          </head>
          <body>
            ${pagesHtml}
          </body>
        </html>
      `);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 3000);
      }, 500);
    } catch (err) {
      console.error(err);
      window.print();
    }
  };

  // Download PDF Multi-Page (Module 4.B)
  const handleDownloadPdf = () => {
    try {
      exportMultiPageSheetPdf({
        pages: layout.pages,
        paperWidthMm: layout.paperWidthMm,
        paperHeightMm: layout.paperHeightMm,
        orientation,
        showCutGuides,
        filename: `label-sheet-${paperFormatId}-${layout.totalLabels}labels.pdf`,
      });
      toast.success(`Exported ${layout.totalPages}-page label sheet PDF!`);
    } catch (err) {
      toast.error(err.message || 'Failed to export PDF');
    }
  };

  // Export CSV of arranged items
  const handleExportCsv = () => {
    const allLabels = layout.pages.flatMap((p) => p.labels);
    const rows = [
      'Page,Slot,X_mm,Y_mm,Product Name,SKU,Barcode,MRP,Selling Price,Quantity',
      ...allLabels.map((l) => {
        const item = l.item || {};
        return `${l.pageNumber},${l.slotIndex + 1},${l.xMm.toFixed(1)},${l.yMm.toFixed(1)},"${item.name || item.productName || ''}","${item.sku || ''}","${item.barcodeValue || item.barcode || ''}",${item.mrp || 0},${item.sellingPrice || ''},${item.quantity || 1}`;
      }),
    ].join('\n');
    downloadCsv(rows, `sheet-labels-${layout.totalLabels}.csv`);
    toast.success('Downloaded CSV manifest');
  };

  return (
    <div className="space-y-4">
      {/* 1. Sheet Presets Bar */}
      <div className="bg-white dark:bg-[#0c1220] p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Commercial Label Sheet Presets</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Avery® 5160, A4 24-Up, A4 21-Up & Rolls
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {SHEET_PRESETS.map((p) => {
            const isSelected = selectedPresetId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`p-2 rounded-xl border text-left flex flex-col justify-between gap-1 transition-all group cursor-pointer ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/15 ring-1 ring-sky-500 text-sky-900 dark:text-sky-200'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-[11px] font-bold leading-tight line-clamp-2">
                  {p.name.split('(')[0].trim()}
                </div>
                <div className="text-[9px] font-mono text-slate-400">
                  {p.cols}×{p.rows} ({p.cols * p.rows}/sheet)
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Two-Column Layout: Controls (4 Cols) & Multi-Page WYSIWYG (8 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Settings Panel (4 Columns) */}
        <div className="lg:col-span-4 space-y-3.5">
          {/* Card A1: Print Quantity & Sheet Fill Mode */}
          <div className="bg-white dark:bg-[#0c1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                Print Quantity & Fill
              </span>
              <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400 font-bold bg-sky-500/10 px-2 py-0.5 rounded">
                {layout.totalLabels} {layout.totalLabels === 1 ? 'Label' : 'Labels'} Total
              </span>
            </div>

            {/* Mode Selector Buttons */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setQuantityMode('fill-sheet')}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  quantityMode === 'fill-sheet'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/15 ring-1 ring-sky-500 text-sky-900 dark:text-sky-200'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-black/20'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-1">
                  📄 Fill Full Sheet
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {layout.capacityPerPage} labels/sheet
                </span>
              </button>

              <button
                type="button"
                onClick={() => setQuantityMode('custom-copies')}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  quantityMode === 'custom-copies'
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/15 ring-1 ring-sky-500 text-sky-900 dark:text-sky-200'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-black/20'
                }`}
              >
                <span className="text-xs font-bold flex items-center gap-1">
                  🔢 Custom Copies
                </span>
                <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Enter exact count
                </span>
              </button>
            </div>

            {/* If Custom Copies selected */}
            {quantityMode === 'custom-copies' && (
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Copies to Print:</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setCustomCopies((c) => Math.max(1, c - 1))}
                      className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold hover:bg-slate-100 cursor-pointer flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={customCopies}
                      onChange={(e) => setCustomCopies(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="w-16 text-center text-xs p-1 rounded border border-slate-200 dark:border-slate-700 font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setCustomCopies((c) => c + 1)}
                      className="w-6 h-6 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold hover:bg-slate-100 cursor-pointer flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center gap-1 pt-1">
                  {[layout.capacityPerPage, layout.capacityPerPage * 2, 50, 100].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setCustomCopies(num)}
                      className="flex-1 py-1 text-[10px] rounded-lg border border-slate-200 dark:border-slate-700 font-mono hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* If Bulk Items Available */}
            {itemsToPrint.length > 1 && (
              <button
                type="button"
                onClick={() => setQuantityMode('from-items')}
                className={`w-full p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between cursor-pointer transition-all ${
                  quantityMode === 'from-items'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/15 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-500'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:border-slate-300'
                }`}
              >
                <span>📋 Use Quantities from Table ({itemsToPrint.length} products)</span>
                <span className="font-mono text-[10px] bg-emerald-500/20 text-emerald-600 px-1.5 py-0.5 rounded font-bold">
                  {itemsToPrint.reduce((acc, p) => acc + (parseInt(p.quantity, 10) || 1), 0)} Labels
                </span>
              </button>
            )}

            {/* Single Tag option */}
            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setQuantityMode('single')}
                className={`text-[10px] font-mono hover:underline cursor-pointer ${
                  quantityMode === 'single' ? 'text-sky-600 font-bold underline' : 'text-slate-400'
                }`}
              >
                Print 1 single label only
              </button>
            </div>
          </div>

          {/* Card A2: Page & Paper Configuration */}
          <div className="bg-white dark:bg-[#0c1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <Sliders className="w-3.5 h-3.5 text-sky-500" />
              Paper & Grid Geometry
            </span>

            {/* Paper Format & Orientation */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Paper Size</label>
                <select
                  value={paperFormatId}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    const fmt = PAPER_FORMATS.find((f) => f.id === nextId);
                    setSheetConfig((p) => ({
                      ...p,
                      paperFormatId: nextId,
                      selectedPresetId: 'custom-grid',
                      cols: fmt ? Math.max(1, Math.floor(fmt.widthMm / (p.labelWidthMm || 70))) : p.cols,
                      rows: fmt ? Math.max(1, Math.floor(fmt.heightMm / (p.labelHeightMm || 36))) : p.rows,
                    }));
                  }}
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                >
                  {PAPER_FORMATS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Orientation</label>
                <select
                  value={orientation}
                  onChange={(e) => setSheetConfig((p) => ({ ...p, orientation: e.target.value, selectedPresetId: 'custom-grid' }))}
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/30"
                >
                  <option value="portrait">Portrait</option>
                  <option value="landscape">Landscape</option>
                </select>
              </div>
            </div>

            {/* Label Dimensions */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Label Width (mm)</label>
                <input
                  type="number"
                  min="5"
                  value={labelWidthMm}
                  onChange={(e) => handleLabelDimensionChange('width', e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border font-mono border-slate-200 dark:border-slate-700 bg-white dark:bg-black/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Label Height (mm)</label>
                <input
                  type="number"
                  min="5"
                  value={labelHeightMm}
                  onChange={(e) => handleLabelDimensionChange('height', e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border font-mono border-slate-200 dark:border-slate-700 bg-white dark:bg-black/20"
                />
              </div>
            </div>

            {/* Text Fit & Density Selector */}
            <div className="pt-0.5">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-bold text-slate-500 block">Text Fit & Density</label>
                <span className="text-[9px] text-slate-400 font-mono">Auto-wraps names</span>
              </div>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-black/30 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setTextScale('compact')}
                  className={`text-[10px] py-1 font-semibold rounded transition-all cursor-pointer ${
                    textScale === 'compact'
                      ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Compact
                </button>
                <button
                  type="button"
                  onClick={() => setTextScale('standard')}
                  className={`text-[10px] py-1 font-semibold rounded transition-all cursor-pointer ${
                    textScale === 'standard'
                      ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => setTextScale('large')}
                  className={`text-[10px] py-1 font-semibold rounded transition-all cursor-pointer ${
                    textScale === 'large'
                      ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Large
                </button>
              </div>
            </div>

            {/* Grid Columns & Rows with Auto-Fit Trigger */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase font-mono">
                  Grid Capacity (Slots)
                </label>
                <button
                  type="button"
                  onClick={handleAutoFitGrid}
                  className="text-[10px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 hover:underline cursor-pointer bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-500/20"
                  title="Auto-calculate maximum fitting columns and rows for this sheet"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Auto-Fit ({layout.maxFittingCols}×{layout.maxFittingRows})</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
                    <span>Columns (Cols)</span>
                    <span className="font-mono">Max: {layout.maxFittingCols}</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={cols}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSheetConfig((p) => ({
                        ...p,
                        cols: val === '' ? '' : Math.max(1, parseInt(val, 10) || 1),
                        selectedPresetId: 'custom-grid',
                      }));
                    }}
                    onBlur={() => {
                      setSheetConfig((p) => ({
                        ...p,
                        cols: Math.max(1, parseInt(p.cols, 10) || layout.maxFittingCols),
                      }));
                    }}
                    className={`w-full text-xs p-1.5 rounded-lg border font-mono font-bold ${
                      cols > layout.maxFittingCols
                        ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-500/10 text-amber-700'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
                    <span>Rows (Rows)</span>
                    <span className="font-mono">Max: {layout.maxFittingRows}</span>
                  </div>
                  <input
                    type="number"
                    min="1"
                    value={rows}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSheetConfig((p) => ({
                        ...p,
                        rows: val === '' ? '' : Math.max(1, parseInt(val, 10) || 1),
                        selectedPresetId: 'custom-grid',
                      }));
                    }}
                    onBlur={() => {
                      setSheetConfig((p) => ({
                        ...p,
                        rows: Math.max(1, parseInt(p.rows, 10) || layout.maxFittingRows),
                      }));
                    }}
                    className={`w-full text-xs p-1.5 rounded-lg border font-mono font-bold ${
                      rows > layout.maxFittingRows
                        ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-500/10 text-amber-700'
                        : 'border-slate-200 dark:border-slate-700'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Margins */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                Sheet Margins (mm)
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                <div>
                  <label className="text-[9px] text-slate-400 block">Top</label>
                  <input
                    type="number"
                    value={marginTopMm}
                    onChange={(e) => setSheetConfig((p) => ({ ...p, marginTopMm: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 }))}
                    onBlur={() => setSheetConfig((p) => ({ ...p, marginTopMm: parseFloat(p.marginTopMm) || 0 }))}
                    className="w-full text-xs p-1 rounded border font-mono border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block">Bottom</label>
                  <input
                    type="number"
                    value={marginBottomMm}
                    onChange={(e) => setSheetConfig((p) => ({ ...p, marginBottomMm: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 }))}
                    onBlur={() => setSheetConfig((p) => ({ ...p, marginBottomMm: parseFloat(p.marginBottomMm) || 0 }))}
                    className="w-full text-xs p-1 rounded border font-mono border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block">Left</label>
                  <input
                    type="number"
                    value={marginLeftMm}
                    onChange={(e) => setSheetConfig((p) => ({ ...p, marginLeftMm: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 }))}
                    onBlur={() => setSheetConfig((p) => ({ ...p, marginLeftMm: parseFloat(p.marginLeftMm) || 0 }))}
                    className="w-full text-xs p-1 rounded border font-mono border-slate-200 dark:border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 block">Right</label>
                  <input
                    type="number"
                    value={marginRightMm}
                    onChange={(e) => setSheetConfig((p) => ({ ...p, marginRightMm: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 }))}
                    onBlur={() => setSheetConfig((p) => ({ ...p, marginRightMm: parseFloat(p.marginRightMm) || 0 }))}
                    className="w-full text-xs p-1 rounded border font-mono border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Gaps between labels */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Gap X (mm)</label>
                <input
                  type="number"
                  value={gapXmm}
                  onChange={(e) => setSheetConfig((p) => ({ ...p, gapXmm: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 }))}
                  onBlur={() => setSheetConfig((p) => ({ ...p, gapXmm: parseFloat(p.gapXmm) || 0 }))}
                  className="w-full text-xs p-1.5 rounded-lg border font-mono border-slate-200 dark:border-slate-700"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Gap Y (mm)</label>
                <input
                  type="number"
                  value={gapYmm}
                  onChange={(e) => setSheetConfig((p) => ({ ...p, gapYmm: e.target.value === '' ? '' : parseFloat(e.target.value) || 0 }))}
                  onBlur={() => setSheetConfig((p) => ({ ...p, gapYmm: parseFloat(p.gapYmm) || 0 }))}
                  className="w-full text-xs p-1.5 rounded-lg border font-mono border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>

            {/* Cut Lines & Calibration Guide Trigger */}
            <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCutGuides}
                  onChange={(e) => setSheetConfig((p) => ({ ...p, showCutGuides: e.target.checked }))}
                  className="rounded text-sky-500"
                />
                <span>Show Cut Guides</span>
              </label>

              <button
                type="button"
                onClick={() => setIsCalibrationOpen(true)}
                className="text-[11px] font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Print Calibration Guide</span>
              </button>
            </div>
          </div>

          {/* Card B: Layout Yield Summary & Action Buttons */}
          <div className="bg-white dark:bg-[#0c1220] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase font-mono">
                Print Yield & Metrics
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold">
                {layout.capacityPerPage} labels/sheet
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Total Labels</div>
                <div className="text-base font-black text-slate-900 dark:text-white font-mono">
                  {layout.totalLabels}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Total Pages</div>
                <div className="text-base font-black text-sky-600 dark:text-sky-400 font-mono">
                  {layout.totalPages}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-400 font-mono">Per Sheet</div>
                <div className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                  {layout.capacityPerPage}
                </div>
              </div>
            </div>

            {/* Interactive 1-Click Overflow Fix Box */}
            {layout.isOverflown && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 space-y-2">
                <div className="font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Grid Overflows Usable Page Area</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Configured {cols} cols × {rows} rows exceeds printable sheet width/height. Labels will clip or spill.
                </p>
                <button
                  type="button"
                  onClick={handleAutoFitGrid}
                  className="w-full btn-primary py-1.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Fix Now: Auto-Fit to Sheet ({layout.maxFittingCols} cols × {layout.maxFittingRows} rows)</span>
                </button>
              </div>
            )}

            {/* Output Actions */}
            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full btn-primary py-2.5 px-4 text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-sky-500/20 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Labels ({layout.totalPages} {layout.totalPages === 1 ? 'Sheet' : 'Sheets'})</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-sky-500" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="btn-secondary py-2 px-3 text-xs flex items-center justify-center gap-1.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right WYSIWYG Sheet Preview (8 Columns) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Sheet Viewer Controls */}
          <div className="bg-white dark:bg-[#0c1220] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            {/* Page Navigation */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={activePageIndex <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-bold font-mono px-2 py-1 rounded-lg bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-slate-800">
                Sheet Page {activePageIndex} of {totalPages}
              </span>

              <button
                type="button"
                disabled={activePageIndex >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Sheet Dimensions badge */}
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
              {layout.paperWidthMm}mm × {layout.paperHeightMm}mm ({activePageData?.labels.length || 0} labels on this sheet)
            </div>

            {/* Zoom Slider */}
            <div className="flex items-center gap-2">
              <ZoomOut className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="range"
                min="40"
                max="120"
                value={zoomLevel}
                onChange={(e) => setZoomLevel(parseInt(e.target.value, 10))}
                className="w-24 accent-sky-500"
              />
              <span className="text-[10px] font-mono text-slate-500 w-8">{zoomLevel}%</span>
            </div>
          </div>

          {/* Printable Sheet Viewport Canvas */}
          <div className="p-6 bg-slate-200/80 dark:bg-[#040711] rounded-2xl border border-slate-300/80 dark:border-white/[0.05] overflow-auto flex items-center justify-center min-h-[560px]">
            {/* The Physical Sheet Card */}
            <div
              ref={printableSheetRef}
              style={{
                width: `${layout.paperWidthMm * 3.78 * (zoomLevel / 100)}px`,
                height: `${layout.paperHeightMm * 3.78 * (zoomLevel / 100)}px`,
                position: 'relative',
              }}
              className="bg-white shadow-2xl border border-slate-300 text-slate-900 select-none overflow-hidden print:shadow-none print:border-none"
            >
              {/* Rich Labels Grid Placement */}
              {activePageData?.labels.map((slot) => (
                <SheetLabelCard
                  key={slot.slotIndex}
                  slot={slot}
                  scale={zoomLevel / 100}
                  showCutGuides={showCutGuides}
                  textScale={textScale}
                />
              ))}

              {/* Delineate Empty Slots on Last Page */}
              {activePageData?.emptySlots > 0 && (
                <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-slate-100/90 text-[10px] font-mono text-slate-500 border border-slate-200 shadow-xs">
                  {activePageData.emptySlots} Unused Slots on Final Sheet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Print Calibration Guide Modal (Module 4.A) */}
      {isCalibrationOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#0c1220] w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-sky-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Printer Calibration & Alignment Guide
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCalibrationOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>Important Browser Print Setting</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  In your browser print dialog, always set <strong>Scale: 100% (or "Actual Size")</strong> and <strong>Margins: None (or "Default")</strong>. Setting "Fit to Printable Area" will shrink the barcodes and cause alignment shift across die-cut stickers.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white">Recommended Checklist:</h4>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>
                    <strong>Test Sheet First:</strong> Print page 1 onto plain A4 paper and hold it up against your sticker sheet to verify grid alignment before using expensive sticker paper.
                  </li>
                  <li>
                    <strong>Hardware Dead-Zones:</strong> Desktop inkjet and laser printers typically cannot print within 3–4mm of the paper edge. Ensure margins are configured accordingly.
                  </li>
                  <li>
                    <strong>Thermal Printers:</strong> Select "Continuous Roll (1x1)" and configure width/height matching your 4"×6" or 50×25mm thermal roll.
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/[0.08]">
              <button
                type="button"
                onClick={() => setIsCalibrationOpen(false)}
                className="btn-primary py-1.5 px-4 text-xs font-bold cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
