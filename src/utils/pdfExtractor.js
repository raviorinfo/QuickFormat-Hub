import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// Configure worker URL from Vite bundled assets
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * Loads a PDF document from ArrayBuffer
 */
export async function loadPdfDocument(arrayBuffer) {
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.624/cmaps/',
    cMapPacked: true,
  });
  return await loadingTask.promise;
}

/**
 * Renders a specific page onto an HTML5 Canvas element
 */
export async function renderPdfPage(pdfDoc, pageNum, canvas, scale = 1.25) {
  if (!pdfDoc || !canvas) return null;
  const page = await pdfDoc.getPage(pageNum);
  const viewport = page.getViewport({ scale });

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  const canvasContext = canvas.getContext('2d');
  const renderContext = {
    canvasContext,
    viewport,
  };

  await page.render(renderContext).promise;
  return { width: viewport.width, height: viewport.height };
}

/**
 * Extracts structured text from a PDF page and converts it into Markdown
 */
export async function extractPageTextAsMarkdown(pdfDoc, pageNum) {
  const page = await pdfDoc.getPage(pageNum);
  const textContent = await page.getTextContent();
  const items = textContent.items;

  if (!items || items.length === 0) {
    return '';
  }

  // Sort items by Y coordinate descending (top to bottom), then X ascending (left to right)
  const sortedItems = [...items].sort((a, b) => {
    const yA = a.transform[5];
    const yB = b.transform[5];
    if (Math.abs(yA - yB) > 3) {
      return yB - yA; // top to bottom
    }
    return a.transform[4] - b.transform[4]; // left to right
  });

  // Calculate average font height across items to detect headers
  const fontHeights = sortedItems
    .map((item) => Math.abs(item.transform[0]) || Math.abs(item.transform[3]) || item.height || 10)
    .filter((h) => h > 0);
  const avgHeight = fontHeights.length > 0 ? fontHeights.reduce((a, b) => a + b, 0) / fontHeights.length : 12;

  const lines = [];
  let currentLine = [];
  let lastY = null;
  let lastHeight = avgHeight;

  sortedItems.forEach((item) => {
    const text = item.str.trim();
    if (!text) return;

    const y = item.transform[5];
    const height = Math.abs(item.transform[0]) || Math.abs(item.transform[3]) || item.height || avgHeight;

    if (lastY === null) {
      currentLine.push(text);
      lastY = y;
      lastHeight = height;
    } else if (Math.abs(y - lastY) <= 4) {
      // Same line
      currentLine.push(text);
    } else {
      // New line
      const lineStr = currentLine.join(' ');
      lines.push({ text: lineStr, height: lastHeight, yJump: Math.abs(y - lastY) });
      currentLine = [text];
      lastY = y;
      lastHeight = height;
    }
  });

  if (currentLine.length > 0) {
    lines.push({ text: currentLine.join(' '), height: lastHeight, yJump: 10 });
  }

  // Convert lines into Markdown
  const markdownBlocks = [];

  lines.forEach((line) => {
    const trimmed = line.text.trim();
    if (!trimmed) return;

    const isLargeHeader = line.height >= avgHeight * 1.45;
    const isMediumHeader = line.height >= avgHeight * 1.2 && line.height < avgHeight * 1.45;

    if (isLargeHeader) {
      markdownBlocks.push(`\n## ${trimmed}\n`);
    } else if (isMediumHeader) {
      markdownBlocks.push(`\n### ${trimmed}\n`);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
      const cleanList = trimmed.replace(/^[•*]\s*/, '- ');
      markdownBlocks.push(cleanList);
    } else if (/^\d+\.\s/.test(trimmed)) {
      markdownBlocks.push(trimmed);
    } else {
      markdownBlocks.push(trimmed);
    }
  });

  return markdownBlocks.join('\n');
}

/**
 * Extracts the entire PDF document into complete Markdown
 */
export async function extractEntirePdfAsMarkdown(pdfDoc) {
  if (!pdfDoc) return '';
  const numPages = pdfDoc.numPages;
  const pageMarkdownList = [];

  for (let i = 1; i <= numPages; i++) {
    const pageMd = await extractPageTextAsMarkdown(pdfDoc, i);
    pageMarkdownList.push(`<!-- Page ${i} -->\n${pageMd}`);
  }

  return pageMarkdownList.join('\n\n---\n\n');
}
