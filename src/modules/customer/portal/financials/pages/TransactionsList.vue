<template>
  <div class="transactions-page">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 mb-0 text-gray-800">سجل المعاملات المالية</h1>
      <div class="actions">
        <!-- Optional: Balance Operations Modal if user has personal transfer permission -->
        <BalanceOperations v-if="canTransfer" mode="transfer" :source-user="currentUser" @success="refreshData" />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="row mb-4">
      <div class="col-xl-4 col-md-6 mb-4">
        <div class="card border-left-primary shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">الرصيد الحالي</div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">
                  {{ formatCurrency(currentUser.balance || 0) }}
                </div>
              </div>
              <div class="col-auto">
                <i class="fas fa-wallet fa-2x text-gray-300"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="card shadow mb-4">
      <div class="card-header py-3">
        <h6 class="m-0 font-weight-bold text-primary">المعاملات الأخيرة</h6>
      </div>
      <div class="card-body">
        <AppDataTable
          :headers="headers"
          :items="transactions"
          :loading="loading"
          :server-items-length="totalItems"
          @update:options="fetchTransactions"
        >
          <template #[`item.type`]="{ item }">
            <v-chip :color="getTypeColor(item.type)" small dark>
              {{ getTypeLabel(item.type) }}
            </v-chip>
          </template>

          <template #[`item.amount`]="{ item }">
            <span :class="getAmountClass(item.type)">
              {{ formatCurrency(item.amount) }}
            </span>
          </template>

          <template #[`item.created_at`]="{ item }">
            {{ formatDate(item.created_at) }}
          </template>
        </AppDataTable>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import AppDataTable from '@/components/AppDataTable.vue';
import BalanceOperations from '@/modules/financials/components/BalanceOperations.vue';
import { useFormatter } from '@/composables/useFormatter';
import { usePermissions } from '@/composables/usePermissions';
import api from '@/api';

const authStore = useAuthStore();
const { formatCurrency, formatDate } = useFormatter();

const { can } = usePermissions();
const currentUser = computed(() => authStore.user);
const canTransfer = computed(() => can('balance.transfer'));

const transactions = ref([]);
const loading = ref(false);
const totalItems = ref(0);

const headers = [
  { title: 'التاريخ', key: 'created_at' },
  { title: 'النوع', key: 'type' },
  { title: 'المبلغ', key: 'amount' },
  { title: 'الرصيد قبل', key: 'balance_before' },
  { title: 'الرصيد بعد', key: 'balance_after' },
  { title: 'الوصف', key: 'description' },
];

const fetchTransactions = async (options = {}) => {
  loading.ref = true;
  try {
    const response = await api.get('/transactions', {
      params: {
        page: options.page || 1,
        per_page: options.itemsPerPage || 10,
        user_id: currentUser.value.id, // Only my transactions
      },
    });
    transactions.value = response.data.data;
    totalItems.value = response.data.total;
  } catch (error) {
    console.error('Error fetching transactions:', error);
  } finally {
    loading.value = false;
  }
};

const refreshData = () => {
  fetchTransactions();
};

const getTypeLabel = type => {
  const labels = {
    deposit: 'إيداع',
    withdraw: 'سحب',
    transfer: 'تحويل',
  };
  return labels[type] || type;
};

const getTypeColor = type => {
  const colors = {
    deposit: 'success',
    withdraw: 'error',
    transfer: 'info',
  };
  return colors[type] || 'grey';
};

const getAmountClass = type => {
  return type === 'deposit' ? 'text-success' : 'text-danger';
};

onMounted(() => {
  fetchTransactions();
});
</script>
