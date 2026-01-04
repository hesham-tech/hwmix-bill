<template>
  <div class="invoices-page">
    <AppDataTable
      v-model:page="store.page"
      v-model:items-per-page="store.itemsPerPage"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="invoices"
      :total-items="totalItems"
      :loading="loading"
      title="الفواتير"
      icon="ri-file-list-3-line"
      @update:options="loadInvoices"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <!-- Header Actions -->
      <template #actions>
        <v-btn color="primary" prepend-icon="ri-add-line" @click="handleCreate('sale')"> فاتورة بيع </v-btn>

        <v-btn color="primary" variant="outlined" prepend-icon="ri-shopping-cart-line" @click="handleCreate('purchase')"> فاتورة شراء </v-btn>

        <v-btn color="primary" variant="outlined" prepend-icon="ri-money-dollar-circle-line" @click="handleCreate('installment_sale')">
          فاتورة تقسيط
        </v-btn>
      </template>

      <!-- Custom Columns -->
      <template #item.invoice_number="{ item }">
        <span class="font-weight-bold">{{ item.invoice_number }}</span>
      </template>

      <template #item.type="{ item }">
        <v-chip :color="getTypeColor(item.type)" size="small">
          {{ getTypeLabel(item.type) }}
        </v-chip>
      </template>

      <template #item.total="{ item }">
        <span class="font-weight-medium">{{ formatCurrency(item.total) }}</span>
      </template>

      <template #item.status="{ item }">
        <v-chip :color="getStatusColor(item.status)" size="small">
          {{ getStatusLabel(item.status) }}
        </v-chip>
      </template>

      <template #item.date="{ item }">
        {{ formatDate(item.date) }}
      </template>

      <!-- Extra Actions -->
      <template #extra-actions="{ item }">
        <v-btn icon="ri-download-line" size="small" variant="text" color="success" @click="downloadPDF(item.id)" />

        <v-btn icon="ri-mail-line" size="small" variant="text" color="info" @click="openEmailDialog(item)" />
      </template>
    </AppDataTable>

    <!-- Invoice Form Dialog -->
    <AppDialog v-model="isOpen" :title="isEditMode ? 'تعديل فاتورة' : 'فاتورة جديدة'" max-width="900" persistent @close="close">
      <InvoiceForm :model-value="formData" @save="handleSave" @cancel="close" />
    </AppDialog>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog v-model="showConfirm" :message="confirmMessage" @confirm="handleConfirm" @cancel="handleCancel" />
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue';
import { useInvoiceStore } from '../store/invoice.store';
import { useInvoice } from '../composables/useInvoice';
import { AppDataTable, AppDialog, ConfirmDialog } from '@/components';
import InvoiceForm from '../components/InvoiceForm.vue';

const store = useInvoiceStore();
const {
  invoices,
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
  loadInvoices,
  handleDelete,
  handleView,
  handleEdit,
  handleCreate,
  downloadPDF,
  saveInvoice,
} = useInvoice();

// Table Headers
const headers = [
  { title: 'رقم الفاتورة', key: 'invoice_number', sortable: true },
  { title: 'النوع', key: 'type', sortable: true },
  { title: 'العميل', key: 'customer_name', sortable: true },
  { title: 'التاريخ', key: 'date', sortable: true },
  { title: 'المجموع', key: 'total', sortable: true },
  { title: 'الحالة', key: 'status', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

// Helpers
const getTypeColor = type => {
  const colors = {
    sale: 'success',
    purchase: 'warning',
    installment_sale: 'info',
  };
  return colors[type] || 'grey';
};

const getTypeLabel = type => {
  const labels = {
    sale: 'بيع',
    purchase: 'شراء',
    installment_sale: 'تقسيط',
  };
  return labels[type] || type;
};

const getStatusColor = status => {
  const colors = {
    paid: 'success',
    pending: 'warning',
    cancelled: 'error',
  };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = {
    paid: 'مدفوعة',
    pending: 'معلقة',
    cancelled: 'ملغاة',
  };
  return labels[status] || status;
};

const formatCurrency = amount => {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
  }).format(amount);
};

const formatDate = date => {
  return new Date(date).toLocaleDateString('ar-EG');
};

const handleSave = async data => {
  await saveInvoice(data);
  close();
  await loadInvoices();
};

const openEmailDialog = invoice => {
  // TODO: Open email dialog
  console.log('Send email for invoice:', invoice.id);
};

// Lifecycle
onMounted(() => {
  loadInvoices();
});
</script>

<style scoped>
.invoices-page {
  padding: 1rem;
}
</style>
