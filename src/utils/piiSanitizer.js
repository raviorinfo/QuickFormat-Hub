/**
 * Client-Side PII & Secret Redactor Engine
 * Sanitizes sensitive production data before sending to LLMs / ChatGPT.
 * Includes local reversible unmasking.
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
  };

  // 1. API Keys & Secrets
  if (maskApiKeys) {
    const keyPatterns = [
      /\b(sec_live_[a-zA-Z0-9]{24,})\b/g,
      /\b(sk_live_[a-zA-Z0-9]{24,})\b/g,
      /\b(pk_live_[a-zA-Z0-9]{24,})\b/g,
      /\b(sk-[a-zA-Z0-9T3BlbkFJ]{20,})\b/g,
      /\b(AKIA[0-9A-Z]{16})\b/g,
      /\b(ghp_[a-zA-Z0-9]{36})\b/g,
      /\bBearer\s+([a-zA-Z0-9_\-\.]{30,})\b/g,
      /(["']?(?:password|secret|apiKey|api_key|access_token|private_key)["']?\s*[:=]\s*["'])([^"'\n\r]{6,})(["'])/gi,
    ];

    keyPatterns.forEach((pattern) => {
      current = current.replace(pattern, (match, p1, p2, p3) => {
        stats.apiKeys++;
        const token = `[REDACTED_API_KEY_${stats.apiKeys}]`;
        if (p2 && p3) {
          unmaskMap[token] = p2;
          return `${p1}${token}${p3}`;
        }
        unmaskMap[token] = p1 || match;
        return match.startsWith('Bearer') ? `Bearer ${token}` : token;
      });
    });
  }

  // 2. Emails
  if (maskEmails) {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/g;
    current = current.replace(emailRegex, (match) => {
      stats.emails++;
      const token = `[REDACTED_EMAIL_${stats.emails}]`;
      unmaskMap[token] = match;
      return token;
    });
  }

  // 3. Credit Cards (13-19 digits with dashes or spaces)
  if (maskCreditCards) {
    const ccRegex = /\b(?:\d{4}[ -]?){3}\d{4}\b/g;
    current = current.replace(ccRegex, (match) => {
      stats.creditCards++;
      const token = `[REDACTED_CREDIT_CARD_${stats.creditCards}]`;
      unmaskMap[token] = match;
      return token;
    });
  }

  // 4. IP Addresses (IPv4)
  if (maskIps) {
    const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
    current = current.replace(ipRegex, (match) => {
      // Avoid matching version strings like 1.0.0.0 if not needed, but standard IPv4
      stats.ips++;
      const token = `[REDACTED_IP_${stats.ips}]`;
      unmaskMap[token] = match;
      return token;
    });
  }

  // 5. Phone numbers
  if (maskPhones) {
    const phoneRegex = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
    current = current.replace(phoneRegex, (match) => {
      stats.phones++;
      const token = `[REDACTED_PHONE_${stats.phones}]`;
      unmaskMap[token] = match;
      return token;
    });
  }

  // 6. UUIDs
  if (maskUuids) {
    const uuidRegex = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;
    current = current.replace(uuidRegex, (match) => {
      stats.uuids++;
      const token = `[REDACTED_UUID_${stats.uuids}]`;
      unmaskMap[token] = match;
      return token;
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

Transaction Details:
  credit_card: "4532-8921-3940-1928"
  gateway_secret: "sec_live_demo_948102948102948102948102"
  auth_header: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.t-IDcSemACt8x4iTMCda8Yhe3iZaWbvV5XKSTbuAn0M"
  aws_s3_backup: "AKIAIOSFODNN7EXAMPLE"
  openai_embedding_key: "api_key_demo_910283918203918230918203918203"

Database Error Message:
  Connection timeout on replica host 203.0.113.195. Query aborted while updating secret: "super_secret_db_pass_2026!".`;
