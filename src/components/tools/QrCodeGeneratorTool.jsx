import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  QrCode,
  Download,
  Printer,
  Copy,
  Sparkles,
  Upload,
  RefreshCw,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Globe,
  IndianRupee,
  Contact,
  Wifi,
  FileText,
  Phone,
  Mail,
  MessageSquare,
  MapPin,
  Share2,
  ShoppingBag,
  FileSpreadsheet,
  Image as ImageIcon,
  ShieldCheck,
  Info,
  Save,
  FolderOpen,
  Palette,
  Layers,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Box
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { playClickSound } from '../../utils/audioFeedback';
import { ToolHeroHeader } from '../common/ToolHeroHeader';
import BrandKitModal from '../common/BrandKitModal';
import SavedDesignsModal from '../common/SavedDesignsModal';
import ProductLabelStudioModal from '../common/ProductLabelStudioModal';
import {
  QR_TYPES,
  COLOR_PRESETS,
  CTA_FRAME_STYLES,
  SAMPLE_QR_PRESETS,
  STATIC_QR_DISCLAIMER,
  UPI_PAYMENT_DISCLAIMER,
  buildQrPayload,
  validateUpiVpa,
  getContrastRatio,
  evaluateQrScanReliability,
  verifyQrPayload,
  generateQrSampleCsv,
  renderFullQrCanvas,
  parseBulkQrCsv,
} from '../../utils/qrUtils';
import {
  downloadCanvasAsPng,
  downloadSvg,
  downloadCsv,
  exportSinglePdf,
  printHtmlElement,
} from '../../utils/exportUtils';
import { getSavedBrandKit } from '../../utils/brandKitUtils';
import { saveDesign } from '../../utils/savedDesignsUtils';
import QRCode from 'qrcode';

export function QrCodeGeneratorTool() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'

  // Modals state
  const [isBrandKitOpen, setIsBrandKitOpen] = useState(false);
  const [isSavedDesignsOpen, setIsSavedDesignsOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Studio Interactive Viewport
  const [zoom, setZoom] = useState(1);
  const [is3dPerspective, setIs3dPerspective] = useState(false);


  // Selected Type & Form Data
  const [selectedType, setSelectedType] = useState('url');
  const [formData, setFormData] = useState({
    // URL
    url: 'https://quickformat.arvaancorelogic.com',
    // UPI
    pa: 'quickformat@okhdfcbank',
    pn: 'QuickFormat Hub',
    am: '499.00',
    cu: 'INR',
    tn: 'Online Order #9821',
    // vCard
    name: 'Aarav Patel',
    org: 'QuickFormat Technologies',
    title: 'Lead Software Architect',
    phone: '+91 98765 43210',
    email: 'contact@quickformat.com',
    address: 'Bengaluru, India',
    // Wi-Fi
    ssid: 'QuickFormat_Guest_5G',
    password: 'ConnectFast2026',
    encryption: 'WPA',
    hidden: false,
    // Text
    text: 'Hello from QuickFormat Hub!',
    // Email
    subject: 'Inquiry regarding services',
    body: 'Hello team, I would like to learn more about your offerings.',
    // SMS
    message: 'Hello! I need assistance with my order.',
    // Location
    lat: '12.9716',
    lng: '77.5946',
    // Social
    platform: 'whatsapp',
    handle: '919876543210',
    // Product
    sku: 'SKU-PROD-900',
    price: '₹1,499.00',
    batch: 'BATCH-2026-A',
    exp: '12/2028',
  });

  // Customization Settings
  const [qrSize, setQrSize] = useState(512);
  const [darkColor, setDarkColor] = useState('#000000');
  const [lightColor, setLightColor] = useState('#ffffff');
  const [errorCorrection, setErrorCorrection] = useState('M'); // 'L' | 'M' | 'Q' | 'H'
  const [logoDataUrl, setLogoDataUrl] = useState(null);
  const [logoSizePercent, setLogoSizePercent] = useState(20);
  const [frameStyle, setFrameStyle] = useState('none'); // 'none' | 'bottom-pill' | 'framed-card' | 'top-tag'
  const [ctaText, setCtaText] = useState('SCAN ME');
  const [subText, setSubText] = useState('Camera or Any Scanner App');

  // Bulk State
  const [bulkInput, setBulkInput] = useState(
    'https://quickformat.arvaancorelogic.com,Main Website\n' +
    'https://instagram.com/quickformat,Official Instagram\n' +
    'https://maps.google.com/?q=12.9716,77.5946,Store Location\n' +
    'upi://pay?pa=store@upi&pn=RetailStore&am=299&cu=INR,Quick Pay ₹299'
  );
  const [bulkItems, setBulkItems] = useState([]);

  // Canvas Refs
  const previewCanvasRef = useRef(null);
  const previewContainerRef = useRef(null);

  // Compute QR Payload
  const qrPayload = useMemo(() => {
    return buildQrPayload(selectedType, formData);
  }, [selectedType, formData]);

  // Contrast Ratio
  const contrastRatio = useMemo(() => {
    return getContrastRatio(darkColor, lightColor);
  }, [darkColor, lightColor]);

  const isLowContrast = contrastRatio < 3.0;

  // UPI VPA validation
  const upiValidation = useMemo(() => {
    if (selectedType === 'upi') {
      return validateUpiVpa(formData.pa);
    }
    return { isValid: true };
  }, [selectedType, formData.pa]);

  // Scan reliability rating
  const reliability = useMemo(() => {
    return evaluateQrScanReliability({
      contrastRatio,
      ecc: errorCorrection,
      hasLogo: Boolean(logoDataUrl),
      logoSizePercent,
    });
  }, [contrastRatio, errorCorrection, logoDataUrl, logoSizePercent]);

  // Payload input validation
  const payloadValidation = useMemo(() => {
    return verifyQrPayload(selectedType, formData);
  }, [selectedType, formData]);

  // Brand Kit Applier
  const handleApplyBrandKit = (kit) => {
    if (kit?.primaryColor) setDarkColor(kit.primaryColor);
    if (kit?.logoUrl) setLogoDataUrl(kit.logoUrl);
    if (kit?.website && selectedType === 'url') {
      setFormData((prev) => ({ ...prev, url: kit.website }));
    }
    if (kit?.upiId && selectedType === 'upi') {
      setFormData((prev) => ({ ...prev, pa: kit.upiId, pn: kit.brandName }));
    }
    toast.success('Applied Brand Kit style to QR code!');
  };

  // Save Design
  const handleSaveDesign = async () => {
    playClickSound();
    try {
      let previewDataUrl = null;
      if (previewCanvasRef.current) {
        previewDataUrl = previewCanvasRef.current.toDataURL('image/png');
      }
      saveDesign({
        tool: 'qr-code',
        name: `QR: ${formData.pn || formData.name || formData.url || selectedType.toUpperCase()}`,
        state: {
          selectedType,
          formData,
          qrSize,
          darkColor,
          lightColor,
          errorCorrection,
          logoDataUrl,
          logoSizePercent,
          frameStyle,
          ctaText,
          subText,
        },
        previewDataUrl,
      });
      toast.success('Saved QR Code design to Projects!');
    } catch {
      toast.error('Failed to save QR Code design');
    }
  };

  // Load Saved Design
  const handleLoadSavedDesign = (design) => {
    if (design?.state) {
      const s = design.state;
      if (s.selectedType) setSelectedType(s.selectedType);
      if (s.formData) setFormData(s.formData);
      if (s.darkColor) setDarkColor(s.darkColor);
      if (s.lightColor) setLightColor(s.lightColor);
      if (s.errorCorrection) setErrorCorrection(s.errorCorrection);
      if (s.logoDataUrl !== undefined) setLogoDataUrl(s.logoDataUrl);
      if (s.frameStyle) setFrameStyle(s.frameStyle);
      if (s.ctaText) setCtaText(s.ctaText);
      toast.success(`Loaded QR design: ${design.name}`);
    }
  };

  // Sample CSV Downloader
  const handleDownloadSampleCsv = () => {
    playClickSound();
    downloadCsv(generateQrSampleCsv(), 'qr-bulk-sample.csv');
    toast.success('Downloaded sample QR CSV template');
  };


  // Field change handler
  const handleFieldChange = (key, val) => {
    setFormData((prev) => ({ ...prev, [key]: val }));
  };

  // Render preview canvas
  useEffect(() => {
    let isCancelled = false;

    const render = async () => {
      if (!qrPayload || !qrPayload.trim()) return;

      try {
        const fullCanvas = await renderFullQrCanvas({
          payload: qrPayload,
          size: 380, // preview resolution
          darkColor,
          lightColor,
          errorCorrectionLevel: errorCorrection,
          logoDataUrl,
          logoSizePercent,
          frameStyle,
          ctaText,
          subText,
        });

        if (isCancelled || !previewCanvasRef.current) return;
        const target = previewCanvasRef.current;
        target.width = fullCanvas.width;
        target.height = fullCanvas.height;
        const ctx = target.getContext('2d');
        ctx.clearRect(0, 0, fullCanvas.width, fullCanvas.height);
        ctx.drawImage(fullCanvas, 0, 0);
      } catch (err) {
        console.warn('QR render error:', err);
      }
    };

    render();
    return () => {
      isCancelled = true;
    };
  }, [
    qrPayload,
    darkColor,
    lightColor,
    errorCorrection,
    logoDataUrl,
    logoSizePercent,
    frameStyle,
    ctaText,
    subText,
  ]);

  // Parse bulk items
  useEffect(() => {
    setBulkItems(parseBulkQrCsv(bulkInput));
  }, [bulkInput]);

  // Apply color preset
  const handleApplyColorPreset = (preset) => {
    playClickSound();
    setDarkColor(preset.dark);
    setLightColor(preset.light);
  };

  // Apply sample preset
  const handleLoadSamplePreset = (preset) => {
    playClickSound();
    setSelectedType(preset.type);
    setFormData((prev) => ({ ...prev, ...preset.data }));
    if (preset.ctaText) setCtaText(preset.ctaText);
    toast.success(`Loaded preset: ${preset.label}`);
  };

  // Logo upload
  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setLogoDataUrl(evt.target?.result);
      // Auto-upgrade error correction to high for scan safeguard
      if (errorCorrection === 'L' || errorCorrection === 'M') {
        setErrorCorrection('Q');
      }
      toast.success('Embedded center logo (Error correction auto-set to Q for scan reliability)');
    };
    reader.readAsDataURL(file);
  };

  // Downloads
  const handleDownloadPng = async () => {
    playClickSound();
    try {
      const exportCanvas = await renderFullQrCanvas({
        payload: qrPayload,
        size: qrSize, // user selected export size (e.g. 512, 1024, 2048)
        darkColor,
        lightColor,
        errorCorrectionLevel: errorCorrection,
        logoDataUrl,
        logoSizePercent,
        frameStyle,
        ctaText,
        subText,
      });

      downloadCanvasAsPng(exportCanvas, `qrcode-${selectedType}-${Date.now()}.png`);
      toast.success(`Downloaded ${qrSize}px high-res PNG`);
    } catch {
      toast.error('Failed to export PNG');
    }
  };

  const handleDownloadSvg = async () => {
    playClickSound();
    try {
      const svgString = await QRCode.toString(qrPayload, {
        type: 'svg',
        color: { dark: darkColor, light: lightColor },
        errorCorrectionLevel: errorCorrection,
        margin: 2,
      });
      downloadSvg(svgString, `qrcode-${selectedType}.svg`);
      toast.success('Downloaded SVG vector QR code');
    } catch {
      toast.error('Failed to export SVG');
    }
  };

  const handleDownloadPdf = async () => {
    playClickSound();
    try {
      const exportCanvas = await renderFullQrCanvas({
        payload: qrPayload,
        size: 1024,
        darkColor,
        lightColor,
        errorCorrectionLevel: errorCorrection,
        logoDataUrl,
        logoSizePercent,
        frameStyle,
        ctaText,
        subText,
      });

      const dataUrl = exportCanvas.toDataURL('image/png');
      exportSinglePdf({
        dataUrl,
        widthMm: 80,
        heightMm: 80,
        filename: `qrcode-${selectedType}.pdf`,
        marginMm: 5,
      });
      toast.success('Downloaded print-ready PDF');
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  const handlePrint = () => {
    playClickSound();
    if (previewContainerRef.current) {
      printHtmlElement(previewContainerRef.current, `QR Code - ${selectedType}`);
    }
  };

  const handleCopyImage = async () => {
    playClickSound();
    if (!previewCanvasRef.current) return;
    try {
      previewCanvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Failed to generate image data');
          return;
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob }),
        ]);
        toast.success('Copied QR Code image to clipboard!');
      }, 'image/png');
    } catch {
      toast.error('Clipboard copy not supported by your browser');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tool Hero Header */}
      <ToolHeroHeader
        badge="HIGH RELIABILITY"
        category="Commerce & Retail"
        title="Advanced QR Code Generator Studio"
        description="Create static QR codes for websites, UPI payments, vCards, Wi-Fi, and social media with center logos, custom call-to-action frames, and instant vector/PNG exports."
        icon={QrCode}
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

            <span className="text-[11px] font-semibold text-slate-400 mx-1 hidden sm:inline">|</span>
            <span className="text-[11px] font-semibold text-slate-400 mr-1 hidden sm:inline">Presets:</span>
            {SAMPLE_QR_PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleLoadSamplePreset(p)}
                className="btn-secondary py-0.5 px-2 text-[11px] font-medium"
              >
                {p.label.split(' ')[0]}
              </button>
            ))}
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
          <QrCode className="w-3.5 h-3.5" />
          <span>Single QR Code Studio</span>
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
          <span>Bulk QR Generator (CSV)</span>
          <span className="text-[9px] font-mono px-1 rounded bg-sky-500/10 text-sky-500">
            {bulkItems.length}
          </span>
        </button>
      </div>

      {/* TAB 1: Single QR Studio */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Panel: Type selector & Inputs (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            {/* QR Type Pills */}
            <div className="bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-white/10 p-3.5 rounded-xl space-y-2.5 shadow-xs">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block">
                Select QR Code Type
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 text-xs">
                {QR_TYPES.map((t) => {
                  const isSelected = selectedType === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        setSelectedType(t.id);
                      }}
                      className={`p-1.5 rounded-xl font-semibold text-[11px] transition-all flex flex-col items-center justify-center gap-1 text-center ${
                        isSelected
                          ? 'bg-sky-500 text-white shadow-xs font-bold'
                          : 'bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.08]'
                      }`}
                    >
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Type-Specific Form Inputs */}
            <div className="glass-panel p-4 rounded-2xl space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-white/[0.06]">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-sky-500" />
                  {QR_TYPES.find((t) => t.id === selectedType)?.label} Payload Data
                </span>
                <span className="text-[10px] font-mono text-emerald-500 font-bold">Live Synced</span>
              </div>

              {/* URL */}
              {selectedType === 'url' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Destination Web URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => handleFieldChange('url', e.target.value)}
                    placeholder="https://example.com"
                    className="w-full text-xs font-mono p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    https:// protocol is automatically prepended if omitted.
                  </p>
                </div>
              )}

              {/* UPI */}
              {selectedType === 'upi' && (
                <div className="space-y-2.5 text-xs">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        Payee UPI VPA ID*
                      </label>
                      {upiValidation.isValid ? (
                        <span className="text-[10px] text-emerald-500 font-bold font-mono">Valid Format</span>
                      ) : (
                        <span className="text-[10px] text-rose-500 font-bold font-mono">Invalid UPI ID</span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={formData.pa}
                      onChange={(e) => handleFieldChange('pa', e.target.value)}
                      placeholder="merchant@okhdfcbank"
                      className="w-full text-xs font-mono p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                    {!upiValidation.isValid && (
                      <p className="text-[10px] text-rose-500 mt-0.5">{upiValidation.error}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Payee Name</label>
                      <input
                        type="text"
                        value={formData.pn}
                        onChange={(e) => handleFieldChange('pn', e.target.value)}
                        placeholder="Store Name"
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Amount (₹ INR)</label>
                      <input
                        type="number"
                        value={formData.am}
                        onChange={(e) => handleFieldChange('am', e.target.value)}
                        placeholder="Optional fixed amount"
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Transaction Note</label>
                    <input
                      type="text"
                      value={formData.tn}
                      onChange={(e) => handleFieldChange('tn', e.target.value)}
                      placeholder="e.g. Order #1234 payment"
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>

                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 leading-tight flex items-start gap-1.5">
                    <Info className="w-3.5 h-3.5 shrink-0 text-amber-500 mt-0.5" />
                    <span>
                      Encodes standard NPCI UPI payment intent URI compatible with Google Pay, PhonePe, Paytm, and BHIM.
                    </span>
                  </div>
                </div>
              )}

              {/* vCard */}
              {selectedType === 'vcard' && (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Full Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Company / Org</label>
                      <input
                        type="text"
                        value={formData.org}
                        onChange={(e) => handleFieldChange('org', e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Address / City</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                    />
                  </div>
                </div>
              )}

              {/* Wi-Fi */}
              {selectedType === 'wifi' && (
                <div className="space-y-2 text-xs">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Network Name (SSID)</label>
                    <input
                      type="text"
                      value={formData.ssid}
                      onChange={(e) => handleFieldChange('ssid', e.target.value)}
                      placeholder="MyHomeWifi"
                      className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Password</label>
                      <input
                        type="text"
                        value={formData.password}
                        onChange={(e) => handleFieldChange('password', e.target.value)}
                        placeholder="Network password"
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Security Type</label>
                      <select
                        value={formData.encryption}
                        onChange={(e) => handleFieldChange('encryption', e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">No Password (Open)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Social */}
              {selectedType === 'social' && (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Platform</label>
                      <select
                        value={formData.platform}
                        onChange={(e) => handleFieldChange('platform', e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      >
                        <option value="whatsapp">WhatsApp Direct Chat</option>
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="youtube">YouTube</option>
                        <option value="twitter">X / Twitter</option>
                        <option value="github">GitHub</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        {formData.platform === 'whatsapp' ? 'Phone (with country code)' : 'Username / Handle'}
                      </label>
                      <input
                        type="text"
                        value={formData.handle}
                        onChange={(e) => handleFieldChange('handle', e.target.value)}
                        placeholder={formData.platform === 'whatsapp' ? '919876543210' : 'username'}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Plain Text & Fallback */}
              {['text', 'phone', 'email', 'sms', 'location', 'product'].includes(selectedType) && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Content
                  </label>
                  <textarea
                    rows={3}
                    value={formData.text}
                    onChange={(e) => handleFieldChange('text', e.target.value)}
                    placeholder="Enter plain text, code, or message..."
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                  />
                </div>
              )}

              {/* Visual Customization: Colors, Logo, Frame */}
              <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-3">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Color Presets & Contrast Checker
                </span>

                <div className="flex flex-wrap items-center gap-1.5">
                  {COLOR_PRESETS.map((cp) => (
                    <button
                      key={cp.id}
                      type="button"
                      onClick={() => handleApplyColorPreset(cp)}
                      className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-medium flex items-center gap-1.5 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cp.dark }} />
                      <span>{cp.label}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Foreground Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={darkColor}
                        onChange={(e) => setDarkColor(e.target.value)}
                        className="w-7 h-7 rounded border cursor-pointer"
                      />
                      <span className="font-mono text-xs">{darkColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Background Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                        className="w-7 h-7 rounded border cursor-pointer"
                      />
                      <span className="font-mono text-xs">{lightColor}</span>
                    </div>
                  </div>
                </div>

                {/* Contrast warning */}
                {isLowContrast && (
                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-500" />
                    <span>
                      Low contrast ratio ({contrastRatio.toFixed(1)}:1). Darker foreground on lighter background is recommended for reliable scanning on older cameras.
                    </span>
                  </div>
                )}

                {/* Center Logo Upload */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                        Center Brand Logo
                      </span>
                      <span className="text-[10px] text-slate-400">Protective quiet mask auto-applied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {logoDataUrl && (
                        <button
                          type="button"
                          onClick={() => setLogoDataUrl(null)}
                          className="text-[10px] text-rose-500 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                      <label className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1 cursor-pointer">
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>{logoDataUrl ? 'Change' : 'Upload'}</span>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  {logoDataUrl && (
                    <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-white/[0.04]">
                      <div className="flex justify-between text-[10px]">
                        <span className="text-slate-400">Logo Scale Ratio</span>
                        <span className="font-mono font-bold text-sky-500">{logoSizePercent}%</span>
                      </div>
                      <input
                        type="range"
                        min={10}
                        max={28}
                        value={logoSizePercent}
                        onChange={(e) => setLogoSizePercent(Number(e.target.value))}
                        className="luxury-range w-full"
                      />
                    </div>
                  )}
                </div>

                {/* Frame & CTA Styling */}
                <div className="pt-2 border-t border-slate-100 dark:border-white/[0.06] space-y-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                    Frame & Call-to-Action Banner
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">Frame Style</label>
                      <select
                        value={frameStyle}
                        onChange={(e) => setFrameStyle(e.target.value)}
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      >
                        {CTA_FRAME_STYLES.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block mb-0.5">CTA Text</label>
                      <input
                        type="text"
                        value={ctaText}
                        onChange={(e) => setCtaText(e.target.value)}
                        placeholder="SCAN ME"
                        className="w-full text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Live Preview & Exports (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Live QR Canvas Display in Studio Desk Stage */}
            <div className="studio-desk-stage p-6 rounded-2xl flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
              {/* Floating Stage Controls */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-20">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 backdrop-blur-md shadow-xs uppercase">
                    {selectedType} QR • {qrPayload.length} Chars
                  </span>
                  <span className="hidden sm:inline-flex text-[10px] font-mono text-emerald-500 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Static
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

              {/* Canvas Card Container with Zoom and 3D Perspective */}
              <div className="pt-8 pb-4 flex justify-center items-center w-full overflow-visible">
                <div
                  ref={previewContainerRef}
                  style={{
                    transform: is3dPerspective
                      ? `perspective(1000px) rotateX(15deg) rotateY(-10deg) rotateZ(2deg) scale(${zoom})`
                      : `scale(${zoom})`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                  className="p-5 rounded-2xl bg-white shadow-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col items-center justify-center studio-card-3d my-4 select-none"
                >
                  <canvas ref={previewCanvasRef} className="max-w-full rounded-xl" />
                </div>
              </div>

              {/* Scan Reliability Assessment Card */}
              <div className="w-full mt-2 p-3.5 rounded-xl border bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-slate-200/80 dark:border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    Scan Reliability Assessment
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${reliability.badgeColor}`}>
                    {reliability.rating} ({reliability.score}/100)
                  </span>
                </div>
                {reliability.warnings.length > 0 && (
                  <div className="space-y-1 pt-1.5 border-t border-slate-100 dark:border-white/[0.06]">
                    {reliability.warnings.map((warn, i) => (
                      <p key={i} className="text-[11px] text-amber-600 dark:text-amber-400 flex items-start gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5 text-amber-500" />
                        <span>{warn}</span>
                      </p>
                    ))}
                    {reliability.recommendations.map((rec, i) => (
                      <p key={`rec-${i}`} className="text-[10px] text-slate-500 dark:text-slate-400 pl-4">
                        💡 {rec}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Payload length and stats */}
              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono text-[11px] mt-2">
                <span>{qrPayload.length} Chars Encoded</span>
                <span>•</span>
                <span>ECC: Level {errorCorrection}</span>
                <span>•</span>
                <span>Contrast: {contrastRatio.toFixed(1)}:1</span>
              </div>
            </div>

            {/* Signature Studio Export Hub */}
            <div className="glass-panel p-5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Signature Studio Export Hub
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      High-resolution PNG, infinite-scale SVG vector, and print-ready PDF
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400 font-semibold font-mono text-[11px]">Resolution:</span>
                  <select
                    value={qrSize}
                    onChange={(e) => setQrSize(parseInt(e.target.value, 10))}
                    className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-mono"
                  >
                    <option value={256}>256px (Web / Mobile)</option>
                    <option value={512}>512px (Standard)</option>
                    <option value={1024}>1024px (High Quality Print)</option>
                    <option value={2048}>2048px (Ultra 300 DPI Print)</option>
                  </select>
                </div>
              </div>

              {/* Primary Download CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="btn-primary btn-shimmer flex items-center justify-center gap-2 py-2.5 text-xs font-bold"
                >
                  <Download className="w-4 h-4" />
                  <span>Download High-Res PNG ({qrSize}px)</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="btn-primary bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-500/20 flex items-center justify-center gap-2 py-2.5 text-xs font-bold"
                >
                  <Globe className="w-4 h-4" />
                  <span>Download Vector SVG (Infinite Scale)</span>
                </button>
              </div>

              {/* Secondary Actions Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="btn-secondary flex items-center justify-center gap-1.5 py-2 text-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-purple-500" />
                  <span>Print-Ready PDF</span>
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
                  onClick={handleCopyImage}
                  className="btn-secondary flex items-center justify-center gap-1.5 py-2 text-xs text-sky-500 hover:text-sky-400"
                  title="Copy QR PNG directly to clipboard"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Image</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveDesign}
                  className="btn-secondary flex items-center justify-center gap-1.5 py-2 text-xs text-indigo-500 hover:text-indigo-400"
                  title="Save QR Code design to Projects"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Project</span>
                </button>
              </div>

              {/* Offline & Privacy Guarantee Banner */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] flex items-start gap-2.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5 text-slate-500 dark:text-slate-400 text-[11px] leading-relaxed">
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Zero-Cloud Static Guarantee
                  </span>
                  Data is rendered client-side directly into the matrix pixels. No external API, tracking redirect, or expiration date. Works completely offline.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Bulk QR Codes */}
      {activeTab === 'bulk' && (
        <div className="glass-panel p-4 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-sky-500" />
                Bulk QR Code Batch Generation
              </h3>
              <p className="text-xs text-slate-500">
                Paste URLs or data strings (one per line or CSV: URL, Label) to batch-generate and download.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadSampleCsv}
              className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5"
              title="Download sample QR CSV template"
            >
              <Download className="w-3.5 h-3.5 text-sky-500" />
              <span>Sample CSV</span>
            </button>
          </div>

          <textarea
            rows={5}
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            className="w-full font-mono text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {bulkItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 flex flex-col items-center justify-between text-center space-y-2"
              >
                <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center p-1">
                  <QRCodeImage payload={item.payload} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate max-w-[140px]">
                    {item.label}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block truncate max-w-[140px]">
                    {item.payload}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    setSelectedType('url');
                    setFormData((prev) => ({ ...prev, url: item.payload }));
                    setActiveTab('single');
                  }}
                  className="text-xs text-sky-600 dark:text-sky-400 font-semibold hover:underline"
                >
                  Edit in Studio
                </button>
              </div>
            ))}
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
        currentTool="qr-code"
        onLoadDesign={handleLoadSavedDesign}
      />

      <ProductLabelStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
      />
    </div>
  );
}

// Mini helper component for rendering bulk QR item thumbnail
function QRCodeImage({ payload }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(payload, { width: 96, margin: 1 })
      .then((url) => setDataUrl(url))
      .catch(() => setDataUrl(''));
  }, [payload]);

  if (!dataUrl) return <span className="text-[10px] text-slate-400">Loading...</span>;
  return <img src={dataUrl} alt="QR" className="w-full h-full object-contain" />;
}
