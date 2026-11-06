<template>
  <v-alert v-if="inherit" type="info" variant="tonal" class="mb-4">اترك الحقل على «توريث» لاستخدام سياسة الباقة ثم سياسة المنصة. الصفر و«لا» استثناءان صريحان.</v-alert>
  <v-row>
    <v-col v-for="field in fields" :key="field.key" cols="12" sm="6" lg="4">
      <v-select v-if="field.options" :model-value="modelValue[field.key] ?? null" :items="options(field)" :aria-label="field.label" :label="field.label" @update:model-value="set(field.key, $event)" />
      <template v-else>
        <v-checkbox v-if="inherit" :model-value="modelValue[field.key] != null" :label="'تخصيص: ' + field.label" hide-details @update:model-value="set(field.key, $event ? 0 : null)" />
        <v-text-field :model-value="modelValue[field.key]" :aria-label="field.label" :label="field.label" type="number" min="0" :max="field.max" :step="field.step || 1" :disabled="inherit && modelValue[field.key] == null" @update:model-value="set(field.key, $event === '' ? null : Number($event))" />
      </template>
    </v-col>
  </v-row>
</template>
<script setup>
const props = defineProps({ modelValue: { type: Object, default: () => ({}) }, inherit: Boolean })
const emit = defineEmits(['update:modelValue'])
function set(key, value) { emit('update:modelValue', { ...props.modelValue, [key]: value }) }
function options(field) { return props.inherit ? [{ title: 'توريث', value: null }, ...field.options] : field.options }
const yesNo = [{ title: 'نعم', value: true }, { title: 'لا', value: false }]
const fields = [
  {key:'rto_fee_payer',label:'تكلفة الشحن الفعلي عند تعذر التسليم وعودة الشحنة',options:[{title:'الإدارة',value:'platform'},{title:'البائع',value:'seller'}]},
  { key: 'funding_mode', label: 'تمويل العمولات', options: [{ title: 'رصيد مسبق', value: 'prepaid' }, { title: 'رصيد سالب ضمن حد ائتمان', value: 'credit' }] },
  { key: 'credit_limit_minor', label: 'حد الائتمان (قرش)' },
  { key: 'commission_type', label: 'نوع العمولة', options: [{ title: 'نسبة', value: 'percent' }, { title: 'مبلغ ثابت', value: 'fixed' }, { title: 'نسبة ومبلغ ثابت', value: 'mixed' }, { title: 'إعفاء', value: 'exempt' }] },
  { key: 'commission_percent', label: 'نسبة العمولة %', max: 100, step: 0.01 },
  { key: 'commission_fixed_minor', label: 'العمولة الثابتة (قرش)' },
  { key: 'commission_timing', label: 'استحقاق العمولة', options: [{ title: 'التسليم وتحصيل العميل', value: 'delivered_collected' }, { title: 'توريد شركة الشحن', value: 'remitted' }, { title: 'بعد مهلة الإرجاع', value: 'after_return_window' }] },
  { key: 'use_sales_balance_for_commission', label: 'خصم العمولة من الرصيد المتاح', options: yesNo },
  { key: 'automatic_debt_offset', label: 'تسوية الدين من الإيرادات الجديدة', options: yesNo },
  { key: 'settlement_delay_days', label: 'تأخير إتاحة الرصيد بعد مهلة الإرجاع (يوم)', max: 365 },
  { key: 'minimum_payout_minor', label: 'أقل طلب سحب (قرش)' },
  { key: 'automatic_payout', label: 'إنشاء طلب صرف أسبوعي تلقائيًا', options: yesNo },
  { key: 'payout_method', label: 'تنفيذ الصرف', options: [{ title: 'تحويل بنكي موثق يدويًا', value: 'manual' }] },
  { key: 'payout_weekday', label: 'يوم طلب الصرف', options: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map((title, value) => ({ title, value })) },
  { key: 'payout_hour', label: 'ساعة طلب الصرف (القاهرة)', max: 23 },
]
</script>
