<template>
  <div dir="rtl" class="vendor-store">
    <div class="d-flex flex-wrap ga-3 align-center mb-5"><h1 class="text-h4">متجر شركتي</h1><v-spacer/><v-btn :loading="busy" @click="load">تحديث</v-btn><v-btn to="/store" variant="outlined">عرض المتجر</v-btn></div>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    <StoreNotificationsPanel v-if="canOrders" scope="vendor"/>
    <v-tabs v-model="tab" class="mb-4"><v-tab v-if="canOrders" value="orders">طلبات الشركة</v-tab><v-tab v-if="canFinance" value="finance">الرصيد والسحب</v-tab></v-tabs>
    <template v-if="tab === 'orders' && canOrders">
      <v-alert v-if="!busy && !orders.length" type="info">لا توجد طلبات للشركة الحالية.</v-alert>
      <v-card v-for="order in orders" :key="order.id" class="pa-5 mb-4">
        <div class="d-flex flex-wrap ga-3 align-center"><strong>{{ order.sub_order_number }}</strong><v-chip>{{ statusName(order.status) }}</v-chip><v-spacer/><v-btn @click="show(order.id)">التفاصيل</v-btn></div>
        <p class="mt-3">{{ order.items?.map(item => item.product?.name + ' × ' + item.quantity).join('، ') }}</p>
        <div v-if="canManageOrders" class="d-flex flex-wrap ga-3 mt-4">
          <v-btn v-if="order.status === 'confirmed'" color="primary" :disabled="busy" @click="change(order, 'processing')">تجهيز الطلب جاهز للاستلام</v-btn>
          <v-btn v-if="['pending','confirmed'].includes(order.status)" color="error" variant="outlined" :disabled="busy" @click="cancelTarget = order; cancelReason = ''">تعذر توفير الطلب</v-btn>
        </div>
      </v-card>
      <v-pagination v-if="lastPage > 1" v-model="page" :length="lastPage" :disabled="busy" aria-label="صفحات طلبات الشركة" @update:model-value="load"/>
    </template>
    <template v-if="tab === 'finance' && financial">
      <v-alert v-if="financial.policy_review_required" type="warning" class="mb-4">تحتاج سياسة الشركة مراجعة الإدارة بعد تغيير الباقة.</v-alert>
      <v-row><v-col v-for="balance in balances" :key="balance.key" cols="12" sm="6" lg="3"><v-card class="pa-4"><p>{{ balance.label }}</p><strong>{{ money(financial.account[balance.key]) }}</strong></v-card></v-col></v-row>
      <v-card class="pa-5 my-5"><h2 class="text-h6">المتاح للسحب: {{ money(financial.available_for_payout_minor) }}</h2>
        <p class="my-3">الرصيد المسبق وحد الائتمان ليسا أموالًا قابلة للسحب. السالب مديونية للشركة؛ تواصل مع الإدارة لتوثيق سدادها بتحويل فعلي.</p>
        <p v-if="!financial.destination_configured">يجب اعتماد حساب استلام الشركة لدى الإدارة أولًا.</p>
        <v-form v-if="canRequestPayout" @submit.prevent="requestPayout"><v-text-field v-model="payout.amount" label="مبلغ السحب بالجنيه" aria-label="مبلغ السحب بالجنيه" type="number" min="0.01" step="0.01"/><v-btn type="submit" color="primary" :loading="busy" :disabled="!financial.destination_configured || financial.available_for_payout_minor <= 0">طلب الصرف للحساب المعتمد</v-btn></v-form>
      </v-card>
      <h2 class="text-h6 mb-3">طلبات الصرف</h2><v-table><thead><tr><th>الطلب</th><th>المبلغ</th><th>الحالة</th><th>المرجع</th></tr></thead><tbody><tr v-for="entry in financial.payouts" :key="entry.id"><td>#{{ entry.id }}</td><td>{{ money(entry.amount_minor) }}</td><td>{{ statusName(entry.status) }}</td><td>{{ entry.provider_reference || '—' }}</td></tr></tbody></v-table>
      <h2 class="text-h6 my-4">كشف الحساب</h2><v-table><thead><tr><th>التاريخ</th><th>النوع</th><th>الوعاء</th><th>الحركة</th><th>الرصيد بعدها</th></tr></thead><tbody><tr v-for="entry in financial.ledger.data" :key="entry.id"><td>{{ entry.created_at }}</td><td>{{ entry.kind }}</td><td>{{ bucketName(entry.bucket) }}</td><td>{{ money(entry.amount_minor) }}</td><td>{{ money(entry.balance_after_minor) }}</td></tr></tbody></v-table>
      <v-pagination v-if="financial.ledger.last_page > 1" v-model="page" :length="financial.ledger.last_page" @update:model-value="load" aria-label="صفحات كشف حساب المتجر"/>
    </template>
    <v-dialog :model-value="!!selected" max-width="760" @update:model-value="selected = null"><v-card v-if="selected" title="تفاصيل طلب الشركة"><v-card-text><p v-if="selected.customer">{{ selected.customer.name }} — {{ selected.customer.phone }}</p><dl v-if="selected.order?.shipping_address"><template v-for="(value,key) in selected.order?.shipping_address" :key="key"><dt>{{ addressNames[key] || key }}</dt><dd>{{ value }}</dd></template></dl><v-list><v-list-item v-for="item in selected.items" :key="item.id" :title="item.product?.name" :subtitle="'الكمية: ' + item.quantity"/></v-list><p v-if="selected.shipment">تتبع الشحنة: {{ selected.shipment.tracking_number || 'لم يصدر بعد' }}</p></v-card-text><v-card-actions><v-btn @click="selected = null">إغلاق</v-btn></v-card-actions></v-card></v-dialog>
    <v-dialog :model-value="!!cancelTarget" max-width="520" @update:model-value="cancelTarget = null"><v-card title="تعذر توفير الطلب"><v-card-text><p>سيطبق النظام سياسة الإلغاء ويعيد الأموال المحصلة وفق جهة الدفع.</p><v-textarea v-model="cancelReason" label="سبب عدم التوفير" aria-label="سبب عدم التوفير" maxlength="300"/></v-card-text><v-card-actions><v-btn @click="cancelTarget = null">تراجع</v-btn><v-btn color="error" :disabled="!cancelReason.trim() || busy" @click="change(cancelTarget,'cancelled')">تأكيد عدم التوفير</v-btn></v-card-actions></v-card></v-dialog>
  </div>
</template>
<script setup>
import { computed,onMounted,ref,watch } from 'vue'
import StoreNotificationsPanel from '@/modules/store/components/StoreNotificationsPanel.vue'
import api from '@/modules/store/api/storeClient'
import { storePayload } from '@/modules/store/utils/checkoutSession'
import { useUserStore } from '@/stores/user'
import { PERMISSIONS } from '@/config/permissions'
const user=useUserStore(),busy=ref(false),error=ref(''),tab=ref('orders'),orders=ref([]),financial=ref(null),page=ref(1),lastPage=ref(1),selected=ref(null),cancelTarget=ref(null),cancelReason=ref('')
const payout=ref({amount:'',operation_key:crypto.randomUUID()})
const canOrders=computed(()=>user.hasPermission(PERMISSIONS.STORE_VENDOR_ORDERS_VIEW)),canFinance=computed(()=>user.hasPermission(PERMISSIONS.STORE_VENDOR_FINANCE_VIEW)),canManageOrders=computed(()=>user.hasPermission(PERMISSIONS.STORE_VENDOR_ORDERS_MANAGE)),canRequestPayout=computed(()=>user.hasPermission(PERMISSIONS.STORE_VENDOR_FINANCE_MANAGE))
const balances=[{key:'balance_minor',label:'الرصيد الحالي'},{key:'pending_minor',label:'إيرادات معلقة'},{key:'prepaid_minor',label:'رصيد مسبق للعمولات'},{key:'payout_held_minor',label:'محجوز للصرف'}]
const addressNames={recipient_name:'المستلم',phone:'الهاتف',governorate_code:'المحافظة',city:'المدينة',district:'الحي',street:'العنوان',building:'المبنى',floor:'الطابق',apartment:'الوحدة'}
const statusNames={pending:'بانتظار التأكيد',confirmed:'مؤكد',processing:'جاهز للاستلام',shipped:'مع شركة الشحن',delivered:'تم التسليم',cancelled:'ملغي',requested:'بانتظار الاعتماد',approved:'معتمد',paid:'تم التحويل',rejected:'مرفوض'}
const statusName=value=>statusNames[value]||value
const bucketName=value=>({balance_minor:'الرصيد',pending_minor:'المعلق',prepaid_minor:'المسبق'}[value]||value)
const money=value=>new Intl.NumberFormat('ar-EG',{style:'currency',currency:'EGP'}).format(Number(value||0)/100)
let generation=0
async function run(task){const epoch=generation;if(busy.value)return;busy.value=true;error.value='';try{await task()}catch(e){error.value=Object.values(e.response?.data?.errors||{}).flat().join('، ')||e.response?.data?.message||'تعذر تحميل بيانات المتجر.'}finally{busy.value=false;if(epoch!==generation)load()}}
async function fetchData(){const epoch=generation;if(tab.value==='orders'&&canOrders.value){const data=storePayload(await api.get('/vendor/store/orders',{params:{page:page.value}}));if(epoch!==generation)return;orders.value=data.data||[];lastPage.value=data.meta?.last_page||data.last_page||1}else if(tab.value==='finance'&&canFinance.value){const data=storePayload(await api.get('/vendor/store/account',{params:{page:page.value}}));if(epoch===generation)financial.value=data}}
async function load(){await run(fetchData)}
async function show(id){await run(async()=>{selected.value=storePayload(await api.get('/vendor/store/orders/'+id))})}
async function change(order,status){await run(async()=>{await api.patch('/vendor/store/orders/'+order.id+'/status',{status,reason:cancelReason.value});cancelTarget.value=null;await fetchData()})}
async function requestPayout(){await run(async()=>{await api.post('/vendor/store/payouts',payout.value);payout.value={amount:'',operation_key:crypto.randomUUID()};await fetchData()})}
watch(tab,()=>{generation++;page.value=1;load()})
watch(()=>user.currentUser?.active_company_id,()=>{generation++;orders.value=[];financial.value=null;selected.value=null;cancelTarget.value=null;page.value=1;load()})
onMounted(()=>{if(!canOrders.value)tab.value='finance';load()})
</script>
<style scoped>.vendor-store{max-width:1400px;margin:auto}.vendor-store :deep(td){white-space:normal;min-width:95px}dl{display:grid;grid-template-columns:100px 1fr;gap:8px}dd{overflow-wrap:anywhere}</style>
