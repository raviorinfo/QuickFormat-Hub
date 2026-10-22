/**
 * Automatic Label Sheet Layout & Pagination Engine
 * Module 3: Intelligent arrangement of single or multiple labels across
 * standard sheets (A4, A5, Letter, Avery presets, thermal rolls) with multi-page pagination.
 */

export const PAPER_FORMATS = [
  { id: 'a4', name: 'A4 Standard (210 × 297 mm)', widthMm: 210, heightMm: 297 },
  { id: 'letter', name: 'US Letter (215.9 × 279.4 mm / 8.5" × 11")', widthMm: 215.9, heightMm: 279.4 },
  { id: 'a5', name: 'A5 Compact (148 × 210 mm)', widthMm: 148, heightMm: 210 },
  { id: 'thermal_4x6', name: 'Thermal Shipping Roll 4" × 6" (101.6 × 152.4 mm)', widthMm: 101.6, heightMm: 152.4 },
  { id: 'custom', name: 'Custom Paper Dimensions', widthMm: 210, heightMm: 297 },
];

export const SHEET_PRESETS = [
  {
    id: 'a4-24up',
    name: 'A4 24-Up Retail Sticker Grid (3 × 8)',
    paperFormat: 'a4',
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
    description: 'Popular European & Asian retail barcode sticker standard (24 labels/sheet)',
  },
  {
    id: 'a4-21up',
    name: 'A4 21-Up Shelf Talker Grid (3 × 7)',
    paperFormat: 'a4',
    labelWidthMm: 70,
    labelHeightMm: 42.4,
    cols: 3,
    rows: 7,
    marginTopMm: 0,
    marginBottomMm: 0,
    marginLeftMm: 0,
    marginRightMm: 0,
    gapXmm: 0,
    gapYmm: 0,
    description: 'Ideal for retail supermarket price tags & shelf edge talkers',
  },
  {
    id: 'a4-12up',
    name: 'A4 12-Up Large Label Grid (2 × 6)',
    paperFormat: 'a4',
    labelWidthMm: 105,
    labelHeightMm: 48,
    cols: 2,
    rows: 6,
    marginTopMm: 4.5,
    marginBottomMm: 4.5,
    marginLeftMm: 0,
    marginRightMm: 0,
    gapXmm: 0,
    gapYmm: 0,
    description: 'Great for master carton inventory labels & parcel dispatch',
  },
  {
    id: 'a4-65up',
    name: 'A4 65-Up High-Density Mini Grid (5 × 13)',
    paperFormat: 'a4',
    labelWidthMm: 38.1,
    labelHeightMm: 21.2,
    cols: 5,
    rows: 13,
    marginTopMm: 10.7,
    marginBottomMm: 10.7,
    marginLeftMm: 4.7,
    marginRightMm: 4.7,
    gapXmm: 0,
    gapYmm: 0,
    description: 'Ultra-compact barcode labels for jewelry, cosmetics, and small parts',
  },
  {
    id: 'avery-5160',
    name: 'Avery® 5160 / 8160 Address & Barcode (3 × 10)',
    paperFormat: 'letter',
    labelWidthMm: 66.7,
    labelHeightMm: 25.4,
    cols: 3,
    rows: 10,
    marginTopMm: 12.7,
    marginBottomMm: 12.7,
    marginLeftMm: 4.8,
    marginRightMm: 4.8,
    gapXmm: 3.2,
    gapYmm: 0,
    description: 'North American standard 30-up mailing & FBA inventory sticker',
  },
  {
    id: 'avery-5163',
    name: 'Avery® 5163 Shipping Label (2 × 5)',
    paperFormat: 'letter',
    labelWidthMm: 101.6,
    labelHeightMm: 50.8,
    cols: 2,
    rows: 5,
    marginTopMm: 12.7,
    marginBottomMm: 12.7,
    marginLeftMm: 4.8,
    marginRightMm: 4.8,
    gapXmm: 3.2,
    gapYmm: 0,
    description: 'Large package shipping & barcode identification label (10 labels/sheet)',
  },
  {
    id: 'thermal-single',
    name: 'Continuous Single Label Roll (1 × 1)',
    paperFormat: 'thermal_4x6',
    labelWidthMm: 100,
    labelHeightMm: 150,
    cols: 1,
    rows: 1,
    marginTopMm: 1,
    marginBottomMm: 1,
    marginLeftMm: 0.8,
    marginRightMm: 0.8,
    gapXmm: 0,
    gapYmm: 0,
    description: 'Direct thermal & thermal transfer continuous roll printers (Zebra, TSC)',
  },
  {
    id: 'custom-grid',
    name: 'Custom Sheet Configuration',
    paperFormat: 'a4',
    labelWidthMm: 70,
    labelHeightMm: 45,
    cols: 2,
    rows: 6,
    marginTopMm: 10,
    marginBottomMm: 10,
    marginLeftMm: 10,
    marginRightMm: 10,
    gapXmm: 4,
    gapYmm: 4,
    description: 'User-defined grid with custom rows, columns, gaps, and margins',
  },
];

/**
 * Calculates complete sheet geometry, placement coordinates, and multi-page pagination.
 */
export function calculateSheetArrangement({
  paperFormatId = 'a4',
  customPaperWidthMm = 210,
  customPaperHeightMm = 297,
  orientation = 'portrait',
  labelWidthMm = 70,
  labelHeightMm = 45,
  cols = null, // auto-calculated if null
  rows = null, // auto-calculated if null
  marginTopMm = 10,
  marginBottomMm = 10,
  marginLeftMm = 10,
  marginRightMm = 10,
  gapXmm = 3,
  gapYmm = 3,
  items = [], // array of items, each can have .quantity
  repeatItem = null, // single item repeated to fill or totalCount
  repeatCount = null,
  printQuantityMode = 'auto', // 'auto' | 'fill-sheet' | 'custom-copies' | 'from-items' | 'single'
  customCopies = null,
  alignment = 'center', // 'center' | 'left'
  readingOrder = 'row-first', // 'row-first' | 'col-first'
  showCutGuides = true,
}) {
  const warnings = [];

  // Determine physical sheet dimensions
  const format = PAPER_FORMATS.find((p) => p.id === paperFormatId) || PAPER_FORMATS[0];
  let rawPaperW = paperFormatId === 'custom' ? customPaperWidthMm : format.widthMm;
  let rawPaperH = paperFormatId === 'custom' ? customPaperHeightMm : format.heightMm;

  if (orientation === 'landscape' && rawPaperW < rawPaperH) {
    [rawPaperW, rawPaperH] = [rawPaperH, rawPaperW];
  } else if (orientation === 'portrait' && rawPaperW > rawPaperH) {
    [rawPaperW, rawPaperH] = [rawPaperH, rawPaperW];
  }

  const paperWidthMm = rawPaperW;
  const paperHeightMm = rawPaperH;

  // Usable printable space
  const usableWidthMm = Math.max(0, paperWidthMm - marginLeftMm - marginRightMm);
  const usableHeightMm = Math.max(0, paperHeightMm - marginTopMm - marginBottomMm);

  if (labelWidthMm <= 0 || labelHeightMm <= 0) {
    return {
      isValid: false,
      error: 'Label dimensions must be greater than zero.',
      pages: [],
      totalLabels: 0,
      totalPages: 0,
      maxFittingCols: 1,
      maxFittingRows: 1,
      recommendedCols: 1,
      recommendedRows: 1,
      isOverflown: false,
      warnings: ['Invalid label width or height.'],
    };
  }

  // Max fitting calculation
  const maxFittingCols = Math.max(1, Math.floor((usableWidthMm + gapXmm) / (labelWidthMm + gapXmm)));
  const maxFittingRows = Math.max(1, Math.floor((usableHeightMm + gapYmm) / (labelHeightMm + gapYmm)));

  // Use explicit cols/rows if provided and valid, else fitting max
  const activeCols = cols && cols > 0 ? cols : maxFittingCols;
  const activeRows = rows && rows > 0 ? rows : maxFittingRows;
  const capacityPerPage = Math.max(1, activeCols * activeRows);

  // Footprint check
  const totalGridWidthMm = activeCols * labelWidthMm + (activeCols - 1) * gapXmm;
  const totalGridHeightMm = activeRows * labelHeightMm + (activeRows - 1) * gapYmm;
  const isOverflown = totalGridWidthMm > usableWidthMm || totalGridHeightMm > usableHeightMm;

  if (totalGridWidthMm > usableWidthMm) {
    warnings.push(`Total columns width (${totalGridWidthMm.toFixed(1)}mm) exceeds usable page width (${usableWidthMm.toFixed(1)}mm). Labels will clip or spill.`);
  }
  if (totalGridHeightMm > usableHeightMm) {
    warnings.push(`Total rows height (${totalGridHeightMm.toFixed(1)}mm) exceeds usable page height (${usableHeightMm.toFixed(1)}mm). Labels will clip or spill.`);
  }

  // Horizontal offset for centering if requested
  let startX = marginLeftMm;
  if (alignment === 'center' && usableWidthMm > totalGridWidthMm) {
    startX = marginLeftMm + (usableWidthMm - totalGridWidthMm) / 2;
  }
  let startY = marginTopMm;
  if (alignment === 'center' && usableHeightMm > totalGridHeightMm) {
    startY = marginTopMm + (usableHeightMm - totalGridHeightMm) / 2;
  }

  // Determine source list of items
  const sourceItems = (items && items.length > 0) ? items : (repeatItem ? [repeatItem] : []);

  // Expand items array respecting printQuantityMode
  let expandedList = [];

  if (printQuantityMode === 'single') {
    // Only 1 single label
    if (sourceItems.length > 0) {
      expandedList.push({
        ...sourceItems[0],
        _instanceIndex: 0,
        _copyNumber: 1,
        _totalCopies: 1,
      });
    }
  } else if (printQuantityMode === 'fill-sheet') {
    // Fill every slot of the sheet
    const targetCount = capacityPerPage;
    if (sourceItems.length > 0) {
      for (let i = 0; i < targetCount; i++) {
        const base = sourceItems[i % sourceItems.length];
        expandedList.push({
          ...base,
          _instanceIndex: i,
          _copyNumber: i + 1,
          _totalCopies: targetCount,
        });
      }
    }
  } else if (printQuantityMode === 'custom-copies' && customCopies && customCopies > 0) {
    // Custom number of copies
    if (sourceItems.length > 0) {
      for (let i = 0; i < customCopies; i++) {
        const base = sourceItems[i % sourceItems.length];
        expandedList.push({
          ...base,
          _instanceIndex: i,
          _copyNumber: i + 1,
          _totalCopies: customCopies,
        });
      }
    }
  } else if (sourceItems.length > 0) {
    // 'auto' or 'from-items'
    if (
      sourceItems.length === 1 &&
      (!sourceItems[0].quantity || sourceItems[0].quantity === 1) &&
      printQuantityMode !== 'from-items'
    ) {
      // Single product without explicit multi-quantity => default to filling the sheet!
      const targetCount = repeatCount && repeatCount > 0 ? repeatCount : capacityPerPage;
      for (let i = 0; i < targetCount; i++) {
        expandedList.push({
          ...sourceItems[0],
          _instanceIndex: i,
          _copyNumber: i + 1,
          _totalCopies: targetCount,
        });
      }
    } else {
      // Expand each item by its .quantity
      sourceItems.forEach((item, itemIdx) => {
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        for (let q = 0; q < qty; q++) {
          expandedList.push({
            ...item,
            _instanceIndex: expandedList.length,
            _copyNumber: q + 1,
            _totalCopies: qty,
            _sourceItemIndex: itemIdx,
          });
        }
      });
    }
  }

  const totalLabels = expandedList.length;
  const totalPages = Math.max(1, Math.ceil(totalLabels / capacityPerPage));

  // Multi-page layout assignment
  const pages = [];
  let itemPointer = 0;

  for (let p = 0; p < totalPages; p++) {
    const pageLabels = [];

    if (readingOrder === 'col-first') {
      for (let c = 0; c < activeCols; c++) {
        for (let r = 0; r < activeRows; r++) {
          if (itemPointer < totalLabels) {
            const item = expandedList[itemPointer];
            const x = startX + c * (labelWidthMm + gapXmm);
            const y = startY + r * (labelHeightMm + gapYmm);

            pageLabels.push({
              pageNumber: p + 1,
              slotIndex: r * activeCols + c,
              col: c,
              row: r,
              xMm: x,
              yMm: y,
              widthMm: labelWidthMm,
              heightMm: labelHeightMm,
              item,
            });
            itemPointer++;
          }
        }
      }
    } else {
      // Row-first (standard Western reading order)
      for (let r = 0; r < activeRows; r++) {
        for (let c = 0; c < activeCols; c++) {
          if (itemPointer < totalLabels) {
            const item = expandedList[itemPointer];
            const x = startX + c * (labelWidthMm + gapXmm);
            const y = startY + r * (labelHeightMm + gapYmm);

            pageLabels.push({
              pageNumber: p + 1,
              slotIndex: r * activeCols + c,
              col: c,
              row: r,
              xMm: x,
              yMm: y,
              widthMm: labelWidthMm,
              heightMm: labelHeightMm,
              item,
            });
            itemPointer++;
          }
        }
      }
    }

    pages.push({
      pageNumber: p + 1,
      labels: pageLabels,
      labelCount: pageLabels.length,
      emptySlots: capacityPerPage - pageLabels.length,
    });
  }

  return {
    isValid: true,
    paperWidthMm,
    paperHeightMm,
    usableWidthMm,
    usableHeightMm,
    cols: activeCols,
    rows: activeRows,
    maxFittingCols,
    maxFittingRows,
    recommendedCols: maxFittingCols,
    recommendedRows: maxFittingRows,
    isOverflown,
    capacityPerPage,
    totalLabels,
    totalPages,
    pages,
    startX,
    startY,
    labelWidthMm,
    labelHeightMm,
    gapXmm,
    gapYmm,
    showCutGuides,
    warnings,
  };
}
