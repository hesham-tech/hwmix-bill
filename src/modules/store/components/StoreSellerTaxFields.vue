<template>
  <section class="my-5">
    <h2 class="text-h6 mb-3">المعالجة الضريبية للبائع</h2>
    <p class="mb-3">تضبطها الإدارة مرة واحدة؛ لا يحتاج البائع لإعدادها عند نشر كل منتج. عدم التسجيل في القيمة المضافة لا يعني إعفاءً من جميع الالتزامات الضريبية.</p>
    <v-select v-model="tax.status" :items="statuses" label="حالة القيمة المضافة للبائع" aria-label="حالة القيمة المضافة للبائع" @update:model-value="resetTreatment" />
    <template v-if="tax.status === 'registered'">
      <v-text-field v-model="tax.registration_number" label="رقم تسجيل القيمة المضافة" aria-label="رقم تسجيل القيمة المضافة" />
      <v-select v-model="tax.mode" :items="[{title:'السعر يشمل الضريبة',value:'included'},{title:'تضاف الضريبة إلى السعر',value:'exclusive'}]" label="ضريبة أسعار البائع" aria-label="ضريبة أسعار البائع" />
      <v-text-field v-model.number="tax.rate_bps" type="number" min="0" max="10000" label="معدل البائع بنقاط الأساس (100 = 1%)" aria-label="معدل البائع بنقاط الأساس (100 = 1%)" />
    </template>
    <v-alert v-else-if="tax.status !== 'unconfigured'" type="info" variant="tonal" class="mb-3">لن يضيف المتجر VAT إلى مبيعات هذا البائع وفق الحالة المسجلة. لا يعد ذلك اعتمادًا قانونيًا للإعفاء.</v-alert>
    <v-textarea v-model="tax.basis" label="أساس الحالة أو مرجع المستند أو إفادة البائع" aria-label="أساس الحالة أو مرجع المستند أو إفادة البائع" maxlength="1000" />
    <template v-if="tax.status === 'registered'">
      <h3 class="text-subtitle-1">استثناءات ضريبة الأصناف</h3>
      <p>تسري قاعدة البائع تلقائيًا. أضف فقط الأصناف ذات المعاملة المختلفة مع توثيق أساسها.</p>
      <v-card v-for="(rule,index) in tax.product_rules" :key="index" variant="outlined" class="pa-3 my-3">
        <v-select v-model="rule.product_id" :items="products" item-title="name" item-value="id" :label="`صنف الاستثناء ${index+1}`" />
        <v-select v-model="rule.treatment" :items="[{title:'خاضع بمعدل مختلف',value:'taxable'},{title:'سعر ضريبة صفر',value:'zero_rated'},{title:'معفى',value:'exempt'}]" label="معاملة الصنف" />
        <v-text-field v-if="rule.treatment==='taxable'" v-model.number="rule.rate_bps" type="number" min="0" max="10000" label="معدل الصنف بنقاط الأساس" />
        <v-text-field v-model="rule.basis" label="أساس استثناء الصنف" maxlength="1000" />
        <v-btn variant="text" color="error" @click="tax.product_rules.splice(index,1)">حذف الاستثناء</v-btn>
      </v-card>
      <v-btn variant="outlined" @click="tax.product_rules.push({product_id:null,treatment:'exempt',rate_bps:0,basis:''})">إضافة استثناء ضريبي لصنف</v-btn>
    </template>
  </section>
</template>
<script setup>
const tax=defineModel({required:true})
defineProps({products:{type:Array,default:()=>[]}})
const statuses=[{title:'لم تراجع بعد',value:'unconfigured'},{title:'غير مسجل في القيمة المضافة — لا تحصيل VAT',value:'not_registered'},{title:'مسجل في القيمة المضافة',value:'registered'},{title:'معاملة معفاة موثقة',value:'exempt'}]
function resetTreatment(){tax.value.product_rules=[];tax.value.rate_bps=0;tax.value.mode=tax.value.status==='registered'?'included':'none';tax.value.registration_number=null}
</script>
