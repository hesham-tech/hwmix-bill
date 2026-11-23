import {test,expect} from '@playwright/test'
import changelogs from '../../../src/config/changelogs.json' with {type:'json'}
test.use({actionTimeout:12000})
async function bootstrap(page,{permissions=['store.maps.manage'],denied=false}={}){
  let published={enabled:false,daily_limit:500,revision:'1',search_key_configured:true,map_key_configured:false},saved,adminLoads=0
  await page.addInitScript(()=>{sessionStorage.setItem('token','contact-editor-fixture');localStorage.setItem('guidance_enabled','false')})
  await page.route('**/api/v1/**',async route=>{
    const req=route.request(),path=new URL(req.url()).pathname;let data=[]
    if(path.endsWith('/bootstrap'))data={user:{id:20,full_name:'مفوض التواصل',is_staff_or_admin:true,company_id:1,active_company_id:1,permissions,roles:[],companies:[{id:1,name:'إدارة المنصة',address:'عنوان شركة مختلف'}],branches:[],subscription:{status:'active'},settings:{acknowledged_updates:changelogs.map(c=>c.version)}}}
    else if(path.endsWith('/admin/store/maps')){
      adminLoads++;if(denied)return route.fulfill({status:403,json:{message:'غير مسموح'}})
      if(req.method()==='PATCH'){saved=req.postDataJSON();published={...published,...saved,revision:'2',search_key_configured:true}}
      data=published
    }else if(path.endsWith('/admin/store/maps/test'))return route.fulfill({json:{message:'نجح الاتصال بخدمة البحث.'}})
    else if(path.endsWith('/store/public/checkout-config'))data={enabled:false,gateways:[],governorates:[]}
    await route.fulfill({json:{success:true,data}})
  })
  await page.goto('/app/store-maps',{waitUntil:'domcontentloaded'})
  return {saved:()=>saved,adminLoads:()=>adminLoads}
}
test('delegate preserves saved secrets, saves and tests; form fits all supported widths',async({page})=>{
 const state=await bootstrap(page);await expect(page.getByRole('heading',{name:'الخرائط والبحث عن العناوين',exact:true})).toBeVisible();const key=page.getByRole('textbox',{name:'مفتاح البحث الخاص بالسيرفر',exact:true});await expect(key).toHaveValue('');await page.getByRole('checkbox',{name:'تفعيل البحث عن العناوين',exact:true}).check();await key.fill('fixture-new-key');await expect(page.getByRole('button',{name:'اختبار اتصال البحث',exact:true})).toBeDisabled();await page.getByRole('button',{name:'حفظ الإعدادات',exact:true}).click();await expect(page.getByRole('status')).toContainText('حُفظت');expect(state.saved().search_key).toBe('fixture-new-key');await expect(key).toHaveValue('');await page.getByRole('button',{name:'اختبار اتصال البحث',exact:true}).click();await expect(page.getByRole('status')).toContainText('نجح الاتصال');
 for(const width of [360,390,768,959,960,1440]){await page.setViewportSize({width,height:900});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.getByRole('button',{name:'حفظ الإعدادات',exact:true})).toBeVisible()}
 await page.screenshot({path:process.env.TEMP+'/hwnix-maps-settings-1440.png',fullPage:true});await page.setViewportSize({width:390,height:900});await page.screenshot({path:process.env.TEMP+'/hwnix-maps-settings-390.png',fullPage:true});
})
test('server denies editor and ordinary seller cannot open route',async({page})=>{
 await bootstrap(page,{denied:true});await expect(page.locator('.v-alert[role=alert]')).toContainText('صلاحية');await expect(page.getByRole('button',{name:'حفظ الإعدادات',exact:true})).toHaveCount(0)
})
test('failed save preserves draft and failure of provider stays on form',async({page})=>{
 await bootstrap(page);await page.route('**/admin/store/maps',r=>r.request().method()==='PATCH'?r.fulfill({status:409,json:{message:'conflict'}}):r.fallback());const key=page.getByRole('textbox',{name:'مفتاح البحث الخاص بالسيرفر',exact:true});await key.fill('fixture-draft');await page.getByRole('button',{name:'حفظ الإعدادات',exact:true}).click();await expect(page.locator('.v-alert[role=alert]')).toContainText('تغيرت');await expect(key).toHaveValue('fixture-draft');await key.fill('');await page.route('**/admin/store/maps/test',r=>r.fulfill({status:503,json:{message:'تعذر الاتصال بالمزود'}}));await page.getByRole('button',{name:'اختبار اتصال البحث',exact:true}).click();await expect(page.locator('.v-alert[role=alert]')).toContainText('تعذر الاتصال');await expect(page).toHaveURL(/store-maps/)
})

test('mobile entry keeps fields and actions reachable without the navigation overlay',async({page})=>{
 await page.setViewportSize({width:390,height:900});await bootstrap(page);await page.getByRole('textbox',{name:'مفتاح البحث الخاص بالسيرفر',exact:true}).fill('fixture-mobile');await page.getByRole('button',{name:'حفظ الإعدادات',exact:true}).click();await expect(page.getByRole('status')).toContainText('حُفظت');await page.screenshot({path:process.env.TEMP+'/hwnix-maps-settings-mobile-entry.png',fullPage:true});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
})
