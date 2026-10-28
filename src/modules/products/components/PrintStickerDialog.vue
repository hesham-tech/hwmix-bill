<template>
  <LabelPrintDialog ref="dialog" />
  <v-dialog :model-value="loading" persistent max-width="360"
    ><v-card class="pa-6 text-center"
      ><v-progress-circular indeterminate color="primary" />
      <p class="mt-3">جارٍ تحميل المنتجات ومتغيراتها…</p></v-card
    ></v-dialog
  >
</template>
<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/user';
import LabelPrintDialog from '@/modules/print/components/LabelPrintDialog.vue';
import notificationManager from '@/services/notificationManager';
import { labelTemplateService as api, labelError } from '@/modules/print/templates-editor/labelTemplate.service';
const dialog = ref(),
  loading = ref(false),
  user = useUserStore();
const rowsFor = (product, variantId = null) =>
  (product.variants || [])
    .filter(v => !variantId || v.id === variantId)
    .map((v, index) => ({
      variant_id: v.id,
      name: `${product.name}${v.attributes_text ? ' — ' + v.attributes_text : ''}`,
      sku: v.sku,
      quantity: index === 0 ? 1 : 0,
    }));
async function open(productId, variantId = null) {
  if (loading.value) return;
  const companyId = user.currentCompany?.id;
  loading.value = true;
  try {
    const [product] = await api.products({ ids: [productId] });
    if (!dialog.value || companyId !== user.currentCompany?.id) return;
    const rows = rowsFor(product, variantId);
    if (!rows.length) throw Error('لا توجد متغيرات قابلة لطباعة ملصقات لهذا المنتج.');
    dialog.value.open(rows);
  } catch (e) {
    notificationManager.error(labelError(e));
  } finally {
    loading.value = false;
  }
}
async function openMany(ids) {
  if (loading.value) return;
  if (ids.length > 100) {
    notificationManager.error('اختر حتى 100 منتج في العملية.');
    return;
  }
  const companyId = user.currentCompany?.id;
  loading.value = true;
  try {
    const selected = ids.map(id => Number(typeof id === 'object' ? id.id : id));
    const products = await api.products({ ids: selected });
    if (!dialog.value || companyId !== user.currentCompany?.id) return;
    const rows = selected.flatMap(id => rowsFor(products.find(p => p.id === id)));
    if (!rows.length) throw Error('لا توجد متغيرات قابلة للطباعة.');
    dialog.value.open(rows, 'طباعة ملصقات المنتجات المحددة');
  } catch (e) {
    notificationManager.error(labelError(e));
  } finally {
    loading.value = false;
  }
}
defineExpose({ open, openMany });
</script>
