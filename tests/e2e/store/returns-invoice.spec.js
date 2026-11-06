import {test,expect} from '@playwright/test'
const policy={funding_mode:'prepaid',credit_limit_minor:0,commission_type:'percent',commission_percent:'0.00',commission_fixed_minor:0,commission_timing:'delivered_collected',use_sales_balance_for_commission:true,automatic_debt_offset:true,settlement_delay_days:0,minimum_payout_minor:0,automatic_payout:false,payout_method:'manual',payout_weekday:1,payout_hour:12}
const settings={enabled:false,currency:'EGP',cod_enabled:true,online_enabled:false,allow_guest_checkout:false,require_verified_email:true,max_unconfirmed_orders_per_customer:3,hold_hours:24,quote_minutes:15,auto_confirm_paid_orders:true,platform_shipping_account_id:null,legal_document_ids:[],tax_mode:'unconfigured',default_tax_rate_bps:0,legal_setup_confirmed:false,return_policy:{window_days:null,allow_change_of_mind:true,allow_defect:true},seller_policy:policy}
const companies=[{id:1,name:'المنصة'},{id:2,name:'شركة اختبار'}]
const buyer={id:11,full_name:'عميل متجر',is_staff_or_admin:false,company_id:1,active_company_id:1,permissions:[],roles:[],companies,branches:[]}
const adminUser={...buyer,id:1,is_staff_or_admin:true,permissions:['admin.super']}
test('customer return progresses through approval and physical inspection without claiming refund completion',async({page})=>{
 let admin=false,entry=null;const actions=[]
 await page.addInitScript(()=>sessionStorage.setItem('token','returns-fixture'))
 await page.route('**/api/v1/**',async route=>{
  const path=new URL(route.request().url()).pathname;let data=[]
  if(path==='/api/v1/bootstrap')data={user:admin?adminUser:buyer}
  else if(path.endsWith('/admin/store/bootstrap'))data={settings,permissions:{settings:true,orders:true,finance:true},readiness_issues:[],companies,plans:[],legal_documents:[],governorates:[],platform_company_id:1}
  else if(path.endsWith('/admin/store/returns'))data={data:entry?[entry]:[],last_page:1}
  else if(path.endsWith('/admin/store/returns/72/action')){const body=route.request().postDataJSON();actions.push(body);entry.status=body.action==='approve'?'approved':'received';data=entry}
  else if(path.endsWith('/orders/ORD-RETURN/returns')){
   if(route.request().method()==='POST'){const body=route.request().postDataJSON();expect(body.item_id).toBe(91);expect(body.quantity).toBe(1);entry={id:72,store_order_item_id:91,quantity:1,reason:body.reason,status:'requested',shipping_payer:'seller',refund_minor:12500};data=entry}else data=entry?[entry]:[]
  }else if(path.endsWith('/orders/ORD-RETURN'))data={id:1,order_number:'ORD-RETURN',status:'delivered',payment_method:'cod',payment_status:'paid',currency:'EGP',total_amount:250,subtotal:200,shipping_total:50,sub_orders:[{id:9,status:'delivered',vendor:{name:'بائع الاختبار'},items:[{id:91,product:{name:'منتج الاختبار'},variant:{sku:'SKU'},quantity:2,subtotal:200,return_policy:{window_days:14,allow_defect:true,allow_change_of_mind:true}}]}]}
  await route.fulfill({json:{data}})
 })
 await page.goto('/store/order-confirmation/ORD-RETURN')
 await page.getByRole('button',{name:'طلب إرجاع منتج',exact:true}).click()
 await page.getByRole('combobox').filter({has:page.getByRole('textbox',{name:'سبب الإرجاع',exact:true})}).click()
 await page.getByRole('option',{name:'عيب بالمنتج',exact:true}).click()
 await page.getByRole('button',{name:'إرسال طلب الإرجاع',exact:true}).click()
 await expect(page.getByText('مرتجع #72 — بانتظار المراجعة',{exact:true})).toBeVisible()
 await page.getByRole('button',{name:'طلب إرجاع منتج',exact:true}).click()
 await expect(page.getByRole('spinbutton',{name:'كمية الإرجاع',exact:true})).toHaveAttribute('max','1')
 await page.getByRole('dialog').getByRole('button',{name:'إلغاء',exact:true}).click()
 admin=true;await page.goto('/app/store-operations')
 await expect(page.getByRole('tab',{name:'المرتجعات',exact:true})).toBeVisible()
 const welcome=page.getByRole('button',{name:'علمت بذلك، موافق',exact:true});if(await welcome.isVisible())await welcome.click()
 await page.getByRole('tab',{name:'المرتجعات',exact:true}).click()
 for(const [label,action] of [['اعتماد الاستلام العكسي','approve'],['استلام وفحص المرتجع','receive']]){
  await page.getByRole('button',{name:'مراجعة',exact:true}).click()
  await page.getByRole('combobox').filter({has:page.getByRole('textbox',{name:'الإجراء',exact:true})}).click()
  await page.getByRole('option',{name:label,exact:true}).click()
  if(action==='receive'){await page.getByRole('combobox').filter({has:page.getByRole('textbox',{name:'حالة المنتج بعد الفحص',exact:true})}).click();await page.getByRole('option',{name:'صالح لإعادة البيع',exact:true}).click()}
  await expect(page.getByRole('button',{name:'تنفيذ الإجراء',exact:true})).toBeDisabled()
  await page.getByRole('checkbox',{name:'راجعت البيانات وأؤكد الإجراء المختار',exact:true}).check()
  await page.getByRole('button',{name:'تنفيذ الإجراء',exact:true}).click()
  await expect.poll(()=>actions.at(-1)?.action).toBe(action)
  await expect(page.getByRole('dialog')).toHaveCount(0)
 }
 expect(actions[1].condition).toBe('saleable');expect(actions[1].confirmed).toBe(true)
 admin=false;await page.goto('/store/order-confirmation/ORD-RETURN')
 await expect(page.getByText('مرتجع #72 — تم الفحص — الاسترداد قيد التنفيذ',{exact:true})).toBeVisible()
})
test('ERP marketplace invoice displays its separate accounting context without generic mutation or buyer balances',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('token','invoice-fixture'))
 const errors=[];page.on('pageerror',e=>errors.push(e.message))
 await page.route('**/api/v1/**',route=>{
  const path=new URL(route.request().url()).pathname;let data=[]
  if(path==='/api/v1/bootstrap')data={user:adminUser}
  else if(path.endsWith('/invoices/99'))data={id:99,invoice_number:'STORE-9',is_marketplace_managed:true,store_sub_order_id:9,customer:{id:11,name:'عميل متجر',phone:'01012345678'},invoice_type:{id:1,code:'sale',name:'مبيعات',context:'sales'},company:{id:2,name:'بائع الاختبار'},items:[],payments:[],status:'confirmed',status_label:'مؤكدة',payment_status:'paid',payment_status_label:'مدفوعة',issue_date:'2026-11-04',net_amount:'250.00',gross_amount:'250.00',paid_amount:'250.00',remaining_amount:'0.00',total_required:'250.00',total_tax:'0.00',total_discount:'0.00',previous_balance:'0.00',user_balance_after:'0.00',creator:null}
  return route.fulfill({json:{data}})
 })
 await page.goto('/app/invoices/99')
 await expect(page.getByRole('heading',{name:'فاتورة طلب متجر',exact:true})).toBeVisible()
 for(const name of ['تعديل','حذف','إرجاع'])await expect(page.getByRole('button',{name,exact:true})).toHaveCount(0)
 await expect(page.getByText('رصيد العميل النهائي:',{exact:true})).toHaveCount(0)
 expect(errors).toEqual([])
})

test('a cancelled order is requoted through a fresh cart without changing or charging the old order',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('token','requote-fixture'))
 let financialPosts=0
 await page.route('**/api/v1/**',route=>{
  const path=new URL(route.request().url()).pathname;let data=[]
  if(path==='/api/v1/bootstrap')data={user:buyer}
  else if(path.endsWith('/orders/ORD-OLD'))data={id:1,order_number:'ORD-OLD',status:'cancelled',payment_method:'online',payment_status:'partial',currency:'EGP',total_amount:250,refunds:[{id:8,status:'pending',amount_minor:25000}],sub_orders:[{id:9,status:'cancelled',items:[{id:91,product:{id:1,name:'منتج الاختبار'},variant:{id:11,sku:'SKU'},quantity:2,subtotal:200}]}]}
  else if(path.endsWith('/public/products'))data={data:[{id:1,name:'منتج الاختبار',company_id:2,vendor:{name:'بائع الاختبار'},price:150,default_variant_id:11,variants:[{id:11,price:150,available_stock:5,sku:'SKU'}]}]}
  if(route.request().method()==='POST')financialPosts++
  return route.fulfill({json:{data}})
 })
 await page.goto('/store/order-confirmation/ORD-OLD')
 await expect(page.getByText('الطلب الجديد مستقل عن متابعة استرداد الطلب السابق.',{exact:false})).toBeVisible()
 await page.getByRole('button',{name:'مراجعة طلب جديد بالأسعار الحالية',exact:true}).click()
 await expect(page).toHaveURL(/\/store\/cart$/)
 const cart=await page.evaluate(()=>JSON.parse(localStorage.getItem('hwnix_store_cart')||'[]'))
 expect(cart[0].unitPrice).toBe(150);expect(cart[0].quantity).toBe(2)
 expect(financialPosts).toBe(0)
})
