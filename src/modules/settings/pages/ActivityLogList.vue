<template>
  <div class="activity-log-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">سجل النشاطات</h1>
      <p class="text-body-1 text-grey">تتبع التغييرات والعمليات المنفذة في النظام</p>
    </div>

    <AppDataTable
      title="سجل النشاطات"
      icon="ri-history-line"
      :headers="headers"
      :items="logs"
      :total-items="total"
      :loading="loading"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      :searchable="false"
      @update:options="loadData"
    >
      <template #item.causer="{ item }">
        <div v-if="item.causer" class="d-flex align-center">
          <v-avatar size="28" color="primary-lighten-5" class="me-2 text-primary font-weight-bold border">
            {{ item.causer.name?.charAt(0).toUpperCase() }}
          </v-avatar>
          <span class="font-weight-medium">{{ item.causer.name }}</span>
        </div>
        <div v-else class="d-flex align-center text-grey">
          <v-icon icon="ri-robot-line" size="small" class="me-2" />
          <span>النظام</span>
        </div>
      </template>

      <template #item.event="{ item }">
        <v-chip :color="getEventColor(item.event)" size="small" variant="flat" class="font-weight-bold">
          <v-icon :icon="getEventIcon(item.event)" size="14" class="me-1" />
          {{ getEventLabel(item.event) }}
        </v-chip>
      </template>

      <template #item.subject_type="{ item }">
        <span class="text-body-2 text-primary">{{ getSubjectLabel(item.subject_type) }}</span>
      </template>

      <template #item.created_at="{ item }">
        <div class="d-flex flex-column">
          <span class="text-body-2">{{ formatDate(item.created_at).date }}</span>
          <span class="text-caption text-grey">{{ formatDate(item.created_at).time }}</span>
        </div>
      </template>
    </AppDataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import AppDataTable from '@/components/common/AppDataTable.vue';

const api = useApi('/api/activity-logs');

const logs = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(15);

const headers = [
  { title: 'المستخدم', key: 'causer' },
  { title: 'الحدث', key: 'event' },
  { title: 'النوع', key: 'subject_type' },
  { title: 'الوصف', key: 'description' },
  { title: 'التاريخ', key: 'created_at' },
];

const getEventColor = event => {
  const colors = { created: 'success', updated: 'info', deleted: 'error', login: 'primary' };
  return colors[event] || 'grey';
};

const getEventIcon = event => {
  const icons = {
    created: 'ri-add-circle-line',
    updated: 'ri-edit-circle-line',
    deleted: 'ri-delete-bin-circle-line',
    login: 'ri-login-circle-line',
  };
  return icons[event] || 'ri-checkbox-circle-line';
};

const getEventLabel = event => {
  const labels = { created: 'إضافة', updated: 'تعديل', deleted: 'حذف', login: 'دخول' };
  return labels[event] || event;
};

const getSubjectLabel = type => {
  if (!type) return '-';
  const parts = type.split('\\');
  const label = parts[parts.length - 1];
  const translations = {
    Product: 'منتج',
    Category: 'فئة',
    Brand: 'علامة تجارية',
    User: 'مستخدم',
    Invoice: 'فاتورة',
    Payment: 'عملية دفع',
  };
  return translations[label] || label;
};

const formatDate = date => {
  if (!date) return { date: '-', time: '' };
  const d = new Date(date);
  return {
    date: d.toLocaleDateString('ar-EG'),
    time: d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
  };
};

const loadData = async () => {
  loading.value = true;
  try {
    const response = await api.get({ page: page.value, per_page: itemsPerPage.value }, { showLoading: false });
    logs.value = response.data || [];
    total.value = response.total || 0;
  } finally {
    loading.value = false;
  }
};

const handleItemsPerPageChange = value => {
  itemsPerPage.value = value;
  page.value = 1;
  loadData();
};

onMounted(loadData);
</script>

<style scoped>
.activity-log-page {
  padding: 24px;
}
</style>
