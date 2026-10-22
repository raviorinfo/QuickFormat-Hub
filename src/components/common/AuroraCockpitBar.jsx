import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cpu, Zap, Activity, MoreHorizontal, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export function AuroraCockpitBar({ currentPath = '/json-to-csv', toolTitle = 'JSON to CSV' }) {
  const [throughput, setThroughput] = useState(39.08);
  const [latency, setLatency] = useState(15.39);
  const [repositionCount, setRepositionCount] = useState(808);
  const [isLive, setIsLive] = useState(true);

  // Subtle real-time telemetry shimmer to match the live cockpit in Image 1
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setThroughput((prev) => +(prev + (Math.random() * 0.4 - 0.2)).toFixed(2));
      setLatency((prev) => +(Math.max(12.1, prev + (Math.random() * 0.6 - 0.3))).toFixed(2));
      setRepositionCount((prev) => prev + (Math.random() > 0.7 ? 1 : 0));
    }, 2400);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="w-full mb-4 space-y-3 no-print select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-stretch">
        
        {/* Left Cockpit Column: Signature [ 0ms AIR-GAPPED SANDBOX ] Card (matches Image 1) */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="aurora-cockpit-card p-3.5 sm:p-4.5 flex items-center justify-between gap-4 relative overflow-hidden group">
            {/* Ambient Background Glow */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3.5 sm:gap-4 relative z-10">
              {/* Giant 0ms Indicator */}
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-3xl sm:text-4xl font-black text-emerald-400 drop-shadow-[0_0_14px_rgba(52,211,153,0.85)] tracking-tighter">
                  0ms
                </span>
              </div>

              {/* Divider */}
              <div className="w-px h-10 bg-emerald-500/30" />

              {/* Stacked Label */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                  <span className="font-mono text-[11px] sm:text-xs font-black tracking-widest text-emerald-300 uppercase leading-none">
                    AIR-GAPPED
                  </span>
                </div>
                <span className="font-mono text-[10px] sm:text-[11px] font-extrabold tracking-widest text-emerald-400/80 uppercase leading-tight mt-0.5">
                  SANDBOX
                </span>
              </div>
            </div>

            {/* Right Badge Status */}
            <div className="hidden sm:flex flex-col items-end text-right relative z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                100% In-Browser
              </span>
              <span className="text-[9px] font-mono text-emerald-400/70 mt-1">Zero Network Leakage</span>
            </div>
          </div>
        </div>

        {/* Right Cockpit Column: Live Telemetry Throughput Dashboard (matches Image 1) */}
        <div className="lg:col-span-7">
          <div className="aurora-telemetry-panel p-3.5 sm:p-4 relative overflow-hidden flex flex-col justify-between h-full">
            {/* Header with Title and ... menu */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-bold text-slate-100 tracking-tight font-sans">
                  Live telemetry throughput
                </span>
                <span className="flex items-center gap-1 text-[9px] font-mono text-cyan-400/80 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  ACTIVE
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-slate-400">client-node.v8</span>
                <button
                  type="button"
                  className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                  title="Telemetry settings"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Twin Metrics Cockpit */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 items-center">
              {/* Metric 1: Throughput with Bar Sparkline */}
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.06] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Throughput</span>
                  <span className="flex items-center text-[10px] font-mono font-bold text-emerald-400">
                    <ArrowUpRight className="w-3 h-3 inline" /> 30%
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-lg sm:text-xl font-bold font-mono text-white tracking-tight">
                    {throughput}k
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">ops/sec</span>
                </div>

                {/* Animated Multi-bar SVG Sparkline (matches Image 1) */}
                <div className="h-7 w-full flex items-end gap-[3px] pt-1">
                  {[45, 60, 35, 75, 90, 50, 70, 85, 95, 65, 80, 55, 70, 88].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-xs transition-all duration-500"
                      style={{
                        height: `${h}%`,
                        background: i % 2 === 0
                          ? 'linear-gradient(180deg, #a855f7 0%, #6366f1 100%)'
                          : 'linear-gradient(180deg, #00f0ff 0%, #0284c7 100%)',
                        opacity: 0.85 + (i / 14) * 0.15,
                      }}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-slate-400 pt-1 border-t border-white/[0.05]">
                  <span>Reposition: <strong className="text-slate-200">{repositionCount}</strong></span>
                  <span className="text-emerald-400 font-bold">Stable</span>
                </div>
              </div>

              {/* Metric 2: Real-time with Wave Sparkline */}
              <div className="p-2.5 rounded-lg bg-black/30 border border-white/[0.06] flex flex-col justify-between">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Real-time</span>
                  <span className="flex items-center text-[10px] font-mono font-bold text-emerald-400">
                    <ArrowUpRight className="w-3 h-3 inline" /> 40%
                  </span>
                </div>

                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-lg sm:text-xl font-bold font-mono text-cyan-300 tracking-tight">
                    {latency} <span className="text-xs font-normal text-slate-400">ms</span>
                  </span>
                  <span className="text-[9px] font-mono text-slate-400">0.0ms net</span>
                </div>

                {/* Smooth Glowing Cyan/Violet Wave Chart (matches Image 1) */}
                <div className="h-7 w-full overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 140 32" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.02" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,24 C20,12 35,28 55,16 C75,4 90,20 110,8 C125,0 135,14 140,10 L140,32 L0,32 Z"
                      fill="url(#waveGradient)"
                    />
                    <path
                      d="M0,24 C20,12 35,28 55,16 C75,4 90,20 110,8 C125,0 135,14 140,10"
                      fill="none"
                      stroke="#00f0ff"
                      strokeWidth="2"
                    />
                  </svg>
                </div>

                <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-slate-400 pt-1 border-t border-white/[0.05]">
                  <span>Amount: <strong className="text-slate-200">42.38%</strong></span>
                  <span className="text-cyan-400 font-bold">100% Client</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
