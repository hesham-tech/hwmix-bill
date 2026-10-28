<template><LabelPrintDialog ref="dialog" /></template>
<script setup>
import { ref } from 'vue';
import LabelPrintDialog from '@/modules/print/components/LabelPrintDialog.vue';
import notificationManager from '@/services/notificationManager';
const dialog = ref();
function open(invoice) {
  const rows = (invoice?.items || [])
    .filter(item => item.variant_id || item.variant?.id || item.product_variant?.id || item.product_id || item.product?.id)
    .map(item => ({
      invoice_item_id: item.id,
      variant_id: item.variant_id || item.variant?.id || item.product_variant?.id,
      unit_id: item.unit_id,
      name: item.name || item.product?.name,
      sku: item.variant?.sku || item.product_variant?.sku || item.sku,
      quantity: Math.max(0, Math.floor(Number(item.quantity) || 0)),
    }));
  if (!rows.length) {
    notificationManager.error('لا توجد منتجات قابلة لطباعة ملصقات في هذه الفاتورة.');
    return;
  }
  dialog.value.open(rows, 'طباعة ملصقات أصناف الفاتورة');
}
defineExpose({ open });
</script>
