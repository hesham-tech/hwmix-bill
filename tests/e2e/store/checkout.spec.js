import {test,expect} from '@playwright/test'
const address={id:7,is_default:true,recipient_name:'عميل الاختبار',phone:'01012345678',governorate_code:'cairo',city:'القاهرة',street:'شارع الاختبار'}
for(const method of ['cod','online']){
test('customer checkout '+method+' preserves quote consent, items and retry identity',async({page})=>{
  await page.setViewportSize({width:390,height:844})
  await page.addInitScript(()=>{
    sessionStorage.setItem('token','checkout-fixture-token')
    localStorage.setItem('hwnix_store_cart',JSON.stringify([{productId:1,variantId:11,companyId:2,companyName:'بائع الاختبار',productName:'منتج الاختبار',quantity:2,unitPrice:100,maxStock:5}]))
  })
  let quoteBody,createdBody,payBody,paid=false;const attempts=[]
  const order=()=>({id:1,order_number:'ORD-CHECKOUT',status:'pending',payment_status:paid?'paid':'unpaid',payment_method:method,total_amount:250,subtotal:200,shipping_total:50,tax_total:0,currency:'EGP',sub_orders:[],shipping_address:address})
  await page.route('**/api/v1/**',async route=>{
    const path=new URL(route.request().url()).pathname;let data=[]
    if(path==='/api/v1/bootstrap')data={user:{id:11,full_name:'عميل الاختبار',email:'buyer@example.test',is_staff_or_admin:false,company_id:1,active_company_id:1,permissions:[],roles:[],companies:[{id:1,name:'المنصة'}],branches:[]}}
    else if(path.endsWith('/store/public/checkout-config'))data={enabled:true,currency:'EGP',requires_account:true,requires_verified_email:true,cod_enabled:true,online_enabled:true,gateways:[{id:7,name:'بوابة اختبار',is_default:true}],governorates:[{id:'cairo',name:'القاهرة'}]}
    else if(path.endsWith('/store/account/status'))data={email:'buyer@example.test',email_verified:true}
    else if(path.endsWith('/store/addresses'))data=[address]
    else if(path.endsWith('/store/checkout/quote')){
      quoteBody=route.request().postDataJSON()
      data={id:42,expires_at:new Date(Date.now()+900000).toISOString(),subtotal_minor:20000,shipping_minor:5000,tax_minor:0,total_minor:25000,legal_documents:[{version_id:1,title:'الشروط'},{version_id:2,title:'الخصوصية'},{version_id:3,title:'المرتجعات'}],groups:[{company_id:2,carrier_name:'ناقل الاختبار',shipping_minor:5000,items:[{variant_id:11,product_name:'منتج الاختبار',quantity:2,total_minor:20000}]}]}
    }else if(path==='/api/v1/store/orders' && route.request().method()==='POST'){
      createdBody=route.request().postDataJSON();attempts.push(createdBody)
      if(method==='cod'&&attempts.length===1)return route.fulfill({status:503,json:{message:'تعذر الاتصال مؤقتًا. أعد المحاولة.'}})
      return route.fulfill({status:201,json:{data:order()}})
    }else if(path.endsWith('/orders/ORD-CHECKOUT/payment')){
      payBody=route.request().postDataJSON();paid=true;data={status:'completed'}
    }else if(path.endsWith('/orders/ORD-CHECKOUT'))data=order()
    await route.fulfill({json:{data}})
  })
  await page.goto('/store/checkout')
  await page.getByRole('button',{name:'المتابعة إلى الدفع',exact:true}).click()
  if(method==='online')await page.getByRole('radio',{name:'الدفع بالبطاقة عبر بوابة الدفع',exact:true}).check()
  await page.getByRole('button',{name:'مراجعة السعر النهائي',exact:true}).click()
  const confirm=page.getByRole('button',{name:method==='cod'?'تأكيد طلب الدفع عند الاستلام':'إنشاء الطلب والمتابعة إلى الدفع',exact:true})
  await expect(confirm).toBeDisabled()
  await page.getByRole('checkbox',{name:'قرأت شروط الشراء وسياسة الخصوصية والمرتجعات المعروضة وأوافق عليها',exact:true}).check()
  await confirm.click()
  if(method==='cod'){
    await expect(page.getByText('تعذر الاتصال مؤقتًا. أعد المحاولة.',{exact:true})).toBeVisible()
    await confirm.click()
    await expect.poll(()=>attempts.length).toBe(2)
    expect(attempts[0].checkout_key).toBe(attempts[1].checkout_key)
  }
  await expect(page).toHaveURL(/\/store\/order-confirmation\/ORD-CHECKOUT/)
  expect(createdBody.items).toEqual([{product_id:1,variant_id:11,quantity:2}])
  expect(createdBody.shipping_address_id).toBe(7)
  expect(createdBody.quote_id).toBe(42)
  expect(createdBody.legal_version_ids).toEqual([1,2,3])
  expect(createdBody.legal_accepted).toBe(true)
  expect(createdBody.checkout_key).toBe(quoteBody.checkout_key)
  expect(createdBody.payment_method).toBe(method)
  if(method==='online'){await expect.poll(()=>payBody?.payment_gateway_id).toBe(7)}
  expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('hwnix_store_cart')||'[]'))).toEqual([])
})
}
