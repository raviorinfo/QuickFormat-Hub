/**
 * Robust Client-Side cURL command parser and multi-language code generator
 */

export function parseCurl(curlString) {
  if (!curlString || !curlString.trim()) {
    return null;
  }

  // Clean multiline escapes (backslashes at end of lines)
  const cleaned = curlString.replace(/\\\r?\n/g, ' ').trim();

  // Match URL
  let url = '';
  const urlMatch = cleaned.match(/curl\s+(?:-[^\s]+\s+)*['"]?(https?:\/\/[^\s'"\\]+)['"]?/i) ||
                   cleaned.match(/['"](https?:\/\/[^\s'"]+)['"]/i) ||
                   cleaned.match(/(https?:\/\/[^\s'"]+)/i);
  if (urlMatch) {
    url = urlMatch[1];
  }

  // Match Method
  let method = 'GET';
  const methodMatch = cleaned.match(/-X\s+['"]?([A-Z]+)['"]?/i) ||
                      cleaned.match(/--request\s+['"]?([A-Z]+)['"]?/i);
  if (methodMatch) {
    method = methodMatch[1].toUpperCase();
  }

  // Match Headers
  const headers = {};
  const headerRegex = /(?:-H|--header)\s+['"]([^'"]+)['"]/g;
  let hMatch;
  while ((hMatch = headerRegex.exec(cleaned)) !== null) {
    const headerLine = hMatch[1];
    const colonIdx = headerLine.indexOf(':');
    if (colonIdx > -1) {
      const key = headerLine.slice(0, colonIdx).trim();
      const val = headerLine.slice(colonIdx + 1).trim();
      headers[key] = val;
    }
  }

  // Match Data / Body
  let data = null;
  const dataRegex = /(?:-d|--data|--data-raw|--data-binary)\s+['"]([\s\S]*?)['"](?=\s+-[A-Za-z]|\s*$)/g;
  const dMatches = [];
  let dMatch;
  while ((dMatch = dataRegex.exec(cleaned)) !== null) {
    dMatches.push(dMatch[1]);
  }

  if (dMatches.length > 0) {
    data = dMatches.join('&');
    if (method === 'GET') method = 'POST';
  }

  // Check if data is valid JSON
  let isJson = false;
  let parsedJson = null;
  if (data) {
    try {
      parsedJson = JSON.parse(data);
      isJson = true;
    } catch {
      isJson = false;
    }
  }

  return {
    url,
    method,
    headers,
    data,
    isJson,
    parsedJson,
  };
}

export function generateFetchCode({ url, method, headers, data, isJson }) {
  const options = {
    method,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  };

  let bodyCode = '';
  if (data) {
    if (isJson) {
      bodyCode = `\n  body: JSON.stringify(${data.trim()}),`;
    } else {
      bodyCode = `\n  body: ${JSON.stringify(data)},`;
    }
  }

  const headersFormatted = Object.keys(headers).length > 0
    ? `\n  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')},`
    : '';

  return `// JavaScript Modern Fetch (Async / Await)
async function sendRequest() {
  const response = await fetch("${url}", {
    method: "${method}",${headersFormatted}${bodyCode}
  });

  const result = await response.json();
  console.log(result);
  return result;
}

sendRequest();`;
}

export function generateAxiosCode({ url, method, headers, data, isJson }) {
  const headersFormatted = Object.keys(headers).length > 0
    ? `\n  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, '\n  ')},`
    : '';

  const dataFormatted = data
    ? isJson
      ? `\n  data: ${data.trim()},`
      : `\n  data: ${JSON.stringify(data)},`
    : '';

  return `// Axios HTTP Client
import axios from 'axios';

async function sendRequest() {
  const config = {
    method: '${method.toLowerCase()}',
    url: '${url}',${headersFormatted}${dataFormatted}
  };

  const response = await axios(config);
  console.log(response.data);
  return response.data;
}

sendRequest();`;
}

export function generatePythonRequests({ url, method, headers, data, isJson }) {
  let bodyParam = '';
  if (data) {
    if (isJson) {
      bodyParam = `\n    json=${JSON.stringify(JSON.parse(data), null, 4).replace(/\n/g, '\n    ')},`;
    } else {
      bodyParam = `\n    data=${JSON.stringify(data)},`;
    }
  }

  const headersFormatted = Object.keys(headers).length > 0
    ? `\n    headers=${JSON.stringify(headers, null, 4).replace(/\n/g, '\n    ')},`
    : '';

  return `# Python Requests
import requests

url = "${url}"${headersFormatted ? `\nheaders = ${JSON.stringify(headers, null, 4)}` : ''}

response = requests.${method.toLowerCase()}(
    url,${headersFormatted ? '\n    headers=headers,' : ''}${bodyParam}
)

print(response.status_code)
print(response.json())`;
}

export function generateGoCode({ url, method, headers, data }) {
  let bodyPayload = 'nil';
  let bodySetup = '';
  if (data) {
    bodySetup = `\n\tpayload := strings.NewReader(${JSON.stringify(data)})\n`;
    bodyPayload = 'payload';
  }

  let headerSetters = '';
  for (const [k, v] of Object.entries(headers)) {
    headerSetters += `\treq.Header.Set("${k}", "${v}")\n`;
  }

  return `// Go net/http
package main

import (
\t"fmt"
\t"io"
\t"net/http"
\t"strings"
)

func main() {${bodySetup}
\treq, err := http.NewRequest("${method}", "${url}", ${bodyPayload})
\tif err != nil {
\t\tpanic(err)
\t}
${headerSetters}
\tclient := &http.Client{}
\tres, err := client.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer res.Body.Close()

\tbody, _ := io.ReadAll(res.Body)
\tfmt.Println(string(body))
}`;
}

export const SAMPLE_CURL = `curl -X POST "https://api.quickformat.app/v1/documents/process" \\
  -H "Authorization: Bearer qf_sec_token_983109283" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "documentId": "DOC-9021",
    "format": "csv",
    "notifyWebhook": true,
    "options": {
      "flatten": true,
      "maxRows": 5000
    }
  }'`;
