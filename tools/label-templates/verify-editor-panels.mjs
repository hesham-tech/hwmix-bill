import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import {createStarterDesign,SAMPLE_VALUES,FONTS} from '../../src/modules/print/templates-editor/templateSchema.js';
const require=createRequire(import.meta.url),{chromium}=require('@playwright/test');
const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1560,height:1000}}),page=await context.newPage(),errors=[];
page.on('pageerror',e=>errors.push(e.message));
const design=createStarterDesign();design.elements=design.elements.filter(e=>e.id!=='name');
let template={id:1,company_id:1,name:'فحص اللوحات والمعاينة',lock_version:1,has_draft:true,draft:{id:1,version:1,design},published:null,revisions:[]};
const actual=id=>({...SAMPLE_VALUES,'company.name':'شركة فعلية','product.name':'هاتف حقيقي','variant.retail_price':id===102?1600:1500,'variant.barcode':'9876543210','variant.sku':id===102?'SKU-102':'SKU-101'});
await context.route('**/*',async route=>{const req=route.request(),url=new URL(req.url());if(url.port==='19191')throw Error('Physical printing forbidden');if(!url.pathname.includes('/api/v1/'))return url.origin==='http://127.0.0.1:5175'?route.continue():route.abort();const path=url.pathname.split('/api/v1/')[1];const reply=data=>route.fulfill({contentType:'application/json',body:JSON.stringify(data)});
if(path==='label-templates/fields')return reply({data:Object.keys(SAMPLE_VALUES).map(key=>({key,title:key,type:key.includes('price')?'number':'text'})),fonts:FONTS,permissions:{manage:true,publish:true,set_default:true}});
if(path==='label-templates/1'){if(req.method()==='PUT'){const b=req.postDataJSON();template={...template,lock_version:template.lock_version+1,draft:{...template.draft,design:b.design}};}return reply({data:template});}
if(path==='label-templates/products')return reply({data:[{id:10,name:'هاتف حقيقي',variants:[{id:101,sku:'SKU-101'},{id:102,sku:'SKU-102'}]}]});
if(path==='label-template-preview-data'){const item=req.postDataJSON().items[0];await new Promise(r=>setTimeout(r,item.variant_id===101?650:25));return reply({data:{records:[{variant_id:item.variant_id,unit_id:item.variant_id===102?2:1,units:[{id:item.variant_id===102?2:1,name:'قطعة'}],values:actual(item.variant_id)}]}});}return reply({data:[]});});
async function drag(handle,dx){const b=await handle.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+Math.min(30,b.height/2));await page.mouse.down();await page.mouse.move(b.x+b.width/2+dx,b.y+Math.min(30,b.height/2),{steps:12});await page.mouse.up();}
try{
await page.goto('http://127.0.0.1:5175/tests/e2e/fixtures/label-template-harness.html');await page.getByRole('heading',{name:'فحص اللوحات والمعاينة',exact:true}).waitFor();
const library=page.locator('.library-panel'),properties=page.locator('.properties-panel');
const initialL=(await library.boundingBox()).width,initialP=(await properties.boundingBox()).width;
await drag(page.getByRole('separator',{name:'تغيير عرض مكتبة العناصر',exact:true}),-160);if((await library.boundingBox()).width<initialL+100)throw Error('Library did not expand toward canvas');
await drag(page.getByRole('separator',{name:'تغيير عرض مكتبة العناصر',exact:true}),900);if(Math.abs((await library.boundingBox()).width-initialL)>2)throw Error('Library shrank below its original minimum');
await drag(page.getByRole('separator',{name:'تغيير عرض الخصائص',exact:true}),160);if((await properties.boundingBox()).width<initialP+100)throw Error('Properties did not expand toward canvas');
await page.getByRole('separator',{name:'تغيير عرض الخصائص',exact:true}).focus();await page.keyboard.press('Home');if(Math.abs((await properties.boundingBox()).width-initialP)>2)throw Error('Keyboard minimum failed');
await page.getByRole('button',{name:'طي الخصائص',exact:true}).click();if((await properties.boundingBox()).width>45)throw Error('Collapsed rail is too wide');await page.getByRole('button',{name:'إظهار الخصائص',exact:true}).click();
await page.getByRole('button',{name:'إعداد الملصق والورق',exact:true}).click();const select=page.locator('.v-select').filter({hasText:'مقاس جاهز'});await select.hover();await page.waitForTimeout(600);await select.click();await page.getByRole('option',{name:'50 × 60 مم',exact:true}).waitFor();await page.waitForTimeout(650);if(await page.locator('#label-editor-help-tip').count())throw Error('Tooltip covers an open select menu');await page.getByRole('option',{name:'50 × 60 مم',exact:true}).click();await page.getByRole('button',{name:'إلغاء',exact:true}).click();
await page.getByRole('button',{name:'بيانات المعاينة',exact:true}).click();await page.getByLabel('ابحث عن منتج',{exact:true}).fill('هاتف');await page.getByRole('option',{name:'هاتف حقيقي',exact:true}).click();await page.getByText('القالب لا يحتوي حقل اسم المنتج.',{exact:false}).waitFor();
const variants=page.locator('.v-select').filter({hasText:'المتغير'});await variants.click();await page.getByRole('option',{name:'SKU-102',exact:true}).click();await page.waitForTimeout(850);await page.getByRole('button',{name:'إغلاق',exact:true}).last().click();await page.waitForTimeout(250);
await page.locator('.preview-source').filter({hasText:'1600'}).waitFor();await page.getByRole('button',{name:'معاينة الطباعة',exact:true}).click();const img=page.locator('.v-dialog .template-preview img');await img.waitFor();
const expected=await page.evaluate(async values=>(await window.labelQA.renderTemplate({...window.labelQA.createStarterDesign(),elements:window.labelQA.createStarterDesign().elements.filter(e=>e.id!=='name')},values)).toDataURL('image/png'),actual(102));if(await img.getAttribute('src')!==expected)throw Error('Rendered preview does not use the selected real variant');
await page.getByRole('button',{name:'إغلاق',exact:true}).last().click();await page.waitForTimeout(250);await page.screenshot({path:fileURLToPath(new URL('./.qa-output/editor-panels.png',import.meta.url)),fullPage:true});
if(errors.length)throw Error(JSON.stringify(errors));console.log('Panel resizing/collapse, unobstructed selects, and real-product rendered preview passed.');
}catch(e){await page.screenshot({path:fileURLToPath(new URL('./.qa-output/editor-panels-failure.png',import.meta.url)),fullPage:true}).catch(()=>{});throw e;}finally{await context.close();await browser.close();}
