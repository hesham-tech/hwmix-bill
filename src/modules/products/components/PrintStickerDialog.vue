<template>
  <v-dialog v-model="show" max-width="500px">
    <v-card rounded="lg" class="border overflow-hidden p-0">
      <v-toolbar color="primary" density="compact" class="px-2">
        <v-icon icon="ri-ticket-line" class="me-2" />
        <v-toolbar-title class="text-subtitle-1 font-weight-bold">طباعة ملصقات (Stickers)</v-toolbar-title>
        <v-spacer />
        <v-btn icon="ri-close-line" variant="text" @click="show = false" />
      </v-toolbar>

      <v-card-text class="pa-6">
        <div v-if="loading" class="text-center py-4">
          <v-progress-circular indeterminate color="primary" />
          <div class="mt-2 text-grey">جاري تحميل بيانات المنتج...</div>
        </div>

        <template v-else-if="product">
          <div class="d-flex align-center gap-4 mb-6 p-3 bg-grey-lighten-4 rounded-md border">
            <AppAvatar :img-url="product.primary_image_url" :name="product.name" size="64" rounded="md" type="product" />
            <div>
              <div class="text-subtitle-1 font-weight-bold">{{ product.name }}</div>
              <div class="text-caption text-grey">{{ product.category?.name || 'بدون تصنيف' }}</div>
            </div>
          </div>

          <!-- Selection if multiple variants exist -->
          <div v-if="variants.length > 1" class="mb-4">
            <div class="text-subtitle-2 mb-2 font-weight-bold">اختر المتغير (Variant):</div>
            <v-select
              v-model="selectedVariantId"
              :items="variants"
              item-title="sku"
              item-value="id"
              variant="outlined"
              density="comfortable"
              placeholder="اختر المتغير المراد طباعته"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :subtitle="`الباركود: ${item.raw.barcode}`">
                  <template #append>
                    <span class="text-primary font-weight-bold">{{ item.raw.retail_price }} ج.م</span>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </div>

          <v-row>
            <v-col cols="12" sm="6">
              <div class="text-subtitle-2 mb-2 font-weight-bold">الكمية (عدد الملصقات):</div>
              <AppInput
                v-model.number="quantity"
                type="number"
                min="1"
                placeholder="العدد.."
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="ri-hashtag"
              />
            </v-col>
            <v-col cols="12" sm="6" class="d-flex flex-column">
              <div class="text-subtitle-2 mb-2 font-weight-bold">تنسيق الطباعة:</div>
              <v-chip color="info" variant="flat" prepend-icon="ri-ticket-line" class="flex-grow-1 justify-center"> ملصق حراري (40x25mm) </v-chip>
            </v-col>
          </v-row>
        </template>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 bg-grey-lighten-5">
        <v-spacer />
        <AppButton variant="text" @click="show = false">إلغاء</AppButton>
        <AppButton color="primary" :loading="printing" :disabled="!isValid" prepend-icon="ri-printer-line" @click="handlePrint">
          بدء الطباعة
        </AppButton>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { printService } from '@/modules/print/core/PrintService';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import productService from '@/api/services/product.service';
import { toast } from 'vue3-toastify';

const show = ref(false);
const loading = ref(false);
const printing = ref(false);
const product = ref(null);
const variants = ref([]);
const selectedVariantId = ref(null);
const quantity = ref(1);

const isValid = computed(() => {
  return product.value && selectedVariantId.value && quantity.value > 0;
});

const open = async productId => {
  show.value = true;
  loading.value = true;
  product.value = null;
  variants.value = [];
  selectedVariantId.value = null;
  quantity.value = 1;

  try {
    const res = await productService.getOne(productId);
    const data = Array.isArray(res.data) ? res.data[0] : res.data;

    product.value = data;
    variants.value = data?.variants || [];

    if (variants.value.length > 0) {
      selectedVariantId.value = variants.value[0].id;
    }
  } catch (err) {
    toast.error('فشل تحميل بيانات المنتج');
    show.value = false;
  } finally {
    loading.value = false;
  }
};

const handlePrint = async () => {
  if (!isValid.value) return;

  printing.value = true;
  try {
    const selectedVariant = variants.value.find(v => v.id === selectedVariantId.value);

    // We want to print 'quantity' times
    // Currently PrintService.print handles one document.
    // If we want multiple stickers, we can either call it multiple times
    // or the template can handle an array of items.

    // For stickers, usually it's better to repeat the item in the print data
    // so it shows up in one print job if possible, but browser print
    // works better if we just repeat the HTML.

    // Let's pass an array to the printer if we want to print multiple.
    // But our PrintDriver works with a single HTML block.

    const printData = {
      item: {
        ...selectedVariant,
        product: product.value,
      },
      quantity: quantity.value,
    };

    await printService.print('product-sticker', printData, {
      format: 'sticker',
      additionalCss: `@page { size: 40mm 25mm; margin: 0; }`,
    });

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
.gap-4 {
  gap: 1rem;
}
</style>
