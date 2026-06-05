<!-- 
  تعليق عربي: شاشة إدارة الشركات المخصصة للسوبر أدمن أو من يملك صلاحيات إدارة الشركات في النظام.
  تمت إعادة هيكلتها لتستخدم المكون المشترك AppDataTable لتوفير تصميم موحد واحترافي.
-->
<template>
  <div class="companies-page">
    <AppDataTable
      class="tour-company-table"
      table-key="companies.index"
      v-model:sort-by="sortByVuetify"
      v-model:search="search"
      v-model:page="page"
      v-model:items-per-page="perPage"
      v-model="selectedItems"
      show-select
      :filters="advancedFilters"
      @update:filters="val => Object.assign(filters, val)"
      :headers="headers"
      :items="companies"
      :total-items="totalItems"
      :loading="loading"
      permission-module="companies"
      title="إدارة الشركات"
      subtitle="عرض وإدارة جميع شركات النظام (Tenants) وإعداداتها وصلاحياتها."
      icon="ri-building-line"
      empty-state-type="companies"
      @update:options="onTableOptionsUpdate"
      @view="handleView"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <!-- Actions Slot -->
      <template #actions>
        <div class="d-flex gap-2">
          <transition name="fade">
            <AppButton
              v-if="selectedItems.length > 0 && canDelete"
              color="error"
              variant="tonal"
              prepend-icon="ri-delete-bin-line"
              size="small"
              class="rounded-pill shadow-sm"
              style="height: 40px"
              @click="handleBatchDelete"
            >
              حذف المحدد ({{ selectedItems.length }})
            </AppButton>
          </transition>
          <AppButton
            v-if="canCreate"
            color="primary"
            prepend-icon="ri-add-line"
            size="small"
            class="rounded-pill shadow-sm tour-company-add"
            style="height: 40px"
            @click="handleCreate"
          >
            <span>إضافة شركة جديدة</span>
          </AppButton>
        </div>
      </template>

      <!-- Company Logo & Name -->
      <template #item.name="{ item }">
        <div class="d-flex align-center py-2">
          <v-avatar size="40" rounded="lg" color="primary-lighten-5" class="me-3 border">
            <v-img v-if="item.logo" :src="item.logo" contain />
            <v-icon v-else icon="ri-building-line" color="primary" size="20" />
          </v-avatar>
          <div>
            <div class="font-weight-bold text-primary">{{ item.name }}</div>
            <div class="text-caption text-grey">{{ item.field || 'لا يوجد نشاط محدد' }}</div>
          </div>
        </div>
      </template>

      <!-- Owner & Contact -->
      <template #item.owner_name="{ item }">
        <div>
          <div class="font-weight-medium">{{ item.owner_name || '-' }}</div>
          <div class="text-caption text-grey" v-if="item.email">
            <v-icon icon="ri-mail-line" size="12" class="me-1" />{{ item.email }}
          </div>
        </div>
      </template>

      <!-- Phone -->
      <template #item.phone="{ item }">
        <div v-if="item.phone" class="d-flex align-center">
          <v-icon icon="ri-phone-line" size="14" class="me-1 text-grey" />
          <span class="text-body-2">{{ item.phone }}</span>
        </div>
        <span v-else class="text-grey">-</span>
      </template>

      <!-- Branches Count -->
      <template #item.branches_count="{ item }">
        <v-chip color="info" size="small" variant="tonal" prepend-icon="ri-git-branch-line">
          {{ item.branches_count || 0 }} فروع
        </v-chip>
      </template>

      <!-- Created At -->
      <template #item.created_at="{ item }">
        <span class="text-caption text-grey">{{ formatDate(item.created_at) }}</span>
      </template>

      <!-- Actions Column -->
      <template #item.actions="{ item }">
        <div class="d-flex justify-end gap-1">
          <AppButton
            v-if="canUpdate"
            icon="ri-pencil-line"
            variant="text"
            color="primary"
            size="small"
            tooltip="تعديل"
            @click="handleEdit(item)"
          />
          <AppButton
            v-if="canDelete && item.id !== userStore.currentUser?.active_company_id"
            icon="ri-delete-bin-line"
            variant="text"
            color="error"
            size="small"
            tooltip="حذف"
            @click="handleDelete(item)"
          />
        </div>
      </template>
    </AppDataTable>

    <!-- Create/Edit/View Dialog -->
    <AppDialog
      v-model="showDialog"
      :title="isViewOnly ? 'تفاصيل الشركة' : (isEdit ? 'تعديل بيانات الشركة' : 'إضافة شركة جديدة')"
      :subtitle="isViewOnly ? 'عرض تفاصيل الشركة الحالية' : 'أدخل بيانات وتفاصيل الشركة'"
      :icon="isViewOnly ? 'ri-eye-line' : (isEdit ? 'ri-edit-line' : 'ri-add-line')"
      max-width="650"
      hide-actions
    >
      <v-form ref="formRef" v-model="isFormValid">
        <v-row dense>
          <!-- Logo Upload Zone -->
          <v-col cols="12" class="text-center mb-4">
            <div 
              class="logo-uploader-zone mx-auto" 
              :class="{ 'cursor-pointer': !isViewOnly }" 
              @click="!isViewOnly ? (showMediaGallery = true) : null"
            >
              <v-avatar size="90" rounded="lg" color="grey-lighten-4" class="border logo-preview-avatar">
                <v-img v-if="formData.logo" :src="formData.logo" contain />
                <div v-else class="text-center text-grey d-flex flex-column align-center justify-center">
                  <v-icon icon="ri-image-add-line" size="28" class="mb-1" />
                  <span class="text-xxs">{{ isViewOnly ? 'لا يوجد شعار' : 'اختر شعاراً' }}</span>
                </div>
              </v-avatar>
              <div v-if="!isViewOnly" class="mt-2 text-caption text-primary font-weight-medium">تغيير الشعار</div>
            </div>
          </v-col>

          <v-col cols="12">
            <v-text-field
              v-model="formData.name"
              label="اسم الشركة *"
              placeholder="اسم الشركة الرسمي والتجاري..."
              variant="outlined"
              required
              :rules="[v => !!v || 'اسم الشركة مطلوب']"
              prepend-inner-icon="ri-building-line"
              :readonly="isViewOnly"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.owner_name"
              label="اسم المالك / المدير"
              placeholder="الاسم الكامل لمالك الشركة..."
              variant="outlined"
              prepend-inner-icon="ri-user-line"
              :readonly="isViewOnly"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.field"
              label="النشاط التجاري"
              placeholder="مثال: تجارة التجزئة، خدمات برمجية..."
              variant="outlined"
              prepend-inner-icon="ri-service-line"
              :readonly="isViewOnly"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.phone"
              label="رقم الهاتف"
              variant="outlined"
              prepend-inner-icon="ri-phone-line"
              :readonly="isViewOnly"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-text-field
              v-model="formData.email"
              label="البريد الإلكتروني"
              variant="outlined"
              prepend-inner-icon="ri-mail-line"
              :rules="[v => !v || /.+@.+\..+/.test(v) || 'بريد إلكتروني غير صحيح']"
              :readonly="isViewOnly"
            />
          </v-col>

          <v-col cols="12">
            <v-textarea
              v-model="formData.address"
              label="العنوان الجغرافي"
              placeholder="المدينة، الشارع، تفاصيل العنوان..."
              variant="outlined"
              prepend-inner-icon="ri-map-pin-line"
              rows="2"
              :readonly="isViewOnly"
            />
          </v-col>
        </v-row>
      </v-form>

      <template #actions>
        <AppButton variant="tonal" color="grey" @click="showDialog = false">{{ isViewOnly ? 'إغلاق' : 'إلغاء' }}</AppButton>
        <AppButton
          v-if="!isViewOnly"
          color="primary"
          :loading="saving"
          :disabled="!isFormValid"
          @click="handleSave"
          class="px-8 font-weight-bold rounded-pill shadow-md"
        >
          <v-icon icon="ri-save-line" class="me-2" />
          حفظ البيانات
        </AppButton>
      </template>
    </AppDialog>

    <!-- Delete Confirmation Dialog -->
    <AppConfirmDialog
      v-model="showDeleteDialog"
      type="error"
      title="تأكيد الحذف"
      :message="
        isBatchDelete
          ? `هل أنت متأكد من حذف الشركات المحددة وعددها ${selectedItems.length}؟ سيتم حذف كافة البيانات المرتبطة بها نهائياً ولا يمكن التراجع عن هذا الإجراء.`
          : `هل أنت متأكد من حذف الشركة '${selectedItem?.name}'؟ سيتم حذف كافة البيانات المرتبطة بها نهائياً ولا يمكن التراجع عن هذا الإجراء.`
      "
      confirm-text="حذف نهائي"
      cancel-text="تراجع"
      :loading="deleting"
      @confirm="confirmDelete"
      @cancel="showDeleteDialog = false"
    />

    <!-- Media Gallery Selector -->
    <MediaGallery v-model="showMediaGallery" type="logo" @select="handleImageSelect" />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import { useUserStore } from '@/stores/user';
import { PERMISSIONS } from '@/config/permissions';
import { toast } from 'vue3-toastify';
import { useDataTable } from '@/composables/useDataTable';
import { AppDataTable, AppButton, AppDialog, AppConfirmDialog } from '@/components';
import MediaGallery from '@/components/common/MediaGallery.vue';

const userStore = useUserStore();
const api = useApi('/api/companies');
const route = useRoute();
const router = useRouter();

// Check Permissions
const canCreate = computed(() => userStore.hasPermission(PERMISSIONS.COMPANIES_CREATE));
const canUpdate = computed(() =>
  userStore.hasPermission([
    PERMISSIONS.COMPANIES_UPDATE_ALL,
    PERMISSIONS.COMPANIES_UPDATE_CHILDREN,
    PERMISSIONS.COMPANIES_UPDATE_SELF,
  ])
);
const canDelete = computed(() =>
  userStore.hasPermission([
    PERMISSIONS.COMPANIES_DELETE_ALL,
    PERMISSIONS.COMPANIES_DELETE_CHILDREN,
    PERMISSIONS.COMPANIES_DELETE_SELF,
  ])
);

// Advanced Filters Definition
const advancedFilters = computed(() => {
  return [
    {
      key: 'created_at_from',
      title: 'من تاريخ',
      type: 'date',
    },
    {
      key: 'created_at_to',
      title: 'إلى تاريخ',
      type: 'date',
    },
  ];
});

// API fetch function
const fetchCompaniesApi = async params => {
  return await api.get(params, { showLoading: false });
};

// DataTable logic
const {
  items: companies,
  loading,
  currentPage: page,
  perPage,
  total: totalItems,
  search,
  filters,
  sortByVuetify,
  changeSort,
  refresh,
} = useDataTable(fetchCompaniesApi, {
  syncWithUrl: true,
  initialSortBy: 'id',
  initialSortOrder: 'desc',
  initialPerPage: 15,
  immediate: true,
});

// State
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const showMediaGallery = ref(false);
const selectedItem = ref(null);
const selectedItems = ref([]);
const isBatchDelete = ref(false);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);
const isFormValid = ref(false);
const isViewOnly = ref(false);

// تعليق عربي: مراقبة معلمة الاستعلام لفتح حوار إضافة الشركة تلقائياً عند الدخول من القائمة الجانبية
watch(
  () => route.query.action,
  (action) => {
    if (action === 'create') {
      if (canCreate.value) {
        handleCreate();
      } else {
        toast.error('ليس لديك صلاحية إضافة شركة جديدة');
      }
    }
  },
  { immediate: true }
);

// تعليق عربي: مسح معلمة الاستعلام من الرابط عند إغلاق حوار الإضافة/التعديل
watch(showDialog, (newVal) => {
  if (!newVal && route.query.action === 'create') {
    router.replace({ query: { ...route.query, action: undefined } });
  }
});

// Table Settings
const headers = [
  { title: 'اسم الشركة والنشاط', key: 'name', align: 'start', sortable: true, mandatory: true },
  { title: 'المدير / المالك', key: 'owner_name', sortable: true },
  { title: 'رقم الهاتف', key: 'phone', sortable: false },
  { title: 'الفروع', key: 'branches_count', align: 'center', sortable: false },
  { title: 'تاريخ الإنشاء', key: 'created_at', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', mandatory: true },
];

const formData = ref({
  name: '',
  owner_name: '',
  field: '',
  phone: '',
  email: '',
  address: '',
  logo: '',
  images_ids: [],
});

const isEdit = computed(() => !!selectedItem.value?.id);

const onTableOptionsUpdate = options => {
  changeSort(options);
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = {
    name: '',
    owner_name: '',
    field: '',
    phone: '',
    email: '',
    address: '',
    logo: '',
    images_ids: [],
  };
  isViewOnly.value = false;
  showDialog.value = true;
};

const handleEdit = (item) => {
  selectedItem.value = item;
  formData.value = {
    name: item.name || '',
    owner_name: item.owner_name || '',
    field: item.field || '',
    phone: item.phone || '',
    email: item.email || '',
    address: item.address || '',
    logo: item.logo || '',
    images_ids: [],
  };
  isViewOnly.value = false;
  showDialog.value = true;
};

// تعليق عربي: دالة عرض تفاصيل الشركة الحالية في حوار العرض (Read-Only)
const handleView = (item) => {
  selectedItem.value = item;
  formData.value = {
    name: item.name || '',
    owner_name: item.owner_name || '',
    field: item.field || '',
    phone: item.phone || '',
    email: item.email || '',
    address: item.address || '',
    logo: item.logo || '',
    images_ids: [],
  };
  isViewOnly.value = true;
  showDialog.value = true;
};

const handleImageSelect = (image) => {
  formData.value.logo = image.url;
  formData.value.images_ids = [image.id];
  showMediaGallery.value = false;
};

const handleDelete = (item) => {
  selectedItem.value = item;
  isBatchDelete.value = false;
  showDeleteDialog.value = true;
};

const handleBatchDelete = () => {
  isBatchDelete.value = true;
  showDeleteDialog.value = true;
};

const handleSave = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    const payload = { ...formData.value };
    // Only send images_ids if selected
    if (payload.images_ids.length === 0) {
      delete payload.images_ids;
    }

    if (isEdit.value) {
      await api.update(selectedItem.value.id, payload, { successMessage: 'تم تحديث بيانات الشركة بنجاح' });
    } else {
      await api.create(payload, { successMessage: 'تم إضافة الشركة بنجاح' });
    }
    showDialog.value = false;
    refresh();
  } catch (error) {
    // Error handled by useApi
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    if (isBatchDelete.value) {
      // Bulk delete using API custom request
      await api.request('POST', 'delete', { item_ids: selectedItems.value }, { successMessage: 'تم حذف الشركات المحددة بنجاح' });
      selectedItems.value = [];
    } else {
      await api.request('POST', 'delete', { item_ids: [selectedItem.value.id] }, { successMessage: 'تم حذف الشركة بنجاح' });
    }
    showDeleteDialog.value = false;
    refresh();
  } catch (error) {
    // Error handled by useApi
  } finally {
    deleting.value = false;
  }
};

// Utils
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
};
</script>

<style scoped>
.companies-page {
  max-width: 100%;
}

.dialog-premium-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.logo-uploader-zone {
  display: inline-block;
  position: relative;
  transition: all 0.2s ease;
}

.logo-uploader-zone:hover {
  transform: scale(1.03);
}

.logo-preview-avatar {
  border-style: dashed !important;
  border-width: 2px !important;
  border-color: rgba(var(--v-border-color), 0.4) !important;
}

.gap-2 {
  gap: 8px;
}

.text-xxs {
  font-size: 0.7rem !important;
}
</style>
