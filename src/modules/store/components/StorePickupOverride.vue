<template>
  <section v-if="order.pickup && allowed" class="my-3">
    <p class="text-body-2">استلام من مخزن #{{ order.pickup.warehouse_id }}: {{ order.pickup.current?.street }}<span v-if="order.pickup.current?.latitude!=null"> — {{ order.pickup.current.latitude }}، {{ order.pickup.current.longitude }}</span></p>
    <p v-if="order.pickup.override" class="text-caption">عُدلت نقطة هذا الطلب فقط: {{ order.pickup.override.reason }}</p>
    <v-btn v-if="order.pickup.can_override" variant="outlined" @click="open">تعديل نقطة استلام هذا الطلب</v-btn>
    <v-dialog v-model="dialog" max-width="720" scrollable><v-card title="تعديل عنوان ونقطة الاستلام"><v-card-text>
      <p>المخزن والمخزون وطريقة التوصيل والسعر ثابتة. يؤثر التعديل على مكان الاستلام لهذا الطلب فقط، ويسجل باسم الموظف وسببه.</p>
      <v-alert v-if="error" type="error" class="my-3">{{ error }}</v-alert>
      <v-text-field v-for="field in fields" :key="field.key" v-model="address[field.key]" :label="field.label" :aria-label="field.label" />
      <v-select v-model="address.governorate_code" :items="governorates" item-title="name" item-value="id" label="محافظة الاستلام" aria-label="محافظة الاستلام" />
      <StoreLocationPicker v-model="address" label="نقطة استلام هذا الطلب" required />
      <v-textarea v-model="reason" label="سبب تعديل الاستلام" aria-label="سبب تعديل الاستلام" maxlength="500" />
      <v-checkbox v-model="confirmed" label="أؤكد تعديل مكان الاستلام فقط لهذا الطلب" aria-label="أؤكد تعديل مكان الاستلام فقط لهذا الطلب" />
    </v-card-text><v-card-actions><v-btn @click="dialog=false">إلغاء</v-btn><v-btn :loading="busy" :disabled="!confirmed || !address.location_confirmed || !reason.trim()" color="primary" @click="save">حفظ نقطة استلام الطلب</v-btn></v-card-actions></v-card></v-dialog>
  </section>
</template>
<script setup>
import {computed,ref} from 'vue'
import {useUserStore} from '@/stores/user'
import api from '../api/storeClient'
import {storeOrdersApi} from '../api/storeOrders.api'
import {storePayload} from '../utils/checkoutSession'
import StoreLocationPicker from './StoreLocationPicker.vue'
const props=defineProps({order:{type:Object,required:true},admin:Boolean}),emit=defineEmits(['changed'])
const user=useUserStore(),dialog=ref(false),address=ref({}),reason=ref(''),confirmed=ref(false),busy=ref(false),error=ref(''),governorates=ref([])
const allowed=computed(()=>user.hasPermission(props.admin?'store.orders.manage':'store.vendor.delivery.pickup'))
const fields=[{key:'recipient_name',label:'اسم مسؤول الاستلام'},{key:'phone',label:'هاتف الاستلام للطلب'},{key:'street',label:'عنوان الاستلام للطلب'},{key:'city',label:'مدينة الاستلام'}]
async function open(){address.value={...props.order.pickup.current};reason.value='';confirmed.value=false;error.value='';dialog.value=true;try{governorates.value=storePayload(await storeOrdersApi.configuration())?.governorates||[]}catch{error.value='تعذر تحميل المحافظات. أغلق النافذة وأعد المحاولة.'}}
async function save(){if(busy.value)return;busy.value=true;error.value='';try{await api.patch((props.admin?'/admin/store/sub-orders/':'/vendor/store/orders/')+props.order.id+'/pickup',{address:address.value,reason:reason.value,confirmed:true});dialog.value=false;emit('changed')}catch(e){error.value=Object.values(e.response?.data?.errors||{}).flat().join('، ')||e.response?.data?.message||'تعذر تعديل نقطة الاستلام'}finally{busy.value=false}}
</script>
