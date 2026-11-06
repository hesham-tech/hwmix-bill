import { test, expect } from '@playwright/test'

const policy={funding_mode:'prepaid',credit_limit_minor:0,commission_type:'percent',commission_percent:'0.00',commission_fixed_minor:0,commission_timing:'delivered_collected',use_sales_balance_for_commission:true,automatic_debt_offset:true,settlement_delay_days:0,minimum_payout_minor:0,automatic_payout:false,payout_method:'manual',payout_weekday:1,payout_hour:12}
const settings={enabled:false,currency:'EGP',cod_enabled:true,online_enabled:false,allow_guest_checkout:false,require_verified_email:true,max_unconfirmed_orders_per_customer:3,hold_hours:24,quote_minutes:15,auto_confirm_paid_orders:true,platform_shipping_account_id:null,legal_document_ids:[],tax_mode:'unconfigured',default_tax_rate_bps:0,legal_setup_confirmed:false,return_policy:{window_days:null,allow_change_of_mind:true,allow_defect:true},seller_policy:policy}
const companies=[{id:1,name:'المنصة'},{id:2,name:'شركة اختبار'}]

async function mockOperations(page,{isAdmin=true,offline=false}={}) {
  await page.addInitScript(()=>sessionStorage.setItem('token','operations-test-token'))
  await page.route('**/api/v1/**',async route=>{
    const path=new URL(route.request().url()).pathname
    let data=[]
    if(path==='/api/v1/bootstrap') data={user:{id:1,full_name:'مدير الاختبار',is_staff_or_admin:true,permissions:[isAdmin?'admin.super':'admin.company'],roles:[],company_id:1,active_company_id:1,companies,branches:[],subscription:{status:'active'}}}
    else if(path.endsWith('/admin/store/bootstrap')) {
      if(offline)return route.fulfill({status:503,json:{message:'تعذر الاتصال بالخادم'}})
      data={settings,permissions:{settings:true,orders:true,finance:true},readiness_issues:['استكمل إعداد المتجر'],companies,plans:[],legal_documents:[],governorates:[{id:'cairo',name:'القاهرة'}],platform_company_id:1}
    } else if(path.endsWith('/shipping-drivers')) data=[{id:'manual',name:'شحن يدوي',fields:{},automatic:false}]
    else if(path.endsWith('/sellers/2')) data={profile:{company_id:2,is_enabled:false,pickup_address:{},policy_overrides:{},policy_review_required:true},warehouses:[{id:5,name:'مخزن الاختبار'}],effective_policy:policy,payout_destination_configured:false}
    else if(path.endsWith('/admin/store/accounts')) data=[{id:1,company_id:2,balance_minor:-500,pending_minor:10000,prepaid_minor:3000,available_for_payout_minor:0}]
    else if(/\/admin\/store\/(orders|returns|refunds|payouts|outbox)$/.test(path)) data={data:[],last_page:1}
    return route.fulfill({json:{success:true,data}})
  })
}

test('sidebar opens store operations and each administration tab loads',async({page})=>{
  const errors=[];page.on('pageerror',error=>{errors.push(error.message);console.error('Store browser error:',error.message)})
  await mockOperations(page);await page.goto('/app/store-operations')
  await expect(page.getByRole('heading',{name:'إدارة المتجر',exact:true})).toBeVisible()
  await expect(page.locator('a[href="/app/store-operations"]')).toBeVisible()
  await expect(page.getByText('استكمل إعداد المتجر',{exact:true})).toBeVisible()
  const welcome=page.getByRole('button',{name:'علمت بذلك، موافق',exact:true})
  if(await welcome.isVisible())await welcome.click()
  for(const label of ['الطلبات','المرتجعات','المهام','الصرف','الاسترداد','الشحن والأسعار','الأرصدة']) {
    await page.getByRole('tab',{name:label,exact:true}).click()
    await expect(page.getByRole('tab',{name:label,exact:true})).toHaveAttribute('aria-selected','true')
  }
  await expect(page.getByText('شركة اختبار',{exact:true}).first()).toBeVisible()
  await page.getByRole('tab',{name:'البائعون والباقات',exact:true}).click()
  await page.getByRole('combobox').filter({has:page.getByRole('textbox',{name:'الشركة البائعة',exact:true})}).click()
  await page.getByRole('option',{name:'شركة اختبار'}).click()
  await expect(page.getByText('تغيرت الباقة.',{exact:false})).toBeVisible()
  await expect(page.getByRole('button',{name:'حفظ البائع واعتماد الاستثناءات'})).toBeVisible()
  expect(errors).toEqual([])
})

test('merchant admin cannot access platform store operations',async({page})=>{
  await mockOperations(page,{isAdmin:false});await page.goto('/app/store-operations')
  await expect(page.getByRole('heading',{name:'إدارة المتجر',exact:true})).not.toBeVisible()
  await expect(page.locator('a[href="/app/store-operations"]')).toHaveCount(0)
})

test('operations connection failure has an actionable retry',async({page})=>{
  await mockOperations(page,{offline:true});await page.goto('/app/store-operations')
  await expect(page.getByText('تعذر الاتصال بالخادم',{exact:true}).first()).toBeVisible()
  await expect(page.getByRole('button',{name:'تحديث',exact:true})).toBeEnabled()
})

test('finance operator records a bank settlement with the selected payments and actual fees',async({page})=>{
  await mockOperations(page)
  let saved=null
  await page.route('**/admin/store/payments?*',route=>route.fulfill({json:{data:{data:saved?[]:[{id:7,payable_id:12,amount:'100.00',currency:'EGP',status:'completed',gateway_driver:'stripe',gateway_reference:'cs_fixture',gateway_payment_reference:'pi_fixture',unsettled_minor:10000}],last_page:1}}}))
  await page.route('**/admin/store/gateway-settlements',async route=>{
    if(route.request().method()==='POST')saved=route.request().postDataJSON()
    return route.fulfill({json:{data:route.request().method()==='POST'?{id:1}:{data:[],last_page:1}}})
  })
  await page.goto('/app/store-operations')
  await expect(page.getByText('استكمل إعداد المتجر',{exact:true})).toBeVisible()
  const welcome=page.getByRole('button',{name:'علمت بذلك، موافق',exact:true})
  if(await welcome.isVisible())await welcome.click()
  await page.getByRole('tab',{name:'مطابقة الدفع',exact:true}).click()
  await page.getByRole('checkbox',{name:'اختيار محاولة 7'}).check()
  await page.getByRole('spinbutton',{name:'صافي تسوية البوابة'}).fill('98')
  await page.getByRole('spinbutton',{name:'رسوم تسوية البوابة'}).fill('2')
  await page.getByRole('textbox',{name:'مرجع تسوية البوابة'}).fill('BANK-TEST-SETTLEMENT')
  await page.getByRole('checkbox',{name:'تأكيد مطابقة تسوية البوابة'}).check()
  await page.getByRole('button',{name:'توثيق التسوية',exact:true}).click()
  await expect(page.getByText('تم توثيق التسوية والرسوم.',{exact:true})).toBeVisible()
  expect(saved.payment_ids).toEqual([7])
  expect(saved.net_amount).toBe('98')
  expect(saved.fee).toBe('2')
  expect(saved.confirmed).toBe(true)
})
