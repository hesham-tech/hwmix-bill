<template>
  <v-expansion-panels class="mb-5">
    <v-expansion-panel><v-expansion-panel-title>إشعارات المتجر <v-chip v-if="unread" color="primary" size="small" class="ms-3">{{ unread }} غير مقروء</v-chip></v-expansion-panel-title>
      <v-expansion-panel-text>
        <v-btn :loading="loading" variant="text" @click="load">تحديث الإشعارات</v-btn>
        <v-alert v-if="error" type="error" variant="tonal">{{ error }}</v-alert>
        <p v-if="!loading && !error && !rows.length">لا توجد إشعارات.</p>
        <v-list><v-list-item v-for="entry in rows" :key="entry.id" :title="entry.title" :subtitle="entry.message"><template #append><div class="d-flex flex-wrap ga-2"><v-btn v-if="scope === 'customer' && entry.store_order_id" variant="text" :to="{name:'store-order-confirmation',params:{id:entry.store_order_id}}">تفاصيل الطلب</v-btn><v-btn v-if="!entry.read_at" variant="tonal" :disabled="loading" @click="read(entry.id)">تمت القراءة</v-btn></div></template></v-list-item></v-list>
        <v-pagination v-if="lastPage > 1" v-model="page" :length="lastPage" :disabled="loading" aria-label="صفحات إشعارات المتجر" @update:model-value="load"/>
      </v-expansion-panel-text>
    </v-expansion-panel>
  </v-expansion-panels>
</template>
<script setup>
import {computed,onMounted,onUnmounted,ref,watch} from 'vue'
import api from '@/modules/store/api/storeClient'
import {storePayload} from '@/modules/store/utils/checkoutSession'
import {useUserStore} from '@/stores/user'
const props=defineProps({scope:{type:String,default:'customer'}})
const user=useUserStore(),rows=ref([]),unread=ref(0),page=ref(1),lastPage=ref(1),loading=ref(false),error=ref('')
const endpoint=computed(()=>({customer:'/store/account/notifications',vendor:'/vendor/store/notifications',admin:'/admin/store/notifications'}[props.scope]))
let generation=0,disposed=false
async function load(){const epoch=generation;loading.value=true;error.value='';try{const data=storePayload(await api.get(endpoint.value,{params:{page:page.value}}));if(disposed||epoch!==generation)return;rows.value=data.notifications?.data||[];unread.value=data.unread_count||0;lastPage.value=data.notifications?.last_page||1}catch(e){if(epoch===generation)error.value=e.response?.data?.message||'تعذر تحميل الإشعارات.'}finally{if(epoch===generation)loading.value=false}}
async function read(id){loading.value=true;try{await api.post(endpoint.value+'/'+id+'/read');await load()}catch(e){error.value=e.response?.data?.message||'تعذر تحديث الإشعار.'}finally{loading.value=false}}
watch(()=>user.currentUser?.active_company_id,()=>{generation++;rows.value=[];unread.value=0;page.value=1;load()})
onMounted(load);onUnmounted(()=>{disposed=true;generation++})
</script>
