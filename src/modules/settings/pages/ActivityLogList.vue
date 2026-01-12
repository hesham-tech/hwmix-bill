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
      v-model:search="search"
      :searchable="true"
      :show-actions="false"
      :empty-subtext="'لا توجد نشاطات'"
      class="text-no-wrap clickable-rows"
      @update:options="onTableOptionsUpdate"
      @click:row="showDetails"
    >
      <template #item.user="{ item }">
        <div v-if="item.user" class="d-flex align-center">
          <AppAvatar :img-url="item.user?.avatar_url" :name="item.user?.nickname || item.user?.name" type="user" size="28" class="me-2 border" />
          <span class="font-weight-medium text-body-2">{{ item.user.nickname || item.user.name }}</span>
        </div>
        <div v-else class="d-flex align-center text-grey">
          <v-icon icon="ri-robot-line" size="small" class="me-2" />
          <span>النظام</span>
        </div>
      </template>

      <template #item.action="{ item }">
        <div :class="`text-${getEventColor(item.action)}`" class="font-weight-bold d-flex align-center">
          <v-icon :icon="getEventIcon(item.action)" size="16" class="me-1" />
          {{ getEventLabel(item.action) }}
        </div>
      </template>

      <template #item.description="{ item }">
        <div class="text-body-2">{{ item.description }}</div>
      </template>

      <template #item.subject_type="{ item }">
        <div class="d-flex flex-column">
          <span class="text-body-2 text-primary font-weight-bold">{{ getSubjectLabel(item.subject_type) }}</span>
          <span v-if="item.company" class="text-caption text-grey-darken-1">
            <v-icon icon="ri-building-line" size="10" class="me-1" />
            {{ item.company.name }}
          </span>
        </div>
      </template>

      <template #item.ip_address="{ item }">
        <div class="d-flex align-center text-body-2 text-grey-darken-1">
          <v-icon icon="ri-map-pin-user-line" size="small" color="grey" class="me-1" />
          {{ item.ip_address || '-' }}
        </div>
      </template>

      <template #item.user_agent="{ item }">
        <div
          class="d-flex align-center text-body-2 text-grey-darken-1 overflow-hidden"
          style="max-width: 150px; text-overflow: ellipsis; white-space: nowrap"
        >
          <v-tooltip :text="item.user_agent" location="top">
            <template #activator="{ props }">
              <div v-bind="props" class="d-flex align-center">
                <v-icon :icon="getBrowserIcon(item.user_agent)" size="small" class="me-1" />
                <span>{{ getBrowserLabel(item.user_agent) }}</span>
              </div>
            </template>
          </v-tooltip>
        </div>
      </template>

      <template #item.created_at="{ item }">
        <div class="d-flex flex-column text-no-wrap">
          <span class="text-body-2">{{ formatDate(item.created_at).date }}</span>
          <span class="text-caption text-grey">{{ formatDate(item.created_at).time }}</span>
        </div>
      </template>

      <template #item.actions="{ item }">
        <v-btn
          v-if="item.old_values || item.new_values"
          icon="ri-information-line"
          variant="text"
          color="primary"
          size="small"
          @click="showDetails(item)"
        />
      </template>
    </AppDataTable>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="800px" scrollable>
      <v-card>
        <v-card-title class="d-flex justify-space-between align-center border-bottom pa-4">
          <div class="d-flex align-center">
            <v-icon icon="ri-history-line" class="me-2 text-primary" />
            <span>تفاصيل التغييرات</span>
          </div>
          <v-btn icon="ri-close-line" variant="text" size="small" @click="detailsDialog = false" />
        </v-card-title>

        <v-card-text class="pa-0">
          <v-list v-if="selectedLog" lines="two">
            <v-list-item>
              <template #prepend>
                <v-icon icon="ri-sticky-note-line" />
              </template>
              <v-list-item-title class="font-weight-bold">الوصف</v-list-item-title>
              <v-list-item-subtitle>{{ selectedLog.description }}</v-list-item-subtitle>
            </v-list-item>

            <v-divider />

            <div v-if="hasChanges(selectedLog)" class="pa-4">
              <h3 class="text-subtitle-1 font-weight-bold mb-3">الحقول المعدلة</h3>
              <v-table density="compact" class="border rounded">
                <thead class="bg-grey-lighten-4">
                  <tr>
                    <th class="text-right">الحقل</th>
                    <th class="text-right">القيمة السابقة</th>
                    <th class="text-right">القيمة الجديدة</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="change in getFormattedChanges(selectedLog)" :key="change.field">
                    <td class="font-weight-medium">{{ change.field_label || change.field }}</td>
                    <td class="text-error text-decoration-line-through">{{ change.old }}</td>
                    <td class="text-success">{{ change.new }}</td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <div v-else-if="selectedLog.action === 'created'" class="pa-4">
              <h3 class="text-subtitle-1 font-weight-bold mb-3">البيانات المضافة</h3>
              <v-sheet border rounded class="pa-3 bg-grey-lighten-4">
                <div v-for="(value, key) in selectedLog.new_values" :key="key" class="mb-1 d-flex">
                  <span class="font-weight-bold me-2" style="min-width: 120px">{{ key }}:</span>
                  <span>{{ formatValue(value) }}</span>
                </div>
              </v-sheet>
            </div>
          </v-list>
        </v-card-text>

        <v-card-actions class="pa-4 border-top">
          <v-spacer />
          <v-btn color="grey-darken-1" variant="text" @click="detailsDialog = false">إغلاق</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import AppDataTable from '@/components/common/AppDataTable.vue';

const api = useApi('/api/activity-logs');

const logs = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(15);
const search = ref('');

const detailsDialog = ref(false);
const selectedLog = ref(null);

const headers = [
  { title: 'المستخدم', key: 'user' },
  { title: 'الحدث', key: 'action' },
  { title: 'النوع', key: 'subject_type' },
  { title: 'الوصف', key: 'description' },
  { title: 'الـ IP', key: 'ip_address' },
  { title: 'المتصفح', key: 'user_agent' },
  { title: 'التاريخ', key: 'created_at' },
];

const getEventColor = event => {
  const colors = {
    created: 'success',
    updated: 'info',
    deleted: 'error',
    restored: 'success',
    login: 'primary',
    logout: 'grey',
    إضافة: 'success',
    انشاء: 'success',
    تعديل: 'info',
    حذف: 'error',
    دخول: 'primary',
    خروج: 'grey',
    تفعيل: 'success',
    تعطيل: 'warning',
    toggled: 'warning',
  };
  return colors[event] || 'grey';
};

const getEventIcon = event => {
  const icons = {
    created: 'ri-add-circle-line',
    updated: 'ri-edit-circle-line',
    deleted: 'ri-delete-bin-line',
    restored: 'ri-refresh-line',
    login: 'ri-login-circle-line',
    logout: 'ri-logout-circle-line',
    إضافة: 'ri-add-circle-line',
    انشاء: 'ri-add-box-line',
    تعديل: 'ri-edit-2-line',
    حذف: 'ri-delete-bin-7-line',
    دخول: 'ri-login-box-line',
    خروج: 'ri-logout-box-line',
    تفعيل: 'ri-checkbox-circle-line',
    تعطيل: 'ri-close-circle-line',
    toggled: 'ri-switch-line',
  };
  return icons[event] || 'ri-information-line';
};

const getEventLabel = event => {
  const labels = {
    created: 'إضافة',
    updated: 'تعديل',
    deleted: 'حذف',
    login: 'دخول',
    logout: 'خروج',
    restored: 'استرجاع',
    toggled: 'تبديل',
  };
  return labels[event] || event;
};

const getSubjectLabel = type => {
  if (!type) return '-';
  const parts = type.split('\\');
  const label = parts[parts.length - 1];
  const translations = {
    Product: 'منتج',
    Category: 'فئة',
    Brand: 'ماركة',
    User: 'مستخدم',
    Invoice: 'فاتورة',
    Payment: 'عملية دفع',
    Company: 'شركة',
    CashBox: 'خزينة',
    Stock: 'مخزون',
    PaymentMethod: 'طريقة دفع',
    Transaction: 'عملية مالية',
    Attribute: 'سمة منتج',
    AttributeValue: 'قيمة سمة',
    Expense: 'مصروف',
    ExpenseCategory: 'تصنيف مصروفات',
    Client: 'عميل',
    Supplier: 'مورد',
    Installment: 'قسط',
    Warehouse: 'مخزن',
    CashBoxType: 'نوع خزينة',
    InvoiceType: 'نوع فاتورة',
    Role: 'دور',
    Permission: 'صلاحية',
  };
  return translations[label] || label;
};

const getBrowserIcon = ua => {
  if (!ua) return 'ri-global-line';
  if (ua.includes('Chrome')) return 'ri-chrome-line';
  if (ua.includes('Firefox')) return 'ri-firefox-line';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'ri-safari-line';
  if (ua.includes('Edge')) return 'ri-edge-line';
  return 'ri-global-line';
};

const getBrowserLabel = ua => {
  if (!ua) return 'غير معروف';
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('Edge')) return 'Edge';
  return 'متصفح';
};

const formatDate = date => {
  if (!date) return { date: '-', time: '' };
  const d = new Date(date);
  return {
    date: d.toLocaleDateString('ar-EG'),
    time: d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
  };
};

const onTableOptionsUpdate = options => {
  page.value = options.page;
  itemsPerPage.value = options.itemsPerPage;
  loadData();
};

watch(search, () => {
  page.value = 1;
  loadData();
});

const loadData = async () => {
  loading.value = true;
  try {
    const response = await api.get(
      {
        page: page.value,
        per_page: itemsPerPage.value,
        search: search.value,
      },
      { showLoading: false }
    );

    // After standardization, response is { status, message, data, total }
    logs.value = response.data || [];
    total.value = response.total || 0;
  } catch (error) {
    console.error('Error loading activity logs:', error);
  } finally {
    loading.value = false;
  }
};

const showDetails = item => {
  selectedLog.value = item;
  detailsDialog.value = true;
};

const hasChanges = log => {
  return log?.action === 'updated' && log?.old_values && log?.new_values;
};

const getFormattedChanges = log => {
  if (!hasChanges(log)) return [];

  const changes = [];
  const fieldTranslations = {
    name: 'الاسم',
    price: 'السعر',
    status: 'الحالة',
    active: 'نشط',
    description: 'الوصف',
    email: 'البريد الإلكتروني',
    phone: 'رقم الهاتف',
    balance: 'الرصيد',
    amount: 'المبلغ',
    social_links: 'روابط التواصل',
  };

  for (const key in log.new_values) {
    const oldValue = log.old_values[key];
    const newValue = log.new_values[key];

    if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
      changes.push({
        field: key,
        field_label: fieldTranslations[key] || key,
        old: formatValue(oldValue),
        new: formatValue(newValue),
      });
    }
  }

  return changes;
};

const formatValue = value => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'نعم' : 'لا';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
};

onMounted(loadData);
</script>

<style scoped>
.activity-log-page {
  padding: 24px;
}

.clickable-rows :deep(tbody tr) {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-rows :deep(tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

.border-bottom {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.border-top {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>
