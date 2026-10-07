import{c as M,u as Z,r as p,j as e,G as J,S as Q,T as Y}from"./index-u0h7x96G.js";import{T as K,C as X,S as I}from"./StatCard-AmbMwG2E.js";import{W as D}from"./WindowHeader-DSF85hw8.js";import{T as E}from"./ToggleSwitch-BDqPOJZV.js";import{P as ee}from"./PresetChips-8vQKP4do.js";import{f as te}from"./confetti-CFSr66Fz.js";import{D as se}from"./download-B_kRkSw6.js";import{P as ne}from"./plus-CqIzChMw.js";import{M as re,S as ie}from"./square-check-big-DsFUaW1W.js";import"./copy-C2tlJw-W.js";/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const A={name:"arrow-left-right",size:24,node:[["path",{d:"M8 3 4 7l4 4",key:"9rb6wj"}],["path",{d:"M4 7h16",key:"6tx8e3"}],["path",{d:"m16 21 4-4-4-4",key:"siv7j2"}],["path",{d:"M20 17H4",key:"h6l3hr"}]]};A.node;const ae=M(A);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const O={name:"percent",size:24,node:[["line",{x1:"19",x2:"5",y1:"5",y2:"19",key:"1x9vlm"}],["circle",{cx:"6.5",cy:"6.5",r:"2.5",key:"4mh3h7"}],["circle",{cx:"17.5",cy:"17.5",r:"2.5",key:"1mdrzq"}]]};O.node;const oe=M(O);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const q={name:"split",size:24,node:[["path",{d:"M16 3h5v5",key:"1806ms"}],["path",{d:"M8 3H3v5",key:"15dfkv"}],["path",{d:"M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3",key:"1qrqzj"}],["path",{d:"m15 9 6-6",key:"ko1vev"}]]};q.node;const le=M(q);/**
 * @license lucide-react v1.52.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const F={name:"text-align-start",size:24,node:[["path",{d:"M21 5H3",key:"1fi0y6"}],["path",{d:"M15 12H3",key:"6jk70r"}],["path",{d:"M17 19H3",key:"z6ezky"}]],aliases:["text","align-left"]};F.node;const de=M(F);function ce(v,f,j={}){const{ignoreWhitespace:y=!1,ignoreCase:N=!1}=j,h=(v||"").split(/\r?\n/),g=(f||"").split(/\r?\n/),w=s=>{let r=s;return y&&(r=r.replace(/\s+/g," ").trim()),N&&(r=r.toLowerCase()),r},S=h.map(w),k=g.map(w),u=S.length,o=k.length,a=Array.from({length:u+1},()=>new Int32Array(o+1));for(let s=1;s<=u;s++)for(let r=1;r<=o;r++)S[s-1]===k[r-1]?a[s][r]=a[s-1][r-1]+1:a[s][r]=Math.max(a[s-1][r],a[s][r-1]);let i=u,l=o;const n=[];for(;i>0||l>0;)i>0&&l>0&&S[i-1]===k[l-1]?(n.push({type:"equal",origLine:h[i-1],modLine:g[l-1],origIndex:i,modIndex:l}),i--,l--):l>0&&(i===0||a[i][l-1]>=a[i-1][l])?(n.push({type:"insert",origLine:null,modLine:g[l-1],origIndex:null,modIndex:l}),l--):i>0&&(n.push({type:"delete",origLine:h[i-1],modLine:null,origIndex:i,modIndex:null}),i--);n.reverse();let x={additions:0,deletions:0,unchanged:0};n.forEach(s=>{s.type==="insert"?x.additions++:s.type==="delete"?x.deletions++:x.unchanged++});const L=[];let m=0;for(;m<n.length;){const s=n[m];if(s.type==="equal")L.push({leftNum:s.origIndex,leftContent:s.origLine,leftType:"equal",rightNum:s.modIndex,rightContent:s.modLine,rightType:"equal",wordDiff:null}),m++;else if(s.type==="delete"){const r=n[m+1];if(r&&r.type==="insert"){const T=xe(s.origLine,r.modLine,j);L.push({leftNum:s.origIndex,leftContent:s.origLine,leftType:"delete",rightNum:r.modIndex,rightContent:r.modLine,rightType:"insert",wordDiff:T}),m+=2}else L.push({leftNum:s.origIndex,leftContent:s.origLine,leftType:"delete",rightNum:null,rightContent:"",rightType:"empty",wordDiff:null}),m++}else s.type==="insert"&&(L.push({leftNum:null,leftContent:"",leftType:"empty",rightNum:s.modIndex,rightContent:s.modLine,rightType:"insert",wordDiff:null}),m++)}return{operations:n,sideBySide:L,stats:x}}function xe(v,f,j={}){const{ignoreCase:y=!1}=j;if(v===null||f===null)return null;const N=n=>(n||"").match(/\s+|\w+|[^\w\s]+/g)||[],h=N(v),g=N(f),w=n=>y?n.toLowerCase():n,S=h.length,k=g.length,u=Array.from({length:S+1},()=>new Int32Array(k+1));for(let n=1;n<=S;n++)for(let x=1;x<=k;x++)w(h[n-1])===w(g[x-1])?u[n][x]=u[n-1][x-1]+1:u[n][x]=Math.max(u[n-1][x],u[n][x-1]);let o=S,a=k;const i=[],l=[];for(;o>0||a>0;)o>0&&a>0&&w(h[o-1])===w(g[a-1])?(i.push({text:h[o-1],type:"equal"}),l.push({text:g[a-1],type:"equal"}),o--,a--):a>0&&(o===0||u[o][a-1]>=u[o-1][a])?(l.push({text:g[a-1],type:"insert"}),a--):o>0&&(i.push({text:h[o-1],type:"delete"}),o--);return i.reverse(),l.reverse(),{leftChunks:i,rightChunks:l}}const P=`// Server Configuration v1.4.0
const config = {
  server: {
    host: "127.0.0.1",
    port: 3000,
    protocol: "http",
    cors: {
      origin: "*",
      credentials: false
    }
  },
  database: {
    client: "sqlite3",
    connection: {
      filename: "./dev.sqlite3"
    },
    useNullAsDefault: true,
    pool: { min: 2, max: 10 }
  },
  logging: {
    level: "debug",
    colorize: true
  },
  security: {
    rateLimit: 100,
    sessionTimeoutMs: 3600000
  }
};

module.exports = config;`,$=`// Server Configuration v2.0.0 — Production Ready
const config = {
  server: {
    host: "0.0.0.0",
    port: process.env.PORT || 8080,
    protocol: "https",
    cors: {
      origin: ["https://quickformat.app", "https://api.quickformat.app"],
      credentials: true
    }
  },
  database: {
    client: "pg",
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    },
    pool: { min: 5, max: 25 },
    idleTimeoutMillis: 30000
  },
  logging: {
    level: "info",
    colorize: false,
    format: "json"
  },
  security: {
    rateLimit: 500,
    sessionTimeoutMs: 7200000,
    enableHelmet: true
  }
};

export default config;`,pe=[{id:"api",label:"API JSON Payload",description:"REST API response schema with added fields and modified status",orig:`{
  "status": 200,
  "data": {
    "user_id": 4921,
    "tier": "free",
    "rate_limit": 100
  }
}`,mod:`{
  "status": 200,
  "data": {
    "user_id": 4921,
    "tier": "enterprise",
    "rate_limit": 10000,
    "sso_enabled": true
  }
}`},{id:"config",label:"Docker Compose YAML",description:"Service configuration version bump and environment variables",orig:`version: '3.8'
services:
  app:
    image: node:18-alpine
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development`,mod:`version: '3.8'
services:
  app:
    image: node:20-alpine
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      LOG_LEVEL: debug`},{id:"sql",label:"SQL Query Refactor",description:"Optimization of database query with index hints and join syntax",orig:`SELECT u.id, u.name, o.total
FROM users u, orders o
WHERE u.id = o.user_id
AND o.status = 'completed';`,mod:`SELECT u.id, u.name, SUM(o.total) AS lifetime_value
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
GROUP BY u.id, u.name;`}];function je(){const v=Z(),[f,j]=p.useState(P),[y,N]=p.useState($),[h,g]=p.useState("split"),[w,S]=p.useState(!1),[k,u]=p.useState(!1),[o,a]=p.useState("normal"),[i,l]=p.useState(!1),[n,x]=p.useState(!0),[L,m]=p.useState(null),s=p.useRef(null),r=p.useRef(null),T=p.useRef(!1),R=t=>{!n||T.current||(T.current=!0,t==="orig"&&s.current&&r.current?r.current.scrollTop=s.current.scrollTop:t==="mod"&&s.current&&r.current&&(s.current.scrollTop=r.current.scrollTop),requestAnimationFrame(()=>{T.current=!1}))};p.useEffect(()=>{const t=C=>{C.key==="Escape"&&i&&l(!1)};return window.addEventListener("keydown",t),()=>window.removeEventListener("keydown",t)},[i]);const _=o==="small"?"text-[11px] leading-relaxed":o==="large"?"text-sm leading-relaxed":"text-xs leading-relaxed",d=p.useMemo(()=>ce(f,y,{ignoreWhitespace:w,ignoreCase:k}),[f,y,w,k]),H=()=>{const t=f;j(y),N(t),m(null),v.info("Swapped Original and Modified text")},U=()=>{j(P),N($),m(null),v.success("Baseline sample code restored")},B=()=>{j(""),N(""),m(null),v.info("Cleared inputs")},W=t=>{j(t.orig),N(t.mod),m(t.id),v.success(`Loaded ${t.label}`)},z=()=>["--- Baseline","+++ Target",`@@ -1,${d.stats.origLines} +1,${d.stats.modLines} @@`,...d.operations.map(t=>t.type==="delete"?`-${t.origLine}`:t.type==="insert"?`+${t.modLine}`:` ${t.origLine}`)].join(`
`),G=()=>{const t=z(),C=new Blob([t],{type:"text/plain;charset=utf-8;"}),b=URL.createObjectURL(C),c=document.createElement("a");c.href=b,c.setAttribute("download",`quickformat_diff_${Date.now()}.patch`),document.body.appendChild(c),c.click(),document.body.removeChild(c),URL.revokeObjectURL(b),te(),v.success("Exported .patch file!")},V=p.useMemo(()=>{const t=Math.max(1,d.stats.origLines,d.stats.modLines);return`${Math.round(d.stats.unchanged/t*100)}%`},[d]);return e.jsxs("div",{className:"space-y-6",children:[e.jsx(K,{icon:J,category:"Docs & Code Review",badge:"Myers LCS",title:"Text & Code Difference Checker",description:"Compare source code and documents side-by-side or inline with visual additions (green), deletions (red), synchronized viewport scrolling, and patch exporting.",actions:e.jsxs(e.Fragment,{children:[e.jsxs("button",{onClick:H,id:"btn-swap-diff",className:"btn-secondary",title:"Swap Original and Modified texts",children:[e.jsx(ae,{className:"w-3.5 h-3.5 text-sky-500"}),e.jsx("span",{children:"Swap"})]}),e.jsx(X,{text:z,label:"Copy Patch",copiedLabel:"Patch Copied!",variant:"default"}),e.jsxs("button",{onClick:G,id:"btn-download-patch",className:"btn-primary",children:[e.jsx(se,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Download Patch"})]})]})}),e.jsxs("div",{className:"flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel",children:[e.jsx(ee,{presets:pe,onSelect:W,activeId:L,label:"1-Click Presets"}),e.jsxs("div",{className:"flex items-center gap-2 text-xs font-mono text-slate-400",children:[e.jsx(Q,{className:"w-3.5 h-3.5 text-amber-500"}),e.jsx("span",{children:"Myers algorithm O((N+M)D)"})]})]}),e.jsxs("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-4",children:[e.jsx(I,{icon:ne,label:"Additions",value:`+${d.stats.additions}`,subtext:"Inserted lines",color:"emerald"}),e.jsx(I,{icon:re,label:"Deletions",value:`-${d.stats.deletions}`,subtext:"Removed lines",color:"rose"}),e.jsx(I,{icon:ie,label:"Unchanged",value:d.stats.unchanged.toString(),subtext:"Identical lines",color:"sky"}),e.jsx(I,{icon:oe,label:"Similarity",value:V,subtext:"Matching baseline",color:"purple"})]}),e.jsxs("div",{className:"flex flex-wrap items-center justify-between gap-4 p-3.5 glass-panel rounded-2xl shadow-sm border border-slate-200/80 dark:border-white/[0.08]",children:[e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsx(E,{label:"Sync Scroll",checked:n,onChange:x,size:"sm"}),e.jsx(E,{label:"Ignore Space",checked:w,onChange:S,size:"sm"}),e.jsx(E,{label:"Ignore Case",checked:k,onChange:u,size:"sm"})]}),e.jsxs("div",{className:"flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-xl border border-slate-200/60 dark:border-white/[0.08]",children:[e.jsxs("button",{onClick:()=>g("split"),className:`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${h==="split"?"bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs":"text-slate-500 hover:text-slate-800 dark:hover:text-white"}`,children:[e.jsx(le,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Side-by-Side"})]}),e.jsxs("button",{onClick:()=>g("unified"),className:`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${h==="unified"?"bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-xs":"text-slate-500 hover:text-slate-800 dark:hover:text-white"}`,children:[e.jsx(de,{className:"w-3.5 h-3.5"}),e.jsx("span",{children:"Inline"})]})]})]}),e.jsxs("div",{className:`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${i?"fixed inset-4 z-50 bg-[#060911]/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl":""}`,children:[e.jsxs("div",{className:"flex flex-col glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all",children:[e.jsx(D,{title:"Original Baseline Text",badge:"Original",linesCount:f?f.split(`
`).length:0,charsCount:f.length,fontSize:o,onFontSizeChange:a,isZenMode:i,onToggleZen:()=>l(!i)}),e.jsx("div",{className:"p-2",children:e.jsx("textarea",{ref:s,onScroll:()=>R("orig"),id:"diff-original-textarea",value:f,onChange:t=>{j(t.target.value),m(null)},placeholder:"Paste baseline text or code here...",rows:8,className:`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y leading-relaxed border border-transparent ${_}`,spellCheck:!1})})]}),e.jsxs("div",{className:"flex flex-col glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all",children:[e.jsxs(D,{title:"Modified Target Text",badge:"Target",linesCount:y?y.split(`
`).length:0,charsCount:y.length,fontSize:o,onFontSizeChange:a,children:[e.jsx("button",{onClick:U,className:"text-xs text-sky-500 hover:text-sky-400 font-semibold px-2 py-0.5 rounded hover:bg-sky-500/10 transition-colors",children:"Reset"}),e.jsx("button",{onClick:B,className:"p-1.5 text-slate-400 hover:text-rose-500 transition-colors",title:"Clear both inputs",children:e.jsx(Y,{className:"w-3.5 h-3.5"})})]}),e.jsx("div",{className:"p-2",children:e.jsx("textarea",{ref:r,onScroll:()=>R("mod"),id:"diff-modified-textarea",value:y,onChange:t=>{N(t.target.value),m(null)},placeholder:"Paste modified text or code here...",rows:8,className:`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-y leading-relaxed border border-transparent ${_}`,spellCheck:!1})})]})]}),e.jsxs("div",{className:"glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane",children:[e.jsx(D,{title:"Diff Comparison View",badge:h==="split"?"Side-by-Side":"Inline Unified",linesCount:d.operations.length,children:e.jsxs("div",{className:"flex items-center gap-2 text-xs font-mono text-slate-400",children:[e.jsxs("span",{className:"text-emerald-500 font-bold",children:["+",d.stats.additions]}),e.jsx("span",{children:"/"}),e.jsxs("span",{className:"text-rose-500 font-bold",children:["-",d.stats.deletions]})]})}),e.jsx("div",{className:"overflow-x-auto max-h-[560px] p-2 bg-slate-50/50 dark:bg-[#050811] font-mono",children:h==="split"?e.jsxs("div",{className:"grid grid-cols-2 divide-x divide-slate-200 dark:divide-white/[0.08]",children:[e.jsx("div",{className:"divide-y divide-slate-100 dark:divide-white/[0.04]",children:d.operations.map((t,C)=>{const b=t.type==="delete",c=t.type==="insert";return e.jsxs("div",{className:`flex items-start text-xs ${b?"bg-rose-500/15 text-rose-700 dark:text-rose-300":c?"bg-slate-100/30 dark:bg-slate-900/20 opacity-30":"text-slate-700 dark:text-slate-300"}`,children:[e.jsx("span",{className:"w-10 px-2 py-1 select-none text-[10px] text-slate-400 text-right shrink-0 bg-slate-100/60 dark:bg-white/[0.03] border-r border-slate-200/60 dark:border-white/[0.06]",children:t.origIndex||""}),e.jsx("span",{className:"w-6 py-1 select-none text-center font-bold shrink-0 text-rose-500",children:b?"-":""}),e.jsx("pre",{className:"py-1 px-2 overflow-x-auto font-mono flex-1 whitespace-pre-wrap break-all",children:t.origLine||(c?e.jsx("span",{className:"opacity-0",children:"~"}):"")})]},`left-${C}`)})}),e.jsx("div",{className:"divide-y divide-slate-100 dark:divide-white/[0.04]",children:d.operations.map((t,C)=>{const b=t.type==="delete",c=t.type==="insert";return e.jsxs("div",{className:`flex items-start text-xs ${c?"bg-emerald-500/15 text-emerald-700 dark:text-emerald-300":b?"bg-slate-100/30 dark:bg-slate-900/20 opacity-30":"text-slate-700 dark:text-slate-300"}`,children:[e.jsx("span",{className:"w-10 px-2 py-1 select-none text-[10px] text-slate-400 text-right shrink-0 bg-slate-100/60 dark:bg-white/[0.03] border-r border-slate-200/60 dark:border-white/[0.06]",children:t.modIndex||""}),e.jsx("span",{className:"w-6 py-1 select-none text-center font-bold shrink-0 text-emerald-500",children:c?"+":""}),e.jsx("pre",{className:"py-1 px-2 overflow-x-auto font-mono flex-1 whitespace-pre-wrap break-all",children:t.modLine||(b?e.jsx("span",{className:"opacity-0",children:"~"}):"")})]},`right-${C}`)})})]}):e.jsx("div",{className:"divide-y divide-slate-100 dark:divide-white/[0.04]",children:d.operations.map((t,C)=>{const b=t.type==="delete",c=t.type==="insert";return e.jsxs("div",{className:`flex items-start text-xs ${c?"bg-emerald-500/15 text-emerald-700 dark:text-emerald-300":b?"bg-rose-500/15 text-rose-700 dark:text-rose-300":"text-slate-700 dark:text-slate-300"}`,children:[e.jsx("span",{className:"w-10 px-2 py-1 select-none text-[10px] text-slate-400 text-right shrink-0 bg-slate-100/60 dark:bg-white/[0.03] border-r border-slate-200/60 dark:border-white/[0.06]",children:t.origIndex||""}),e.jsx("span",{className:"w-10 px-2 py-1 select-none text-[10px] text-slate-400 text-right shrink-0 bg-slate-100/60 dark:bg-white/[0.03] border-r border-slate-200/60 dark:border-white/[0.06]",children:t.modIndex||""}),e.jsx("span",{className:`w-6 py-1 select-none text-center font-bold shrink-0 ${c?"text-emerald-500":b?"text-rose-500":""}`,children:c?"+":b?"-":" "}),e.jsx("pre",{className:"py-1 px-2 overflow-x-auto font-mono flex-1 whitespace-pre-wrap break-all",children:c?t.modLine:t.origLine})]},C)})})})]})]})}export{je as TextDiffTool};
