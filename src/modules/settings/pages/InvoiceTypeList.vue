<template>
  <div class="invoice-types-page">
    <!-- Page Header -->
    <div class="page-header d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold ml-2">أنواع الفواتير</h1>
        <p class="text-body-1 text-grey">تفعيل وتعطيل أنواع الفواتير المتاحة في النظام</p>
      </div>
    </div>

    <!-- Filters & View Toggle -->
    <AppCard class="mb-6">
      <div class="d-flex align-center flex-wrap gap-4">
        <AppInput
          v-model="search"
          label="بحث عن نوع..."
          prepend-inner-icon="ri-search-line"
          class="max-width-300 flex-grow-1"
          hide-details
          @update:model-value="handleSearch"
        />

        <v-spacer />

        <v-btn-group variant="outlined" density="comfortable" color="primary">
          <AppButton :active="viewMode === 'grid'" icon="ri-grid-fill" @click="viewMode = 'grid'" title="عرض شبكي" />
          <AppButton :active="viewMode === 'list'" icon="ri-list-check" @click="viewMode = 'list'" title="عرض قائمة" />
        </v-btn-group>
      </div>
    </AppCard>

    <!-- Content Area -->
    <LoadingSpinner v-if="loading && !filteredTypes.length" size="64" text="جاري تحميل الأنواع..." />

    <EmptyState v-else-if="!filteredTypes.length" icon="ri-file-list-line" title="لا توجد أنواع فواتير" message="لم يتم العثور على أنواع مطابقة" />

    <template v-else>
      <!-- Grid View -->
      <v-row v-if="viewMode === 'grid'">
        <v-col v-for="type in filteredTypes" :key="type.id" cols="12" sm="6" md="4" lg="3">
          <AppCard class="type-card h-100" no-padding>
            <div class="type-card-image d-flex align-center justify-center pa-4 bg-primary-lighten-5 position-relative">
              <v-avatar size="100" rounded="lg" class="elevation-1 bg-white">
                <v-icon :icon="getTypeIcon(type.type)" size="48" :color="getTypeColor(type.type)" />
              </v-avatar>

              <v-chip
                :color="type.is_active ? 'success' : 'error'"
                size="x-small"
                class="position-absolute top-2 right-2 font-weight-bold"
                variant="flat"
              >
                {{ type.is_active ? 'نشط' : 'معطل' }}
              </v-chip>
            </div>

            <v-card-item>
              <v-card-title class="text-h6 font-weight-bold">{{ type.name }}</v-card-title>
              <v-card-subtitle class="d-flex align-center mt-1">
                <v-icon icon="ri-information-line" size="14" class="me-1" />
                {{ getTypeLabel(type.type) }}
              </v-card-subtitle>
            </v-card-item>

            <v-card-text class="pt-0">
              <p class="text-body-2 text-grey-darken-1 text-truncate-3 height-60">
                {{ getTypeDescription(type.type) }}
              </p>
            </v-card-text>

            <template #actions>
              <v-spacer />
              <v-switch
                :model-value="type.is_active"
                color="success"
                hide-details
                inset
                :loading="toggling[type.id]"
                density="compact"
                @update:model-value="confirmToggle(type, $event)"
              />
            </template>
          </AppCard>
        </v-col>
      </v-row>

      <!-- List View -->
      <AppDataTable
        v-else
        :headers="headers"
        :items="filteredTypes"
        :total-items="filteredTypes.length"
        :loading="loading"
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :searchable="false"
        :can-edit="false"
        :can-delete="false"
        :can-view="false"
        @update:options="loadData"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar color="primary-lighten-5" size="40" class="me-3 border">
              <v-icon :icon="getTypeIcon(item.type)" :color="getTypeColor(item.type)" size="small" />
            </v-avatar>
            <div>
              <div class="font-weight-bold text-body-1">{{ item.name }}</div>
              <div class="text-caption text-grey">{{ getTypeDescription(item.type) }}</div>
            </div>
          </div>
        </template>

        <template #item.type="{ item }">
          <v-chip :color="getTypeColor(item.type)" size="small" variant="tonal">
            {{ getTypeLabel(item.type) }}
          </v-chip>
        </template>

        <template #item.is_active="{ item }">
          <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
            {{ item.is_active ? 'نشط' : 'معطل' }}
          </v-chip>
        </template>

        <template #extra-actions="{ item }">
          <v-switch
            :model-value="item.is_active"
            color="success"
            hide-details
            inset
            :loading="toggling[item.id]"
            density="compact"
            @update:model-value="confirmToggle(item, $event)"
          />
        </template>
      </AppDataTable>

      <!-- Pagination for Grid View -->
      <div v-if="viewMode === 'grid'" class="mt-8 d-flex align-center justify-space-between flex-wrap gap-4 px-2">
        <div class="text-body-2 text-grey">عرض {{ filteredTypes.length }} من إجمالي {{ filteredTypes.length }} نوع</div>
      </div>
    </template>

    <!-- Confirmation Dialog -->
    <AppDialog
      v-model="showConfirmDialog"
      :title="confirmDialogTitle"
      icon="ri-question-line"
      confirm-color="primary"
      :confirm-text="confirmText"
      @confirm="handleConfirmToggle"
    >
      {{ confirmDialogMessage }}
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useInvoiceTypesData } from '../composables/useInvoiceTypesData';
import { useApi } from '@/composables/useApi';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import { toast } from 'vue3-toastify';

const { invoiceTypes, loading, fetchInvoiceTypes } = useInvoiceTypesData();
const api = useApi('/api/invoice-types'); // Added this line

const page = ref(1);
const itemsPerPage = ref(12);
const search = ref('');
const viewMode = ref('grid');
const toggling = ref({});

// Confirmation Dialog State
const showConfirmDialog = ref(false);
const confirmDialogTitle = ref('');
const confirmDialogMessage = ref('');
const confirmText = ref('تأكيد');
const pendingToggle = ref(null);

const headers = [
  { title: 'النوع', key: 'name', sortable: true },
  { title: 'التصنيف', key: 'type', sortable: false },
  { title: 'الحالة', key: 'is_active', sortable: false, align: 'center' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const filteredTypes = computed(() => {
  if (!search.value) return invoiceTypes.value;

  const searchLower = search.value.toLowerCase();
  return invoiceTypes.value.filter(
    type =>
      type.name.toLowerCase().includes(searchLower) ||
      getTypeLabel(type.type).toLowerCase().includes(searchLower) ||
      getTypeDescription(type.type).toLowerCase().includes(searchLower)
  );
});

const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const handleSearch = debounce(() => {
  page.value = 1;
}, 500);

const getTypeIcon = type => {
  const icons = {
    sale: 'ri-shopping-cart-line',
    purchase: 'ri-shopping-bag-line',
    return: 'ri-arrow-go-back-line',
    installment: 'ri-bank-card-line',
  };
  return icons[type] || 'ri-file-text-line';
};

const getTypeColor = type => {
  const colors = {
    sale: 'success',
    purchase: 'info',
    return: 'warning',
    installment: 'purple',
  };
  return colors[type] || 'primary';
};

const getTypeLabel = type => {
  const labels = {
    sale: 'بيع',
    purchase: 'شراء',
    return: 'مرتجع',
    installment: 'تقسيط',
  };
  return labels[type] || type;
};

const getTypeDescription = type => {
  const descriptions = {
    sale: 'تؤثر على المخزون والإيرادات',
    purchase: 'تزيد المخزون والمصروفات',
    return: 'عكس عملية البيع أو الشراء',
    installment: 'إنشاء جدول أقساط وتحصيلات',
  };
  return descriptions[type] || 'نوع فاتورة مخصص';
};

// Show confirmation dialog before toggle
const confirmToggle = (type, newStatus) => {
  const action = newStatus ? 'تفعيل' : 'تعطيل';
  confirmDialogTitle.value = `${action} نوع الفاتورة`;
  confirmDialogMessage.value = `هل أنت متأكد من ${action} نوع الفاتورة "${type.name}"؟`;
  confirmText.value = action;
  pendingToggle.value = { type, newStatus };
  showConfirmDialog.value = true;
};

// Handle confirmed toggle
const handleConfirmToggle = async () => {
  if (!pendingToggle.value) return;

  const { type, newStatus } = pendingToggle.value;
  showConfirmDialog.value = false;

  await toggleStatus(type, newStatus);
  pendingToggle.value = null;
};

// Actual toggle API call
const toggleStatus = async (type, newStatus) => {
  toggling.value[type.id] = true;

  try {
    await api.update(type.id, { is_active: newStatus }, { showSuccess: false });

    // تحديث الحالة محلياً بدلاً من reload
    const typeIndex = invoiceTypes.value.findIndex(t => t.id === type.id);
    if (typeIndex !== -1) {
      invoiceTypes.value[typeIndex].is_active = newStatus;
    }

    const statusText = newStatus ? 'تم تفعيل' : 'تم تعطيل';
    toast.success(`${statusText} نوع الفاتورة "${type.name}" بنجاح`);
  } catch (error) {
    console.error('Error toggling invoice type status:', error);
    toast.error('حدث خطأ أثناء تغيير الحالة');
  } finally {
    toggling.value[type.id] = false;
  }
};

const loadData = () => fetchInvoiceTypes({ per_page: -1 });

onMounted(loadData);
</script>

<style scoped>
.invoice-types-page {
  padding: 0;
}

.max-width-300 {
  max-width: 300px;
}

.type-card {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-primary), 0.05);
  overflow: hidden;
}

.type-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(var(--v-theme-primary), 0.1) !important;
}

.type-card-image {
  height: 160px;
  background: linear-gradient(135deg, rgba(var(--v-theme-primary), 0.05) 0%, rgba(var(--v-theme-primary), 0.1) 100%);
}

.height-60 {
  height: 60px;
}

.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.gap-2 {
  gap: 8px;
}

.gap-4 {
  gap: 16px;
}
</style>
