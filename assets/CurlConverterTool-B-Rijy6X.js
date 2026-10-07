import{u as O,r as u,j as s,n as N,S as P,i as L,L as _,d as U,T as q}from"./index-u0h7x96G.js";import{T as A,C as E,S as w}from"./StatCard-AmbMwG2E.js";import{W as k}from"./WindowHeader-DSF85hw8.js";import{P as H}from"./PresetChips-8vQKP4do.js";import{f as J}from"./confetti-CFSr66Fz.js";import{D as M}from"./download-B_kRkSw6.js";import{S as F}from"./send-DeXiumme.js";import"./copy-C2tlJw-W.js";function G(i){if(!i||!i.trim())return null;const n=i.replace(/\\\r?\n/g," ").trim();let r="";const e=n.match(/curl\s+(?:-[^\s]+\s+)*['"]?(https?:\/\/[^\s'"\\]+)['"]?/i)||n.match(/['"](https?:\/\/[^\s'"]+)['"]/i)||n.match(/(https?:\/\/[^\s'"]+)/i);e&&(r=e[1]);let l="GET";const t=n.match(/-X\s+['"]?([A-Z]+)['"]?/i)||n.match(/--request\s+['"]?([A-Z]+)['"]?/i);t&&(l=t[1].toUpperCase());const a={},d=/(?:-H|--header)\s+['"]([^'"]+)['"]/g;let h;for(;(h=d.exec(n))!==null;){const f=h[1],y=f.indexOf(":");if(y>-1){const S=f.slice(0,y).trim(),c=f.slice(y+1).trim();a[S]=c}}let m=null;const x=/(?:-d|--data|--data-raw|--data-binary)\s+['"]([\s\S]*?)['"](?=\s+-[A-Za-z]|\s*$)/g,g=[];let o;for(;(o=x.exec(n))!==null;)g.push(o[1]);g.length>0&&(m=g.join("&"),l==="GET"&&(l="POST"));let p=!1,$=null;if(m)try{$=JSON.parse(m),p=!0}catch{p=!1}return{url:r,method:l,headers:a,data:m,isJson:p,parsedJson:$}}function v({url:i,method:n,headers:r,data:e,isJson:l}){let t="";e&&(l?t=`
  body: JSON.stringify(${e.trim()}),`:t=`
  body: ${JSON.stringify(e)},`);const a=Object.keys(r).length>0?`
  headers: ${JSON.stringify(r,null,4).replace(/\n/g,`
  `)},`:"";return`// JavaScript Modern Fetch (Async / Await)
async function sendRequest() {
  const response = await fetch("${i}", {
    method: "${n}",${a}${t}
  });

  const result = await response.json();
  console.log(result);
  return result;
}

sendRequest();`}function z({url:i,method:n,headers:r,data:e,isJson:l}){const t=Object.keys(r).length>0?`
  headers: ${JSON.stringify(r,null,4).replace(/\n/g,`
  `)},`:"",a=e?l?`
  data: ${e.trim()},`:`
  data: ${JSON.stringify(e)},`:"";return`// Axios HTTP Client
import axios from 'axios';

async function sendRequest() {
  const config = {
    method: '${n.toLowerCase()}',
    url: '${i}',${t}${a}
  };

  const response = await axios(config);
  console.log(response.data);
  return response.data;
}

sendRequest();`}function D({url:i,method:n,headers:r,data:e,isJson:l}){let t="";e&&(l?t=`
    json=${JSON.stringify(JSON.parse(e),null,4).replace(/\n/g,`
    `)},`:t=`
    data=${JSON.stringify(e)},`);const a=Object.keys(r).length>0?`
    headers=${JSON.stringify(r,null,4).replace(/\n/g,`
    `)},`:"";return`# Python Requests
import requests

url = "${i}"${a?`
headers = ${JSON.stringify(r,null,4)}`:""}

response = requests.${n.toLowerCase()}(
    url,${a?`
    headers=headers,`:""}${t}
)

print(response.status_code)
print(response.json())`}function I({url:i,method:n,headers:r,data:e,isJson:l}){let t="";e&&(l?t=`
    json=${JSON.stringify(JSON.parse(e),null,4).replace(/\n/g,`
    `)},`:t=`
    content=${JSON.stringify(e)},`);const a=Object.keys(r).length>0?`
headers = ${JSON.stringify(r,null,4)}
`:"";return`# Python httpx (Async Client)
import httpx
import asyncio

async def main():
    url = "${i}"
${a}    async with httpx.AsyncClient() as client:
        response = await client.request(
            "${n}",
            url,${a?`
            headers=headers,`:""}${t}
        )
        print(response.status_code)
        print(response.text)

asyncio.run(main())`}function B({url:i,method:n,headers:r,data:e}){let l="nil",t="";e&&(t=`
	payload := strings.NewReader(${JSON.stringify(e)})
`,l="payload");let a="";for(const[d,h]of Object.entries(r))a+=`	req.Header.Set("${d}", "${h}")
`;return`// Go net/http
package main

import (
	"fmt"
	"io"
	"net/http"
	"strings"
)

func main() {${t}
	req, err := http.NewRequest("${n}", "${i}", ${l})
	if err != nil {
		panic(err)
	}
${a}
	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		panic(err)
	}
	defer res.Body.Close()

	body, _ := io.ReadAll(res.Body)
	fmt.Println(string(body))
}`}function X({url:i,method:n,headers:r,data:e}){let l="";for(const[a,d]of Object.entries(r))l+=`
        .header("${a}", "${d}")`;let t="";return e&&(t=`
        .body(${JSON.stringify(e)})`),`// Rust reqwest (Tokio Async)
use reqwest::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new();
    let res = client
        .${n.toLowerCase()}("${i}")${l}${t}
        .send()
        .await?;

    let text = res.text().await?;
    println!("{}", text);
    Ok(())
}`}function Z({url:i,method:n,headers:r,data:e}){const l=Object.entries(r).map(([a,d])=>`    "${a}: ${d}",`).join(`
`),t=e?`
curl_setopt($ch, CURLOPT_POSTFIELDS, ${JSON.stringify(e)});`:"";return`<?php
// PHP cURL
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "${i}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${n}");
${l?`curl_setopt($ch, CURLOPT_HTTPHEADER, [
${l}
]);
`:""}${t}

$response = curl_exec($ch);
$err = curl_error($ch);
curl_close($ch);

if ($err) {
    echo "cURL Error: " . $err;
} else {
    echo $response;
}`}function W({url:i,method:n,headers:r,data:e}){let l="";for(const[a,d]of Object.entries(r))a.toLowerCase()!=="content-type"&&(l+=`request.Headers.Add("${a}", "${d}");
        `);let t="";if(e){const a=r["Content-Type"]||r["content-type"]||"application/json";t=`request.Content = new StringContent(${JSON.stringify(e)}, System.Text.Encoding.UTF8, "${a}");
        `}return`// C# HttpClient (.NET 8+)
using System;
using System.Net.Http;
using System.Threading.Tasks;

class Program {
    static async Task Main() {
        using var client = new HttpClient();
        using var request = new HttpRequestMessage(HttpMethod.${n.charAt(0)+n.slice(1).toLowerCase()}, "${i}");
        ${l}${t}
        var response = await client.SendAsync(request);
        var responseString = await response.Content.ReadAsStringAsync();
        Console.WriteLine(responseString);
    }
}`}const R=`curl -X POST "https://api.quickformat.app/v1/documents/process" \\
  -H "Authorization: Bearer qf_sec_token_983109283" \\
  -H "Content-Type: application/json" \\
  -H "Accept: application/json" \\
  -d '{
    "documentId": "DOC-9021",
    "format": "csv",
    "notifyWebhook": true,
    "options": {
      "flatten": true,
      "maxRows": 5000
    }
  }'`,Q=[{id:"github",label:"GitHub API (GET)",description:"User details with Bearer token",curl:`curl -X GET "https://api.github.com/user" \\
  -H "Accept: application/vnd.github+json" \\
  -H "Authorization: Bearer token_sample_demo_9981" \\
  -H "User-Agent: QuickFormat-Client/2.0"`},{id:"stripe",label:"Stripe Payment (POST)",description:"Form URL-encoded charge intent",curl:`curl https://api.stripe.com/v1/payment_intents \\
  -u api_secret_sample_test_key: \\
  -d amount=2000 \\
  -d currency=usd \\
  -d "payment_method_types[]=card"`},{id:"json_api",label:"JSON Payload (POST)",description:"Application/json authentication",curl:`curl -X POST "https://api.example.com/v1/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "alex@company.com", "password": "superSecretPassword123"}'`}];function oe(){const i=O(),[n,r]=u.useState(R),[e,l]=u.useState("fetch"),[t,a]=u.useState("normal"),[d,h]=u.useState(!1),[m,x]=u.useState(null);u.useEffect(()=>{const c=C=>{C.key==="Escape"&&d&&h(!1)};return window.addEventListener("keydown",c),()=>window.removeEventListener("keydown",c)},[d]);const g=t==="small"?"text-[11px] leading-relaxed":t==="large"?"text-sm leading-relaxed":"text-xs sm:text-sm leading-relaxed",o=u.useMemo(()=>G(n),[n]),p=u.useMemo(()=>{if(!o||!o.url)return'// Enter a valid cURL command (e.g. curl -X GET "https://api.example.com").';switch(e){case"fetch":return v(o);case"axios":return z(o);case"python":return D(o);case"httpx":return I(o);case"go":return B(o);case"rust":return X(o);case"php":return Z(o);case"csharp":return W(o);default:return v(o)}},[o,e]),$=()=>{const C={fetch:"js",axios:"js",python:"py",httpx:"py",go:"go",rust:"rs",php:"php",csharp:"cs"}[e]||"js",T=new Blob([p],{type:"text/plain;charset=utf-8;"}),j=URL.createObjectURL(T),b=document.createElement("a");b.href=j,b.setAttribute("download",`quickformat_request_${e}.${C}`),document.body.appendChild(b),b.click(),document.body.removeChild(b),URL.revokeObjectURL(j),J(),i.success(`Exported .${C} script!`)},f=c=>{r(c.curl),x(c.id),i.success(`Loaded "${c.label}" cURL preset`)},y=u.useMemo(()=>{if(!o||!o.url)return"None";try{return new URL(o.url).hostname}catch{return o.url.split("/")[2]||o.url}},[o]),S=u.useMemo(()=>!o||!o.headers?0:Object.keys(o.headers).length,[o]);return s.jsxs("div",{className:"space-y-6",children:[s.jsx(A,{icon:N,category:"Dev & Networking",badge:"POSIX cURL Transpiler",title:"cURL to Multi-Language Code Converter",description:"Convert browser network inspection requests and command-line cURL commands into modern JavaScript Fetch, Axios, Python Requests, and Go code.",actions:s.jsxs(s.Fragment,{children:[s.jsx(E,{text:p,label:"Copy Code",copiedLabel:"Code Copied!",targetElementId:"curl-generated-code",variant:"default"}),s.jsxs("button",{onClick:$,className:"btn-primary",children:[s.jsx(M,{className:"w-3.5 h-3.5"}),s.jsx("span",{children:"Download Script"})]})]})}),s.jsxs("div",{className:"flex items-center justify-between gap-4 flex-wrap p-3 rounded-2xl glass-panel",children:[s.jsx(H,{presets:Q,activeId:m,onSelect:f,label:"Sample Requests"}),s.jsxs("div",{className:"flex items-center gap-2 text-xs font-mono text-slate-400",children:[s.jsx(P,{className:"w-3.5 h-3.5 text-sky-500"}),s.jsx("span",{children:"Supports headers, auth & JSON payloads"})]})]}),s.jsxs("div",{className:"grid grid-cols-2 lg:grid-cols-4 gap-4",children:[s.jsx(w,{icon:F,label:"HTTP Method",value:o&&o.method?o.method:"GET",subtext:"HTTP Verb",color:"sky"}),s.jsx(w,{icon:L,label:"Target Host",value:y,subtext:"Destination server",color:"emerald"}),s.jsx(w,{icon:_,label:"Request Headers",value:`${S} Headers`,subtext:"Parsed header tokens",color:"purple"}),s.jsx(w,{icon:U,label:"Target Runtime",value:e==="fetch"?"Browser / Fetch":e==="axios"?"Axios Client":e==="python"?"Python Requests":"Go net/http",subtext:e.toUpperCase(),color:"amber"})]}),s.jsxs("div",{className:`grid grid-cols-1 lg:grid-cols-2 gap-6 items-start ${d?"fixed inset-4 z-50 bg-[#060911]/95 p-6 rounded-2xl shadow-2xl backdrop-blur-xl":""}`,children:[s.jsxs("div",{className:"flex flex-col glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane focus-within:ring-2 focus-within:ring-sky-500/30 transition-all",children:[s.jsxs(k,{title:"cURL Command Input",badge:"Shell",linesCount:n?n.split(`
`).length:0,charsCount:n.length,fontSize:t,onFontSizeChange:a,isZenMode:d,onToggleZen:()=>h(!d),children:[s.jsx("button",{onClick:()=>{r(R),x(null),i.success("Sample cURL loaded")},className:"text-xs text-sky-500 hover:text-sky-400 font-medium px-2 py-1 rounded-lg hover:bg-sky-500/10 transition-colors",children:"Reset"}),s.jsx("button",{onClick:()=>{r(""),x(null)},className:"p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors",title:"Clear input",children:s.jsx(q,{className:"w-3.5 h-3.5"})})]}),s.jsx("div",{className:"p-2",children:s.jsx("textarea",{value:n,onChange:c=>{r(c.target.value),x(null)},placeholder:"Paste cURL command here (e.g. curl -X POST 'https://api.example.com'...)...",rows:18,className:`w-full p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none resize-none leading-relaxed min-h-[420px] border border-transparent ${g}`,spellCheck:!1})})]}),s.jsxs("div",{className:"flex flex-col glass-panel rounded-2xl border border-slate-200/80 dark:border-white/[0.08] shadow-xl overflow-hidden editor-pane min-h-[480px]",children:[s.jsx(k,{title:"Generated Client Code",badge:e.toUpperCase(),linesCount:p?p.split(`
`).length:0,charsCount:p.length,fontSize:t,onFontSizeChange:a,children:s.jsx("div",{className:"flex items-center gap-1 bg-slate-200/60 dark:bg-white/[0.06] p-0.5 rounded-lg text-xs mr-1 border border-slate-200/60 dark:border-white/[0.08] overflow-x-auto max-w-[280px] sm:max-w-none",children:[{id:"fetch",label:"Fetch"},{id:"axios",label:"Axios"},{id:"python",label:"Python (req)"},{id:"httpx",label:"httpx"},{id:"go",label:"Go"},{id:"rust",label:"Rust"},{id:"php",label:"PHP"},{id:"csharp",label:"C#"}].map(c=>s.jsx("button",{onClick:()=>l(c.id),className:`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all ${e===c.id?"bg-white dark:bg-slate-700 text-sky-500 shadow-xs":"text-slate-500 hover:text-slate-800 dark:hover:text-white"}`,children:c.label},c.id))})}),s.jsx("div",{className:"p-2 flex-1 flex flex-col",children:s.jsx("textarea",{id:"curl-generated-code",readOnly:!0,value:p,rows:18,className:`w-full flex-1 p-4 font-mono code-viewport bg-slate-50 dark:bg-[#050811] border border-slate-200 dark:border-white/[0.08] rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none resize-none leading-relaxed min-h-[400px] ${g}`,spellCheck:!1})})]})]})]})}export{oe as CurlConverterTool};
