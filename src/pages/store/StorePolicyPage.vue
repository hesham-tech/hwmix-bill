<template>
  <div dir="rtl" class="store-policy-page">
    <StoreNavbar />
    <v-container style="max-width:900px" class="py-8">
      <v-btn to="/store" variant="text" class="mb-4">العودة إلى المتجر</v-btn>
      <v-progress-linear v-if="loading" indeterminate />
      <v-alert v-else-if="error" type="error"><p>{{ error }}</p><v-btn variant="text" @click="load">إعادة المحاولة</v-btn></v-alert>
      <article v-else v-html="safeHtml(document?.content)" />
      <p class="mt-6">للدعم: <a href="mailto:support@hwnix.com">support@hwnix.com</a></p>
      <p>قراءة المستند لا تسجل موافقة على الشراء؛ تؤخذ الموافقة عند التسجيل أو إتمام الطلب.</p>
    </v-container>
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import StoreNavbar from '@/modules/store/components/StoreNavbar.vue'
import { storeOrdersApi } from '@/modules/store/api/storeOrders.api'
import { storePayload } from '@/modules/store/utils/checkoutSession'
import { safeHtml } from '@/utils/safeHtml'
const route=useRoute(),loading=ref(true),error=ref(''),document=ref(null)
let generation=0
async function load(){const current=++generation;loading.value=true;error.value='';try{const config=storePayload(await storeOrdersApi.configuration());const entry=config.legal_documents?.find(d=>d.key===route.params.key);if(!entry)throw Error('غير منشور');const data=storePayload(await storeOrdersApi.legal(entry.version_id));if(current===generation)document.value=data}catch{if(current===generation)error.value='هذه السياسة غير منشورة حاليًا؛ يمكنك التواصل مع الدعم.'}finally{if(current===generation)loading.value=false}}
watch(()=>route.params.key,load,{immediate:true})
</script>
<style scoped>
.store-policy-page{padding-bottom:calc(var(--store-bottom-height,66px) + env(safe-area-inset-bottom,0px) + 20px)}
article{line-height:1.9;overflow-wrap:anywhere}article :deep(h1),article :deep(h2){margin-block:1.25rem .6rem}
</style>
