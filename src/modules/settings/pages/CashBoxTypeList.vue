<template>
  <div class="cashbox-types-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold">أنواع الخزائن</h1>
      <p class="text-body-1 text-grey">إدارة أنواع الخزائن في النظام</p>
    </div>

    <AppDataTable
      title="أنواع الخزائن"
      icon="ri-list-settings-line"
      :headers="headers"
      :items="cashBoxTypes"
      :total-items="total"
      :loading="loading"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      @update:options="fetchCashBoxTypes($event)"
    >
      <template #actions>
        <AppButton v-if="canCreate" color="primary" prepend-icon="ri-add-line" @click="handleCreate"> نوع جديد </AppButton>
      </template>

      <template #item.name="{ item }">
        <div class="d-flex align-center">
          <v-icon icon="ri-money-dollar-box-line" size="small" color="warning" class="me-2" />
          <span class="font-weight-bold">{{ item.name }}</span>
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

    <!-- Form Dialog -->
    <AppDialog
      v-model="showDialog"
      :title="isEdit ? 'تعديل نوع الخزينة' : 'نوع خزينة جديد'"
      :icon="isEdit ? 'ri-edit-line' : 'ri-safe-add-line'"
      :loading="saving"
      max-width="500"
      @confirm="handleSave"
    >
      <v-form ref="formRef" @submit.prevent="handleSave">
        <v-row dense>
          <v-col cols="12">
            <AppInput v-model="formData.name" label="اسم النوع *" placeholder="مثال: خزنة فرعية" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12">
            <v-card variant="tonal" color="primary" class="pa-4 rounded-lg">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">حالة النشاط</div>
                  <div class="text-caption">تحديد ما إذا كان هذا النوع متاحاً للاختيار عند إضافة خزائن جديدة</div>
                </div>
                <v-switch v-model="formData.is_active" color="success" hide-details inset :true-value="1" :false-value="0" />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </AppDialog>

    <!-- Delete Dialog -->
    <AppDialog
      v-model="showDeleteDialog"
      title="حذف نوع الخزينة؟"
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
          هذا الإجراء قد يؤثر على الخزائن المرتبطة بهذا النوع!
        </div>
      </div>
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useCashBoxTypesData } from '../composables/useCashBoxTypesData';
import { useApi } from '@/composables/useApi';
import { useAuthStore } from '@/stores/auth';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';

const { cashBoxTypes, loading, total, fetchCashBoxTypes, deleteCashBoxType } = useCashBoxTypesData();
const api = useApi('/api/cash-box-types');

const page = ref(1);
const itemsPerPage = ref(10);
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);

// Permissions
const authStore = useAuthStore();
const isSuperAdmin = computed(() => authStore.user?.permissions?.includes('admin.super'));
const isCompanyAdmin = computed(() => authStore.user?.permissions?.includes('admin.company'));

const canCreate = computed(() => {
  return isSuperAdmin.value || isCompanyAdmin.value || authStore.user?.permissions?.includes('cash_box_types.create');
});

const canUpdate = item => {
  if (isSuperAdmin.value || isCompanyAdmin.value) return true;
  return (
    authStore.user?.permissions?.includes('cash_box_types.update_all') ||
    (authStore.user?.permissions?.includes('cash_box_types.update_self') && item.created_by === authStore.user?.id)
  );
};

const canDelete = item => {
  if (isSuperAdmin.value || isCompanyAdmin.value) return true;
  return (
    authStore.user?.permissions?.includes('cash_box_types.delete_all') ||
    (authStore.user?.permissions?.includes('cash_box_types.delete_self') && item.created_by === authStore.user?.id)
  );
};

const canUpdateAny = computed(() => {
  return (
    isSuperAdmin.value ||
    isCompanyAdmin.value ||
    authStore.user?.permissions?.includes('cash_box_types.update_all') ||
    authStore.user?.permissions?.includes('cash_box_types.update_self')
  );
});

const canDeleteAny = computed(() => {
  return (
    isSuperAdmin.value ||
    isCompanyAdmin.value ||
    authStore.user?.permissions?.includes('cash_box_types.delete_all') ||
    authStore.user?.permissions?.includes('cash_box_types.delete_self')
  );
});

const formData = ref({ name: '', is_active: 1 });
const isEdit = computed(() => !!selectedItem.value?.id);

const headers = computed(() => {
  const baseHeaders = [
    { title: 'الاسم', key: 'name', sortable: true },
    { title: 'الحالة', key: 'is_active', align: 'center', sortable: true },
  ];

  if (canUpdateAny.value || canDeleteAny.value) {
    baseHeaders.push({ title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', width: '120px' });
  }

  return baseHeaders;
});

const rules = { required: v => !!v || 'مطلوب' };

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { name: '', is_active: 1 };
  showDialog.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = { ...item };
  showDialog.value = true;
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
    await deleteCashBoxType(selectedItem.value.id);
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

const loadData = () => fetchCashBoxTypes({ page: page.value, per_page: itemsPerPage.value });

onMounted(loadData);
</script>

<style scoped>
.cashbox-types-page {
  padding: 24px;
}
</style>
