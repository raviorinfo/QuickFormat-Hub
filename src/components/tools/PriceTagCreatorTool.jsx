import React, { useState, useEffect, useRef } from 'react';
import {
  Tag,
  Download,
  Printer,
  Copy,
  Sparkles,
  Upload,
  RefreshCw,
  Sliders,
  Layers,
  FileSpreadsheet,
  Grid,
  CheckCircle2,
  Trash2,
  Image as ImageIcon,
  QrCode,
  Barcode as BarcodeIcon,
  Percent,
  Check,
  Save,
  FolderOpen,
  Palette,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Box,
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
  CURRENCY_SYMBOLS,
  TAG_SHAPES,
  CATEGORY_TEMPLATES,
  calculateDiscount,
  validatePriceInput,
  formatCurrency,
  generatePriceTagSampleCsv,
  parseBulkPriceTagsCsv,
} from '../../utils/priceTagUtils';
import {
  downloadCanvasAsPng,
  downloadSvg,
  downloadCsv,
  exportSinglePdf,
  exportA4SheetPdf,
  printHtmlElement,
} from '../../utils/exportUtils';
import { getSavedBrandKit } from '../../utils/brandKitUtils';
import { saveDesign } from '../../utils/savedDesignsUtils';
import JsBarcode from 'jsbarcode';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';

// Enhanced Modules for MRP Tags, E-Commerce Labels, and Automatic Sheet Printing
import { RegularMrpTagDesigner } from './price-tag/RegularMrpTagDesigner';
import { EcommerceLabelsModule } from './price-tag/EcommerceLabelsModule';
import { SheetLayoutModule } from './price-tag/SheetLayoutModule';
import { SavedTemplatesManager } from './price-tag/SavedTemplatesManager';
import { MRP_TAG_TEMPLATES } from '../../utils/mrpTagUtils';
import { ECOMMERCE_LABEL_TYPES } from '../../utils/ecommerceLabelUtils';

export function PriceTagCreatorTool() {
  const toast = useToast();

  // Multi-Module navigation state
  const [mainModule, setMainModule] = useState('price-tags'); // 'price-tags' | 'ecommerce-labels' | 'sheet-arrangement' | 'saved-templates'
  const [priceTagMode, setPriceTagMode] = useState('promotional'); // 'promotional' | 'regular-mrp'
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk' | 'sheet' (for promotional tag)

  // Module 1: Regular MRP Tag state
  const [mrpState, setMrpState] = useState(() => ({
    name: 'Organic Bamboo Coffee Tumbler',
    sku: 'BAM-TMB-450',
    mrp: 699,
    sellingPrice: '',
    brand: 'EcoVibe Essentials',
    variant: 'Matte Olive / 450ml',
    packSize: '1 Unit',
    customText: '100% Biodegradable & BPA Free',
    showDiscount: false,
    codeType: 'barcode',
    barcodeValue: '8901234567890',
    qrValue: 'https://ecovibe.com/p/BAM-TMB-450',
    widthMm: 60,
    heightMm: 40,
    orientation: 'landscape',
    fontFamily: 'sans-serif',
    headerBg: '#0f172a',
    headerText: '#ffffff',
    bg: '#ffffff',
    borderColor: '#e2e8f0',
    borderStyle: 'solid',
    priceColor: '#0f172a',
    cornerRadius: 8,
    textAlign: 'center',
    barcodePlacement: 'bottom',
    logoUrl: null,
    hasHole: false,
    showFields: {
      brand: true,
      sku: true,
      variant: true,
      packSize: true,
      customText: true,
      sellingPrice: true,
    },
  }));

  // Module 2: E-Commerce Product Label state (single)
  const [ecommerceLabelState, setEcommerceLabelState] = useState(() => ({
    productName: 'Toy Car Diecast Racing',
    sku: 'TOY-CAR-01',
    barcode: '8901234567890',
    mrp: 299,
    sellingPrice: 249,
    quantity: 1,
    variant: 'Red / 1:64 Scale',
    brand: 'Speedster Toys',
    weight: '120g',
    origin: 'India',
    customText: 'Non-toxic paint • Ages 3+',
    orderId: 'ORD-2026-9812',
    awbNumber: 'AWB-789012345',
    recipientName: 'Rahul Sharma',
    recipientAddress: 'Flat 402, Lotus Tower, MG Road',
    recipientCity: 'Bengaluru',
    recipientState: 'Karnataka',
    recipientPincode: '560001',
    recipientPhone: '+91 98765 43210',
    senderName: 'QuickFormat Hub Fulfillment',
    senderAddress: 'Plot 18, Electronic City Phase 1',
    senderPhone: '+91 80 4123 4567',
    widthMm: 50,
    heightMm: 30,
    fontFamily: 'sans-serif',
    showBorders: true,
  }));

  // Module 2: Bulk Products Table state
  const [bulkProducts, setBulkProducts] = useState(() => [
    {
      id: 'lbl-1',
      rowNumber: 1,
      productName: 'Toy Car Diecast Racing',
      sku: 'TOY-CAR-01',
      barcode: '8901234567890',
      mrp: 299,
      sellingPrice: 249,
      quantity: 5,
      variant: 'Red / 1:64 Scale',
      brand: 'Speedster Toys',
      weight: '120g',
      origin: 'India',
      selected: true,
      isValid: true,
      errors: [],
    },
    {
      id: 'lbl-2',
      rowNumber: 2,
      productName: 'Magnetic Building Blocks',
      sku: 'TOY-BLK-02',
      barcode: '8901234567891',
      mrp: 499,
      sellingPrice: 399,
      quantity: 3,
      variant: '64 Pieces Multi-Color',
      brand: 'SparkCraft',
      weight: '450g',
      origin: 'India',
      selected: true,
      isValid: true,
      errors: [],
    },
    {
      id: 'lbl-3',
      rowNumber: 3,
      productName: 'Programmable Toy Robot',
      sku: 'TOY-ROB-03',
      barcode: '8901234567892',
      mrp: 799,
      sellingPrice: 699,
      quantity: 2,
      variant: 'Blue / USB Rechargeable',
      brand: 'RoboKits',
      weight: '380g',
      origin: 'India',
      selected: true,
      isValid: true,
      errors: [],
    },
  ]);

  // Module 3: Automatic Sheet Layout state
  const [sheetConfig, setSheetConfig] = useState(() => ({
    paperFormatId: 'a4',
    customPaperWidthMm: 210,
    customPaperHeightMm: 297,
    orientation: 'portrait',
    selectedPresetId: 'a4-24up',
    labelWidthMm: 70,
    labelHeightMm: 36,
    cols: 3,
    rows: 8,
    marginTopMm: 4.5,
    marginBottomMm: 4.5,
    marginLeftMm: 0,
    marginRightMm: 0,
    gapXmm: 0,
    gapYmm: 0,
    showCutGuides: true,
    readingOrder: 'row-first',
    alignment: 'center',
  }));

  // Items sent to automatic sheet arrangement
  const [itemsToPrint, setItemsToPrint] = useState([]);

  // Modals state
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [isSavedDesignsOpen, setIsSavedDesignsOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);


  // Selected Category Template & Shape
  const [selectedTemplateId, setSelectedTemplateId] = useState('electronics');
  const [selectedShapeId, setSelectedShapeId] = useState('standard-rect');

  // Product Data
  const [name, setName] = useState('Wireless ANC Gaming Headset');
  const [sellingPrice, setSellingPrice] = useState(1999);
  const [mrp, setMrp] = useState(3999);
  const [sku, setSku] = useState('SKU-ELC-8921');
  const [description, setDescription] = useState('40mm Neodymium Drivers | 50h Battery | Low Latency');
  const [badgeText, setBadgeText] = useState('HOT DEAL');
  const [currency, setCurrency] = useState('INR');
  const [productLogo, setProductLogo] = useState(null);
  const [offerValidUntil, setOfferValidUntil] = useState('31 Dec 2026');

  // Embedded Code
  const [codeType, setCodeType] = useState('barcode'); // 'barcode' | 'qr' | 'none'

  // Styling custom overrides
  const [headerBg, setHeaderBg] = useState('#0284c7');
  const [headerText, setHeaderText] = useState('#ffffff');
  const [tagBg, setTagBg] = useState('#ffffff');
  const [borderColor, setBorderColor] = useState('#0284c7');
  const [borderStyle, setBorderStyle] = useState('solid'); // 'solid' | 'dashed' | 'double'
  const [priceColor, setPriceColor] = useState('#0369a1');
  const [badgeBg, setBadgeBg] = useState('#e0f2fe');
  const [badgeTextColor, setBadgeTextColor] = useState('#0369a1');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [cornerRadius, setCornerRadius] = useState(12);

  // Studio Interactive Viewport
  const [zoom, setZoom] = useState(1);
  const [is3dPerspective, setIs3dPerspective] = useState(false);

  // Sheet settings
  const [sheetCols, setSheetCols] = useState(2);
  const [sheetRows, setSheetRows] = useState(6);
  const [marginTopMm, setMarginTopMm] = useState(10);
  const [marginLeftMm, setMarginLeftMm] = useState(10);
  const [gapXmm, setGapXmm] = useState(4);
  const [gapYmm, setGapYmm] = useState(4);
  const [showCutGuides, setShowCutGuides] = useState(true);
  const [sheetMode, setSheetMode] = useState('repeat'); // 'repeat' | 'bulk'

  // Bulk state
  const [bulkInput, setBulkInput] = useState(
    'Wireless ANC Gaming Headset,1999,3999,SKU-ELC-8921,40mm Drivers | 50h Battery,50% OFF\n' +
    "Men's Heavyweight Cotton Tee,799,1499,TSH-OVR-L,100% Organic Cotton Size L,SALE\n" +
    'Organic Olive Oil 500ml,549,899,GRO-OIL-500,First Cold Press,SUPER SAVER\n' +
    'Magnetic Robotic Blocks,1299,2199,TOY-MAG-64,64 Pieces Ages 4+,BESTSELLER'
  );
  const [bulkItems, setBulkItems] = useState([]);

  // Refs
  const tagSvgRef = useRef(null);
  const barcodeCanvasRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const tagCardRef = useRef(null);
  const printSheetRef = useRef(null);

  // Discount & Savings auto calculation with strict validation
  const { discountPercent, savings, isInvalid: priceInvalid, error: priceError } = calculateDiscount(mrp, sellingPrice);
  const priceValidation = validatePriceInput(mrp, sellingPrice);

  const currentShape = TAG_SHAPES.find((s) => s.id === selectedShapeId) || TAG_SHAPES[0];
  const currencySymbol = CURRENCY_SYMBOLS.find((c) => c.id === currency)?.symbol || '₹';

  // Apply Brand Kit styles
  const handleApplyBrandKit = (kit) => {
    if (kit?.brandName) setName(kit.brandName);
    if (kit?.primaryColor) {
      setHeaderBg(kit.primaryColor);
      setPriceColor(kit.primaryColor);
      setBorderColor(kit.primaryColor);
    }
    if (kit?.fontFamily) setFontFamily(kit.fontFamily);
    if (kit?.logoUrl) setProductLogo(kit.logoUrl);
    toast.success('Applied Brand Kit styles to price tag!');
  };

  // Save design to project management
  const handleSaveDesign = async () => {
    playClickSound();
    try {
      const canvas = await renderTagToCanvas(2);
      const previewDataUrl = canvas.toDataURL('image/png');
      saveDesign({
        tool: 'price-tag',
        name: `${name || 'Price Tag'} (${sku || 'SKU'})`,
        state: {
          selectedTemplateId,
          selectedShapeId,
          name,
          sellingPrice,
          mrp,
          sku,
          description,
          badgeText,
          currency,
          productLogo,
          codeType,
          headerBg,
          headerText,
          tagBg,
          borderColor,
          borderStyle,
          priceColor,
          badgeBg,
          badgeTextColor,
          fontFamily,
          cornerRadius,
        },
        previewDataUrl,
      });
      toast.success('Price tag saved to your Projects!');
    } catch {
      toast.error('Failed to save price tag design');
    }
  };

  // Load saved design
  const handleLoadSavedDesign = (design) => {
    if (design?.state) {
      const s = design.state;
      if (s.name !== undefined) setName(s.name);
      if (s.sellingPrice !== undefined) setSellingPrice(s.sellingPrice);
      if (s.mrp !== undefined) setMrp(s.mrp);
      if (s.sku !== undefined) setSku(s.sku);
      if (s.description !== undefined) setDescription(s.description);
      if (s.badgeText !== undefined) setBadgeText(s.badgeText);
      if (s.currency !== undefined) setCurrency(s.currency);
      if (s.headerBg) setHeaderBg(s.headerBg);
      if (s.headerText) setHeaderText(s.headerText);
      if (s.tagBg) setTagBg(s.tagBg);
      if (s.priceColor) setPriceColor(s.priceColor);
      if (s.borderColor) setBorderColor(s.borderColor);
      if (s.productLogo) setProductLogo(s.productLogo);
      toast.success(`Loaded design: ${design.name}`);
    }
  };

  // Download Sample CSV
  const handleDownloadSampleCsv = () => {
    playClickSound();
    downloadCsv(generatePriceTagSampleCsv(), 'price-tags-template.csv');
    toast.success('Downloaded sample CSV template');
  };

  // Apply template defaults

  const handleSelectTemplate = (templateId) => {
    playClickSound();
    setSelectedTemplateId(templateId);
    const tmpl = CATEGORY_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setHeaderBg(tmpl.theme.headerBg);
      setHeaderText(tmpl.theme.headerText);
      setTagBg(tmpl.theme.tagBg);
      setBorderColor(tmpl.theme.border);
      setPriceColor(tmpl.theme.priceColor);
      setBadgeBg(tmpl.theme.badgeBg);
      setBadgeTextColor(tmpl.theme.badgeText);
      setFontFamily(tmpl.theme.font);

      setName(tmpl.defaultProduct.name);
      setSellingPrice(tmpl.defaultProduct.sellingPrice);
      setMrp(tmpl.defaultProduct.mrp);
      setSku(tmpl.defaultProduct.sku);
      setDescription(tmpl.defaultProduct.description);
      setBadgeText(tmpl.defaultProduct.badge);
      setCurrency(tmpl.defaultProduct.currency || 'INR');
      toast.success(`Loaded ${tmpl.label} Template`);
    }
  };

  // Handle shape change
  const handleSelectShape = (shapeId) => {
    playClickSound();
    setSelectedShapeId(shapeId);
    const s = TAG_SHAPES.find((x) => x.id === shapeId);
    if (s) {
      setSheetCols(s.cols);
      setSheetRows(s.rows);
    }
  };

  // Generate embedded barcode or QR inside preview
  useEffect(() => {
    if (codeType === 'barcode' && barcodeCanvasRef.current) {
      try {
        JsBarcode(barcodeCanvasRef.current, String(sku || '123456789'), {
          format: 'CODE128',
          width: 1.2,
          height: 28,
          displayValue: true,
          fontSize: 9,
          margin: 0,
          background: 'transparent',
          lineColor: '#000000',
        });
      } catch (err) {
        console.warn('Barcode render error', err);
      }
    } else if (codeType === 'qr' && qrCanvasRef.current) {
      try {
        QRCode.toCanvas(qrCanvasRef.current, `SKU:${sku}|${name}|₹${sellingPrice}`, {
          width: 54,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        });
      } catch (err) {
        console.warn('QR render error', err);
      }
    }
  }, [codeType, sku, name, sellingPrice]);

  // Bulk parser
  useEffect(() => {
    setBulkItems(parseBulkPriceTagsCsv(bulkInput, currency));
  }, [bulkInput, currency]);

  // Logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setProductLogo(evt.target?.result);
      toast.success('Product logo loaded');
    };
    reader.readAsDataURL(file);
  };

  // Render tag to canvas helper
  const renderTagToCanvas = async (scale = 3) => {
    const widthPx = currentShape.widthMm * 3.78 * scale;
    const heightPx = currentShape.heightMm * 3.78 * scale;

    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = tagBg;
    ctx.beginPath();
    ctx.roundRect(0, 0, widthPx, heightPx, cornerRadius * scale);
    ctx.fill();

    // Border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 2 * scale;
    if (borderStyle === 'dashed') ctx.setLineDash([6 * scale, 3 * scale]);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Punch hole if hanging tag
    if (currentShape.hasHole) {
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.arc(widthPx / 2, 12 * scale, 5 * scale, 0, Math.PI * 2);
      ctx.fill();
    }

    // Header banner
    const headerHeight = 22 * scale;
    ctx.fillStyle = headerBg;
    ctx.fillRect(0, currentShape.hasHole ? 24 * scale : 0, widthPx, headerHeight);

    // Header title
    ctx.fillStyle = headerText;
    ctx.font = `bold ${9 * scale}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText(
      (badgeText || 'SPECIAL OFFER').toUpperCase(),
      widthPx / 2,
      (currentShape.hasHole ? 24 * scale : 0) + 14 * scale
    );

    // Product Name
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${10 * scale}px ${fontFamily}`;
    ctx.textAlign = 'center';
    const nameY = (currentShape.hasHole ? 54 : 32) * scale;
    ctx.fillText(name.slice(0, 32), widthPx / 2, nameY);

    // Prices
    const priceY = nameY + 22 * scale;
    ctx.fillStyle = priceColor;
    ctx.font = `900 ${16 * scale}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.fillText(`${currencySymbol}${sellingPrice.toLocaleString()}`, widthPx / 2, priceY);

    // MRP strike-through
    if (mrp && mrp > sellingPrice) {
      ctx.fillStyle = '#94a3b8';
      ctx.font = `${9 * scale}px ${fontFamily}`;
      const mrpText = `MRP: ${currencySymbol}${mrp.toLocaleString()}`;
      ctx.fillText(mrpText, widthPx / 2, priceY + 12 * scale);

      // Discount badge pill
      if (discountPercent > 0) {
        ctx.fillStyle = badgeBg;
        const badgeW = 60 * scale;
        const badgeH = 14 * scale;
        const badgeX = (widthPx - badgeW) / 2;
        const badgeY = priceY + 18 * scale;
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4 * scale);
        ctx.fill();

        ctx.fillStyle = badgeTextColor;
        ctx.font = `bold ${8 * scale}px ${fontFamily}`;
        ctx.fillText(`${discountPercent}% OFF`, widthPx / 2, badgeY + 10 * scale);
      }
    }

    // SKU
    ctx.fillStyle = '#64748b';
    ctx.font = `bold ${8 * scale}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(sku, widthPx / 2, heightPx - 10 * scale);

    return canvas;
  };

  // Export handlers
  const handleDownloadPng = async () => {
    playClickSound();
    try {
      const canvas = await renderTagToCanvas(4); // 4x scale for high DPI
      downloadCanvasAsPng(canvas, `price-tag-${sku || 'item'}.png`);
      toast.success('Downloaded high-res PNG price tag');
    } catch {
      toast.error('Failed to export PNG');
    }
  };

  const handleDownloadPdf = async () => {
    playClickSound();
    try {
      const canvas = await renderTagToCanvas(3);
      const dataUrl = canvas.toDataURL('image/png');
      exportSinglePdf({
        dataUrl,
        widthMm: currentShape.widthMm,
        heightMm: currentShape.heightMm,
        filename: `price-tag-${sku || 'item'}.pdf`,
      });
      toast.success('Downloaded print-ready PDF tag');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  const handleDownloadA4SheetPdf = async () => {
    playClickSound();
    try {
      const canvas = await renderTagToCanvas(2.5);
      const dataUrl = canvas.toDataURL('image/png');

      exportA4SheetPdf({
        items: dataUrl,
        itemWidthMm: currentShape.widthMm,
        itemHeightMm: currentShape.heightMm,
        rows: sheetRows,
        cols: sheetCols,
        marginTopMm,
        marginLeftMm,
        gapXmm,
        gapYmm,
        showCutGuides,
        filename: `a4-price-tags-${selectedShapeId}.pdf`,
      });
      toast.success('Exported A4 multi-tag sheet PDF!');
    } catch {
      toast.error('Failed to export A4 PDF');
    }
  };

  const handlePrint = () => {
    playClickSound();
    if (activeTab === 'sheet' && printSheetRef.current) {
      printHtmlElement(printSheetRef.current, 'A4 Sheet Price Tags');
    } else if (tagCardRef.current) {
      printHtmlElement(tagCardRef.current, `Price Tag - ${name}`);
    }
  };

  const handleDuplicate = () => {
    playClickSound();
    setName(`${name} (Copy)`);
    setSku(`${sku}-COPY`);
    toast.success('Duplicated design settings');
  };

  const handleReset = () => {
    playClickSound();
    handleSelectTemplate('electronics');
    toast.success('Reset to default design');
  };

  // Helper to render and download PNG from DOM element
  const handleDownloadElementPng = async (element, filename = 'label.png') => {
    if (!element) return;
    playClickSound();
    try {
      const canvas = await html2canvas(element, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
      downloadCanvasAsPng(canvas, filename);
      toast.success('Downloaded high-resolution PNG!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PNG');
    }
  };

  // Helper to render and download single PDF from DOM element
  const handleDownloadElementPdf = async (element, filename = 'label.pdf', widthMm = 60, heightMm = 40) => {
    if (!element) return;
    playClickSound();
    try {
      const canvas = await html2canvas(element, { scale: 3, backgroundColor: '#ffffff', useCORS: true });
      const dataUrl = canvas.toDataURL('image/png');
      exportSinglePdf({
        dataUrl,
        widthMm,
        heightMm,
        filename,
      });
      toast.success('Downloaded print-ready PDF!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export PDF');
    }
  };

  // Route items to Module 3 Sheet Layout Engine
  const handleSendToSheet = (itemOrItems, options = {}) => {
    playClickSound();
    const isArr = Array.isArray(itemOrItems);
    const rawItems = isArr ? itemOrItems : (itemOrItems ? [itemOrItems] : []);
    const firstItem = rawItems[0] || null;

    setItemsToPrint(rawItems);

    if (firstItem) {
      const w = firstItem.widthMm || options.labelWidthMm || sheetConfig.labelWidthMm || 70;
      const h = firstItem.heightMm || options.labelHeightMm || sheetConfig.labelHeightMm || 36;

      setSheetConfig((prev) => {
        const isLandscape = prev.orientation === 'landscape';
        const paperW = isLandscape ? 297 : 210;
        const paperH = isLandscape ? 210 : 297;
        const usableW = Math.max(10, paperW - (prev.marginLeftMm || 0) - (prev.marginRightMm || 0));
        const usableH = Math.max(10, paperH - (prev.marginTopMm || 0) - (prev.marginBottomMm || 0));
        const autoCols = Math.max(1, Math.floor((usableW + (prev.gapXmm || 0)) / (w + (prev.gapXmm || 0))));
        const autoRows = Math.max(1, Math.floor((usableH + (prev.gapYmm || 0)) / (h + (prev.gapYmm || 0))));

        return {
          ...prev,
          labelWidthMm: w,
          labelHeightMm: h,
          cols: autoCols,
          rows: autoRows,
          selectedPresetId: 'custom-grid',
          printQuantityMode: isArr && rawItems.length > 1 ? 'from-items' : 'fill-sheet',
        };
      });
    }

    setMainModule('sheet-arrangement');
    toast.success('Sent to Automatic Sheet Layout Engine (Auto-fitted to sheet)!');
  };

  return (
    <div className="space-y-4">
      {/* Tool Hero Header */}
      <ToolHeroHeader
        badge="RETAIL SUITE"
        category="Commerce & Retail"
        title="Customizable Price Tag & Shelf Talker Creator"
        description="Design professional retail price tags, shelf talkers, and apparel tags with automatic discount calculations, embedded barcodes, and A4 gang sheet printing."
        icon={Tag}
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
              title="Generate design settings using natural language prompt"
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
                if (kit?.brandName) setBadgeText(kit.brandName.toUpperCase());
                if (kit?.primaryColor) {
                  setHeaderBg(kit.primaryColor);
                  setBorderColor(kit.primaryColor);
                  setPriceColor(kit.primaryColor);
                }
                if (kit?.fontFamily) setFontFamily(kit.fontFamily);
                if (kit?.currency) setCurrency(kit.currency);
                toast.success('Applied Brand Kit styles to Price Tag!');
              }}
              className="btn-secondary py-1 px-2.5 text-xs font-semibold flex items-center gap-1.5 text-sky-500 hover:text-sky-400"
              title="Sync Colors, Brand & Currency from Brand Kit"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sync Brand</span>
            </button>

            <span className="text-[11px] font-semibold text-slate-400 mx-1 hidden sm:inline">|</span>

            <button
              type="button"
              onClick={handleDuplicate}
              className="btn-secondary py-1 px-2 text-xs flex items-center gap-1"
            >
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Duplicate</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary py-1 px-2 text-xs flex items-center gap-1 text-slate-500 hover:text-rose-500"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        }
      />

      {/* 4 Main Module Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/[0.08] pb-1 text-xs font-bold">
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setMainModule('price-tags');
          }}
          className={`py-2 px-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            mainModule === 'price-tags'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Price Tag Creator</span>
          <span className="text-[9px] font-mono px-1 rounded bg-sky-500/10 text-sky-500">
            2 Modes
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setMainModule('ecommerce-labels');
          }}
          className={`py-2 px-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            mainModule === 'ecommerce-labels'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4 text-emerald-500" />
          <span>E-Commerce Product Labels</span>
          <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            8 Types
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setMainModule('sheet-arrangement');
          }}
          className={`py-2 px-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            mainModule === 'sheet-arrangement'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Grid className="w-4 h-4 text-indigo-500" />
          <span>Automatic Sheet Layout & Print</span>
          <span className="text-[9px] font-mono px-1 rounded bg-indigo-500/10 text-indigo-500">
            Multi-Page
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClickSound();
            setMainModule('saved-templates');
          }}
          className={`py-2 px-3.5 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            mainModule === 'saved-templates'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-extrabold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Save className="w-4 h-4 text-amber-500" />
          <span>Saved Presets & Templates</span>
        </button>
      </div>

      {/* MODULE 1: PRICE TAG CREATOR */}
      {mainModule === 'price-tags' && (
        <div className="space-y-4">
          {/* Tag Type Selection (Module 1.A) */}
          <div className="bg-white dark:bg-[#0c1220] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
                Tag Type Selection:
              </span>
              <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-black/30 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setPriceTagMode('promotional');
                  }}
                  className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    priceTagMode === 'promotional'
                      ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🏷️ Promotional Price Tag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setPriceTagMode('regular-mrp');
                  }}
                  className={`px-3.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    priceTagMode === 'regular-mrp'
                      ? 'bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  🇮🇳 Regular MRP Price Tag
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {priceTagMode === 'promotional'
                ? 'Promotional tags with discount math, MRP strike-through & savings badge'
                : 'Independent statutory MRP tags without requiring discounts'}
            </div>
          </div>

          {/* If Regular MRP Tag Selected */}
          {priceTagMode === 'regular-mrp' && (
            <RegularMrpTagDesigner
              mrpState={mrpState}
              setMrpState={setMrpState}
              onApplyTemplate={(tmpl) => {
                setMrpState((prev) => ({
                  ...prev,
                  ...tmpl.defaults,
                  widthMm: tmpl.widthMm,
                  heightMm: tmpl.heightMm,
                  orientation: tmpl.orientation,
                  fontFamily: tmpl.fontFamily,
                  headerBg: tmpl.headerBg,
                  headerText: tmpl.headerText,
                  bg: tmpl.bg,
                  borderColor: tmpl.borderColor,
                  borderStyle: tmpl.borderStyle,
                  priceColor: tmpl.priceColor,
                  cornerRadius: tmpl.cornerRadius,
                  textAlign: tmpl.textAlign,
                  barcodePlacement: tmpl.barcodePlacement,
                  hasHole: tmpl.hasHole || false,
                }));
                toast.success(`Loaded ${tmpl.name} Template`);
              }}
              onPrintSingle={(el) => printHtmlElement(el, mrpState.name)}
              onDownloadPng={(el) => handleDownloadElementPng(el, `mrp-tag-${mrpState.sku || 'item'}.png`)}
              onDownloadPdf={(el) => handleDownloadElementPdf(el, `mrp-tag-${mrpState.sku || 'item'}.pdf`, mrpState.widthMm, mrpState.heightMm)}
              onSendToSheet={() => handleSendToSheet(mrpState)}
            />
          )}

          {/* If Promotional Tag Selected: Sub-Tabs & Category Bar */}
          {priceTagMode === 'promotional' && (
            <div className="space-y-4">
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
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>Price Tag Designer</span>
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
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Bulk Price Tags (CSV)</span>
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
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>A4 Sheet Print Preview</span>
                </button>
              </div>

              {/* Category Templates Bar */}
              <div className="bg-white dark:bg-[#0c1220] p-3 sm:p-3.5 rounded-xl space-y-2 border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      Retail Category Templates ({CATEGORY_TEMPLATES.length})
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">1-Click Industry Styles</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                  {CATEGORY_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tmpl.id)}
                className={`p-2.5 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between gap-1.5 cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/15 shadow-xs ring-1 ring-sky-500'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#0e1628] hover:border-slate-300 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-[#131d35]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: tmpl.theme.headerBg }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: tmpl.theme.tagBg }}
                  />
                </div>
                <div>
                  <span className={`text-xs font-semibold block leading-tight ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {tmpl.label}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5 block truncate font-normal">
                    {tmpl.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: Single Designer */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Panel: Inputs (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-4 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-500" />
                  Product & Pricing Details
                </span>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">
                  {discountPercent > 0 ? `${discountPercent}% Discount` : 'Full Price'}
                </span>
              </div>

              {/* Tag Shape Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tag Shape & Dimensions
                </label>
                <select
                  value={selectedShapeId}
                  onChange={(e) => handleSelectShape(e.target.value)}
                  className="w-full text-xs font-semibold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  {TAG_SHAPES.map((shape) => (
                    <option key={shape.id} value={shape.id}>
                      {shape.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Name */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Wireless ANC Gaming Headset"
                  className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              {/* Price Row: Selling Price, MRP, Currency */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  >
                    {CURRENCY_SYMBOLS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block mb-1">
                    Selling Price*
                  </label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-bold p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">MRP / Original</label>
                  <input
                    type="number"
                    value={mrp}
                    onChange={(e) => setMrp(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono text-slate-500"
                  />
                </div>
              </div>

              {/* Savings callout pill or price validation error */}
              {priceInvalid ? (
                <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{priceError || 'Selling price cannot exceed MRP.'}</span>
                </div>
              ) : discountPercent > 0 ? (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                  <span className="font-bold">Auto Calculated: {discountPercent}% OFF</span>
                  <span>Save {formatCurrency(savings, currency)}</span>
                </div>
              ) : null}

              {/* SKU & Offer Badge */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">SKU / Code</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    placeholder="SKU-8921"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Offer Badge Text</label>
                  <input
                    type="text"
                    value={badgeText}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    placeholder="HOT DEAL"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">
                  Description / Specifications
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  placeholder="Features, material, size..."
                />
              </div>

              {/* Offer Validity Date */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">
                  Offer Validity Date
                </label>
                <input
                  type="text"
                  value={offerValidUntil}
                  onChange={(e) => setOfferValidUntil(e.target.value)}
                  placeholder="e.g. 31 Dec 2026 or Limited Stock"
                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              {/* Embedded Code Type (Barcode vs QR vs None) */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06]">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Embedded Machine Code on Tag
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setCodeType('barcode')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border ${
                      codeType === 'barcode'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <BarcodeIcon className="w-3.5 h-3.5" />
                    <span>Barcode</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodeType('qr')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border ${
                      codeType === 'qr'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>QR Code</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCodeType('none')}
                    className={`p-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border ${
                      codeType === 'none'
                        ? 'border-sky-500 bg-sky-500/10 text-sky-600 dark:text-sky-400'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>None</span>
                  </button>
                </div>
              </div>

              {/* Product Logo / Image Upload */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Product Logo / Icon
                  </span>
                  <span className="text-[10px] text-slate-400">Optional brand graphic</span>
                </div>
                <div className="flex items-center gap-2">
                  {productLogo && (
                    <button
                      type="button"
                      onClick={() => setProductLogo(null)}
                      className="p-1 text-rose-500 hover:text-rose-600"
                      title="Remove Logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <label className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 cursor-pointer">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{productLogo ? 'Change' : 'Upload'}</span>
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Visual Styling Palettes */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Color & Border Customizer
                </span>
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <div>
                    <label className="text-slate-400 block mb-0.5">Header</label>
                    <input
                      type="color"
                      value={headerBg}
                      onChange={(e) => setHeaderBg(e.target.value)}
                      className="w-full h-6 rounded cursor-pointer border"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Border</label>
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-full h-6 rounded cursor-pointer border"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Price</label>
                    <input
                      type="color"
                      value={priceColor}
                      onChange={(e) => setPriceColor(e.target.value)}
                      className="w-full h-6 rounded cursor-pointer border"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Background</label>
                    <input
                      type="color"
                      value={tagBg}
                      onChange={(e) => setTagBg(e.target.value)}
                      className="w-full h-6 rounded cursor-pointer border"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Live Tag Preview & Actions (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Live Interactive Tag Canvas */}
            <div className="studio-desk-stage p-6 rounded-2xl flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
              {/* Floating Stage Controls */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-20">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 backdrop-blur-md shadow-xs">
                    {(currentShape.label || 'STANDARD TAG').toUpperCase()}
                  </span>
                  <span className="hidden sm:inline-flex text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/50 dark:bg-white/[0.06] text-slate-600 dark:text-slate-400">
                    Live Vector Canvas
                  </span>
                </div>

                <div className="flex items-center gap-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-full border border-slate-200/60 dark:border-white/10 shadow-xs">
                  {/* 3D Isometric View */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setIs3dPerspective(!is3dPerspective);
                    }}
                    className={`flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full transition-all ${
                      is3dPerspective
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title="Toggle 3D isometric perspective view"
                  >
                    <Box className="w-3 h-3" />
                    <span>3D</span>
                  </button>

                  <div className="w-px h-3 bg-slate-200 dark:bg-white/10 mx-0.5" />

                  {/* Zoom Controls */}
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(1))))}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 min-w-[32px] text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(1.6, Number((z + 0.1).toFixed(1))))}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Physical Tag Card Container with Zoom and 3D Perspective */}
              <div className="pt-8 pb-4 flex justify-center items-center w-full overflow-visible">
                <div
                  ref={tagCardRef}
                  style={{
                    width: `${currentShape.widthMm * 4.2}px`,
                    minHeight: `${currentShape.heightMm * 4.2}px`,
                    backgroundColor: tagBg,
                    borderColor: borderColor,
                    borderStyle: borderStyle,
                    borderRadius: `${cornerRadius}px`,
                    fontFamily: fontFamily,
                    transform: is3dPerspective
                      ? `perspective(1000px) rotateX(14deg) rotateY(-8deg) rotateZ(1deg) scale(${zoom})`
                      : `scale(${zoom})`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className="relative studio-card-3d border-2 flex flex-col justify-between overflow-hidden select-none my-4 text-slate-900"
                >
                  {/* Punch hole if hanging tag with metallic brass eyelet + twine */}
                  {currentShape.hasHole && (
                    <div className="w-full flex flex-col items-center pt-2 relative z-10">
                      {/* Craft twine loop */}
                      <div className="w-1 h-5 bg-gradient-to-b from-amber-800/50 to-amber-700/80 rounded-full -mt-5 shadow-xs" />
                      {/* Metallic Brass Eyelet */}
                      <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-600 via-amber-300 to-amber-500 p-[2.5px] shadow-md flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-slate-900/80 dark:bg-slate-950 border border-amber-400/40 shadow-inner" />
                      </div>
                    </div>
                  )}

                  {/* Tag Header Banner */}
                  <div
                    style={{ backgroundColor: headerBg, color: headerText }}
                    className="px-3.5 py-2 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase font-mono shadow-xs"
                  >
                    <div className="flex items-center gap-1.5">
                      {productLogo && (
                        <img src={productLogo} alt="Logo" className="w-3.5 h-3.5 object-contain rounded" />
                      )}
                      <span>{badgeText || 'SPECIAL OFFER'}</span>
                    </div>
                    {discountPercent > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[9px] font-extrabold tracking-tight">
                        {discountPercent}% OFF
                      </span>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-2.5">
                    {/* Product title */}
                    <div>
                      <h4 className="font-extrabold text-sm leading-tight text-slate-900 dark:text-slate-900 line-clamp-2">
                        {name}
                      </h4>
                      {description && (
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5 leading-snug">
                          {description}
                        </p>
                      )}
                      {offerValidUntil && (
                        <p className="text-[9px] font-mono text-amber-600 dark:text-amber-500 font-semibold mt-0.5">
                          Offer Valid: {offerValidUntil}
                        </p>
                      )}
                    </div>

                    {/* Pricing Block */}
                    <div className="flex items-baseline justify-between py-1.5 border-t border-b border-slate-200/70">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">
                          OFFER PRICE
                        </span>
                        <span
                          style={{ color: priceColor }}
                          className="text-xl font-black tracking-tight"
                        >
                          {currencySymbol}{sellingPrice.toLocaleString()}
                        </span>
                      </div>

                      {mrp && mrp > sellingPrice && (
                        <div className="text-right">
                          <span className="text-[9px] uppercase text-slate-400 block font-mono">MRP</span>
                          <span className="text-xs text-slate-400 line-through font-semibold">
                            {currencySymbol}{mrp.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Embedded Barcode or QR Code */}
                    <div className="flex items-center justify-between pt-1">
                      {codeType === 'barcode' && (
                        <div className="w-full flex flex-col items-center">
                          <canvas ref={barcodeCanvasRef} className="max-w-full" />
                        </div>
                      )}

                      {codeType === 'qr' && (
                        <div className="w-full flex items-center justify-between gap-2">
                          <canvas ref={qrCanvasRef} className="w-12 h-12" />
                          <div className="text-right text-[9px] font-mono text-slate-500">
                            <div>SKU: {sku}</div>
                            <div className="text-emerald-600 font-bold">SCAN TO VERIFY</div>
                          </div>
                        </div>
                      )}

                      {codeType === 'none' && (
                        <div className="w-full flex items-center justify-between text-[10px] font-mono text-slate-500">
                          <span>SKU: {sku}</span>
                          <span className="text-emerald-600 font-bold">100% GENUINE</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Signature Studio Export Hub */}
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Signature Studio Export Hub
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      CMYK print-ready vector PDF, 300 DPI high-res raster, and A4 gang sheets
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  300 DPI READY
                </span>
              </div>

              {/* Primary Download CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="btn-primary btn-shimmer flex items-center justify-center gap-2 py-2.5 text-xs font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Res PNG (300 DPI)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadA4SheetPdf}
                  className="btn-primary bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20 flex items-center justify-center gap-2 py-2.5 text-xs font-bold"
                >
                  <Grid className="w-4 h-4" />
                  <span>Download A4 Sheet PDF ({sheetCols * sheetRows} Tags)</span>
                </button>
              </div>

              {/* Secondary Actions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="btn-secondary flex items-center justify-center gap-1.5 py-2 text-xs"
                >
                  <Tag className="w-3.5 h-3.5 text-sky-500" />
                  <span>Single Tag PDF</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="btn-secondary flex items-center justify-center gap-1.5 py-2 text-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Direct Print</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActiveTab('sheet');
                  }}
                  className="btn-secondary flex items-center justify-center gap-1.5 py-2 text-xs"
                >
                  <Grid className="w-3.5 h-3.5 text-purple-500" />
                  <span>Sheet Config</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDesign}
                  className="btn-secondary flex items-center justify-center gap-1.5 py-2 text-xs text-indigo-500 hover:text-indigo-400"
                  title="Save price tag design to Projects"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Project</span>
                </button>
              </div>

              {/* A4 Quick Layout Callout */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-sky-500" />
                    Gang Sheet: {sheetCols * sheetRows} Tags per A4 Page
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Auto-arranged grid ({currentShape.widthMm}×{currentShape.heightMm}mm) with crop marks and customizable gutters.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActiveTab('sheet');
                  }}
                  className="text-xs text-sky-500 hover:text-sky-400 font-bold whitespace-nowrap"
                >
                  Configure Margins →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Bulk Price Tags */}
      {activeTab === 'bulk' && (
        <div className="glass-panel p-4 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-sky-500" />
                Bulk Price Tag Generator from CSV
              </h3>
              <p className="text-xs text-slate-500">
                Paste CSV data (Name, SellingPrice, MRP, SKU, Specs, Badge) to generate batches of retail shelf tags.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSampleCsv}
                className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5"
                title="Download Sample CSV Template"
              >
                <Download className="w-3.5 h-3.5 text-sky-500" />
                <span>Sample CSV</span>
              </button>
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
                <span>Print All Bulk Tags on A4</span>
              </button>
            </div>
          </div>

          <textarea
            rows={5}
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          />

          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-white/[0.04] text-slate-500 font-mono text-[10px] uppercase">
                <tr>
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Product Name</th>
                  <th className="p-2.5">Selling Price</th>
                  <th className="p-2.5">MRP</th>
                  <th className="p-2.5">Discount</th>
                  <th className="p-2.5">SKU</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                {bulkItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                    <td className="p-2.5 font-mono text-slate-400">{idx + 1}</td>
                    <td className="p-2.5 font-bold text-slate-900 dark:text-white">{item.name}</td>
                    <td className="p-2.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {currencySymbol}{item.sellingPrice.toLocaleString()}
                    </td>
                    <td className="p-2.5 text-slate-400 line-through font-mono">
                      {currencySymbol}{item.mrp.toLocaleString()}
                    </td>
                    <td className="p-2.5">
                      {item.discountPercent > 0 ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                          {item.discountPercent}% OFF
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="p-2.5 font-mono text-slate-500">{item.sku}</td>
                    <td className="p-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          playClickSound();
                          setName(item.name);
                          setSellingPrice(item.sellingPrice);
                          setMrp(item.mrp);
                          setSku(item.sku);
                          setDescription(item.description);
                          setBadgeText(item.badge);
                          setActiveTab('single');
                        }}
                        className="text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                      >
                        Edit in Designer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: A4 Sheet Print Preview */}
      {activeTab === 'sheet' && (
        <div className="glass-panel p-4 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-sky-500" />
                A4 Gang Sheet Layout & Print Settings
              </h3>
              <p className="text-xs text-slate-500">
                Fit {sheetCols * sheetRows} tags per A4 page ({currentShape.widthMm}×{currentShape.heightMm}mm) with cutting marks.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-500" />
                <span>Print Page</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadA4SheetPdf}
                className="btn-primary py-1.5 px-3 text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export A4 PDF</span>
              </button>
            </div>
          </div>

          {/* Grid settings */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06]">
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Columns
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={sheetCols}
                onChange={(e) => setSheetCols(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Rows
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={sheetRows}
                onChange={(e) => setSheetRows(parseInt(e.target.value, 10) || 1)}
                className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Margin Top (mm)
              </label>
              <input
                type="number"
                value={marginTopMm}
                onChange={(e) => setMarginTopMm(parseInt(e.target.value, 10) || 0)}
                className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Margin Left (mm)
              </label>
              <input
                type="number"
                value={marginLeftMm}
                onChange={(e) => setMarginLeftMm(parseInt(e.target.value, 10) || 0)}
                className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Gap X (mm)
              </label>
              <input
                type="number"
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
                value={gapYmm}
                onChange={(e) => setGapYmm(parseInt(e.target.value, 10) || 0)}
                className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>
          </div>

          {/* Mode switch */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Sheet Fill Mode:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="priceSheetMode"
                  value="repeat"
                  checked={sheetMode === 'repeat'}
                  onChange={() => setSheetMode('repeat')}
                />
                <span>Repeat Current Design ({name.slice(0, 20)}...)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="priceSheetMode"
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
              <span>Dashed Scissor Cut Guides</span>
            </label>
          </div>

          {/* Visual Paper Preview */}
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
                  gridTemplateColumns: `repeat(${sheetCols}, ${currentShape.widthMm}mm)`,
                  gridAutoRows: `${currentShape.heightMm}mm`,
                  columnGap: `${gapXmm}mm`,
                  rowGap: `${gapYmm}mm`,
                }}
              >
                {Array.from({ length: sheetCols * sheetRows }).map((_, index) => {
                  const item = sheetMode === 'bulk' && bulkItems[index]
                    ? bulkItems[index]
                    : { name, sellingPrice, mrp, sku, badge: badgeText };

                  return (
                    <div
                      key={index}
                      style={{
                        border: showCutGuides ? '1px dashed #cbd5e1' : '1px solid transparent',
                        padding: '2mm',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        textAlign: 'center',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ backgroundColor: headerBg, color: headerText, fontSize: '7px', fontWeight: 'bold', padding: '1mm' }}>
                        {item.badge || 'OFFER'}
                      </div>
                      <div style={{ fontSize: '8px', fontWeight: 'bold', lineHeight: '1.1' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '11px', fontWeight: '900', color: priceColor }}>
                        {currencySymbol}{item.sellingPrice.toLocaleString()}
                      </div>
                      <div style={{ fontSize: '7px', color: '#64748b', fontFamily: 'monospace' }}>
                        {item.sku}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
            </div>
          )}
        </div>
      )}

      {/* MODULE 2: E-COMMERCE LABELS */}
      {mainModule === 'ecommerce-labels' && (
        <EcommerceLabelsModule
          labelState={ecommerceLabelState}
          setLabelState={setEcommerceLabelState}
          bulkProducts={bulkProducts}
          setBulkProducts={setBulkProducts}
          onPrintSingle={(el) => printHtmlElement(el, ecommerceLabelState.productName)}
          onDownloadPng={(el) =>
            handleDownloadElementPng(el, `ecommerce-label-${ecommerceLabelState.sku || 'item'}.png`)
          }
          onDownloadPdf={(el) =>
            handleDownloadElementPdf(
              el,
              `ecommerce-label-${ecommerceLabelState.sku || 'item'}.pdf`,
              ecommerceLabelState.widthMm,
              ecommerceLabelState.heightMm
            )
          }
          onSendBulkToSheet={(items) => handleSendToSheet(items)}
        />
      )}

      {/* MODULE 3 & 4: AUTOMATIC SHEET ARRANGEMENT & PRINT */}
      {mainModule === 'sheet-arrangement' && (
        <SheetLayoutModule
          sheetConfig={sheetConfig}
          setSheetConfig={setSheetConfig}
          itemsToPrint={itemsToPrint.length > 0 ? itemsToPrint : [mrpState]}
          fallbackItem={{
            name: mrpState.name || name,
            sku: mrpState.sku || sku,
            mrp: mrpState.mrp || mrp,
            sellingPrice: mrpState.sellingPrice || sellingPrice,
            brand: mrpState.brand,
            variant: mrpState.variant,
            packSize: mrpState.packSize,
            customText: mrpState.customText,
            barcodeValue: mrpState.barcodeValue || sku,
            codeType: mrpState.codeType || 'barcode',
            headerBg: mrpState.headerBg || '#0f172a',
            headerText: mrpState.headerText || 'MAXIMUM RETAIL PRICE',
            bg: mrpState.bg || '#ffffff',
            borderColor: mrpState.borderColor || '#e2e8f0',
            borderStyle: mrpState.borderStyle || 'solid',
            fontFamily: mrpState.fontFamily || 'sans-serif',
          }}
        />
      )}

      {/* MODULE 4.C: SAVED TEMPLATES & PRESETS */}
      {mainModule === 'saved-templates' && (
        <SavedTemplatesManager
          currentDesign={{
            mrpState,
            ecommerceLabelState,
            promotional: {
              name,
              sellingPrice,
              mrp,
              sku,
              selectedTemplateId,
              selectedShapeId,
            },
          }}
          currentSheetConfig={sheetConfig}
          onLoadTemplate={(data) => {
            if (data.mrpState) setMrpState(data.mrpState);
            if (data.ecommerceLabelState) setEcommerceLabelState(data.ecommerceLabelState);
            if (data.promotional) {
              setName(data.promotional.name);
              setSellingPrice(data.promotional.sellingPrice);
              setMrp(data.promotional.mrp);
              setSku(data.promotional.sku);
            }
          }}
          onLoadSheetConfig={(cfg) => setSheetConfig(cfg)}
        />
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
        currentTool="price-tag"
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
          setName(prod.name);
          setSellingPrice(prod.sellingPrice);
          setMrp(prod.mrp);
          setSku(prod.sku);
          if (prod.description) setDescription(prod.description);
          if (prod.currency) setCurrency(prod.currency);
          toast.success(`Imported ${prod.name} (${prod.sku}) to Price Tag!`);
        }}
      />

      {/* AI Prompt Assistant Modal */}
      <AiDesignAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentTool="price-tag"
        onApplyDesign={(aiResult) => {
          if (aiResult.productName) setName(aiResult.productName);
          if (aiResult.sellingPrice) setSellingPrice(aiResult.sellingPrice);
          if (aiResult.mrp) setMrp(aiResult.mrp);
          if (aiResult.sku) setSku(aiResult.sku);
          if (aiResult.badgeText) setBadgeText(aiResult.badgeText);
          if (aiResult.currency) setCurrency(aiResult.currency);
          if (aiResult.recommendedThemeId) handleSelectTemplate(aiResult.recommendedThemeId);
          if (aiResult.recommendedShapeId) setSelectedShapeId(aiResult.recommendedShapeId);
          toast.success('Applied AI design recommendations to Price Tag!');
        }}
      />
    </div>
  );
}
