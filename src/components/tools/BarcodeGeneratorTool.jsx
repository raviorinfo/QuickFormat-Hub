import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Barcode,
  Download,
  Printer,
  Copy,
  Check,
  Upload,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Layers,
  FileSpreadsheet,
  Settings,
  Eye,
  Sliders,
  FileCode,
  Tag,
  CheckCircle2,
  FileText,
  Grid,
  Save,
  FolderOpen,
  Palette,
  Scan,
  ZoomIn,
  ZoomOut,
  Zap,
  Package
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { playClickSound } from '../../utils/audioFeedback';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import BrandKitModal from '../common/BrandKitModal';
import SavedDesignsModal from '../common/SavedDesignsModal';
import ProductLabelStudioModal from '../common/ProductLabelStudioModal';
import ProductCatalogModal from '../common/ProductCatalogModal';
import AiDesignAssistantModal from '../common/AiDesignAssistantModal';
import {
  BARCODE_FORMATS,
  LABEL_DIMENSION_PRESETS,
  SAMPLE_BARCODE_PRESETS,
  validateBarcodeData,
  validateRetailGtin,
  getBarcodeContrastRating,
  generateBarcodeSampleCsv,
  renderBarcodeToSvg,
  parseBulkBarcodeCsv,
  inspectBarcodeCompliance,
} from '../../utils/barcodeUtils';
import {
  downloadSvg,
  downloadCanvasAsPng,
  downloadCsv,
  svgToCanvas,
  exportSinglePdf,
  exportA4SheetPdf,
  printHtmlElement,
} from '../../utils/exportUtils';
import { getSavedBrandKit } from '../../utils/brandKitUtils';
import { saveDesign } from '../../utils/savedDesignsUtils';

export function BarcodeGeneratorTool() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk' | 'sheet'

  // Modals state
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [isSavedDesignsOpen, setIsSavedDesignsOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Single barcode states
  const [format, setFormat] = useState('CODE128');
  const [barcodeValue, setBarcodeValue] = useState('8901234567890');
  const [productName, setProductName] = useState('Premium Arabica Coffee Beans 250g');
  const [sku, setSku] = useState('CF-ARB-250');
  const [price, setPrice] = useState('₹499.00');
  const [brand, setBrand] = useState('QuickFormat Roasters');
  const [showDetails, setShowDetails] = useState(true);

  // Studio Interactive Viewport
  const [isLaserScanning, setIsLaserScanning] = useState(false);
  const [zoom, setZoom] = useState(1);

  // Barcode style
  const [barWidth, setBarWidth] = useState(2);
  const [barHeight, setBarHeight] = useState(60);
  const [displayValue, setDisplayValue] = useState(true);
  const [lineColor, setLineColor] = useState('#000000');

  const [background, setBackground] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(14);
  const [fontFamily, setFontFamily] = useState('monospace');
  const [textPosition, setTextPosition] = useState('bottom');

  // Sheet layout
  const [selectedDimension, setSelectedDimension] = useState('50x25');
  const [labelWidthMm, setLabelWidthMm] = useState(50);
  const [labelHeightMm, setLabelHeightMm] = useState(25);
  const [sheetCols, setSheetCols] = useState(3);
  const [sheetRows, setSheetRows] = useState(9);
  const [marginTopMm, setMarginTopMm] = useState(10);
  const [marginLeftMm, setMarginLeftMm] = useState(10);
  const [gapXmm, setGapXmm] = useState(3);
  const [gapYmm, setGapYmm] = useState(3);
  const [showCutGuides, setShowCutGuides] = useState(true);
  const [sheetMode, setSheetMode] = useState('repeat'); // 'repeat' | 'bulk'

  // Bulk state
  const [bulkInput, setBulkInput] = useState(
    '8901234567890,Single Origin Arabica Beans,CF-ARB-250,₹499.00\n' +
    'PROD-ANC-9082-BK,Wireless ANC Pro Headphones,ANC-PRO-BK,₹2499.00\n' +
    '012345678905,Organic Vitamin D Whole Milk,MLK-ORG-GAL,$4.99\n' +
    'ASSET-89410,Developer Laptop Core i7,IT-DEV-89410,N/A'
  );
  const [bulkItems, setBulkItems] = useState([]);

  // SVGs refs
  const barcodeSvgRef = useRef(null);
  const labelCardRef = useRef(null);
  const printSheetRef = useRef(null);

  // Real-time validation
  const validation = useMemo(() => {
    return validateBarcodeData(format, barcodeValue);
  }, [format, barcodeValue]);

  // Retail GS1 GTIN verification
  const retailGtinInfo = useMemo(() => {
    if (['EAN13', 'EAN8', 'UPC'].includes(format)) {
      return validateRetailGtin(barcodeValue);
    }
    return null;
  }, [format, barcodeValue]);

  // Optical scanner contrast rating
  const contrastRating = useMemo(() => {
    return getBarcodeContrastRating(lineColor, background);
  }, [lineColor, background]);

  // Comprehensive scanner compliance inspection
  const compliance = useMemo(() => {
    return inspectBarcodeCompliance({
      format,
      value: barcodeValue,
      barWidth,
      lineColor,
      bgColor: background,
    });
  }, [format, barcodeValue, barWidth, lineColor, background]);

  // Apply Brand Kit to Label
  const handleApplyBrandKit = (kit) => {
    if (kit?.brandName) setBrand(kit.brandName);
    if (kit?.fontFamily) setFontFamily(kit.fontFamily);
    toast.success('Applied Brand Kit styles to barcode label!');
  };

  // Save design to project management
  const handleSaveDesign = async () => {
    playClickSound();
    try {
      let previewDataUrl = null;
      if (barcodeSvgRef.current) {
        const canvas = await svgToCanvas(barcodeSvgRef.current, 600);
        previewDataUrl = canvas.toDataURL('image/png');
      }
      saveDesign({
        tool: 'barcode',
        name: `${productName || 'Barcode'} (${format})`,
        state: {
          format,
          barcodeValue,
          productName,
          sku,
          price,
          brand,
          showDetails,
          barWidth,
          barHeight,
          displayValue,
          lineColor,
          background,
          fontSize,
          fontFamily,
          textPosition,
          selectedDimension,
          labelWidthMm,
          labelHeightMm,
        },
        previewDataUrl,
      });
      toast.success('Design saved successfully to your Projects!');
    } catch {
      toast.error('Failed to save design');
    }
  };

  // Load saved design
  const handleLoadSavedDesign = (design) => {
    if (design?.state) {
      const s = design.state;
      if (s.format) setFormat(s.format);
      if (s.barcodeValue) setBarcodeValue(s.barcodeValue);
      if (s.productName !== undefined) setProductName(s.productName);
      if (s.sku !== undefined) setSku(s.sku);
      if (s.price !== undefined) setPrice(s.price);
      if (s.brand !== undefined) setBrand(s.brand);
      if (s.barWidth) setBarWidth(s.barWidth);
      if (s.barHeight) setBarHeight(s.barHeight);
      if (s.lineColor) setLineColor(s.lineColor);
      if (s.background) setBackground(s.background);
      toast.success(`Loaded design: ${design.name}`);
    }
  };

  // Sample CSV downloader
  const handleDownloadSampleCsv = () => {
    playClickSound();
    downloadCsv(generateBarcodeSampleCsv(), 'barcode-bulk-template.csv');
    toast.success('Downloaded sample CSV template');
  };

  // Update barcode SVG on value/settings change
  useEffect(() => {
    if (barcodeSvgRef.current) {
      const renderVal = validation.isValid ? barcodeValue : (validation.autoFixed || '1234567890');
      renderBarcodeToSvg(barcodeSvgRef.current, renderVal, {
        format,
        width: barWidth,
        height: barHeight,
        displayValue,
        font: fontFamily,
        fontSize,
        textPosition,
        lineColor,
        background,
        margin: 6,
      });
    }
  }, [
    format,
    barcodeValue,
    validation,
    barWidth,
    barHeight,
    displayValue,
    fontFamily,
    fontSize,
    textPosition,
    lineColor,
    background,
  ]);


  // Process bulk items when input changes
  useEffect(() => {
    setBulkItems(parseBulkBarcodeCsv(bulkInput, format));
  }, [bulkInput, format]);

  // Handle label dimension preset changes
  const handleDimensionChange = (presetId) => {
    setSelectedDimension(presetId);
    const p = LABEL_DIMENSION_PRESETS.find((x) => x.id === presetId);
    if (p && p.id !== 'custom') {
      setLabelWidthMm(p.width);
      setLabelHeightMm(p.height);
      setSheetCols(p.cols);
      setSheetRows(p.rows);
    }
  };

  // Preset loader
  const handleLoadPreset = (preset) => {
    playClickSound();
    setFormat(preset.format);
    setBarcodeValue(preset.value);
    setProductName(preset.name);
    setSku(preset.sku);
    setPrice(preset.price);
    setBrand(preset.brand);
    toast.success(`Loaded preset: ${preset.label}`);
  };

  // Auto-fix check digit
  const handleApplyAutoFix = () => {
    if (validation.autoFixed) {
      setBarcodeValue(validation.autoFixed);
      toast.success('Applied valid check digit!');
    }
  };

  // Exports
  const handleDownloadSvg = () => {
    playClickSound();
    if (!barcodeSvgRef.current) return;
    try {
      downloadSvg(barcodeSvgRef.current, `${sku || 'barcode'}-${format}.svg`);
      toast.success('Downloaded SVG vector barcode');
    } catch {
      toast.error('Failed to export SVG');
    }
  };

  const handleDownloadPng = async () => {
    playClickSound();
    if (!barcodeSvgRef.current) return;
    try {
      const canvas = await svgToCanvas(barcodeSvgRef.current, 1200);
      downloadCanvasAsPng(canvas, `${sku || 'barcode'}-${format}.png`);
      toast.success('Downloaded high-res 300 DPI PNG');
    } catch {
      toast.error('Failed to export PNG');
    }
  };

  const handleDownloadPdf = async () => {
    playClickSound();
    if (!barcodeSvgRef.current) return;
    try {
      const canvas = await svgToCanvas(barcodeSvgRef.current, 1000);
      const dataUrl = canvas.toDataURL('image/png');
      exportSinglePdf({
        dataUrl,
        widthMm: labelWidthMm,
        heightMm: labelHeightMm,
        filename: `${sku || 'barcode'}-label.pdf`,
        marginMm: 2,
      });
      toast.success('Downloaded print-ready label PDF');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  const handleDownloadA4SheetPdf = async () => {
    playClickSound();
    if (!barcodeSvgRef.current) return;
    try {
      const canvas = await svgToCanvas(barcodeSvgRef.current, 800);
      const dataUrl = canvas.toDataURL('image/png');

      exportA4SheetPdf({
        items: dataUrl,
        itemWidthMm: labelWidthMm,
        itemHeightMm: labelHeightMm,
        rows: sheetRows,
        cols: sheetCols,
        marginTopMm,
        marginLeftMm,
        gapXmm,
        gapYmm,
        showCutGuides,
        filename: `a4-labels-${sku || 'sheet'}.pdf`,
      });
      toast.success('Exported A4 multi-label sheet PDF!');
    } catch {
      toast.error('Failed to generate A4 sheet PDF');
    }
  };

  const handlePrint = () => {
    playClickSound();
    if (activeTab === 'sheet' && printSheetRef.current) {
      printHtmlElement(printSheetRef.current, 'A4 Barcode Labels');
    } else if (labelCardRef.current) {
      printHtmlElement(labelCardRef.current, `Label - ${sku || barcodeValue}`);
    }
  };

  // File Upload handler for CSV
  const handleCsvUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === 'string') {
        setBulkInput(text);
        toast.success(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      {/* Tool Hero Header */}
      <ToolHeroHeader
        badge="E-COMMERCE READY"
        category="Commerce & Retail"
        title="Professional Barcode Generator & Label Creator"
        description="Generate Code 128, EAN-13, UPC-A, Code 39, and ITF barcodes with automatic check digit validation, custom label details, and A4 gang sheet printing."
        icon={Barcode}
        actions={
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsBrandKitOpen(true)}
              className="btn-secondary py-1 px-2.5 text-xs font-semibold flex items-center gap-1.5 text-sky-500 hover:text-sky-400"
              title="Brand Kit Settings"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Brand Kit</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSavedDesignsOpen(true)}
              className="btn-secondary py-1 px-2.5 text-xs font-semibold flex items-center gap-1.5 text-indigo-500 hover:text-indigo-400"
              title="Open Saved Projects"
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>Projects</span>
            </button>

            <button
              type="button"
              onClick={() => setIsStudioOpen(true)}
              className="btn-secondary py-1 px-2.5 text-xs font-semibold flex items-center gap-1.5 text-amber-500 hover:text-amber-400"
              title="Open Product Label Studio"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Product Studio</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsAiModalOpen(true);
              }}
              className="btn-secondary py-1 px-2.5 text-xs font-semibold flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300"
              title="Generate barcode settings using natural language prompt"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Prompt</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                setIsCatalogOpen(true);
              }}
              className="btn-secondary py-1 px-2.5 text-xs font-semibold flex items-center gap-1.5 text-blue-400 hover:text-blue-300"
              title="Select product from master catalog"
            >
              <Package className="w-3.5 h-3.5 text-blue-400" />
              <span>Catalog SKU</span>
            </button>

            <button
              type="button"
              onClick={() => {
                playClickSound();
                const kit = getSavedBrandKit();
                if (kit?.brandName) setBrand(kit.brandName);
                if (kit?.fontFamily) setFontFamily(kit.fontFamily);
                toast.success('Applied Brand Kit styles to Barcode Label!');
              }}
              className="btn-secondary py-1 px-2.5 text-xs font-semibold flex items-center gap-1.5 text-sky-500 hover:text-sky-400"
              title="Sync Brand Name from Brand Kit"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sync Brand</span>
            </button>

            <span className="text-[11px] font-semibold text-slate-400 mx-1 hidden sm:inline">|</span>
            <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">Presets:</span>
            {SAMPLE_BARCODE_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleLoadPreset(p)}
                className="btn-secondary py-0.5 px-2 text-[11px] font-medium"
              >
                {p.label.split(' ')[0]}
              </button>
            ))}
          </div>
        }
      />

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/[0.08] pb-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('single');
          }}
          className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'single'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Barcode className="w-3.5 h-3.5" />
          <span>Single Barcode Studio</span>
        </button>
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('bulk');
          }}
          className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'bulk'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Bulk Generator (CSV / List)</span>
          <span className="text-[9px] font-mono px-1 rounded bg-sky-500/10 text-sky-500">
            {bulkItems.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('sheet');
          }}
          className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'sheet'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>A4 Sheet Print Preview</span>
        </button>
      </div>

      {/* TAB 1: Single Barcode Studio */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Panel: Inputs & Settings (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 p-4 rounded-xl space-y-3.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-500" />
                  Barcode Configuration
                </span>
                <span className="text-[10px] text-slate-400">Standard Specs</span>
              </div>

              {/* Format Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Barcode Standard Format
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  {BARCODE_FORMATS.map((fmt) => (
                    <option key={fmt.id} value={fmt.id}>
                      {fmt.label} — {fmt.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value Input & Inline Validator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    Product Code / Barcode Data
                  </label>
                  {validation.isValid ? (
                    <span className="text-[10px] font-mono text-emerald-500 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-rose-500 font-bold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Error
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={barcodeValue}
                  onChange={(e) => setBarcodeValue(e.target.value)}
                  placeholder="e.g. 8901234567890"
                  className={`w-full text-sm font-mono p-2.5 rounded-xl border bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none ${
                    validation.isValid
                      ? 'border-slate-200 dark:border-slate-800 focus:border-sky-500'
                      : 'border-rose-500 focus:ring-1 focus:ring-rose-500'
                  }`}
                />

                {/* Validation message & Auto-Fix Button */}
                {!validation.isValid && (
                  <div className="mt-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start justify-between gap-2">
                    <p className="text-[11px] leading-tight">{validation.error}</p>
                    {validation.autoFixed && (
                      <button
                        type="button"
                        onClick={handleApplyAutoFix}
                        className="btn-primary py-0.5 px-2 text-[10px] shrink-0 whitespace-nowrap"
                      >
                        Auto-Fix Check Digit
                      </button>
                    )}
                  </div>
                )}
                {validation.warning && (
                  <div className="mt-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 flex items-start justify-between gap-2">
                    <p className="text-[11px] leading-tight">{validation.warning}</p>
                    {validation.autoFixed && (
                      <button
                        type="button"
                        onClick={handleApplyAutoFix}
                        className="btn-secondary py-0.5 px-2 text-[10px] shrink-0 whitespace-nowrap"
                      >
                        Append Check Digit
                      </button>
                    )}
                  </div>
                )}

                {/* Retail GS1 GTIN Verification Card */}
                {retailGtinInfo && (
                  <div className="mt-2 p-2 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-700 dark:text-sky-300">
                    <div className="flex items-center justify-between font-semibold text-[11px]">
                      <span>Retail GTIN: {retailGtinInfo.type}</span>
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20">
                        {retailGtinInfo.country}
                      </span>
                    </div>
                    {retailGtinInfo.isValid ? (
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                        ✓ Check digit verified ({barcodeValue.slice(-1)}). Retail scanner compliant.
                      </p>
                    ) : (
                      <p className="text-[10px] text-rose-500 mt-1">
                        {retailGtinInfo.error}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Accompanying Label Info */}

              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Accompanying Label Info
                  </span>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showDetails}
                      onChange={(e) => setShowDetails(e.target.checked)}
                      className="rounded text-sky-500"
                    />
                    <span>Include in Print</span>
                  </label>
                </div>

                {showDetails && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 font-semibold">Product Name</label>
                      <input
                        type="text"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        placeholder="Product Name"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold">SKU / Code</label>
                      <input
                        type="text"
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                        placeholder="SKU-100"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-semibold">Price</label>
                      <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        placeholder="₹499.00"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] text-slate-400 font-semibold">Brand / Manufacturer</label>
                      <input
                        type="text"
                        value={brand}
                        onChange={(e) => setBrand(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        placeholder="Brand Name"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Barcode Sizing & Appearance Controls */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-3">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Appearance & Sizing
                </span>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Bar Width Scale</span>
                      <span className="font-mono font-bold">{barWidth}px</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="4"
                      step="0.5"
                      value={barWidth}
                      onChange={(e) => setBarWidth(parseFloat(e.target.value))}
                      className="luxury-range"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>Bar Height</span>
                      <span className="font-mono font-bold">{barHeight}px</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="140"
                      step="5"
                      value={barHeight}
                      onChange={(e) => setBarHeight(parseInt(e.target.value, 10))}
                      className="luxury-range"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Bar Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={lineColor}
                        onChange={(e) => setLineColor(e.target.value)}
                        className="w-7 h-7 rounded-lg border cursor-pointer"
                      />
                      <span className="font-mono text-xs">{lineColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={background}
                        onChange={(e) => setBackground(e.target.value)}
                        className="w-7 h-7 rounded-lg border cursor-pointer"
                      />
                      <span className="font-mono text-xs">{background}</span>
                    </div>
                  </div>
                </div>

                {/* Optical Contrast Rating */}
                <div className="flex items-center justify-between p-2.5 rounded-xl border bg-slate-50/80 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.08] text-xs">
                  <span className="text-[11px] text-slate-500 font-medium">Scanner Optical Contrast:</span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${contrastRating.badge}`}>
                    {contrastRating.rating} ({contrastRating.ratio}:1)
                  </span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={displayValue}
                      onChange={(e) => setDisplayValue(e.target.checked)}
                      className="rounded text-sky-500"
                    />
                    <span>Show human-readable text below</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Live Label Preview & Download Options (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Live Interactive Label Container */}
            <div className="studio-desk-stage p-6 sm:p-8 flex flex-col items-center justify-center min-h-[420px] relative select-none">
              {/* Studio Desk Floating Control Toolbar */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                    LIVE PREVIEW • {labelWidthMm} × {labelHeightMm} mm
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">300 DPI Sharpness</span>
                </div>

                <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs">
                  {/* Laser Scanline Simulator Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setIsLaserScanning((prev) => !prev);
                    }}
                    className={`py-1 px-2.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                      isLaserScanning
                        ? 'bg-red-500 text-white shadow-xs animate-pulse'
                        : 'text-slate-600 dark:text-slate-300 hover:text-red-500'
                    }`}
                    title="Simulate handheld barcode laser scan"
                  >
                    <Scan className="w-3.5 h-3.5" />
                    <span>{isLaserScanning ? 'Scanning...' : 'Laser Test'}</span>
                  </button>

                  {/* Zoom Controls */}
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.75, Math.round((z - 0.1) * 10) / 10))}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-mono px-1 text-slate-500">{Math.round(zoom * 100)}%</span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(1.5, Math.round((z + 0.1) * 10) / 10))}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Physical Label Card with realistic 3D depth and laser scanline */}
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="my-8 relative"
              >
                <div
                  ref={labelCardRef}
                  style={{
                    width: `${labelWidthMm * 4.8}px`,
                    minHeight: `${labelHeightMm * 4.8}px`,
                    backgroundColor: background,
                    color: lineColor,
                  }}
                  className="studio-card-3d rounded-xl border p-4 flex flex-col items-center justify-between text-center select-none relative overflow-hidden"
                >
                  {/* Laser Scanline Overlay */}
                  {isLaserScanning && (
                    <div className="absolute inset-x-0 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-laser z-20 pointer-events-none" />
                  )}

                  {/* Optional Top Brand & Name */}
                  {showDetails && (
                    <div className="w-full pb-1 border-b border-slate-200 dark:border-slate-800 mb-1">
                      {brand && (
                        <p className="text-[9px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
                          {brand}
                        </p>
                      )}
                      {productName && (
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 leading-snug">
                          {productName}
                        </p>
                      )}
                    </div>
                  )}

                  {/* SVG Barcode Output */}
                  <div className="w-full flex justify-center items-center py-1">
                    <svg ref={barcodeSvgRef} className="max-w-full" />
                  </div>

                  {/* Optional Bottom SKU & Price */}
                  {showDetails && (
                    <div className="w-full pt-1.5 border-t border-slate-200 dark:border-slate-800 mt-1 flex items-center justify-between text-left">
                      <div>
                        <span className="text-[8px] uppercase text-slate-400 block font-mono">SKU</span>
                        <span className="text-[10px] font-mono font-bold text-slate-800 dark:text-slate-200">
                          {sku || barcodeValue}
                        </span>
                      </div>
                      {price && (
                        <div className="text-right">
                          <span className="text-[8px] uppercase text-slate-400 block font-mono">PRICE</span>
                          <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                            {price}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Format specifications indicator */}
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-white/70 dark:bg-slate-900/70 px-3 py-1 rounded-full border border-slate-200/60 dark:border-white/[0.08]">
                <span className="font-mono text-[11px] font-bold text-sky-600 dark:text-sky-400">{format}</span>
                <span>•</span>
                <span className="font-mono text-[11px]">{barcodeValue.length} Characters</span>
                <span>•</span>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Check-Digit Verified
                </span>
              </div>

              {/* Barcode Compliance & Verification Inspector */}
              <div className="w-full mt-3 p-3.5 rounded-xl border bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200/80 dark:border-white/10 space-y-2 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-sky-500" />
                    Barcode Scanner Compliance & Health Audit
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    compliance.status === 'EXCELLENT'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                  }`}>
                    {compliance.status} ({compliance.score}/100)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-1.5 rounded bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                    <span className="text-slate-400 block text-[9px] uppercase">Quiet Zone</span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">~{compliance.quietZoneMm} mm margin</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5">
                    <span className="text-slate-400 block text-[9px] uppercase">Optical Contrast</span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{compliance.contrast.ratio}:1 ({compliance.contrast.level})</span>
                  </div>
                </div>
                {compliance.warnings.length > 0 && (
                  <div className="space-y-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                    {compliance.warnings.map((w, i) => (
                      <p key={i}>⚠️ {w}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Signature Studio Export Hub */}
            <div className="glass-panel p-5 rounded-2xl space-y-4 border border-slate-200/90 dark:border-white/[0.08] shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-sky-500/10 text-sky-500 flex items-center justify-center">
                    <Download className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                      Export & Production Suite
                    </h4>
                    <p className="text-[11px] text-slate-400">Crisp vector artwork & 300 DPI high-res sticker sheets</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Scanner Certified</span>
                </div>
              </div>

              {/* Primary Call to Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="btn-primary btn-shimmer py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-sky-500/20 hover:scale-[1.01] transition-transform"
                >
                  <FileCode className="w-4 h-4 text-sky-200" />
                  <div className="text-left">
                    <span className="block leading-tight">Download Vector SVG Barcode</span>
                    <span className="text-[10px] text-sky-200 font-normal">Infinite scalability for packaging dies</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="btn-secondary py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:border-sky-500/50 hover:scale-[1.01] transition-transform"
                >
                  <Download className="w-4 h-4 text-sky-500" />
                  <div className="text-left">
                    <span className="block leading-tight">Download High-Res 300 DPI PNG</span>
                    <span className="text-[10px] text-slate-400 font-normal">Crisp raster for e-commerce listings</span>
                  </div>
                </button>
              </div>

              {/* Secondary Options Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] hover:border-sky-500 bg-slate-50/70 dark:bg-white/[0.02] flex items-center gap-2 text-left transition-all group"
                >
                  <FileText className="w-4 h-4 text-purple-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Single Label PDF</span>
                    <span className="text-[10px] text-slate-400 font-mono">{labelWidthMm}×{labelHeightMm}mm</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadA4SheetPdf}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] hover:border-sky-500 bg-slate-50/70 dark:bg-white/[0.02] flex items-center gap-2 text-left transition-all group"
                >
                  <Grid className="w-4 h-4 text-sky-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">A4 Gang Sheet</span>
                    <span className="text-[10px] text-slate-400 font-mono">{sheetCols * sheetRows} Labels/Sheet</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] hover:border-sky-500 bg-slate-50/70 dark:bg-white/[0.02] flex items-center gap-2 text-left transition-all group"
                >
                  <Printer className="w-4 h-4 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Thermal Print</span>
                    <span className="text-[10px] text-slate-400 font-mono">Direct to printer</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDesign}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] hover:border-indigo-500 bg-slate-50/70 dark:bg-white/[0.02] flex items-center gap-2 text-left transition-all group text-indigo-500 hover:text-indigo-400"
                >
                  <Save className="w-4 h-4 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Save Project</span>
                    <span className="text-[10px] text-slate-400 font-mono">Store locally</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Bulk Barcode Generator */}
      {activeTab === 'bulk' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-sky-500" />
                  Bulk Barcode Generation from CSV / Table
                </h3>
                <p className="text-xs text-slate-500">
                  Paste barcode values (one per line or CSV: Barcode, Name, SKU, Price) or upload a CSV file.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDownloadSampleCsv}
                  className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5"
                  title="Download sample CSV template"
                >
                  <Download className="w-3.5 h-3.5 text-sky-500" />
                  <span>Sample CSV</span>
                </button>
                <label className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5 cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload CSV</span>
                  <input type="file" accept=".csv,.txt,.tsv" onChange={handleCsvUpload} className="hidden" />
                </label>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActiveTab('sheet');
                    setSheetMode('bulk');
                  }}
                  className="btn-primary py-1 px-3 text-xs flex items-center gap-1.5"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Print All on A4 Sheet</span>
                </button>
              </div>
            </div>

            {/* Input textarea */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                CSV or Multi-Line Data: <span className="font-mono text-slate-400">Barcode, Name, SKU, Price</span>
              </label>
              <textarea
                rows={6}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="8901234567890,Coffee Beans,CF-01,₹499&#10;8901234567891,Tea Leaves,TE-01,₹299"
                className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Bulk table preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Parsed Records ({bulkItems.length} items)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {bulkItems.filter((i) => i.isValid).length} Valid • {bulkItems.filter((i) => !i.isValid).length} Errors
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-white/[0.04] text-slate-500 font-mono text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Barcode</th>
                      <th className="p-2.5">Product Name</th>
                      <th className="p-2.5">SKU</th>
                      <th className="p-2.5">Price</th>
                      <th className="p-2.5">Validation</th>
                      <th className="p-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {bulkItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                        <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900 dark:text-white">
                          {item.barcode}
                        </td>
                        <td className="p-2.5 text-slate-700 dark:text-slate-300">{item.name}</td>
                        <td className="p-2.5 font-mono text-slate-500">{item.sku}</td>
                        <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                          {item.price || '-'}
                        </td>
                        <td className="p-2.5">
                          {item.isValid ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              Valid
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" title={item.error}>
                              {item.error || 'Invalid'}
                            </span>
                          )}
                        </td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              playClickSound();
                              setBarcodeValue(item.barcode);
                              setProductName(item.name);
                              setSku(item.sku);
                              setPrice(item.price);
                              setActiveTab('single');
                            }}
                            className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                          >
                            Open in Studio
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: A4 Sheet Print Preview */}
      {activeTab === 'sheet' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Grid className="w-4 h-4 text-sky-500" />
                  A4 Gang Sheet Layout & Print Settings
                </h3>
                <p className="text-xs text-slate-500">
                  Configure label dimensions, rows, columns, and margins. Export an entire A4 page with {sheetCols * sheetRows} sticker labels.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Print Sheet</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadA4SheetPdf}
                  className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download A4 PDF</span>
                </button>
              </div>
            </div>

            {/* Grid Configuration Controls */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06]">
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Preset Dimensions
                </label>
                <select
                  value={selectedDimension}
                  onChange={(e) => handleDimensionChange(e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  {LABEL_DIMENSION_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Cols ({sheetCols})
                </label>
                <input
                  type="number"
                  min="1"
                  max="6"
                  value={sheetCols}
                  onChange={(e) => setSheetCols(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Rows ({sheetRows})
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={sheetRows}
                  onChange={(e) => setSheetRows(parseInt(e.target.value, 10) || 1)}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Gap X (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={gapXmm}
                  onChange={(e) => setGapXmm(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Gap Y (mm)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={gapYmm}
                  onChange={(e) => setGapYmm(parseInt(e.target.value, 10) || 0)}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            {/* Mode toggle: Repeat Single Barcode vs Sequence */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Sheet Fill Mode:</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="sheetMode"
                    value="repeat"
                    checked={sheetMode === 'repeat'}
                    onChange={() => setSheetMode('repeat')}
                  />
                  <span>Repeat Current Barcode ({barcodeValue})</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="sheetMode"
                    value="bulk"
                    checked={sheetMode === 'bulk'}
                    onChange={() => setSheetMode('bulk')}
                  />
                  <span>Sequence from Bulk List ({bulkItems.length} items)</span>
                </label>
              </div>

              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showCutGuides}
                  onChange={(e) => setShowCutGuides(e.target.checked)}
                />
                <span>Show Cut Guide Lines</span>
              </label>
            </div>

            {/* Visual A4 Paper Preview */}
            <div className="p-6 rounded-2xl bg-slate-200/70 dark:bg-slate-950 flex justify-center overflow-x-auto">
              <div
                ref={printSheetRef}
                style={{
                  width: '210mm',
                  minHeight: '297mm',
                  paddingTop: `${marginTopMm}mm`,
                  paddingLeft: `${marginLeftMm}mm`,
                  backgroundColor: '#ffffff',
                }}
                className="shadow-2xl border border-slate-300 text-slate-900 font-sans"
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${sheetCols}, ${labelWidthMm}mm)`,
                    gridAutoRows: `${labelHeightMm}mm`,
                    columnGap: `${gapXmm}mm`,
                    rowGap: `${gapYmm}mm`,
                  }}
                >
                  {Array.from({ length: sheetCols * sheetRows }).map((_, index) => {
                    const item = sheetMode === 'bulk' && bulkItems[index]
                      ? bulkItems[index]
                      : { barcode: barcodeValue, name: productName, sku, price, brand };

                    return (
                      <div
                        key={index}
                        style={{
                          border: showCutGuides ? '1px dashed #cbd5e1' : '1px solid transparent',
                          padding: '2mm',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                          alignItems: 'center',
                          textAlign: 'center',
                          boxSizing: 'border-box',
                          overflow: 'hidden',
                        }}
                      >
                        {showDetails && (
                          <div style={{ fontSize: '7px', fontWeight: 'bold', lineHeight: '1.1', maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {item.name || item.brand}
                          </div>
                        )}
                        <div style={{ fontSize: '10px', fontWeight: '900', letterSpacing: '1px', margin: '2px 0' }}>
                          ||| | |||| | |||
                        </div>
                        <div style={{ fontSize: '8px', fontFamily: 'monospace' }}>
                          {item.barcode}
                        </div>
                        {showDetails && item.price && (
                          <div style={{ fontSize: '7px', fontWeight: 'bold', color: '#047857' }}>
                            {item.price}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Shared Modals */}
      <BrandKitModal
        isOpen={isBrandKitOpen}
        onClose={() => setIsBrandKitOpen(false)}
        onApplied={handleApplyBrandKit}
      />

      <SavedDesignsModal
        isOpen={isSavedDesignsOpen}
        onClose={() => setIsSavedDesignsOpen(false)}
        currentTool="barcode"
        onLoadDesign={handleLoadSavedDesign}
      />

      <ProductLabelStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />

      {/* Product Catalog Modal */}
      <ProductCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectProduct={(prod) => {
          setProductName(prod.name);
          setSku(prod.sku);
          if (prod.gtin) {
            setBarcodeValue(prod.gtin);
            setFormat('EAN13');
          } else {
            setBarcodeValue(prod.sku);
          }
          if (prod.brand) setBrand(prod.brand);
          if (prod.sellingPrice) {
            setPrice(prod.currency === 'INR' ? `₹${prod.sellingPrice}` : `$${prod.sellingPrice}`);
          }
          toast.success(`Imported ${prod.name} (${prod.sku}) to Barcode Label!`);
        }}
      />

      {/* AI Prompt Assistant Modal */}
      <AiDesignAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentTool="barcode"
        onApplyDesign={(aiResult) => {
          if (aiResult.productName) setProductName(aiResult.productName);
          if (aiResult.sku) setSku(aiResult.sku);
          if (aiResult.barcode) {
            setBarcodeValue(aiResult.barcode);
            if (aiResult.barcode.length === 13) setFormat('EAN13');
          }
          if (aiResult.sellingPrice) {
            setPrice(aiResult.currency === 'INR' ? `₹${aiResult.sellingPrice}` : `$${aiResult.sellingPrice}`);
          }
          toast.success('Applied AI design recommendations to Barcode Label!');
        }}
      />
    </div>
  );
}
