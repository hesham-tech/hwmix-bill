<template>
  <div class="reconciliations-page">
    <AppPageHeader title="مطابقة وتسويات الأرصدة" subtitle="مراجعة وتدقيق الفروقات بين الأرصدة الدفترية والواقعية للخزن والبنك" icon="ri-scales-line" sticky />

    <v-container fluid class="pt-0">
      <AppDataTable
        table-key="cash_reconciliations.index"
        :headers="headers"
        :items="reconciliations"
        :loading="loading"
        :items-length="total"
        :items-per-page="itemsPerPage"
        :page="page"
        v-model:sort-by="sortByVuetify"
        title="قائمة تسويات المطابقة"
        icon="ri-history-line"
        @update:options="changeSort"
      >
        <template #item.cashbox="{ item }">
          <span class="font-weight-bold text-slate-800">{{ item.cashbox?.name || 'خزينة غير معروفة' }}</span>
        </template>

        <template #item.reconciliation_date="{ item }">
          {{ formatDate(item.reconciliation_date) }}
        </template>

        <template #item.book_balance="{ item }">
          {{ formatCurrency(item.book_balance) }}
        </template>

        <template #item.physical_balance="{ item }">
          {{ formatCurrency(item.physical_balance) }}
        </template>

        <template #item.difference="{ item }">
          <span class="font-weight-bold" :class="getDifferenceClass(item.difference)">
            {{ item.difference > 0 ? '+' : '' }}{{ formatCurrency(item.difference) }}
          </span>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal" class="font-weight-bold">
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <AppButton
            v-if="item.status === 'pending' && canApprove"
            color="success"
            size="small"
            variant="tonal"
            prepend-icon="ri-checkbox-circle-line"
            :loading="approvingId === item.id"
            @click="handleApprove(item)"
          >
            اعتماد المطابقة
          </AppButton>
        </template>
      </AppDataTable>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import { PERMISSIONS } from '@/config/permissions';
import { formatCurrency, formatDate } from '@/utils/formatters';
import notificationManager from '@/services/notificationManager';

const { can } = usePermissions();
const api = useApi('/api/cash-reconciliations');
const approvingId = ref(null);

const fetchReconciliations = async params => {
  return await api.get(params, { showLoading: false });
};

const {
  items: reconciliations,
  loading,
  currentPage: page,
  perPage: itemsPerPage,
  total,
  sortByVuetify,
  changeSort,
  fetchData,
} = useDataTable(fetchReconciliations, {
  initialSortBy: 'reconciliation_date',
  initialSortOrder: 'desc',
  initialPerPage: 10,
  immediate: true,
});

const canApprove = computed(() => {
  return can(PERMISSIONS.ADMIN_SUPER) || can(PERMISSIONS.ADMIN_COMPANY);
});

const headers = [
  { title: 'الخزينة', key: 'cashbox', sortable: false },
  { title: 'تاريخ التسوية', key: 'reconciliation_date', sortable: true },
  { title: 'الرصيد الدفتري', key: 'book_balance', sortable: true, align: 'end' },
  { title: 'الرصيد الفعلي', key: 'physical_balance', sortable: true, align: 'end' },
  { title: 'الفارق', key: 'difference', sortable: true, align: 'end' },
  { title: 'الحالة', key: 'status', sortable: true, align: 'center' },
  { title: 'ملاحظات', key: 'notes', sortable: false },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const getDifferenceClass = diff => {
  const val = parseFloat(diff);
  if (val === 0) return 'text-grey';
  return val > 0 ? 'text-success' : 'text-error';
};

const getStatusColor = status => {
  if (status === 'approved') return 'success';
  if (status === 'rejected') return 'error';
  return 'warning';
};

const getStatusLabel = status => {
  if (status === 'approved') return 'معتمدة';
  if (status === 'rejected') return 'مرفوضة';
  return 'قيد المراجعة';
};

const handleApprove = async item => {
  approvingId.value = item.id;
  try {
    await api.request('post', `/${item.id}/approve`);
    notificationManager.success('تم اعتماد تسوية رصيد الخزينة بنجاح.');
    fetchData();
  } catch (error) {
    console.error('Failed to approve reconciliation:', error);
  } finally {
    approvingId.value = null;
  }
};
</script>
