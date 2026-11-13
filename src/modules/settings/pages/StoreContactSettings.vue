<template>
  <div class="store-contact-settings" dir="rtl">
    <h1 class="text-h4 mb-3">بيانات تواصل المتجر</h1>
    <p class="mb-5">تظهر هذه البيانات لجميع زوار المتجر. هي بيانات عامة للمنصة، ولا تتغير عند تعديل شركة أو التبديل بين الشركات.</p>
    <v-progress-linear v-if="loading" indeterminate aria-label="تحميل بيانات التواصل" />
    <v-alert v-if="error" type="error" variant="tonal" class="mb-4" role="alert">{{ error }}<v-btn v-if="!busy" variant="text" @click="load">إعادة المحاولة</v-btn></v-alert>
    <v-alert v-if="success" type="success" variant="tonal" class="mb-4" role="status">{{ success }}</v-alert>
    <v-row v-if="allowed&&!loading">
      <v-col cols="12" md="7"><v-card class="pa-5" rounded="xl">
        <v-form @submit.prevent="save">
          <v-text-field v-model="form.email" label="البريد الإلكتروني العام" aria-label="البريد الإلكتروني العام" type="email" maxlength="254" autocomplete="email" required :error-messages="errors.email" :disabled="busy" />
          <v-text-field v-model="form.phone" label="رقم هاتف التواصل العام" aria-label="رقم هاتف التواصل العام" maxlength="30" hint="اكتب الرقم المحلي أو الدولي، مثل 01012345678 أو +201012345678" persistent-hint inputmode="tel" autocomplete="tel" required :error-messages="errors.phone" :disabled="busy" />
          <v-textarea v-model="form.address" label="العنوان الظاهر للجمهور" aria-label="العنوان الظاهر للجمهور" rows="3" maxlength="500" required :error-messages="errors.address" :disabled="busy" />
          <p class="text-caption mb-4">تعديل العنوان هنا لا يغير عنوان مخزن أو نقطة استلام الشحنات، والبريد هنا عنوان للتواصل وليس إعداد إرسال البريد.</p>
          <p v-if="!valid" class="text-error mb-3" role="status">أكمل بريدًا صحيحًا ورقم هاتف وعنوانًا قبل الحفظ.</p>
          <v-btn type="submit" color="primary" :loading="busy" :disabled="!valid">حفظ بيانات التواصل</v-btn>
        </v-form>
      </v-card></v-col>
      <v-col cols="12" md="5"><v-card class="pa-5" rounded="xl" variant="tonal">
        <h2 class="text-h6 mb-3">معاينة قبل الحفظ</h2>
        <address class="contact-preview"><p>البريد: <bdi>{{ form.email||'—' }}</bdi></p><p>الهاتف: <bdi>{{ form.phone||'—' }}</bdi></p><p>العنوان: {{ form.address||'—' }}</p></address>
        <p class="mt-4 text-caption">لا تظهر التعديلات للزوار قبل نجاح الحفظ.</p>
      </v-card></v-col>
    </v-row>
  </div>
</template>
<script setup>
import {computed,onMounted,ref,watch} from 'vue'
import {useUserStore} from '@/stores/user'
import api from '@/modules/store/api/storeClient'
import {contactFields,usePublicContactStore} from '@/modules/store/stores/publicContact'
const user=useUserStore(),store=usePublicContactStore(),form=ref({email:'',phone:'',address:''})
const loading=ref(false),busy=ref(false),allowed=ref(false),error=ref(''),success=ref(''),errors=ref({})
const valid=computed(()=>!!contactFields(form.value))
let requestGeneration=0
async function load(){
  const request=++requestGeneration;loading.value=true;allowed.value=false;error.value='';success.value='';errors.value={}
  try{const response=await api.get('/admin/store/contact');if(request!==requestGeneration)return;form.value={...store.accept(response.data.data)};allowed.value=true}
  catch(e){if(request===requestGeneration)error.value=e.response?.status===403?'هذه الصفحة تحتاج صلاحية تعديل بيانات تواصل المتجر ضمن إدارة المنصة.': 'تعذر تحميل بيانات التواصل. أعد المحاولة.'}
  finally{if(request===requestGeneration)loading.value=false}
}
async function save(){
  if(busy.value||!allowed.value||!valid.value)return
  const request=++requestGeneration;busy.value=true;error.value='';success.value='';errors.value={}
  try{const response=await api.patch('/admin/store/contact',contactFields(form.value));if(request!==requestGeneration)return;form.value={...store.accept(response.data.data)};success.value='حُفظت بيانات التواصل، وستظهر في المتجر.'}
  catch(e){if(request===requestGeneration){errors.value=e.response?.data?.errors||{};error.value=e.response?.status===403?'لم تعد لديك صلاحية تعديل بيانات التواصل.':'تعذر الحفظ؛ لم تتغير البيانات المنشورة. راجع الحقول وأعد المحاولة.';if(e.response?.status===403)allowed.value=false}}
  finally{busy.value=false}
}
watch(()=>user.currentUser?.active_company_id,()=>{requestGeneration++;form.value={email:'',phone:'',address:''};load()})
onMounted(load)
</script>
<style scoped>.store-contact-settings{max-width:1100px;margin:auto}.store-contact-settings :deep(.v-btn){min-height:44px}.contact-preview{font-style:normal;line-height:2}.contact-preview p{overflow-wrap:anywhere}</style>
