<template>
  <div class="owner-funds-page">
    <AppPageHeader title="معاملات رأس المال والشركاء" subtitle="سجل حركات زيادة رأس المال ومساهمات الشركاء والمسحوبات والقروض المباشرة" icon="ri-hand-coin-line" sticky>
      <template #append>
        <AppButton
          color="primary"
          prepend-icon="ri-add-line"
          class="font-weight-bold"
          @click="showDialog = true"
        >
          تسجيل حركة ملاك
        </AppButton>
      </template>
    </AppPageHeader>

    <v-container fluid class="pt-0">
      <AppDataTable
        table-key="owner_fund_transactions.index"
        :headers="computedHeaders"
        :items="transactions"
        :loading="loading"
        :items-length="total"
        :items-per-page="itemsPerPage"
        :page="page"
        v-model:sort-by="sortByVuetify"
        title="حركات الأملاك والتمويل المستلمة"
        icon="ri-history-line"
        @update:options="changeSort"
      >
        <template #item.user="{ item }">
          <span class="font-weight-bold text-slate-800">{{ item.user?.nickname || item.user?.full_name || 'مالك/شريك غير معروف' }}</span>
        </template>

        <template #item.cashbox="{ item }">
          {{ item.cashbox?.name || 'خزينة غير معروفة' }}
        </template>

        <template #item.type="{ item }">
          <v-chip :color="getTypeColor(item.type)" size="small" variant="flat" class="font-weight-bold px-3">
            <v-icon :icon="getTypeIcon(item.type)" size="14" class="me-1" />
            {{ getTypeLabel(item.type) }}
          </v-chip>
        </template>

        <template #item.amount="{ item }">
          <div class="text-end font-weight-bold text-body-1" :class="isCreditType(item.type) ? 'text-success' : 'text-error'">
            {{ isCreditType(item.type) ? '+' : '-' }} {{ formatCurrency(item.amount) }}
          
    <!-- Confirm Reverse Dialog -->
    <AppConfirmDialog
      v-model="showConfirmDialog"
      title="تأكيد عكس الحركة"
      message="هل أنت متأكد من رغبتك في عكس هذه الحركة المالية؟ لا يمكن التراجع عن هذا الإجراء."
      confirm-text="نعم، عكس الحركة"
      confirm-color="error"
      :loading="reversing"
      @confirm="handleReverse"
    />
  </div>
</template>

        <template #item.entry_date="{ item }">
          {{ formatDate(item.entry_date) }}
        </template>
        <template #item.actions="{ item }">
          <div class="d-flex justify-center">
            <v-tooltip text="عكس الحركة">
              <template #activator="{ props }">
                <AppButton
                  v-bind="props"
                  size="small"
                  variant="text"
                  color="error"
                  icon="ri-arrow-go-back-line"
                  @click="confirmReverse(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </AppDataTable>
    </v-container>

    <!-- Dialog for new transaction -->
    <OwnerFundTransactionDialog v-model="showDialog" @success="fetchData" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import notificationManager from '@/services/notificationManager';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import OwnerFundTransactionDialog from '../components/OwnerFundTransactionDialog.vue';
import { formatCurrency, formatDate } from '@/utils/formatters';

const showDialog = ref(false);
const showConfirmDialog = ref(false);
const reversing = ref(false);
const transactionToReverse = ref(null);
const api = useApi('/api/owner-fund-transactions');
const { can } = usePermissions();

const fetchTransactions = async params => {
  return await api.get(params, { showLoading: false });
};

const {
  items: transactions,
  loading,
  currentPage: page,
  perPage: itemsPerPage,
  total,
  sortByVuetify,
  changeSort,
  fetchData,
} = useDataTable(fetchTransactions, {
  initialSortBy: 'entry_date',
  initialSortOrder: 'desc',
  initialPerPage: 10,
  immediate: true,
});

const headers = [
  { title: 'المالك / الشريك', key: 'user', sortable: false },
  { title: 'الخزينة / الحساب', key: 'cashbox', sortable: false },
  { title: 'نوع المعاملة', key: 'type', sortable: true },
  { title: 'المبلغ', key: 'amount', sortable: true, align: 'end' },
  { title: 'تاريخ المعاملة', key: 'entry_date', sortable: true },
  { title: 'البيان / الوصف', key: 'description', sortable: false },
];

const computedHeaders = computed(() => {
  let h = [...headers];
  if (!can('owner_fund_transactions.view_all')) {
    h = h.filter(col => col.key !== 'user');
  }
  if (can('owner_fund_transactions.reverse')) {
    h.push({ title: 'الإجراءات', key: 'actions', sortable: false, align: 'center' });
  }
  return h;
});

const getStatusLabel = status => {
  if (status === 'approved') return 'معتمدة';
  if (status === 'rejected') return 'مرفوضة';
  return 'قيد المراجعة';
};

const isCreditType = type => {
  return ['capital_increase', 'partner_contribution', 'loan_from_owner', 'advance_from_owner'].includes(type);
};

const getTypeLabel = type => {
  switch (type) {
    case 'capital_increase': return 'زيادة رأس المال';
    case 'partner_contribution': return 'مساهمة شريك جاري';
    case 'loan_from_owner': return 'قرض من المالك للشركة';
    case 'loan_to_owner': return 'قرض من الشركة للمالك';
    case 'advance_from_owner': return 'سلفة من المالك';
    case 'advance_to_partner': return 'سلفة للشريك';
    case 'drawings': return 'مسحوبات المالك';
    case 'profit_distribution': return 'توزيع أرباح';
    default: return type;
  }
};

const getTypeColor = type => {
  if (isCreditType(type)) return 'success';
  return 'error';
};

const getTypeIcon = type => {
  if (isCreditType(type)) return 'ri-arrow-left-down-line';
  return 'ri-arrow-right-up-line';
};

const confirmReverse = (item) => {
  transactionToReverse.value = item;
  showConfirmDialog.value = true;
};

const handleReverse = async () => {
  if (!transactionToReverse.value) return;
  reversing.value = true;
  try {
    await api.request('post', `/${transactionToReverse.value.id}/reverse`);
    notificationManager.success('تم عكس الحركة بنجاح.');
    fetchData();
  } catch (error) {
    console.error('Failed to reverse transaction:', error);
  } finally {
    reversing.value = false;
    showConfirmDialog.value = false;
    transactionToReverse.value = null;
  }
};
</script>
