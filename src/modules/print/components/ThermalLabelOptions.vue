<template>
  <div class="pa-3 border rounded">
    <LabelTemplatePrintOptions
      v-model="settings"
      :items="items"
      :disabled="disabled"
      @ready="$emit('ready', $event)"
      @prepared="$emit('prepared', $event)"
    />
    <v-divider class="my-4" />
    <v-select
      :model-value="modelValue.destination"
      :items="destinations"
      label="طريقة الطباعة"
      density="compact"
      :disabled="disabled"
      @update:model-value="update({ destination: $event })"
    />
    <template v-if="native">
      <p class="text-caption mb-3">{{ printerSummary }} أغلق اتصال تطبيق الهاتف بالطابعة قبل الطباعة.</p>
      <v-row dense
        ><v-col cols="8"
          ><v-select
            :model-value="modelValue.paper"
            :items="papers"
            label="نوع الورق المركّب"
            density="compact"
            :disabled="disabled"
            hide-details
            @update:model-value="update({ paper: $event })" /></v-col
        ><v-col cols="4"
          ><v-select
            :model-value="modelValue.darkness"
            :items="[1, 2, 3, 4, 5]"
            label="السواد"
            density="compact"
            :disabled="disabled"
            hide-details
            @update:model-value="update({ darkness: $event })" /></v-col
        ><v-col cols="12"
          ><v-text-field
            :model-value="modelValue.token"
            label="رمز الربط بالخدمة المحلية"
            type="password"
            autocomplete="off"
            density="compact"
            :disabled="disabled"
            hide-details
            @update:model-value="update({ token: $event.trim() })" /></v-col
      ></v-row>
      <p class="text-caption text-medium-emphasis my-3">
        اختر طابعتك داخل HWNiX وأضف رابط الموقع ثم انسخ رمز الربط. قد يطلب المتصفح السماح بالوصول المحلي.
      </p>
      <div class="d-flex ga-2 flex-wrap">
        <v-btn variant="text" size="small" href="/downloads/HWNiX-Print-Bridge-Setup-1.1.4.exe" download>تنزيل برنامج ويندوز</v-btn
        ><v-btn variant="text" size="small" href="hwnixprint://open">فتح HWNiX</v-btn
        ><v-btn variant="tonal" size="small" :loading="checking" :disabled="disabled" @click="checkConnection">فحص خدمة الطباعة</v-btn>
      </div>
      <v-alert v-if="connectionError" type="error" variant="tonal" density="compact" class="mt-3">{{ connectionError }}</v-alert>
      <p v-if="connectionMessage" class="text-caption mt-3" role="status">{{ connectionMessage }}</p>
    </template>
  </div>
</template>
<script setup>
import { computed, ref } from 'vue';
import LabelTemplatePrintOptions from './LabelTemplatePrintOptions.vue';
import { checkTiMini, saveLabelSettings } from '../thermal/timiniClient';
const props = defineProps({ modelValue: { type: Object, required: true }, items: { type: Array, default: () => [] }, disabled: Boolean });
const emit = defineEmits(['update:modelValue', 'ready', 'prepared']);
const settings = computed({ get: () => props.modelValue, set: value => emit('update:modelValue', value) });
const native = computed(() => ['timini', 'timini-preview'].includes(props.modelValue.destination));
const destinations = computed(() => [
  { title: 'طباعة المتصفح', value: 'browser' },
  { title: 'تنزيل PDF', value: 'pdf' },
  ...(props.modelValue.layout === 'a4'
    ? []
    : [
        { title: 'معاينة داخل HWNiX', value: 'timini-preview' },
        { title: 'طباعة مباشرة عبر HWNiX', value: 'timini' },
      ]),
]);
const papers = computed(() =>
  props.modelValue.paperOptions?.length
    ? props.modelValue.paperOptions
    : [
        { title: 'ملصقات منفصلة (Tag)', value: 'tag_384r' },
        { title: 'رول مستمر', value: 'plain_384r' },
        { title: 'علامة سوداء', value: 'blacktag_384r' },
      ]
);
const printerSummary = computed(() =>
  props.modelValue.bluetoothName
    ? `الطابعة: ${props.modelValue.bluetoothName} · عرض الرأس ${((Number(props.modelValue.widthDots || 384) * 25.4) / Number(props.modelValue.dpi || 203)).toFixed(1)} مم.`
    : 'افحص الخدمة لتحميل مواصفات طابعتك الفعلية.'
);
const checking = ref(false),
  connectionError = ref(''),
  connectionMessage = ref('');
function update(values) {
  emit('update:modelValue', { ...props.modelValue, ...values });
}
async function checkConnection() {
  checking.value = true;
  connectionError.value = '';
  connectionMessage.value = '';
  try {
    const health = await checkTiMini(props.modelValue);
    const values = {
      bluetoothName: health.bluetooth,
      modelKey: health.model,
      widthDots: health.geometry?.widthDots,
      dpi: health.geometry?.dpi,
      paperOptions: health.paperOptions || [],
    };
    if (values.paperOptions.length && !values.paperOptions.some(p => p.value === props.modelValue.paper)) values.paper = values.paperOptions[0].value;
    update(values);
    saveLabelSettings({ ...props.modelValue, ...values });
    connectionMessage.value = 'الخدمة جاهزة. سيُفحص Bluetooth والاتصال بالطابعة قبل إرسال الطلب.';
  } catch (e) {
    connectionError.value = e.message;
  } finally {
    checking.value = false;
  }
}
</script>
