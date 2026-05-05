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
              infinite-scroll
              :has-more="brands.length < total"
              permission-module="brands"
              sticky-actions
              title="العلامات التجارية"
              subtitle="إدارة وتحليل العلامات التجارية للمنتجات وهويتها"
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
              
              <!-- Grid View Slot -->
              <template #grid="{ items, handleContextMenu }">
                <v-row dense>
                  <v-col v-for="brand in items" :key="brand.id" cols="12" sm="6" md="4" lg="3">
                    <v-card
                      class="grid-card transition-all-cubic overflow-hidden"
                      @click="handleEdit(brand)"
                      @contextmenu.prevent="handleContextMenu($event, { item: brand })"
                    >
                      <div class="brand-grid-header d-flex align-center justify-center pa-6 bg-slate-50 position-relative border-b">
                        <v-avatar
                          size="110"
                          rounded="md"
                          class="elevation-4 border-white-4 overflow-hidden"
                          :color="brand.active ? 'white' : 'slate-200'"
                        >
                          <v-img v-if="brand.image_url" :src="brand.image_url" cover />
                          <v-icon
                            v-else
                            icon="ri-image-line"
                            size="40"
                            :color="brand.active ? 'primary' : 'slate-400'"
                          />
                        </v-avatar>

                        <div class="position-absolute" style="top: 12px; right: 12px">
                          <AppSwitch
                            v-if="canAny(PERMISSIONS.BRANDS_UPDATE_ALL, { resource: brand })"
                            :model-value="!!brand.active"
                            :loading="togglingId === brand.id"
                            density="compact"
                            @click.stop
                            @update:model-value="handleToggleStatus(brand)"
                          />
                        </div>
                      </div>

                      <v-card-text class="pt-4 pb-2">
                        <div class="text-h6 font-weight-bold text-slate-800 mb-1 text-truncate" :title="brand.name">
                          {{ brand.name }}
                        </div>

                        <div class="d-flex align-center text-caption text-slate-500 mb-2">
                          <v-icon icon="ri-box-3-line" size="14" class="me-1" />
                          <span>{{ brand.products_count || 0 }} منتج</span>
                          <v-spacer />
                          <span class="text-slate-400">ID: {{ brand.id }}</span>
                        </div>
                        
                        <p class="text-caption text-slate-400 text-truncate" v-if="brand.description">
                          {{ brand.description }}
                        </p>
                      </v-card-text>

                      <v-divider class="opacity-50" />

                      <v-card-actions class="px-4 py-2">
                        <v-btn
                          icon="ri-pencil-line"
                          variant="text"
                          color="primary"
                          size="small"
                          @click.stop="handleEdit(brand)"
                        />
                        <v-spacer />
                        <v-btn
                          v-if="canAny(PERMISSIONS.BRANDS_DELETE_ALL, { resource: brand })"
                          icon="ri-delete-bin-line"
                          variant="text"
                          color="error"
                          size="small"
                          @click.stop="handleDelete(brand)"
                        />
                      </v-card-actions>
                    </v-card>
                  </v-col>
                </v-row>
              </template>

              <!-- List View Customizations -->
              <template #[`item.name`]="{ item }">
                <div class="d-flex align-center py-2">
                  <AppAvatar :img-url="item.image_url" :name="item.name" type="brand" size="48" class="me-3 border" />
                  <div class="d-flex flex-column">
                    <span class="font-weight-bold text-subtitle-1">{{ item.name }}</span>
                    <div v-if="item.synonyms?.length" class="text-caption text-grey-darken-1 d-flex align-center gap-1">
                      <v-icon icon="ri-price-tag-3-line" size="12" />
                      <span class="text-truncate" style="max-width: 250px">{{ item.synonyms.join(', ') }}</span>
                    </div>
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
                      canAny(PERMISSIONS.BRANDS_UPDATE_ALL, PERMISSIONS.BRANDS_UPDATE_CHILDREN) ||
                      can(PERMISSIONS.BRANDS_UPDATE_SELF, { resource: item })
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

              <!-- Extra Actions Slot -->
              <template #extra-actions="{ item }">
                <v-list-item
                  v-if="item.company_id && can(PERMISSIONS.BRANDS_GLOBALIZE)"
                  prepend-icon="ri-global-line"
                  title="تحويل لسجل عالمي"
                  class="text-warning"
                  @click="handleGlobalize(item)"
                />
                <v-list-item
                  v-if="can(PERMISSIONS.BRANDS_MERGE)"
                  prepend-icon="ri-merge-cells-horizontal"
                  title="دمج الماركة"
                  class="text-secondary"
                  @click="openMergeDialog(item)"
                />
              </template>
            </AppDataTable>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

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
            <AppAutocomplete
              v-if="!isEdit"
              v-model="formData.name"
              label="اسم العلامة التجارية (بحث أو إضافة) *"
              prepend-inner-icon="ri-award-line"
              placeholder="ابحث عن علامة موجودة أو اكتب اسماً جديداً"
              api-endpoint="/api/brands"
              item-title="name"
              item-value="name"
              can-create
              :rules="[rules.required]"
            />
            <AppInput v-else v-model="formData.name" label="اسم العلامة التجارية *" prepend-inner-icon="ri-award-line" :rules="[rules.required]" />
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

    <!-- Admin Merge Dialog -->
    <MergeDialog
      v-model="showMergeDialog"
      :source-item="mergingItem"
      api-endpoint="brands"
      title="الماركة"
      :loading="merging"
      @confirm="handleMergeConfirm"
    />
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
import AppAutocomplete from '@/components/common/AppAutocomplete.vue';
import MergeDialog from '../components/MergeDialog.vue';
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

// Admin UI State
const globalizingId = ref(null);
const showMergeDialog = ref(false);
const mergingItem = ref(null);
const merging = ref(false);

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

// Admin Handlers
const handleGlobalize = async item => {
  globalizingId.value = item.id;
  try {
    await api.request('post', `/${item.id}/globalize`, {}, { successMessage: 'تم التحويل لنظام عالمي بنجاح' });
    fetchData();
  } finally {
    globalizingId.value = null;
  }
};

const openMergeDialog = item => {
  mergingItem.value = item;
  showMergeDialog.value = true;
};

const handleMergeConfirm = async ({ source_id, target_id }) => {
  merging.value = true;
  try {
    await api.request('post', '/merge', { source_id, target_id }, { successMessage: 'تم الدمج بنجاح' });
    showMergeDialog.value = false;
    fetchData();
  } finally {
    merging.value = false;
  }
};
</script>

<style scoped>
/* Premium Grid Card Styles */
.grid-card {
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
  border-radius: 12px !important;
}

.grid-card:hover {
  transform: translateY(-8px) scale(1.01) !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
  border-color: rgba(var(--v-theme-primary), 0.2) !important;
  z-index: 10;
}

.brand-grid-header {
  height: 180px;
  background-color: #f8fafc !important;
}

.bg-slate-50 {
  background-color: #f8fafc !important;
}

.text-slate-800 {
  color: #1e293b !important;
}

.text-slate-500 {
  color: #64748b !important;
}

.text-slate-400 {
  color: #94a3b8 !important;
}

.border-white-4 {
  border: 4px solid white !important;
}

.transition-all-cubic {
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) !important;
}

.modern-table :deep(.v-data-table__th) {
  background-color: #f1f3f5 !important;
  font-weight: 700 !important;
  color: #495057 !important;
}
</style>
