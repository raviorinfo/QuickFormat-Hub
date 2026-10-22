/**
 * Smart Print Layout Optimizer Engine
 * Calculates physical printable area, hardware unprintable margins,
 * optimal rows/cols yield, and clipping detection across paper sizes.
 * Never silently scales barcodes to preserve physical scanner readability.
 */

export const STANDARD_PAPER_SIZES = [
  { id: 'a4', label: 'A4 Standard (210 × 297 mm)', widthMm: 210, heightMm: 297 },
  { id: 'letter', label: 'US Letter (8.5" × 11" / 215.9 × 279.4 mm)', widthMm: 215.9, heightMm: 279.4 },
  { id: 'a5', label: 'A5 Compact (148 × 210 mm)', widthMm: 148, heightMm: 210 },
  { id: 'thermal_4x6', label: 'Thermal Roll 4" × 6" (101.6 × 152.4 mm)', widthMm: 101.6, heightMm: 152.4 },
];

export const COMMERCIAL_SHEET_PRESETS = [
  {
    id: 'avery-5160',
    label: 'Avery® 5160 / 8160 (30 Labels/Sheet)',
    paperId: 'letter',
    labelWidthMm: 66.7,
    labelHeightMm: 25.4,
    cols: 3,
    rows: 10,
    marginTopMm: 12.7,
    marginLeftMm: 4.8,
    gapXmm: 3.2,
    gapYmm: 0,
    recommendedFor: 'Barcode & Address Labels',
  },
  {
    id: 'avery-5163',
    label: 'Avery® 5163 (10 Labels/Sheet)',
    paperId: 'letter',
    labelWidthMm: 101.6,
    labelHeightMm: 50.8,
    cols: 2,
    rows: 5,
    marginTopMm: 12.7,
    marginLeftMm: 4.8,
    gapXmm: 3.2,
    gapYmm: 0,
    recommendedFor: 'Shipping & Large Price Tags',
  },
  {
    id: 'a4-24up',
    label: 'A4 24-Up Sticker Grid (70 × 36 mm)',
    paperId: 'a4',
    labelWidthMm: 70,
    labelHeightMm: 36,
    cols: 3,
    rows: 8,
    marginTopMm: 4.5,
    marginLeftMm: 0,
    gapXmm: 0,
    gapYmm: 0,
    recommendedFor: 'Standard Retail Barcodes',
  },
  {
    id: 'a4-21up',
    label: 'A4 21-Up Sticker Grid (70 × 42.4 mm)',
    paperId: 'a4',
    labelWidthMm: 70,
    labelHeightMm: 42.4,
    cols: 3,
    rows: 7,
    marginTopMm: 0,
    marginLeftMm: 0,
    gapXmm: 0,
    gapYmm: 0,
    recommendedFor: 'Price Tags & Shelf Talkers',
  },
  {
    id: 'a4-10up-cards',
    label: 'A4 10-Up Business Card Inserts (89 × 51 mm)',
    paperId: 'a4',
    labelWidthMm: 89,
    labelHeightMm: 51,
    cols: 2,
    rows: 5,
    marginTopMm: 10,
    marginLeftMm: 12,
    gapXmm: 4,
    gapYmm: 4,
    recommendedFor: 'Thank You Packaging Inserts',
  },
  {
    id: 'a4-4up-postcard',
    label: 'A4 4-Up A6 Postcards (105 × 148.5 mm)',
    paperId: 'a4',
    labelWidthMm: 105,
    labelHeightMm: 148.5,
    cols: 2,
    rows: 2,
    marginTopMm: 0,
    marginLeftMm: 0,
    gapXmm: 0,
    gapYmm: 0,
    recommendedFor: 'Large Package Slips & Greeting Cards',
  },
];

/**
 * Calculates printable geometry, yield, and clipping boundaries for any custom layout.
 */
export function calculateOptimalPrintLayout({
  paperWidthMm = 210,
  paperHeightMm = 297,
  labelWidthMm = 50,
  labelHeightMm = 25,
  marginTopMm = 10,
  marginLeftMm = 10,
  gapXmm = 3,
  gapYmm = 3,
  unprintableHardwareEdgeMm = 4, // Typical non-bleed desktop printer hardware dead-zone
  printScaleMode = 'actual', // 'actual' (100% exact mm) | 'fit'
}) {
  const warnings = [];

  // Effective printable boundary considering hardware unprintable edge
  const effectiveMarginLeft = Math.max(marginLeftMm, unprintableHardwareEdgeMm);
  const effectiveMarginTop = Math.max(marginTopMm, unprintableHardwareEdgeMm);
  const maxAvailableWidth = paperWidthMm - effectiveMarginLeft - unprintableHardwareEdgeMm;
  const maxAvailableHeight = paperHeightMm - effectiveMarginTop - unprintableHardwareEdgeMm;

  if (labelWidthMm <= 0 || labelHeightMm <= 0) {
    return {
      isValid: false,
      error: 'Invalid label dimensions.',
      cols: 0,
      rows: 0,
      totalYield: 0,
    };
  }

  // Calculate maximum columns and rows that fit on this paper
  const cols = Math.max(1, Math.floor((maxAvailableWidth + gapXmm) / (labelWidthMm + gapXmm)));
  const rows = Math.max(1, Math.floor((maxAvailableHeight + gapYmm) / (labelHeightMm + gapYmm)));
  const totalYield = cols * rows;

  // Calculate actual footprint consumed
  const totalGridWidthMm = cols * labelWidthMm + (cols - 1) * gapXmm;
  const totalGridHeightMm = rows * labelHeightMm + (rows - 1) * gapYmm;

  // Clipping check: does grid extend beyond paper?
  const isClippingX = effectiveMarginLeft + totalGridWidthMm > paperWidthMm;
  const isClippingY = effectiveMarginTop + totalGridHeightMm > paperHeightMm;
  const isClipping = isClippingX || isClippingY;

  if (isClipping) {
    warnings.push(`Grid extends beyond physical paper bounds (Width: ${(effectiveMarginLeft + totalGridWidthMm).toFixed(1)}mm / ${paperWidthMm}mm). Reduce margins or columns.`);
  }

  // Unprintable edge check
  if (marginLeftMm < unprintableHardwareEdgeMm || marginTopMm < unprintableHardwareEdgeMm) {
    warnings.push(`Margins are smaller than the standard printer hardware edge (${unprintableHardwareEdgeMm}mm). Artwork on outer edges may be trimmed on standard desktop printers.`);
  }

  // Paper surface utilization percentage
  const totalLabelArea = totalYield * (labelWidthMm * labelHeightMm);
  const totalPaperArea = paperWidthMm * paperHeightMm;
  const utilizationPercent = Math.min(100, Math.round((totalLabelArea / totalPaperArea) * 100));

  return {
    isValid: true,
    paperWidthMm,
    paperHeightMm,
    labelWidthMm,
    labelHeightMm,
    cols,
    rows,
    totalYield,
    totalGridWidthMm: Number(totalGridWidthMm.toFixed(1)),
    totalGridHeightMm: Number(totalGridHeightMm.toFixed(1)),
    isClipping,
    utilizationPercent,
    printScaleMode,
    scaleNote: printScaleMode === 'actual'
      ? '100% Actual Physical Size (Maintains Barcode/QR Readability)'
      : 'Fit-to-Page (Warning: may slightly shrink barcode line ratios)',
    warnings,
  };
}
