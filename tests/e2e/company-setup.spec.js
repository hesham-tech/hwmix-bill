import changelogs from '../../src/config/changelogs.json' with {type:'json'}
import {test,expect} from '@playwright/test'
test.use({actionTimeout:12000})
const keys=['company','locations','inventory','billing','team','email','whatsapp','automation','store','review']
const titles=['بيانات شركتك','مكان عملك ومخزنك','منتجاتك ومخزونك','فواتيرك واستلام الأموال','فريق عملك','البريد الإلكتروني','رسائل واتساب','التنبيهات التلقائية','البيع في المتجر','مراجعة الإعدادات']
async function fixture(page,{hidden=false,staff=false,finished=false}={}){
 page.on('pageerror',error=>console.error('Setup browser error:',error.message))
 let revision=1;const saves=[]
 const snapshot={company_id:2,revision:String(revision),can_manage:!staff,steps:keys.map((key,i)=>({key,title:titles[i],can_edit:!staff||key==='review'})),state:{current_step:'company',reviewed:[],deferred:[],hidden,finished},ready:false,basic_ready:false,issues:[{step:'billing',group:'basic',message:'جهز وسيلة دفع وخزنة صالحة.'}],data:{company:{id:2,name:'شركة البداية',phone:'01012345678',address:'عنوان الشركة',social_links:[]},uses:['inventory','sales'],branches:[{id:3,name:'الفرع الرئيسي',is_default:true}],warehouses:[{id:4,branch_id:3,name:'المخزن الرئيسي',location:'عنوان المخزن',is_default:true,location_confirmed:false}],units:[{id:5,name:'قطعة'}],payment_methods:[{id:6,name:'نقدًا'}],invoice_types:[{id:7,name:'فاتورة بيع',code:'sale'}],active_invoice_type_ids:[7],cash_boxes:[],settings:{},store:null}}
 await page.route('https://fonts.googleapis.com/**',r=>r.abort())
 await page.route('https://fonts.gstatic.com/**',r=>r.abort())
 await page.addInitScript(()=>{sessionStorage.setItem('token','setup-fixture');localStorage.setItem('guidance_enabled','false')})
 await page.route('**/api/v1/**',async route=>{const req=route.request(),path=new URL(req.url()).pathname;let data=[]
  if(path.endsWith('/bootstrap'))data={user:{id:10,is_staff_or_admin:true,active_company_id:2,company_id:2,subscription:{status:'active'},full_name:'مستخدم البداية',settings:{acknowledged_updates:changelogs.map(c=>c.version)},permissions:staff?['products.view_self']:['admin.company'],roles:[],companies:[{id:2,name:'شركة البداية'}],branches:[]}}
  else if(path.endsWith('/guidance/setup'))data=structuredClone(snapshot)
  else if(path.endsWith('/guidance/setup/preferences')){snapshot.state.hidden=req.postDataJSON().hidden;data=structuredClone(snapshot)}
  else if(path.includes('/guidance/setup/steps/')){const step=path.split('/').pop(),body=req.postDataJSON();saves.push({step,...body});if(step==='company'&&!body.defer)Object.assign(snapshot.data.company,body.data);if(body.defer){snapshot.state.deferred.push(step);snapshot.state.reviewed=snapshot.state.reviewed.filter(s=>s!==step)}else{snapshot.state.deferred=snapshot.state.deferred.filter(s=>s!==step);snapshot.state.reviewed.push(step)}snapshot.revision=String(++revision);snapshot.state.current_step=keys[Math.min(keys.indexOf(step)+1,keys.length-1)];if(step==='review')snapshot.state.finished=true;data=structuredClone(snapshot)}
  else if(path.endsWith('/store/public/checkout-config'))data={governorates:[],enabled:false}
  await route.fulfill({json:{data}})
 })
 const setupLoaded=page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/guidance/setup')&&r.request().method()==='GET')
 await page.goto('/app/admin/dashboard',{waitUntil:'domcontentloaded'});await setupLoaded
 await expect(page.getByRole('button',{name:'إعداد شركتي خطوة بخطوة',exact:true})).toBeVisible()
 return {saves,snapshot}
}
const dialog=page=>page.locator('.company-setup-dialog .v-overlay__content')
test('old account walks actual forms, saves each stage, and never calls incomplete setup ready',async({page})=>{
 const {saves}=await fixture(page);const d=dialog(page);await expect(d).toBeVisible();await expect(d.getByRole('textbox',{name:'اسم الشركة',exact:true})).toBeVisible();await expect(d.getByText('كيف ستستخدم شركتك؟',{exact:true})).toHaveCount(0)
 await d.getByRole('textbox',{name:'اسم الشركة',exact:true}).fill('الشركة المعدلة');await d.getByRole('button',{name:'حفظ ومتابعة',exact:true}).click()
 await expect.poll(()=>saves.find(s=>s.step==='company')?.data.name).toBe('الشركة المعدلة');await d.getByRole('button',{name:'السابق',exact:true}).click();await expect(d.getByRole('textbox',{name:'اسم الشركة',exact:true})).toHaveValue('الشركة المعدلة')
 for(let i=0;i<4;i++)await d.getByRole('button',{name:'حفظ ومتابعة',exact:true}).click()
 for(let i=0;i<5;i++)await d.getByRole('button',{name:'لا أحتاجه الآن',exact:true}).click()
 await expect(d.getByText('راجعت إعدادات شركتك، وتبقى المتطلبات أدناه قبل بدء العمل.',{exact:true})).toBeVisible();await expect(d.getByText('اكتملت إعدادات شركتك الأساسية. يمكنك الآن بدء العمل وإضافة منتجاتك.',{exact:true})).toHaveCount(0)
 await d.getByRole('button',{name:'حفظ والإغلاق',exact:true}).click();await expect(d).not.toBeVisible()
 await page.getByRole('button',{name:'إعداد شركتي خطوة بخطوة',exact:true}).click();await expect(d).toBeVisible();await expect(d.getByRole('button',{name:'حفظ والإغلاق',exact:true})).toBeVisible()
})
test('hidden guide can always be reopened and limited staff cannot edit company data',async({page})=>{
 const {saves}=await fixture(page,{hidden:true,staff:true});const d=dialog(page);await expect(d).not.toBeVisible();await page.getByRole('button',{name:'إعداد شركتي خطوة بخطوة',exact:true}).click();await expect(d).toBeVisible();await expect(d.getByRole('textbox',{name:'اسم الشركة',exact:true})).toBeDisabled();await d.getByRole('button',{name:'متابعة',exact:true}).click();await expect.poll(()=>saves.find(s=>s.step==='company')?.data).toEqual({})
})
test('failed save preserves edits and does not advance, then hide stays across reload',async({page})=>{
 await fixture(page);const d=dialog(page);await expect(d).toBeVisible();await d.getByRole('textbox',{name:'اسم الشركة',exact:true}).fill('بيانات لم تضِع')
 await page.route('**/guidance/setup/steps/company',r=>r.fulfill({status:409,json:{message:'تغيرت بيانات الشركة. حدّثها أولًا.'}}))
 await d.getByRole('button',{name:'حفظ ومتابعة',exact:true}).click();await expect(d.getByRole('alert')).toContainText('تغيرت بيانات الشركة');await expect(d.getByRole('textbox',{name:'اسم الشركة',exact:true})).toHaveValue('بيانات لم تضِع')
 page.on('dialog',d=>d.accept());await d.getByRole('checkbox',{name:'لا تظهر هذا الدليل تلقائيًا مرة أخرى',exact:true}).check();await d.getByRole('button',{name:'إغلاق دليل إعداد الشركة',exact:true}).click();const reloaded=page.waitForResponse(r=>new URL(r.url()).pathname.endsWith('/guidance/setup')&&r.request().method()==='GET');await page.reload();await reloaded;await expect(dialog(page)).not.toBeVisible();await page.getByRole('button',{name:'إعداد شركتي خطوة بخطوة',exact:true}).click();await expect(dialog(page)).toBeVisible()
})
test('setup has accessible controls without horizontal scrolling on mobile and desktop',async({page})=>{
 await fixture(page);const d=dialog(page);await expect(d).toBeVisible()
 for(const width of [360,390,959,960,1440]){await page.setViewportSize({width,height:850});await expect(d.getByRole('button',{name:'حفظ ومتابعة',exact:true})).toBeInViewport();await expect.poll(()=>d.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);await page.screenshot({path:process.env.TEMP+'/hwnix-company-setup-'+width+'.png',fullPage:false})}
})


test('skipping keeps saved company data, records a deferral, and allows returning to the form',async({page})=>{
 const {saves,snapshot}=await fixture(page);const d=dialog(page);await expect(d).toBeVisible();
 await d.getByRole('textbox',{name:'اسم الشركة',exact:true}).fill('تعديل غير محفوظ');
 page.once('dialog',dialog=>dialog.dismiss());await d.getByRole('button',{name:'تخطي الآن',exact:true}).click();await expect(d.getByRole('textbox',{name:'اسم الشركة',exact:true})).toBeVisible();expect(saves).toHaveLength(0);
 page.once('dialog',dialog=>dialog.accept());await d.getByRole('button',{name:'تخطي الآن',exact:true}).click();
 await expect.poll(()=>saves[0]).toMatchObject({step:'company',data:{},defer:true});expect(snapshot.data.company.name).toBe('شركة البداية');expect(snapshot.state.reviewed).not.toContain('company');
 await d.getByRole('button',{name:'السابق',exact:true}).click();await expect(d.getByRole('textbox',{name:'اسم الشركة',exact:true})).toHaveValue('شركة البداية');
 await d.getByRole('button',{name:'حفظ ومتابعة',exact:true}).click();await expect.poll(()=>snapshot.state.deferred).not.toContain('company');
})

test('every actual page remains discoverable without feature choices and review lists postponed pages',async({page})=>{
 const {saves}=await fixture(page);const d=dialog(page);await expect(d).toBeVisible();
 for(let i=0;i<keys.length-1;i++){
  await expect(d.getByRole('heading',{name:titles[i],exact:true})).toBeVisible();
  if(i<4)await d.getByRole('button',{name:'تخطي الآن',exact:true}).click();
  else await d.getByRole('button',{name:'لا أحتاجه الآن',exact:true}).click();
 }
 await expect(d.getByRole('heading',{name:'مراجعة الإعدادات',exact:true})).toBeVisible();
 await expect(d.getByLabel('حالة صفحات الإعداد')).toContainText('مؤجل — لم تطلب تجهيز هذه الوظيفة الآن');
 expect(saves.map(s=>s.step)).toEqual(keys.slice(0,-1));expect(saves.every(s=>s.defer&&Object.keys(s.data).length===0)).toBe(true);
 await d.getByRole('button',{name:'مراجعة البيع في المتجر',exact:true}).click();await expect(d.getByRole('heading',{name:'البيع في المتجر',exact:true})).toBeVisible();
})


test('keyboard submission saves the current form instead of sending an empty payload',async({page})=>{
 const {saves}=await fixture(page);const d=dialog(page);await expect(d).toBeVisible();
 const name=d.getByRole('textbox',{name:'اسم الشركة',exact:true});await name.fill('حفظ بلوحة المفاتيح');await name.press('Enter');
 await expect.poll(()=>saves.find(s=>s.step==='company')?.data.name).toBe('حفظ بلوحة المفاتيح');
})
