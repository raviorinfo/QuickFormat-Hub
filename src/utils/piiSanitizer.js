/**
 * Client-Side PII & Secret Redactor Engine
 * Sanitizes sensitive production data before sending to LLMs / ChatGPT.
 * Includes local reversible unmasking and customizable redaction styles.
 */

export function sanitizeText(text, options = {}) {
  if (!text) return { sanitized: '', unmaskMap: {}, stats: {} };

  const {
    maskEmails = true,
    maskApiKeys = true,
    maskIps = true,
    maskPhones = true,
    maskCreditCards = true,
    maskUuids = true,
    maskSsn = true,
    maskNino = true,
    maskIban = true,
    maskJwts = true,
    customKeywords = '',
    maskStyle = 'token', // 'token' | 'asterisk' | 'placeholder'
  } = options;

  let current = text;
  const unmaskMap = {};
  const stats = {
    emails: 0,
    apiKeys: 0,
    ips: 0,
    phones: 0,
    creditCards: 0,
    uuids: 0,
    ssn: 0,
    nino: 0,
    iban: 0,
    jwts: 0,
    custom: 0,
  };

  const getReplacement = (category, counter, rawVal) => {
    if (maskStyle === 'asterisk') {
      return '*'.repeat(Math.min(Math.max(rawVal.length, 6), 16));
    }
    if (maskStyle === 'placeholder') {
      return '[REDACTED]';
    }
    return `[REDACTED_${category}_${counter}]`;
  };

  // 1. API Keys & Database Secrets
  if (maskApiKeys) {
    const keyPatterns = [
      /\b(sec_live_[a-zA-Z0-9]{24,})\b/g,
      /\b(sk_live_[a-zA-Z0-9]{24,})\b/g,
      /\b(pk_live_[a-zA-Z0-9]{24,})\b/g,
      /\b(sk-[a-zA-Z0-9T3BlbkFJ]{20,})\b/g,
      /\b(AKIA[0-9A-Z]{16})\b/g,
      /\b(ghp_[a-zA-Z0-9]{36})\b/g,
      /(["']?(?:password|secret|apiKey|api_key|access_token|private_key)["']?\s*[:=]\s*["'])([^"'\n\r]{6,})(["'])/gi,
    ];

    keyPatterns.forEach((pattern) => {
      current = current.replace(pattern, (match, p1, p2, p3) => {
        stats.apiKeys++;
        const token = getReplacement('API_KEY', stats.apiKeys, p2 || p1 || match);
        if (p2 && p3) {
          unmaskMap[token] = p2;
          return `${p1}${token}${p3}`;
        }
        unmaskMap[token] = p1 || match;
        return token;
      });
    });
  }

  // 2. Standalone JWT Tokens
  if (maskJwts) {
    const jwtRegex = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;
    current = current.replace(jwtRegex, (match) => {
      stats.jwts++;
      const token = getReplacement('JWT_TOKEN', stats.jwts, match);
      unmaskMap[token] = match;
      return token;
    });
  }

  // 3. US SSN (Social Security Numbers)
  if (maskSsn) {
    const ssnRegex = /\b\d{3}[- ]?\d{2}[- ]?\d{4}\b/g;
    current = current.replace(ssnRegex, (match) => {
      stats.ssn++;
      const token = getReplacement('SSN', stats.ssn, match);
      unmaskMap[token] = match;
      return token;
    });
  }

  // 4. UK NINo (National Insurance Numbers)
  if (maskNino) {
    const ninoRegex = /\b[A-CEGHJ-PR-TW-Z]{2}\s?\d{2}\s?\d{2}\s?\d{2}\s?[A-D]\b/gi;
    current = current.replace(ninoRegex, (match) => {
      stats.nino++;
      const token = getReplacement('UK_NINO', stats.nino, match);
      unmaskMap[token] = match;
      return token;
    });
  }

  // 5. IBAN (International Bank Account Numbers)
  if (maskIban) {
    const ibanRegex = /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g;
    current = current.replace(ibanRegex, (match) => {
      stats.iban++;
      const token = getReplacement('IBAN', stats.iban, match);
      unmaskMap[token] = match;
      return token;
    });
  }

  // 6. Emails
  if (maskEmails) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
    current = current.replace(emailRegex, (match) => {
      stats.emails++;
      const token = getReplacement('EMAIL', stats.emails, match);
      unmaskMap[token] = match;
      return token;
    });
  }

  // 7. Credit Cards (13-19 digits with dashes or spaces)
  if (maskCreditCards) {
    const ccRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
    current = current.replace(ccRegex, (match) => {
      stats.creditCards++;
      const token = getReplacement('CREDIT_CARD', stats.creditCards, match);
      unmaskMap[token] = match;
      return token;
    });
  }

  // 8. IP Addresses (IPv4)
  if (maskIps) {
    const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    current = current.replace(ipRegex, (match) => {
      stats.ips++;
      const token = getReplacement('IP', stats.ips, match);
      unmaskMap[token] = match;
      return token;
    });
  }

  // 9. Phone numbers
  if (maskPhones) {
    const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
    current = current.replace(phoneRegex, (match) => {
      stats.phones++;
      const token = getReplacement('PHONE', stats.phones, match);
      unmaskMap[token] = match;
      return token;
    });
  }

  // 10. UUIDs
  if (maskUuids) {
    const uuidRegex = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
    current = current.replace(uuidRegex, (match) => {
      stats.uuids++;
      const token = getReplacement('UUID', stats.uuids, match);
      unmaskMap[token] = match;
      return token;
    });
  }

  // 11. Custom User Blacklist Keywords
  if (customKeywords && customKeywords.trim()) {
    const terms = customKeywords
      .split(/[,\n]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    terms.forEach((term) => {
      try {
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const customRegex = new RegExp(`\\b${escaped}\\b`, 'gi');
        current = current.replace(customRegex, (match) => {
          stats.custom++;
          const token = getReplacement('CUSTOM_KEYWORD', stats.custom, match);
          unmaskMap[token] = match;
          return token;
        });
      } catch (e) {
        // Ignore invalid regex patterns
      }
    });
  }

  return { sanitized: current, unmaskMap, stats };
}

export function unmaskText(sanitizedText, unmaskMap) {
  if (!sanitizedText || !unmaskMap) return sanitizedText;
  let restored = sanitizedText;
  for (const [token, original] of Object.entries(unmaskMap)) {
    restored = restored.replaceAll(token, original);
  }
  return restored;
}

export const SAMPLE_DIRTY_LOG = `// Production Server Error Trace & User Ticket
[2026-10-06T14:22:01.402Z] ERROR in PaymentGatewayController
Customer Account:
  user_id: "550e8400-e29b-41d4-a716-446655440000"
  full_name: "Alexander Wright"
  primary_email: "alex.wright@quantum-fintech.com"
  phone_number: "+1 (555) 839-2041"
  client_ip: "198.51.100.42"
  us_ssn: "049-21-9842"
  uk_nino: "QQ 12 34 56 A"
  iban: "GB29NWBK60161331926819"

Transaction Details:
  credit_card: "4532-8921-3940-1928"
  gateway_secret: "sec_live_demo_948102948102948102948102"
  auth_header: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M"
  aws_s3_backup: "AKIAIOSFODNN7EXAMPLE"
  openai_embedding_key: "api_key_demo_910283918203918230918203918203"

Database Error Message:
  Connection timeout on replica host 203.0.113.195. Query aborted while updating secret: "super_secret_db_pass_2026!".`;
