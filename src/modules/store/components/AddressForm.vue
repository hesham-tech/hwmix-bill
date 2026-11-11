<template>
<v-form ref="form" @submit.prevent="submit"><v-row>
<v-col v-for="field in fields" :key="field.key" cols="12" sm="6"><v-text-field v-model="address[field.key]" :aria-label="field.label" :label="field.label" :rules="field.required ? [required] : []" :autocomplete="field.autocomplete || 'off'" :dir="field.key === 'phone' ? 'ltr' : undefined" /></v-col>
<v-col cols="12" sm="6"><v-select v-model="address.governorate_code" :items="governorates" item-title="name" item-value="id" aria-label="المحافظة" label="المحافظة" :rules="[required]" /></v-col>
</v-row><StoreLocationPicker v-model="address" /><v-alert v-if="error" type="error" class="mb-3">{{ error }}<v-btn variant="text" @click="loadGovernorates">إعادة المحاولة</v-btn></v-alert><v-checkbox v-model="address.is_default" aria-label="العنوان الافتراضي" label="العنوان الافتراضي" /><div class="d-flex ga-3 justify-end"><v-btn @click="$emit('cancel')">إلغاء</v-btn><v-btn type="submit" color="primary" :loading="loading" :disabled="!governorates.length">حفظ العنوان</v-btn></div></v-form>
</template>
<script setup>
import StoreLocationPicker from './StoreLocationPicker.vue'
import { onMounted, ref, watch } from 'vue'
import { storeOrdersApi } from '../api/storeOrders.api'
import { storePayload } from '../utils/checkoutSession'
const props=defineProps({initialData:{type:Object,default:()=>({})},loading:Boolean})
const emit=defineEmits(['submit','cancel'])
const form=ref(null), address=ref({}), governorates=ref([]), error=ref('')
const required=value=>!!String(value??'').trim()||'مطلوب'
const fields=[{key:'label',label:'اسم العنوان'},{key:'recipient_name',label:'اسم المستلم',required:true,autocomplete:'name'},{key:'phone',label:'الهاتف',required:true,autocomplete:'tel'},{key:'city',label:'المدينة',required:true,autocomplete:'address-level2'},{key:'street',label:'الشارع والعنوان التفصيلي',required:true,autocomplete:'street-address'},{key:'district',label:'الحي'},{key:'building',label:'المبنى'},{key:'floor',label:'الدور'},{key:'apartment',label:'الشقة'},{key:'landmark',label:'علامة مميزة'}]
watch(()=>props.initialData,value=>{address.value={label:'',recipient_name:'',phone:'',country:'EG',city:'',street:'',district:'',building:'',floor:'',apartment:'',landmark:'',governorate_code:null,is_default:false,...value}},{immediate:true})
async function loadGovernorates(){error.value='';try{governorates.value=storePayload(await storeOrdersApi.configuration())?.governorates||[]}catch{error.value='تعذر تحميل المحافظات'}}
async function submit(){if((await form.value.validate()).valid)emit('submit',{...address.value})}
onMounted(loadGovernorates)
</script>
