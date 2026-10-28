<template>
  <v-dialog v-model="show" max-width="960" :persistent="printing">
    <v-card>
      <v-toolbar color="primary" density="compact"
        ><v-icon icon="ri-price-tag-3-line" class="ms-4 me-2" /><v-toolbar-title>{{ title }}</v-toolbar-title
        ><v-spacer /><v-btn icon="ri-close-line" :disabled="printing" aria-label="إغلاق" @click="show = false"
      /></v-toolbar>
      <v-card-text>
        <v-alert v-if="error" type="error" variant="tonal" class="mb-3">{{ error }}</v-alert>
        <v-table density="compact" class="mb-4"
          ><thead>
            <tr>
              <th>المنتج / المتغير</th>
              <th>الوحدة</th>
              <th style="width: 140px">عدد الملصقات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in items" :key="`${item.invoice_item_id || item.variant_id}-${index}`">
              <td>
                <div class="font-weight-medium">{{ item.name }}</div>
                <div class="text-caption text-medium-emphasis">{{ item.sku || '' }}</div>
              </td>
              <td>
                <v-select
                  v-if="item.units?.length"
                  v-model="item.unit_id"
                  :items="item.units"
                  item-title="name"
                  item-value="id"
                  density="compact"
                  variant="underlined"
                  hide-details
                  :disabled="printing"
                /><span v-else>الافتراضية</span>
              </td>
              <td>
                <v-text-field
                  v-model.number="item.quantity"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  density="compact"
                  hide-details
                  :disabled="printing"
                  aria-label="عدد ملصقات المنتج"
                />
              </td>
            </tr></tbody
        ></v-table>
        <ThermalLabelOptions v-if="show" v-model="settings" :items="items" :disabled="printing" @ready="ready = $event" @prepared="prepared" />
      </v-card-text>
      <v-divider /><v-card-actions class="pa-4"
        ><span class="text-body-2">الإجمالي: {{ total }} ملصق · الحد 100</span><v-spacer /><v-btn :disabled="printing" @click="show = false"
          >إلغاء</v-btn
        ><v-btn color="primary" variant="flat" prepend-icon="ri-printer-line" :loading="printing" :disabled="!canPrint" @click="print">{{
          settings.destination === 'pdf' ? 'تنزيل PDF' : 'بدء الطباعة'
        }}</v-btn></v-card-actions
      >
    </v-card>
  </v-dialog>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useUserStore } from '@/stores/user';
import ThermalLabelOptions from './ThermalLabelOptions.vue';
import { loadLabelSettings } from '../thermal/timiniClient';
import { printTemplateLabels } from '../templates-editor/printTemplateLabels';
import { labelError } from '../templates-editor/labelTemplate.service';
import notificationManager from '@/services/notificationManager';
const user = useUserStore(),
  show = ref(false),
  printing = ref(false),
  ready = ref(false),
  items = ref([]),
  title = ref('طباعة ملصقات المنتجات'),
  error = ref(''),
  settings = ref({});
const total = computed(() => items.value.reduce((sum, r) => sum + (Number(r.quantity) || 0), 0));
const canPrint = computed(
  () =>
    ready.value && total.value > 0 && total.value <= 100 && items.value.every(r => Number.isInteger(Number(r.quantity)) && Number(r.quantity) >= 0)
);
function open(rows, heading = 'طباعة ملصقات المنتجات') {
  if (printing.value) return;
  items.value = rows.map(r => ({ ...r, quantity: Number(r.quantity ?? 1) }));
  title.value = heading;
  settings.value = {
    ...loadLabelSettings(),
    layout: 'roll',
    startCell: 1,
    monochrome: true,
    templateId: null,
    revisionId: null,
    companyId: user.currentCompany?.id,
  };
  error.value = '';
  ready.value = false;
  show.value = true;
}
function prepared(data) {
  for (const row of items.value) {
    const record = data.records.find(r => (row.invoice_item_id ? r.invoice_item_id === row.invoice_item_id : r.variant_id === row.variant_id));
    if (record) {
      row.units = record.units;
      if (!row.unit_id && record.unit_id) row.unit_id = record.unit_id;
    }
  }
}
async function print() {
  if (!canPrint.value) return;
  printing.value = true;
  error.value = '';
  try {
    const message = await printTemplateLabels(items.value, settings.value);
    notificationManager.success(message);
    show.value = false;
  } catch (e) {
    error.value = labelError(e);
  } finally {
    printing.value = false;
  }
}
watch(
  () => user.currentCompany?.id,
  () => {
    if (!printing.value) show.value = false;
    ready.value = false;
    items.value = [];
  }
);
defineExpose({ open });
</script>
