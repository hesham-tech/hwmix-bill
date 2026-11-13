import {test,expect} from '@playwright/test'

const product={id:1,name:'منتج بسعر معلن',price:125,quantity:5,stock_status:'in_stock',vendor:{id:35,name:'هونكس تك'},variants:[{id:11,name:'الاختيار الأساسي',price:125,available_stock:5}],images:[]}
test.beforeEach(async({page})=>{
  await page.route('https://fonts.googleapis.com/**',route=>route.abort())
  await page.route('https://fonts.gstatic.com/**',route=>route.abort())
  await page.route('**/api/v1/**',async route=>{
    const path=new URL(route.request().url()).pathname
    let data=[]
    if(path.endsWith('/products')||path.endsWith('/products/featured'))data={data:[product],meta:{total:1,current_page:1,last_page:1,per_page:12}}
    else if(path.endsWith('/products/1'))data=product
    else if(path.endsWith('/store/public/contact'))data={email:'support@hwnix.com',phone:'01007888009',address:'محافظة الشرقية، مصر'}
    else if(path.endsWith('/checkout-config'))data={enabled:false,currency:'EGP',cod_enabled:true,online_enabled:false,governorates:[],gateways:[]}
    await route.fulfill({json:{success:true,data}})
  })
})

for(const path of ['/','/store','/store/product/1'])test(`public prices and real contact details are available at ${path}`,async({page})=>{
  await page.goto(path,{waitUntil:'domcontentloaded'})
  if(path!='/store/product/1')await expect(page.locator('.product-card').first()).toContainText('125')
  const footer=page.getByRole('contentinfo',{name:'تواصل معنا وسياسات متجر هونكس'})
  await expect(footer).toHaveCount(1)
  await expect(footer.getByRole('link',{name:'support@hwnix.com',exact:true})).toHaveAttribute('href','mailto:support@hwnix.com')
  await expect(footer.getByRole('link',{name:'01007888009',exact:true})).toHaveAttribute('href','tel:+201007888009')
  await expect(footer).toContainText('محافظة الشرقية، مصر')
  await expect(footer).not.toContainText('قرية الكوثر')
  await expect(footer.getByRole('link',{name:'الاستبدال والاسترجاع',exact:true})).toHaveAttribute('href','/store/policies/store-returns-policy')
  for(const width of [360,390,959,960,1440]){
    await page.setViewportSize({width,height:900});await footer.scrollIntoViewIfNeeded()
    await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true)
    await expect(footer.getByRole('link',{name:'01007888009',exact:true})).toBeVisible()
  }
  if(path==='/')await page.screenshot({path:process.env.TEMP+'/hwnix-store-contact-desktop.png',fullPage:true,animations:'disabled',timeout:15000})
})

test('contact details remain available when product loading fails',async({page})=>{
  await page.route('**/store/public/products**',route=>route.abort())
  await page.goto('/',{waitUntil:'domcontentloaded'})
  const footer=page.getByRole('contentinfo',{name:'تواصل معنا وسياسات متجر هونكس'})
  await expect(footer.getByRole('link',{name:'support@hwnix.com',exact:true})).toBeVisible()
  await expect(footer.getByRole('link',{name:'01007888009',exact:true})).toBeVisible()
})


test('cached public contact is used on failure and refreshed on retry',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('hwnix_store_public_contact_v1',JSON.stringify({email:'cached@example.test',phone:'01033333333',address:'آخر عنوان محفوظ، مصر'})))
  await page.route('**/store/public/contact',route=>route.abort())
  await page.goto('/store',{waitUntil:'domcontentloaded'})
  const footer=page.getByRole('contentinfo',{name:'تواصل معنا وسياسات متجر هونكس'})
  await expect(footer.getByRole('link',{name:'cached@example.test',exact:true})).toBeVisible()
  await expect(footer).toContainText('آخر بيانات محفوظة')
  await page.unroute('**/store/public/contact')
  await footer.getByRole('button',{name:'إعادة المحاولة',exact:true}).click()
  await expect(footer.getByRole('link',{name:'support@hwnix.com',exact:true})).toBeVisible()
  await expect(footer).not.toContainText('آخر عنوان محفوظ')
})
test('without a cache, a contact outage shows retry instead of invented contact data',async({page})=>{
  await page.route('**/store/public/contact',route=>route.abort())
  await page.goto('/store',{waitUntil:'domcontentloaded'})
  const footer=page.getByRole('contentinfo',{name:'تواصل معنا وسياسات متجر هونكس'})
  await expect(footer).toContainText('تعذر تحميل بيانات التواصل')
  await expect(footer.locator('a[href^="mailto:"],a[href^="tel:"]')).toHaveCount(0)
})
