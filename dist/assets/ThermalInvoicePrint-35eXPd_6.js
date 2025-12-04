import{_ as v,r as y,P as _,o as r,c as a,a as t,t as n,F as p,A as x,q as w,ag as S}from"./index-Tc2OuKZg.js";const g={class:"header flex-col"},T={class:"row company col-12"},b={class:"row col-12 row-inline"},C={class:"col-6 text-right"},k={class:"col-6 text-left"},E={class:"row customer col-12"},A={class:"items-table"},D={class:"footer flex-col"},P={class:"row col-12"},L={class:"col-6 text-right"},R={class:"col-6 text-left"},q={class:"row col-12"},G={class:"col-6 text-right"},I={key:0,class:"col-6 text-left"},N={__name:"ThermalInvoicePrint",props:{invoice:{type:Object,required:!0},companyName:{type:String,default:"بدون اسم"}},setup(o,{expose:m}){const u=y(null);function c(s){return new Intl.NumberFormat("ar-EG",{style:"currency",currency:"EGP"}).format(s||0)}function h(s){return s?new Date(s).toLocaleDateString("ar-EG"):""}_(()=>{const s=Array.from(document.querySelectorAll("style[scoped]"));let e="";s.forEach(l=>{try{const i=l.sheet;if(!i)return;for(const d of i.cssRules)d.type===CSSRule.STYLE_RULE&&d.selectorText.startsWith(".")&&(e+=`${d.cssText}
`)}catch{}}),console.log("Component Scoped CSS Rules:",e),window.__thermalPrintComponentCSS=e});function f(){S(()=>{const s=u.value;if(!s)return;const e=`<div class='thermal-print'>${s.innerHTML}</div>`,l=window.__thermalPrintComponentCSS||"",i=window.open("","","width=1000,height=800,left=200,top=50");i.document.write(`
          <html>
            <head>
              <title>طباعة فاتورة حرارية</title>
              <link rel="stylesheet" href="/dist/assets/index-Dmm87GDT.css">
              <style>
                /* Scoped component styles */
                ${l}
                /* يمكن إضافة أي تخصيص إضافي هنا إذا لزم */
                body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 100vh; background: #fff; }
                .thermal-print { width: 260px; font-size: 13px; font-family: 'Tahoma', 'Arial', sans-serif; direction: rtl; color: #000; }
              </style>
            </head>
            <body>
              ${e}
            </body>
          </html>
        `),i.document.close(),i.focus(),setTimeout(()=>{i.print(),i.close()},300)})}return m({printThermal:f}),(s,e)=>(r(),a("div",{class:"thermal-print",ref_key:"printArea",ref:u},[t("div",g,[t("div",T,n(o.invoice.company.name),1),t("div",b,[t("div",C,"فاتورة رقم: "+n(o.invoice.invoice_number),1),t("div",k,"التاريخ: "+n(h(o.invoice.updated_at||o.invoice.created_at)),1)]),t("div",E,"العميل: "+n(o.invoice.user.full_name),1)]),e[1]||(e[1]=t("hr",null,null,-1)),t("table",A,[e[0]||(e[0]=t("thead",null,[t("tr",null,[t("th",null,"الصنف"),t("th",null,"الكمية"),t("th",null,"السعر"),t("th",null,"الإجمالي")])],-1)),t("tbody",null,[(r(!0),a(p,null,x(o.invoice.items,l=>(r(),a("tr",{key:l.product_id},[t("td",null,n(l.name),1),t("td",null,n(l.quantity),1),t("td",null,n(c(l.unit_price)),1),t("td",null,n(c(l.total)),1)]))),128))])]),e[2]||(e[2]=t("hr",null,null,-1)),t("div",D,[t("div",P,[t("div",L,"الإجمالي: "+n(c(o.invoice.total_amount)),1),t("div",R,"المدفوع: "+n(c(o.invoice.paid_amount)),1)]),t("div",q,[t("div",G,"المتبقي: "+n(c(o.invoice.remaining_amount)),1),o.invoice.notes?(r(),a("div",I,"ملاحظات: "+n(o.invoice.notes),1)):w("",!0)])])],512))}},B=v(N,[["__scopeId","data-v-a8c3a348"]]);export{B as default};
