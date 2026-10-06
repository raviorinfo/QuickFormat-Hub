/**
 * Utilities for URL and Query String Parsing & Manipulation
 */

export function parseUrlString(urlStr) {
  if (!urlStr || !urlStr.trim()) {
    return null;
  }

  let formatted = urlStr.trim();
  if (!/^https?:\/\//i.test(formatted) && !formatted.startsWith('/')) {
    formatted = 'https://' + formatted;
  }

  try {
    const urlObj = new URL(formatted);
    const params = [];
    urlObj.searchParams.forEach((value, key) => {
      params.push({ id: Math.random().toString(36).substr(2, 9), key, value });
    });

    return {
      success: true,
      protocol: urlObj.protocol.replace(':', ''),
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : '80'),
      pathname: urlObj.pathname,
      hash: urlObj.hash,
      params,
      rawUrl: urlObj.toString(),
    };
  } catch (err) {
    return {
      success: false,
      error: 'Invalid URL format. Please include a valid hostname (e.g., https://example.com/path?key=value).',
    };
  }
}

export function rebuildUrl({ protocol, hostname, port, pathname, hash, params }) {
  try {
    const basePort = (protocol === 'https' && port === '443') || (protocol === 'http' && port === '80') || !port ? '' : `:${port}`;
    let newUrl = `${protocol}://${hostname}${basePort}${pathname.startsWith('/') ? pathname : '/' + pathname}`;

    const searchParams = new URLSearchParams();
    (params || []).forEach(({ key, value }) => {
      if (key && key.trim()) {
        searchParams.append(key.trim(), value || '');
      }
    });

    const queryString = searchParams.toString();
    if (queryString) {
      newUrl += `?${queryString}`;
    }

    if (hash) {
      newUrl += hash.startsWith('#') ? hash : `#${hash}`;
    }

    return newUrl;
  } catch {
    return '';
  }
}

export const SAMPLE_URL =
  'https://api.quickformat.app/v2/analytics/reports?utm_source=developer_portal&utm_medium=banner&filter_range=last_30_days&export_format=json&include_metadata=true#section-overview';
