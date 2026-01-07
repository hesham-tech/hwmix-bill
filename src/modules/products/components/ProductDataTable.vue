<template>
  <AppDataTable
    :headers="headers"
    :items="items"
    :loading="loading"
    :items-length="total"
    :items-per-page="itemsPerPage"
    :page="page"
    title="قائمة المنتجات"
    icon="ri-shopping-bag-3-line"
    @update:page="$emit('update:page', $event)"
    @update:items-per-page="$emit('update:items-per-page', $event)"
  >
    <template #actions>
      <AppButton color="primary" prepend-icon="ri-add-line" @click="$emit('create')"> منتج جديد </AppButton>
    </template>

    <template #item.image="{ item }">
      <v-avatar size="48" rounded="lg" border class="bg-grey-lighten-4">
        <v-img v-if="item.image" :src="item.image" cover />
        <v-icon v-else icon="ri-image-line" size="20" color="grey-lighten-1" />
      </v-avatar>
    </template>

    <template #item.name="{ item }">
      <div class="d-flex flex-column">
        <span class="font-weight-bold text-body-1">{{ item.name }}</span>
        <span class="text-caption text-grey d-flex align-center mt-1">
          <v-icon icon="ri-barcode-line" size="14" class="me-1" />
          {{ item.sku || 'بدون SKU' }}
          <v-divider vertical class="mx-2" />
          <v-icon icon="ri-folder-line" size="14" class="me-1" />
          {{ item.category?.name || 'غير مصنف' }}
        </span>
      </div>
    </template>

    <template #item.brand="{ item }">
      <v-chip v-if="item.brand" size="small" variant="flat" color="primary-lighten-5" class="text-primary font-weight-bold">
        {{ item.brand.name }}
      </v-chip>
      <span v-else class="text-grey-lighten-1 text-caption">لا توجد ماركة</span>
    </template>

    <template #item.price="{ item }">
      <div class="d-flex flex-column text-right">
        <span class="font-weight-black text-success">{{ formatCurrency(item.selling_price) }}</span>
        <span class="text-caption text-grey">التكلفة: {{ formatCurrency(item.cost_price) }}</span>
      </div>
    </template>

    <template #item.stock="{ item }">
      <v-chip :color="getStockColor(item.stock_quantity)" size="small" variant="tonal" class="font-weight-bold">
        <v-icon :icon="getStockIcon(item.stock_quantity)" size="14" class="me-1" />
        {{ item.stock_quantity || 0 }}
      </v-chip>
    </template>

    <template #item.is_active="{ item }">
      <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold px-3">
        {{ item.is_active ? 'نشط' : 'غير نشط' }}
      </v-chip>
    </template>

    <template #item.actions="{ item }">
      <div class="d-flex justify-end gap-1">
        <AppButton icon="ri-eye-line" size="x-small" variant="text" color="info" tooltip="عرض" @click="$emit('view', item)" />
        <AppButton icon="ri-edit-line" size="x-small" variant="text" color="primary" tooltip="تعديل" @click="$emit('edit', item)" />
        <AppButton icon="ri-delete-bin-line" size="x-small" variant="text" color="error" tooltip="حذف" @click="$emit('delete', item)" />
      </div>
    </template>
  </AppDataTable>
</template>

<script setup>
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';

defineProps({
  items: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  page: {
    type: Number,
    default: 1,
  },
  itemsPerPage: {
    type: Number,
    default: 10,
  },
  total: {
    type: Number,
    default: 0,
  },
});

defineEmits(['create', 'view', 'edit', 'delete', 'update:page', 'update:items-per-page']);

const headers = [
  { title: 'صورة', key: 'image', width: '80px', sortable: false },
  { title: 'المنتج وتفاصيله', key: 'name', minWidth: '250px' },
  { title: 'العلامة التجارية', key: 'brand', width: '150px' },
  { title: 'سعر البيع', key: 'price', align: 'end', width: '150px' },
  { title: 'المخزون', key: 'stock', align: 'center', width: '100px' },
  { title: 'الحالة', key: 'is_active', align: 'center', width: '120px' },
  { title: '', key: 'actions', sortable: false, align: 'end', width: '120px' },
];

const formatCurrency = amount => {
  if (!amount) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

const getStockColor = quantity => {
  if (!quantity || quantity === 0) return 'error';
  if (quantity < 10) return 'warning';
  return 'success';
};

const getStockIcon = quantity => {
  if (!quantity || quantity === 0) return 'ri-close-circle-line';
  if (quantity < 10) return 'ri-error-warning-line';
  return 'ri-checkbox-circle-line';
};
</script>
