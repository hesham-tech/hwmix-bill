<template>
  <div class="products-page">
    <AppDataTable
      v-model:page="store.page"
      v-model:items-per-page="store.itemsPerPage"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="products"
      :total-items="totalItems"
      :loading="loading"
      title="المنتجات"
      icon="ri-shopping-bag-line"
      @update:options="loadProducts"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <template #actions>
        <v-btn color="primary" prepend-icon="ri-add-line" @click="handleCreate"> منتج جديد </v-btn>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center gap-2">
          <v-avatar v-if="item.image" size="40" rounded>
            <v-img :src="item.image" />
          </v-avatar>
          <span class="font-weight-medium">{{ item.name }}</span>
        </div>
      </template>

      <template #item.price="{ item }">
        <span class="font-weight-bold text-success">
          {{ formatCurrency(item.price) }}
        </span>
      </template>

      <template #item.stock="{ item }">
        <v-chip :color="item.stock > item.min_stock ? 'success' : 'error'" size="small">
          {{ item.stock }}
        </v-chip>
      </template>

      <template #item.category="{ item }">
        <v-chip size="small">
          {{ item.category?.name || '-' }}
        </v-chip>
      </template>
    </AppDataTable>

    <AppDialog v-model="isOpen" :title="isEditMode ? 'تعديل منتج' : 'منتج جديد'" max-width="800" @close="close">
      <ProductForm :model-value="formData" @save="handleSave" @cancel="close" />
    </AppDialog>

    <ConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useProductStore } from '../store/product.store';
import { useProduct } from '../composables/useProduct';
import { AppDataTable, AppDialog, ConfirmDialog } from '@/components';
import ProductForm from '../components/ProductForm.vue';

const store = useProductStore();
const {
  products,
  loading,
  totalItems,
  formData,
  isEditMode,
  isOpen,
  close,
  showConfirm,
  confirmMessage,
  handleConfirm,
  handleCancel,
  loadProducts,
  handleDelete,
  handleEdit,
  handleCreate,
  saveProduct,
} = useProduct();

const headers = [
  { title: 'المنتج', key: 'name', sortable: true },
  { title: 'التصنيف', key: 'category', sortable: false },
  { title: 'السعر', key: 'price', sortable: true },
  { title: 'المخزون', key: 'stock', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

const formatCurrency = amount => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount || 0);
};

const handleSave = async data => {
  await saveProduct(data);
  close();
  await loadProducts();
};

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.products-page {
  padding: 1rem;
}
.gap-2 {
  gap: 0.5rem;
}
</style>
