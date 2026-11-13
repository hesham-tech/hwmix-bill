import {test,expect} from '@playwright/test'
import changelogs from '../../../src/config/changelogs.json' with {type:'json'}
test.use({actionTimeout:12000})
async function bootstrap(page,{permissions=['store.contact.manage'],denied=false}={}){
  let published={email:'original@example.test',phone:'01012345678',address:'العنوان المنشور، مصر'},saved,adminLoads=0
  await page.addInitScript(()=>{sessionStorage.setItem('token','contact-editor-fixture');localStorage.setItem('guidance_enabled','false')})
  await page.route('**/api/v1/**',async route=>{
    const req=route.request(),path=new URL(req.url()).pathname;let data=[]
    if(path.endsWith('/bootstrap'))data={user:{id:20,full_name:'مفوض التواصل',is_staff_or_admin:true,company_id:1,active_company_id:1,permissions,roles:[],companies:[{id:1,name:'إدارة المنصة',address:'عنوان شركة مختلف'}],branches:[],subscription:{status:'active'},settings:{acknowledged_updates:changelogs.map(c=>c.version)}}}
    else if(path.endsWith('/admin/store/contact')){
      adminLoads++;if(denied)return route.fulfill({status:403,json:{message:'غير مسموح'}})
      if(req.method()==='PATCH'){saved=req.postDataJSON();published={...saved}}
      data=published
    }else if(path.endsWith('/store/public/contact'))data=published
    else if(path.endsWith('/store/public/checkout-config'))data={enabled:false,gateways:[],governorates:[]}
    await route.fulfill({json:{success:true,data}})
  })
  await page.goto('/app/store-contact',{waitUntil:'domcontentloaded'})
  return {saved:()=>saved,adminLoads:()=>adminLoads}
}
for(const permissions of [['store.contact.manage'],['admin.company','store.contact.manage']])test(`explicit delegate edits contact without other store permissions: ${permissions.join(',')}`,async({page})=>{
  const state=await bootstrap(page,{permissions});await expect(page.getByRole('heading',{name:'بيانات تواصل المتجر',exact:true})).toBeVisible()
  await page.getByRole('textbox',{name:'البريد الإلكتروني العام',exact:true}).fill('new@example.test')
  await page.getByRole('textbox',{name:'رقم هاتف التواصل العام',exact:true}).fill('01022222222')
  await page.getByRole('textbox',{name:'العنوان الظاهر للجمهور',exact:true}).fill('محافظة الشرقية، مصر')
  await page.getByRole('button',{name:'حفظ بيانات التواصل',exact:true}).click()
  await expect(page.getByRole('status')).toContainText('حُفظت بيانات التواصل')
  expect(Object.keys(state.saved()).sort()).toEqual(['address','email','phone'])
  for(const width of [390,1440]){await page.setViewportSize({width,height:900});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)}
  await page.screenshot({path:process.env.TEMP+'/hwnix-store-contact-settings.png',fullPage:true})
  await page.getByRole('link',{name:'عرض المتجر',exact:true}).click()
  const footer=page.getByRole('contentinfo',{name:'تواصل معنا وسياسات متجر هونكس'})
  await expect(footer.getByRole('link',{name:'new@example.test',exact:true})).toBeVisible()
  await expect(footer).toContainText('محافظة الشرقية، مصر');await expect(footer).not.toContainText('عنوان شركة مختلف')
})
test('ordinary company admin does not inherit contact editing',async({page})=>{
  const state=await bootstrap(page,{permissions:['admin.company']})
  await expect(page.getByRole('textbox',{name:'البريد الإلكتروني العام',exact:true})).toHaveCount(0)
  await expect(page.getByRole('button',{name:'حفظ بيانات التواصل',exact:true})).toHaveCount(0)
  expect(state.adminLoads()).toBe(0)
})
test('server authorization failure keeps the form unavailable',async({page})=>{
  await bootstrap(page,{denied:true})
  await expect(page.getByRole('alert')).toContainText('ضمن إدارة المنصة')
  await expect(page.getByRole('button',{name:'حفظ بيانات التواصل',exact:true})).toHaveCount(0)
})
test('failed save keeps the published data unchanged',async({page})=>{
  await bootstrap(page);await expect(page.getByRole('textbox',{name:'البريد الإلكتروني العام',exact:true})).toHaveValue('original@example.test')
  await page.route('**/admin/store/contact',r=>r.request().method()==='PATCH'?r.fulfill({status:422,json:{errors:{email:['راجع البريد الإلكتروني']}}}):r.fallback())
  await page.getByRole('textbox',{name:'البريد الإلكتروني العام',exact:true}).fill('unsaved@example.test');await page.getByRole('button',{name:'حفظ بيانات التواصل',exact:true}).click()
  await expect(page.getByRole('alert').filter({hasText:'لم تتغير البيانات المنشورة'})).toBeVisible()
  await page.getByRole('link',{name:'عرض المتجر',exact:true}).click()
  await expect(page.getByRole('link',{name:'original@example.test',exact:true})).toBeVisible()
  await expect(page.getByRole('link',{name:'unsaved@example.test',exact:true})).toHaveCount(0)
})
