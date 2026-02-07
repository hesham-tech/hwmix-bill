<template>
  <div class="payments-portal">
    <v-container fluid class="pa-2">
      <!-- Header -->
      <div class="d-flex justify-space-between align-center mb-2">
        <div>
          <h1 class="text-h4 font-weight-bold mb-1">مدفوعاتي</h1>
          <p class="text-subtitle-1 text-grey-darken-1">سجل بجميع الدفعات المالية التي قمت بها</p>
        </div>
        <v-avatar color="success" rounded="md" size="56" class="elevation-4">
          <v-icon icon="ri-money-dollar-circle-line" color="white" size="32" />
        </v-avatar>
      </div>

      <!-- Stats -->
      <v-row class="mb-2">
        <v-col cols="12" sm="6">
          <v-card variant="flat" border class="pa-4 bg-success-lighten-5 border-success">
            <div class="text-caption text-success-darken-2 font-weight-bold mb-1">إجمالي ما تم سداده</div>
            <div class="text-h4 font-weight-bold">{{ formatCurrency(totalPaid) }}</div>
          </v-card>
        </v-col>
        <v-col cols="12" sm="6">
          <v-card variant="flat" border class="pa-4 bg-grey-lighten-5">
            <div class="text-caption text-grey-darken-2 font-weight-bold mb-1">عدد الدفعات</div>
            <div class="text-h4 font-weight-bold">{{ total }}</div>
          </v-card>
        </v-col>
      </v-row>

      <!-- Loading -->
      <div v-if="loading && payments.length === 0" class="d-flex justify-center py-12">
        <v-progress-circular indeterminate color="success" size="64" />
      </div>

      <!-- Empty State -->
      <div v-else-if="payments.length === 0" class="text-center py-12 bg-grey-lighten-4 rounded-md border border-dashed mt-4">
        <v-icon icon="ri-bank-card-line" size="64" color="grey-lighten-1" class="mb-4" />
        <h3 class="text-h6 font-weight-bold text-grey-darken-1">لا توجد مدفوعات مسجلة</h3>
      </div>

      <!-- List -->
      <v-row v-else>
        <v-col v-for="item in payments" :key="item.id" cols="12" md="6" lg="4">
          <PaymentCard :payment="item" />
        </v-col>
      </v-row>

      <!-- Pagination -->
      <div class="d-flex justify-center mt-8">
        <v-pagination
          v-if="total > perPage"
          v-model="page"
          :length="Math.ceil(total / perPage)"
          rounded="circle"
          color="success"
          @update:model-value="fetchData"
        />
      </div>
    </v-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import { formatCurrency } from '@/utils/formatters';
import PaymentCard from '../components/PaymentCard.vue';

const api = useApi('/api/payments');

const payments = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const perPage = ref(9);

const totalPaid = computed(() => {
  return payments.value.reduce((acc, p) => acc + parseFloat(p.amount || 0), 0);
});

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await api.get({
      page: page.value,
      per_page: perPage.value,
    });
    payments.value = response.data || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);
</script>
