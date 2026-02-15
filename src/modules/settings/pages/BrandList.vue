<template>
  <div v-if="canAny(PERMISSIONS.BRANDS_VIEW_ALL, PERMISSIONS.BRANDS_VIEW_CHILDREN, PERMISSIONS.BRANDS_VIEW_SELF)" class="brands-page">
    <v-container fluid class="pa-0">
      <v-row class="ma-0">
        <v-col cols="12" class="pa-0">
          <v-card rounded="md" class="border shadow-sm">
            <AppDataTable
              v-model:sort-by="sortByVuetify"
              v-model:search="search"
              :headers="headers"
              :items="brands"
              :total-items="total"
              :loading="loading"
              :table-height="'calc(100vh - 220px)'"
              grid-enabled
              :grid-options="{
                titleKey: 'name',
                imageKey: 'image_url',
                bodyKeys: ['products_count', 'active'],
              }"
              infinite-scroll
              :has-more="brands.length < total"
              permission-module="brands"
              title="العلامات التجارية"
              subtitle="إدارة وتحليل العلامات التجارية للمنتجات"
              icon="ri-award-line"
              @update:options="onTableOptionsUpdate"
              @edit="handleEdit"
              @delete="handleDelete"
              @load="handleLoadMore"
            >
              <!-- Actions Slot -->
              <template #actions>
                <AppButton v-if="can(PERMISSIONS.BRANDS_CREATE)" prepend-icon="ri-add-line" size="small" @click="handleCreate">
                  علامة جديدة
                </AppButton>
              </template>

              <!-- List View Customizations -->
              <template #[`item.name`]="{ item }">
                <div class="d-flex align-center py-2">
                  <AppAvatar :img-url="item.image_url" :name="item.name" type="brand" size="48" class="me-3 border" />
                  <div class="d-flex flex-column">
                    <span class="font-weight-bold text-subtitle-1">{{ item.name }}</span>
                    <span class="text-caption text-grey text-truncate max-width-200">
                      {{ item.description || 'بدون وصف' }}
                    </span>
                  </div>
                </div>
              </template>

              <template #[`item.products_count`]="{ item }">
                <v-chip size="small" variant="tonal" prepend-icon="ri-box-3-line" color="primary">
                  {{ item.products_count || 0 }}
                </v-chip>
              </template>

              <template #[`item.active`]="{ item }">
                <div class="d-flex align-center justify-center">
                  <span
                    v-if="
                      canAny(PERMISSIONS.BRANDS_UPDATE_ALL, PERMISSIONS.BRANDS_UPDATE_CHILDREN, PERMISSIONS.BRANDS_UPDATE_SELF, { resource: item })
                    "
                    class="text-caption me-2 font-weight-bold"
                    :class="item.active ? 'text-success' : 'text-error'"
                  >
                    {{ item.active ? 'نشط' : 'معطل' }}
                  </span>
                  <AppSwitch
                    v-if="
                      canAny(PERMISSIONS.BRANDS_UPDATE_ALL, PERMISSIONS.BRANDS_UPDATE_CHILDREN, PERMISSIONS.BRANDS_UPDATE_SELF, {
                        resource: item,
                      })
                    "
                    :model-value="!!item.active"
                    :loading="togglingId === item.id"
                    @update:model-value="handleToggleStatus(item)"
                  />
                  <v-chip v-else :color="item.active ? 'success' : 'error'" size="x-small">
                    {{ item.active ? 'نشط' : 'معطل' }}
                  </v-chip>
                </div>
              </template>
            </AppDataTable>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>

  <!-- Access Denied State (Updated with AppButton) -->
  <div v-else class="pa-4 text-center d-flex flex-column align-center justify-center" style="min-height: 400px">
    <!-- Brand Form Dialog -->
    <AppDialog
      v-model="showDialog"
      :title="isEdit ? 'تعديل العلامة التجارية' : 'إضافة علامة تجارية جديدة'"
      :icon="isEdit ? 'ri-edit-line' : 'ri-award-line'"
      :loading="saving"
      max-width="650"
      @confirm="handleSave"
    >
      <v-form ref="formRef" @submit.prevent="handleSave">
        <v-row>
          <!-- Logo Selection Section -->
          <v-col cols="12" class="d-flex justify-center mb-2">
            <div class="logo-preview-zone position-relative cursor-pointer" @click="showMediaGallery = true">
              <v-avatar size="140" rounded="md" color="grey-lighten-4" class="border-2 border-dashed elevation-1 hover-scale overflow-hidden">
                <v-img v-if="imagePreview" :src="imagePreview" cover />
                <v-icon v-else icon="ri-image-add-line" size="40" color="grey-lighten-1" />

                <div class="change-overlay d-flex flex-column align-center justify-center rounded-md">
                  <v-icon icon="ri-exchange-line" color="white" size="24" />
                  <span class="text-white text-caption mt-1 font-weight-bold">تغيير الشعار</span>
                </div>
              </v-avatar>

              <AppButton icon="ri-gallery-line" size="small" class="position-absolute bottom-0 right-0 elevation-4" />
            </div>
          </v-col>

          <v-col cols="12">
            <AppInput v-model="formData.name" label="اسم العلامة التجارية *" prepend-inner-icon="ri-award-line" :rules="[rules.required]" />
          </v-col>

          <v-col cols="12">
            <AppInput
              v-model="formData.description"
              label="وصف العلامة التجارية"
              type="textarea"
              prepend-inner-icon="ri-text-snippet"
              rows="3"
              counter
              maxlength="500"
            />
          </v-col>

          <v-col cols="12">
            <v-card variant="tonal" color="primary" class="pa-4 rounded-md">
              <div class="d-flex align-center justify-space-between">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">حالة النشاط</div>
                  <div class="text-caption">تحديد ما إذا كانت الماركة تظهر في قائمة المنتجات</div>
                </div>
                <AppSwitch v-model="formData.active" hide-details />
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </AppDialog>

    <!-- Delete Confirmation -->
    <AppDialog
      v-model="showDeleteDialog"
      title="حذف الماركة؟"
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
      </div>
    </AppDialog>

    <!-- Media Gallery -->
    <MediaGallery v-model="showMediaGallery" type="logo" @select="handleImageSelect" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useBrandsData } from '../composables/useBrandsData';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import MediaGallery from '@/components/common/MediaGallery.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import { PERMISSIONS } from '@/config/permissions';
const { can, canAny } = usePermissions();
const api = useApi('/api/brands');
const { deleteBrand } = useBrandsData();

// API fetch function for useDataTable
const fetchBrandsApi = async params => {
  return await api.get(params, { showLoading: false });
};

// DataTable logic
const {
  items: brands,
  loading,
  currentPage: page,
  perPage: itemsPerPage,
  total,
  search,
  filters,
  sortBy,
  sortByVuetify,
  changePage,
  changeSort,
  applyFilters,
  fetchData,
} = useDataTable(fetchBrandsApi, {
  syncWithUrl: true,
  initialSortBy: 'name',
  initialSortOrder: 'asc',
  initialPerPage: 12,
  immediate: true,
});

// UI State
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const showMediaGallery = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);
const imagePreview = ref(null);

const formData = ref({ name: '', active: true, description: '', image_id: null });
const isEdit = computed(() => !!selectedItem.value?.id);
const togglingId = ref(null);

const handleToggleStatus = async item => {
  togglingId.value = item.id;
  try {
    await api.update(item.id, { active: !item.active });
    item.active = !item.active;
  } finally {
    togglingId.value = null;
  }
};

const headers = [
  { title: 'الماركة', key: 'name', sortable: true },
  { title: 'المنتجات', key: 'products_count', align: 'center', sortable: true },
  { title: 'الحالة', key: 'active', align: 'center', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', width: '120px' },
];

const rules = { required: v => !!v || 'هذا الحقل مطلوب' };

const handleImageSelect = image => {
  formData.value.image_id = image.id;
  imagePreview.value = image.url;
};

const handleSearch = () => {
  applyFilters();
};

const handleLoadMore = () => {
  if (loading.value || brands.value.length >= total.value) return;
  page.value++;
  fetchData({ append: true });
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { name: '', active: true, description: '', image_id: null };
  imagePreview.value = null;
  showDialog.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = {
    name: item.name,
    active: !!item.active,
    description: item.description,
    image_id: item.image_id,
  };
  imagePreview.value = item.image_url;
  showDialog.value = true;
};

const handleDelete = item => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

const handleSave = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    if (isEdit.value) {
      await api.update(selectedItem.value.id, formData.value, { successMessage: 'تم تحديث الماركة' });
    } else {
      await api.create(formData.value, { successMessage: 'تم إضافة الماركة' });
    }
    showDialog.value = false;
    fetchData();
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deleteBrand(selectedItem.value.id);
    showDeleteDialog.value = false;
    fetchData();
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  // Initial load is handled by useDataTable unless specified otherwise
});

const onTableOptionsUpdate = options => {
  // standardized handling
  changeSort(options);
};
</script>

<style scoped>
.brands-page {
  padding: 0px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.max-width-300 {
  max-width: 300px;
}

.brand-card {
  transition: all 0.3s ease;
  border-radius: 4px;
  border: 1px solid #eee;
}

.brand-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
}

.brand-card-header {
  height: 180px;
  border-radius: 16px 16px 0 0;
}

.height-40 {
  height: 40px;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.logo-preview-zone .change-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 2;
}

.logo-preview-zone:hover .change-overlay {
  opacity: 1;
}

.hover-scale {
  transition: transform 0.2s;
}

.hover-scale:hover {
  transform: scale(1.02);
}

.modern-table :deep(.v-data-table__th) {
  background-color: #f1f3f5 !important;
  font-weight: 700 !important;
  color: #495057 !important;
}
</style>
