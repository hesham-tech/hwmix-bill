<template>
 <main class="map-settings" dir="rtl">
  <h1 class="text-h5 mb-3">الخرائط والبحث عن العناوين</h1>
  <p class="mb-5">تكامل عام لهونكس، يستخدمه جميع البائعين والعملاء. لا يرتبط بإعدادات شركة بعينها.</p>
  <v-alert v-if="error" type="error" variant="tonal" class="mb-4" role="alert">{{ error }}<v-btn v-if="!allowed" variant="text" @click="load">إعادة المحاولة</v-btn></v-alert>
  <v-alert v-if="message" type="success" variant="tonal" class="mb-4" role="status">{{ message }}</v-alert>
  <v-progress-linear v-if="loading" indeterminate aria-label="تحميل إعدادات الخرائط" />
  <v-card v-if="allowed&&!loading" class="pa-5" rounded="xl">
   <v-form @submit.prevent="save">
    <h2 class="text-h6 mb-2">البحث عبر Geoapify</h2>
    <p class="mb-4">أنشئ مشروعًا بالخطة المجانية من <a href="https://myprojects.geoapify.com/" target="_blank" rel="noopener noreferrer">حساب Geoapify</a>، ثم انسخ مفتاحه من API keys. لا تحتاج اختيار خطة مدفوعة.</p>
    <v-switch v-model="form.enabled" label="تفعيل البحث عن العناوين" :disabled="busy" color="primary" />
    <v-text-field v-model="form.search_key" type="password" autocomplete="new-password" label="مفتاح البحث الخاص بالسيرفر" aria-label="مفتاح البحث الخاص بالسيرفر" :disabled="busy||form.clear_search_key" :hint="form.search_key_configured?'يوجد مفتاح محفوظ؛ اترك الحقل فارغًا للاحتفاظ به.':'المفتاح مطلوب لتفعيل البحث.'" persistent-hint :error-messages="errors.search_key" />
    <v-checkbox v-if="form.search_key_configured" v-model="form.clear_search_key" label="حذف مفتاح البحث المحفوظ عند الحفظ" :disabled="busy" />
    <v-text-field v-model.number="form.daily_limit" type="number" min="0" max="3000" label="الحد اليومي لطلبات البحث" aria-label="الحد اليومي لطلبات البحث" :disabled="busy" :error-messages="errors.daily_limit" hint="الصفر يوقف الطلبات الجديدة للمزود. النتائج المخزنة مؤقتًا تظل متاحة. هذا ليس حد رصيد الحساب لدى المزود." persistent-hint />
    <details class="my-5"><summary>صور الخرائط — اختياري</summary><p class="my-3">بدون مفتاح إضافي تستمر خرائط OpenStreetMap الحالية. لتغيير صور الخريطة، استخدم مفتاحًا منفصلًا مقيّدًا بنطاقات موقعك؛ هذا المفتاح سيكون ظاهرًا للمتصفح ويستهلك من رصيد Geoapify.</p><v-text-field v-model="form.map_key" type="password" autocomplete="new-password" label="مفتاح صور الخرائط" aria-label="مفتاح صور الخرائط" :disabled="busy||form.clear_map_key" :hint="form.map_key_configured?'يوجد مفتاح محفوظ؛ اتركه فارغًا للاحتفاظ به.':'اختياري'" persistent-hint :error-messages="errors.map_key" /><v-checkbox v-if="form.map_key_configured" v-model="form.clear_map_key" label="حذف مفتاح صور الخرائط عند الحفظ" :disabled="busy" /></details>
    <p class="text-body-2 mb-4">مفتاح البحث يُستخدم من السيرفر؛ تقييده يكون بعنوان اتصال السيرفر بعد التحقق منه. اختبار الاتصال يستخدم المفتاح المحفوظ ويستهلك طلبًا واحدًا. لا يختبر مفتاح صور الخرائط.</p>
    <div class="actions"><v-btn type="submit" color="primary" :loading="saving" :disabled="busy||!valid">حفظ الإعدادات</v-btn><v-btn variant="outlined" :loading="testing" :disabled="busy||!form.search_key_configured||dirty" @click="testConnection">اختبار اتصال البحث</v-btn><v-btn variant="text" :disabled="busy" @click="load">إعادة تحميل المحفوظ</v-btn></div>
    <p v-if="dirty" class="text-caption mt-3">احفظ التعديلات قبل اختبار الاتصال. لا تظهر المفاتيح المحفوظة مجددًا.</p>
   </v-form>
  </v-card>
 </main>
</template>
<script setup>
import {computed,onMounted,ref,watch} from 'vue'
import {useUserStore} from '@/stores/user'
import api from '@/modules/store/api/storeClient'
const user=useUserStore(),form=ref({}),baseline=ref(''),loading=ref(false),saving=ref(false),testing=ref(false),allowed=ref(false),error=ref(''),message=ref(''),errors=ref({})
let generation=0
const busy=computed(()=>loading.value||saving.value||testing.value),dirty=computed(()=>JSON.stringify(form.value)!==baseline.value),valid=computed(()=>Number.isInteger(Number(form.value.daily_limit))&&Number(form.value.daily_limit)>=0&&Number(form.value.daily_limit)<=3000&&(!form.value.enabled||!form.value.clear_search_key&&(form.value.search_key||form.value.search_key_configured)))
function accept(data){form.value={...data,search_key:'',map_key:'',clear_search_key:false,clear_map_key:false};baseline.value=JSON.stringify(form.value)}
const options={handleErrorsLocally:true}
async function load(){const id=++generation;loading.value=true;allowed.value=false;error.value='';message.value='';try{const r=await api.get('/admin/store/maps',options);if(id!==generation)return;accept(r.data.data);allowed.value=true}catch(e){if(id===generation)error.value=e.response?.status===403?'تحتاج صلاحية إدارة الخرائط ضمن إدارة المنصة.':'تعذر تحميل الإعدادات. أعد المحاولة.'}finally{if(id===generation)loading.value=false}}
async function save(){if(!valid.value||busy.value)return;const id=++generation;saving.value=true;error.value='';message.value='';errors.value={};const {enabled,daily_limit,revision,search_key,map_key,clear_search_key,clear_map_key}=form.value;try{const r=await api.patch('/admin/store/maps',{enabled,daily_limit:Number(daily_limit),revision,search_key:search_key||null,map_key:map_key||null,clear_search_key,clear_map_key},options);if(id!==generation)return;accept(r.data.data);message.value='حُفظت إعدادات الخرائط.'}catch(e){if(id===generation){errors.value=e.response?.data?.errors||{};error.value=e.response?.status===409?'تغيرت الإعدادات. احتفظ بمسودتك وراجع المحفوظ قبل إعادة المحاولة.':'تعذر الحفظ. راجع الحقول والصلاحية وأعد المحاولة.';if(e.response?.status===403)allowed.value=false}}finally{saving.value=false}}
async function testConnection(){if(busy.value||dirty.value)return;const id=++generation;testing.value=true;error.value='';message.value='';try{const r=await api.post('/admin/store/maps/test',{},options);if(id===generation)message.value=r.data.message}catch(e){if(id===generation)error.value=e.response?.data?.message||'تعذر اختبار الاتصال.'}finally{testing.value=false}}
watch(()=>user.currentUser?.active_company_id,()=>{generation++;form.value={};load()});onMounted(load)
</script>
<style scoped>.map-settings{max-width:900px;margin:auto}.map-settings .actions{display:flex;gap:12px;flex-wrap:wrap}.map-settings summary{cursor:pointer;min-height:44px;display:flex;align-items:center}.map-settings :deep(.v-btn){min-height:44px}@media(max-width:600px){.map-settings .actions>*{width:100%}}</style>
