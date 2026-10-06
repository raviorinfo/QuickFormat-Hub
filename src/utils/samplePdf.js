/**
 * Creates a valid, standalone multi-page PDF ArrayBuffer in memory
 * for instant demo rendering without requiring external file downloads.
 */

export function createSamplePdfBytes() {
  const contentPage1 = `BT
/F1 20 Tf
50 720 Td
(QuickFormat Hub - Engineering Spec) Tj
0 -30 Td
/F2 12 Tf
(Version 2.4 - Client-Side Architecture) Tj
0 -40 Td
/F1 14 Tf
(1. Executive Summary) Tj
0 -25 Td
/F2 11 Tf
(QuickFormat Hub executes all data operations directly within client browser memory.) Tj
0 -18 Td
(This zero-server paradigm guarantees absolute data sovereignty and minimal latency.) Tj
0 -35 Td
/F1 14 Tf
(2. Key Security Principles) Tj
0 -25 Td
/F2 11 Tf
(- Zero cloud telemetry or external logging) Tj
0 -18 Td
(- Client-side AST parsing and PDF rasterization) Tj
0 -18 Td
(- End-to-end sandbox isolation in JavaScript) Tj
0 -40 Td
/F1 14 Tf
(3. Performance Benchmarks) Tj
0 -25 Td
/F2 11 Tf
(Processing 10,000 JSON or CSV rows completes in under 15 milliseconds on modern V8 engines.) Tj
ET`;

  const contentPage2 = `BT
/F1 20 Tf
50 720 Td
(Appendix A: Extracted Data Structures) Tj
0 -35 Td
/F1 14 Tf
(4. Supported Data Formats) Tj
0 -25 Td
/F2 11 Tf
(The following formats are natively supported for parsing and export:) Tj
0 -22 Td
(1. JSON to CSV and TSV spreadsheets) Tj
0 -18 Td
(2. CSV and TSV to nested JSON trees) Tj
0 -18 Td
(3. GitHub Flavored Markdown to HTML and PDF) Tj
0 -18 Td
(4. Text and Code diff comparison) Tj
0 -18 Td
(5. Base64 encoding and image data URLs) Tj
0 -18 Td
(6. URL query parameters and routing components) Tj
0 -40 Td
/F1 14 Tf
(5. Compliance Certification) Tj
0 -25 Td
/F2 11 Tf
(All data remains on user device memory. Compliant with HIPAA, GDPR, and enterprise privacy standards.) Tj
ET`;

  const stream1 = contentPage1;
  const stream2 = contentPage2;

  const pdfString = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> >>
endobj
4 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 6 0 R /Resources << /Font << /F1 7 0 R /F2 8 0 R >> >> >>
endobj
5 0 obj
<< /Length ${stream1.length} >>
stream
${stream1}
endstream
endobj
6 0 obj
<< /Length ${stream2.length} >>
stream
${stream2}
endstream
endobj
7 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj
8 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 9
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000236 00000 n 
0000000357 00000 n 
0000000424 00000 n 
0000000491 00000 n 
0000000569 00000 n 
trailer
<< /Size 9 /Root 1 0 R >>
startxref
642
%%EOF`;

  const bytes = new Uint8Array(pdfString.length);
  for (let i = 0; i < pdfString.length; i++) {
    bytes[i] = pdfString.charCodeAt(i) & 0xff;
  }
  return bytes.buffer;
}
