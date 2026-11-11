import {test,expect} from '@playwright/test'
test.use({actionTimeout:12000})

const pickup={recipient_name:'البائع',phone:'01012345678',city:'القاهرة',governorate_code:'cairo',street:'عنوان المخزن',latitude:30,longitude:31,location_confirmed:true}
async function bootstrap(page){
  await page.addInitScript(()=>{sessionStorage.setItem('token','local-delivery-fixture');localStorage.setItem('guidance_enabled','false')})
  await page.route('**/api/v1/**',async route=>{
    const path=new URL(route.request().url()).pathname;let data=[]
    if(path==='/api/v1/bootstrap')data={user:{id:2,full_name:'مدير البائع',is_staff_or_admin:true,permissions:['admin.company'],roles:[],company_id:2,active_company_id:2,companies:[{id:2,name:'شركة التجربة'}],branches:[],subscription:{status:'active'}}}
    else if(path.endsWith('/store/public/checkout-config'))data={enabled:true,currency:'EGP',requires_account:true,requires_verified_email:true,cod_enabled:true,online_enabled:false,gateways:[],governorates:[{id:'cairo',name:'القاهرة'}]}
    await route.fulfill({json:{data}})
  })
}
async function dismissWelcome(page){const welcome=page.getByRole('button',{name:'علمت بذلك، موافق',exact:true});if(await welcome.isVisible())await welcome.click()}

test('seller configures radius and price using the warehouse point without changing it',async({page})=>{
  await bootstrap(page);let saved
  await page.route('**/vendor/store/local-delivery',async route=>{
    if(route.request().method()==='PUT')saved=route.request().postDataJSON()
    await route.fulfill({json:{data:{settings:{enabled:false,pickup_latitude:30,pickup_longitude:31,pickup_confirmed:true,radius_meters:3000,fee_minor:2000,free_above_minor:null},warehouse_id:5,pickup_address:pickup}}})
  })
  await page.goto('/app/my-store');await expect(page.getByRole('heading',{name:'متجر شركتي',exact:true})).toBeVisible();await dismissWelcome(page)
  await page.getByRole('tab',{name:'إعداد التوصيل الذاتي',exact:true}).click()
  await page.getByRole('checkbox',{name:'تفعيل التوصيل الذاتي',exact:true}).check()
  await page.getByRole('spinbutton',{name:'نصف قطر التوصيل بالكيلومترات',exact:true}).fill('5.5')
  await page.getByRole('spinbutton',{name:'رسم التوصيل الذاتي بالجنيه',exact:true}).fill('15')
  await page.getByRole('button',{name:'حفظ التوصيل الذاتي',exact:true}).click()
  await expect.poll(()=>saved?.radius_km).toBe('5.5');expect(saved.enabled).toBe(true);expect(saved.fee).toBe('15');expect(saved.pickup_latitude).toBeUndefined()
  await expect(page.getByRole('link',{name:'تعديل إحداثيات المخزن',exact:true})).toHaveAttribute('href','/app/warehouses')
})

test('checkout requires a confirmed location and saves the old address after GPS denial',async({page})=>{
  await page.setViewportSize({width:390,height:844});await bootstrap(page)
  await page.addInitScript(()=>{Object.defineProperty(navigator,'geolocation',{value:{getCurrentPosition:(_success,error)=>error({code:1})}});localStorage.setItem('hwnix_store_cart',JSON.stringify([{productId:1,variantId:11,companyId:2,companyName:'بائع التجربة',productName:'منتج التجربة',quantity:1,unitPrice:100,maxStock:5}]))})
  let updated
  const address={id:7,is_default:true,recipient_name:'العميل',phone:'01012345678',city:'القاهرة',governorate_code:'cairo',street:'عنوان العميل'}
  await page.route('**/store/cart/validate',route=>route.fulfill({json:{data:{valid:true,requires_delivery_location:true}}}))
  await page.route('**/store/account/status',route=>route.fulfill({json:{data:{email_verified:true}}}))
  await page.route('**/store/addresses',route=>route.fulfill({json:{data:[address]}}))
  await page.route('**/store/addresses/7',async route=>{updated=route.request().postDataJSON();await route.fulfill({json:{data:{...address,...updated}}})})
  await page.goto('/store/checkout');const next=page.getByRole('button',{name:'المتابعة إلى الدفع',exact:true});await expect(next).toBeDisabled()
  await page.getByRole('button',{name:'استخدام موقعي',exact:true}).click();await expect(page.getByText('تعذر الحصول على الموقع أو رُفض الإذن. يمكنك تحديد العنوان على الخريطة أو إدخال إحداثياته.',{exact:true})).toBeVisible()
  await page.route('https://tile.openstreetmap.org/**',route=>route.abort())
  await page.getByRole('button',{name:'تحديد النقطة على الخريطة',exact:true}).click()
  await expect(page.getByText('تعذر تحميل أجزاء الخريطة. يمكنك إعادة المحاولة أو استخدام موقع الجهاز أو إدخال الإحداثيات وتأكيدها.',{exact:true})).toBeVisible()
  await page.getByRole('spinbutton',{name:'خط العرض',exact:true}).fill('30.01');await page.getByRole('spinbutton',{name:'خط الطول',exact:true}).fill('31.02')
  for (const width of [360,390,959,960,1440]) {
    await page.setViewportSize({width,height:900})
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true)
    await expect(page.getByRole('spinbutton',{name:'خط العرض',exact:true})).toBeVisible()
  }
  await expect(next).toBeDisabled();await page.getByRole('button',{name:'تأكيد نقطة العنوان',exact:true}).click();await expect(next).toBeEnabled();await next.click()
  await expect.poll(()=>updated?.location_confirmed).toBe(true);expect(updated.latitude).toBe(30.01);expect(updated.longitude).toBe(31.02)
  await expect(page.getByRole('heading',{name:'طريقة الدفع',exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false)
})

test('employee overrides only the pickup then dispatches and records local delivery and collection',async({page})=>{
  await bootstrap(page);let pickupBody;const actions=[]
  const order={id:9,sub_order_number:'ORD-LOCAL-1',status:'processing',delivery_method:'seller_local',order:{payment_method:'cod'},financial:{collected_at:null},items:[{product:{name:'منتج التجربة'},quantity:1}],pickup:{warehouse_id:5,current:{...pickup},original:{...pickup},can_override:true}}
  await page.route('**/vendor/store/orders?*',route=>route.fulfill({json:{data:{data:[order],last_page:1}}}))
  await page.route('**/vendor/store/orders/9/pickup',async route=>{pickupBody=route.request().postDataJSON();order.pickup.current=pickupBody.address;order.pickup.override={reason:pickupBody.reason};await route.fulfill({json:{data:order}})})
  await page.route('**/vendor/store/deliveries/9/*',async route=>{const action=new URL(route.request().url()).pathname.split('/').at(-1);actions.push({action,...route.request().postDataJSON()});if(action==='dispatch'){order.status='shipped';order.pickup.can_override=false}if(action==='delivered')order.status='delivered';if(action==='collect')order.financial.collected_at=new Date().toISOString();await route.fulfill({json:{data:order}})})
  await page.goto('/app/my-store');await expect(page.getByRole('heading',{name:'متجر شركتي',exact:true})).toBeVisible();await dismissWelcome(page)
  await page.getByRole('button',{name:'تعديل نقطة استلام هذا الطلب',exact:true}).click();const dialog=page.getByRole('dialog')
  await dialog.getByRole('textbox',{name:'عنوان الاستلام للطلب',exact:true}).fill('مكان تحميل بديل')
  await dialog.getByRole('spinbutton',{name:'خط العرض',exact:true}).fill('30.5');await dialog.getByRole('button',{name:'تأكيد نقطة العنوان',exact:true}).click()
  await dialog.getByRole('textbox',{name:'سبب تعديل الاستلام',exact:true}).fill('تغيير مكان تحميل الطلب فقط');await dialog.getByRole('checkbox',{name:'أؤكد تعديل مكان الاستلام فقط لهذا الطلب',exact:true}).check();await dialog.getByRole('button',{name:'حفظ نقطة استلام الطلب',exact:true}).click();await expect(dialog).not.toBeVisible()
  expect(pickupBody.address.latitude).toBe(30.5);expect(pickupBody.warehouse_id).toBeUndefined();expect(order.pickup.original.latitude).toBe(30)
  for(const [label,action] of [['خرج للتوصيل الذاتي','dispatch'],['تأكيد تسليم التوصيل الذاتي','delivered'],['توثيق تحصيل التوصيل الذاتي','collect']]){
    if(action!=='delivered')await page.getByRole('textbox',{name:'مرجع التوصيل أو التحصيل',exact:true}).fill('LOCAL-'+action)
    await page.getByRole('checkbox',{name:'تحققت من الإجراء الفعلي وأؤكد تسجيله',exact:true}).check();await page.getByRole('button',{name:label,exact:true}).click();await expect.poll(()=>actions.at(-1)?.action).toBe(action)
  }
  expect(actions.every(a=>a.confirmed)).toBe(true);await expect(page.getByRole('button',{name:'تعديل نقطة استلام هذا الطلب',exact:true})).toHaveCount(0)
})
