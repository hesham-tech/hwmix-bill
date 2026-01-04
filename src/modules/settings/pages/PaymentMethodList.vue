<template>
  <div class="payment-methods-page">
    <!-- Header -->
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">طرق الدفع</h1>
      <p class="text-body-1 text-grey">إدارة طرق الدفع المتاحة في النظام</p>
    </div>

    <!-- Data Table -->
    <PaymentMethodsTable
      :items="paymentMethods"
      :loading="loading"
      :page="page"
      :items-per-page="itemsPerPage"
      :total="total"
      @create="handleCreate"
      @edit="handleEdit"
      @delete="handleDelete"
      @update:page="page = $event"
      @update:items-per-page="handleItemsPerPageChange"
    />

    <!-- Form Dialog -->
    <PaymentMethodForm v-model="showDialog" :payment-method="selectedPaymentMethod" @saved="handleSaved" />

    <!-- Delete Confirmation -->
    <v-dialog v-model="showDeleteDialog" max-width="400">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon icon="ri-error-warning-line" color="error" class="me-2" />
          تأكيد الحذف
        </v-card-title>

        <v-card-text>
          هل أنت متأكد من حذف طريقة الدفع "<strong>{{ selectedPaymentMethod?.name }}</strong
          >"؟
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false"> إلغاء </v-btn>
          <v-btn color="error" variant="flat" :loading="deleting" @click="confirmDelete"> حذف </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { usePaymentMethodsData } from '../composables/usePaymentMethodsData';
import PaymentMethodsTable from '../components/PaymentMethodsTable.vue';
import PaymentMethodForm from '../components/PaymentMethodForm.vue';

const { paymentMethods, loading, total, fetchPaymentMethods, deletePaymentMethod } = usePaymentMethodsData();

// Pagination
const page = ref(1);
const itemsPerPage = ref(10);

// Dialogs
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedPaymentMethod = ref(null);
const deleting = ref(false);

// Handlers
const handleCreate = () => {
  selectedPaymentMethod.value = null;
  showDialog.value = true;
};

const handleEdit = paymentMethod => {
  selectedPaymentMethod.value = paymentMethod;
  showDialog.value = true;
};

const handleDelete = paymentMethod => {
  selectedPaymentMethod.value = paymentMethod;
  showDeleteDialog.value = true;
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deletePaymentMethod(selectedPaymentMethod.value.id);
    showDeleteDialog.value = false;
    await loadPaymentMethods();
  } catch (error) {
    console.error('Error deleting payment method:', error);
  } finally {
    deleting.value = false;
  }
};

const handleSaved = async () => {
  await loadPaymentMethods();
};

const handleItemsPerPageChange = value => {
  itemsPerPage.value = value;
  page.value = 1;
  loadPaymentMethods();
};

// Load data
const loadPaymentMethods = async () => {
  await fetchPaymentMethods({
    page: page.value,
    per_page: itemsPerPage.value,
  });
};

onMounted(() => {
  loadPaymentMethods();
});
</script>

<style scoped>
.payment-methods-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}
</style>
