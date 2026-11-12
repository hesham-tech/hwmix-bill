<template>
  <v-card variant="outlined" class="pa-4 my-5" dir="rtl">
    <h2 class="text-h6 mb-3">التوصيل الذاتي داخل نطاق</h2>
    <v-alert v-if="error" type="error" class="mb-3">{{ error }}<v-btn variant="text" @click="load">إعادة التحميل</v-btn></v-alert>
    <v-alert v-if="saved" type="success" class="mb-3">تم حفظ إعدادات التوصيل للطلبات الجديدة.</v-alert>
    <v-progress-linear v-if="loading" indeterminate />
    <template v-if="form">
      <p>داخل النطاق يتولى البائع التوصيل. خارجه يستخدم ناقلًا مسعّرًا إن وجد، وإلا يتولى البائع التوصيل مهما كانت المسافة بالرسم المحدد هنا. الطلبات المؤكدة تحتفظ بتكلفتها وطريقتها.</p>
      <p class="my-2">مخزن التنفيذ #{{ warehouse || 'غير محدد' }} — {{ pickup.street || 'أكمل عنوان الاستلام لدى الإدارة أولًا' }}</p>
      <v-switch v-model="form.enabled" label="تفعيل التوصيل الذاتي" aria-label="تفعيل التوصيل الذاتي" />
      <template v-if="form.enabled">
        <v-text-field v-model="form.radius_km" type="number" min="0.001" max="20000" step="0.001" label="نصف قطر التوصيل بالكيلومترات" aria-label="نصف قطر التوصيل بالكيلومترات" />
        <p class="my-3">النقطة الافتراضية من المخزن: {{ location.latitude ?? "غير محددة" }}، {{ location.longitude ?? "غير محددة" }}. <router-link to="/app/warehouses">تعديل إحداثيات المخزن</router-link></p>
        <v-row><v-col cols="12" sm="6"><v-text-field v-model="form.fee" type="number" min="0" step="0.01" label="رسم التوصيل الذاتي بالجنيه" aria-label="رسم التوصيل الذاتي بالجنيه" /></v-col><v-col cols="12" sm="6"><v-text-field v-model="form.free_above" type="number" min="0" step="0.01" clearable label="توصيل مجاني من قيمة منتجات (اختياري)" aria-label="توصيل مجاني من قيمة منتجات (اختياري)" /></v-col></v-row>
        <p class="text-body-2 mb-3">حد المجانية يخص منتجات هذا البائع شامل ضريبتها وقبل التوصيل. الرسم لك ولا يمثل تكلفة شركة شحن. الحساب بنصف قطر مباشر وليس مسافة الطريق.</p>
      </template>
      <v-btn color="primary" :loading="busy" :disabled="loading || (form.enabled && !location.location_confirmed)" @click="save">حفظ التوصيل الذاتي</v-btn>
    </template>
  </v-card>
</template>
<script setup>
import {computed,onMounted,ref,watch} from 'vue'
import api from '../api/storeClient'
import {storePayload} from '../utils/checkoutSession'
const props=defineProps({companyId:{type:[Number,String],default:null}}),emit=defineEmits(['saved'])
const form=ref(null),pickup=ref({}),warehouse=ref(null),error=ref(''),loading=ref(false),busy=ref(false),saved=ref(false),location=ref({latitude:null,longitude:null,location_confirmed:false})
const endpoint=computed(()=>props.companyId?'/admin/store/sellers/'+props.companyId+'/local-delivery':'/vendor/store/local-delivery')
let generation=0
async function load(){const version=++generation;loading.value=true;error.value='';saved.value=false;try{const data=storePayload(await api.get(endpoint.value));if(version!==generation)return;const s=data.settings;pickup.value=data.pickup_address||{};warehouse.value=data.warehouse_id;form.value={enabled:!!s.enabled,radius_km:s.radius_meters!=null?String(s.radius_meters/1000):'',fee:(Number(s.fee_minor||0)/100).toFixed(2),free_above:s.free_above_minor!=null?(s.free_above_minor/100).toFixed(2):null};location.value={latitude:s.pickup_latitude,longitude:s.pickup_longitude,location_confirmed:!!s.pickup_confirmed}}catch(e){error.value=e.response?.data?.message||'تعذر تحميل إعدادات التوصيل.'}finally{if(version===generation)loading.value=false}}
async function save(){if(busy.value)return;busy.value=true;error.value='';saved.value=false;try{await api.put(endpoint.value,{...form.value,radius_km:form.value.radius_km||null,free_above:form.value.free_above===''?null:form.value.free_above});saved.value=true;emit('saved')}catch(e){error.value=Object.values(e.response?.data?.errors||{}).flat().join('، ')||e.response?.data?.message||'تعذر حفظ التوصيل.'}finally{busy.value=false}}
watch(()=>props.companyId,load);onMounted(load)
</script>
