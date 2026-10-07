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

export function generatePythonHttpx({ url, method, headers, data, isJson }) {
  let bodyParam = '';
  if (data) {
    if (isJson) {
      bodyParam = `\n    json=${JSON.stringify(JSON.parse(data), null, 4).replace(/\n/g, '\n    ')},`;
    } else {
      bodyParam = `\n    content=${JSON.stringify(data)},`;
    }
  }

  const headersFormatted = Object.keys(headers).length > 0
    ? `\nheaders = ${JSON.stringify(headers, null, 4)}\n`
    : '';

  return `# Python httpx (Async Client)
import httpx
import asyncio

async def main():
    url = "${url}"
${headersFormatted}    async with httpx.AsyncClient() as client:
        response = await client.request(
            "${method}",
            url,${headersFormatted ? '\n            headers=headers,' : ''}${bodyParam}
        )
        print(response.status_code)
        print(response.text)

asyncio.run(main())`;
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

export function generateRustReqwest({ url, method, headers, data }) {
  let headerLines = '';
  for (const [k, v] of Object.entries(headers)) {
    headerLines += `\n        .header("${k}", "${v}")`;
  }

  let bodyLine = '';
  if (data) {
    bodyLine = `\n        .body(${JSON.stringify(data)})`;
  }

  return `// Rust reqwest (Tokio Async)
use reqwest::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();
    let res = client
        .${method.toLowerCase()}("${url}")${headerLines}${bodyLine}
        .send()
        .await?;

    let text = res.text().await?;
    println!("{}", text);
    Ok(())
}`;
}

export function generatePhpCode({ url, method, headers, data }) {
  const headerArr = Object.entries(headers).map(([k, v]) => `    "${k}: ${v}",`).join('\n');
  const bodySetting = data ? `\ncurl_setopt($ch, CURLOPT_POSTFIELDS, ${JSON.stringify(data)});` : '';

  return `<?php
// PHP cURL
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "${url}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method}");
${headerArr ? `curl_setopt($ch, CURLOPT_HTTPHEADER, [\n${headerArr}\n]);\n` : ''}${bodySetting}

$response = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
    echo "cURL Error: " . $err;
} else {
    echo $response;
}`;
}

export function generateCSharpCode({ url, method, headers, data }) {
  let headerLines = '';
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() !== 'content-type') {
      headerLines += `request.Headers.Add("${k}", "${v}");\n        `;
    }
  }

  let contentLine = '';
  if (data) {
    const cType = headers['Content-Type'] || headers['content-type'] || 'application/json';
    contentLine = `request.Content = new StringContent(${JSON.stringify(data)}, System.Text.Encoding.UTF8, "${cType}");\n        `;
  }

  return `// C# HttpClient (.NET 8+)
using System;
using System.Net.Http;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        using var client = new HttpClient();
        using var request = new HttpRequestMessage(HttpMethod.${method.charAt(0) + method.slice(1).toLowerCase()}, "${url}");
        ${headerLines}${contentLine}
        var response = await client.SendAsync(request);
        var responseString = await response.Content.ReadAsStringAsync();
        Console.WriteLine(responseString);
    }
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
