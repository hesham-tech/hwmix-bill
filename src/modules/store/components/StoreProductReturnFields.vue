<template>
  <section class="my-5">
    <h2 class="text-h6 mb-3">سياسة مرتجع منتج محدد</h2>
    <p>القاعدة العامة 14 يومًا لتغيير الرأي و30 يومًا للعيب. استثناء تغيير الرأي يحتاج سببًا قانونيًا، ولا يلغي حق العيب.</p>
    <v-select v-model="productId" :items="products" item-title="name" item-value="id" label="منتج سياسة المرتجع" aria-label="منتج سياسة المرتجع" @update:model-value="select" />
    <template v-if="productId">
      <v-text-field v-model.number="form.change_of_mind_days" type="number" min="14" max="365" label="مهلة تغيير الرأي للمنتج" />
      <v-text-field v-model.number="form.defect_days" type="number" min="30" max="365" label="مهلة العيب للمنتج" />
      <v-select v-model="form.change_of_mind_exception" clearable :items="exceptions" label="استثناء قانوني من تغيير الرأي" aria-label="استثناء قانوني من تغيير الرأي" />
      <v-textarea v-if="form.change_of_mind_exception" v-model="form.exception_basis" label="أساس انطباق الاستثناء على المنتج" maxlength="1000" />
      <v-btn variant="outlined" :loading="busy" @click="$emit('save',{productId,...form})">حفظ سياسة مرتجع المنتج</v-btn>
    </template>
  </section>
</template>
<script setup>
import { ref } from 'vue'
const props=defineProps({products:{type:Array,default:()=>[]},busy:Boolean})
defineEmits(['save'])
const productId=ref(null),form=ref({})
const exceptions=[{title:'سريع التلف',value:'perishable'},{title:'مصنوع خصيصًا للعميل',value:'custom_made'},{title:'طبيعة السلعة أو تعبئتها وفق القانون',value:'nature_or_packaging'},{title:'منتج صحي فُتح ختمه وتنطبق عليه أحكام الاستثناء',value:'unsealed_hygiene'}]
function select(){const p=props.products.find(p=>p.id===productId.value)?.store_return_policy||{};form.value={change_of_mind_days:Math.max(14,p.change_of_mind_days||p.window_days||0),defect_days:Math.max(30,p.defect_days||p.window_days||0),change_of_mind_exception:p.change_of_mind_exception||null,exception_basis:p.exception_basis||''}}
</script>
