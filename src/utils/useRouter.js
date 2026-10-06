import { useState, useEffect, useCallback } from 'react';
import { TOOL_METADATA } from './seoData';

export const VALID_PATHS = [
  '/json-to-csv',
  '/csv-to-json',
  '/markdown-editor',
  '/pdf-to-markdown',
  '/text-diff',
  '/base64-tool',
  '/url-parser',
  '/pii-redactor',
  '/curl-converter',
  '/jwt-inspector',
  '/json-to-types',
  '/cron-scheduler',
  '/regex-tester',
  '/privacy-policy',
  '/terms-of-service',
  '/about',
  '/contact',
];
const DEFAULT_PATH = '/json-to-csv';

export function useRouter() {
  const getCleanPath = () => {
    let path = window.location.pathname;
    if (window.location.hash) {
      const hashPath = window.location.hash.replace(/^#/, '');
      if (VALID_PATHS.includes(hashPath)) {
        return hashPath;
      }
    }
    if (VALID_PATHS.includes(path)) {
      return path;
    }
    return DEFAULT_PATH;
  };

  const [currentPath, setCurrentPath] = useState(getCleanPath);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getCleanPath());
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, []);

  useEffect(() => {
    const titles = {
      '/privacy-policy': 'Privacy Policy — QuickFormat Hub',
      '/terms-of-service': 'Terms of Service — QuickFormat Hub',
      '/about': 'About Us & Mission — QuickFormat Hub',
      '/contact': 'Contact Us & Developer Support — QuickFormat Hub',
    };

    if (titles[currentPath]) {
      document.title = titles[currentPath];
    } else {
      const meta = TOOL_METADATA[currentPath];
      if (meta) {
        document.title = `${meta.title} — QuickFormat Hub`;
      }
    }
  }, [currentPath]);

  const navigate = useCallback((path) => {
    if (!VALID_PATHS.includes(path)) return;
    try {
      window.history.pushState(null, '', path);
    } catch {
      window.location.hash = path;
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return { currentPath, navigate, toolMeta: TOOL_METADATA[currentPath] || TOOL_METADATA[DEFAULT_PATH] };
}
