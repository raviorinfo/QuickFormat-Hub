import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Heart,
  Download,
  Printer,
  Copy,
  Sparkles,
  Upload,
  RefreshCw,
  Sliders,
  Layers,
  Grid,
  RotateCw,
  QrCode,
  Image as ImageIcon,
  MessageSquare,
  Gift,
  CheckCircle2,
  Trash2,
  Tag,
  Scissors,
  Save,
  FolderOpen,
  Palette,
  ShieldCheck,
  FileSpreadsheet,
  ZoomIn,
  ZoomOut,
  Box,
  Ticket,
  Package
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { playClickSound } from '../../utils/audioFeedback';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import BrandKitModal from '../common/BrandKitModal';
import SavedDesignsModal from '../common/SavedDesignsModal';
import ProductLabelStudioModal from '../common/ProductLabelStudioModal';
import CouponManagerModal from '../common/CouponManagerModal';
import ProductCatalogModal from '../common/ProductCatalogModal';
import AiDesignAssistantModal from '../common/AiDesignAssistantModal';
import {
  CARD_SIZES,
  THANK_YOU_TEMPLATES,
  MESSAGE_SUGGESTIONS,
  getCardPrintDimensions,
  generateCardPersonalizationSampleCsv,
  parseCardPersonalizationCsv,
  PRIVACY_SAFEGUARDS_NOTICE,
} from '../../utils/thankYouCardUtils';
import {
  downloadCanvasAsPng,
  downloadSvg,
  downloadCsv,
  exportSinglePdf,
  exportSinglePdfWithBleed,
  exportDualSidedPdfWithBleed,
  exportA4SheetPdf,
  printHtmlElement,
} from '../../utils/exportUtils';
import { getSavedBrandKit } from '../../utils/brandKitUtils';
import { saveDesign } from '../../utils/savedDesignsUtils';
import QRCode from 'qrcode';

export function ThankYouCardMakerTool() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'sheet' | 'personalize'
  const [activeSide, setActiveSide] = useState('front'); // 'front' | 'back'

  // Modals state
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [isSavedDesignsOpen, setIsSavedDesignsOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isCatalogOpen, setIsCatalogOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Print Bleed option
  const [usePrintBleed, setUsePrintBleed] = useState(true);

  // Studio Viewport Controls
  const [zoom, setZoom] = useState(1);
  const [is3dPerspective, setIs3dPerspective] = useState(false);
  const [showBleedGuides, setShowBleedGuides] = useState(false);

  // Bulk Personalization state
  const [personalizationCsv, setPersonalizationCsv] = useState(
    'Customer Name,Order ID,Special Note,Coupon Code\n' +
    'Priya Sharma,#QF-10821,Thank you for ordering our artisan honey!,SWEET15\n' +
    'Rahul Verma,#QF-10822,Your custom leather journal is ready to ship.,JOURNAL10\n' +
    'Ananya Iyer,#QF-10823,Hope you adore your handcrafted silver earrings!,SILVER20'
  );
  const [personalizationRows, setPersonalizationRows] = useState([]);


  // Template and Size
  const [selectedTemplateId, setSelectedTemplateId] = useState('minimal-modern');
  const [selectedSizeId, setSelectedSizeId] = useState('business-card');

  // Content State - Front Side
  const [brandName, setBrandName] = useState('STUDIO ESSENTIALS');
  const [headline, setHeadline] = useState('Thank You For Your Order!');
  const [message, setMessage] = useState(
    'Every time you choose to support our small brand, a real creator does a happy dance. We hope this package brings warmth and joy to your doorstep.'
  );
  const [couponCode, setCouponCode] = useState('THANKYOU10');
  const [couponText, setCouponText] = useState('Enjoy 10% off your next purchase with code');
  const [website, setWebsite] = useState('www.studioessentials.com');
  const [social, setSocial] = useState('@studioessentials');
  const [showQr, setShowQr] = useState(true);
  const [qrUrl, setQrUrl] = useState('https://studioessentials.com');
  const [logoUrl, setLogoUrl] = useState(null);

  // Content State - Back Side
  const [backHeadline, setBackHeadline] = useState('A Few Ways to Stay Connected');
  const [backMessage, setBackMessage] = useState(
    '1. Follow us on Instagram for weekly launches.\n2. Tag #StudioEssentials to be featured.\n3. Have questions? Reach out to support@studioessentials.com anytime!'
  );
  const [backFootnote, setBackFootnote] = useState('Handcrafted with care & sustainably packaged.');

  // Styling Customization
  const [bg, setBg] = useState('#ffffff');
  const [textColor, setTextColor] = useState('#0f172a');
  const [subTextColor, setSubTextColor] = useState('#475569');
  const [accentColor, setAccentColor] = useState('#0284c7');
  const [borderColor, setBorderColor] = useState('#e2e8f0');
  const [couponBg, setCouponBg] = useState('#f8fafc');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [showCropMarks, setShowCropMarks] = useState(false);
  const [cornerRadius, setCornerRadius] = useState(12);

  // Sheet layout
  const [sheetCols, setSheetCols] = useState(2);
  const [sheetRows, setSheetRows] = useState(5);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Refs
  const cardContainerRef = useRef(null);
  const qrCanvasRef = useRef(null);
  const printSheetRef = useRef(null);

  const currentSize = CARD_SIZES.find((s) => s.id === selectedSizeId) || CARD_SIZES[0];

  // Commercial print metrics (3mm bleed & 5mm safe zone)
  const printMetrics = useMemo(() => {
    return getCardPrintDimensions(currentSize.widthMm, currentSize.heightMm, usePrintBleed ? 3 : 0);
  }, [currentSize, usePrintBleed]);

  // Parse bulk personalization rows
  useEffect(() => {
    setPersonalizationRows(parseCardPersonalizationCsv(personalizationCsv));
  }, [personalizationCsv]);

  // Brand Kit Applier
  const handleApplyBrandKit = (kit) => {
    if (kit?.brandName) setBrandName(kit.brandName);
    if (kit?.primaryColor) setAccentColor(kit.primaryColor);
    if (kit?.fontFamily) setFontFamily(kit.fontFamily);
    if (kit?.website) setWebsite(kit.website);
    if (kit?.social) setSocial(kit.social);
    if (kit?.logoUrl) setLogoUrl(kit.logoUrl);
    if (kit?.website) setQrUrl(kit.website);
    toast.success('Applied Brand Kit styles to Thank You Card!');
  };

  // Save Design
  const handleSaveDesign = async () => {
    playClickSound();
    try {
      const canvas = await renderCardToCanvas('front', 2);
      const previewDataUrl = canvas.toDataURL('image/png');
      saveDesign({
        tool: 'thank-you-card',
        name: `Card: ${brandName || 'Store'} (${currentSize.label.split(' ')[0]})`,
        state: {
          selectedTemplateId,
          selectedSizeId,
          brandName,
          headline,
          message,
          couponCode,
          couponText,
          website,
          social,
          showQr,
          qrUrl,
          logoUrl,
          backHeadline,
          backMessage,
          backFootnote,
          bg,
          textColor,
          subTextColor,
          accentColor,
          borderColor,
          couponBg,
          fontFamily,
          showCropMarks,
          cornerRadius,
          usePrintBleed,
        },
        previewDataUrl,
      });
      toast.success('Thank You Card design saved to Projects!');
    } catch {
      toast.error('Failed to save card design');
    }
  };

  // Load Saved Design
  const handleLoadSavedDesign = (design) => {
    if (design?.state) {
      const s = design.state;
      if (s.brandName !== undefined) setBrandName(s.brandName);
      if (s.headline !== undefined) setHeadline(s.headline);
      if (s.message !== undefined) setMessage(s.message);
      if (s.couponCode !== undefined) setCouponCode(s.couponCode);
      if (s.website !== undefined) setWebsite(s.website);
      if (s.social !== undefined) setSocial(s.social);
      if (s.accentColor) setAccentColor(s.accentColor);
      if (s.bg) setBg(s.bg);
      if (s.textColor) setTextColor(s.textColor);
      if (s.subTextColor) setSubTextColor(s.subTextColor);
      if (s.logoUrl !== undefined) setLogoUrl(s.logoUrl);
      toast.success(`Loaded card design: ${design.name}`);
    }
  };

  // Download PDF with Bleed & Crop Marks
  const handleDownloadPdfWithBleed = async () => {
    playClickSound();
    try {
      const canvas = await renderCardToCanvas(activeSide, 3);
      const dataUrl = canvas.toDataURL('image/png');
      exportSinglePdfWithBleed({
        dataUrl,
        widthMm: currentSize.widthMm,
        heightMm: currentSize.heightMm,
        bleedMm: usePrintBleed ? 3 : 0,
        showCropMarks: true,
        filename: `thank-you-card-${activeSide}-printbleed.pdf`,
      });
      toast.success('Downloaded commercial print PDF with 3mm bleed & crop marks!');
    } catch {
      toast.error('Failed to generate PDF with bleed');
    }
  };

  // Download Sample Personalization CSV
  const handleDownloadPersonalizationSampleCsv = () => {
    playClickSound();
    downloadCsv(generateCardPersonalizationSampleCsv(), 'card-personalization-template.csv');
    toast.success('Downloaded personalization sample CSV');
  };

  // Apply template

  const handleSelectTemplate = (templateId) => {
    playClickSound();
    setSelectedTemplateId(templateId);
    const tmpl = THANK_YOU_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setBg(tmpl.theme.bg);
      setTextColor(tmpl.theme.textColor);
      setSubTextColor(tmpl.theme.subTextColor);
      setAccentColor(tmpl.theme.accentColor);
      setBorderColor(tmpl.theme.borderColor);
      setCouponBg(tmpl.theme.couponBg);
      setFontFamily(tmpl.theme.font);

      setBrandName(tmpl.defaultFront.brandName);
      setHeadline(tmpl.defaultFront.headline);
      setMessage(tmpl.defaultFront.message);
      setCouponCode(tmpl.defaultFront.couponCode);
      setCouponText(tmpl.defaultFront.couponText);
      setWebsite(tmpl.defaultFront.website);
      setSocial(tmpl.defaultFront.social);
      setShowQr(tmpl.defaultFront.showQr);
      setQrUrl(tmpl.defaultFront.qrUrl);

      setBackHeadline(tmpl.defaultBack.headline);
      setBackMessage(tmpl.defaultBack.message);
      setBackFootnote(tmpl.defaultBack.footnote);
      toast.success(`Loaded ${tmpl.label} Template`);
    }
  };

  // Handle size change
  const handleSelectSize = (sizeId) => {
    playClickSound();
    setSelectedSizeId(sizeId);
    const s = CARD_SIZES.find((x) => x.id === sizeId);
    if (s) {
      setSheetCols(s.a4Cols);
      setSheetRows(s.a4Rows);
    }
  };

  // Embedded QR generator
  useEffect(() => {
    if (showQr && qrCanvasRef.current && qrUrl) {
      QRCode.toCanvas(qrCanvasRef.current, qrUrl, {
        width: 64,
        margin: 1,
        color: { dark: textColor, light: bg },
      }).catch((err) => console.warn('QR error:', err));
    }
  }, [showQr, qrUrl, textColor, bg, activeSide]);

  // Handle Logo Upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setLogoUrl(evt.target?.result);
      toast.success('Logo uploaded');
    };
    reader.readAsDataURL(file);
  };

  // Render card to Canvas
  const renderCardToCanvas = async (side = 'front', scale = 3) => {
    const widthPx = currentSize.widthMm * 3.78 * scale;
    const heightPx = currentSize.heightMm * 3.78 * scale;

    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(0, 0, widthPx, heightPx, cornerRadius * scale);
    ctx.fill();

    // Border
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5 * scale;
    ctx.stroke();

    // Crop marks if enabled
    if (showCropMarks) {
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1 * scale;
      const markLen = 12 * scale;
      // top-left
      ctx.beginPath();
      ctx.moveTo(0, markLen);
      ctx.lineTo(0, 0);
      ctx.lineTo(markLen, 0);
      ctx.stroke();
      // top-right
      ctx.beginPath();
      ctx.moveTo(widthPx - markLen, 0);
      ctx.lineTo(widthPx, 0);
      ctx.lineTo(widthPx, markLen);
      ctx.stroke();
      // bottom-left
      ctx.beginPath();
      ctx.moveTo(0, heightPx - markLen);
      ctx.lineTo(0, heightPx);
      ctx.lineTo(markLen, heightPx);
      ctx.stroke();
      // bottom-right
      ctx.beginPath();
      ctx.moveTo(widthPx - markLen, heightPx);
      ctx.lineTo(widthPx, heightPx);
      ctx.lineTo(widthPx, heightPx - markLen);
      ctx.stroke();
    }

    if (side === 'front') {
      // Brand Name
      ctx.fillStyle = accentColor;
      ctx.font = `bold ${8 * scale}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(brandName.toUpperCase(), widthPx / 2, 20 * scale);

      // Headline
      ctx.fillStyle = textColor;
      ctx.font = `bold ${13 * scale}px ${fontFamily}`;
      ctx.fillText(headline, widthPx / 2, 36 * scale);

      // Body message (wrapped)
      ctx.fillStyle = subTextColor;
      ctx.font = `${8 * scale}px ${fontFamily}`;
      const words = message.split(' ');
      let line = '';
      let y = 50 * scale;
      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > widthPx - 40 * scale && n > 0) {
          ctx.fillText(line.trim(), widthPx / 2, y);
          line = words[n] + ' ';
          y += 11 * scale;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), widthPx / 2, y);

      // Coupon Box
      if (couponCode) {
        const boxW = widthPx - 48 * scale;
        const boxH = 24 * scale;
        const boxX = 24 * scale;
        const boxY = y + 8 * scale;

        ctx.fillStyle = couponBg;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 6 * scale);
        ctx.fill();

        ctx.strokeStyle = accentColor;
        ctx.setLineDash([3 * scale, 2 * scale]);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = textColor;
        ctx.font = `${7 * scale}px ${fontFamily}`;
        ctx.fillText(couponText, widthPx / 2, boxY + 10 * scale);

        ctx.fillStyle = accentColor;
        ctx.font = `bold ${10 * scale}px monospace`;
        ctx.fillText(couponCode, widthPx / 2, boxY + 20 * scale);
      }

      // Footer: Website & Social
      ctx.fillStyle = subTextColor;
      ctx.font = `bold ${7 * scale}px ${fontFamily}`;
      ctx.fillText(`${website}  •  ${social}`, widthPx / 2, heightPx - 10 * scale);
    } else {
      // Back Side Rendering
      ctx.fillStyle = textColor;
      ctx.font = `bold ${12 * scale}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.fillText(backHeadline, widthPx / 2, 28 * scale);

      ctx.fillStyle = subTextColor;
      ctx.font = `${8 * scale}px ${fontFamily}`;
      const lines = backMessage.split('\n');
      lines.forEach((l, idx) => {
        ctx.fillText(l, widthPx / 2, (44 + idx * 12) * scale);
      });

      if (backFootnote) {
        ctx.fillStyle = accentColor;
        ctx.font = `italic ${7.5 * scale}px ${fontFamily}`;
        ctx.fillText(backFootnote, widthPx / 2, heightPx - 12 * scale);
      }
    }

    return canvas;
  };

  // Downloads
  const handleDownloadPng = async () => {
    playClickSound();
    try {
      const canvas = await renderCardToCanvas(activeSide, 4);
      downloadCanvasAsPng(canvas, `thank-you-card-${activeSide}.png`);
      toast.success(`Downloaded ${activeSide} side PNG`);
    } catch {
      toast.error('Failed to export PNG');
    }
  };

  const handleDownloadPdf = async () => {
    playClickSound();
    try {
      const canvas = await renderCardToCanvas(activeSide, 3);
      const dataUrl = canvas.toDataURL('image/png');
      exportSinglePdf({
        dataUrl,
        widthMm: currentSize.widthMm,
        heightMm: currentSize.heightMm,
        filename: `thank-you-card-${activeSide}.pdf`,
      });
      toast.success('Downloaded print-ready PDF card');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  const handleDownloadDualSidedPdf = async () => {
    playClickSound();
    try {
      const frontCanvas = await renderCardToCanvas('front', 3);
      const backCanvas = await renderCardToCanvas('back', 3);
      const frontDataUrl = frontCanvas.toDataURL('image/png');
      const backDataUrl = backCanvas.toDataURL('image/png');

      exportDualSidedPdfWithBleed({
        frontDataUrl,
        backDataUrl,
        widthMm: currentSize.widthMm,
        heightMm: currentSize.heightMm,
        bleedMm: usePrintBleed ? 3 : 0,
        showCropMarks,
        filename: `${(brandName || 'Brand').replace(/\\s+/g, '_')}_DualSided_Card.pdf`,
      });
      toast.success('Exported 2-Page Dual-Sided Print PDF (Front + Back)!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to export dual-sided PDF');
    }
  };

  const handleDownloadA4SheetPdf = async () => {
    playClickSound();
    try {
      const canvas = await renderCardToCanvas('front', 2.5);
      const dataUrl = canvas.toDataURL('image/png');

      exportA4SheetPdf({
        items: dataUrl,
        itemWidthMm: currentSize.widthMm,
        itemHeightMm: currentSize.heightMm,
        rows: sheetRows,
        cols: sheetCols,
        marginTopMm: 10,
        marginLeftMm: 10,
        gapXmm: 4,
        gapYmm: 4,
        showCutGuides: true,
        filename: `a4-thank-you-cards.pdf`,
      });
      toast.success('Exported A4 multi-card sheet PDF!');
    } catch {
      toast.error('Failed to export A4 PDF');
    }
  };

  const handlePrint = () => {
    playClickSound();
    if (activeTab === 'sheet' && printSheetRef.current) {
      printHtmlElement(printSheetRef.current, 'A4 Sheet Thank You Cards');
    } else if (cardContainerRef.current) {
      printHtmlElement(cardContainerRef.current, 'Thank You Card');
    }
  };

  const handleApplyMessage = (msg) => {
    playClickSound();
    setHeadline(msg.headline);
    setMessage(msg.message);
    setIsMessageModalOpen(false);
    toast.success('Applied message template');
  };

  return (
    <div className="space-y-4">
      {/* Tool Hero Header */}
      <ToolHeroHeader
        badge="PACKAGING INSERTS"
        category="Commerce & Retail"
        title="Thank You Card & Packaging Insert Maker"
        description="Create beautiful branded thank you cards, packaging slips, and discount voucher inserts with front-and-back designs, QR review links, and multi-up A4 printing."
        icon={Heart}
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
                setIsCouponModalOpen(true);
              }}
              className="btn-secondary py-1 px-2.5 text-xs font-semibold flex items-center gap-1.5 text-purple-400 hover:text-purple-300"
              title="Select promotion voucher"
            >
              <Ticket className="w-3.5 h-3.5 text-purple-400" />
              <span>Coupon Hub</span>
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
                if (kit.brandName) setBrandName(kit.brandName);
                if (kit.primaryColor) setAccentColor(kit.primaryColor);
                if (kit.website) setWebsite(kit.website);
                if (kit.social) setSocial(kit.social);
                if (kit.logoUrl) setLogoImage(kit.logoUrl);
                toast.success('Applied Brand Kit to Thank You Card!');
              }}
              className="btn-secondary py-1 px-2.5 text-xs font-semibold flex items-center gap-1.5 text-sky-500 hover:text-sky-400"
              title="Sync Business Name, Colors and Links from Brand Kit"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Sync Brand</span>
            </button>

            <span className="text-[11px] font-semibold text-slate-400 mx-1 hidden sm:inline">|</span>

            <button
              type="button"
              onClick={() => setIsMessageModalOpen(true)}
              className="btn-primary py-1 px-2.5 text-xs flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message Library</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playClickSound();
                handleSelectTemplate('minimal-modern');
              }}
              className="btn-secondary py-1 px-2.5 text-xs text-slate-500 hover:text-rose-500"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        }
      />

      {/* Tabs */}
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
          <Heart className="w-3.5 h-3.5" />
          <span>Card Studio & Preview</span>
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
          <span>A4 Gang Sheet Layout</span>
          <span className="text-[9px] font-mono px-1 rounded bg-sky-500/10 text-sky-500">
            {sheetCols * sheetRows} Cards/Page
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            playClickSound();
            setActiveTab('personalize');
          }}
          className={`py-2 px-3 border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'personalize'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>Batch Personalize (CSV)</span>
          <span className="text-[9px] font-mono px-1 rounded bg-sky-500/10 text-sky-500">
            {personalizationRows.length}
          </span>
        </button>
      </div>

      {/* Ready Template Studio Bar */}
      <div className="bg-white dark:bg-[#0c1220] p-3 sm:p-3.5 rounded-xl space-y-2 border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Curated Designer Themes ({THANK_YOU_TEMPLATES.length})
            </span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">1-Click Theme Switcher</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
          {THANK_YOU_TEMPLATES.map((tmpl) => {
            const isSelected = selectedTemplateId === tmpl.id;
            return (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tmpl.id)}
                className={`p-2.5 rounded-lg border text-left transition-all duration-150 flex flex-col justify-between gap-1.5 cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'border-sky-500 bg-sky-50 dark:bg-sky-500/10 shadow-xs ring-1 ring-sky-500'
                    : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full border border-black/15 shadow-xs shrink-0"
                    style={{ backgroundColor: tmpl.theme.bg }}
                  />
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/15 shadow-xs shrink-0"
                    style={{ backgroundColor: tmpl.theme.accentColor }}
                  />
                </div>
                <div>
                  <span className={`text-[11px] font-bold block leading-tight ${isSelected ? 'text-sky-600 dark:text-sky-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {tmpl.label}
                  </span>
                  <span className="text-[9px] text-slate-400 font-mono mt-0.5 block capitalize">
                    {tmpl.theme.font}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: Single Card Designer */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Panel: Inputs (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-4 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveSide('front');
                    }}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      activeSide === 'front' ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Front Side
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveSide('back');
                    }}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      activeSide === 'back' ? 'bg-white dark:bg-slate-700 text-sky-500 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    Back Side
                  </button>
                </div>

                {/* Card Size Selector */}
                <select
                  value={selectedSizeId}
                  onChange={(e) => handleSelectSize(e.target.value)}
                  className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  {CARD_SIZES.map((sz) => (
                    <option key={sz.id} value={sz.id}>
                      {sz.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Front Side Form */}
              {activeSide === 'front' ? (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Brand / Store Name</label>
                    <input
                      type="text"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Headline Message</label>
                    <input
                      type="text"
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[10px] font-bold text-slate-400">Supporting Appreciation Text</label>
                      <button
                        type="button"
                        onClick={() => setIsMessageModalOpen(true)}
                        className="text-[10px] text-sky-500 hover:underline font-semibold"
                      >
                        Browse Suggestions
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>

                  {/* Coupon Block */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.06] space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                      Promotional Coupon Box
                    </span>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-400 block mb-0.5">Promo Code</label>
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="THANKYOU10"
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block mb-0.5">Offer Description</label>
                        <input
                          type="text"
                          value={couponText}
                          onChange={(e) => setCouponText(e.target.value)}
                          placeholder="Enjoy 10% off"
                          className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Social & Web */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Website</label>
                      <input
                        type="text"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Social Handle</label>
                      <input
                        type="text"
                        value={social}
                        onChange={(e) => setSocial(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  {/* Embedded QR toggle */}
                  <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 dark:text-slate-300">
                        <input
                          type="checkbox"
                          checked={showQr}
                          onChange={(e) => setShowQr(e.target.checked)}
                          className="rounded text-sky-500"
                        />
                        <span>Embed QR Code on Card</span>
                      </label>
                    </div>
                    {showQr && (
                      <input
                        type="url"
                        value={qrUrl}
                        onChange={(e) => setQrUrl(e.target.value)}
                        placeholder="https://yourstore.com/review"
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                      />
                    )}
                  </div>
                </div>
              ) : (
                /* Back Side Form */
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Back Headline</label>
                    <input
                      type="text"
                      value={backHeadline}
                      onChange={(e) => setBackHeadline(e.target.value)}
                      className="w-full text-xs font-bold p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                      Back Details / Instructions
                    </label>
                    <textarea
                      rows={5}
                      value={backMessage}
                      onChange={(e) => setBackMessage(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Footnote / Eco Tag</label>
                    <input
                      type="text"
                      value={backFootnote}
                      onChange={(e) => setBackFootnote(e.target.value)}
                      className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Color Customizer */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Card Colors & Styling
                </span>
                <div className="grid grid-cols-4 gap-2 text-[10px]">
                  <div>
                    <label className="text-slate-400 block mb-0.5">Background</label>
                    <input
                      type="color"
                      value={bg}
                      onChange={(e) => setBg(e.target.value)}
                      className="w-full h-6 rounded cursor-pointer border"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Text</label>
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-full h-6 rounded cursor-pointer border"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Accent</label>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
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
                </div>

                <div className="flex items-center justify-between pt-1 text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showCropMarks}
                      onChange={(e) => setShowCropMarks(e.target.checked)}
                      className="rounded text-sky-500"
                    />
                    <span>Show Guillotine Crop Marks</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Live Card Preview & Actions (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Live Interactive Card Display */}
            <div className="studio-desk-stage p-6 sm:p-8 flex flex-col items-center justify-center min-h-[460px] relative select-none">
              {/* Studio Desk Floating Control Toolbar */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/90 dark:bg-slate-900/90 text-sky-600 dark:text-sky-400 border border-slate-200 dark:border-white/10 shadow-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                    {activeSide.toUpperCase()} VIEW • {currentSize.widthMm} × {currentSize.heightMm} mm
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">300 DPI Fine Print</span>
                </div>

                <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 p-1 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs">
                  {/* Flip Card */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setActiveSide((prev) => (prev === 'front' ? 'back' : 'front'));
                    }}
                    className="btn-secondary py-1 px-2.5 text-[10px] flex items-center gap-1 hover:border-sky-500 text-slate-700 dark:text-slate-300 font-bold"
                    title="Flip between front and back of the card"
                  >
                    <RotateCw className="w-3 h-3 text-sky-500" />
                    <span>Flip ({activeSide === 'front' ? 'Back' : 'Front'})</span>
                  </button>

                  {/* 3D Perspective Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      setIs3dPerspective((prev) => !prev);
                    }}
                    className={`p-1 px-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all ${
                      is3dPerspective
                        ? 'bg-sky-500 text-white shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                    title="Toggle Realistic 3D Tilt Angle"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">3D</span>
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
                    onClick={() => setZoom((z) => Math.min(1.4, Math.round((z + 0.1) * 10) / 10))}
                    className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Physical Render Card with 3D shadow and sheen */}
              <div
                style={{
                  transform: is3dPerspective
                    ? `perspective(1000px) rotateX(10deg) rotateY(-8deg) scale(${zoom})`
                    : `scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="my-8 relative"
              >
                <div
                  ref={cardContainerRef}
                  style={{
                    width: `${currentSize.widthMm * 3.8}px`,
                    minHeight: `${currentSize.heightMm * 3.8}px`,
                    backgroundColor: bg,
                    borderColor: borderColor,
                    borderRadius: `${cornerRadius}px`,
                    color: textColor,
                    fontFamily: fontFamily,
                  }}
                  className="studio-card-3d border p-5 flex flex-col justify-between select-none relative overflow-hidden"
                >
                  {/* Crop marks & Safe Zone Visual Guides */}
                  {showCropMarks && (
                    <div className="absolute inset-1 pointer-events-none border border-dashed border-red-500/40 rounded-sm">
                      <span className="absolute top-0.5 left-0.5 text-[7px] font-mono text-red-500/70 font-bold">
                        3mm BLEED
                      </span>
                    </div>
                  )}

                  {activeSide === 'front' ? (
                    <>
                      {/* Front Header */}
                      <div className="text-center space-y-1">
                        <p style={{ color: accentColor }} className="text-[9px] uppercase tracking-widest font-bold">
                          {brandName}
                        </p>
                        <h3 className="text-base font-extrabold tracking-tight leading-tight">
                          {headline}
                        </h3>
                        <p style={{ color: subTextColor }} className="text-[10px] leading-relaxed max-w-sm mx-auto">
                          {message}
                        </p>
                      </div>

                      {/* Middle: Promo coupon box & QR */}
                      <div className="my-3 flex items-center justify-between gap-3 p-2.5 rounded-xl" style={{ backgroundColor: couponBg, border: `1px dashed ${accentColor}` }}>
                        <div className="flex-1">
                          <span className="text-[9px] text-slate-500 block leading-tight">
                            {couponText}
                          </span>
                          <span style={{ color: accentColor }} className="text-xs font-mono font-black tracking-wider block mt-0.5">
                            {couponCode}
                          </span>
                        </div>
                        {showQr && (
                          <div className="shrink-0 flex flex-col items-center">
                            <canvas ref={qrCanvasRef} className="w-12 h-12" />
                            <span className="text-[7px] text-slate-400 font-mono mt-0.5">SCAN TO SHOP</span>
                          </div>
                        )}
                      </div>

                      {/* Front Footer */}
                      <div style={{ color: subTextColor }} className="text-[9px] font-semibold flex items-center justify-between border-t border-slate-200/50 pt-2">
                        <span>{website}</span>
                        <span>{social}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Back Header */}
                      <div className="text-center space-y-2">
                        <h4 className="text-sm font-extrabold tracking-tight">
                          {backHeadline}
                        </h4>
                        <p style={{ color: subTextColor }} className="text-[10px] leading-relaxed whitespace-pre-line text-left px-2">
                          {backMessage}
                        </p>
                      </div>

                      {/* Back Footer */}
                      {backFootnote && (
                        <div className="text-center border-t border-slate-200/50 pt-2">
                          <span style={{ color: accentColor }} className="text-[9px] italic">
                            {backFootnote}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
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
                      Print & Digital Export Suite
                    </h4>
                    <p className="text-[11px] text-slate-400">Zero compression loss • 300 DPI high-resolution output</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  <span>Commercial Ready</span>
                </div>
              </div>

              {/* Primary Call to Action */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPdfWithBleed}
                  className="btn-primary btn-shimmer py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-sky-500/20 hover:scale-[1.01] transition-transform"
                >
                  <Scissors className="w-4 h-4 text-amber-300" />
                  <div className="text-left">
                    <span className="block leading-tight">Export Commercial Print PDF</span>
                    <span className="text-[10px] text-sky-200 font-normal">Active side with 3mm bleed & crop marks</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadDualSidedPdf}
                  className="py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-xs font-bold bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-lg shadow-rose-500/20 hover:scale-[1.01] transition-transform cursor-pointer"
                >
                  <RotateCw className="w-4 h-4 text-amber-200" />
                  <div className="text-left">
                    <span className="block leading-tight">Export 2-Page PDF (Front + Back)</span>
                    <span className="text-[10px] text-rose-100 font-normal">Dual-sided commercial print package</span>
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
                  <Heart className="w-4 h-4 text-rose-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Standard PDF</span>
                    <span className="text-[10px] text-slate-400 font-mono">Trim size</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setActiveTab('sheet');
                  }}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] hover:border-sky-500 bg-slate-50/70 dark:bg-white/[0.02] flex items-center gap-2 text-left transition-all group"
                >
                  <Grid className="w-4 h-4 text-purple-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">A4 Gang Sheet</span>
                    <span className="text-[10px] text-slate-400 font-mono">{sheetCols * sheetRows} Cards/Page</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="p-2.5 rounded-xl border border-slate-200/80 dark:border-white/[0.08] hover:border-sky-500 bg-slate-50/70 dark:bg-white/[0.02] flex items-center gap-2 text-left transition-all group"
                >
                  <Printer className="w-4 h-4 text-emerald-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <div>
                    <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">Print Direct</span>
                    <span className="text-[10px] text-slate-400 font-mono">Browser print</span>
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

              {/* A4 Sheet Print Shortcut */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Grid className="w-3.5 h-3.5 text-sky-500" />
                    Print {sheetCols * sheetRows} Cards per A4 Sheet
                  </span>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Ready for 250-300 GSM cardstock with cutting margins.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadA4SheetPdf}
                  className="btn-primary py-1 px-3 text-xs whitespace-nowrap"
                >
                  Export A4 Sheet
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: A4 Gang Sheet Layout */}
      {activeTab === 'sheet' && (
        <div className="glass-panel p-4 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-sky-500" />
                A4 Multi-Card Gang Sheet Layout
              </h3>
              <p className="text-xs text-slate-500">
                Layout {sheetCols * sheetRows} cards ({currentSize.widthMm}×{currentSize.heightMm}mm) per A4 page for printing on heavy cardstock.
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
                <span>Download A4 PDF</span>
              </button>
            </div>
          </div>

          {/* Visual Paper Preview */}
          <div className="p-6 rounded-2xl bg-slate-200/70 dark:bg-slate-950 flex justify-center overflow-x-auto">
            <div
              ref={printSheetRef}
              style={{
                width: '210mm',
                minHeight: '297mm',
                paddingTop: '12mm',
                paddingLeft: '12mm',
                backgroundColor: '#ffffff',
              }}
              className="shadow-2xl border border-slate-300 text-slate-900 font-sans"
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${sheetCols}, ${currentSize.widthMm}mm)`,
                  gridAutoRows: `${currentSize.heightMm}mm`,
                  columnGap: '5mm',
                  rowGap: '5mm',
                }}
              >
                {Array.from({ length: sheetCols * sheetRows }).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px dashed #cbd5e1',
                      padding: '3mm',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      textAlign: 'center',
                      boxSizing: 'border-box',
                      backgroundColor: bg,
                      color: textColor,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '7px', fontWeight: 'bold', color: accentColor }}>
                        {brandName}
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: 'bold', marginTop: '1mm' }}>
                        {headline}
                      </div>
                    </div>
                    {couponCode && (
                      <div style={{ fontSize: '8px', fontFamily: 'monospace', fontWeight: 'bold', border: `1px dashed ${accentColor}`, padding: '1mm' }}>
                        CODE: {couponCode}
                      </div>
                    )}
                    <div style={{ fontSize: '6px', color: subTextColor }}>
                      {website}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Bulk Personalization */}
      {activeTab === 'personalize' && (
        <div className="glass-panel p-5 rounded-2xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-sky-500" />
                Customer Order Personalization (CSV)
              </h3>
              <p className="text-xs text-slate-500">
                Personalize thank you cards with customer names, custom order IDs, and unique coupon codes.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  downloadCsv(generateCardPersonalizationSampleCsv(), 'thank_you_cards_sample.csv');
                  toast.success('Downloaded personalization sample CSV');
                }}
                className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-sky-500" />
                <span>Sample CSV</span>
              </button>
            </div>
          </div>

          {/* Air-gapped privacy safeguard notice */}
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              <strong>Zero-Cloud Privacy Guarantee:</strong> {PRIVACY_SAFEGUARDS_NOTICE}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Paste Customer CSV Data (Customer Name, Order ID, Special Note, Coupon Code)
            </label>
            <textarea
              rows={4}
              value={personalizationCsv}
              onChange={(e) => setPersonalizationCsv(e.target.value)}
              className="input-field font-mono text-xs w-full leading-relaxed"
              placeholder="Customer Name,Order ID,Special Note,Coupon Code..."
            />
          </div>

          {personalizationRows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Validated Customer Records ({personalizationRows.length})
                </span>
                <span className="text-[11px] text-slate-500">
                  Click &apos;Apply to Card&apos; to load their name & custom note into the editor
                </span>
              </div>
              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/[0.08]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 uppercase font-mono text-[10px]">
                    <tr>
                      <th className="p-2.5">Customer Name</th>
                      <th className="p-2.5">Order ID</th>
                      <th className="p-2.5">Special Note</th>
                      <th className="p-2.5">Coupon</th>
                      <th className="p-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.04]">
                    {personalizationRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-500/5">
                        <td className="p-2.5 font-bold text-slate-900 dark:text-white">{row.customerName}</td>
                        <td className="p-2.5 font-mono text-slate-500">{row.orderId || '—'}</td>
                        <td className="p-2.5 text-slate-600 dark:text-slate-400 max-w-xs truncate">{row.specialNote || '—'}</td>
                        <td className="p-2.5 font-mono text-sky-500 font-bold">{row.couponCode || '—'}</td>
                        <td className="p-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              if (row.customerName) setHeadline(`Thank You, ${row.customerName}!`);
                              if (row.specialNote) setMessage(row.specialNote);
                              if (row.couponCode) setCouponCode(row.couponCode);
                              setActiveTab('single');
                              toast.success(`Personalized card for ${row.customerName}`);
                            }}
                            className="btn-secondary py-1 px-2.5 text-[11px] hover:border-sky-500"
                          >
                            Apply to Card
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Message Suggestions Modal */}
      {isMessageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-2xl max-h-[85vh] rounded-2xl p-5 overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/[0.06]">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Ready-to-Use Appreciation Messages
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMessageModalOpen(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Close (✕)
              </button>
            </div>

            <div className="space-y-4">
              {MESSAGE_SUGGESTIONS.map((cat) => (
                <div key={cat.category} className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500 font-mono">
                    {cat.category}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {cat.items.map((item) => (
                      <div
                        key={item.title}
                        onClick={() => handleApplyMessage(item)}
                        className="p-3 rounded-xl border border-slate-200/80 dark:border-white/[0.08] hover:border-sky-500 bg-white/50 dark:bg-slate-900/50 cursor-pointer transition-all space-y-1 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-500">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            Apply ↵
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Brand Kit Modal */}
      <BrandKitModal
        isOpen={isBrandKitOpen}
        onClose={() => setIsBrandKitOpen(false)}
        onApply={handleApplyBrandKit}
      />

      {/* Saved Projects Modal */}
      <SavedDesignsModal
        isOpen={isSavedDesignsOpen}
        onClose={() => setIsSavedDesignsOpen(false)}
        onSelectDesign={handleLoadSavedDesign}
        currentTool="thank-you-card"
      />

      {/* Product Label Studio Modal */}
      <ProductLabelStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onApplyProduct={(prod) => {
          if (prod.productName) setHeadline(`Thank You for purchasing ${prod.productName}!`);
          if (prod.website) {
            setWebsite(prod.website);
            setQrUrl(prod.website);
          }
          toast.success('Loaded Product Studio details into Thank You Card!');
        }}
      />

      {/* Coupon Manager Modal */}
      <CouponManagerModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        onSelectCoupon={(c) => {
          setCouponCode(c.code);
          setCouponText(
            c.description ||
              (c.discountType === 'percentage'
                ? `Enjoy ${c.discountValue}% off your next order`
                : `Get ₹${c.discountValue} flat off on orders above ₹${c.minPurchase || 0}`)
          );
          toast.success(`Inserted coupon code ${c.code}!`);
        }}
      />

      {/* Product Catalog Modal */}
      <ProductCatalogModal
        isOpen={isCatalogOpen}
        onClose={() => setIsCatalogOpen(false)}
        onSelectProduct={(prod) => {
          if (prod.brand) setBrandName(prod.brand.toUpperCase());
          if (prod.url) {
            setWebsite(prod.url);
            setQrUrl(prod.url);
          }
          if (prod.name) {
            setHeadline(`Thank You For Choosing ${prod.name}!`);
          }
          toast.success(`Loaded "${prod.name}" from catalog!`);
        }}
      />

      {/* AI Prompt Assistant Modal */}
      <AiDesignAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentTool="thank-you-card"
        onApplyDesign={(aiResult) => {
          if (aiResult.productName) setHeadline(`Thank You For Choosing ${aiResult.productName}!`);
          if (aiResult.couponCode) setCouponCode(aiResult.couponCode);
          if (aiResult.url) {
            setWebsite(aiResult.url);
            setQrUrl(aiResult.url);
          }
          toast.success('Applied AI design recommendations to Thank You Card!');
        }}
      />
    </div>
  );
}
