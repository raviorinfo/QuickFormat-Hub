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

