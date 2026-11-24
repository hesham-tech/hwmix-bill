import { test, expect } from '@playwright/test';
import changelogs from '../../src/config/changelogs.json' with {type:'json'};

const customer = {id:25,full_name:'عميل التحصيل',phone:'01012345678',roles:[],relation_types:['customer'],balance:0};
const rows = [
  {id:1,installment_plan_id:11,invoice_number:'INV-11',due_date:'2026-10-05',remaining:'200.00',selected:true,overdue:true},
  {id:2,installment_plan_id:12,invoice_number:'INV-12',due_date:'2026-11-30',remaining:'500.00',selected:true,overdue:false},
  {id:3,installment_plan_id:13,invoice_number:'INV-13',due_date:'2026-12-05',remaining:'300.00',selected:false,overdue:false},
];
async function fixture(page, { denied=false }={}) {
  const previews=[],payments=[];
  // Fixtures may never send unmatched traffic to real services, including assets.
  await page.context().route('**/*', route => {
    const host = new URL(route.request().url()).hostname;
    return ['localhost','127.0.0.1','[::1]'].includes(host) ? route.fallback() : route.abort('blockedbyclient');
  });
  await page.addInitScript(()=>{sessionStorage.setItem('token','collection-fixture');localStorage.setItem('guidance_enabled','false');});
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  await page.route('https://fonts.gstatic.com/**',r=>r.abort());
  await page.route('**/api/v1/**',async route=>{
    const req=route.request(), path=new URL(req.url()).pathname;
    let data=[], total;
    if(path.endsWith('/bootstrap')) data={user:{id:10,full_name:'موظف التحصيل',is_staff_or_admin:true,active_company_id:2,company_id:2,
      subscription:{status:'active'},settings:{acknowledged_updates:changelogs.map(c=>c.version)},permissions:denied?['users.view_all','installment_plans.view_all']:['admin.super'],roles:[],companies:[{id:2,name:'شركة الاختبار'}],branches:[]}};
    else if(path.endsWith('/guidance/setup/compact')) data={can_manage:false,state:{hidden:true},steps:[],data:{},issues:[]};
    else if(path.endsWith('/users/25')) data=customer;
    else if(path.endsWith('/users/customers')) {data=[customer];total=1;}
    else if(path.endsWith('/global-search')) return route.fulfill({json:{users:[customer],invoices:[],installment_plans:[]}});
    else if(path.endsWith('/payment-methods')) data=[{id:4,name:'نقدًا',code:'cash'}];
    else if(path.endsWith('/cash-boxes')) data=[{id:5,name:'الخزنة الرئيسية',is_default:true}];
    else if(path.endsWith('/installment-plans/11')) data={id:11,user_id:25,customer,status:'active',remaining_amount:200,total_amount:200,invoice:{invoice_number:'INV-11'},installments:[{...rows[0],user_id:25,status:'pending',amount:200,installment_number:1}]};
    else if(path.endsWith('/installment-plans')) {data=[{id:11,user_id:25,customer,status:'active',remaining_amount:200,total_amount:200,number_of_installments:1,installment_amount:200,invoice:{invoice_number:'INV-11'}}];total=1;}
    else if(path.endsWith('/installment-collections/candidates')) data={customer_id:25,cutoff:'2026-11-30',items:rows,due_total:'700.00',total_remaining:'1000.00'};
    else if(path.endsWith('/installment-collections/preview')) {
      const body=req.postDataJSON();previews.push(body);let left=Number(body.amount);
      const allocations=rows.filter(r=>body.installment_ids.includes(r.id)).map(r=>{
        const amount=body.allocations?Number(body.allocations.find(a=>a.installment_id===r.id)?.amount||0):Math.min(Number(r.remaining),left);left-=amount;
        return {...r,amount:amount.toFixed(2),remaining_after:(Number(r.remaining)-amount).toFixed(2)};
      }).filter(r=>Number(r.amount)>0);
      data={token:'fixture-preview',amount:body.amount,shortfall:(rows.filter(r=>body.installment_ids.includes(r.id)).reduce((s,r)=>s+Number(r.remaining),0)-Number(body.amount)).toFixed(2),advance_amount:allocations.filter(r=>!r.selected).reduce((s,r)=>s+Number(r.amount),0).toFixed(2),allocations};
    } else if(path.endsWith('/installment-collections')) {
      payments.push(req.postDataJSON());data={collection_id:8,amount:previews.at(-1).amount,allocations:[{...rows[0],amount:'200.00',remaining_after:'0.00'}],payments:[{payment_id:99,installment_plan_id:11,amount:'200.00'}],remaining_due:'400.00',total_remaining_after:'700.00',paid_at:'2026-11-20'};
    } else if(path.endsWith('/installment-payments/99')) data={id:99,amount_paid:100,customer,plan:{invoice:{invoice_number:'INV-11'},remaining_amount:100}};
    await route.fulfill({json:{status:true,success:true,data,...(total===undefined?{}:{total})}});
  });
  return {previews,payments};
}
const activeDialog=page=>page.locator('.v-dialog.v-overlay--active');

test('customer profile previews partial collection before any writes',async({page})=>{
  test.setTimeout(240000);
  const state=await fixture(page);
  await page.goto('/app/users/25');
  await page.getByRole('button',{name:'تحصيل أقساط',exact:true}).click();
  const d=activeDialog(page);
  await expect(d.getByLabel('تحديد القسط 1')).toBeChecked();
  await expect(d.getByLabel('تحديد القسط 2')).toBeChecked();
  await expect(d.getByLabel('تحديد القسط 3')).toHaveCount(0);
  await d.getByRole('spinbutton',{name:'المبلغ المستلم'}).fill('300');
  await d.getByRole('button',{name:'معاينة التوزيع'}).click();
  await expect(d.getByText(/المبلغ أقل من إجمالي الأقساط المحددة/)).toBeVisible();
  expect(state.previews[0].installment_ids).toEqual([1,2]);expect(state.payments).toHaveLength(0);
  await d.getByRole('button',{name:'تعديل التوزيع'}).click();expect(state.payments).toHaveLength(0);
  await d.getByRole('button',{name:'معاينة التوزيع'}).click();
  await d.getByRole('button',{name:'تأكيد التحصيل',exact:true}).click();
  await expect(d.getByText(/تم تحصيل.*عملية رقم/)).toBeVisible();expect(state.payments).toHaveLength(1);
});

test('surplus proposes next months explicitly and fits mobile',async({page})=>{
  const state=await fixture(page);await page.setViewportSize({width:390,height:844});
  await page.goto('/app/users/25');await page.getByRole('button',{name:'تحصيل أقساط',exact:true}).click();
  const d=activeDialog(page);await d.getByRole('spinbutton',{name:'المبلغ المستلم'}).fill('800');
  await expect(d.getByRole('button',{name:'معاينة التوزيع'})).toBeDisabled();
  await d.getByRole('button',{name:'اقتراح توزيع الزيادة على الأقساط القادمة'}).click();
  await expect(d.getByLabel('تحديد القسط 3')).toBeChecked();
  await d.getByRole('button',{name:'معاينة التوزيع'}).click();
  await expect(d.getByText(/يتضمن المبلغ سداد/)).toContainText('100');
  expect(state.payments).toHaveLength(0);
  await expect.poll(()=>d.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
  await page.screenshot({path:'test-results/installment-collection-mobile.png',fullPage:true});
});

test('single plan confirms partial and excess before payment and allows cancellation',async({page})=>{
  const state=await fixture(page);await page.goto('/app/installment-plans/11');
  await page.getByRole('button',{name:'تحصيل قسط',exact:true}).click();
  const d=activeDialog(page);await d.getByRole('spinbutton',{name:/المبلغ المدفوع/}).fill('100');
  await d.getByRole('button',{name:'تأكيد وحفظ',exact:true}).click();
  await expect(page.getByRole('heading',{name:'تأكيد الدفع الجزئي'})).toBeVisible();
  expect(state.payments).toHaveLength(0);
  await page.getByRole('button',{name:'رجوع للتعديل'}).click();expect(state.payments).toHaveLength(0);
});

test('collection entry points exist on plans and customers but not without collection permission',async({page})=>{
  await fixture(page);await page.goto('/app/installment-plans');
  await expect(page.getByRole('button',{name:'تحصيل أقساط',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'تحصيل أقساط',exact:true}).click();
  await expect(activeDialog(page).getByRole('textbox',{name:/العميل/})).toBeEnabled();
});

test('employee without collection permission cannot see profile collection button',async({page})=>{
  await fixture(page,{denied:true});await page.goto('/app/users/25');
  await expect(page.getByRole('heading',{name:'تفاصيل المستخدم'})).toBeVisible();
  await expect(page.getByRole('button',{name:'تحصيل أقساط',exact:true})).toHaveCount(0);
});

test('global navbar search leads to customer collection',async({page})=>{
  await fixture(page);await page.goto('/app/installment-plans');
  await page.locator('.tour-nav-search').click();
  await page.getByPlaceholder('ابحث عن عميل، فاتورة، أو خطة تقسيط...').fill('عميل');
  await activeDialog(page).locator('.result-item').filter({hasText:'عميل التحصيل'}).click();
  await expect(page).toHaveURL(/\/app\/users\/25/);
  await page.getByRole('button',{name:'تحصيل أقساط',exact:true}).click();
  await expect(activeDialog(page).getByLabel('تحديد القسط 1')).toBeChecked();
});

test('single installment excess is confirmed before spreading within its plan',async({page})=>{
  const state=await fixture(page);
  await page.route('**/installment-collections/candidates?*',route=>route.fulfill({json:{status:true,data:{customer_id:25,cutoff:'2026-11-30',items:[rows[0],{...rows[2],id:4,installment_plan_id:11}],due_total:'200.00',total_remaining:'500.00'}}}));
  await page.goto('/app/installment-plans/11');await page.getByRole('button',{name:'تحصيل قسط',exact:true}).click();
  await activeDialog(page).getByRole('spinbutton',{name:/المبلغ المدفوع/}).fill('250');
  await activeDialog(page).getByRole('button',{name:'تأكيد وحفظ',exact:true}).click();
  await expect(page.getByRole('heading',{name:'تأكيد توزيع الزيادة'})).toBeVisible();
  expect(state.previews[0].allocations).toEqual([{installment_id:1,amount:'200.00'},{installment_id:4,amount:'50.00'}]);
  expect(state.payments).toHaveLength(0);await page.getByRole('button',{name:'رجوع للتعديل'}).click();
});

test('uncertain collection retries the identical request without allowing edits',async({page})=>{
  const state=await fixture(page), attempts=[];
  await page.route('**/installment-collections',async route=>{
    attempts.push(route.request().postDataJSON());
    if(attempts.length===1) return route.fulfill({status:503,json:{message:'temporary transport failure'}});
    await route.fallback();
  });
  await page.goto('/app/users/25');await page.getByRole('button',{name:'تحصيل أقساط',exact:true}).click();
  const d=activeDialog(page);await d.getByRole('button',{name:'معاينة التوزيع'}).click();
  await d.getByRole('button',{name:'تأكيد التحصيل',exact:true}).click();
  await expect(d.getByRole('button',{name:'تعديل التوزيع'})).toBeDisabled();
  await d.getByRole('button',{name:'إعادة التحقق من التحصيل'}).click();
  await expect(d.getByText(/تم تحصيل.*عملية رقم/)).toBeVisible();
  expect(attempts).toHaveLength(2);expect(attempts[0]).toEqual(attempts[1]);expect(state.payments).toHaveLength(1);
});
