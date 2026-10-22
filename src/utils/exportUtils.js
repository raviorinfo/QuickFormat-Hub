import { jsPDF } from 'jspdf';

/**
 * Downloads a string or blob as a file in the browser.
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Downloads an SVG element or SVG string as an .svg file.
 */
export function downloadSvg(svgElementOrString, filename = 'graphic.svg') {
  let svgString = '';
  if (typeof svgElementOrString === 'string') {
    svgString = svgElementOrString;
  } else if (svgElementOrString instanceof SVGElement) {
    svgString = new XMLSerializer().serializeToString(svgElementOrString);
  } else {
    throw new Error('Invalid SVG element or string');
  }

  // Ensure xmlns attribute is present
  if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
    svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename);
}

/**
 * Downloads an HTML canvas as a high-resolution PNG file.
 */
export function downloadCanvasAsPng(canvas, filename = 'image.png') {
  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, filename);
    }
  }, 'image/png');
}

/**
 * Converts an SVG element or SVG string into a high-DPI HTML Canvas.
 */
export function svgToCanvas(svgElementOrString, targetWidth = 1000, targetHeight = null) {
  return new Promise((resolve, reject) => {
    let svgString = '';
    if (typeof svgElementOrString === 'string') {
      svgString = svgElementOrString;
    } else if (svgElementOrString instanceof SVGElement) {
      svgString = new XMLSerializer().serializeToString(svgElementOrString);
    }

    if (!svgString.includes('xmlns="http://www.w3.org/2000/svg"')) {
      svgString = svgString.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }

    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      const width = targetWidth || img.naturalWidth || 600;
      const height = targetHeight || (img.naturalHeight ? (img.naturalHeight * width) / img.naturalWidth : width);

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      URL.revokeObjectURL(url);
      resolve(canvas);
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}

/**
 * Exports a single image/canvas to a tailored PDF document.
 */
export function exportSinglePdf({
  dataUrl,
  widthMm = 50,
  heightMm = 25,
  filename = 'label.pdf',
  marginMm = 0,
}) {
  const orientation = widthMm > heightMm ? 'landscape' : 'portrait';
  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [widthMm + marginMm * 2, heightMm + marginMm * 2],
  });

  pdf.addImage(dataUrl, 'PNG', marginMm, marginMm, widthMm, heightMm);
  pdf.save(filename);
}

/**
 * Exports an A4 grid of labels / tags / cards into a print-ready PDF.
 */
export function exportA4SheetPdf({
  items, // array of image data URLs or single repeated dataUrl
  itemWidthMm,
  itemHeightMm,
  rows = 8,
  cols = 3,
  marginTopMm = 10,
  marginLeftMm = 10,
  gapXmm = 3,
  gapYmm = 3,
  showCutGuides = false,
  filename = 'sheet-print.pdf',
}) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4', // 210 x 297 mm
  });

  const isArray = Array.isArray(items);
  let itemIndex = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = marginLeftMm + c * (itemWidthMm + gapXmm);
      const y = marginTopMm + r * (itemHeightMm + gapYmm);

      // Don't draw beyond A4 boundaries (210mm x 297mm)
      if (x + itemWidthMm > 210 || y + itemHeightMm > 297) continue;

      const currentItem = isArray ? items[itemIndex] : items;
      if (!currentItem && isArray) break;

      pdf.addImage(currentItem, 'PNG', x, y, itemWidthMm, itemHeightMm);

      if (showCutGuides) {
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineDashPattern([1, 1], 0);
        pdf.rect(x, y, itemWidthMm, itemHeightMm, 'S');
      }

      if (isArray) itemIndex++;
    }
  }

  pdf.save(filename);
}

/**
 * Triggers clean browser printing for an element.
 */
export function printHtmlElement(element, pageTitle = 'QuickFormat Print') {
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
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${pageTitle}</title>
        <style>
          @page {
            size: auto;
            margin: 8mm;
          }
          body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            font-family: system-ui, -apple-system, sans-serif;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          img, svg {
            max-width: 100%;
          }
        </style>
      </head>
      <body>
        ${element.outerHTML}
      </body>
    </html>
  `);
  doc.close();

  iframe.contentWindow.focus();
  setTimeout(() => {
    iframe.contentWindow.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1500);
  }, 400);
}

/**
 * Downloads raw text content as a .csv file.
 */

export function downloadCsv(csvContent, filename = 'template.csv') {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, filename);
}

/**
 * Exports a high-quality single PDF with optional 3mm print bleed and corner crop marks.
 */
export function exportSinglePdfWithBleed({
  dataUrl,
  widthMm = 89,
  heightMm = 51,
  bleedMm = 3,
  showCropMarks = true,
  filename = 'print-card.pdf',
}) {
  const totalWidthMm = widthMm + bleedMm * 2;
  const totalHeightMm = heightMm + bleedMm * 2;
  const orientation = totalWidthMm > totalHeightMm ? 'landscape' : 'portrait';

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [totalWidthMm, totalHeightMm],
  });

  // Render artwork within bleed bounds
  pdf.addImage(dataUrl, 'PNG', 0, 0, totalWidthMm, totalHeightMm);

  // Draw corner crop marks for commercial guillotining
  if (showCropMarks && bleedMm > 0) {
    const markLen = 2.5; // mm
    pdf.setDrawColor(0, 0, 0);
    pdf.setLineWidth(0.15);

    // Top-Left corner
    pdf.line(bleedMm, 0, bleedMm, bleedMm - 0.5); // vertical top
    pdf.line(0, bleedMm, bleedMm - 0.5, bleedMm); // horizontal left

    // Top-Right corner
    pdf.line(bleedMm + widthMm, 0, bleedMm + widthMm, bleedMm - 0.5); // vertical top
    pdf.line(totalWidthMm, bleedMm, totalWidthMm - bleedMm + 0.5, bleedMm); // horizontal right

    // Bottom-Left corner
    pdf.line(bleedMm, totalHeightMm, bleedMm, totalHeightMm - bleedMm + 0.5); // vertical bottom
    pdf.line(0, bleedMm + heightMm, bleedMm - 0.5, bleedMm + heightMm); // horizontal left

    // Bottom-Right corner
    pdf.line(bleedMm + widthMm, totalHeightMm, bleedMm + widthMm, totalHeightMm - bleedMm + 0.5); // vertical bottom
    pdf.line(totalWidthMm, bleedMm + heightMm, totalWidthMm - bleedMm + 0.5, bleedMm + heightMm); // horizontal right
  }

  pdf.save(filename);
}

/**
 * Exports a print-ready 2-page PDF (Page 1: Front, Page 2: Back) with optional 3mm bleed and corner crop marks.
 */
export function exportDualSidedPdfWithBleed({
  frontDataUrl,
  backDataUrl,
  widthMm = 89,
  heightMm = 51,
  bleedMm = 3,
  showCropMarks = true,
  filename = 'dual-sided-card.pdf',
}) {
  const totalWidthMm = widthMm + bleedMm * 2;
  const totalHeightMm = heightMm + bleedMm * 2;
  const orientation = totalWidthMm > totalHeightMm ? 'landscape' : 'portrait';

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [totalWidthMm, totalHeightMm],
  });

  const renderSideWithMarks = (dataUrl) => {
    pdf.addImage(dataUrl, 'PNG', 0, 0, totalWidthMm, totalHeightMm);
    if (showCropMarks && bleedMm > 0) {
      pdf.setDrawColor(0, 0, 0);
      pdf.setLineWidth(0.15);

      // Top-Left corner
      pdf.line(bleedMm, 0, bleedMm, bleedMm - 0.5);
      pdf.line(0, bleedMm, bleedMm - 0.5, bleedMm);

      // Top-Right corner
      pdf.line(bleedMm + widthMm, 0, bleedMm + widthMm, bleedMm - 0.5);
      pdf.line(totalWidthMm, bleedMm, totalWidthMm - bleedMm + 0.5, bleedMm);

      // Bottom-Left corner
      pdf.line(bleedMm, totalHeightMm, bleedMm, totalHeightMm - bleedMm + 0.5);
      pdf.line(0, bleedMm + heightMm, bleedMm - 0.5, bleedMm + heightMm);

      // Bottom-Right corner
      pdf.line(bleedMm + widthMm, totalHeightMm, bleedMm + widthMm, totalHeightMm - bleedMm + 0.5);
      pdf.line(totalWidthMm, bleedMm + heightMm, totalWidthMm - bleedMm + 0.5, bleedMm + heightMm);
    }
  };

  // Page 1: Front Side
  renderSideWithMarks(frontDataUrl);

  // Page 2: Back Side
  if (backDataUrl) {
    pdf.addPage([totalWidthMm, totalHeightMm], orientation);
    renderSideWithMarks(backDataUrl);
  }

  pdf.save(filename);
}

/**
 * Exports a consolidated Multi-Page Packaging & Label Kit PDF for the Unified Product Studio.
 */
export function exportCompletePackagingKitPdf({
  barcodeDataUrl,
  priceTagDataUrl,
  qrCodeDataUrl,
  thankYouCardDataUrl,
  productName = 'Product',
  sku = 'SKU',
  brandName = 'Brand',
  filename = 'complete-packaging-kit.pdf',
}) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Page 1: Executive Overview Sheet
  pdf.setFillColor(15, 23, 42); // slate-900 header
  pdf.rect(0, 0, 210, 36, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(18);
  pdf.setTextColor(255, 255, 255);
  pdf.text('ECOMMERCE PACKAGING & LABEL DOSSIER', 14, 18);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(203, 213, 225); // slate-300
  pdf.text(`Brand: ${brandName}  |  Product: ${productName} (${sku})  |  Generated by QuickFormat Hub`, 14, 28);

  // Grid on Page 1 overview
  pdf.setTextColor(15, 23, 42);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);

  // Asset 1: Barcode Label Preview
  pdf.text('1. Barcode Label', 14, 50);
  if (barcodeDataUrl) {
    pdf.addImage(barcodeDataUrl, 'PNG', 14, 54, 85, 42.5);
  }

  // Asset 2: Price Tag Preview
  pdf.text('2. Price Tag / Shelf Talker', 110, 50);
  if (priceTagDataUrl) {
    pdf.addImage(priceTagDataUrl, 'PNG', 110, 54, 85, 54);
  }

  // Asset 3: Product QR Code Preview
  pdf.text('3. Product QR Code', 14, 120);
  if (qrCodeDataUrl) {
    pdf.addImage(qrCodeDataUrl, 'PNG', 14, 125, 65, 65);
  }

  // Asset 4: Packaging Insert / Thank You Card
  pdf.text('4. Package Insert (Thank You Card)', 95, 120);
  if (thankYouCardDataUrl) {
    pdf.addImage(thankYouCardDataUrl, 'PNG', 95, 125, 100, 57);
  }

  // Footer on Page 1
  pdf.setFont('helvetica', 'italic');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  pdf.text('Pages 2-5 contain individual exact-dimension production assets ready for direct commercial printing.', 14, 285);

  // Page 2: Standalone Barcode Label (50x25mm in center)
  if (barcodeDataUrl) {
    pdf.addPage([100, 60], 'landscape');
    pdf.addImage(barcodeDataUrl, 'PNG', 10, 10, 80, 40);
  }

  // Page 3: Standalone Price Tag (70x45mm)
  if (priceTagDataUrl) {
    pdf.addPage([100, 70], 'landscape');
    pdf.addImage(priceTagDataUrl, 'PNG', 15, 12.5, 70, 45);
  }

  // Page 4: Standalone QR Code
  if (qrCodeDataUrl) {
    pdf.addPage([100, 100], 'portrait');
    pdf.addImage(qrCodeDataUrl, 'PNG', 10, 10, 80, 80);
  }

  // Page 5: Standalone Thank You Card (89x51mm with 3mm bleed)
  if (thankYouCardDataUrl) {
    pdf.addPage([95, 57], 'landscape');
    pdf.addImage(thankYouCardDataUrl, 'PNG', 3, 3, 89, 51);
  }

  pdf.save(filename);
}

/**
 * Exports multi-page print-ready label sheets with exact physical sheet dimensions,
 * coordinates, cut lines, and pagination.
 */
export function exportMultiPageSheetPdf({
  pages = [],
  paperWidthMm = 210,
  paperHeightMm = 297,
  orientation = 'portrait',
  showCutGuides = true,
  filename = 'label-sheet-print.pdf',
  fallbackDataUrl = null,
}) {
  if (!pages || pages.length === 0) {
    throw new Error('No pages to export.');
  }

  const pdf = new jsPDF({
    orientation,
    unit: 'mm',
    format: [paperWidthMm, paperHeightMm],
  });

  pages.forEach((page, pageIdx) => {
    if (pageIdx > 0) {
      pdf.addPage([paperWidthMm, paperHeightMm], orientation);
    }

    if (page.labels && page.labels.length > 0) {
      page.labels.forEach((label) => {
        const img = label.dataUrl || label.item?.dataUrl || fallbackDataUrl;
        if (img) {
          try {
            pdf.addImage(img, 'PNG', label.xMm, label.yMm, label.widthMm, label.heightMm);
          } catch (err) {
            console.warn('PDF image rendering skipped for slot', err);
          }
        } else {
          // Render crisp vector card for each label with responsive typography & 2-line name wrapping
          const item = label.item || {};
          const w = label.widthMm;
          const h = label.heightMm;
          const isCompact = h < 34 || w < 44;
          const isUltraCompact = h < 26 || w < 38;
          const bannerHeight = isUltraCompact ? 2.8 : 3.5;
          const titleSizePt = Math.max(5.5, Math.min(8.5, w * 0.08 + h * 0.055));
          const subSizePt = Math.max(4.5, titleSizePt * 0.72);
          const priceSizePt = Math.max(5.5, titleSizePt * 0.85);

          pdf.setFillColor(255, 255, 255);
          pdf.rect(label.xMm, label.yMm, w, h, 'F');

          // Optional header banner
          if (item.headerBg || item.badgeText || item.headerTitle) {
            pdf.setFillColor(15, 23, 42);
            pdf.rect(label.xMm, label.yMm, w, bannerHeight, 'F');
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(subSizePt);
            pdf.setTextColor(255, 255, 255);
            const title = item.headerTitle || item.badgeText || 'MAXIMUM RETAIL PRICE';
            pdf.text(String(title).toUpperCase(), label.xMm + w / 2, label.yMm + bannerHeight * 0.75, { align: 'center' });
          }

          const hasBanner = !!(item.headerBg || item.badgeText || item.headerTitle);
          let currentY = label.yMm + (hasBanner ? bannerHeight + 2.2 : 2.8);

          // Brand (only if not ultra compact)
          if (item.brand && !isUltraCompact) {
            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(subSizePt);
            pdf.setTextColor(100, 116, 139);
            pdf.text(String(item.brand).toUpperCase(), label.xMm + 1.8, currentY);
            currentY += subSizePt * 0.45 + 0.6;
          }

          // Product Name with multi-line auto-wrap using splitTextToSize (prevents truncation)
          const rawName = String(item.name || item.productName || 'Product Label');
          const maxNameWidth = Math.max(8, w - 3.6);
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(titleSizePt);
          pdf.setTextColor(15, 23, 42);
          const splitLines = pdf.splitTextToSize(rawName, maxNameWidth);
          const linesToRender = splitLines.slice(0, 2);
          linesToRender.forEach((lText) => {
            pdf.text(lText, label.xMm + 1.8, currentY);
            currentY += titleSizePt * 0.45 + 0.5;
          });

          // Variant / Pack size (if not compact)
          if ((item.variant || item.packSize) && !isCompact) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(subSizePt);
            pdf.setTextColor(100, 116, 139);
            const varText = [item.variant, item.packSize].filter(Boolean).join(' • ');
            pdf.text(varText, label.xMm + 1.8, currentY);
          }

          const footerY = label.yMm + h - 1.5;
          const dividerY = footerY - priceSizePt * 0.45 - 0.8;
          const barcodeY = dividerY - 1.2;

          // Barcode / SKU text
          const bVal = item.barcodeValue || item.barcode || item.sku || '';
          if (bVal && !isUltraCompact) {
            pdf.setFont('courier', 'bold');
            pdf.setFontSize(Math.max(5, subSizePt));
            pdf.setTextColor(71, 85, 105);
            pdf.text(String(bVal), label.xMm + w / 2, barcodeY, { align: 'center' });
          }

          // Price line divider
          pdf.setDrawColor(226, 232, 240);
          pdf.setLineWidth(0.18);
          pdf.line(label.xMm + 1.2, dividerY, label.xMm + w - 1.2, dividerY);

          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(priceSizePt);
          pdf.setTextColor(15, 23, 42);
          pdf.text(`MRP: Rs.${item.mrp || 0}`, label.xMm + 1.8, footerY);

          if (item.sellingPrice) {
            pdf.setTextColor(5, 150, 105);
            pdf.text(`Offer: Rs.${item.sellingPrice}`, label.xMm + w - 1.8, footerY, { align: 'right' });
          }
        }

        if (showCutGuides) {
          pdf.setDrawColor(210, 210, 210);
          pdf.setLineWidth(0.1);
          pdf.setLineDashPattern([1, 1], 0);
          pdf.rect(label.xMm, label.yMm, label.widthMm, label.heightMm, 'S');
        }
      });
    }

    // Optional subtle page number watermark in bottom margin
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(180, 180, 180);
    pdf.text(
      `Page ${page.pageNumber || pageIdx + 1} of ${pages.length} — QuickFormat Hub Label Sheet`,
      paperWidthMm / 2,
      paperHeightMm - 3,
      { align: 'center' }
    );
  });

  pdf.save(filename);
}


