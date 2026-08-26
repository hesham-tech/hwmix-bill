<template>
  <div class="partner-operations-list">
    <div class="d-flex justify-space-between align-center mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold">?????? ????????</h1>
        <p class="text-subtitle-1 text-medium-emphasis">????? ????? ????????? ?????????? ??? ????????</p>
      </div>
      <v-btn color="primary" prepend-icon="ri-add-line" @click="dialog = true">
        ?????? ?????
      </v-btn>
    </div>

    <v-card class="mb-4">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="4">
            <CustomerSelector v-model="filters.partner_id" label="????????" role="partner" clearable hide-details />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filters.type"
              :items="operationTypes"
              item-title="label"
              item-value="key"
              label="??? ????????"
              clearable
              hide-details
            ></v-select>
          </v-col>
          <v-col cols="12" sm="4" class="d-flex align-center">
            <v-btn color="primary" @click="fetchData" :loading="loading" prepend-icon="ri-search-line">
              ???
            </v-btn>
            <v-btn variant="text" @click="clearFilters" class="ms-2">????</v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card>
      <v-data-table
        :headers="headers"
        :items="operations"
        :loading="loading"
        :items-length="totalItems"
        hover
      >
        <template #item.operation_date="{ item }">
          {{ formatDate(item.operation_date) }}
        </template>
        
        <template #item.partner="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="primary-lighten-4" class="me-2">
              <span class="text-primary text-caption font-weight-bold">{{ item.partner?.name?.charAt(0) || '?' }}</span>
            </v-avatar>
            <span class="font-weight-medium">{{ item.partner?.name || '??????' }}</span>
          </div>
        </template>

        <template #item.type="{ item }">
          <v-chip size="small" :color="getTypeColor(item.type)" variant="tonal">
            {{ getTypeName(item.type) }}
          </v-chip>
        </template>

        <template #item.amount="{ item }">
          <span class="font-weight-bold" :class="getTypeAmountClass(item.type)">
            {{ formatCurrency(item.amount) }}
          </span>
        </template>
        
        <template #item.cash_box="{ item }">
          {{ item.cash_box?.name || '-' }}
        </template>

        <template #item.status="{ item }">
          <v-chip size="small" :color="item.status === 'reversed' ? 'error' : 'success'" variant="flat">
            {{ item.status === 'reversed' ? '???????' : '??????' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-btn
            v-if="item.status !== 'reversed'"
            icon="ri-arrow-go-back-line"
            variant="text"
            size="small"
            color="error"
            title="??? ????????"
            @click="confirmReverse(item)"
          ></v-btn>
        </template>
      </v-data-table>
    </v-card>

    <PartnerOperationDialog v-model="dialog" @saved="fetchData" />

    <!-- Reverse Dialog -->
    <v-dialog v-model="reverseDialog" max-width="500px">
      <v-card>
        <v-card-title class="bg-error text-white pa-4">
          <v-icon icon="ri-error-warning-line" class="me-2"></v-icon>
          ??? ???????
        </v-card-title>
        <v-card-text class="pt-6">
          <p>?? ??? ????? ?? ??? ??? ????????</p>
          <p class="font-weight-bold mt-2">{{ getTypeName(selectedOperation?.type) }} - {{ formatCurrency(selectedOperation?.amount) }}</p>
          <p class="text-error mt-4 text-caption">
            <v-icon icon="ri-information-line" size="small" class="me-1"></v-icon>
            ???? ????? ??? ?????? ????? ??????? ???????? ???????? ?????????? ?????????.
          </p>
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="reverseDialog = false" :disabled="reverseLoading">?????</v-btn>
          <v-btn color="error" variant="flat" @click="executeReverse" :loading="reverseLoading">??? ????????</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { usePartnerOperations } from '../composables/usePartnerOperations';
import PartnerOperationDialog from '../components/PartnerOperationDialog.vue';
import CustomerSelector from '@/modules/invoices/components/CustomerSelector.vue';
import notificationManager from '@/services/notificationManager';

const { loading, operations, operationTypes, totalItems, loadOperations, loadTypes, reverseOperation } = usePartnerOperations();


const dialog = ref(false);
const reverseDialog = ref(false);
const reverseLoading = ref(false);
const selectedOperation = ref(null);

const filters = reactive({
  partner_id: null,
  type: null,
});

const headers = [
  { title: '???????', key: 'operation_date' },
  { title: '????????', key: 'partner' },
  { title: '??? ????????', key: 'type' },
  { title: '???????', key: 'amount' },
  { title: '???????', key: 'cash_box' },
  { title: '???????', key: 'status' },
  { title: '???????', key: 'actions', sortable: false, align: 'end' }
];

onMounted(async () => {
  await loadTypes();
  fetchData();
});

const fetchData = () => {
  loadOperations({ ...filters });
};

const clearFilters = () => {
  filters.partner_id = null;
  filters.type = null;
  fetchData();
};

const getTypeName = (key) => {
  const type = operationTypes.value.find(t => t.key === key);
  return type ? type.label : key;
};

const getTypeColor = (key) => {
  const type = operationTypes.value.find(t => t.key === key);
  return type?.category === 'deposit' ? 'success' : 'warning';
};

const getTypeAmountClass = (key) => {
  const type = operationTypes.value.find(t => t.key === key);
  return type?.category === 'deposit' ? 'text-success' : 'text-error';
};

const formatCurrency = (val) => {
  return Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('ar-EG');
};

const confirmReverse = (item) => {
  selectedOperation.value = item;
  reverseDialog.value = true;
};

const executeReverse = async () => {
  if (!selectedOperation.value) return;
  
  reverseLoading.value = true;
  try {
    const res = await reverseOperation(selectedOperation.value.id);
    if (res.success) {
      notificationManager.success('?? ??? ???????? ?????');
      reverseDialog.value = false;
      fetchData();
    } else {
      notificationManager.error(res.message || '??? ??? ????? ????????');
    }
  } catch (error) {
    if (error.response?.status === 409) {
      notificationManager.error('?? ??? ??? ???????? ??????');
    } else {
      notificationManager.error(error.response?.data?.message || '??? ??? ????? ????????');
    }
  } finally {
    reverseLoading.value = false;
  }
};
</script>


