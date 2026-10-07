/**
 * HTTP Security Headers and Content Security Policy (CSP) Evaluator & Generator
 */

export const ESSENTIAL_HEADERS = [
  {
    name: 'Strict-Transport-Security',
    alias: 'HSTS',
    description: 'Enforces secure HTTPS connections and prevents SSL stripping attacks.',
    weight: 25,
    evaluate: (val) => {
      if (!val) return { pass: false, level: 'critical', message: 'Missing HSTS. Site vulnerable to man-in-the-middle SSL stripping.' };
      const maxAgeMatch = val.match(/max-age=(\d+)/i);
      const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
      if (maxAge < 10368000) {
        return { pass: false, level: 'warning', message: `HSTS max-age is too low (${maxAge}s). Recommended is at least 31536000 (1 year).` };
      }
      const hasSubdomains = /includeSubDomains/i.test(val);
      const hasPreload = /preload/i.test(val);
      return {
        pass: true,
        level: 'good',
        message: `HSTS active (${Math.round(maxAge / 86400)} days)${hasSubdomains ? ' with subdomains' : ''}${hasPreload ? ' + preload eligible' : ''}.`,
      };
    },
  },
  {
    name: 'Content-Security-Policy',
    alias: 'CSP',
    description: 'Restricts sources from which scripts, styles, and assets can be loaded to prevent XSS.',
    weight: 30,
    evaluate: (val) => {
      if (!val) return { pass: false, level: 'critical', message: 'Missing CSP header. Site has zero defense-in-depth against XSS injection.' };
      const warnings = [];
      if (val.includes("'unsafe-inline'")) {
        warnings.push("Contains 'unsafe-inline' (allows malicious inline scripts).");
      }
      if (val.includes("'unsafe-eval'")) {
        warnings.push("Contains 'unsafe-eval' (allows eval() code execution).");
      }
      if (val.includes('http:')) {
        warnings.push('Allows insecure plain HTTP resource loading.');
      }
      if (!val.includes('default-src') && !val.includes('script-src')) {
        warnings.push("Missing fallback 'default-src' directive.");
      }
      if (warnings.length > 0) {
        return { pass: false, level: 'warning', message: `Weak CSP: ${warnings.join(' ')}` };
      }
      return { pass: true, level: 'good', message: 'Robust Content Security Policy configured without unsafe directives.' };
    },
  },
  {
    name: 'X-Frame-Options',
    alias: 'Clickjacking Defense',
    description: 'Controls whether the site can be embedded in an <iframe> to prevent UI redressing.',
    weight: 15,
    evaluate: (val) => {
      if (!val) return { pass: false, level: 'critical', message: 'Missing X-Frame-Options. Page can be embedded in malicious iframes (Clickjacking).' };
      const upper = val.toUpperCase().trim();
      if (upper === 'DENY' || upper === 'SAMEORIGIN') {
        return { pass: true, level: 'good', message: `Protected against iframe embedding (${upper}).` };
      }
      return { pass: false, level: 'warning', message: `Non-standard value: "${val}". Recommended: DENY or SAMEORIGIN.` };
    },
  },
  {
    name: 'X-Content-Type-Options',
    alias: 'MIME Sniffing',
    description: 'Prevents browsers from MIME-sniffing a response away from the declared content-type.',
    weight: 10,
    evaluate: (val) => {
      if (!val || val.toLowerCase().trim() !== 'nosniff') {
        return { pass: false, level: 'critical', message: 'Missing "nosniff". Browsers may execute uploaded user content as scripts.' };
      }
      return { pass: true, level: 'good', message: 'MIME sniffing disabled (nosniff enabled).' };
    },
  },
  {
    name: 'Referrer-Policy',
    alias: 'Referrer Privacy',
    description: 'Controls how much referrer information is sent when navigating away from the page.',
    weight: 10,
    evaluate: (val) => {
      if (!val) return { pass: false, level: 'warning', message: 'Missing Referrer-Policy. Default browser policy may leak private URL paths to external origins.' };
      const safe = ['strict-origin-when-cross-origin', 'no-referrer', 'strict-origin', 'same-origin'];
      if (safe.includes(val.toLowerCase().trim())) {
        return { pass: true, level: 'good', message: `Privacy-preserving policy: "${val}".` };
      }
      return { pass: false, level: 'warning', message: `Potentially leaky policy: "${val}". Recommended: strict-origin-when-cross-origin.` };
    },
  },
  {
    name: 'Permissions-Policy',
    alias: 'Feature Isolation',
    description: 'Restricts browser hardware APIs like camera, microphone, and geolocation.',
    weight: 10,
    evaluate: (val) => {
      if (!val) return { pass: false, level: 'warning', message: 'Missing Permissions-Policy. Hardware APIs (camera, mic, geo) are not explicitly restricted.' };
      return { pass: true, level: 'good', message: 'Hardware and browser capabilities restricted.' };
    },
  },
  {
    name: 'Cross-Origin-Opener-Policy',
    alias: 'COOP',
    description: 'Ensures top-level document does not share a browsing context group with cross-origin documents.',
    weight: 10,
    evaluate: (val) => {
      if (!val) return { pass: false, level: 'info', message: 'Optional: Missing COOP. Recommended "same-origin" for process isolation.' };
      const lower = val.toLowerCase().trim();
      if (lower === 'same-origin') return { pass: true, level: 'good', message: 'Process isolation active (same-origin).' };
      return { pass: true, level: 'good', message: `COOP set to "${val}".` };
    },
  },
  {
    name: 'Cross-Origin-Embedder-Policy',
    alias: 'COEP',
    description: 'Prevents document from loading cross-origin resources that do not explicitly grant permission.',
    weight: 10,
    evaluate: (val) => {
      if (!val) return { pass: false, level: 'info', message: 'Optional: Missing COEP. Required together with COOP for SharedArrayBuffer.' };
      return { pass: true, level: 'good', message: `COEP active (${val}).` };
    },
  },
  {
    name: 'Cross-Origin-Resource-Policy',
    alias: 'CORP',
    description: 'Protects backend resources from being read by cross-origin attackers.',
    weight: 10,
    evaluate: (val) => {
      if (!val) return { pass: false, level: 'info', message: 'Optional: Missing CORP. Recommended "same-origin" or "same-site".' };
      return { pass: true, level: 'good', message: `CORP active (${val}).` };
    },
  },
];

// Banner & Version Information Disclosure Leaks
export const LEAK_HEADERS = [
  { key: 'server', label: 'Server Banner' },
  { key: 'x-powered-by', label: 'Framework / Runtime' },
  { key: 'x-aspnet-version', label: 'ASP.NET Version' },
  { key: 'x-runtime', label: 'Ruby / Rails Runtime' },
  { key: 'x-version', label: 'App Version' },
];

export function evaluateHeaders(rawHeadersText) {
  if (!rawHeadersText || !rawHeadersText.trim()) {
    return null;
  }

  // Parse key-value lines
  const lines = rawHeadersText.split(/\r?\n/);
  const headerMap = {};

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > -1) {
      const key = line.slice(0, colonIdx).trim().toLowerCase();
      const val = line.slice(colonIdx + 1).trim();
      headerMap[key] = val;
    }
  }

  let totalScore = 0;
  let maxScore = 0;
  const findings = [];
  const leaks = [];

  for (const def of ESSENTIAL_HEADERS) {
    maxScore += def.weight;
    const headerVal = headerMap[def.name.toLowerCase()];
    const result = def.evaluate(headerVal);

    if (result.pass) {
      totalScore += def.weight;
    } else if (result.level === 'warning') {
      totalScore += Math.round(def.weight * 0.4);
    }

    findings.push({
      header: def.name,
      alias: def.alias,
      value: headerVal || null,
      pass: result.pass,
      level: result.level,
      message: result.message,
      description: def.description,
    });
  }

  // Check for Information Disclosure leaks
  for (const leakDef of LEAK_HEADERS) {
    const val = headerMap[leakDef.key];
    if (val) {
      // Check if it exposes specific version numbers or names (e.g. Apache/2.4.41, PHP/7.4)
      const hasSpecificDetails = /[0-9]/.test(val) || /(apache|nginx|express|php|asp\.net)/i.test(val);
      if (hasSpecificDetails) {
        leaks.push({
          header: leakDef.key,
          label: leakDef.label,
          value: val,
          message: `Leaking internal technology details ("${val}"). Remove in production to avoid reconnaissance.`,
        });
        totalScore = Math.max(0, totalScore - 5);
      }
    }
  }

  const scorePct = Math.min(100, Math.round((totalScore / maxScore) * 100));
  let grade = 'F';
  let gradeColor = 'rose';

  if (scorePct >= 95) {
    grade = 'A+';
    gradeColor = 'emerald';
  } else if (scorePct >= 85) {
    grade = 'A';
    gradeColor = 'emerald';
  } else if (scorePct >= 70) {
    grade = 'B';
    gradeColor = 'sky';
  } else if (scorePct >= 50) {
    grade = 'C';
    gradeColor = 'amber';
  } else if (scorePct >= 30) {
    grade = 'D';
    gradeColor = 'amber';
  }

  return {
    scorePct,
    grade,
    gradeColor,
    findings,
    leaks,
    parsedHeadersCount: Object.keys(headerMap).length,
  };
}

// Build Content-Security-Policy string from configuration object
export function buildCspString(directives) {
  const parts = [];
  for (const [directive, values] of Object.entries(directives)) {
    if (!values || (Array.isArray(values) && values.length === 0)) continue;
    if (typeof values === 'boolean') {
      if (values) parts.push(directive);
    } else if (Array.isArray(values)) {
      parts.push(`${directive} ${values.join(' ')}`);
    } else if (typeof values === 'string' && values.trim()) {
      parts.push(`${directive} ${values.trim()}`);
    }
  }
  return parts.join('; ');
}

export function generateHardenedServerConfig(format = 'nginx') {
  switch (format) {
    case 'nginx':
      return `# Hardened Security Headers for Nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self'; frame-ancestors 'none';" always;
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;`;

    case 'cloudflare':
      return `# Cloudflare Pages / Workers _headers file
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https: data:; connect-src 'self'; frame-ancestors 'none';
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()`;

    case 'vercel':
      return `// vercel.json headers configuration
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=31536000; includeSubDomains; preload" },
        { "key": "Content-Security-Policy", "value": "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; frame-ancestors 'none';" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}`;

    case 'apache':
      return `# Apache .htaccess
<IfModule mod_headers.c>
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
  Header always set Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; frame-ancestors 'none';"
  Header always set X-Frame-Options "DENY"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>`;

    case 'helmet':
      return `// Node.js Express with Helmet.js
import helmet from 'helmet';

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        frameAncestors: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
);`;

    default:
      return '';
  }
}

export const SAMPLE_SECURITY_HEADERS = `HTTP/2 200 OK
date: Wed, 07 Oct 2026 06:19:03 GMT
content-type: text/html; charset=utf-8
server: cloudflare
strict-transport-security: max-age=31536000; includeSubDomains; preload
content-security-policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;
x-frame-options: DENY
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=()`;
