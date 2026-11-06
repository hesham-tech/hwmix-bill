import {test,expect} from '@playwright/test'
test('seller prepares own orders and requests only available funds to the approved destination',async({page})=>{
  await page.addInitScript(()=>sessionStorage.setItem('token','vendor-fixture-token'))
  let ready=false,payoutBody=null
  await page.route('**/api/v1/**',async route=>{
    const path=new URL(route.request().url()).pathname;let data=[]
    if(path==='/api/v1/bootstrap')data={user:{id:55,full_name:'مدير البائع',is_staff_or_admin:true,company_id:2,active_company_id:2,permissions:['admin.company','store.vendor.orders.view','store.vendor.orders.manage','store.vendor.finance.view','store.vendor.finance.manage'],roles:[],companies:[{id:2,name:'بائع الاختبار'}],branches:[],subscription:{status:'active'}}}
    else if(path.endsWith('/vendor/store/orders'))data={data:[{id:9,sub_order_number:'SUB-VENDOR',status:ready?'processing':'confirmed',items:[{product:{name:'منتج الاختبار'},quantity:2}]}],last_page:1}
    else if(path.endsWith('/vendor/store/orders/9/status')){expect(route.request().postDataJSON().status).toBe('processing');ready=true;data={}}
    else if(path.endsWith('/vendor/store/account'))data={account:{balance_minor:10000,pending_minor:5000,prepaid_minor:0,payout_held_minor:payoutBody?2500:0},available_for_payout_minor:payoutBody?7500:10000,destination_configured:true,policy_review_required:false,payouts:[],ledger:{data:[],last_page:1}}
    else if(path.endsWith('/vendor/store/payouts')){payoutBody=route.request().postDataJSON();data={id:1}}
    await route.fulfill({json:{data}})
  })
  await page.goto('/app/my-store')
  await expect(page.getByRole('heading',{name:'متجر شركتي',exact:true})).toBeVisible()
  const welcome=page.getByRole('button',{name:'علمت بذلك، موافق',exact:true})
  if(await welcome.isVisible())await welcome.click()
  await page.getByRole('button',{name:'تجهيز الطلب جاهز للاستلام',exact:true}).click()
  await expect(page.getByText('جاهز للاستلام',{exact:true})).toBeVisible()
  await page.getByRole('tab',{name:'الرصيد والسحب',exact:true}).click()
  await page.getByRole('spinbutton',{name:'مبلغ السحب بالجنيه',exact:true}).fill('25')
  await page.getByRole('button',{name:'طلب الصرف للحساب المعتمد',exact:true}).click()
  await expect.poll(()=>payoutBody?.amount).toBe('25')
  expect(payoutBody.operation_key).toMatch(/^[a-f0-9-]{36}$/)
  expect(payoutBody).not.toHaveProperty('destination')
})
