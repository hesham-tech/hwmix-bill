<template>
  <div class="attributes-page">
    <AppPageHeader title="خصائص المنتجات" subtitle="إدارة وتحليل خصائص ومواصفات المنتجات" details="مثل اللون، المقاس، الخامة">
      <template #controls>
        <!-- Add Button -->
        <v-col cols="6" md="4" class="d-flex justify-center">
          <v-btn v-if="can('attributes.create')" prepend-icon="ri-add-line" size="large" class="gradient-add-btn elevation-6" @click="handleCreate">
            خاصية جديدة
          </v-btn>
        </v-col>

        <!-- View Toggle -->
        <v-col cols="6" md="4" class="d-flex align-center">
          <div class="d-flex align-center gap-4 ms-4">
            <span class="text-subtitle-2 text-slate-400 font-weight-medium">طريقة العرض:</span>
            <v-btn-toggle v-model="viewMode" mandatory class="image-style-toggle" density="comfortable">
              <v-btn value="list" icon="ri-list-check" />
              <v-btn value="grid" icon="ri-grid-fill" />
            </v-btn-toggle>
          </div>
        </v-col>

        <!-- Search Bar -->
        <v-col cols="6" md="4" class="mt-4 mt-md-0">
          <v-text-field
            v-model="search"
            placeholder="بحث عن خاصية..."
            prepend-inner-icon="ri-search-2-line"
            class="pill-search-input me-4"
            hide-details
            density="compact"
            bg-color="slate-50"
            rounded="pill"
            @update:model-value="handleSearch"
          />
        </v-col>
      </template>
    </AppPageHeader>

    <!-- Content Area -->
    <div v-if="loading && !attributes.length" class="d-flex flex-column align-center justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="64" width="6" />
      <span class="mt-4 text-slate-500 font-weight-medium">جاري تحديث القائمة...</span>
    </div>

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
      <!-- Grid View (Replicated Cards) -->
      <v-row v-if="viewMode === 'grid'">
        <v-col v-for="attribute in attributes" :key="attribute.id" cols="12" sm="6" md="4" lg="3">
          <v-card class="image-style-card border-slate-50" @click="openValuesDialog(attribute)">
            <v-card-text class="pa-10 d-flex flex-column align-center">
              <v-avatar size="100" :color="isColorProperty(attribute.name) ? 'primary' : 'slate-50'" class="mb-6 border-slate-100 elevation-2">
                <v-icon
                  :icon="isColorProperty(attribute.name) ? 'ri-palette-fill' : 'ri-list-settings-fill'"
                  size="48"
                  :color="isColorProperty(attribute.name) ? 'white' : 'primary'"
                />
              </v-avatar>
              <h3 class="text-h6 font-weight-black text-slate-800">{{ attribute.name }}</h3>

              <!-- Action summary - tiny line -->
              <div class="mt-4 d-flex align-center text-caption text-slate-400 font-weight-bold">
                <span>{{ getAttributeValues(attribute).length }} قيم</span>
                <v-icon icon="ri-arrow-left-s-line" class="ms-1" />
              </div>
            </v-card-text>

            <!-- Fast Action Toggle -->
            <v-card-actions class="card-quick-actions pa-3 d-flex align-center border-t border-slate-50">
              <AppSwitch
                v-if="can('attributes.update_all', { resource: attribute })"
                v-model="attribute.active"
                :loading="togglingId === attribute.id"
                @update:model-value="() => handleToggleStatus(attribute)"
                density="compact"
              />
              <v-spacer />
              <v-btn icon="ri-edit-2-line" variant="text" size="small" color="slate-400" @click.stop="handleEdit(attribute)" />
              <v-btn icon="ri-delete-bin-6-line" variant="text" size="small" color="error-lighten-1" @click.stop="handleDelete(attribute)" />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <!-- List View -->
      <v-card v-else class="rounded-lg border overflow-hidden flat">
        <AppDataTable
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
          class="minimal-table"
          @update:options="onTableOptionsUpdate"
        >
          <template #[`item.name`]="{ item }">
            <div class="d-flex align-center py-3">
              <v-avatar size="44" :color="isColorProperty(item.name) ? 'primary' : 'slate-50'" class="me-3 border">
                <v-icon
                  :icon="isColorProperty(item.name) ? 'ri-palette-fill' : 'ri-list-settings-fill'"
                  size="24"
                  :color="isColorProperty(item.name) ? 'white' : 'primary'"
                />
              </v-avatar>
              <div class="d-flex flex-column">
                <span class="font-weight-bold text-slate-800">{{ item.name }}</span>
                <span class="text-caption text-slate-400">#{{ item.id }}</span>
              </div>
            </div>
          </template>

          <template #[`item.values`]="{ item }">
            <div class="d-flex flex-wrap gap-1 py-1 max-width-400">
              <v-chip
                v-for="(value, index) in getAttributeValues(item).slice(0, 8)"
                :key="index"
                size="x-small"
                variant="tonal"
                color="primary"
                class="font-weight-bold"
              >
                <div
                  v-if="isColorProperty(item.name) && (value.color || value.value)"
                  class="color-dot me-1"
                  :style="{ backgroundColor: value.color || value.value }"
                ></div>
                {{ value.name || value }}
              </v-chip>
              <v-chip v-if="getAttributeValues(item).length > 8" size="x-small" variant="flat" color="slate-100">
                +{{ getAttributeValues(item).length - 8 }}
              </v-chip>
            </div>
          </template>

          <template #[`item.active`]="{ item }">
            <AppSwitch
              v-if="can('attributes.update_all', { resource: item })"
              v-model="item.active"
              :loading="togglingId === item.id"
              @update:model-value="() => handleToggleStatus(item)"
            />
          </template>

          <template #extra-actions="{ item }">
            <div class="d-flex align-center">
              <v-btn variant="text" icon="ri-list-settings-line" color="info" size="small" @click="openValuesDialog(item)" />
              <v-btn
                v-if="can('attributes.update_all', { resource: item })"
                icon="ri-edit-2-line"
                variant="text"
                color="primary"
                size="small"
                @click="handleEdit(item)"
              />
              <v-btn
                v-if="can('attributes.delete_all', { resource: item })"
                icon="ri-delete-bin-6-line"
                variant="text"
                color="error"
                size="small"
                @click="handleDelete(item)"
              />
            </div>
          </template>
        </AppDataTable>
      </v-card>
    </template>

    <!-- Dialogs -->
    <AppDialog
      v-model="showDialog"
      :title="isEdit ? 'تعديل الخاصية' : 'خاضية جديدة'"
      :icon="isEdit ? 'ri-edit-line' : 'ri-add-line'"
      :loading="saving"
      max-width="600"
      @confirm="handleSave"
    >
      <v-form ref="formRef" @submit.prevent="handleSave">
        <v-row>
          <v-col cols="12">
            <AppInput
              v-model="formData.name"
              label="اسم الخاصية *"
              placeholder="مثال: اللون، المقاس، الحجم..."
              :rules="[rules.required]"
              prepend-inner-icon="ri-edit-box-line"
            />
          </v-col>

          <v-col cols="12">
            <div class="d-flex align-center mb-3">
              <span class="text-subtitle-2 font-weight-bold">إضافة قيم أولية (اختياري)</span>
              <v-spacer />
              <v-btn size="small" color="primary" variant="plain" prepend-icon="ri-add-line" class="text-none" @click="addValue"> إضافة حقل </v-btn>
            </div>

            <v-expand-transition>
              <div v-if="formData.values.length" class="values-form-list pa-2 bg-grey-lighten-5 rounded-lg border">
                <v-row v-for="(value, index) in formData.values" :key="index" dense class="mb-2 align-center">
                  <v-col cols="10">
                    <div class="d-flex align-center gap-2">
                      <v-menu v-if="isColorProperty(formData.name)" :close-on-content-click="false">
                        <template v-slot:activator="{ props }">
                          <v-avatar
                            v-bind="props"
                            size="32"
                            class="cursor-pointer border border-opacity-25"
                            :style="{ backgroundColor: value.color || '#cccccc' }"
                          >
                          </v-avatar>
                        </template>
                        <v-card class="pa-2">
                          <v-color-picker v-model="value.color" show-swatches hide-inputs width="250" />
                        </v-card>
                      </v-menu>
                      <v-combobox
                        v-if="isColorProperty(formData.name)"
                        v-model="value.name"
                        :items="getColorSuggestions(value.name)"
                        item-title="name_ar"
                        item-value="name_ar"
                        hide-details
                        density="compact"
                        placeholder="اسم اللون..."
                        variant="outlined"
                        bg-color="white"
                        @update:model-value="val => handleColorSelection(index, val)"
                      >
                        <template v-slot:item="{ props, item }">
                          <v-list-item v-bind="props" :title="item.raw.name_ar">
                            <template v-slot:prepend>
                              <v-avatar size="24" :style="{ backgroundColor: item.raw.hex }" class="me-2"></v-avatar>
                            </template>
                          </v-list-item>
                        </template>
                      </v-combobox>
                      <v-text-field
                        v-else
                        v-model="value.name"
                        hide-details
                        density="compact"
                        placeholder="أدخل القيمة..."
                        variant="outlined"
                        bg-color="white"
                      />
                    </div>
                  </v-col>
                  <v-col cols="2" class="text-center">
                    <v-btn icon="ri-delete-bin-line" size="small" variant="text" color="error" @click="removeValue(index)" />
                  </v-col>
                </v-row>
              </div>
            </v-expand-transition>

            <div v-if="!formData.values.length" class="text-center pa-6 text-grey-darken-1 border border-dashed rounded-lg bg-grey-lighten-5">
              <v-icon icon="ri-information-line" class="mb-2" size="24" />
              <div class="text-caption">يمكنك إضافة قيم لهذه الخاصية الآن أو لاحقاً</div>
            </div>
          </v-col>

          <v-col cols="12">
            <AppSwitch
              v-model="formData.active"
              label="الحالة"
              :true-value="true"
              :false-value="false"
              hint="إذا كانت الخاصية غير نشطة فلن تظهر عند إضافة منتجات جديدة"
              persistent-hint
            >
              <template #label>
                <span :class="formData.active ? 'text-success' : 'text-grey'"> الحالة: {{ formData.active ? 'نشطة' : 'معطلة' }} </span>
              </template>
            </AppSwitch>
          </v-col>
        </v-row>
      </v-form>
    </AppDialog>
    <AttributeValuesDialog v-model="showValuesDialog" :attribute="selectedItem" />
    <AppConfirmDialog
      v-model="showDeleteDialog"
      title="حذف الخاصية"
      message="هل أنت متأكد من حذف هذه الخاصية؟ سيؤدي ذلك لحذف جميع القيم المرتبطة بها."
      confirm-text="نعم، حذف"
      type="error"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAttributesData } from '../composables/useAttributesData';
import { useApi } from '@/composables/useApi';
import { usePermissions } from '@/composables/usePermissions';
import { isColorProperty, suggestClosestColors, getExactColorHexCode } from '@/utils/color-utils';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import AttributeValuesDialog from '../components/AttributeValuesDialog.vue';

const { attributes, loading, total, fetchAttributes, deleteAttribute } = useAttributesData();
const { can } = usePermissions();
const api = useApi('/api/attributes');

const page = ref(1);
const itemsPerPage = ref(12);
const search = ref('');
const viewMode = ref('grid');
const showDialog = ref(false);
const showDeleteDialog = ref(false);
const showValuesDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);
const togglingId = ref(null);

const formData = ref({ name: '', values: [], active: true });
const isEdit = computed(() => !!selectedItem.value?.id);

const headers = [
  { title: 'اسم الخاصية', key: 'name', sortable: true },
  { title: 'القيم المرتبطة', key: 'values', sortable: false },
  { title: 'الحالة', key: 'active', align: 'center', sortable: true },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', width: '150px' },
];

const rules = { required: v => !!v || 'هذا الحقل مطلوب' };

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
  formData.value.values.push({ name: '', color: '' });
};

const removeValue = index => {
  formData.value.values.splice(index, 1);
};

const getColorSuggestions = val => {
  if (!val || typeof val !== 'string') return [];
  return suggestClosestColors(val, 5);
};

const handleColorSelection = (index, val) => {
  if (typeof val === 'object' && val !== null) {
    formData.value.values[index].name = val.name_ar;
    formData.value.values[index].color = val.hex;
  } else {
    const hex = getExactColorHexCode(val);
    if (hex) {
      formData.value.values[index].color = hex;
    }
  }
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { name: '', values: [], active: true };
  showDialog.value = true;
};

const openValuesDialog = item => {
  selectedItem.value = item;
  showValuesDialog.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  const values = getAttributeValues(item);
  formData.value = {
    name: item.name,
    values: values.map(v => (typeof v === 'string' ? { name: v, color: '' } : { name: v.name, color: v.color || v.value || '' })),
    active: !!item.active,
  };
  showDialog.value = true;
};

const handleToggleStatus = async item => {
  if (togglingId.value) return;
  togglingId.value = item.id;
  try {
    const newStatus = item.active ? 1 : 0;
    await api.patch(`/${item.id}/toggle`);
    // Toast notification handled by useApi usually
  } catch (err) {
    item.active = !item.active; // Revert on failure
  } finally {
    togglingId.value = null;
  }
};

let searchTimeout;
const handleSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadData();
  }, 500);
};

const onTableOptionsUpdate = () => {
  loadData();
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
    const payload = {
      ...formData.value,
      values: formData.value.values
        .filter(v => v.name.trim() !== '')
        .map(v => ({
          name: v.name,
          color: v.color || null,
        })),
    };

    if (isEdit.value) {
      await api.update(selectedItem.value.id, payload, { successMessage: 'تم التحديث بنجاح' });
    } else {
      await api.create(payload, { successMessage: 'تم إضافة الخاصية بنجاح' });
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

const loadData = (options = {}) => {
  const params = {
    page: page.value,
    per_page: itemsPerPage.value,
    search: search.value,
  };
  fetchAttributes(params);
};

onMounted(loadData);

watch(page, () => {
  if (viewMode.value === 'list') {
    loadData();
  }
});

watch(itemsPerPage, () => {
  page.value = 1;
  loadData();
});

watch(viewMode, () => {
  page.value = 1;
  loadData();
});
</script>

<style scoped>
.attributes-page {
  padding: 0 40px 40px; /* Reduced top padding as header handles it */
  max-width: 1400px;
  margin: 0 auto;
  min-height: 100vh;
  background-color: #f8fafc;
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
.bg-slate-50 {
  background-color: #f8fafc !important;
}

.text-primary-gradient {
  background: linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.gradient-add-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%) !important;
  color: white !important;
  border-radius: 12px;
  font-weight: 900;
  letter-spacing: 0.5px;
  text-transform: none;
  padding: 0 32px;
}

/* Controls Bar */
.image-style-toggle {
  background: #f1f5f9;
  border-radius: 10px;
  padding: 2px;
}

.image-style-toggle .v-btn {
  border-radius: 8px !important;
  min-width: 50px !important;
}

.pill-search-input {
  max-width: 400px;
}

.pill-search-input :deep(.v-field__outline) {
  display: none;
}

/* Card Styles */
.image-style-card {
  background: white;
  border-radius: 32px !important;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  cursor: pointer;
  border: 1px solid #f1f5f9 !important;
  overflow: hidden;
}

.image-style-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.08) !important;
  border-color: rgba(124, 58, 237, 0.1) !important;
}

.border-slate-100 {
  border: 1px solid #f1f5f9 !important;
}

.card-quick-actions {
  background: #fafafa;
  transition: opacity 0.3s ease;
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid white;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05);
}

/* Table Style */
.minimal-table {
  background: white;
}

.gap-1 {
  gap: 4px;
}
.gap-4 {
  gap: 16px;
}
</style>
