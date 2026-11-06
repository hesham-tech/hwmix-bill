<template>
  <v-card class="pa-5">
    <div class="d-flex ga-3 align-center mb-3"><h2 class="text-h6">مطابقة محاولات الدفع</h2><v-spacer/><v-btn :loading="busy" @click="load">تحديث المدفوعات</v-btn></div>
    <v-alert type="info" class="mb-4">التحقق يستعلم من المزود باستخدام إعدادات المحاولة الأصلية. لا تسجل نجاح الدفع اعتمادًا على صورة إيصال أو رجوع المتصفح.</v-alert>
    <v-alert v-if="error" type="error" class="mb-3">{{ error }}</v-alert><v-alert v-if="message" type="success" class="mb-3">{{ message }}</v-alert>
    <v-table><thead><tr><th>التسوية</th><th>المحاولة / الطلب</th><th>المبلغ</th><th>المزود والحالة</th><th>مرجع الجلسة أو الطلب</th><th>مرجع التحصيل إن وجد</th><th>التحقق</th></tr></thead>
      <tbody><tr v-for="payment in rows" :key="payment.id"><td><v-checkbox v-model="selected" :value="payment.id" :disabled="!payment.unsettled_minor" :aria-label="'اختيار محاولة ' + payment.id" hide-details/><small>{{ money(payment.unsettled_minor) }} غير مسوى</small></td><td>#{{ payment.id }} / #{{ payment.payable_id }}</td><td>{{ payment.amount }} {{ payment.currency }}</td><td>{{ payment.gateway_driver }} — {{ names[payment.status] || payment.status }}</td><td><v-text-field v-model="references[payment.id]" :placeholder="payment.gateway_reference || 'مرجع المزود'" :aria-label="'مرجع المزود للمحاولة ' + payment.id" hide-details/></td><td><v-text-field v-model="captures[payment.id]" :placeholder="payment.gateway_payment_reference || 'اختياري'" :aria-label="'مرجع التحصيل للمحاولة ' + payment.id" hide-details/></td><td><v-btn :disabled="busy || ['refunded','partially_refunded'].includes(payment.status)" @click="verify(payment)">استعلام ومطابقة</v-btn></td></tr></tbody>
    </v-table><v-pagination v-if="lastPage > 1" v-model="page" :length="lastPage" :disabled="busy" aria-label="صفحات محاولات الدفع" @update:model-value="load"/>
    <v-divider class="my-5"/><h2 class="text-h6">توثيق دفعة تسوية من حساب البوابة</h2>
    <p class="my-3">اختر عمليات حساب مزود واحد، بما فيها الاستردادات التي خُصمت من الدفعة. غير المسوى للمحدد: {{ money(selectedTotal) }}. لا يُعد التحصيل من العميل وحده توريدًا إلى البنك.</p>
    <v-form @submit.prevent="settle"><v-row><v-col cols="12" sm="6"><v-text-field v-model="settlement.net_amount" type="number" step="0.01" label="صافي التحويل الفعلي بالجنيه (سالب عند الخصم البنكي)" aria-label="صافي تسوية البوابة"/></v-col><v-col cols="12" sm="6"><v-text-field v-model="settlement.fee" type="number" min="0" step="0.01" label="إجمالي رسوم المزود بالجنيه" aria-label="رسوم تسوية البوابة"/></v-col><v-col cols="12" sm="6"><v-text-field v-model="settlement.recoverable_tax" type="number" min="0" step="0.01" label="ضريبة رسوم قابلة للاسترداد وفق الفاتورة (اختياري)" aria-label="ضريبة رسوم البوابة"/></v-col><v-col cols="12" sm="6"><v-text-field v-model="settlement.reference" label="مرجع كشف المزود والتحويل البنكي الكامل" aria-label="مرجع تسوية البوابة"/></v-col></v-row><v-checkbox v-model="settlement.confirmed" label="طابقت كشف المزود وحركة البنك والرسوم والضريبة" aria-label="تأكيد مطابقة تسوية البوابة"/><v-btn type="submit" color="primary" :loading="busy" :disabled="!selected.length || !settlement.confirmed || !settlement.reference || settlement.net_amount === ''">توثيق التسوية</v-btn></v-form>
    <h3 class="text-h6 mt-6">آخر التسويات</h3><v-table><thead><tr><th>الرقم</th><th>المرجع</th><th>قبل الرسوم</th><th>الصافي</th><th>الرسوم</th></tr></thead><tbody><tr v-for="entry in history" :key="entry.id"><td>#{{ entry.id }}</td><td>{{ entry.reference }}</td><td>{{ money(entry.gross_minor) }}</td><td>{{ money(entry.net_minor) }}</td><td>{{ money(entry.fee_minor) }}</td></tr></tbody></v-table>
  </v-card>
</template>
<script setup>
import {computed,onMounted,ref} from 'vue'
import api from '@/modules/store/api/storeClient'
import {storePayload} from '@/modules/store/utils/checkoutSession'
const rows=ref([]),page=ref(1),lastPage=ref(1),busy=ref(false),error=ref(''),message=ref(''),references=ref({}),captures=ref({})
const selected=ref([]),knownAmounts=ref({}),history=ref([])
const emptySettlement=()=>({net_amount:'',fee:'0.00',recoverable_tax:'0.00',reference:'',confirmed:false,operation_key:crypto.randomUUID()})
const settlement=ref(emptySettlement())
const money=value=>new Intl.NumberFormat('ar-EG',{style:'currency',currency:'EGP'}).format(Number(value||0)/100)
const selectedTotal=computed(()=>selected.value.reduce((total,id)=>total+Number(knownAmounts.value[id]||0),0))
const names={pending:'بانتظار الدفع',initiating:'جار إنشاء الجلسة',completed:'تم التحصيل',failed:'فشل',expired:'انتهت الجلسة',cancelled:'ملغاة',reconciliation_needed:'تحتاج مطابقة',refunded:'مستردة',partially_refunded:'مستردة جزئيًا'}
async function fetchRows(){const data=storePayload(await api.get('/admin/store/payments',{params:{page:page.value}}));rows.value=data.data||[];lastPage.value=data.last_page||1;for(const row of rows.value)knownAmounts.value[row.id]=row.unsettled_minor;const recorded=storePayload(await api.get('/admin/store/gateway-settlements'));history.value=recorded?.data||[]}
async function run(task){if(busy.value)return;busy.value=true;error.value='';try{await task()}catch(e){error.value=Object.values(e.response?.data?.errors||{}).flat().join('، ')||e.response?.data?.message||'تعذرت مطابقة الدفع.'}finally{busy.value=false}}
async function load(){await run(fetchRows)}
async function verify(payment){message.value='';await run(async()=>{const data=storePayload(await api.post('/admin/store/payments/'+payment.id+'/reconcile',{reference:references.value[payment.id]||null,capture_reference:captures.value[payment.id]||null}));message.value='نتيجة المزود: '+(names[data.status]||data.status);await fetchRows()})}
async function settle(){message.value='';await run(async()=>{await api.post('/admin/store/gateway-settlements',{...settlement.value,payment_ids:selected.value});settlement.value=emptySettlement();selected.value=[];message.value='تم توثيق التسوية والرسوم.';await fetchRows()})}
onMounted(load)
</script>
