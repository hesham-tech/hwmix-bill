<template>
  <section v-if="order.delivery_method==='seller_local'" class="mt-4 pa-3 border rounded-lg">
    <h3 class="text-subtitle-1">توصيل البائع — {{ labels[order.status] || order.status }}</h3>
    <p v-if="error" role="alert" class="text-error my-2">{{ error }}</p>
    <template v-if="['processing','shipped','delivered'].includes(order.status)">
      <v-text-field v-if="order.status!=='delivered' || !order.financial?.collected_at" v-model="reference" label="مرجع التوصيل أو التحصيل" aria-label="مرجع التوصيل أو التحصيل" maxlength="150" />
      <v-checkbox v-model="confirmed" label="تحققت من الإجراء الفعلي وأؤكد تسجيله" aria-label="تحققت من الإجراء الفعلي وأؤكد تسجيله" />
      <div class="d-flex flex-wrap ga-2">
        <v-btn v-if="canManage && order.status==='processing'" :disabled="!confirmed || !reference.trim()" :loading="busy" @click="act('dispatch')">خرج للتوصيل الذاتي</v-btn>
        <v-btn v-if="canManage && order.status==='shipped'" :disabled="!confirmed" :loading="busy" @click="act('delivered')">تأكيد تسليم التوصيل الذاتي</v-btn>
        <v-btn v-if="canCollect && order.status==='delivered' && order.order?.payment_method==='cod' && !order.financial?.collected_at" :disabled="!confirmed || !reference.trim()" :loading="busy" @click="act('collect')">توثيق تحصيل التوصيل الذاتي</v-btn>
      </div>
      <v-expansion-panels v-if="canManage && order.status==='shipped'" class="mt-3"><v-expansion-panel title="رجوع دون تسليم"><v-expansion-panel-text><v-select v-model="condition" :items="[{title:'صالح لإعادة البيع',value:'saleable'},{title:'تالف',value:'damaged'}]" label="حالة المنتج الراجع" /><v-select v-model="reason" :items="[{title:'رفض العميل',value:'customer_refused'},{title:'تعذر الوصول',value:'unreachable'},{title:'خطأ البائع',value:'seller_error'},{title:'سبب آخر',value:'other'}]" label="سبب الرجوع" /><p>يلزم استلام المنتج وفحصه فعلًا؛ لا تسجل تكلفة لناقل خارجي.</p><v-btn class="mt-3" :disabled="!confirmed || !reference.trim()" :loading="busy" @click="act('return_to_origin')">توثيق رجوع التوصيل الذاتي</v-btn></v-expansion-panel-text></v-expansion-panel></v-expansion-panels>
    </template>
  </section>
</template>
<script setup>
import {computed,ref} from 'vue'
import {useUserStore} from '@/stores/user'
import api from '../api/storeClient'
const props=defineProps({order:{type:Object,required:true},admin:Boolean}),emit=defineEmits(['changed'])
const user=useUserStore(),confirmed=ref(false),reference=ref(''),busy=ref(false),error=ref(''),condition=ref('saleable'),reason=ref('customer_refused')
const canManage=computed(()=>user.hasPermission(props.admin?'store.orders.manage':'store.vendor.delivery.manage'))
const canCollect=computed(()=>user.hasPermission(props.admin?'store.finance.manage':'store.vendor.delivery.collect'))
const labels={processing:'جاهز للتوصيل',shipped:'خرج للتوصيل',delivered:'تم التسليم',cancelled:'ملغي'}
async function act(action){if(busy.value||!confirmed.value)return;busy.value=true;error.value='';try{await api.post((props.admin?'/admin/store':'/vendor/store')+'/deliveries/'+props.order.id+'/'+action,{confirmed:true,reference:reference.value,condition:condition.value,reason:reason.value});confirmed.value=false;reference.value='';emit('changed')}catch(e){error.value=Object.values(e.response?.data?.errors||{}).flat().join('، ')||e.response?.data?.message||'تعذر تسجيل إجراء التوصيل'}finally{busy.value=false}}
</script>
