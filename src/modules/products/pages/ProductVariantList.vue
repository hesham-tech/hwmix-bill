<template>
  <div class="product-variant-list-page">
    <div class="mb-6 px-6 pt-6 d-flex align-center justify-space-between">
      <div>
        <h1 class="text-h4 font-weight-bold">أشكال المنتجات</h1>
        <p class="text-body-1 text-grey">عرض وإدارة كافة تشكيلات المنتجات (الألوان، المقاسات، الخ)</p>
      </div>
    </div>

    <div class="px-6 pb-6">
      <AppDataTable
        title="قائمة الأشكال"
        icon="ri-stack-line"
        :headers="headers"
        api-url="/api/product-variants"
        permission-module="product_variants"
        show-actions
        :can-edit="true"
        :can-delete="true"
        :can-view="true"
        @view="handleView"
        @edit="handleEdit"
        @delete="handleDelete"
      >
        <!-- Product Column -->
        <template #item.product_name="{ item }">
          <div class="d-flex align-center gap-3">
            <v-avatar size="40" rounded="lg" color="primary-lighten-5">
              <v-img v-if="item.image" :src="item.image" cover />
              <v-icon v-else icon="ri-image-line" color="primary" />
            </v-avatar>
            <div>
              <div class="font-weight-bold">{{ item.product_name }}</div>
              <div class="text-caption text-grey">{{ item.sku }}</div>
            </div>
          </div>
        </template>

        <!-- Attributes Column -->
        <template #item.attributes="{ item }">
          <div class="d-flex flex-wrap gap-1">
            <v-chip v-for="attr in item.attributes" :key="attr.id" size="x-small" variant="tonal" color="secondary">
              {{ attr.attribute?.name }}: {{ attr.attribute_value?.name }}
            </v-chip>
            <span v-if="!item.attributes?.length" class="text-caption text-grey">أساسي</span>
          </div>
        </template>

        <!-- Pricing Column -->
        <template #item.retail_price="{ item }">
          <div class="font-weight-bold">{{ formatCurrency(item.retail_price) }}</div>
          <div class="text-caption text-grey">الجملة: {{ formatCurrency(item.wholesale_price) }}</div>
        </template>

        <!-- Stock Column -->
        <template #item.quantity="{ item }">
          <v-chip :color="getStockColor(item.quantity, item.min_quantity)" size="small" class="font-weight-bold">
            {{ item.quantity ?? 0 }}
          </v-chip>
        </template>

        <!-- Status Column -->
        <template #item.status="{ item }">
          <v-chip :color="item.status === 'active' ? 'success' : 'error'" size="x-small" variant="flat">
            {{ item.status === 'active' ? 'نشط' : 'متوقف' }}
          </v-chip>
        </template>
      </AppDataTable>
    </div>

    <!-- Delete Confirmation -->
    <AppDialog
      v-model="showDeleteDialog"
      title="تأكيد الحذف"
      icon="ri-delete-bin-line"
      confirm-color="error"
      confirm-text="حذف"
      :loading="deleting"
      @confirm="confirmDelete"
    >
      هل أنت متأكد من حذف هذا الشكل؟ لا يمكن التراجع عن هذه العملية إذا كان هناك مخزون مرتبطة به.
    </AppDialog>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import { formatCurrency } from '@/utils/formatters';

const router = useRouter();
const api = useApi('/api/product-variants');

const showDeleteDialog = ref(false);
const deleting = ref(false);
const selectedItem = ref(null);

const headers = [
  { title: 'المنتج / SKU', key: 'product_name' },
  { title: 'المواصفات', key: 'attributes', sortable: false },
  { title: 'الأسعار', key: 'retail_price' },
  { title: 'الكمية', key: 'quantity' },
  { title: 'الحالة', key: 'status' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const getStockColor = (qty, min) => {
  if (qty <= 0) return 'error';
  if (qty <= (min || 5)) return 'warning';
  return 'success';
};

const handleView = item => {
  router.push(`/products/${item.product_id}`);
};

const handleEdit = item => {
  router.push(`/products/${item.product_id}/edit`);
};

const handleDelete = item => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!selectedItem.value) return;

  deleting.value = true;
  try {
    await api.remove(selectedItem.value.id, { successMessage: 'تم حذف الشكل بنجاح' });
    showDeleteDialog.value = false;
    // AppDataTable handles Refresh if we use it with api-url,
    // but we might need to trigger it.
    // For now, let's assume the user will refresh or we can add a refresh ref.
    window.location.reload(); // Simple way for now as AppDataTable doesn't expose refresh easily yet
  } finally {
    deleting.value = false;
  }
};
</script>
