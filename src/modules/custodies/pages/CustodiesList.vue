<template>
  <div>
    <div class="d-flex align-center justify-space-between mb-4">
      <h2 class="text-h5 mb-0">Ø³Ø¬Ù„ Ø§Ù„Ø¹Ù‡Ø¯</h2>
      <v-btn
        v-if="$can(PERMISSIONS.CUSTODIES_CREATE)"
        color="primary"
        prepend-icon="mdi-plus"
        @click="showIssueDialog = true"
      >
        ØµØ±Ù Ø¹Ù‡Ø¯Ø©
      </v-btn>
    </div>

    <v-card>
      <AppDataTable
        :headers="headers"
        :items="custodies"
        :loading="loading"
        :pagination="pagination"
        @update:options="loadData"
      >
        <!-- User -->
        <template #item.user="{ item }">
          <div class="font-weight-medium">{{ item.user?.name || '-' }}</div>
        </template>

        <!-- Amount -->
        <template #item.amount="{ item }">
          <div class="font-weight-bold">{{ item.amount }}</div>
        </template>

        <!-- Remaining -->
        <template #item.remaining_amount="{ item }">
          <div class="font-weight-bold text-primary">{{ item.remaining_amount }}</div>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <v-chip size="small" :color="getStatusColor(item.status)">
            {{ getStatusLabel(item.status) }}
          </v-chip>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-btn
            icon="mdi-eye"
            variant="text"
            color="info"
            size="small"
            @click="openDetails(item.id)"
            v-tooltip="'Ø§Ù„ØªÙØ§ØµÙŠÙ„'"
          ></v-btn>

          <v-btn
            v-if="$can(PERMISSIONS.CUSTODIES_REFUND) && item.remaining_amount > 0 && item.status !== 'settled'"
            icon="mdi-cash-refund"
            variant="text"
            color="success"
            size="small"
            @click="openRefund(item)"
            v-tooltip="'Ø±Ø¯ Ù…Ø¨Ù„Øº'"
          ></v-btn>

          <v-btn
            v-if="$can(PERMISSIONS.CUSTODIES_REVERSE)"
            icon="mdi-undo"
            variant="text"
            color="error"
            size="small"
            @click="confirmReverse(item)"
            v-tooltip="'ØªØ±Ø§Ø¬Ø¹'"
          ></v-btn>
        </template>
      </AppDataTable>
    </v-card>

    <CustodyIssueDialog
      v-model="showIssueDialog"
      @saved="loadData"
    />

    <CustodyRefundDialog
      v-model="showRefundDialog"
      :custody="selectedCustody"
      @saved="loadData"
    />

    <CustodyDetailsDrawer
      v-model="showDetailsDrawer"
      :custody-id="selectedId"
    />

    <!-- Reverse Confirm Dialog -->
    <AppDialog
      v-model="showReverseDialog"
      title="ØªØ£ÙƒÙŠØ¯ Ø§Ù„ØªØ±Ø§Ø¬Ø¹"
      width="400"
      @confirm="doReverse"
      @cancel="showReverseDialog = false"
    >
      <div class="py-3">
        Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ù…Ù† Ø§Ù„ØªØ±Ø§Ø¬Ø¹ Ø¹Ù† Ù‡Ø°Ù‡ Ø§Ù„Ø¹Ù‡Ø¯Ø©ØŸ Ø³ÙŠØªÙ… Ø­Ø°ÙÙ‡Ø§ ÙˆØ¥Ù„ØºØ§Ø¡ Ø£Ø«Ø±Ù‡Ø§ Ø§Ù„Ù…Ø§Ù„ÙŠ.
      </div>
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCustodies } from '../composables/useCustodies';
import { PERMISSIONS } from '@/config/permissions';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import CustodyIssueDialog from '../components/CustodyIssueDialog.vue';
import CustodyRefundDialog from '../components/CustodyRefundDialog.vue';
import CustodyDetailsDrawer from '../components/CustodyDetailsDrawer.vue';

const { custodies, pagination, loading, fetchCustodies, reverseCustody } = useCustodies();

const headers = [
  { title: '#', key: 'id', sortable: false },
  { title: 'Ø§Ù„Ù…ÙˆØ¸Ù', key: 'user', sortable: false },
  { title: 'ØªØ§Ø±ÙŠØ® Ø§Ù„ØµØ±Ù', key: 'issue_date', sortable: true },
  { title: 'Ø§Ù„Ù…Ø¨Ù„Øº Ø§Ù„Ø£ØµÙ„ÙŠ', key: 'amount', sortable: true },
  { title: 'Ø§Ù„Ù…ØªØ¨Ù‚ÙŠ', key: 'remaining_amount', sortable: true },
  { title: 'Ø§Ù„Ø­Ø§Ù„Ø©', key: 'status', sortable: false },
  { title: 'Ø§Ù„Ø¹Ù…Ù„ÙŠØ§Øª', key: 'actions', sortable: false, align: 'end' },
];

const showIssueDialog = ref(false);

const showRefundDialog = ref(false);
const selectedCustody = ref(null);

const showDetailsDrawer = ref(false);
const selectedId = ref(null);

const showReverseDialog = ref(false);
const custodyToReverse = ref(null);

const loadData = async (options = {}) => {
  const params = {
    page: options.page || pagination.value.current_page,
    per_page: options.itemsPerPage || pagination.value.per_page,
  };
  await fetchCustodies(params);
};

onMounted(() => {
  loadData();
});

const openDetails = id => {
  selectedId.value = id;
  showDetailsDrawer.value = true;
};

const openRefund = item => {
  selectedCustody.value = item;
  showRefundDialog.value = true;
};

const confirmReverse = item => {
  custodyToReverse.value = item;
  showReverseDialog.value = true;
};

const doReverse = async () => {
  if (!custodyToReverse.value) return;
  const res = await reverseCustody(custodyToReverse.value.id);
  if (res && res.success) {
    showReverseDialog.value = false;
    loadData();
  }
};

const getStatusColor = status => {
  const map = { active: 'primary', settled: 'success' };
  return map[status] || 'grey';
};

const getStatusLabel = status => {
  const map = { active: 'Ù†Ø´Ø·Ø©', settled: 'Ù…Ø³ÙˆØ§Ø©' };
  return map[status] || status;
};
</script>
