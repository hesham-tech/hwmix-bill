import { test, expect } from '@playwright/test'

test('administration saves seller VAT status once and exposes product return exceptions',async({page})=>{
  let saved
  const tax={status:'unconfigured',mode:'none',rate_bps:0,basis:'',registration_number:null,product_rules:[]}
  const seller={profile:{company_id:2,is_enabled:true,warehouse_id:5,shipping_account_id:null,pickup_address:{recipient_name:'Seller',phone:'01012345678',street:'Fixture',city:'Cairo',governorate_code:'cairo'},policy_overrides:{},tax_profile:tax},products:[{id:7,name:'منتج التجربة',store_return_policy:null}],warehouses:[{id:5,name:'المخزن'}],effective_policy:{},payout_destination_configured:false}
  await page.addInitScript(()=>{sessionStorage.setItem('token','fixture-compliance');localStorage.setItem('guidance_enabled','false')})
  await page.route('**/api/v1/**',async route=>{
    const path=new URL(route.request().url()).pathname;let data=[]
    if(path==='/api/v1/bootstrap')data={user:{id:1,full_name:'مدير',is_staff_or_admin:true,permissions:['admin.super'],roles:[],company_id:1,active_company_id:1,companies:[{id:1,name:'المنصة'}],branches:[],subscription:{status:'active'}}}
    else if(path.endsWith('/admin/store/bootstrap'))data={permissions:{settings:true,orders:true,finance:true},settings:{return_policy:{change_of_mind_days:14,defect_days:30},seller_policy:{},tax_mode:'per_seller'},companies:[{id:1,name:'المنصة'},{id:2,name:'بائع التجربة'}],legal_documents:[],governorates:[{id:'cairo',name:'القاهرة'}],platform_company_id:1}
    else if(path.endsWith('/sellers/2')){if(route.request().method()==='PUT'){saved=route.request().postDataJSON();Object.assign(seller.profile,saved)}data=seller}
    else if(path.endsWith('/shipping-drivers'))data=[]
    await route.fulfill({json:{success:true,data}})
  })
  await page.goto('/app/store-operations')
  await expect(page.getByRole('heading',{name:'إدارة المتجر',exact:true})).toBeVisible()
  const welcome=page.getByRole('button',{name:'علمت بذلك، موافق',exact:true})
  if(await welcome.isVisible())await welcome.click()
  await page.getByRole('tab',{name:'البائعون والباقات',exact:true}).click()
  await page.getByRole('combobox').filter({has:page.getByRole('textbox',{name:'الشركة البائعة',exact:true})}).click()
  await page.getByRole('option',{name:'بائع التجربة',exact:true}).click()
  await page.getByRole('combobox').filter({has:page.getByRole('textbox',{name:'حالة القيمة المضافة للبائع',exact:true})}).click()
  await page.getByRole('option',{name:'غير مسجل في القيمة المضافة — لا تحصيل VAT',exact:true}).click()
  await page.getByRole('textbox',{name:'أساس الحالة أو مرجع المستند أو إفادة البائع',exact:true}).fill('إفادة المالك غير مسجل وتحت حد التسجيل، للمراجعة')
  await page.getByRole('button',{name:'حفظ البائع واعتماد الاستثناءات',exact:true}).click()
  await expect.poll(()=>saved?.tax_profile.status).toBe('not_registered')
  expect(saved.business_profile.document_status).toBe('self_declared');expect(saved.tax_profile.registration_number).toBeNull();expect(saved.tax_profile.mode).toBe('none');expect(saved.tax_profile.rate_bps).toBe(0)
  await page.getByRole('combobox').filter({has:page.getByRole('textbox',{name:'منتج سياسة المرتجع',exact:true})}).click()
  await page.getByRole('option',{name:'منتج التجربة',exact:true}).click()
  await expect(page.getByRole('spinbutton',{name:/^مهلة العيب للمنتج/})).toHaveValue('30')
  await expect(page.getByRole('spinbutton',{name:/^مهلة تغيير الرأي للمنتج/})).toHaveValue('14')
})

test('store policies are readable without checkout and sanitize published HTML',async({page})=>{
  await page.route('**/api/v1/**',async route=>{
    const path=new URL(route.request().url()).pathname;let data=[]
    if(path.endsWith('/store/public/checkout-config'))data={enabled:false,legal_documents:[{key:'store-privacy-policy',version_id:9}]}
    if(path.endsWith('/store/public/legal/9'))data={title:'خصوصية المتجر',content:'<h1>خصوصية متجر الاختبار</h1><p>التواصل مع الخصوصية</p><img src="x" onerror="window.policyUnsafe=true"><script>window.policyUnsafe=true</script>'}
    await route.fulfill({json:{success:true,data}})
  })
  await page.goto('/store/policies/store-privacy-policy')
  await expect(page.getByRole('heading',{name:'خصوصية متجر الاختبار'})).toBeVisible()
  expect(await page.evaluate(()=>window.policyUnsafe)).toBeUndefined()
  await expect(page.getByRole('link',{name:'العودة إلى المتجر',exact:true})).toHaveAttribute('href','/store')
  await page.goto('/store/policies/not-published')
  await expect(page.getByText('هذه السياسة غير منشورة حاليًا؛ يمكنك التواصل مع الدعم.',{exact:true})).toBeVisible()
})
