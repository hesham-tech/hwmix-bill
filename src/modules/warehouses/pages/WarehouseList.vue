<template>
  <div class="warehouses-page">
    <AppDataTable
      v-model:page="store.page"
      v-model:items-per-page="store.itemsPerPage"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="warehouses"
      :total-items="totalItems"
      :loading="loading"
      title="المخازن"
      icon="ri-building-4-line"
      @update:options="loadWarehouses"
      @edit="handleEdit"
      @delete="handleDelete"
      :can-view="true"
      @view="handleViewStock"
    >
      <template #actions>
        <v-btn color="primary" prepend-icon="ri-add-line" @click="handleCreate"> مخزن جديد </v-btn>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-icon icon="ri-building-4-line" color="primary" class="me-2" />
          <span class="font-weight-medium">{{ item.name }}</span>
        </div>
      </template>

      <template #item.location="{ item }">
        <div class="text-body-2">
          <v-icon icon="ri-map-pin-line" size="small" class="me-1" />
          {{ item.location || '-' }}
        </div>
      </template>
    </AppDataTable>

    <AppDialog v-model="isOpen" :title="isEditMode ? 'تعديل مخزن' : 'مخزن جديد'" max-width="600" @close="close">
      <WarehouseForm :model-value="formData" @save="handleSave" @cancel="close" />
    </AppDialog>

    <ConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useWarehouseStore } from '../store/warehouse.store';
import { useDialog, useConfirm } from '@/composables';
import { AppDataTable, AppDialog, ConfirmDialog } from '@/components';
import WarehouseForm from '../components/WarehouseForm.vue';

const store = useWarehouseStore();
const { isOpen, formData, isEditMode, open, close } = useDialog();
const { showConfirm, confirmMessage, confirm, handleConfirm, handleCancel } = useConfirm();

const warehouses = store.warehouses;
const loading = store.loading;
const totalItems = store.totalItems;

const headers = [
  { title: 'المخزن', key: 'name', sortable: true },
  { title: 'الموقع', key: 'location', sortable: false },
  { title: 'الوصف', key: 'description', sortable: false },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

const loadWarehouses = async () => {
  await store.fetchWarehouses();
};

const handleEdit = warehouse => {
  open(warehouse);
};

const handleCreate = () => {
  open({});
};

const handleDelete = warehouse => {
  confirm(`هل أنت متأكد من حذف المخزن "${warehouse.name}"؟`, async () => {
    await store.deleteWarehouse(warehouse.id);
  });
};

const handleSave = async data => {
  if (isEditMode.value) {
    await store.updateWarehouse(formData.value.id, data);
  } else {
    await store.createWarehouse(data);
  }
  close();
  await loadWarehouses();
};

const handleViewStock = warehouse => {
  console.log('View stock for warehouse:', warehouse.id);
  // TODO: Navigate to stock page
};

onMounted(() => {
  loadWarehouses();
});
</script>

<style scoped>
.warehouses-page {
  padding: 1rem;
}
</style>
