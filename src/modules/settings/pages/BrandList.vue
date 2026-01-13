<template>
  <div class="brands-page">
    <!-- Page Header -->
    <div class="page-header d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold ml-2">العلامات التجارية</h1>
        <p class="text-body-1 text-grey">إدارة وتحليل العلامات التجارية للمنتجات</p>
      </div>
      <AppButton v-if="can('brands.create')" prepend-icon="ri-add-line" size="large" elevation="2" @click="handleCreate"> علامة جديدة </AppButton>
    </div>

    <!-- Filters & View Toggle -->
    <AppCard class="mb-6">
      <div class="d-flex align-center flex-wrap gap-4">
        <AppInput
          v-model="search"
          label="بحث عن ماركة..."
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
    <LoadingSpinner v-if="loading && !brands.length" size="64" text="جاري تحميل العلامات التجارية..." />

    <EmptyState
      v-else-if="!brands.length"
      icon="ri-award-line"
      title="لا توجد علامات تجارية حالياً"
      message="ابدأ بإضافة أول علامة تجارية لنظامك"
      :show-action="can('brands.create')"
      action-text="إضافة ماركة"
      @action="handleCreate"
    />

    <template v-else>
      <!-- Grid View with Infinite Scroll -->
      <AppInfiniteScroll
        v-if="viewMode === 'grid'"
        :loading="loading && brands.length > 0"
        :has-more="brands.length < total"
        no-more-text="لا يوجد المزيد من العلامات التجارية"
        @load="handleLoadMore"
      >
        <v-row>
          <v-col v-for="brand in brands" :key="brand.id" cols="12" sm="6" md="4" lg="3">
            <AppCard class="brand-card h-100" no-padding>
              <div class="brand-card-header d-flex align-center justify-center pa-6 bg-grey-lighten-4 position-relative">
                <AppAvatar
                  v-model:img-url="brand.image_url"
                  :name="brand.name"
                  type="brand"
                  size="120"
                  :custom-class="brand.active ? 'bg-white' : 'grey-lighten-3'"
                  class="elevation-1"
                />
              </div>

              <v-card-item class="position-relative pt-4">
                <v-card-title class="text-h6 font-weight-bold pa-0 mb-1">{{ brand.name }}</v-card-title>

                <div class="d-flex align-center justify-space-between mb-1" style="height: 32px">
                  <div class="d-flex align-center">
                    <span class="text-caption text-grey-darken-1 me-2">الحالة:</span>
                    <v-chip :color="brand.active ? 'success' : 'error'" size="x-small" class="font-weight-bold" variant="flat">
                      {{ brand.active ? 'نشط' : 'معطل' }}
                    </v-chip>
                  </div>

                  <AppSwitch
                    v-if="can('brands.update_all', { resource: brand })"
                    :model-value="!!brand.active"
                    :loading="togglingId === brand.id"
                    @update:model-value="handleToggleStatus(brand)"
                  />
                </div>

                <v-card-subtitle class="pa-0 d-flex align-center">
                  <v-icon icon="ri-box-3-line" size="14" class="me-1" />
                  {{ brand.products_count || 0 }} منتج مربوط
                </v-card-subtitle>
              </v-card-item>

              <v-card-text class="pt-0 pb-2">
                <p class="text-body-2 text-grey-darken-1 text-truncate-2 height-40 mb-0">
                  {{ brand.description || 'لا يوجد وصف متاح لهذه العلامة التجارية.' }}
                </p>
              </v-card-text>

              <template #actions>
                <v-spacer />
                <AppButton
                  v-if="can('brands.update_all', { resource: brand })"
                  icon="ri-edit-line"
                  variant="text"
                  color="primary"
                  @click="handleEdit(brand)"
                />
                <AppButton
                  v-if="can('brands.delete_all', { resource: brand })"
                  icon="ri-delete-bin-line"
                  variant="text"
                  color="error"
                  @click="handleDelete(brand)"
                />
              </template>
            </AppCard>
          </v-col>
        </v-row>
      </AppInfiniteScroll>

      <!-- List View -->
      <AppDataTable
        v-else
        :headers="headers"
        :items="brands"
        :total-items="total"
        :loading="loading"
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :searchable="false"
        :can-view="false"
        :can-edit="false"
        :can-delete="false"
        permission-module="brands"
        @update:options="onTableOptionsUpdate"
      >
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
            <span v-if="canUpdate(item)" class="text-caption me-2 font-weight-bold" :class="item.active ? 'text-success' : 'text-error'">
              {{ item.active ? 'نشط' : 'معطل' }}
            </span>
            <AppSwitch
              v-if="can('brands.update_all', { resource: item })"
              :model-value="!!item.active"
              :loading="togglingId === item.id"
              @update:model-value="handleToggleStatus(item)"
            />
            <v-chip v-else :color="item.active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
              {{ item.active ? 'نشط' : 'معطل' }}
            </v-chip>
          </div>
        </template>

        <template #extra-actions="{ item }">
          <AppButton
            v-if="can('brands.update_all', { resource: item })"
            icon="ri-edit-line"
            variant="text"
            color="primary"
            size="small"
            @click="handleEdit(item)"
          />
          <AppButton
            v-if="can('brands.delete_all', { resource: item })"
            icon="ri-delete-bin-line"
            variant="text"
            color="error"
            size="small"
            @click="handleDelete(item)"
          />
        </template>
      </AppDataTable>

      <!-- No grid pagination -->
    </template>

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
          <v-col cols="12" class="d-flex justify-center mb-6">
            <div class="logo-preview-zone position-relative cursor-pointer" @click="showMediaGallery = true">
              <v-avatar size="140" rounded="xl" color="grey-lighten-4" class="border-2 border-dashed elevation-1 hover-scale overflow-hidden">
                <v-img v-if="imagePreview" :src="imagePreview" cover />
                <v-icon v-else icon="ri-image-add-line" size="40" color="grey-lighten-1" />

                <div class="change-overlay d-flex flex-column align-center justify-center rounded-xl">
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
            <v-card variant="tonal" color="primary" class="pa-4 rounded-lg">
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
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import MediaGallery from '@/components/common/MediaGallery.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppDataTable from '@/components/common/AppDataTable.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import AppInfiniteScroll from '@/components/common/AppInfiniteScroll.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import { PERMISSIONS } from '@/config/permissions';

// Simple debounce
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const { brands, loading, total, fetchBrands, deleteBrand } = useBrandsData();

const onTableOptionsUpdate = options => {
  if (viewMode.value === 'list') {
    loadData();
  }
};

const handleLoadMore = () => {
  if (loading.value || brands.value.length >= total.value) return;
  page.value++;
  loadData(true);
};
const { can } = usePermissions();
const api = useApi('/api/brands');

const page = ref(1);
const itemsPerPage = ref(12);
const search = ref('');
const viewMode = ref('list');
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
  { title: 'المنتجات', key: 'products_count', align: 'center' },
  { title: 'الحالة', key: 'active', align: 'center' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', width: '120px' },
];

const rules = { required: v => !!v || 'هذا الحقل مطلوب' };

const handleImageSelect = image => {
  formData.value.image_id = image.id;
  imagePreview.value = image.url;
};

const handleSearch = debounce(() => {
  page.value = 1;
  loadData();
}, 500);

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
    loadData();
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deleteBrand(selectedItem.value.id);
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

const loadData = (options = {}) => {
  const isAppend = options === true;
  fetchBrands(
    {
      page: page.value,
      per_page: itemsPerPage.value,
      search: search.value,
    },
    { append: isAppend }
  );
};

onMounted(loadData);

watch(page, () => {
  if (viewMode.value === 'list') {
    loadData();
  }
});

watch(itemsPerPage, () => {
  if (viewMode.value === 'list') {
    page.value = 1;
    loadData();
  }
});

watch(viewMode, () => {
  page.value = 1;
  loadData();
});
</script>

<style scoped>
.brands-page {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.max-width-300 {
  max-width: 300px;
}

.brand-card {
  transition: all 0.3s ease;
  border-radius: 16px;
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
