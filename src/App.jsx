import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { AdSlot, TrustGuaranteeBar } from './components/AdSlot';
import { ToolsOverview } from './components/ToolsOverview';
import { CommandPalette } from './components/CommandPalette';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ShortcutsModal } from './components/ShortcutsModal';
import { GlobalDropzone } from './components/GlobalDropzone';
import { useRouter } from './utils/useRouter';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { Loader2 } from 'lucide-react';

// Dynamic Code Splitting & Lazy Loading for all 13 tools
const JsonToCsvTool = lazy(() =>
  import('./components/tools/JsonToCsvTool').then((m) => ({ default: m.JsonToCsvTool }))
);
const CsvToJsonTool = lazy(() =>
  import('./components/tools/CsvToJsonTool').then((m) => ({ default: m.CsvToJsonTool }))
);
const MarkdownEditorTool = lazy(() =>
  import('./components/tools/MarkdownEditorTool').then((m) => ({ default: m.MarkdownEditorTool }))
);
const PdfToMarkdownTool = lazy(() =>
  import('./components/tools/PdfToMarkdownTool').then((m) => ({ default: m.PdfToMarkdownTool }))
);
const TextDiffTool = lazy(() =>
  import('./components/tools/TextDiffTool').then((m) => ({ default: m.TextDiffTool }))
);
const Base64Tool = lazy(() =>
  import('./components/tools/Base64Tool').then((m) => ({ default: m.Base64Tool }))
);
const UrlParserTool = lazy(() =>
  import('./components/tools/UrlParserTool').then((m) => ({ default: m.UrlParserTool }))
);
const PiiRedactorTool = lazy(() =>
  import('./components/tools/PiiRedactorTool').then((m) => ({ default: m.PiiRedactorTool }))
);
const CurlConverterTool = lazy(() =>
  import('./components/tools/CurlConverterTool').then((m) => ({ default: m.CurlConverterTool }))
);
const JwtInspectorTool = lazy(() =>
  import('./components/tools/JwtInspectorTool').then((m) => ({ default: m.JwtInspectorTool }))
);
const JsonToTypesTool = lazy(() =>
  import('./components/tools/JsonToTypesTool').then((m) => ({ default: m.JsonToTypesTool }))
);
const CronSchedulerTool = lazy(() =>
  import('./components/tools/CronSchedulerTool').then((m) => ({ default: m.CronSchedulerTool }))
);
const RegexTesterTool = lazy(() =>
  import('./components/tools/RegexTesterTool').then((m) => ({ default: m.RegexTesterTool }))
);
const JsonViewerTool = lazy(() =>
  import('./components/tools/JsonViewerTool').then((m) => ({ default: m.JsonViewerTool }))
);
const SecurityHeadersTool = lazy(() =>
  import('./components/tools/SecurityHeadersTool').then((m) => ({ default: m.SecurityHeadersTool }))
);
const HashGeneratorTool = lazy(() =>
  import('./components/tools/HashGeneratorTool').then((m) => ({ default: m.HashGeneratorTool }))
);
const TimestampConverterTool = lazy(() =>
  import('./components/tools/TimestampConverterTool').then((m) => ({ default: m.TimestampConverterTool }))
);
const SqlFormatterTool = lazy(() =>
  import('./components/tools/SqlFormatterTool').then((m) => ({ default: m.SqlFormatterTool }))
);
const UuidGeneratorTool = lazy(() =>
  import('./components/tools/UuidGeneratorTool').then((m) => ({ default: m.UuidGeneratorTool }))
);
const PrivacyPolicyPage = lazy(() =>
  import('./components/pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsOfServicePage = lazy(() =>
  import('./components/pages/TermsOfServicePage').then((m) => ({ default: m.TermsOfServicePage }))
);
const AboutUsPage = lazy(() =>
  import('./components/pages/AboutUsPage').then((m) => ({ default: m.AboutUsPage }))
);
const ContactUsPage = lazy(() =>
  import('./components/pages/ContactUsPage').then((m) => ({ default: m.ContactUsPage }))
);

// High-speed Tool Skeleton Loading placeholder
function ToolSkeletonLoader() {
  return (
    <div className="w-full min-h-[480px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
      <div className="space-y-2 text-center">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto"></div>
        <div className="h-3 w-32 bg-slate-200 dark:bg-slate-800 rounded-full mx-auto"></div>
      </div>
    </div>
  );
}

function QuickFormatApp() {
  const { currentPath, navigate, toolMeta } = useRouter();
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // Global Key Listeners: Ctrl+K / Cmd+K and '?' for shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      // Check if user pressed '?' without typing in input/textarea
      const targetTag = e.target.tagName;
      if (
        targetTag === 'INPUT' ||
        targetTag === 'TEXTAREA' ||
        targetTag === 'SELECT' ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const isLegalRoute = [
    '/privacy-policy',
    '/terms-of-service',
    '/about',
    '/contact',
  ].includes(currentPath);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#060911] text-slate-900 dark:text-slate-100 transition-colors duration-200 relative overflow-x-hidden">
      {/* Subtle Developer Grid Texture & Ambient Radiant Glows */}
      <div className="fixed inset-0 bg-grid-pattern bg-radial-vignette pointer-events-none z-0" aria-hidden="true" />
      <div className="ambient-glow-cyan" aria-hidden="true" />
      <div className="ambient-glow-purple" aria-hidden="true" />

      {/* Universal Drag-and-Drop Auto-Routing */}
      <GlobalDropzone onNavigate={navigate} />

      {/* Universal Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onNavigate={navigate}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
      />

      {/* Keyboard Shortcuts Cheatsheet Modal (?) */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      {/* Recent Scratchpad History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryDrawerOpen}
        onClose={() => setIsHistoryDrawerOpen(false)}
        onNavigate={navigate}
      />

      {/* Sticky Header with navigation tab bar */}
      <Header
        currentPath={currentPath}
        onNavigate={navigate}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenHistory={() => setIsHistoryDrawerOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
      />

      {/* Top Banner Ad Container (728x90) */}
      {!isLegalRoute && <AdSlot type="top-banner" />}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10">
        {isLegalRoute ? (
          <Suspense fallback={<ToolSkeletonLoader />}>
            {currentPath === '/privacy-policy' && <PrivacyPolicyPage />}
            {currentPath === '/terms-of-service' && <TermsOfServicePage />}
            {currentPath === '/about' && <AboutUsPage onNavigate={navigate} />}
            {currentPath === '/contact' && <ContactUsPage />}
          </Suspense>
        ) : (
          <>
            {/* Full-Width Tool Workspace */}
            <div className="w-full">
              <Suspense fallback={<ToolSkeletonLoader />}>
                {currentPath === '/json-to-csv' && <JsonToCsvTool />}
                {currentPath === '/csv-to-json' && <CsvToJsonTool />}
                {currentPath === '/json-viewer' && <JsonViewerTool />}
                {currentPath === '/markdown-editor' && <MarkdownEditorTool />}
                {currentPath === '/pdf-to-markdown' && <PdfToMarkdownTool />}
                {currentPath === '/text-diff' && <TextDiffTool />}
                {currentPath === '/base64-tool' && <Base64Tool />}
                {currentPath === '/security-headers' && <SecurityHeadersTool />}
                {currentPath === '/hash-generator' && <HashGeneratorTool />}
                {currentPath === '/url-parser' && <UrlParserTool />}
                {currentPath === '/pii-redactor' && <PiiRedactorTool />}
                {currentPath === '/curl-converter' && <CurlConverterTool />}
                {currentPath === '/jwt-inspector' && <JwtInspectorTool />}
                {currentPath === '/json-to-types' && <JsonToTypesTool />}
                {currentPath === '/timestamp-converter' && <TimestampConverterTool />}
                {currentPath === '/sql-formatter' && <SqlFormatterTool />}
                {currentPath === '/uuid-generator' && <UuidGeneratorTool />}
                {currentPath === '/cron-scheduler' && <CronSchedulerTool />}
                {currentPath === '/regex-tester' && <RegexTesterTool />}
              </Suspense>
            </div>

            {/* Architecture & Privacy Guarantee Ribbon */}
            <TrustGuaranteeBar />

            {/* Optional Sidebar Ad Slot when active */}
            <AdSlot type="sidebar" />

            {/* In-Depth Interactive Tools Overview & SEO FAQ Section */}
            <ToolsOverview toolMeta={toolMeta} />
          </>
        )}
      </main>

      {/* Bottom Responsive Ad Unit */}
      {!isLegalRoute && <AdSlot type="bottom-banner" />}

      {/* SEO-friendly Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <QuickFormatApp />
      </ToastProvider>
    </ThemeProvider>
  );
}
