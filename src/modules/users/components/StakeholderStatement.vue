<template>
  <div class="stakeholder-statement-container pa-4">
    <!-- Header Summary Cards -->
    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="rounded-xl pa-4 bg-red-lighten-5 border-error border-opacity-25 elevation-sm">
          <div class="text-caption text-error font-weight-bold mb-1">إجمالي المديونية (مدين)</div>
          <div class="text-h4 font-weight-black text-error">
            {{ formatCurrency(receivableBalance) }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="rounded-xl pa-4 bg-green-lighten-5 border-success border-opacity-25 elevation-sm">
          <div class="text-caption text-success font-weight-bold mb-1">إجمالي المستحقات (دائن)</div>
          <div class="text-h4 font-weight-black text-success">
            {{ formatCurrency(payableBalance) }}
          </div>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card variant="outlined" class="rounded-xl pa-4 elevation-sm" :class="netBalance >= 0 ? 'bg-blue-lighten-5 border-primary border-opacity-25' : 'bg-neutral-lighten-5 border-grey border-opacity-25'">
          <div class="text-caption font-weight-bold mb-1" :class="netBalance >= 0 ? 'text-primary' : 'text-grey-darken-2'">صافي الرصيد الدفتري</div>
          <div class="text-h4 font-weight-black" :class="netBalance >= 0 ? 'text-primary' : 'text-grey-darken-2'">
            {{ formatCurrency(netBalance) }}
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Table List -->
    <v-card rounded="md" class="border shadow-sm">
      <AppDataTable
        table-key="stakeholder_statement.index"
        v-model:sort-by="sortByVuetify"
        :items="transactions || []"
        :total-items="totalItems || 0"
        :loading="loading"
        :headers="headers"
        :items-per-page="50"
        permission-module="transactions"
        title="كشف الحساب التفصيلي (دفتر الأستاذ)"
        subtitle="حركات الفواتير، السندات، والمتحصلات المالية التراكمية"
        icon="ri-file-paper-2-line"
        @update:options="onTableOptionsUpdate"
        @load="handleLoadMore"
        hide-search
      >
        <template #item.created_at="{ item }">
          <span class="text-caption text-grey">{{ formatDateTime(item.created_at) }}</span>
        </template>

        <template #item.reference="{ item }">
          <v-chip v-if="item.source_invoice" size="x-small" color="primary" variant="flat" class="cursor-pointer" @click="$router.push(`/app/invoices/${item.source_invoice_id}`)">
            فاتورة #{{ item.source_invoice.invoice_number }}
          </v-chip>
          <span v-else class="text-caption text-grey italic">---</span>
        </template>

        <template #item.debit="{ item }">
          <span v-if="item.amount > 0" class="font-weight-bold text-error">
            {{ formatCurrency(Math.abs(item.amount)) }}
          </span>
          <span v-else class="text-grey-lighten-3">0.00</span>
        </template>

        <template #item.credit="{ item }">
          <span v-if="item.amount < 0" class="font-weight-bold text-success">
            {{ formatCurrency(Math.abs(item.amount)) }}
          </span>
          <span v-else class="text-grey-lighten-3">0.00</span>
        </template>

        <template #item.balance="{ item }">
          <span class="font-weight-bold" :class="item.client_balance_after >= 0 ? 'text-primary' : 'text-grey-darken-1'">
            {{ formatCurrency(item.client_balance_after ?? 0) }}
          </span>
        </template>
      </AppDataTable>
    </v-card>
  </div>
</template>

<script setup>
/**
 * كلاس كشف الحساب التفصيلي الموحد للأطراف
 */
import { ref, computed, onMounted } from 'vue';
import { useDataTable } from '@/composables/useDataTable';
import { transactionService, userService } from '@/api';
import { AppDataTable } from '@/components';
import { formatCurrency, formatDateTime } from '@/utils/formatters';

const props = defineProps({
  userId: {
    type: [Number, String],
    required: true,
  },
});

const receivableBalance = ref(0);
const payableBalance = ref(0);
const netBalance = computed(() => receivableBalance.value - payableBalance.value);

const fetchBalances = async () => {
  try {
    const userRes = await userService.getOne(props.userId);
    const uData = Array.isArray(userRes.data) ? userRes.data[0] : userRes.data;
    if (uData) {
      receivableBalance.value = uData.receivable_balance || 0;
      payableBalance.value = uData.payable_balance || 0;
    }
  } catch (error) {
    console.error('Failed to fetch stakeholder balances:', error);
  }
};

const fetchTransactionsApi = async params => {
  const finalParams = {
    ...params,
    user_id: props.userId,
  };
  return await transactionService.getAll(finalParams, { showToast: false });
};

const {
  items: transactions,
  loading,
  currentPage: page,
  total: totalItems,
  lastPage,
  sortByVuetify,
  changeSort,
  fetchData,
} = useDataTable(fetchTransactionsApi, {
  initialSortBy: 'created_at',
  initialSortOrder: 'desc',
  immediate: true,
});

const onTableOptionsUpdate = options => {
  changeSort(options);
};

const handleLoadMore = () => {
  if (loading.value || transactions.value.length >= totalItems.value || page.value >= (lastPage.value || Infinity)) return;
  page.value++;
  fetchData({ append: true });
};

const headers = [
  { title: 'التاريخ', key: 'created_at', sortable: true, width: '150px' },
  { title: 'المرجع / المستند', key: 'reference', sortable: false, width: '150px' },
  { title: 'البيان / الحركة', key: 'description', sortable: false },
  { title: 'مدين (+)', key: 'debit', align: 'end', sortable: false },
  { title: 'دائن (-)', key: 'credit', align: 'end', sortable: false },
  { title: 'الرصيد التراكمي', key: 'balance', align: 'end', sortable: false, width: '130px' },
];

onMounted(fetchBalances);
</script>
