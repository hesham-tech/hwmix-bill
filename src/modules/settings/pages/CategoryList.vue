<template>
  <div class="categories-page">
    <!-- Page Header -->
    <div class="page-header d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold ml-2">الفئات</h1>
        <p class="text-body-1 text-grey">إدارة وتحليل فئات المنتجات</p>
      </div>
      <AppButton v-if="can('categories.create')" prepend-icon="ri-add-line" size="large" elevation="2" @click="handleCreate"> فئة جديدة </AppButton>
    </div>

    <!-- Filters & View Toggle -->
    <AppCard class="mb-6">
      <div class="d-flex align-center flex-wrap gap-4">
        <AppInput
          v-model="search"
          label="بحث عن فئة..."
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
    <LoadingSpinner v-if="loading && !categories.length" size="64" text="جاري تحميل الفئات..." />

    <div v-else class="content-container">
      <!-- Root categories don't have breadcrumbs here anymore -->

      <EmptyState
        v-if="!categories.length"
        icon="ri-folder-line"
        title="لا توجد فئات حالياً"
        :message="search ? 'لا توجد نتائج تطابق بحثك' : 'ابدأ بإضافة أول فئة لنظامك'"
        :show-action="can('categories.create')"
        action-text="إضافة فئة"
        @action="handleCreate"
      />

      <template v-else>
        <!-- Grid View with Infinite Scroll -->
        <AppInfiniteScroll
          v-if="viewMode === 'grid'"
          :loading="loading && categories.length > 0"
          :has-more="categories.length < total"
          no-more-text="لا يوجد المزيد من الفئات"
          @load="handleLoadMore"
        >
          <v-row>
            <v-col v-for="category in categories" :key="category.id" cols="12" sm="6" md="4" lg="3">
              <AppCard class="category-card h-100" no-padding @click="handleCategoryClick(category)">
                <div class="category-card-header d-flex align-center justify-center pa-6 bg-grey-lighten-4 position-relative">
                  <v-avatar
                    size="100"
                    rounded="circle"
                    :color="category.active ? 'bg-white' : 'grey-lighten-3'"
                    class="elevation-1 bg-white overflow-hidden"
                  >
                    <v-img v-if="category.image_url" :src="category.image_url" cover />
                    <v-icon
                      v-else
                      :icon="category.children_count > 0 ? 'ri-folder-fill' : 'ri-folder-line'"
                      size="60"
                      :color="category.active ? (category.children_count > 0 ? 'primary' : 'info') : 'grey'"
                    />
                  </v-avatar>

                  <div class="child-count-badge position-absolute" style="top: 10px; left: 10px">
                    <v-chip size="x-small" color="secondary" variant="flat" v-if="category.products_count">
                      {{ category.products_count }} منتج
                    </v-chip>
                  </div>
                </div>

                <v-card-item class="position-relative pt-4">
                  <v-card-title class="text-h6 font-weight-bold pa-0 mb-1 text-truncate">{{ category.name }}</v-card-title>

                  <div class="d-flex align-center justify-space-between mb-1" style="height: 32px">
                    <div class="d-flex align-center">
                      <span class="text-caption text-grey-darken-1 me-2">الحالة:</span>
                      <v-chip :color="category.active ? 'success' : 'error'" size="x-small" class="font-weight-bold" variant="flat">
                        {{ category.active ? 'نشط' : 'معطل' }}
                      </v-chip>
                    </div>

                    <AppSwitch
                      v-if="can('categories.update_all', { resource: category })"
                      :model-value="!!category.active"
                      :loading="togglingId === category.id"
                      @click.stop
                      @update:model-value="handleToggleStatus(category)"
                    />
                  </div>

                  <v-card-subtitle class="pa-0 d-flex align-center mt-1">
                    <v-icon icon="ri-node-tree" size="14" class="me-1" />
                    <span v-if="category.parent?.name" class="text-truncate">داخل {{ category.parent.name }}</span>
                    <span v-else class="text-grey-darken-1">قسم رئيسي</span>
                  </v-card-subtitle>
                </v-card-item>

                <template #actions>
                  <AppButton
                    prepend-icon="ri-arrow-right-up-line"
                    variant="text"
                    color="info"
                    size="small"
                    @click.stop="handleCategoryClick(category)"
                  >
                    دخول
                  </AppButton>
                  <v-spacer />
                  <AppButton
                    v-if="can('categories.update_all', { resource: category })"
                    icon="ri-edit-line"
                    variant="text"
                    color="primary"
                    @click.stop="handleEdit(category)"
                  />
                  <AppButton
                    v-if="can('categories.delete_all', { resource: category })"
                    icon="ri-delete-bin-line"
                    variant="text"
                    color="error"
                    @click.stop="handleDelete(category)"
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
          :items="categories"
          :total-items="total"
          :loading="loading"
          v-model:page="page"
          v-model:items-per-page="itemsPerPage"
          v-model:sort-by="sortByVuetify"
          :searchable="false"
          :can-view="false"
          permission-module="categories"
          @update:options="onTableOptionsUpdate"
          @edit="handleEdit"
          @delete="handleDelete"
        >
          <template #[`item.name`]="{ item }">
            <div class="d-flex align-center py-2 cursor-pointer" @click="handleCategoryClick(item)">
              <v-avatar size="48" rounded="circle" :color="item.active ? 'bg-white' : 'grey-lighten-4'" class="me-3 border overflow-hidden">
                <v-img v-if="item.image_url" :src="item.image_url" cover />
                <v-icon
                  v-else
                  :icon="item.children_count > 0 ? 'ri-folder-fill' : 'ri-folder-line'"
                  size="24"
                  :color="item.active ? (item.children_count > 0 ? 'primary' : 'info') : 'grey'"
                />
              </v-avatar>
              <div class="d-flex flex-column">
                <span class="font-weight-bold text-subtitle-1">{{ item.name }}</span>
                <span class="text-caption text-grey">كود: {{ item.id }}</span>
              </div>
            </div>
          </template>

          <template #[`item.parent`]="{ item }">
            <v-chip v-if="item.parent?.name" size="small" variant="tonal" color="info" prepend-icon="ri-corner-down-right-line">
              {{ item.parent.name }}
            </v-chip>
            <span v-else class="text-grey text-caption">قسم رئيسي</span>
          </template>

          <template #[`item.active`]="{ item }">
            <div class="d-flex align-center justify-center">
              <span
                v-if="can('categories.update_all', { resource: item })"
                class="text-caption me-2 font-weight-bold"
                :class="item.active ? 'text-success' : 'text-error'"
              >
                {{ item.active ? 'نشط' : 'معطل' }}
              </span>
              <AppSwitch
                v-if="can('categories.update_all', { resource: item })"
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
              icon="ri-arrow-right-up-line"
              variant="text"
              color="info"
              size="small"
              @click="handleCategoryClick(item)"
              title="دخول القسم"
              tooltip="دخول القسم"
            />
          </template>
        </AppDataTable>
      </template>
    </div>

    <!-- Form Dialog -->
    <AppDialog
      v-model="showDialog"
      :title="isEdit ? 'تعديل الفئة' : 'فئة جديدة'"
      :icon="isEdit ? 'ri-edit-line' : 'ri-add-line'"
      :loading="saving"
      @confirm="handleSave"
    >
      <v-form ref="formRef" @submit.prevent="handleSave">
        <v-row>
          <!-- Image Selection -->
          <v-col cols="12" class="d-flex justify-center mb-4">
            <div class="category-image-zone position-relative cursor-pointer" @click="showMediaGallery = true">
              <v-avatar size="120" rounded="xl" color="grey-lighten-4" class="border-2 border-dashed elevation-1 hover-scale overflow-hidden">
                <v-img v-if="imagePreview" :src="imagePreview" cover />
                <v-icon v-else icon="ri-image-add-line" size="40" color="grey-lighten-1" />

                <div class="change-overlay d-flex flex-column align-center justify-center rounded-lg">
                  <v-icon icon="ri-exchange-line" color="white" size="24" />
                  <span class="text-white text-caption mt-1 font-weight-bold">تغيير الصورة</span>
                </div>
              </v-avatar>
            </div>
          </v-col>

          <v-col cols="12">
            <AppInput v-model="formData.name" label="اسم الفئة *" :rules="[rules.required]" />
          </v-col>
          <v-col cols="12">
            <v-autocomplete
              v-model="formData.parent_id"
              :items="parentCategories"
              item-title="name"
              item-value="id"
              label="الفئة الرئيسية"
              variant="outlined"
              density="comfortable"
              clearable
              placeholder="اختر الفئة الرئيسية (اختياري)"
            />
          </v-col>
          <v-col cols="12">
            <AppSwitch v-model="formData.active" label="نشط" :true-value="1" :false-value="0" hide-details />
          </v-col>
        </v-row>
      </v-form>
    </AppDialog>

    <!-- Delete Dialog -->
    <AppDialog
      v-model="showDeleteDialog"
      title="تأكيد الحذف"
      icon="ri-delete-bin-line"
      confirm-color="error"
      confirm-text="حذف"
      :loading="deleting"
      @confirm="confirmDelete"
    >
      هل أنت متأكد من حذف "<strong>{{ selectedItem?.name }}</strong
      >"؟
    </AppDialog>

    <!-- Category Explorer Dialog -->
    <CategoryExplorerDialog v-model="showExplorer" :initial-category="explorerTarget" @update-root="fetchData" />

    <!-- Media Gallery -->
    <MediaGallery v-model="showMediaGallery" type="category" @select="handleImageSelect" />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCategoriesData } from '../composables/useCategoriesData';
import { useDataTable } from '@/composables/useDataTable';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';
import AppCard from '@/components/common/AppCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import AppInfiniteScroll from '@/components/common/AppInfiniteScroll.vue';
import CategoryExplorerDialog from '../components/CategoryExplorerDialog.vue';
import MediaGallery from '@/components/common/MediaGallery.vue';
import { PERMISSIONS } from '@/config/permissions';
const { can } = usePermissions();
const api = useApi('/api/categories');
const { deleteCategory } = useCategoriesData();
const route = useRoute();
const router = useRouter();

// API fetch function for useDataTable
const fetchCategoriesApi = async params => {
  // Add special logic for categories (root only if not searching)
  const finalParams = { ...params };
  if (!params.search) {
    finalParams.parent_id = 'null';
  }
  return await api.get(finalParams, { showLoading: false });
};

// DataTable logic
const {
  items: categories,
  loading,
  currentPage: page,
  perPage: itemsPerPage,
  total,
  search,
  filters,
  sortBy,
  sortByVuetify,
  changePage,
  changePerPage,
  changeSort,
  applyFilters,
  fetchData,
} = useDataTable(fetchCategoriesApi, {
  syncWithUrl: true,
  initialSortBy: 'name',
  initialSortOrder: 'asc',
  initialPerPage: 12,
});

// UI State
const viewMode = ref('grid');
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);
const togglingId = ref(null);
const showExplorer = ref(false);
const explorerTarget = ref(null);
const showMediaGallery = ref(false);
const imagePreview = ref(null);

const formData = ref({ name: '', parent_id: null, active: 1, image_id: null });
const isEdit = computed(() => !!selectedItem.value?.id);

const parentCategories = computed(() => {
  return categories.value.filter(cat => cat.id !== selectedItem.value?.id);
});

const headers = [
  { title: 'الفئة', key: 'name', sortable: true },
  { title: 'الفئة الرئيسية', key: 'parent', sortable: true },
  { title: 'الحالة', key: 'active', align: 'center', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', width: '120px' },
];

const rules = { required: v => !!v || 'مطلوب' };

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = {
    name: '',
    parent_id: null,
    active: 1,
    image_id: null,
  };
  imagePreview.value = null;
  showDialog.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = {
    ...item,
    active: item.active ? 1 : 0,
    parent_id: item.parent_id || null,
    image_id: item.image_id || null,
  };
  imagePreview.value = item.image_url || null;
  showDialog.value = true;
};

const handleImageSelect = image => {
  formData.value.image_id = image.id;
  imagePreview.value = image.url;
  showMediaGallery.value = false;
};

const handleToggleStatus = async item => {
  togglingId.value = item.id;
  try {
    const newStatus = item.active ? 0 : 1;
    await api.request('patch', `/${item.id}/toggle`);
    item.active = newStatus;
  } finally {
    togglingId.value = null;
  }
};

const handleSearch = () => {
  applyFilters();
};

const handleLoadMore = () => {
  if (loading.value || categories.value.length >= total.value) return;
  page.value++;
  fetchData({ append: true });
};

const handleCategoryClick = category => {
  explorerTarget.value = category;
  showExplorer.value = true;
};

const onTableOptionsUpdate = options => {
  if (viewMode.value === 'list') {
    changeSort(options);
  }
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
    fetchData();
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await deleteCategory(selectedItem.value.id);
    showDeleteDialog.value = false;
    fetchData();
  } finally {
    deleting.value = false;
  }
};

const handleDelete = item => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

onMounted(async () => {
  const categoryId = route.query.category_id;
  if (categoryId) {
    try {
      const response = await api.request('get', `/${categoryId}`);
      if (response.data) {
        explorerTarget.value = response.data;
        showExplorer.value = true;
      }
    } catch (error) {
      router.replace({ query: { ...route.query, category_id: undefined } });
    }
  }
});

watch(showExplorer, val => {
  if (!val) {
    const { category_id, ...newQuery } = route.query;
    router.replace({ query: newQuery });
  }
});

watch(viewMode, () => {
  page.value = 1;
  fetchData();
});
</script>

<style scoped>
.categories-page {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.max-width-300 {
  max-width: 300px;
}

.category-card {
  transition: all 0.3s ease;
  border-radius: 16px;
  border: 1px solid #eee;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
}

.category-card-header {
  height: 160px;
  border-radius: 16px 16px 0 0;
}

.hover-primary:hover {
  color: rgb(var(--v-theme-primary)) !important;
  text-decoration: underline;
}

.transition-all {
  transition: all 0.2s ease;
}

.cursor-pointer {
  cursor: pointer;
}

.category-image-zone .change-overlay {
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

.category-image-zone:hover .change-overlay {
  opacity: 1;
}

.hover-scale {
  transition: transform 0.2s;
}

.hover-scale:hover {
  transform: scale(1.02);
}
</style>
