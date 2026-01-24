<template>
  <v-dialog :model-value="modelValue" max-width="1200" @update:model-value="$emit('update:modelValue', $event)" scrollable>
    <v-card class="explorer-dialog-card rounded-lg">
      <!-- Header -->
      <v-card-title class="pa-4 bg-primary d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-3">
          <v-icon icon="ri-folder-open-line" color="white" />
          <div class="d-flex flex-column">
            <span class="text-white text-h6 line-height-1">تصفح الأقسام</span>
            <span class="text-white text-caption opacity-80" v-if="initialCategory">مستكشف: {{ initialCategory.name }}</span>
          </div>
        </div>
        <v-btn icon="ri-close-line" variant="text" color="white" @click="$emit('update:modelValue', false)" />
      </v-card-title>

      <!-- Explorer Header -->
      <div class="pa-4 bg-grey-lighten-4 border-b">
        <!-- Row 1: Breadcrumbs (Scrollable) -->
        <div ref="breadcrumbsContainer" class="breadcrumbs-scroll-container mb-4">
          <v-breadcrumbs :items="breadcrumbItems" class="pa-0">
            <template #divider>
              <v-icon icon="ri-arrow-left-s-line" size="x-small" color="grey-lighten-1" />
            </template>
            <template #item="{ item }">
              <span
                class="text-subtitle-1 font-weight-bold cursor-pointer transition-all hover-primary no-wrap"
                :class="{ 'text-primary': !item.disabled, 'text-grey-darken-1': item.disabled }"
                @click="!item.disabled && handleBreadcrumbClick(item)"
              >
                {{ item.title }}
              </span>
            </template>
          </v-breadcrumbs>
        </div>

        <!-- Row 2: Current Category Details Card -->
        <div v-if="currentCategory && !search" class="mb-4 bg-white rounded-lg border border-primary-lighten-4 overflow-hidden elevation-sm">
          <div class="pa-4 d-flex align-sm-center flex-column flex-sm-row gap-4">
            <v-avatar size="100" rounded="lg" color="primary-lighten-5" class="border">
              <v-img v-if="currentCategory.image_url" :src="currentCategory.image_url" cover />
              <v-icon v-else icon="ri-folder-open-fill" size="48" color="primary" />
            </v-avatar>

            <div class="flex-grow-1">
              <div class="d-flex align-center gap-2 mb-1">
                <h2 class="text-h5 font-weight-bold text-primary">{{ currentCategory.name }}</h2>
                <v-chip :color="currentCategory.active ? 'success' : 'error'" size="x-small" variant="flat" class="font-weight-bold">
                  {{ currentCategory.active ? 'نشط' : 'معطل' }}
                </v-chip>
              </div>

              <p v-if="currentCategory.description" class="text-body-2 text-grey-darken-1 mb-3">
                {{ currentCategory.description }}
              </p>
              <p v-else class="text-body-2 text-grey-lighten-2 italic mb-3">لا يوجد وصف لهذا القسم</p>

              <div class="d-flex flex-column gap-3">
                <!-- Stats Row -->
                <div class="d-flex flex-wrap gap-4">
                  <div class="d-flex align-center gap-1">
                    <v-icon icon="ri-shopping-bag-3-fill" size="small" color="secondary" />
                    <span class="text-caption font-weight-bold">{{ currentCategory.products_count || 0 }} منتج</span>
                  </div>
                  <div class="d-flex align-center gap-1">
                    <v-icon icon="ri-folders-fill" size="small" color="info" />
                    <span class="text-caption font-weight-bold">{{ currentCategory.children_count || 0 }} قسم فرعي</span>
                  </div>
                </div>

                <!-- Buttons Row -->
                <div class="d-flex align-center gap-2 flex-wrap">
                  <AppButton
                    v-if="currentCategory.products_count > 0"
                    prepend-icon="ri-eye-line"
                    color="secondary"
                    variant="tonal"
                    size="small"
                    class="rounded-pill font-weight-bold"
                    @click="handleViewProducts(currentCategory)"
                  >
                    عرض المنتجات
                  </AppButton>
                  <AppButton
                    prepend-icon="ri-edit-line"
                    color="primary"
                    variant="tonal"
                    size="small"
                    class="rounded-pill font-weight-bold"
                    @click="handleEdit(currentCategory)"
                  >
                    تعديل البيانات
                  </AppButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: Search & Actions -->
        <div class="d-flex align-center gap-3 flex-wrap">
          <AppInput
            v-model="search"
            label="بحث في هذا القسم..."
            prepend-inner-icon="ri-search-line"
            density="compact"
            hide-details
            class="max-width-300 flex-grow-1 flex-sm-grow-0"
            @update:model-value="handleSearch"
          />

          <v-spacer class="d-none d-sm-block" />

          <div class="d-flex align-center gap-2">
            <AppButton prepend-icon="ri-add-line" color="primary" variant="flat" class="font-weight-bold" @click="handleCreate">
              إضافة قسم فرعي
            </AppButton>

            <v-btn-group variant="outlined" density="comfortable" color="primary">
              <v-btn :active="viewMode === 'grid'" icon="ri-grid-fill" @click="viewMode = 'grid'" />
              <v-btn :active="viewMode === 'list'" icon="ri-list-check" @click="viewMode = 'list'" />
            </v-btn-group>
          </div>
        </div>
      </div>

      <!-- Content -->
      <v-card-text class="pa-4 explorer-content">
        <div class="categories-list-area">
          <LoadingSpinner v-if="loading && !categories.length" size="64" text="جاري تحميل الأقسام..." />

          <EmptyState
            v-else-if="!categories.length"
            icon="ri-folder-open-line"
            title="لا توجد أقسام فرعية"
            :message="search ? 'لا توجد نتائج تطابق بحثك' : 'يمكنك البدء بإضافة أقسام فرعية لهذا القسم'"
            :show-action="true"
            action-text="إضافة قسم فرعي"
            @action="handleCreate"
          />

          <template v-else>
            <!-- Grid View -->
            <AppInfiniteScroll
              v-if="viewMode === 'grid'"
              :loading="loading && categories.length > 0"
              :has-more="categories.length < total"
              @load="handleLoadMore"
            >
              <v-row>
                <v-col v-for="category in categories" :key="category.id" cols="12" sm="6" md="4" lg="3">
                  <AppCard class="category-card h-100" no-padding @click="handleCategoryClick(category)">
                    <div class="pa-4 d-flex align-center justify-center bg-grey-lighten-4 position-relative overflow-hidden" style="height: 120px">
                      <v-img v-if="category.image_url" :src="category.image_url" cover class="position-absolute fill-height w-100" />
                      <v-icon
                        v-else
                        :icon="category.children_count > 0 ? 'ri-folder-fill' : 'ri-folder-line'"
                        size="48"
                        :color="category.active ? (category.children_count > 0 ? 'primary' : 'info') : 'grey'"
                      />
                    </div>
                    <v-card-item class="pt-2">
                      <v-card-title class="text-subtitle-1 font-weight-bold pa-0 text-truncate">
                        {{ category.name }}
                      </v-card-title>
                      <div class="d-flex align-center justify-space-between mt-1">
                        <v-chip :color="category.active ? 'success' : 'error'" size="x-small" variant="flat" class="font-weight-bold">
                          {{ category.active ? 'نشط' : 'معطل' }}
                        </v-chip>
                        <v-chip size="x-small" variant="text" class="text-grey"> {{ category.products_count }} منتج </v-chip>
                      </div>
                    </v-card-item>
                    <template #actions>
                      <v-chip :color="category.active ? 'success' : 'error'" size="x-small" variant="flat" class="font-weight-bold">
                        {{ category.active ? 'نشط' : 'معطل' }}
                      </v-chip>
                      <v-spacer />
                      <div class="d-flex gap-1">
                        <v-btn
                          v-if="category.products_count > 0"
                          icon="ri-shopping-bag-3-line"
                          variant="text"
                          color="secondary"
                          size="x-small"
                          title="عرض المنتجات"
                          @click.stop="handleViewProducts(category)"
                        />
                        <v-btn icon="ri-edit-line" variant="text" color="primary" size="x-small" @click.stop="handleEdit(category)" />
                        <v-btn icon="ri-delete-bin-line" variant="text" color="error" size="x-small" @click.stop="handleDelete(category)" />
                      </div>
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
              :can-view="false"
              :can-edit="false"
              :can-delete="false"
              @update:options="onTableOptionsUpdate"
            >
              <template #[`item.name`]="{ item }">
                <div class="d-flex align-center py-2 cursor-pointer" @click="handleCategoryClick(item)">
                  <v-avatar size="32" rounded="sm" color="grey-lighten-4" class="me-3 border overflow-hidden">
                    <v-img v-if="item.image_url" :src="item.image_url" cover />
                    <v-icon
                      v-else
                      :icon="item.children_count > 0 ? 'ri-folder-fill' : 'ri-folder-line'"
                      size="18"
                      :color="item.active ? (item.children_count > 0 ? 'primary' : 'info') : 'grey'"
                    />
                  </v-avatar>
                  <span class="font-weight-bold">{{ item.name }}</span>
                </div>
              </template>
              <template #[`item.active`]="{ item }">
                <AppSwitch :model-value="!!item.active" :loading="togglingId === item.id" @update:model-value="handleToggleStatus(item)" />
              </template>
              <template #extra-actions="{ item }">
                <v-btn
                  v-if="item.products_count > 0"
                  icon="ri-shopping-bag-3-line"
                  variant="text"
                  color="secondary"
                  size="small"
                  title="عرض المنتجات"
                  @click="handleViewProducts(item)"
                />
                <v-btn icon="ri-arrow-right-up-line" variant="text" color="info" size="small" @click="handleCategoryClick(item)" />
                <v-btn icon="ri-edit-line" variant="text" color="primary" size="small" @click="handleEdit(item)" />
                <v-btn icon="ri-delete-bin-line" variant="text" color="error" size="small" @click="handleDelete(item)" />
              </template>
            </AppDataTable>
          </template>
        </div>
      </v-card-text>
    </v-card>

    <!-- Nested Category Form Dialog -->
    <AppDialog
      v-model="showForm"
      :title="isEdit ? 'تعديل القسم الفرعي' : 'قسم فرعي جديد'"
      :icon="isEdit ? 'ri-edit-line' : 'ri-add-line'"
      :loading="saving"
      @confirm="handleSave"
    >
      <v-form ref="formRef" @submit.prevent="handleSave">
        <v-row>
          <!-- Image Selection -->
          <v-col cols="12" class="d-flex justify-center mb-4">
            <div class="category-image-zone position-relative cursor-pointer" @click="showMediaGallery = true">
              <v-avatar size="100" rounded="xl" color="grey-lighten-4" class="border-2 border-dashed elevation-1 hover-scale overflow-hidden">
                <v-img v-if="imagePreview" :src="imagePreview" cover />
                <v-icon v-else icon="ri-image-add-line" size="32" color="grey-lighten-1" />

                <div class="change-overlay d-flex flex-column align-center justify-center rounded-lg">
                  <v-icon icon="ri-exchange-line" color="white" size="20" />
                  <span class="text-white text-caption mt-1 font-weight-bold">تغيير الصورة</span>
                </div>
              </v-avatar>
            </div>
          </v-col>

          <v-col cols="12">
            <AppInput v-model="formData.name" label="اسم القسم *" :rules="[v => !!v || 'مطلوب']" />
          </v-col>
          <v-col cols="12">
            <AppSwitch v-model="formData.active" label="نشط" :true-value="1" :false-value="0" />
          </v-col>
        </v-row>
      </v-form>
    </AppDialog>

    <!-- Delete Dialog -->
    <AppDialog v-model="showDelete" title="تأكيد الحذف" icon="ri-delete-bin-line" confirm-color="error" @confirm="confirmDelete">
      هل أنت متأكد من حذف القسم الفرعي "<strong>{{ selectedItem?.name }}</strong
      >"؟
    </AppDialog>

    <!-- Media Gallery -->
    <MediaGallery v-model="showMediaGallery" type="category" @select="handleImageSelect" />
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useCategoriesData } from '../composables/useCategoriesData';
import { useApi } from '@/composables/useApi';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';
import AppCard from '@/components/common/AppCard.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import AppInfiniteScroll from '@/components/common/AppInfiniteScroll.vue';
import MediaGallery from '@/components/common/MediaGallery.vue';
import { toast } from 'vue3-toastify';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  modelValue: Boolean,
  initialCategory: Object,
});

const emit = defineEmits(['update:modelValue', 'update-root']);

const router = useRouter();
const route = useRoute();
const { categories, loading, total, fetchCategories, deleteCategory } = useCategoriesData();
const api = useApi('/api/categories');

const currentParentId = ref(null);

watch(currentParentId, newId => {
  if (props.modelValue && newId) {
    router.replace({ query: { ...route.query, category_id: newId } });
  }
});
const breadcrumbs = ref([]);
const page = ref(1);
const itemsPerPage = ref(12);
const search = ref('');
const viewMode = ref('grid');
const togglingId = ref(null);
const currentCategory = ref(null);

const showForm = ref(false);
const showDelete = ref(false);
const showMediaGallery = ref(false);
const imagePreview = ref(null);
const selectedItem = ref(null);
const saving = ref(false);
const formRef = ref(null);
const breadcrumbsContainer = ref(null);
const formData = ref({ name: '', active: 1, parent_id: null, image_id: null });
const isEdit = computed(() => !!selectedItem.value?.id);

const headers = [
  { title: 'القسم', key: 'name', sortable: true },
  { title: 'المنتجات', key: 'products_count', align: 'center' },
  { title: 'الحالة', key: 'active', align: 'center' },
  { title: 'الإجراءات', key: 'actions', align: 'end' },
];

const breadcrumbItems = computed(() => {
  const items = [
    { title: props.initialCategory?.name, value: props.initialCategory?.id, disabled: currentParentId.value === props.initialCategory?.id },
  ];

  breadcrumbs.value.forEach((bc, index) => {
    if (bc.id === props.initialCategory?.id) return;
    items.push({
      title: bc.name,
      value: bc.id,
      disabled: bc.id === currentParentId.value,
    });
  });

  return items;
});

// Debounce search
let searchTimeout;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadData();
  }, 500);
};

const loadData = (options = {}) => {
  const isAppend = options === true;
  fetchCategories(
    {
      page: page.value,
      per_page: itemsPerPage.value,
      search: search.value,
      parent_id: currentParentId.value,
    },
    { append: isAppend }
  );
};

const fetchBreadcrumbs = async () => {
  try {
    const response = await api.request('get', `/${currentParentId.value}/breadcrumbs`);
    breadcrumbs.value = response.data || [];
  } catch (error) {
    console.error('Error fetching breadcrumbs:', error);
  }
};

const fetchCurrentCategory = async () => {
  if (!currentParentId.value) return;
  try {
    const response = await api.request('get', `/${currentParentId.value}`);
    currentCategory.value = response.data;
  } catch (error) {
    console.error('Error fetching current category:', error);
  }
};

const handleCategoryClick = category => {
  currentParentId.value = category.id;
  page.value = 1;
  loadData();
  fetchBreadcrumbs();
  fetchCurrentCategory();
};

const handleBreadcrumbClick = item => {
  currentParentId.value = item.value;
  page.value = 1;
  loadData();
  fetchBreadcrumbs();
  fetchCurrentCategory();
};

const handleViewProducts = category => {
  if (category.products_count > 0) {
    router.push({
      path: '/products',
      query: { category_id: category.id },
    });
    emit('update:modelValue', false); // Close dialog
  } else {
    toast.info('لا توجد منتجات في هذا القسم حالياً');
  }
};

const handleLoadMore = () => {
  if (loading.value || categories.value.length >= total.value) return;
  page.value++;
  loadData(true);
};

const onTableOptionsUpdate = () => {
  if (viewMode.value === 'list') loadData();
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { name: '', active: 1, parent_id: currentParentId.value, image_id: null };
  imagePreview.value = null;
  showForm.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = {
    ...item,
    active: item.active ? 1 : 0,
    image_id: item.image_id || null,
  };
  imagePreview.value = item.image_url || null;
  showForm.value = true;
};

const handleImageSelect = image => {
  formData.value.image_id = image.id;
  imagePreview.value = image.url;
  showMediaGallery.value = false;
};

const handleDelete = item => {
  selectedItem.value = item;
  showDelete.value = true;
};

const handleToggleStatus = async item => {
  togglingId.value = item.id;
  try {
    const newStatus = item.active ? 0 : 1;
    await api.request('patch', `/${item.id}/toggle`);
    item.active = newStatus;
    emit('update-root');
  } finally {
    togglingId.value = null;
  }
};

const handleSave = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  saving.value = true;
  try {
    if (isEdit.value) {
      await api.update(selectedItem.value.id, formData.value);
    } else {
      await api.create(formData.value);
    }
    showForm.value = false;
    loadData();
    emit('update-root');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  try {
    await deleteCategory(selectedItem.value.id);
    showDelete.value = false;
    loadData();
    emit('update-root');
  } catch (error) {
    console.error('Delete error:', error);
  }
};

// Initialize when opened
watch(
  () => props.modelValue,
  val => {
    if (val && props.initialCategory) {
      currentParentId.value = props.initialCategory.id;
      page.value = 1;
      loadData();
      fetchBreadcrumbs();
      fetchCurrentCategory();
    }
  }
);

// Auto-scroll breadcrumbs to end
watch(
  breadcrumbItems,
  () => {
    setTimeout(() => {
      if (breadcrumbsContainer.value) {
        breadcrumbsContainer.value.scrollLeft = breadcrumbsContainer.value.scrollWidth;
      }
    }, 100);
  },
  { deep: true }
);
</script>

<style scoped>
.explorer-dialog-card {
  height: 90vh;
  display: flex;
  flex-direction: column;
}

.explorer-content {
  flex: 1;
  overflow-y: auto;
}

.explorer-sub-header {
  z-index: 10;
}

.max-width-250 {
  max-width: 250px;
}

.category-card {
  transition: all 0.2s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.hover-primary:hover {
  color: rgb(var(--v-theme-primary)) !important;
  text-decoration: underline;
}

.line-height-1 {
  line-height: 1;
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

.breadcrumbs-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
  width: 100%;
  display: flex;
  align-items: center;
}

.breadcrumbs-scroll-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.no-wrap {
  white-space: nowrap;
}
</style>
