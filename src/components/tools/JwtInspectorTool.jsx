import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Copy,
  Clock,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Sparkles,
  Lock
} from 'lucide-react';
import { decodeJwt, getSampleJwt } from '../../utils/jwtDecoder';
import { useToast } from '../../context/ToastContext';
import { WindowHeader } from '../common/WindowHeader';
import { CopyButton } from '../common/CopyButton';

export function JwtInspectorTool() {
  const toast = useToast();
  const [tokenInput, setTokenInput] = useState(getSampleJwt());
  const [decoded, setDecoded] = useState(() => decodeJwt(tokenInput));
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [fontSize, setFontSize] = useState('normal');
  const [isZenMode, setIsZenMode] = useState(false);

  // Esc key listener to exit Zen Mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isZenMode) {
        setIsZenMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isZenMode]);

  const fontSizeClass =
    fontSize === 'small'
      ? 'text-[11px] leading-relaxed'
      : fontSize === 'large'
      ? 'text-sm leading-relaxed'
      : 'text-xs sm:text-sm leading-relaxed';

  // Tick interval for live countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Re-decode whenever input or currentTime changes
  useEffect(() => {
    setDecoded(decodeJwt(tokenInput));
  }, [tokenInput, currentTime]);

  return (
    <div className="space-y-6">
      {/* Header & Single H1 */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-500 mb-1">
            <Lock className="w-4 h-4" />
            <span>Client-Safe Token Debugger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Offline JWT Token Inspector & Countdown
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Decode JWT credentials safely offline. View live expiration countdowns, subject, and authorization roles.
          </p>
        </div>

        {/* Status Badge */}
        {decoded && decoded.valid && (
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${
                decoded.isExpired
                  ? 'bg-rose-500/10 text-rose-500 border-rose-500/30'
                  : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
              }`}
            >
              {decoded.isExpired ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{decoded.statusText}</span>
            </div>
          </div>
        )}
      </div>

      {/* Raw Token Input Field */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
        <WindowHeader
          title="Encoded JWT / Bearer Token"
          badge="Base64URL"
          linesCount={tokenInput ? tokenInput.split('\n').length : 0}
          charsCount={tokenInput.length}
          fontSize={fontSize}
          onFontSizeChange={setFontSize}
          isZenMode={isZenMode}
          onToggleZen={() => setIsZenMode(!isZenMode)}
        >
          <button
            onClick={() => {
              setTokenInput(getSampleJwt());
              toast.success('Sample token loaded');
            }}
            className="text-xs text-brand-500 hover:text-brand-400 font-medium px-2 py-0.5 rounded hover:bg-brand-500/10 transition-colors"
          >
            Sample
          </button>
          <button
            onClick={() => setTokenInput('')}
            className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </WindowHeader>
        <div className="p-3">
          <textarea
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste JWT (e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)..."
            rows={3}
            className={`w-full p-3 font-mono bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed break-all ${fontSizeClass}`}
          />
        </div>
      </div>

      {/* Token Decoded Panels */}
      {decoded && decoded.valid ? (
        <div className="space-y-6">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Algorithm</span>
              <span className="font-mono text-sm font-bold text-brand-500">{decoded.algorithm}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Token Type</span>
              <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">{decoded.type}</span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Issued At (iat)</span>
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 truncate block">
                {decoded.issuedAt ? decoded.issuedAt.toLocaleTimeString() : 'N/A'}
              </span>
            </div>

            <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block uppercase">Expires (exp)</span>
              <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300 truncate block">
                {decoded.expiresAt ? decoded.expiresAt.toLocaleTimeString() : 'No exp'}
              </span>
            </div>
          </div>

          {/* Dual Header & Payload Panes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Payload Claims */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
              <WindowHeader
                title="Payload Claims"
                badge="Decoded"
                linesCount={decoded.payload ? JSON.stringify(decoded.payload, null, 2).split('\n').length : 0}
                charsCount={decoded.payload ? JSON.stringify(decoded.payload, null, 2).length : 0}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              >
                <CopyButton
                  text={() => JSON.stringify(decoded.payload, null, 2)}
                  label="Copy Payload"
                  copiedLabel="Copied!"
                  targetElementId="jwt-payload-textarea"
                  variant="subtle"
                />
              </WindowHeader>
              <textarea
                id="jwt-payload-textarea"
                readOnly
                value={JSON.stringify(decoded.payload, null, 2)}
                rows={16}
                className={`w-full p-4 font-mono bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed ${fontSizeClass}`}
              />
            </div>

            {/* Header Metadata */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden editor-pane">
              <WindowHeader
                title="Header Metadata"
                badge="JOSE"
                linesCount={decoded.header ? JSON.stringify(decoded.header, null, 2).split('\n').length : 0}
                charsCount={decoded.header ? JSON.stringify(decoded.header, null, 2).length : 0}
                fontSize={fontSize}
                onFontSizeChange={setFontSize}
              >
                <CopyButton
                  text={() => JSON.stringify(decoded.header, null, 2)}
                  label="Copy Header"
                  copiedLabel="Copied!"
                  targetElementId="jwt-header-textarea"
                  variant="subtle"
                />
              </WindowHeader>
              <textarea
                id="jwt-header-textarea"
                readOnly
                value={JSON.stringify(decoded.header, null, 2)}
                rows={6}
                className={`w-full p-4 font-mono bg-transparent text-slate-900 dark:text-slate-100 focus:outline-none resize-none leading-relaxed ${fontSizeClass}`}
              />

              {/* Signature Info */}
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block mb-1">
                  Signature Hash
                </span>
                <p className="font-mono text-xs text-slate-500 break-all bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  {decoded.signature}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        decoded && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{decoded.error}</span>
          </div>
        )
      )}
    </div>
  );
}
