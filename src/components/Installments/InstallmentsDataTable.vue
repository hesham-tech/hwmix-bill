<template>
  <v-data-table-server
    item-value="id"
    v-model:options="options"
    :headers="displayedHeaders"
    :items="installments"
    :items-length="totalItems"
    :loading="loading"
    hover
    show-current-page
    @update:options="fetchInstallments"
    :row-props="getInstallmentRowProps"
    loading-text="جاري تحميل البيانات"
    no-data-text="لا توجد بيانات"
    items-per-page-text="عدد الصفوف في الصفحة"
    :hide-default-footer="!pagination"
  >
    <template #item.index="{ index }">
      {{ index + 1 }}
    </template>

    <template #item.actions="{ item }">
      <v-btn
        :color="item.status === 'paid' ? 'grey' : 'primary'"
        :disabled="item.status === 'paid' || item.status === 'canceled'"
        density="compact"
        @click="openPayDialog(item)"
      >
        {{ item.status === 'paid' ? 'تم الدفع' : 'دفع القسط' }}
      </v-btn>
    </template>
  </v-data-table-server>

  <v-pagination
    v-if="pagination"
    v-model="currentPage"
    :length="Math.ceil(totalItems / itemsPerPage)"
    class="mt-4"
    :show-first-last="true"
    :total-visible="5"
  ></v-pagination>

  <PayInstallmentDialog v-model="payDialog" :installment="currentInstallment" @update:installment="updateInstallment" />
</template>

<script setup>
import { ref, onMounted, watch, defineProps, computed, defineEmits } from 'vue'; // إضافة defineEmits
import { getAll } from '@/services/api';
import PayInstallmentDialog from './PayInstallmentDialog.vue';

// 1. تعريف الأحداث التي يصدرها المكون
const emits = defineEmits(['update:totalItems']); // تعريف حدث جديد باسم 'update:totalItems'

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
  pagination: {
    type: Boolean,
    default: true,
  },
  selectedHeaders: {
    type: Array,
    default: () => [],
  },
});

const allHeaders = [
  { title: 'رقم القسط', key: 'installment_number' },
  { title: 'العميل', key: 'user.nickname', sortable: false },
  { title: 'تاريخ الاستحقاق', key: 'due_date' },
  { title: 'قيمة القسط', key: 'amount' },
  { title: 'الحالة', key: 'status_label' },
  { title: 'المتبقي', key: 'remaining' },
  { title: 'الإجراءات', key: 'actions', sortable: false },
];

const displayedHeaders = computed(() => {
  if (props.selectedHeaders && props.selectedHeaders.length > 0) {
    return allHeaders.filter(header => props.selectedHeaders.includes(header.key));
  }
  return allHeaders;
});

const installments = ref([]);
const payDialog = ref(false);
const currentInstallment = ref(null);
const currentPage = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);
const loading = ref(false);

const options = ref({
  page: 1,
  itemsPerPage: 10,
  sortBy: ['due_date'],
  sortDesc: [false],
});

function openPayDialog(item) {
  currentInstallment.value = item;
  payDialog.value = true;
}

function getInstallmentRowProps({ item }) {
  const remainingAmount = parseFloat(item.remaining) || 0;
  const dueDate = new Date(item.due_date);
  const today = new Date();
  dueDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  if (item.status === 'paid') {
    return { style: { backgroundColor: '#A5D6A7' } };
  } else if (item.status === 'canceled') {
    return { style: { backgroundColor: '#CFD8DC' } };
  } else if (item.status === 'partially_paid') {
    return { style: { backgroundColor: '#FFECB3' } };
  } else if (remainingAmount > 0 && dueDate < today) {
    return { style: { backgroundColor: '#EF9A9A' } };
  } else if (remainingAmount > 0) {
    return { style: { backgroundColor: '#E0F2F7' } };
  }
  return {};
}

function updateInstallment() {
  fetchInstallments();
}

watch(
  () => props.filters,
  () => {
    options.value.page = 1;
    fetchInstallments();
  },
  { deep: true }
);

async function fetchInstallments() {
  loading.value = true;

  const { page, itemsPerPage, sortBy } = options.value;

  const sortField = sortBy.length ? sortBy[0].key : 'due_date';
  const sortOrder = sortBy.length && sortBy[0].order ? sortBy[0].order : 'asc';

  const params = {
    page: page || 1,
    limit: itemsPerPage || 10,
    sort_by: sortField,
    sort_order: sortOrder,
    ...props.filters,
  };

  try {
    const res = await getAll('installments', params, true, false, true);
    installments.value = res.data;
    totalItems.value = res.total;
    // 2. إصدار الحدث بعد تحديث totalItems
    emits('update:totalItems', totalItems.value);
  } catch (error) {
  } finally {
    loading.value = false;
  }
}

watch(
  () => options.value.page,
  () => {
    fetchInstallments();
  }
);

function getRowProps({ item, index }) {
  return {
    class: item.status === 'paid' ? 'paid-row' : item.status === 'canceled' ? 'canceled-row' : 'unpaid-row',
    'data-index': index,
  };
}
</script>

<style scoped>
.paid-row {
  background-color: #d4edda;
}
.unpaid-row {
  background-color: #f8d7da;
}
.canceled-row {
  background-color: #e0e0e0;
}
</style>
