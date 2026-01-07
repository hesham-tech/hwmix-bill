<template>
  <div class="cashbox-page">
    <div class="mb-6 px-6 pt-6">
      <h1 class="text-h4 font-weight-bold">الخزائن</h1>
      <p class="text-body-1 text-grey">إدارة الخزائن النقدية والأرصدة المتاحة للعمليات</p>
    </div>

    <div class="px-6 pb-6">
      <div class="px-6 pb-6">
        <!-- Top Action Bar -->
        <AppCard class="mb-6">
          <div class="d-flex align-center flex-wrap gap-4">
            <AppInput
              v-model="search"
              label="بحث عن خزينة..."
              prepend-inner-icon="ri-search-line"
              class="max-width-300 flex-grow-1"
              hide-details
              @update:model-value="handleSearch"
            />

            <v-spacer />

            <div class="d-flex align-center gap-3">
              <AppButton v-if="canCreate" color="primary" prepend-icon="ri-add-line" @click="handleCreate"> خزينة جديدة </AppButton>

              <v-btn-group variant="outlined" density="comfortable" color="primary" class="bg-white">
                <AppButton :active="viewMode === 'grid'" icon="ri-grid-fill" @click="viewMode = 'grid'" title="عرض شبكي" />
                <AppButton :active="viewMode === 'list'" icon="ri-list-check" @click="viewMode = 'list'" title="عرض قائمة" />
              </v-btn-group>
            </div>
          </div>
        </AppCard>

        <LoadingSpinner v-if="loading" />

        <template v-else>
          <EmptyState v-if="cashBoxes.length === 0" icon="ri-safe-2-line" title="لا توجد خزائن" subtitle="لم يتم العثور على أي خزائن مطابقة لبحثك." />

          <template v-else>
            <!-- Grid View -->
            <v-row v-if="viewMode === 'grid'">
              <v-col v-for="item in cashBoxes" :key="item.id" cols="12" sm="6" md="4" lg="3">
                <AppCard class="cashbox-card h-100" no-padding>
                  <div class="cashbox-card-header d-flex align-center justify-center pa-4 bg-grey-lighten-4 position-relative">
                    <v-avatar size="80" rounded="lg" class="elevation-1 bg-white">
                      <v-icon icon="ri-safe-2-line" size="40" color="warning" />
                    </v-avatar>

                    <v-chip
                      :color="item.is_active ? 'success' : 'error'"
                      size="x-small"
                      class="position-absolute top-2 right-2 font-weight-bold"
                      variant="flat"
                    >
                      {{ item.is_active ? 'نشط' : 'معطل' }}
                    </v-chip>
                  </div>

                  <v-card-item>
                    <v-card-title class="text-h6 font-weight-bold">{{ item.name }}</v-card-title>
                    <v-card-subtitle class="d-flex align-center mt-1">
                      <v-chip v-if="item.type" size="x-small" variant="flat" color="primary-lighten-5" class="text-primary font-weight-bold">
                        {{ item.type.name }}
                      </v-chip>
                    </v-card-subtitle>
                  </v-card-item>

                  <v-card-text class="pt-0">
                    <div class="d-flex align-center justify-space-between mt-2">
                      <span class="text-caption text-grey">الرصيد الحالي</span>
                      <span class="font-weight-black" :class="item.balance >= 0 ? 'text-success' : 'text-error'">
                        {{ formatCurrency(item.balance) }}
                      </span>
                    </div>
                  </v-card-text>

                  <template v-if="canUpdate(item) || canDelete(item)" #actions>
                    <v-spacer />
                    <AppButton v-if="canUpdate(item)" icon="ri-edit-line" variant="text" color="primary" tooltip="تعديل" @click="handleEdit(item)" />
                    <AppButton
                      v-if="canDelete(item)"
                      icon="ri-delete-bin-line"
                      variant="text"
                      color="error"
                      tooltip="حذف"
                      @click="handleDelete(item)"
                    />
                  </template>
                </AppCard>
              </v-col>

              <!-- Pagination for Grid -->
              <v-col cols="12" class="mt-4">
                <div class="d-flex align-center justify-space-between flex-wrap gap-4">
                  <div class="text-body-2 text-grey">عرض {{ cashBoxes.length }} من إجمالي {{ total }} خزينة</div>
                  <v-pagination
                    v-model="page"
                    :length="Math.ceil(total / itemsPerPage)"
                    :total-visible="5"
                    rounded="circle"
                    size="small"
                    @update:model-value="loadData"
                  />
                </div>
              </v-col>
            </v-row>

            <!-- List View -->
            <AppDataTable
              v-else
              :headers="headers"
              :items="cashBoxes"
              :loading="loading"
              :items-length="total"
              :items-per-page="itemsPerPage"
              :page="page"
              title="قائمة الخزائن"
              icon="ri-safe-2-line"
              @update:page="
                page = $event;
                loadData();
              "
              @update:items-per-page="handleItemsPerPageChange"
            >
              <template #item.name="{ item }">
                <div class="d-flex align-center">
                  <v-icon icon="ri-money-dollar-box-line" size="small" color="warning" class="me-2" />
                  <span class="font-weight-bold">{{ item.name }}</span>
                </div>
              </template>

              <template #item.type="{ item }">
                <v-chip v-if="item.type" size="small" variant="flat" color="primary-lighten-5" class="text-primary font-weight-bold">
                  {{ item.type.name }}
                </v-chip>
                <span v-else class="text-grey-lighten-1 text-caption">غير محدد</span>
              </template>

              <template #item.balance="{ item }">
                <div class="text-end font-weight-black" :class="item.balance >= 0 ? 'text-success' : 'text-error'">
                  {{ formatCurrency(item.balance) }}
                </div>
              </template>

              <template #item.is_active="{ item }">
                <v-chip :color="item.is_active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold px-3">
                  {{ item.is_active ? 'نشط' : 'غير نشط' }}
                </v-chip>
              </template>

              <template #item.actions="{ item }">
                <div class="d-flex justify-end gap-1">
                  <AppButton
                    v-if="canUpdate(item)"
                    icon="ri-edit-line"
                    size="x-small"
                    variant="text"
                    color="primary"
                    tooltip="تعديل"
                    @click="handleEdit(item)"
                  />
                  <AppButton
                    v-if="canDelete(item)"
                    icon="ri-delete-bin-line"
                    size="x-small"
                    variant="text"
                    color="error"
                    tooltip="حذف"
                    @click="handleDelete(item)"
                  />
                </div>
              </template>
            </AppDataTable>
          </template>
        </template>
      </div>
    </div>

    <!-- Form Dialog -->
    <!-- Form Dialog -->
    <AppDialog
      v-model="showDialog"
      :title="isEdit ? 'تعديل الخزينة' : 'إضافة خزينة جديدة'"
      :icon="isEdit ? 'ri-edit-line' : 'ri-safe-2-line'"
      :loading="saving"
      max-width="650"
      @confirm="handleSave"
    >
      <v-form ref="formRef" @submit.prevent="handleSave">
        <v-row dense>
          <v-col cols="12">
            <AppInput v-model="formData.name" label="اسم الخزينة *" placeholder="مثال: الخزينة الرئيسية" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12">
            <v-select
              v-model="formData.cash_box_type_id"
              :items="cashBoxTypes"
              :loading="loadingTypes"
              item-title="name"
              item-value="id"
              label="نوع الخزينة *"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="ri-list-settings-line"
              :rules="[rules.required]"
              hide-details
              class="mb-4"
            />
          </v-col>
          <v-col cols="12">
            <AppInput
              v-model.number="formData.initial_balance"
              label="الرصيد الافتتاحي"
              type="number"
              step="0.01"
              prepend-inner-icon="ri-money-dollar-circle-line"
              :disabled="isEdit"
            />
          </v-col>
          <v-col cols="12">
            <v-card variant="tonal" color="primary" class="pa-4 rounded-lg">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">حالة النشاط</div>
                  <div class="text-caption">تحديد ما إذا كانت الخزينة متاحة حالياً للعمليات</div>
                </div>
                <v-switch v-model="formData.is_active" color="success" hide-details inset :true-value="1" :false-value="0" />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </AppDialog>

    <!-- Delete Dialog -->
    <!-- Delete Confirmation Dialog -->
    <AppDialog
      v-model="showDeleteDialog"
      title="حذف الخزينة؟"
      icon="ri-delete-bin-7-line"
      confirm-color="error"
      confirm-text="تأكيد الحذف"
      :loading="deleting"
      @confirm="confirmDelete"
    >
      <div class="text-center pa-4">
        <v-avatar color="error-lighten-5" size="80" class="mb-4 mx-auto">
          <v-icon icon="ri-delete-bin-7-line" color="error" size="40" />
        </v-avatar>
        <p class="text-body-1 text-grey-darken-1">هل أنت متأكد من حذف "{{ selectedItem?.name }}"؟</p>
        <div class="mt-2 text-error text-caption font-weight-bold">
          <v-icon icon="ri-error-warning-line" size="small" class="me-1" />
          هذا الإجراء قد يؤثر على السجلات المالية المرتبطة!
        </div>
      </div>
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useCashBoxesData } from '../composables/useCashBoxesData';
import { useApi } from '@/composables/useApi';
import { useAuthStore } from '@/stores/auth';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppCard from '@/components/common/AppCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';

// Simple debounce
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const { cashBoxes, loading, total, fetchCashBoxes, deleteCashBox } = useCashBoxesData();
const api = useApi('/api/cash-boxes');
const typesApi = useApi('/api/cash-box-types');

const page = ref(1);
const itemsPerPage = ref(12);
const viewMode = ref('grid');
const search = ref('');
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);
const cashBoxTypes = ref([]);
const loadingTypes = ref(false);

// Permissions
const authStore = useAuthStore();
const isSuperAdmin = computed(() => authStore.user?.permissions?.includes('admin.super'));
const isCompanyAdmin = computed(() => authStore.user?.permissions?.includes('admin.company'));

const canCreate = computed(() => {
  return isSuperAdmin.value || isCompanyAdmin.value || authStore.user?.permissions?.includes('cash_boxes.create');
});

const canUpdate = item => {
  if (isSuperAdmin.value || isCompanyAdmin.value) return true;
  return (
    authStore.user?.permissions?.includes('cash_boxes.update_all') ||
    (authStore.user?.permissions?.includes('cash_boxes.update_self') && item.created_by === authStore.user?.id)
  );
};

const canDelete = item => {
  if (isSuperAdmin.value || isCompanyAdmin.value) return true;
  return (
    authStore.user?.permissions?.includes('cash_boxes.delete_all') ||
    (authStore.user?.permissions?.includes('cash_boxes.delete_self') && item.created_by === authStore.user?.id)
  );
};

const canUpdateAny = computed(() => {
  return (
    isSuperAdmin.value ||
    isCompanyAdmin.value ||
    authStore.user?.permissions?.includes('cash_boxes.update_all') ||
    authStore.user?.permissions?.includes('cash_boxes.update_self')
  );
});

const canDeleteAny = computed(() => {
  return (
    isSuperAdmin.value ||
    isCompanyAdmin.value ||
    authStore.user?.permissions?.includes('cash_boxes.delete_all') ||
    authStore.user?.permissions?.includes('cash_boxes.delete_self')
  );
});

const formData = ref({ name: '', cash_box_type_id: null, initial_balance: 0, is_active: 1 });
const isEdit = computed(() => !!selectedItem.value?.id);

const headers = computed(() => {
  const baseHeaders = [
    { title: 'الاسم', key: 'name', sortable: true },
    { title: 'النوع', key: 'type', sortable: true },
    { title: 'الرصيد', key: 'balance', align: 'end', sortable: true },
    { title: 'الحالة', key: 'is_active', align: 'center', sortable: true },
  ];

  if (canUpdateAny.value || canDeleteAny.value) {
    baseHeaders.push({ title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', width: '120px' });
  }

  return baseHeaders;
});

const rules = { required: v => !!v || 'مطلوب' };

const loadTypes = async () => {
  loadingTypes.value = true;
  try {
    const response = await typesApi.get({ per_page: 100 }, { showLoading: false, showError: false });
    cashBoxTypes.value = response.data || [];
  } finally {
    loadingTypes.value = false;
  }
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { name: '', cash_box_type_id: null, initial_balance: 0, is_active: 1 };
  showDialog.value = true;
  if (!cashBoxTypes.value.length) loadTypes();
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = { ...item };
  showDialog.value = true;
  if (!cashBoxTypes.value.length) loadTypes();
};

const handleDelete = item => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

const handleSave = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    if (isEdit.value) {
      await api.update(selectedItem.value.id, formData.value, { successMessage: 'تم التحديث بنجاح' });
    } else {
      await api.create(formData.value, { successMessage: 'تم الإضافة بنجاح' });
    }
    showDialog.value = false;
    loadData();
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deleteCashBox(selectedItem.value.id);
    showDeleteDialog.value = false;
    loadData();
  } finally {
    deleting.value = false;
  }
};

const handleItemsPerPageChange = value => {
  itemsPerPage.value = value;
  page.value = 1;
  loadData();
};

const formatCurrency = amount => {
  if (amount === undefined || amount === null) return '0.00 ج.م';
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(amount);
};

const handleSearch = debounce(() => {
  page.value = 1;
  loadData();
}, 500);

const loadData = () => fetchCashBoxes({ page: page.value, per_page: itemsPerPage.value, name: search.value });

onMounted(loadData);
watch(page, () => loadData());
</script>

<style scoped></style>
