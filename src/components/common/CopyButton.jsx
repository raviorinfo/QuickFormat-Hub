import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { playSuccessChime } from '../../utils/audioFeedback';
import { useToast } from '../../context/ToastContext';

export function CopyButton({
  text,
  label = 'Copy',
  copiedLabel = 'Copied!',
  targetElementId = null,
  className = '',
  variant = 'default', // 'default' | 'primary' | 'subtle'
}) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    if (!text) {
      toast.error('Nothing to copy');
      return;
    }

    try {
      await navigator.clipboard.writeText(typeof text === 'function' ? text() : text);
      setCopied(true);
      playSuccessChime();
      toast.success(`${label} copied to clipboard!`);

      // Flash target element ring if targetElementId is given
      if (targetElementId) {
        const el = document.getElementById(targetElementId);
        if (el) {
          el.classList.add('ring-2', 'ring-emerald-500/60', 'transition-all');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-emerald-500/60');
          }, 1000);
        }
      }

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const baseStyle =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 select-none';

  let variantStyle = '';
  if (copied) {
    variantStyle = 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 scale-102';
  } else if (variant === 'primary') {
    variantStyle = 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/25';
  } else if (variant === 'subtle') {
    variantStyle = 'text-slate-600 dark:text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800';
  } else {
    variantStyle =
      'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs';
  }

  return (
    <button
      onClick={handleCopy}
      className={`${baseStyle} ${variantStyle} ${className}`}
      title={copied ? copiedLabel : label}
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5 text-emerald-500 animate-scale-bounce" />
          <span className="font-bold">{copiedLabel}</span>
        </>
      ) : (
        <>
          <Copy className="w-3.5 h-3.5" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
