import React, { useState, useEffect, useRef } from 'react';
import {
  Layers,
  Barcode as BarcodeIcon,
  Tag,
  QrCode as QrCodeIcon,
  Heart,
  Download,
  Printer,
  Sparkles,
  ArrowRight,
  Upload,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Save,
  Palette,
  ExternalLink,
  Percent,
  Check,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize2
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { playClickSound } from '../../utils/audioFeedback';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import BrandKitModal from '../common/BrandKitModal';
import SavedDesignsModal from '../common/SavedDesignsModal';
import {
  validateRetailGtin,
  calculateEan13CheckDigit,
  renderBarcodeToSvg,
  getBarcodeContrastRating
} from '../../utils/barcodeUtils';
import {
  calculateDiscount,
  formatCurrency,
  CURRENCY_SYMBOLS,
  CATEGORY_TEMPLATES
} from '../../utils/priceTagUtils';
import {
  buildQrPayload,
  renderFullQrCanvas,
  evaluateQrScanReliability
} from '../../utils/qrUtils';
import {
  CARD_SIZES,
  THANK_YOU_TEMPLATES,
  getCardPrintDimensions
} from '../../utils/thankYouCardUtils';
import {
  exportCompletePackagingKitPdf,
  downloadCanvasAsPng,
  downloadSvg,
  svgToCanvas,
  exportSinglePdf,
  exportSinglePdfWithBleed
} from '../../utils/exportUtils';
import { getSavedBrandKit } from '../../utils/brandKitUtils';
import { saveDesign } from '../../utils/savedDesignsUtils';
import AiDesignAssistantModal from '../common/AiDesignAssistantModal';
import ProductCatalogModal from '../common/ProductCatalogModal';
import CouponManagerModal from '../common/CouponManagerModal';
import { runLabelQualityCheck } from '../../utils/labelQualityChecker';
import { calculateOptimalPrintLayout, COMMERCIAL_SHEET_PRESETS } from '../../utils/printLayoutOptimizer';
import {
  Package,
  Ticket,
  ShieldCheck,
  Scale,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export function ProductLabelStudioTool() {
  const toast = useToast();

  // Modals state
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [isSavedDesignsOpen, setIsSavedDesignsOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [selectedSheetPreset, setSelectedSheetPreset] = useState('a4-24up');
  const [isQualityOpen, setIsQualityOpen] = useState(false);

  // Active Brand Kit
  const [brandKit, setBrandKit] = useState(getSavedBrandKit());

  // Master Product Information
  const [productData, setProductData] = useState({
    name: 'Wireless ANC Gaming Headset',
    sku: 'SKU-ELC-8921',
    gtin: '8901030365737', // Valid GS1 India EAN-13
    sellingPrice: 1999,
    mrp: 3999,
    currency: 'INR',
    description: '40mm Neodymium Drivers | 50h Ultra Battery | Low Latency Gaming',
    url: 'https://quickformat.arvaancorelogic.com',
    couponCode: 'SAVE20',
    couponDiscount: '20% OFF next purchase',
    thankYouNote: 'Thank you for choosing our crafted tech gear! We hope it elevates every gaming and audio session.',
    offerValidUntil: '31 Dec 2026',
  });

  // Images
  const [brandLogo, setBrandLogo] = useState(null);
  const [productImage, setProductImage] = useState(null);

  // SVG & Canvas Refs for export
  const barcodeSvgRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const priceTagCanvasRef = useRef(null);
  const thankYouCanvasRef = useRef(null);

  // Export State
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [activePreviewZoom, setActivePreviewZoom] = useState(1);

  // Listen to Brand Kit updates
  useEffect(() => {
    const handleBrandKitUpdate = (e) => {
      if (e.detail) {
        setBrandKit(e.detail);
        if (e.detail.logoUrl) setBrandLogo(e.detail.logoUrl);
      }
    };
    window.addEventListener('qfh:brand-kit-updated', handleBrandKitUpdate);
    return () => window.removeEventListener('qfh:brand-kit-updated', handleBrandKitUpdate);
  }, []);

  // Sync with Brand Kit on load
  useEffect(() => {
    const kit = getSavedBrandKit();
    setBrandKit(kit);
    if (kit.logoUrl) setBrandLogo(kit.logoUrl);
  }, []);

  // Validation & Calculations
  const gtinClean = (productData.gtin || '').replace(/[^0-9]/g, '');
  let fullGtin = gtinClean;
  if (gtinClean.length === 12) {
    fullGtin = gtinClean + calculateEan13CheckDigit(gtinClean);
  }
  const gtinValidation = validateRetailGtin(fullGtin);
  const { discountPercent, savings, isInvalid: priceInvalid, error: priceError } = calculateDiscount(
    productData.mrp,
    productData.sellingPrice
  );

  // Pre-Flight Automated Quality Audit
  const qualityReport = runLabelQualityCheck({
    toolType: 'studio',
    productName: productData.name,
    sku: productData.sku,
    barcodeValue: fullGtin || productData.sku,
    barcodeFormat: fullGtin.length === 13 ? 'EAN13' : 'CODE128',
    sellingPrice: productData.sellingPrice,
    mrp: productData.mrp,
    qrPayload: productData.url,
    fontSize: 12,
  });

  // Print Layout Optimizer Calculation
  const activePreset = COMMERCIAL_SHEET_PRESETS.find((p) => p.id === selectedSheetPreset) || COMMERCIAL_SHEET_PRESETS[2];
  const printLayout = calculateOptimalPrintLayout({
    paperWidthMm: activePreset.paperId === 'letter' ? 215.9 : 210,
    paperHeightMm: activePreset.paperId === 'letter' ? 279.4 : 297,
    labelWidthMm: activePreset.labelWidthMm,
    labelHeightMm: activePreset.labelHeightMm,
    marginTopMm: activePreset.marginTopMm,
    marginLeftMm: activePreset.marginLeftMm,
    gapXmm: activePreset.gapXmm,
    gapYmm: activePreset.gapYmm,
    printScaleMode: 'actual',
  });

  // Render Barcode
  useEffect(() => {
    if (barcodeSvgRef.current) {
      const codeVal = fullGtin || productData.sku || '8901030365737';
      const fmt = fullGtin.length === 13 ? 'EAN13' : 'CODE128';
      renderBarcodeToSvg(barcodeSvgRef.current, codeVal, {
        format: fmt,
        width: 1.8,
        height: 48,
        displayValue: true,
        fontSize: 12,
        lineColor: '#000000',
        background: '#ffffff',
        margin: 6,
      });
    }
  }, [fullGtin, productData.sku]);

  // Render QR Code
  useEffect(() => {
    const payload = productData.url || 'https://quickformat.com';
    renderFullQrCanvas({
      payload,
      size: 320,
      darkColor: brandKit.primaryColor || '#0284c7',
      lightColor: '#ffffff',
      errorCorrectionLevel: 'Q',
      frameStyle: 'bottom-pill',
      ctaText: 'SCAN FOR SPECS',
      logoDataUrl: brandLogo,
      logoSizePercent: 20,
    })
      .then((canvas) => {
        if (qrCanvasRef.current) {
          const ctx = qrCanvasRef.current.getContext('2d');
          qrCanvasRef.current.width = canvas.width;
          qrCanvasRef.current.height = canvas.height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(canvas, 0, 0);
        }
      })
      .catch((err) => console.error('Failed to render QR Canvas:', err));
  }, [productData.url, brandKit.primaryColor, brandLogo]);

  // Render Price Tag Canvas
  useEffect(() => {
    if (!priceTagCanvasRef.current) return;
    const canvas = priceTagCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 560; // 70mm @ 8px/mm
    const height = 360; // 45mm @ 8px/mm
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Header Band
    ctx.fillStyle = brandKit.primaryColor || '#0284c7';
    ctx.fillRect(0, 0, width, 56);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(brandKit.brandName || 'QUICKFORMAT RETAIL', 20, 36);

    // Offer Validity right-aligned
    if (productData.offerValidUntil) {
      ctx.font = '11px system-ui, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`Valid till: ${productData.offerValidUntil}`, width - 20, 36);
      ctx.textAlign = 'left';
    }

    // Product Title
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 20px system-ui, sans-serif';
    ctx.fillText((productData.name || 'Product Title').slice(0, 38), 20, 96);

    // SKU & Specs
    ctx.fillStyle = '#64748b';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(`SKU: ${productData.sku}  |  ${productData.description.slice(0, 48)}`, 20, 122);

    // Selling Price
    ctx.fillStyle = brandKit.primaryColor || '#0369a1';
    ctx.font = 'bold 36px system-ui, sans-serif';
    const priceStr = formatCurrency(productData.sellingPrice, productData.currency);
    ctx.fillText(priceStr, 20, 172);

    // MRP Strike-through
    ctx.fillStyle = '#94a3b8';
    ctx.font = '16px system-ui, sans-serif';
    const mrpStr = `MRP: ${formatCurrency(productData.mrp, productData.currency)}`;
    ctx.fillText(mrpStr, 20, 204);
    const mrpWidth = ctx.measureText(mrpStr).width;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(18, 199);
    ctx.lineTo(22 + mrpWidth, 199);
    ctx.stroke();

    // Discount Pill
    if (discountPercent > 0) {
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.roundRect(width - 150, 138, 130, 38, 19);
      ctx.fill();

      ctx.fillStyle = '#854d0e';
      ctx.font = 'bold 15px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${discountPercent}% OFF`, width - 85, 162);
      ctx.textAlign = 'left';
    }

    // Savings text
    if (savings > 0) {
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 13px system-ui, sans-serif';
      ctx.fillText(`Save ${formatCurrency(savings, productData.currency)}`, width - 146, 198);
    }

    // Barcode Representation at bottom
    ctx.fillStyle = '#0f172a';
    ctx.font = '11px monospace';
    ctx.fillText(`EAN: ${fullGtin || productData.sku}`, 20, 240);

    // Draw bottom border
    ctx.strokeStyle = brandKit.primaryColor || '#0284c7';
    ctx.lineWidth = 3;
    ctx.strokeRect(4, 4, width - 8, height - 8);
  }, [productData, brandKit, discountPercent, savings, fullGtin]);

  // Render Thank You Card Canvas
  useEffect(() => {
    if (!thankYouCanvasRef.current) return;
    const canvas = thankYouCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 712; // 89mm @ 8px/mm
    const height = 408; // 51mm @ 8px/mm
    canvas.width = width;
    canvas.height = height;

    // Clean background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Elegant border
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.strokeRect(12, 12, width - 24, height - 24);

    // Brand Name
    ctx.fillStyle = brandKit.primaryColor || '#0284c7';
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.fillText((brandKit.brandName || 'ACME BRAND').toUpperCase(), 32, 44);

    // Headline
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px system-ui, sans-serif';
    ctx.fillText('Thank You For Your Order!', 32, 84);

    // Custom Note (wrapped)
    ctx.fillStyle = '#475569';
    ctx.font = '13px system-ui, sans-serif';
    const note = productData.thankYouNote;
    ctx.fillText(note.slice(0, 80), 32, 118);
    if (note.length > 80) {
      ctx.fillText(note.slice(80, 160), 32, 138);
    }

    // Coupon Box
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(32, 168, width - 64, 76, 12);
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    ctx.fillStyle = '#64748b';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(productData.couponDiscount || 'Special VIP Discount', 50, 194);

    ctx.fillStyle = brandKit.primaryColor || '#0284c7';
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`COUPON: ${productData.couponCode || 'THANKYOU'}`, 50, 226);

    // Footer Web & Social
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(`Store: ${brandKit.website || productData.url}   |   ${brandKit.social || '@brand'}`, 32, 274);
  }, [productData, brandKit]);

  // Export Complete Packaging Suite PDF
  const handleExportCompletePackage = async () => {
    setIsExportingAll(true);
    playClickSound();

    try {
      // 1. Barcode Canvas
      const barcodeCanvas = await svgToCanvas(barcodeSvgRef.current, 800, 400);
      const barcodeDataUrl = barcodeCanvas.toDataURL('image/png');

      // 2. Price Tag Canvas Data URL
      const priceTagDataUrl = priceTagCanvasRef.current.toDataURL('image/png');

      // 3. QR Code Canvas Data URL
      const qrCodeDataUrl = qrCanvasRef.current.toDataURL('image/png');

      // 4. Thank You Card Data URL
      const thankYouCardDataUrl = thankYouCanvasRef.current.toDataURL('image/png');

      exportCompletePackagingKitPdf({
        barcodeDataUrl,
        priceTagDataUrl,
        qrCodeDataUrl,
        thankYouCardDataUrl,
        productName: productData.name,
        sku: productData.sku,
        brandName: brandKit.brandName,
        filename: `${(productData.sku || 'Product').replace(/\s+/g, '_')}_Packaging_Kit.pdf`,
      });

      toast.success('Complete Packaging Kit PDF generated with all 4 assets!');
    } catch (err) {
      console.error('Packaging export failed:', err);
      toast.error('Failed to compile packaging PDF package.');
    } finally {
      setIsExportingAll(false);
    }
  };

  // 1-Click Apply Brand Kit Defaults
  const handleApplyBrandKit = () => {
    playClickSound();
    const kit = getSavedBrandKit();
    setBrandKit(kit);
    if (kit.logoUrl) setBrandLogo(kit.logoUrl);
    setProductData((prev) => ({
      ...prev,
      url: kit.website || prev.url,
      currency: kit.currency || prev.currency,
    }));
    toast.success('Applied Brand Kit settings across all 4 products!');
  };

  // Save Complete Product Package
  const handleSaveProductPackage = () => {
    playClickSound();
    try {
      const id = saveDesign({
        tool: 'studio',
        name: `${productData.name} - Packaging Suite`,
        state: { productData, brandKit },
      });
      toast.success(`Packaging suite saved successfully! (ID: ${id.slice(-6)})`);
    } catch {
      toast.error('Failed to save packaging project.');
    }
  };

  // Quick navigation to individual specialized tool with pre-loaded state
  const handleOpenInTool = (toolRoute) => {
    playClickSound();
    window.location.hash = toolRoute;
    window.location.pathname = toolRoute;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Tool Hero Header */}
      <ToolHeroHeader
        title="Product Label & Packaging Studio"
        subtitle="Unified Multi-Asset Packaging Engine — Enter product details once and generate synchronized Barcode Labels, Price Tags, QR Codes, and Packaging Inserts."
        category="Commerce"
        badges={['ALL-IN-ONE', 'CLIENT-SIDE AIR GAPPED', 'PRINT-READY PDF']}
      />

      {/* Main Studio Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-8 flex-1">
        {/* Action Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-100">Unified Packaging Suite</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  4 Tools Synchronized
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Active Brand: <strong className="text-slate-200">{brandKit.brandName}</strong>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600/30 to-purple-600/30 hover:from-indigo-600/50 hover:to-purple-600/50 text-indigo-200 border border-indigo-500/30 transition-all shadow-sm"
              title="Describe packaging in plain English with AI"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              AI Prompt Studio
            </button>

            <button
              onClick={() => setIsCatalogModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Select from master product SKU catalog"
            >
              <Package className="w-4 h-4 text-blue-400" />
              Product Catalog
            </button>

            <button
              onClick={() => setIsCouponModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Manage promotion vouchers"
            >
              <Ticket className="w-4 h-4 text-purple-400" />
              Coupon Hub
            </button>

            <button
              onClick={() => setIsBrandKitOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Palette className="w-4 h-4 text-sky-400" />
              Brand Kit
            </button>

            <button
              onClick={handleApplyBrandKit}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              title="Auto-fill brand name, colors, website and social"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Sync Brand
            </button>

            <button
              onClick={handleSaveProductPackage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              Save Project
            </button>

            <button
              onClick={() => setIsSavedDesignsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-blue-400" />
              Saved Designs
            </button>

            <button
              onClick={handleExportCompletePackage}
              disabled={isExportingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              {isExportingAll ? 'Compiling Dossier...' : 'Export Complete Packaging Kit (PDF)'}
            </button>
          </div>
        </div>

        {/* Automated Pre-Flight Quality Audit Status Bar */}
        <div className={`p-4 rounded-2xl border transition-all ${
          qualityReport.overallStatus === 'PASS'
            ? 'bg-emerald-950/20 border-emerald-500/30'
            : qualityReport.overallStatus === 'CRITICAL_FAIL'
            ? 'bg-rose-950/20 border-rose-500/40'
            : 'bg-amber-950/20 border-amber-500/30'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${
                qualityReport.overallStatus === 'PASS'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : qualityReport.overallStatus === 'CRITICAL_FAIL'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Automated Pre-Flight Label Quality Audit:
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-mono font-bold ${
                    qualityReport.overallStatus === 'PASS'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : qualityReport.overallStatus === 'CRITICAL_FAIL'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {qualityReport.score}/100 • {qualityReport.overallStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{qualityReport.summary}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsQualityOpen(!isQualityOpen)}
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
              >
                {isQualityOpen ? 'Hide Audit Checklist' : `View ${qualityReport.issuesCount} Audit Check(s)`}
                {isQualityOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Expandable Audit Details */}
          {isQualityOpen && (
            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-2.5">
              {qualityReport.issues.length === 0 ? (
                <div className="text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  All 12 optical contrast, GS1 check-digit, QR decodability, and pricing sanity checks passed!
                </div>
              ) : (
                qualityReport.issues.map((issue) => (
                  <div
                    key={issue.id}
                    className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                      issue.severity === 'critical'
                        ? 'bg-rose-950/40 border-rose-500/30 text-rose-200'
                        : 'bg-amber-950/40 border-amber-500/30 text-amber-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-semibold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        [{issue.element}] {issue.explanation}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Recommendation: {issue.recommendedCorrection}
                      </div>
                    </div>
                    {issue.autoFixedValue && (
                      <button
                        type="button"
                        onClick={() => {
                          if (issue.element.includes('Barcode') || issue.element.includes('GTIN')) {
                            setProductData({ ...productData, gtin: issue.autoFixedValue });
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shrink-0"
                      >
                        Auto-Fix Value
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Studio Grid: Left Form (Single Data Entry) + Right Live Previews */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Step 1: Master Product Information (5 Cols) */}
          <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Step 1: Product Master Information
              </h3>
              <span className="text-[11px] text-slate-400">Enter Once • Updates All 4</span>
            </div>

            <div className="space-y-4 text-xs">
              {/* Product Name */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Product Title</label>
                <input
                  type="text"
                  value={productData.name}
                  onChange={(e) => setProductData({ ...productData, name: e.target.value })}
                  placeholder="e.g. Wireless ANC Gaming Headset"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* SKU & GTIN */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Internal SKU</label>
                  <input
                    type="text"
                    value={productData.sku}
                    onChange={(e) => setProductData({ ...productData, sku: e.target.value })}
                    placeholder="e.g. SKU-ELC-8921"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Retail GTIN / Barcode</label>
                  <input
                    type="text"
                    value={productData.gtin}
                    onChange={(e) => setProductData({ ...productData, gtin: e.target.value })}
                    placeholder="12 or 13 digits"
                    className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-slate-100 font-mono focus:outline-none ${
                      gtinValidation.isValid ? 'border-slate-700 focus:border-amber-500' : 'border-rose-500/80'
                    }`}
                  />
                </div>
              </div>

              {/* GTIN Status Badge */}
              <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px]">
                {gtinValidation.isValid ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Valid {gtinValidation.gtinType} ({gtinValidation.prefixInfo})
                  </span>
                ) : (
                  <div className="flex items-center justify-between text-rose-400">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {gtinValidation.error}
                    </span>
                    {gtinValidation.autoFixed && (
                      <button
                        onClick={() => setProductData({ ...productData, gtin: gtinValidation.autoFixed })}
                        className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 font-semibold"
                      >
                        Auto-Fix Check Digit
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Selling Price</label>
                  <input
                    type="number"
                    value={productData.sellingPrice}
                    onChange={(e) => setProductData({ ...productData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">MRP (Max Price)</label>
                  <input
                    type="number"
                    value={productData.mrp}
                    onChange={(e) => setProductData({ ...productData, mrp: Number(e.target.value) })}
                    className={`w-full px-3 py-2 bg-slate-950 border rounded-xl text-slate-100 focus:outline-none ${
                      priceInvalid ? 'border-rose-500' : 'border-slate-700 focus:border-amber-500'
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Currency</label>
                  <select
                    value={productData.currency}
                    onChange={(e) => setProductData({ ...productData, currency: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {CURRENCY_SYMBOLS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Pricing Validation Banner */}
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] flex items-center justify-between">
                {priceInvalid ? (
                  <span className="text-rose-400 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {priceError}
                  </span>
                ) : discountPercent > 0 ? (
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <Percent className="w-3.5 h-3.5" />
                    {discountPercent}% Discount • Customer Saves {formatCurrency(savings, productData.currency)}
                  </span>
                ) : (
                  <span className="text-slate-400">Regular Selling Price</span>
                )}
                {productData.offerValidUntil && (
                  <span className="text-slate-400">Till: {productData.offerValidUntil}</span>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Product Description / Highlights</label>
                <input
                  type="text"
                  value={productData.description}
                  onChange={(e) => setProductData({ ...productData, description: e.target.value })}
                  placeholder="Key product attributes or pack specs"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* URL */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Product URL (Encoded in QR Code)</label>
                <input
                  type="text"
                  value={productData.url}
                  onChange={(e) => setProductData({ ...productData, url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Customer Thank You Note & Coupon */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={productData.couponCode}
                    onChange={(e) => setProductData({ ...productData, couponCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. SAVE20"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Offer Validity Date</label>
                  <input
                    type="text"
                    value={productData.offerValidUntil}
                    onChange={(e) => setProductData({ ...productData, offerValidUntil: e.target.value })}
                    placeholder="e.g. 31 Dec 2026"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Customer Thank You Message</label>
                <textarea
                  rows={2}
                  value={productData.thankYouNote}
                  onChange={(e) => setProductData({ ...productData, thankYouNote: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Smart Print Layout Optimizer Panel */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    Commercial Sheet Preset & Yield Optimizer
                  </label>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    100% Actual Scale
                  </span>
                </div>
                <select
                  value={selectedSheetPreset}
                  onChange={(e) => setSelectedSheetPreset(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 text-xs focus:outline-none focus:border-amber-500"
                >
                  {COMMERCIAL_SHEET_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} — {p.recommendedFor}
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Sheet Yield</span>
                    <strong className="text-amber-400 font-mono text-xs">{printLayout.totalYield} labels</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Grid Layout</span>
                    <strong className="text-slate-200 font-mono text-xs">{printLayout.cols} × {printLayout.rows}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Paper Surface</span>
                    <strong className="text-emerald-400 font-mono text-xs">{printLayout.utilizationPercent}% used</strong>
                  </div>
                </div>

                {printLayout.warnings?.length > 0 && (
                  <p className="text-[10px] text-amber-400/90 leading-tight">
                    Notice: {printLayout.warnings[0]}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Step 2: Synchronized Product Suite (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  Step 2: Live Synchronized Assets Preview
                </h3>
                <p className="text-xs text-slate-400">All four assets update in real time with your product master data.</p>
              </div>
            </div>

            {/* Asset Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* 1. Barcode Label Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-amber-500/40 transition-all shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                      <BarcodeIcon className="w-4 h-4" />
                      1. Barcode Label (50 × 25 mm)
                    </span>
                    <button
                      onClick={() => handleOpenInTool('/barcode-generator')}
                      className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                    >
                      Deep Edit <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-3 bg-white text-slate-900 rounded-xl border border-slate-200 text-center shadow-inner flex flex-col items-center">
                    <p className="text-[11px] font-bold truncate max-w-full">{productData.name}</p>
                    <svg ref={barcodeSvgRef} className="max-w-full my-1"></svg>
                    <div className="flex items-center justify-between w-full px-2 text-[10px] font-semibold text-slate-700">
                      <span>SKU: {productData.sku}</span>
                      <span>MRP: {formatCurrency(productData.mrp, productData.currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Format: {fullGtin.length === 13 ? 'EAN-13' : 'Code 128'}</span>
                  <button
                    onClick={() => {
                      svgToCanvas(barcodeSvgRef.current, 800, 400).then((canvas) =>
                        downloadCanvasAsPng(canvas, `${productData.sku}_Barcode.png`)
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                  >
                    Download PNG
                  </button>
                </div>
              </div>

              {/* 2. Retail Price Tag Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-blue-500/40 transition-all shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
                      <Tag className="w-4 h-4" />
                      2. Retail Price Tag (70 × 45 mm)
                    </span>
                    <button
                      onClick={() => handleOpenInTool('/price-tag-creator')}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
                    >
                      Deep Edit <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-slate-700/80 shadow-inner flex justify-center bg-slate-950 p-2">
                    <canvas ref={priceTagCanvasRef} className="max-w-full h-auto rounded-lg shadow" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Discount: {discountPercent}% OFF</span>
                  <button
                    onClick={() => downloadCanvasAsPng(priceTagCanvasRef.current, `${productData.sku}_PriceTag.png`)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                  >
                    Download PNG
                  </button>
                </div>
              </div>

              {/* 3. Product QR Code Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-emerald-500/40 transition-all shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <QrCodeIcon className="w-4 h-4" />
                      3. Product QR Code (Custom Frame)
                    </span>
                    <button
                      onClick={() => handleOpenInTool('/qr-code-generator')}
                      className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                    >
                      Deep Edit <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-slate-700/80 shadow-inner flex justify-center bg-slate-950 p-2">
                    <canvas ref={qrCanvasRef} className="max-w-[180px] h-auto rounded-lg shadow" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">ECC Level: Q (25%)</span>
                  <button
                    onClick={() => downloadCanvasAsPng(qrCanvasRef.current, `${productData.sku}_QRCode.png`)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                  >
                    Download PNG
                  </button>
                </div>
              </div>

              {/* 4. Packaging Insert Thank You Card */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between hover:border-rose-500/40 transition-all shadow-lg">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <Heart className="w-4 h-4" />
                      4. Thank You Insert (89 × 51 mm)
                    </span>
                    <button
                      onClick={() => handleOpenInTool('/thank-you-card-maker')}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1"
                    >
                      Deep Edit <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-slate-700/80 shadow-inner flex justify-center bg-slate-950 p-2">
                    <canvas ref={thankYouCanvasRef} className="max-w-full h-auto rounded-lg shadow" />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Code: {productData.couponCode}</span>
                  <button
                    onClick={() => downloadCanvasAsPng(thankYouCanvasRef.current, `${productData.sku}_ThankYouCard.png`)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                  >
                    Download PNG
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Brand Kit Modal */}
      <BrandKitModal
        isOpen={isBrandKitOpen}
        onClose={() => setIsBrandKitOpen(false)}
        onSaved={(kit) => {
          setBrandKit(kit);
          if (kit.logoUrl) setBrandLogo(kit.logoUrl);
        }}
      />

      {/* Saved Designs Modal */}
      <SavedDesignsModal
        isOpen={isSavedDesignsOpen}
        onClose={() => setIsSavedDesignsOpen(false)}
        toolFilter="studio"
        onLoadDesign={(design) => {
          if (design.state?.productData) {
            setProductData(design.state.productData);
          }
          if (design.state?.brandKit) {
            setBrandKit(design.state.brandKit);
          }
          setIsSavedDesignsOpen(false);
          toast.success(`Loaded packaging project: ${design.name}`);
        }}
      />

      {/* AI Design Assistant Modal */}
      <AiDesignAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentTool="studio"
        onApplyDesign={(aiResult) => {
          setProductData((prev) => ({
            ...prev,
            name: aiResult.productName || prev.name,
            sku: aiResult.sku || prev.sku,
            gtin: aiResult.barcode || prev.gtin,
            sellingPrice: aiResult.sellingPrice || prev.sellingPrice,
            mrp: aiResult.mrp || prev.mrp,
            currency: aiResult.currency || prev.currency,
            url: aiResult.url || prev.url,
            couponCode: aiResult.couponCode || prev.couponCode,
          }));
          toast.success('Applied AI design settings to packaging suite!');
        }}
      />

      {/* Master Product Catalog & SKU Hub Modal */}
      <ProductCatalogModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        onSelectProduct={(prod) => {
          setProductData((prev) => ({
            ...prev,
            name: prod.name || prev.name,
            sku: prod.sku || prev.sku,
            gtin: prod.gtin || prev.gtin,
            sellingPrice: prod.sellingPrice || prev.sellingPrice,
            mrp: prod.mrp || prev.mrp,
            currency: prod.currency || prev.currency,
            description: prod.description || prev.description,
            url: prod.url || prev.url,
          }));
          toast.success(`Loaded "${prod.name}" (${prod.sku}) from catalog!`);
        }}
      />

      {/* Promotions & Coupon Manager Modal */}
      <CouponManagerModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        onSelectCoupon={(c) => {
          setProductData((prev) => ({
            ...prev,
            couponCode: c.code,
            couponDiscount: c.discountType === 'percentage' ? `${c.discountValue}% OFF next purchase` : `₹${c.discountValue} FLAT DISCOUNT`,
          }));
          toast.success(`Applied coupon code ${c.code}!`);
        }}
      />
    </div>
  );
}
