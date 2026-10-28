import {createRequire} from 'node:module';
import {writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {createStarterDesign,SAMPLE_VALUES,FONTS} from '../../src/modules/print/templates-editor/templateSchema.js';
const require=createRequire(new URL('../../package.json',import.meta.url));
const {chromium}=require('@playwright/test');
const OUTPUT=new URL('./.qa-output/',import.meta.url);
await mkdir(OUTPUT,{recursive:true});
const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:{width:1560,height:1050}});
const page=await context.newPage();const failures=[],requests=[];
page.on('pageerror',error=>failures.push(error.message));
page.on('console',message=>{if(message.type()==='error')console.log('Browser console:',message.text());});
page.on('requestfailed',request=>console.log('Request failed:',request.url(),request.failure()?.errorText));
let forceConflict=false;
const state={1:{id:1,company_id:1,name:'القالب القياسي',lock_version:1,archived:false,is_default:true,has_draft:false,published_revision_id:101,published:{id:101,version:1,design:createStarterDesign()},draft:null,revisions:[{id:101,version:1}]}};
const copy=value=>JSON.parse(JSON.stringify(value));
async function until(check,timeout=15000){const end=Date.now()+timeout;while(!check()){if(Date.now()>end)throw Error('Timed out waiting for mock API state');await new Promise(resolve=>setTimeout(resolve,100));}}
const fields=Object.keys(SAMPLE_VALUES).map(key=>({key,title:({'product.name':'اسم المنتج','variant.retail_price':'سعر البيع الحالي','company.name':'اسم الشركة','variant.barcode':'الباركود','company.website':'موقع الشركة'})[key]||key,type:key.includes('price')?'number':'text',group:key.split('.')[0],requiresInvoice:key.startsWith('invoice.')}));
await context.route('**/*',async route=>{
 const request=route.request(),url=new URL(request.url());
 if(url.port==='19191'){requests.push('FORBIDDEN_PRINTER_REQUEST');return route.abort();}
 if(!url.pathname.includes('/api/v1/'))return url.origin==='http://127.0.0.1:5175'?route.continue():route.abort();
 const path=url.pathname.split('/api/v1/')[1],method=request.method();requests.push(`${method} ${path}`);
 let body={};try{body=request.postDataJSON()||{};}catch{}
 const reply=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(data)});
 const cid=Number(request.headers()['x-company-id']||1);
 if(path==='label-templates/fields')return reply({data:fields,fonts:FONTS,permissions:{manage:true,publish:true,set_default:true}});
 if(path==='label-templates'&&method==='GET')return reply({data:Object.values(state).filter(t=>t.company_id===cid&&(!t.archived||url.searchParams.get('include_archived')==='1')&&(!url.searchParams.has('published_only')||url.searchParams.get('published_only')!=='1'||t.published)),default_id:Object.values(state).find(t=>t.company_id===cid&&t.is_default)?.id||null,company_id:cid});
 if(path==='label-templates'&&method==='POST'){const id=Object.keys(state).length+1;state[id]={id,company_id:cid,name:body.name,description:body.description||null,lock_version:1,archived:false,is_default:false,has_draft:true,draft:{id:id*100+1,version:1,design:body.design},published:null,published_revision_id:null,revisions:[]};return reply({data:copy(state[id])},201);}
 const match=/^label-templates\/(\d+)(?:\/(\w+))?$/.exec(path);
 if(match){const template=state[Number(match[1])];if(!template||template.company_id!==cid)return reply({message:'غير موجود'},404);const action=match[2];
  if(method==='GET')return reply({data:copy(template)});
  if(method==='PUT'){if(forceConflict||body.lock_version!==template.lock_version)return reply({message:'تعارض تعديل؛ عدّل مستخدم آخر القالب.'},409);template.lock_version++;if(body.name)template.name=body.name;template.has_draft=true;template.draft={id:template.id*100+2,version:(template.published?.version||0)+1,design:copy(body.design)};return reply({data:copy(template)});}
  if(action==='metadata'){if(forceConflict||body.lock_version!==template.lock_version)return reply({message:'تعارض بيانات'},409);if(body.name)template.name=body.name;template.description=body.description||null;if(body.make_default)Object.values(state).forEach(t=>t.is_default=t.id===template.id);template.lock_version++;return reply({data:copy(template)});}
  if(action==='publish'){template.published={...template.draft};template.published_revision_id=template.draft.id;template.revisions.push({id:template.draft.id,version:template.draft.version});template.draft=null;template.has_draft=false;template.lock_version++;return reply({data:copy(template)});}
  if(action==='default'){Object.values(state).forEach(t=>t.is_default=t.id===template.id);return reply({data:{default_id:template.id}});}
  if(action==='duplicate'){const id=Object.keys(state).length+1;state[id]={...copy(template),id,name:body.name||template.name+' — نسخة',is_default:false,published:null,published_revision_id:null,draft:{id:id*100+1,version:1,design:copy((template.draft||template.published).design)},has_draft:true,lock_version:1,revisions:[]};return reply({data:copy(state[id])},201);}
 }
 if(path==='label-print-data'||path==='label-template-preview-data'){const template=state[body.template_id]||state[1];return reply({data:{company_id:cid,template_id:template.id,revision_id:body.revision_id||template.published.id,design:body.design||copy(template.published.design),records:body.items.map(item=>({variant_id:item.variant_id||1,invoice_item_id:item.invoice_item_id,quantity:item.quantity,unit_id:null,units:[],values:{...SAMPLE_VALUES}}))}});}
 if(path==='products')return reply({status:true,data:[{id:1,name:'منتج اختبار'}]});
 if(path==='products/1')return reply({status:true,data:{id:1,name:'منتج اختبار',variants:[{id:1,sku:'SKU-TEST',retail_price:75,barcode:'1000000000'}]}});
 return reply({data:[]});
});

try{
 console.log('Opening isolated editor fixture.');
 await page.goto('http://127.0.0.1:5175/tests/e2e/fixtures/label-template-harness.html',{waitUntil:'domcontentloaded',timeout:60000});
 await page.waitForFunction(()=>!!window.labelQA,undefined,{timeout:120000});
 await page.locator('.label-editor').waitFor({timeout:60000});
 await page.waitForFunction(()=>document.querySelectorAll('canvas').length>0,{timeout:60000});
 await page.screenshot({path:fileURLToPath(new URL('editor-initial.png',OUTPUT)),fullPage:true});
 console.log('Editor mounted; runtime errors:',JSON.stringify(failures));
 const initialWidth=state[1].published.design.widthMm;
 await page.setViewportSize({width:1366,height:768});
 await page.getByRole('button',{name:'إعداد الملصق والورق',exact:true}).click();
 await page.getByLabel('العرض مم',{exact:true}).fill('55');
 await page.getByRole('button',{name:'إلغاء',exact:true}).last().click();
 await page.getByRole('button',{name:'تجاهل',exact:true}).click();
 await page.waitForTimeout(1800);
 if(state[1].draft||state[1].published.design.widthMm!==initialWidth)throw Error('Settings cancel mutated or autosaved design');
 await page.getByRole('button',{name:'إعداد الملصق والورق',exact:true}).click();
 await page.getByLabel('العرض مم',{exact:true}).fill('52');
 await page.getByRole('button',{name:'تطبيق',exact:true}).click();
 await until(()=>state[1].draft?.design.widthMm===52);
 await page.getByRole('button',{name:'تراجع',exact:true}).click();
 await until(()=>state[1].draft?.design.widthMm===50);
 await page.getByRole('button',{name:'طي مكتبة العناصر',exact:true}).click();
 await page.getByRole('button',{name:'إظهار مكتبة العناصر',exact:true}).click();
 await page.getByRole('button',{name:'بيانات القالب',exact:true}).click();
 await page.getByLabel('اسم القالب',{exact:true}).fill('قالب باسم محدث');
 await page.getByLabel('وصف القالب (اختياري)',{exact:true}).fill('قالب للملابس');
 await page.getByRole('button',{name:'حفظ البيانات',exact:true}).click();
 await until(()=>state[1].name==='قالب باسم محدث');
 await page.getByRole('heading',{name:'قالب باسم محدث',exact:true}).waitFor();
 await page.getByRole('button',{name:'معاينة الطباعة',exact:true}).focus();
 await page.locator('[role="tooltip"]').filter({hasText:'عرض التصميم بمحرك الإخراج'}).waitFor();
 await page.keyboard.press('Escape');
 await page.screenshot({path:fileURLToPath(new URL('editor-laptop.png',OUTPUT)),fullPage:true});
 await page.setViewportSize({width:1560,height:1050});
 await page.getByRole('button',{name:'بيانات القالب',exact:true}).click();
 await page.getByLabel('اسم القالب',{exact:true}).fill('تعديل يحتفظ به التعارض');
 forceConflict=true;await page.getByRole('button',{name:'حفظ البيانات',exact:true}).click();
 await page.getByText('مدخلاتك محفوظة هنا.',{exact:false}).waitFor();
 if(await page.getByLabel('اسم القالب',{exact:true}).inputValue()!=='تعديل يحتفظ به التعارض')throw Error('Metadata conflict lost input');
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'تجاهل',exact:true}).click();forceConflict=false;
 await page.getByRole('button',{name:'ملاحظات الجودة (1)',exact:true}).click();
 await page.getByText('حجم الخط أقل من 7 نقاط',{exact:false}).click();
 await page.getByLabel('حجم الخط بالنقاط pt',{exact:true}).waitFor();
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'إعداد الملصق والورق',exact:true}).click();
 await page.getByRole('tab',{name:'توزيع A4',exact:true}).click();
 await page.locator('svg[aria-label="معاينة توزيع الملصقات على A4"]').waitFor();
 await page.screenshot({path:fileURLToPath(new URL('settings-mobile.png',OUTPUT)),fullPage:true});
 await page.keyboard.press('Escape');
 await page.setViewportSize({width:1560,height:1050});
 await page.getByRole('button',{name:'نص',exact:true}).click();
 await page.getByLabel('الموضع X مم',{exact:true}).fill('6');
 await until(()=>state[1].draft?.design.elements.length===6);
 if(!state[1].draft||state[1].published.design.elements.length!==5||state[1].draft.design.elements.length!==6)throw Error('Draft modified the publication or autosave failed');
 await page.getByRole('button',{name:'نشر القالب',exact:true}).click();
 await until(()=>state[1].published.design.elements.length===6);
 if(state[1].published.design.elements.length!==6)throw Error('Publication failed');
 const digital=await page.evaluate(async()=>{
  const qa=window.labelQA,design=qa.createStarterDesign();
  const canvas=await qa.renderTemplate(design,qa.SAMPLE_VALUES,{geometry:{widthDots:384,dpi:203}});
  const barcode=qa.decode(canvas);
  const qrDesign={...qa.createStarterDesign(),elements:[{...qa.newElement('qr','company.website'),x:5,y:5,width:30,height:30}]};
  const qrCanvas=await qa.renderTemplate(qrDesign,qa.SAMPLE_VALUES);
  const qr=qa.decode(qrCanvas);
  const pdf=await qa.templatePdf(design,[{values:qa.SAMPLE_VALUES,quantity:13}],{layout:'a4',startCell:12,monochrome:false});
  const pdfText=await pdf.blob.text(),pages=(pdfText.match(/\/Type \/Page\b/g)||[]).length;
  let rejected=false;try{await qa.renderTemplate({...design,elements:[{...design.elements.find(e=>e.type==='barcode'),width:5}]},qa.SAMPLE_VALUES);}catch{rejected=true;}
  const noto={...design,elements:[{...qa.newElement('text','product.name'),x:3,y:3,width:44,height:20,fontFamily:'Noto Sans Arabic',fontSize:12,minFontSize:12}]};
  const notoCanvas=await qa.renderTemplate(noto,qa.SAMPLE_VALUES);const notoPixels=notoCanvas.getContext('2d').getImageData(0,0,notoCanvas.width,notoCanvas.height).data;
  let notoBlack=0;for(let i=0;i<notoPixels.length;i+=4)if(notoPixels[i]===0)notoBlack++;
  const linkedQr={...qrDesign,elements:[{...qrDesign.elements[0],field:'',content:'https://bill.hwnix.com/products/{{variant.sku}}'}]};
  const linkedValue=qa.decode(await qa.renderTemplate(linkedQr,qa.SAMPLE_VALUES));
  let missingBlocked=false;try{await qa.renderTemplate(linkedQr,{...qa.SAMPLE_VALUES,'variant.sku':''});}catch{missingBlocked=true;}
  const roll=await qa.templatePdf(design,[{values:qa.SAMPLE_VALUES,quantity:1}],{geometry:{widthDots:384,dpi:203}});
  return{width:canvas.width,height:canvas.height,barcode,qr,pages,rejected,notoBlack,linkedValue,missingBlocked,png:canvas.toDataURL('image/png').split(',')[1],pdf:roll.base64};
 });
 if(digital.width!==384||digital.height!==480||digital.barcode!=='1000000000'||digital.qr!=='https://bill.hwnix.com'||digital.pages!==2||!digital.rejected||digital.notoBlack<100||!digital.missingBlocked||digital.linkedValue!=='https://bill.hwnix.com/products/SKU-FKL2LLV0')throw Error('Digital verification failed: '+JSON.stringify({...digital,png:undefined,pdf:undefined}));
 await writeFile(new URL('sample-label.png',OUTPUT),Buffer.from(digital.png,'base64'));
 await writeFile(new URL('sample-label.pdf',OUTPUT),Buffer.from(digital.pdf,'base64'));
 delete digital.png;delete digital.pdf;
 console.log('Digital print verification:',JSON.stringify(digital));
 forceConflict=true;await page.getByLabel('الموضع X مم',{exact:true}).fill('7');
 await page.getByText('تنزيل تعديلاتك قبل إعادة التحميل',{exact:true}).waitFor({timeout:15000});
 console.log('Concurrent-save conflict preserves local draft.');
 forceConflict=false;
 await page.goto('http://127.0.0.1:5175/tests/e2e/fixtures/label-template-harness.html?mode=print',{waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>!!window.labelQA);
 await page.getByRole('button',{name:'فتح طباعة تجريبية'}).click();
 await page.getByRole('button',{name:'بدء الطباعة',exact:true}).waitFor();
 await page.waitForFunction(()=>[...document.querySelectorAll('button')].some(b=>b.textContent.includes('بدء الطباعة')&&!b.disabled),{timeout:20000});
 await page.locator('.v-select').filter({hasText:'نوع الورق'}).click();await page.getByText('شبكة A4',{exact:true}).last().click();
 await page.locator('.v-select').filter({hasText:'طريقة الطباعة'}).click();
 if(await page.getByRole('option',{name:'طباعة مباشرة عبر HWNiX',exact:true}).count())throw Error('A4 offers the thermal transport');
 await page.keyboard.press('Escape');
 await page.screenshot({path:fileURLToPath(new URL('print-a4.png',OUTPUT)),fullPage:true});
 await page.evaluate(()=>{window.labelQA.user.currentUser.active_company_id=2;});
 await page.waitForFunction(()=>!document.querySelector('.v-dialog .v-card'),{timeout:10000});
 console.log('Default template, preview, A4 destination guard and company-switch reset verified.');
 await page.goto('http://127.0.0.1:5175/tests/e2e/fixtures/label-template-harness.html?mode=new',{waitUntil:'domcontentloaded'});
 await page.locator('.label-editor').waitFor();
 await page.getByRole('button',{name:'حفظ المسودة',exact:true}).click();
 await until(()=>!!state[2]?.draft);
 await page.getByRole('button',{name:'نشر القالب',exact:true}).click();
 await until(()=>!!state[2]?.published);
 await page.getByRole('button',{name:'بيانات القالب',exact:true}).click();
 await page.getByLabel('استخدامه افتراضيًا للشركة',{exact:true}).check();
 await page.getByRole('button',{name:'حفظ البيانات',exact:true}).click();
 await until(()=>state[2]?.is_default&&!state[1]?.is_default);
 await page.evaluate(()=>window.labelQA.router.push('/app/label-templates'));
 await page.getByRole('heading',{name:'قوالب الملصقات',exact:true}).waitFor();
 await page.getByRole('button',{name:'إجراءات القالب',exact:true}).first().click();
 await page.getByText('نسخ القالب',{exact:true}).click();
 await page.getByLabel('اسم القالب',{exact:true}).fill('نسخة مخصصة');
 await page.getByRole('button',{name:'حفظ النسخة',exact:true}).click();
 await until(()=>!!state[3]?.draft);
 if(state[3].name!=='نسخة مخصصة'||state[3].published||state[3].is_default)throw Error('Duplication unexpectedly published or changed the default');
 await page.getByRole('button',{name:'إنشاء قالب',exact:true}).click();
 await page.getByLabel('اسم القالب',{exact:true}).fill('قالب فارغ صغير');
 await page.locator('.v-select').filter({hasText:'المقاس الابتدائي'}).click();
 await page.getByRole('option',{name:'50 × 20 مم',exact:true}).click();
 await page.locator('.v-select').filter({hasText:'نقطة البداية'}).click();
 await page.getByRole('option',{name:'ملصق فارغ',exact:true}).click();
 await page.getByRole('button',{name:'إنشاء وفتح المحرر',exact:true}).click();
 await until(()=>!!state[4]?.draft);
 await page.getByRole('heading',{name:'قالب فارغ صغير',exact:true}).waitFor();
 if(state[4].draft.design.heightMm!==20||state[4].draft.design.elements.length)throw Error('Blank creation or size choice failed');
 await page.getByRole('link',{name:'العودة للقوالب',exact:true}).click();
 await page.getByRole('heading',{name:'قوالب الملصقات',exact:true}).waitFor();
 await page.getByRole('button',{name:'بيانات القالب',exact:true}).last().click();
 await page.getByLabel('وصف القالب (اختياري)',{exact:true}).fill('وصف من مكتبة القوالب');
 await page.getByRole('button',{name:'حفظ البيانات',exact:true}).click();
 await until(()=>state[4].description==='وصف من مكتبة القوالب');
 await page.screenshot({path:fileURLToPath(new URL('library-desktop.png',OUTPUT)),fullPage:true});
 console.log('Create, publish, company-default change and independent duplication verified.');
 if(requests.includes('FORBIDDEN_PRINTER_REQUEST'))throw Error('Test attempted to reach the physical printer');
 if(failures.length)throw Error('Browser runtime errors: '+JSON.stringify(failures));
 await writeFile(new URL('ui-verification.json',OUTPUT),JSON.stringify({digital,requests,runtimeErrors:failures},null,2));
 console.log('UI QA passed. No physical print requests sent.');
}catch(error){console.log('Browser errors:',JSON.stringify(failures));await page.screenshot({path:fileURLToPath(new URL('ui-failure.png',OUTPUT)),fullPage:true}).catch(()=>{});throw error;}
finally{await context.close();await browser.close();}
