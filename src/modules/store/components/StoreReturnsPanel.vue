<template>
  <v-card rounded="xl" class="pa-5 mb-4" v-if="items.length || returns.length">
    <div class="d-flex align-center flex-wrap ga-3"><h2 class="text-h6">الإرجاع والمتابعة</h2><v-spacer/><v-btn variant="text" :loading="loading" @click="load">تحديث المرتجعات</v-btn><v-btn v-if="items.length" variant="outlined" @click="open">طلب إرجاع منتج</v-btn></div>
    <v-alert v-if="error" type="error" class="my-3">{{ error }}</v-alert>
    <v-list v-if="returns.length"><v-list-item v-for="entry in returns" :key="entry.id" :title="`مرتجع #${entry.id} — ${statuses[entry.status] || 'قيد المراجعة'}`"><p>الكمية: {{ entry.quantity }} — {{ money(entry.refund_minor) }}</p><p>مصاريف الشحن العكسي: {{ entry.shipping_payer === 'seller' ? 'البائع' : 'تراجع الإدارة الاستحقاق دون تحميلك نفقات تخالف القانون' }}</p></v-list-item></v-list>
    <p class="my-3">إذا تعذر تسجيل الطلب، تواصل مع <a href="mailto:support@hwnix.com">support@hwnix.com</a> واذكر رقم طلبك. مهلة العيب 30 يومًا على الأقل وتغيير الرأي 14 يومًا وفق الاستثناءات القانونية.</p>
    <p v-if="!returns.length" class="text-body-2 mt-3">لا توجد طلبات إرجاع. يُراجع كل طلب وفق سياسة المنتج المحفوظة وقت الشراء، ولا يعني تقديمه اكتمال الاسترداد.</p>
    <v-dialog v-model="dialog" max-width="560"><v-card title="طلب إرجاع منتج"><v-card-text><v-form id="return-form" @submit.prevent="submit"><v-select v-model="form.item_id" :items="items" item-title="title" item-value="id" label="المنتج المستلم" aria-label="المنتج المستلم" required /><v-text-field v-model.number="form.quantity" type="number" min="1" :max="selected?.quantity || 1" label="الكمية" aria-label="كمية الإرجاع" required /><v-select v-model="form.reason" :items="reasons" label="سبب الإرجاع" aria-label="سبب الإرجاع" required /><v-textarea v-model="form.notes" label="تفاصيل المشكلة" maxlength="2000" /><v-alert type="info" variant="tonal">سيُراجع البائع والإدارة الطلب، ثم يُرتب استلام المرتجع وفحصه. لا تُرسل المنتج قبل اعتماد طريقة الإرجاع.</v-alert><v-alert v-if="submitError" type="error" class="mt-3">{{ submitError }}</v-alert></v-form></v-card-text><v-card-actions><v-btn @click="dialog = false">إلغاء</v-btn><v-btn type="submit" form="return-form" :loading="sending" :disabled="!selected || !form.reason" color="primary">إرسال طلب الإرجاع</v-btn></v-card-actions></v-card></v-dialog>
  </v-card>
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { storeOrdersApi } from '../api/storeOrders.api'
import { storePayload } from '../utils/checkoutSession'
import { parseApiError } from '@/utils/errorParser'
const props=defineProps({order:{type:Object,required:true}})
const returns=ref([]),loading=ref(false),error=ref(''),dialog=ref(false),sending=ref(false),submitError=ref(''),form=ref({})
const statuses={requested:'بانتظار المراجعة',approved:'معتمد — بانتظار الاستلام',received:'تم الفحص — الاسترداد قيد التنفيذ',completed:'اكتمل الاسترداد',rejected:'لم يُعتمد الإرجاع',cancelled:'ملغى'}
const items=computed(()=>(props.order.sub_orders||[]).filter(sub=>sub.status==='delivered').flatMap(sub=>(sub.items||[]).map(item=>({id:item.id,title:item.product?.name+' — '+(item.variant?.sku||''),quantity:Math.max(0,Number(item.quantity)-returns.value.filter(entry=>entry.store_order_item_id===item.id&&!['rejected','cancelled'].includes(entry.status)).reduce((sum,entry)=>sum+Number(entry.quantity),0)),policy:item.return_policy||{}}))).filter(item=>item.quantity>0))
const selected=computed(()=>items.value.find(item=>item.id===form.value.item_id))
const reasons=computed(()=>[{title:'عيب بالمنتج',value:'defect',enabled:selected.value?.policy.allow_defect},{title:'استلام منتج مختلف',value:'wrong_item',enabled:selected.value?.policy.allow_defect},{title:'تغيير الرأي وفق السياسة',value:'change_of_mind',enabled:selected.value?.policy.allow_change_of_mind}].filter(reason=>reason.enabled))
const money=n=>new Intl.NumberFormat('ar-EG',{style:'currency',currency:props.order.currency||'EGP'}).format(Number(n)/100)
function open(){form.value={item_id:items.value[0]?.id,quantity:1,reason:null,notes:'',operation_key:crypto.randomUUID()};submitError.value='';dialog.value=true}
async function load(){if(loading.value)return;loading.value=true;error.value='';try{returns.value=storePayload(await storeOrdersApi.returns(props.order.order_number))||[]}catch(e){error.value=parseApiError(e,'تعذر تحميل المرتجعات')}finally{loading.value=false}}
async function submit(){if(sending.value)return;sending.value=true;submitError.value='';try{await storeOrdersApi.requestReturn(props.order.order_number,form.value);dialog.value=false;await load()}catch(e){submitError.value=parseApiError(e,'تعذر تسجيل الإرجاع؛ يمكنك إعادة المحاولة')}finally{sending.value=false}}
watch(()=>props.order.order_number,load);watch(()=>form.value.item_id,()=>{form.value.reason=null});onMounted(load)
</script>
