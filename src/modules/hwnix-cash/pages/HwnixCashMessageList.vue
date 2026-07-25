<template>
  <div class="hwnix-cash-messages-wrapper">
    <AppDataTable
      table-key="hwnix-cash-messages.index"
      v-model:sort-by="store.sortBy"
      v-model:search="store.search"
      :headers="headers"
      :items="store.messages"
      :loading="store.loading"
      :total-items="store.totalItems"
      :page="store.page"
      :items-per-page="store.itemsPerPage"
      :filters="advancedFilters"
      permission-module="hwnix_cash_messages"
      title="سجل الرسائل"
      subtitle="استعراض وبحث في جميع الرسائل الواردة على الخطوط"
      icon="ri-message-3-line"
      :show-actions="false"
      @update:page="store.page = $event; store.fetchMessages()"
      @update:items-per-page="store.itemsPerPage = $event; store.fetchMessages()"
      @update:filters="applyFilters"
    >
      <!-- المرسل -->
      <template #item.sender="{ item }">
        <div class="d-flex align-center gap-2">
          <v-icon icon="ri-user-line" size="14" class="text-grey" />
          <span class="font-weight-medium">{{ item.sender }}</span>
        </div>
      </template>

      <!-- المزود -->
      <template #item.provider="{ item }">
        <HwnixCashProviderChip :provider="item.provider" size="x-small" />
      </template>

      <!-- نص الرسالة -->
      <template #item.body="{ item }">
        <div class="message-body-cell" :title="item.body">
          {{ truncate(item.body, 80) }}
        </div>
      </template>

      <!-- معالجة -->
      <template #item.is_processed="{ item }">
        <v-chip
          :color="item.is_processed ? 'success' : 'default'"
          size="x-small"
          variant="tonal"
        >
          {{ item.is_processed ? 'معالجة' : 'لم تُعالج' }}
        </v-chip>
      </template>

      <!-- وقت الاستلام -->
      <template #item.received_at="{ item }">
        <div class="d-flex align-center gap-1 text-body-2 text-grey">
          <v-icon icon="ri-time-line" size="12" />
          {{ formatDateTime(item.received_at) }}
        </div>
      </template>
    </AppDataTable>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useHwnixCashMessageStore } from '../store/hwnix-cash-message.store';
import HwnixCashProviderChip from '../components/HwnixCashProviderChip.vue';

const store = useHwnixCashMessageStore();

const headers = [
  { title: 'المرسل', key: 'sender', sortable: true },
  { title: 'المزود', key: 'provider', sortable: true },
  { title: 'نص الرسالة', key: 'body', sortable: false },
  { title: 'معالجة', key: 'is_processed', sortable: true },
  { title: 'وقت الاستلام', key: 'received_at', sortable: true },
];

const advancedFilters = [
  {
    key: 'provider',
    label: 'المزود',
    type: 'select',
    items: [
      { title: 'فودافون كاش', value: 'vodafone_cash' },
      { title: 'اورنج كاش', value: 'orange_cash' },
      { title: 'اتصالات كاش', value: 'etisalat_cash' },
      { title: 'وي كاش', value: 'we_cash' },
    ],
  },
  {
    key: 'is_processed',
    label: 'حالة المعالجة',
    type: 'select',
    items: [
      { title: 'معالجة', value: '1' },
      { title: 'لم تُعالج', value: '0' },
    ],
  },
  {
    key: 'date_from',
    label: 'من تاريخ',
    type: 'date',
  },
  {
    key: 'date_to',
    label: 'إلى تاريخ',
    type: 'date',
  },
];

function truncate(text, length) {
  if (!text) return '—';
  return text.length > length ? text.substring(0, length) + '...' : text;
}

function formatDateTime(dt) {
  if (!dt) return '—';
  return new Date(dt).toLocaleString('ar-EG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function applyFilters(filters) {
  store.providerFilter = filters.provider ?? null;
  store.isProcessedFilter = filters.is_processed ?? null;
  store.dateFrom = filters.date_from ?? null;
  store.dateTo = filters.date_to ?? null;
  store.page = 1;
  store.fetchMessages();
}

onMounted(() => store.fetchMessages());
</script>

<style scoped>
.message-body-cell {
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.8rem;
  color: rgba(var(--v-theme-on-surface), 0.75);
}
</style>
