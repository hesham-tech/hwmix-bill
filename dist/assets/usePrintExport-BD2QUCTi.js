import{r as c}from"./index-DPR0tjT6.js";function y(){const i=c(!1),s=c(!1);return{isPrinting:i,isExporting:s,printElement:(t,r="Document")=>{i.value=!0;const o=document.getElementById(t);if(!o){console.error(`Element with id ${t} not found`),i.value=!1;return}const e=window.open("","_blank");e.document.write(`
      <html>
        <head>
          <title>${r}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; direction: rtl; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f2f2f2; }
            .no-print { display: none; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${r}</h1>
          ${o.innerHTML}
        </body>
      </html>
    `),e.document.close(),e.focus(),setTimeout(()=>{e.print(),e.close(),i.value=!1},500)},exportToCSV:(t,r="export.csv",o=[])=>{if(s.value=!0,!t||!t.length){s.value=!1;return}const e=[];o.length?e.push(o.join(",")):e.push(Object.keys(t[0]).join(","));for(const l of t){const u=Object.values(l).map(p=>`"${(""+p).replace(/"/g,'\\"')}"`);e.push(u.join(","))}const d=e.join(`
`),a=new Blob([d],{type:"text/csv;charset=utf-8;"}),n=document.createElement("a");if(n.download!==void 0){const l=URL.createObjectURL(a);n.setAttribute("href",l),n.setAttribute("download",r),n.style.visibility="hidden",document.body.appendChild(n),n.click(),document.body.removeChild(n)}s.value=!1}}}export{y as u};
