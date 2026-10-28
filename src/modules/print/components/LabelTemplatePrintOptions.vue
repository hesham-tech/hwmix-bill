<template>
  <div class="label-template-options">
    <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-3"
      >{{ error }}<v-btn variant="text" size="small" :disabled="disabled" @click="load">إعادة المحاولة</v-btn></v-alert
    >
    <v-row dense>
      <v-col cols="12" sm="8"
        ><v-select
          :model-value="modelValue.templateId"
          :items="templates"
          item-title="name"
          item-value="id"
          label="قالب الملصق"
          :loading="loading"
          :disabled="disabled"
          density="compact"
          hide-details
          @update:model-value="selectTemplate"
      /></v-col>
      <v-col cols="12" sm="4"
        ><v-select
          :model-value="modelValue.layout || 'roll'"
          :items="[
            { title: 'رول حراري', value: 'roll' },
            { title: 'شبكة A4', value: 'a4' },
          ]"
          label="نوع الورق"
          :disabled="disabled"
          density="compact"
          hide-details
          @update:model-value="setLayout"
      /></v-col>
    </v-row>
    <div class="d-flex align-center ga-2 flex-wrap mt-2 mb-3">
      <v-chip v-if="selectedTemplate?.is_default" color="primary" size="small">افتراضي الشركة</v-chip>
      <span v-if="selectedTemplate" class="text-caption"
        >إصدار {{ selectedTemplate.published.version }} · {{ selectedTemplate.published.design.widthMm }} ×
        {{ selectedTemplate.published.design.heightMm }} مم</span
      >
      <v-spacer /><v-btn
        v-if="permissions.set_default && selectedTemplate && !selectedTemplate.is_default"
        variant="text"
        size="small"
        :disabled="disabled"
        @click="makeDefault"
        >تعيين افتراضي</v-btn
      >
      <v-btn
        v-if="permissions.manage || permissions.publish || permissions.set_default"
        variant="text"
        size="small"
        to="/app/label-templates"
        :disabled="disabled"
        >إدارة القوالب</v-btn
      >
      <v-btn icon="ri-refresh-line" size="x-small" variant="text" aria-label="تحديث القوالب" :disabled="disabled" @click="load" />
    </div>
    <template v-if="modelValue.layout === 'a4' && sheetSettings">
      <v-alert type="info" variant="tonal" density="compact" class="mb-3"
        >A4 متاحة عبر المتصفح أو PDF. اختر الطباعة بنسبة 100% دون ملاءمة للصفحة، وأوقف ترويسة المتصفح وتذييله.</v-alert
      >
      <v-row dense
        ><v-col cols="6"
          ><v-select
            :model-value="sheetSettings.orientation || 'portrait'"
            :items="[
              { title: 'A4 رأسي', value: 'portrait' },
              { title: 'A4 أفقي', value: 'landscape' },
            ]"
            label="اتجاه الورقة"
            density="compact"
            :disabled="disabled"
            @update:model-value="setSheet('orientation', $event)" /></v-col
        ><v-col cols="6"
          ><v-select
            :model-value="sheetSettings.direction || 'ltr'"
            :items="[
              { title: 'من اليسار إلى اليمين', value: 'ltr' },
              { title: 'من اليمين إلى اليسار', value: 'rtl' },
            ]"
            label="ترتيب الخانات"
            density="compact"
            :disabled="disabled"
            @update:model-value="setSheet('direction', $event)" /></v-col
      ></v-row>
      <v-row dense>
        <v-col v-for="property in sheetProperties" :key="property.key" cols="6" sm="4"
          ><v-text-field
            :model-value="
              sheetSettings[property.key] ??
              (property.key === 'marginRight' ? sheetSettings.marginLeft : property.key === 'marginBottom' ? sheetSettings.marginTop : undefined)
            "
            :label="property.title"
            type="number"
            min="0"
            step=".1"
            density="compact"
            hide-details
            :disabled="disabled"
            @update:model-value="setSheet(property.key, Number($event))"
        /></v-col>
        <v-col cols="6" sm="4"
          ><v-text-field
            :model-value="modelValue.startCell || 1"
            label="ابدأ من الخانة"
            type="number"
            min="1"
            step="1"
            density="compact"
            hide-details
            :disabled="disabled"
            @update:model-value="update({ startCell: Number($event) })"
        /></v-col>
      </v-row>
    </template>
    <v-switch
      :model-value="modelValue.monochrome !== false"
      label="أبيض وأسود"
      density="compact"
      hide-details
      :disabled="disabled || modelValue.layout !== 'a4'"
      @update:model-value="update({ monochrome: $event })"
    />
    <v-progress-linear v-if="preparing" indeterminate class="my-3" />
    <v-alert v-if="previewError" type="warning" variant="tonal" density="compact" class="my-2">{{ previewError }}</v-alert>
    <template v-if="prepared && previewRecord">
      <TemplatePreview
        :key="`${companyId}-${modelValue.templateId}-${modelValue.revisionId}`"
        :design="effectiveDesign"
        :values="previewRecord.values"
        :geometry="geometry"
        :monochrome="modelValue.monochrome !== false"
        :dpi="modelValue.layout === 'a4' ? 300 : geometry?.dpi || 203"
        :max-height="280"
        @valid="previewValid = $event"
      />
      <div class="d-flex align-center justify-space-between mt-2">
        <v-btn size="small" variant="text" :disabled="previewIndex === 0" @click="previewIndex--">السابق</v-btn
        ><span class="text-caption">{{ previewIndex + 1 }} / {{ prepared.records.length }} منتج · سعر البيع الحالي</span
        ><v-btn size="small" variant="text" :disabled="previewIndex >= prepared.records.length - 1" @click="previewIndex++">التالي</v-btn>
      </div>
      <v-btn class="mt-2" variant="tonal" size="small" :loading="pdfLoading" :disabled="disabled || !isReady" @click="previewPdf"
        >معاينة {{ modelValue.layout === 'a4' ? 'أوراق A4' : 'ملف الطباعة كاملًا' }}</v-btn
      >
    </template>
    <v-dialog v-model="pdfOpen" max-width="1000"
      ><v-card title="معاينة ملف الطباعة"
        ><v-card-text><iframe v-if="pdfUrl" :src="pdfUrl" title="معاينة PDF للملصقات" style="width: 100%; height: 70vh; border: 0" /></v-card-text
        ><v-card-actions><v-spacer /><v-btn @click="pdfOpen = false">إغلاق</v-btn></v-card-actions></v-card
      ></v-dialog
    >
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useUserStore } from '@/stores/user';
import { labelTemplateService as api, labelError } from '../templates-editor/labelTemplate.service';
import { clone, validateDesign } from '../templates-editor/templateSchema';
import { templatePdf } from '../templates-editor/templateRenderer';
import { createAssetLoader } from '../templates-editor/templateAssets';
import TemplatePreview from './TemplatePreview.vue';
const props = defineProps({ modelValue: { type: Object, required: true }, items: { type: Array, default: () => [] }, disabled: Boolean });
const emit = defineEmits(['update:modelValue', 'ready', 'prepared']);
const user = useUserStore(),
  companyId = computed(() => user.currentCompany?.id);
const templates = ref([]),
  permissions = ref({}),
  loading = ref(false),
  preparing = ref(false),
  error = ref(''),
  prepared = ref(null),
  previewError = ref(''),
  previewIndex = ref(0),
  previewValid = ref(false),
  pdfLoading = ref(false),
  pdfOpen = ref(false),
  pdfUrl = ref('');
let timer,
  ticket = 0,
  loadTicket = 0;
const loadImage = createAssetLoader();
const selectedTemplate = computed(() => templates.value.find(t => t.id === props.modelValue.templateId));
const effectiveDesign = computed(() => {
  const base = prepared.value?.design || selectedTemplate.value?.published.design;
  if (!base) return null;
  return { ...base, sheet: props.modelValue.sheetOverrides || base.sheet };
});
const sheetSettings = computed(() => props.modelValue.sheetOverrides || selectedTemplate.value?.published.design.sheet);
const geometry = computed(() =>
  ['timini', 'timini-preview'].includes(props.modelValue.destination) && props.modelValue.layout !== 'a4' && props.modelValue.widthDots
    ? { widthDots: Number(props.modelValue.widthDots), dpi: Number(props.modelValue.dpi || 203) }
    : undefined
);
const previewRecord = computed(() => prepared.value?.records[previewIndex.value]);
const isReady = computed(() => !!prepared.value && previewValid.value && !loading.value && !preparing.value && !error.value && !previewError.value);
const sheetProperties = [
  { key: 'columns', title: 'أعمدة الورقة' },
  { key: 'rows', title: 'صفوف الورقة' },
  { key: 'marginLeft', title: 'الهامش الأيسر مم' },
  { key: 'marginRight', title: 'الهامش الأيمن مم' },
  { key: 'marginTop', title: 'الهامش العلوي مم' },
  { key: 'marginBottom', title: 'الهامش السفلي مم' },
  { key: 'gapX', title: 'فاصل أفقي مم' },
  { key: 'gapY', title: 'فاصل رأسي مم' },
];
function update(values) {
  emit('update:modelValue', { ...props.modelValue, ...values });
}
function selectTemplate(id) {
  ++ticket;
  prepared.value = null;
  previewValid.value = false;
  const item = templates.value.find(t => t.id === id);
  if (!item) return;
  update({
    templateId: id,
    revisionId: item.published.id,
    companyId: companyId.value,
    heightMm: item.published.design.heightMm,
    sheetOverrides: clone(item.published.design.sheet),
    startCell: 1,
  });
}
function setLayout(layout) {
  update({
    layout,
    monochrome: layout !== 'a4',
    ...(layout === 'a4' && ['timini', 'timini-preview'].includes(props.modelValue.destination) ? { destination: 'browser' } : {}),
  });
}
function setSheet(key, value) {
  update({ sheetOverrides: { ...sheetSettings.value, [key]: value } });
}
async function load() {
  const current = ++loadTicket;
  ++ticket;
  loading.value = true;
  error.value = '';
  prepared.value = null;
  previewValid.value = false;
  templates.value = [];
  update({ templateId: null, revisionId: null, companyId: companyId.value });
  try {
    const [list, meta] = await Promise.all([api.list(true), api.fields()]);
    if (current !== loadTicket || list.company_id !== companyId.value) return;
    templates.value = list.data;
    permissions.value = meta.permissions;
    if (!templates.value.length) throw Error('لا توجد قوالب منشورة. اطلب من مسؤول الشركة إنشاء قالب ونشره.');
    if (list.default_id) selectTemplate(list.default_id);
  } catch (e) {
    if (current === loadTicket) error.value = labelError(e);
  } finally {
    if (current === loadTicket) loading.value = false;
  }
}
async function prepare() {
  const current = ++ticket;
  prepared.value = null;
  previewValid.value = false;
  previewError.value = '';
  previewIndex.value = 0;
  const items = props.items.filter(r => Number(r.quantity) > 0);
  if (!props.modelValue.templateId || !props.modelValue.revisionId || !items.length) return;
  if (items.some(r => !Number.isInteger(Number(r.quantity))) || items.reduce((sum, r) => sum + Number(r.quantity), 0) > 100) {
    previewError.value = 'اختر من 1 إلى 100 ملصق بكميات صحيحة.';
    return;
  }
  preparing.value = true;
  try {
    const result = await api.prepare({
      template_id: props.modelValue.templateId,
      revision_id: props.modelValue.revisionId,
      items: items.map(r => ({
        variant_id: r.variant_id,
        invoice_item_id: r.invoice_item_id,
        unit_id: r.unit_id || undefined,
        quantity: Number(r.quantity),
      })),
    });
    if (current !== ticket || result.company_id !== companyId.value) return;
    prepared.value = result;
    emit('prepared', result);
  } catch (e) {
    if (current === ticket) previewError.value = labelError(e);
  } finally {
    if (current === ticket) preparing.value = false;
  }
}
watch(
  () => [props.modelValue.templateId, props.modelValue.revisionId, props.items.map(r => [r.variant_id, r.invoice_item_id, r.unit_id, r.quantity])],
  () => {
    clearTimeout(timer);
    previewValid.value = false;
    prepared.value = null;
    timer = setTimeout(prepare, 300);
  },
  { deep: true }
);
watch(
  () => [props.modelValue.layout, props.modelValue.sheetOverrides, props.modelValue.startCell],
  () => {
    previewError.value = '';
    if (effectiveDesign.value)
      try {
        validateDesign(effectiveDesign.value, { sheet: props.modelValue.layout === 'a4', startCell: props.modelValue.startCell || 1 });
      } catch (e) {
        previewError.value = e.message;
      }
  },
  { deep: true }
);
watch(isReady, value => emit('ready', value), { immediate: true });
watch(companyId, () => {
  permissions.value = {};
  ++ticket;
  ++loadTicket;
  prepared.value = null;
  templates.value = [];
  load();
});
async function makeDefault() {
  try {
    await api.setDefault(props.modelValue.templateId);
    templates.value = templates.value.map(t => ({ ...t, is_default: t.id === props.modelValue.templateId }));
  } catch (e) {
    error.value = labelError(e);
  }
}
async function previewPdf() {
  pdfLoading.value = true;
  try {
    const result = await templatePdf(effectiveDesign.value, prepared.value.records, {
      layout: props.modelValue.layout || 'roll',
      startCell: Number(props.modelValue.startCell || 1),
      geometry: geometry.value,
      monochrome: props.modelValue.monochrome !== false,
      loadImage,
    });
    if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
    pdfUrl.value = URL.createObjectURL(result.blob);
    pdfOpen.value = true;
  } catch (e) {
    previewError.value = labelError(e);
  } finally {
    pdfLoading.value = false;
  }
}
watch(pdfOpen, open => {
  if (!open && pdfUrl.value) {
    URL.revokeObjectURL(pdfUrl.value);
    pdfUrl.value = '';
  }
});
onMounted(load);
onBeforeUnmount(() => {
  ++ticket;
  ++loadTicket;
  clearTimeout(timer);
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
});
</script>
