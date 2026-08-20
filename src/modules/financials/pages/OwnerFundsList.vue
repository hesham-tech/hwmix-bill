<template>
  <div class="owner-funds-page">
    <AppPageHeader title="Ã™â€¦Ã˜Â¹Ã˜Â§Ã™â€¦Ã™â€žÃ˜Â§Ã˜Âª Ã˜Â±Ã˜Â£Ã˜Â³ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€ž Ã™Ë†Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â±Ã™Æ’Ã˜Â§Ã˜Â¡" subtitle="Ã˜Â³Ã˜Â¬Ã™â€ž Ã˜Â­Ã˜Â±Ã™Æ’Ã˜Â§Ã˜Âª Ã˜Â²Ã™Å Ã˜Â§Ã˜Â¯Ã˜Â© Ã˜Â±Ã˜Â£Ã˜Â³ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€ž Ã™Ë†Ã™â€¦Ã˜Â³Ã˜Â§Ã™â€¡Ã™â€¦Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â±Ã™Æ’Ã˜Â§Ã˜Â¡ Ã™Ë†Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â³Ã˜Â­Ã™Ë†Ã˜Â¨Ã˜Â§Ã˜Âª Ã™Ë†Ã˜Â§Ã™â€žÃ™â€šÃ˜Â±Ã™Ë†Ã˜Â¶ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¨Ã˜Â§Ã˜Â´Ã˜Â±Ã˜Â©" icon="ri-hand-coin-line" sticky>
      <template #append>
        <AppButton
          v-if="can('owner_fund_transactions.create')"
          color="primary"
          prepend-icon="ri-add-line"
          class="font-weight-bold"
          @click="showDialog = true"
        >
          Ã˜ÂªÃ˜Â³Ã˜Â¬Ã™Å Ã™â€ž Ã˜Â­Ã˜Â±Ã™Æ’Ã˜Â© Ã™â€¦Ã™â€žÃ˜Â§Ã™Æ’
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
        title="Ã˜Â­Ã˜Â±Ã™Æ’Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ˜Â£Ã™â€¦Ã™â€žÃ˜Â§Ã™Æ’ Ã™Ë†Ã˜Â§Ã™â€žÃ˜ÂªÃ™â€¦Ã™Ë†Ã™Å Ã™â€ž Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â³Ã˜ÂªÃ™â€žÃ™â€¦Ã˜Â©"
        icon="ri-history-line"
        @update:options="changeSort"
      >
        <template #item.user="{ item }">
          <span class="font-weight-bold text-slate-800">{{ item.user?.nickname || item.user?.full_name || 'Ã™â€¦Ã˜Â§Ã™â€žÃ™Æ’/Ã˜Â´Ã˜Â±Ã™Å Ã™Æ’ Ã˜ÂºÃ™Å Ã˜Â± Ã™â€¦Ã˜Â¹Ã˜Â±Ã™Ë†Ã™Â' }}</span>
        </template>

        <template #item.cashbox="{ item }">
          {{ item.cashbox?.name || 'Ã˜Â®Ã˜Â²Ã™Å Ã™â€ Ã˜Â© Ã˜ÂºÃ™Å Ã˜Â± Ã™â€¦Ã˜Â¹Ã˜Â±Ã™Ë†Ã™ÂÃ˜Â©' }}
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
          </div>
        </template>

        <template #item.entry_date="{ item }">
          {{ formatDate(item.entry_date) }}
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-center">
            <v-tooltip text="Ã˜Â¹Ã™Æ’Ã˜Â³ Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â±Ã™Æ’Ã˜Â©">
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

    <!-- Confirm Reverse Dialog -->
    <AppConfirmDialog
      v-model="showConfirmDialog"
      title="Ã˜ÂªÃ˜Â£Ã™Æ’Ã™Å Ã˜Â¯ Ã˜Â¹Ã™Æ’Ã˜Â³ Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â±Ã™Æ’Ã˜Â©"
      message="Ã™â€¡Ã™â€ž Ã˜Â£Ã™â€ Ã˜Âª Ã™â€¦Ã˜ÂªÃ˜Â£Ã™Æ’Ã˜Â¯ Ã™â€¦Ã™â€  Ã˜Â±Ã˜ÂºÃ˜Â¨Ã˜ÂªÃ™Æ’ Ã™ÂÃ™Å  Ã˜Â¹Ã™Æ’Ã˜Â³ Ã™â€¡Ã˜Â°Ã™â€¡ Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â±Ã™Æ’Ã˜Â© Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Å Ã˜Â©Ã˜Å¸ Ã™â€žÃ˜Â§ Ã™Å Ã™â€¦Ã™Æ’Ã™â€  Ã˜Â§Ã™â€žÃ˜ÂªÃ˜Â±Ã˜Â§Ã˜Â¬Ã˜Â¹ Ã˜Â¹Ã™â€  Ã™â€¡Ã˜Â°Ã˜Â§ Ã˜Â§Ã™â€žÃ˜Â¥Ã˜Â¬Ã˜Â±Ã˜Â§Ã˜Â¡."
      confirm-text="Ã™â€ Ã˜Â¹Ã™â€¦Ã˜Å’ Ã˜Â¹Ã™Æ’Ã˜Â³ Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â±Ã™Æ’Ã˜Â©"
      confirm-color="error"
      :loading="reversing"
      @confirm="handleReverse"
    />
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
  { title: 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Æ’ / Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â±Ã™Å Ã™Æ’', key: 'user', sortable: false },
  { title: 'Ã˜Â§Ã™â€žÃ˜Â®Ã˜Â²Ã™Å Ã™â€ Ã˜Â© / Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â³Ã˜Â§Ã˜Â¨', key: 'cashbox', sortable: false },
  { title: 'Ã™â€ Ã™Ë†Ã˜Â¹ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã˜Â§Ã™â€¦Ã™â€žÃ˜Â©', key: 'type', sortable: true },
  { title: 'Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¨Ã™â€žÃ˜Âº', key: 'amount', sortable: true, align: 'end' },
  { title: 'Ã˜ÂªÃ˜Â§Ã˜Â±Ã™Å Ã˜Â® Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â¹Ã˜Â§Ã™â€¦Ã™â€žÃ˜Â©', key: 'entry_date', sortable: true },
  { title: 'Ã˜Â§Ã™â€žÃ˜Â¨Ã™Å Ã˜Â§Ã™â€  / Ã˜Â§Ã™â€žÃ™Ë†Ã˜ÂµÃ™Â', key: 'description', sortable: false },
];

const computedHeaders = computed(() => {
  let h = [...headers];
  if (!can('owner_fund_transactions.view_all')) {
    h = h.filter(col => col.key !== 'user');
  }
  if (can('owner_fund_transactions.reverse')) {
    h.push({ title: 'Ã˜Â§Ã™â€žÃ˜Â¥Ã˜Â¬Ã˜Â±Ã˜Â§Ã˜Â¡Ã˜Â§Ã˜Âª', key: 'actions', sortable: false, align: 'center' });
  }
  return h;
});

const isCreditType = type => {
  return ['capital_increase', 'partner_contribution', 'loan_from_owner', 'advance_from_owner'].includes(type);
};

const getTypeLabel = type => {
  switch (type) {
    case 'capital_increase': return 'Ã˜Â²Ã™Å Ã˜Â§Ã˜Â¯Ã˜Â© Ã˜Â±Ã˜Â£Ã˜Â³ Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€ž';
    case 'partner_contribution': return 'Ã™â€¦Ã˜Â³Ã˜Â§Ã™â€¡Ã™â€¦Ã˜Â© Ã˜Â´Ã˜Â±Ã™Å Ã™Æ’ Ã˜Â¬Ã˜Â§Ã˜Â±Ã™Å ';
    case 'loan_from_owner': return 'Ã™â€šÃ˜Â±Ã˜Â¶ Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Æ’ Ã™â€žÃ™â€žÃ˜Â´Ã˜Â±Ã™Æ’Ã˜Â©';
    case 'loan_to_owner': return 'Ã™â€šÃ˜Â±Ã˜Â¶ Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ˜Â´Ã˜Â±Ã™Æ’Ã˜Â© Ã™â€žÃ™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Æ’';
    case 'advance_from_owner': return 'Ã˜Â³Ã™â€žÃ™ÂÃ˜Â© Ã™â€¦Ã™â€  Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Æ’';
    case 'advance_to_partner': return 'Ã˜Â³Ã™â€žÃ™ÂÃ˜Â© Ã™â€žÃ™â€žÃ˜Â´Ã˜Â±Ã™Å Ã™Æ’';
    case 'drawings': return 'Ã™â€¦Ã˜Â³Ã˜Â­Ã™Ë†Ã˜Â¨Ã˜Â§Ã˜Âª Ã˜Â§Ã™â€žÃ™â€¦Ã˜Â§Ã™â€žÃ™Æ’';
    case 'profit_distribution': return 'Ã˜ÂªÃ™Ë†Ã˜Â²Ã™Å Ã˜Â¹ Ã˜Â£Ã˜Â±Ã˜Â¨Ã˜Â§Ã˜Â­';
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
    notificationManager.success('Ã˜ÂªÃ™â€¦ Ã˜Â¹Ã™Æ’Ã˜Â³ Ã˜Â§Ã™â€žÃ˜Â­Ã˜Â±Ã™Æ’Ã˜Â© Ã˜Â¨Ã™â€ Ã˜Â¬Ã˜Â§Ã˜Â­.');
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
