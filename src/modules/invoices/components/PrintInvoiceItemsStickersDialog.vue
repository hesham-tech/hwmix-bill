<template>
  <v-dialog v-model="show" max-width="800px">
    <v-card rounded="lg" class="border overflow-hidden p-0">
      <v-toolbar color="warning" density="compact" class="px-2">
        <v-icon icon="ri-ticket-line" class="me-2" />
        <v-toolbar-title class="text-subtitle-1 font-weight-bold">طباعة ملصقات أصناف الفاتورة</v-toolbar-title>
        <v-spacer />
        <v-btn icon="ri-close-line" variant="text" @click="show = false" />
      </v-toolbar>

      <v-card-text class="pa-0">
        <v-table density="comfortable" hover>
          <thead>
            <tr>
              <th class="text-right">المنتج</th>
              <th class="text-center" width="120">الكمية المسجلة</th>
              <th class="text-center" width="150">كمية الملصقات</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>
                <div class="d-flex align-center py-2 gap-2">
                  <AppAvatar :img-url="item.primary_image_url" :name="item.name" size="40" rounded="md" type="product" />
                  <div>
                    <div class="font-weight-bold">{{ item.name }}</div>
                    <div class="text-caption text-grey">الباركود: {{ item.barcode || '---' }}</div>
                  </div>
                </div>
              </td>
              <td class="text-center">
                <v-chip size="small" variant="tonal">{{ item.invoice_quantity }}</v-chip>
              </td>
              <td class="text-center">
                <AppInput
                  v-model.number="item.print_quantity"
                  type="number"
                  min="0"
                  density="compact"
                  hide-details
                  variant="outlined"
                  class="centered-input"
                />
              </td>
            </tr>
          </tbody>
        </v-table>

        <div v-if="items.length === 0" class="text-center py-8 text-grey">لا توجد أصناف قابلة للطباعة في هذه الفاتورة</div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 bg-grey-lighten-5">
        <div class="text-caption text-grey">
          إجمالي الملصقات: <span class="font-weight-bold text-primary">{{ totalToPrint }}</span>
        </div>
        <v-spacer />
        <AppButton variant="text" @click="show = false">إلغاء</AppButton>
        <AppButton color="primary" :loading="printing" :disabled="totalToPrint === 0" prepend-icon="ri-printer-line" @click="handlePrint">
          طباعة الكل
        </AppButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { printService } from '@/modules/print/core/PrintService';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import { toast } from 'vue3-toastify';

const show = ref(false);
const printing = ref(false);
const items = ref([]);

const totalToPrint = computed(() => {
  return items.value.reduce((sum, item) => sum + (item.print_quantity || 0), 0);
});

const open = invoice => {
  if (!invoice || !invoice.items) return;

  items.value = invoice.items.map(item => ({
    id: item.id,
    name: item.name,
    barcode: item.product?.barcode || item.barcode || item.product?.sku,
    retail_price: item.unit_price, // Or retail price from product if available
    primary_image_url: item.primary_image_url,
    invoice_quantity: item.quantity,
    print_quantity: item.quantity, // Default to invoice quantity
    product: item.product,
  }));

  show.value = true;
};

const handlePrint = async () => {
  if (totalToPrint.value === 0) return;

  printing.value = true;
  try {
    const printItems = [];

    items.value.forEach(item => {
      if (item.print_quantity > 0) {
        const productData = {
          productName: item.name,
          barcode: item.barcode || '0000000000',
          price: item.retail_price || 0,
        };

        // Add multiple copies
        for (let i = 0; i < item.print_quantity; i++) {
          printItems.push(productData);
        }
      }
    });

    await printService.print(
      'product-sticker',
      { items: printItems },
      {
        format: 'sticker',
        additionalCss: `@page { size: 40mm 25mm; margin: 0; }`,
      }
    );

    toast.success('تم إرسال الطلب للطابعة');
    show.value = false;
  } catch (err) {
    console.error(err);
    toast.error('فشل عملية الطباعة');
  } finally {
    printing.value = false;
  }
};

defineExpose({ open });
</script>

<style scoped>
.centered-input :deep(input) {
  text-align: center;
}
.gap-2 {
  gap: 0.5rem;
}
</style>
