// CORS Policy Builder, Security Vulnerability Auditor & Preflight Simulator

export const DEFAULT_CORS_CONFIG = {
  origins: ['https://app.example.com', 'https://api.example.com'],
  allowWildcardOrigin: false,
  allowCredentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'Content-Disposition'],
  maxAge: 86400,
};

export const COMMON_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export const COMMON_HEADERS = [
  'Content-Type',
  'Authorization',
  'X-Requested-With',
  'Accept',
  'Origin',
  'X-Api-Key',
  'If-Match',
  'If-None-Match',
];

// Audit CORS Configuration for OWASP Vulnerabilities & Misconfigurations
export function auditCorsConfig(config) {
  const issues = [];
  const origins = config.origins || [];
  const isWildcard = config.allowWildcardOrigin || origins.includes('*');

  // Check 1: Wildcard Origin + Credentials (Critical OWASP flaw)
  if (isWildcard && config.allowCredentials) {
    issues.push({
      id: 'wildcard-credentials',
      severity: 'CRITICAL',
      title: 'Illegal Wildcard Origin with Credentials Enabled',
      desc: 'Browsers strictly reject Access-Control-Allow-Origin: * when Access-Control-Allow-Credentials is true. If dynamically reflected, any attacker website can read authenticated user sessions.',
      recommendation: 'Specify exact allowed origin domains (e.g. https://app.example.com) instead of wildcard * when credentials are true.',
    });
  }

  // Check 2: Null Origin Allowance
  if (origins.some((o) => o.toLowerCase() === 'null')) {
    issues.push({
      id: 'null-origin',
      severity: 'HIGH',
      title: 'Dangerous "null" Origin Allowed',
      desc: 'Attackers can exploit "null" origin by embedding malicious payloads inside sandboxed iframes (<iframe sandbox="allow-scripts">), which send Origin: null.',
      recommendation: 'Remove "null" from allowed origins list.',
    });
  }

  // Check 3: Plain HTTP in Production Origins
  const insecureOrigins = origins.filter((o) => o.startsWith('http://') && !o.includes('localhost') && !o.includes('127.0.0.1'));
  if (insecureOrigins.length > 0) {
    issues.push({
      id: 'http-insecure-origins',
      severity: 'HIGH',
      title: 'Plain HTTP (Unencrypted) Origins Allowed',
      desc: `Insecure origins detected: ${insecureOrigins.join(', ')}. Traffic can be intercepted and modified via Man-In-The-Middle (MITM) attacks.`,
      recommendation: 'Only allow HTTPS origins in production environments.',
    });
  }

  // Check 4: Preflight Cache (Max-Age) is 0 or very low
  if (!config.maxAge || config.maxAge < 60) {
    issues.push({
      id: 'low-max-age',
      severity: 'LOW',
      title: 'Preflight Cache Time (Max-Age) is Low',
      desc: 'Low Max-Age causes browsers to send an OPTIONS preflight request before every single API call, adding unnecessary network latency for users.',
      recommendation: 'Set Access-Control-Max-Age between 3600 (1 hour) and 86400 (24 hours).',
    });
  }

  // Check 5: Overly permissive methods
  if (config.methods.includes('DELETE') && isWildcard && !config.allowCredentials) {
    issues.push({
      id: 'wildcard-delete',
      severity: 'MEDIUM',
      title: 'State-Modifying Methods Allowed for Public Wildcard',
      desc: 'Allowing DELETE or PUT methods across all public origins (*) without origin restrictions increases risk of unintended public data modification.',
      recommendation: 'Restrict DELETE and PUT to authenticated, verified dashboard origins.',
    });
  }

  return issues;
}

// Simulate a Browser Preflight (OPTIONS) Request
export function simulateCorsPreflight(config, testOrigin, testMethod, testHeaders = []) {
  const issues = auditCorsConfig(config);
  const normalizedTestOrigin = (testOrigin || '').trim().replace(/\/$/, '');
  const isWildcard = config.allowWildcardOrigin || config.origins.includes('*');

  // Check Origin match
  let originAllowed = false;
  let responseOrigin = null;

  if (isWildcard && !config.allowCredentials) {
    originAllowed = true;
    responseOrigin = '*';
  } else if (config.origins.some((o) => o.trim().replace(/\/$/, '') === normalizedTestOrigin)) {
    originAllowed = true;
    responseOrigin = normalizedTestOrigin;
  }

  // Check Method match
  const methodAllowed = config.methods.includes(testMethod.toUpperCase());

  // Check Headers match
  const testHeadersArr = Array.isArray(testHeaders)
    ? testHeaders
    : (testHeaders || '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);

  const allowedHeadersLower = config.allowedHeaders.map((h) => h.toLowerCase());
  const unallowedHeaders = testHeadersArr.filter((h) => !allowedHeadersLower.includes(h));
  const headersAllowed = unallowedHeaders.length === 0;

  const passed = originAllowed && methodAllowed && headersAllowed;

  // Generate response headers
  const responseHeaders = {};
  if (originAllowed) {
    responseHeaders['Access-Control-Allow-Origin'] = responseOrigin;
    if (config.allowCredentials) {
      responseHeaders['Access-Control-Allow-Credentials'] = 'true';
    }
    if (config.methods.length > 0) {
      responseHeaders['Access-Control-Allow-Methods'] = config.methods.join(', ');
    }
    if (config.allowedHeaders.length > 0) {
      responseHeaders['Access-Control-Allow-Headers'] = config.allowedHeaders.join(', ');
    }
    if (config.exposedHeaders && config.exposedHeaders.length > 0) {
      responseHeaders['Access-Control-Expose-Headers'] = config.exposedHeaders.join(', ');
    }
    if (config.maxAge) {
      responseHeaders['Access-Control-Max-Age'] = String(config.maxAge);
    }
  }

  return {
    passed,
    originAllowed,
    methodAllowed,
    headersAllowed,
    unallowedHeaders,
    responseOrigin,
    responseHeaders,
    issues,
  };
}

// Generate Server Code Snippets
export function generateCorsServerSnippet(config, target = 'express') {
  const origins = config.allowWildcardOrigin ? ['*'] : config.origins;
  const methods = config.methods.join(', ');
  const headers = config.allowedHeaders.join(', ');
  const exposed = (config.exposedHeaders || []).join(', ');

  switch (target) {
    case 'express':
      return `// Node.js Express CORS Configuration
const express = require('express');
const cors = require('cors');
const app = express();

const corsOptions = {
  origin: ${config.allowWildcardOrigin ? "'*'" : JSON.stringify(origins)},
  methods: ${JSON.stringify(config.methods)},
  allowedHeaders: ${JSON.stringify(config.allowedHeaders)},
  exposedHeaders: ${JSON.stringify(config.exposedHeaders || [])},
  credentials: ${config.allowCredentials},
  maxAge: ${config.maxAge}
};

app.use(cors(corsOptions));
`;

    case 'fastapi':
      return `# Python FastAPI CORS Middleware
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = ${JSON.stringify(origins)}

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=${config.allowCredentials ? 'True' : 'False'},
    allow_methods=${JSON.stringify(config.methods)},
    allow_headers=${JSON.stringify(config.allowedHeaders)},
    expose_headers=${JSON.stringify(config.exposedHeaders || [])},
    max_age=${config.maxAge},
)
`;

    case 'nginx':
      return `# Nginx CORS Configuration Block
location /api/ {
    # Allow Origin
    if ($http_origin ~* ^(${origins.map((o) => o.replace(/\./g, '\\.')).join('|')})$) {
        add_header 'Access-Control-Allow-Origin' "$http_origin" always;
        add_header 'Access-Control-Allow-Credentials' '${config.allowCredentials ? 'true' : 'false'}' always;
        add_header 'Access-Control-Allow-Methods' '${methods}' always;
        add_header 'Access-Control-Allow-Headers' '${headers}' always;
        add_header 'Access-Control-Expose-Headers' '${exposed}' always;
        add_header 'Access-Control-Max-Age' '${config.maxAge}' always;
    }

    # Handle Preflight OPTIONS
    if ($request_method = 'OPTIONS') {
        return 204;
    }

    proxy_pass http://backend_upstream;
}
`;

    case 'springboot':
      return `// Java Spring Boot WebMvcConfigurer
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins(${origins.map((o) => `"${o}"`).join(', ')})
            .allowedMethods(${config.methods.map((m) => `"${m}"`).join(', ')})
            .allowedHeaders(${config.allowedHeaders.map((h) => `"${h}"`).join(', ')})
            .allowCredentials(${config.allowCredentials})
            .maxAge(${config.maxAge});
    }
}
`;

    case 'cloudflare':
      return `// Cloudflare Workers / Hono.js CORS Handler
export default {
  async fetch(request, env, ctx) {
    const origin = request.headers.get("Origin");
    const allowedOrigins = ${JSON.stringify(origins)};
    const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes("*");

    const corsHeaders = {
      "Access-Control-Allow-Origin": isAllowed ? origin : "null",
      "Access-Control-Allow-Credentials": "${config.allowCredentials}",
      "Access-Control-Allow-Methods": "${methods}",
      "Access-Control-Allow-Headers": "${headers}",
      "Access-Control-Max-Age": "${config.maxAge}",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders, status: 204 });
    }

    const response = await fetch(request);
    const newResponse = new Response(response.body, response);
    Object.entries(corsHeaders).forEach(([k, v]) => newResponse.headers.set(k, v));
    return newResponse;
  }
};
`;

    case 'gin':
      return `// Go Gin CORS Middleware
package main

import (
  "github.com/gin-gonic/gin"
  "github.com/gin-contrib/cors"
  "time"
)

func setupRouter() *gin.Engine {
  r := gin.Default()
  r.Use(cors.New(cors.Config{
    AllowOrigins:     ${JSON.stringify(origins)},
    AllowMethods:     ${JSON.stringify(config.methods)},
    AllowHeaders:     ${JSON.stringify(config.allowedHeaders)},
    ExposeHeaders:    ${JSON.stringify(config.exposedHeaders || [])},
    AllowCredentials: ${config.allowCredentials},
    MaxAge:           ${config.maxAge} * time.Second,
  }))
  return r
}
`;

    default:
      return '';
  }
}
