<template>
  <div class="attributes-page">
    <!-- Page Header -->
    <div class="page-header d-flex align-center justify-space-between mb-6">
      <div>
        <h1 class="text-h4 font-weight-bold ml-2">خصائص المنتجات</h1>
        <p class="text-body-1 text-grey">إدارة وتحليل خصائص ومواصفات المنتجات</p>
      </div>
      <AppButton v-if="can('attributes.create')" prepend-icon="ri-add-line" size="large" elevation="2" @click="handleCreate"> خاصية جديدة </AppButton>
    </div>

    <!-- Filters & View Toggle -->
    <AppCard class="mb-6">
      <div class="d-flex align-center flex-wrap gap-4">
        <AppInput
          v-model="search"
          label="بحث عن خاصية..."
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
    <LoadingSpinner v-if="loading && !attributes.length" size="64" text="جاري تحميل الخصائص..." />

    <EmptyState
      v-else-if="!attributes.length"
      icon="ri-paint-brush-line"
      title="لا توجد خصائص حالياً"
      message="ابدأ بإضافة أول خاصية لنظامك (مثل: اللون، المقاس)"
      :show-action="can('attributes.create')"
      action-text="إضافة خاصية"
      @action="handleCreate"
    />

    <template v-else>
      <!-- Grid View with Infinite Scroll -->
      <AppInfiniteScroll
        v-if="viewMode === 'grid'"
        :loading="loading && attributes.length > 0"
        :has-more="attributes.length < total"
        no-more-text="لا يوجد المزيد من الخصائص"
        @load="handleLoadMore"
      >
        <v-row>
          <v-col v-for="attribute in attributes" :key="attribute.id" cols="12" sm="6" md="4" lg="3">
            <AppCard class="attribute-card h-100" no-padding>
              <div class="attribute-card-header d-flex align-center justify-center pa-6 bg-grey-lighten-4 position-relative">
                <v-avatar size="100" rounded="circle" :color="attribute.is_active ? 'bg-white' : 'grey-lighten-3'" class="elevation-1 bg-white">
                  <v-icon icon="ri-list-settings-line" size="60" :color="attribute.is_active ? 'primary' : 'grey'" />
                </v-avatar>
              </div>

              <v-card-item class="position-relative pt-4 text-center">
                <v-card-title class="text-h6 font-weight-bold pa-0 mb-2">{{ attribute.name }}</v-card-title>

                <div class="d-flex align-center justify-center mb-3">
                  <v-chip :color="attribute.is_active ? 'success' : 'error'" size="x-small" class="font-weight-bold" variant="flat">
                    {{ attribute.is_active ? 'نشط' : 'معطل' }}
                  </v-chip>
                  <AppSwitch
                    v-if="can('attributes.update_all', { resource: attribute })"
                    :model-value="!!attribute.is_active"
                    :loading="togglingId === attribute.id"
                    class="ms-3"
                    @update:model-value="handleToggleStatus(attribute)"
                  />
                </div>

                <div class="d-flex flex-wrap gap-1 justify-center min-height-40 overflow-hidden">
                  <v-chip
                    v-for="(value, index) in getAttributeValues(attribute).slice(0, 5)"
                    :key="index"
                    size="x-small"
                    variant="tonal"
                    color="info"
                  >
                    {{ value.name || value }}
                  </v-chip>
                  <v-chip v-if="getAttributeValues(attribute).length > 5" size="x-small" variant="tonal">
                    +{{ getAttributeValues(attribute).length - 5 }}
                  </v-chip>
                </div>
              </v-card-item>

              <template #actions>
                <v-spacer />
                <AppButton
                  v-if="can('attributes.update_all', { resource: attribute })"
                  icon="ri-edit-line"
                  variant="text"
                  color="primary"
                  @click="handleEdit(attribute)"
                />
                <AppButton
                  v-if="can('attributes.delete_all', { resource: attribute })"
                  icon="ri-delete-bin-line"
                  variant="text"
                  color="error"
                  @click="handleDelete(attribute)"
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
        :items="attributes"
        :total-items="total"
        :loading="loading"
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :searchable="false"
        :can-view="false"
        :can-edit="false"
        :can-delete="false"
        permission-module="attributes"
        @update:options="onTableOptionsUpdate"
      >
        <template #[`item.name`]="{ item }">
          <div class="d-flex align-center py-2">
            <v-avatar size="48" rounded="circle" :color="item.is_active ? 'bg-white' : 'grey-lighten-4'" class="me-3 border">
              <v-icon icon="ri-list-settings-line" size="24" :color="item.is_active ? 'primary' : 'grey'" />
            </v-avatar>
            <div class="d-flex flex-column">
              <span class="font-weight-bold text-subtitle-1">{{ item.name }}</span>
              <span class="text-caption text-grey">كود: {{ item.id }}</span>
            </div>
          </div>
        </template>

        <template #[`item.values`]="{ item }">
          <div class="d-flex flex-wrap gap-1 py-1 max-width-300">
            <v-chip v-for="(value, index) in getAttributeValues(item)" :key="index" size="x-small" variant="tonal" color="info">
              {{ value.name || value }}
            </v-chip>
            <span v-if="!getAttributeValues(item).length" class="text-grey text-caption">-</span>
          </div>
        </template>

        <template #[`item.is_active`]="{ item }">
          <div class="d-flex align-center justify-center">
            <span
              v-if="can('attributes.update_all', { resource: item })"
              class="text-caption me-2 font-weight-bold"
              :class="item.is_active ? 'text-success' : 'text-error'"
            >
              {{ item.is_active ? 'نشط' : 'معطل' }}
            </span>
            <AppSwitch
              v-if="can('attributes.update_all', { resource: item })"
              :model-value="!!item.is_active"
              :loading="togglingId === item.id"
              @update:model-value="handleToggleStatus(item)"
            />
            <v-chip v-else :color="item.is_active ? 'success' : 'error'" size="small" variant="flat" class="font-weight-bold">
              {{ item.is_active ? 'نشط' : 'معطل' }}
            </v-chip>
          </div>
        </template>

        <template #extra-actions="{ item }">
          <AppButton
            v-if="can('attributes.update_all', { resource: item })"
            icon="ri-edit-line"
            variant="text"
            color="primary"
            size="small"
            @click="handleEdit(item)"
          />
          <AppButton
            v-if="can('attributes.delete_all', { resource: item })"
            icon="ri-delete-bin-line"
            variant="text"
            color="error"
            size="small"
            @click="handleDelete(item)"
          />
        </template>
      </AppDataTable>
    </template>

    <!-- Form Dialog -->
    <AppDialog
      v-model="showDialog"
      :title="isEdit ? 'تعديل الخاصية' : 'خاصية جديدة'"
      :icon="isEdit ? 'ri-edit-line' : 'ri-add-line'"
      :loading="saving"
      max-width="700"
      @confirm="handleSave"
    >
      <v-form ref="formRef" @submit.prevent="handleSave">
        <v-row>
          <v-col cols="12">
            <AppInput v-model="formData.name" label="اسم الخاصية *" placeholder="مثال: اللون، المقاس" :rules="[rules.required]" />
          </v-col>

          <v-col cols="12">
            <v-divider class="mb-2" />
            <div class="d-flex align-center mb-2">
              <span class="text-subtitle-2">القيم المتاحة</span>
              <v-spacer />
              <AppButton size="small" color="primary" variant="tonal" prepend-icon="ri-add-line" @click="addValue"> إضافة قيمة </AppButton>
            </div>

            <div v-if="formData.values.length" class="values-list pa-1">
              <v-row v-for="(value, index) in formData.values" :key="index" dense>
                <v-col cols="10">
                  <AppInput v-model="formData.values[index]" :label="`القيمة ${index + 1}`" placeholder="مثال: أحمر، أزرق" hide-details />
                </v-col>
                <v-col cols="2" class="d-flex align-center mt-2">
                  <AppButton icon="ri-delete-bin-line" size="small" variant="text" color="error" @click="removeValue(index)" />
                </v-col>
              </v-row>
            </div>
            <div v-else class="text-center pa-4 text-grey bg-grey-lighten-4 rounded-lg">
              <v-icon icon="ri-information-line" class="me-1" />
              لم يتم إضافة قيم بعد
            </div>
          </v-col>

          <v-col cols="12">
            <AppSwitch v-model="formData.is_active" label="نشط" :true-value="1" :false-value="0" hide-details />
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
      هل أنت متأكد من حذف الخاصية "<strong>{{ selectedItem?.name }}</strong
      >"؟
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAttributesData } from '../composables/useAttributesData';
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
import { PERMISSIONS } from '@/config/permissions';

// Simple debounce
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

const { attributes, loading, total, fetchAttributes, deleteAttribute } = useAttributesData();
const { can } = usePermissions();
const api = useApi('/api/attributes');

const page = ref(1);
const itemsPerPage = ref(12);
const search = ref('');
const viewMode = ref('list');
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);
const togglingId = ref(null);

const formData = ref({ name: '', values: [], is_active: 1 });
const isEdit = computed(() => !!selectedItem.value?.id);

const headers = [
  { title: 'الخاصية', key: 'name', sortable: true },
  { title: 'القيم', key: 'values', sortable: false },
  { title: 'الحالة', key: 'is_active', align: 'center', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', width: '120px' },
];

const rules = { required: v => !!v || 'مطلوب' };

const getAttributeValues = item => {
  if (!item.values) return [];
  if (Array.isArray(item.values)) return item.values;
  try {
    return JSON.parse(item.values);
  } catch {
    return [];
  }
};

const addValue = () => {
  formData.value.values.push('');
};

const removeValue = index => {
  formData.value.values.splice(index, 1);
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { name: '', values: [''], is_active: 1 };
  showDialog.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  const values = getAttributeValues(item);
  formData.value = {
    name: item.name,
    values: values.map(v => (typeof v === 'string' ? v : v.name)),
    is_active: item.is_active ?? 1,
  };
  showDialog.value = true;
};

const handleToggleStatus = async item => {
  togglingId.value = item.id;
  try {
    await api.update(item.id, { is_active: item.is_active ? 0 : 1 });
    item.is_active = item.is_active ? 0 : 1;
  } finally {
    togglingId.value = null;
  }
};

const handleSearch = debounce(() => {
  page.value = 1;
  loadData();
}, 500);

const handleLoadMore = () => {
  if (loading.value || attributes.value.length >= total.value) return;
  page.value++;
  loadData(true);
};

const onTableOptionsUpdate = options => {
  if (viewMode.value === 'list') {
    loadData();
  }
};

const handleDelete = item => {
  selectedItem.value = item;
  showDeleteDialog.value = true;
};

const handleSave = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  // Remove empty values
  const cleanedValues = formData.value.values.filter(v => v.trim() !== '');
  if (cleanedValues.length === 0) {
    alert('يجب إضافة قيمة واحدة على الأقل');
    return;
  }

  saving.value = true;
  try {
    const payload = {
      ...formData.value,
      values: cleanedValues,
    };

    if (isEdit.value) {
      await api.update(selectedItem.value.id, payload, { successMessage: 'تم التحديث بنجاح' });
    } else {
      await api.create(payload, { successMessage: 'تم الإضافة بنجاح' });
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
    await deleteAttribute(selectedItem.value.id);
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
  fetchAttributes(
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
.attributes-page {
  padding: 24px;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.max-width-300 {
  max-width: 300px;
}

.attribute-card {
  transition: all 0.3s ease;
  border-radius: 16px;
  border: 1px solid #eee;
}

.attribute-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1) !important;
}

.attribute-card-header {
  height: 160px;
  border-radius: 16px 16px 0 0;
}

.values-list {
  max-height: 300px;
  overflow-y: auto;
}

.min-height-40 {
  min-height: 40px;
}

.max-width-300 {
  max-width: 300px;
}
</style>
