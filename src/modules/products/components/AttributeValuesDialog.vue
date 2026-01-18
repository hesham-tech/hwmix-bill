<template>
  <v-dialog
    :model-value="modelValue"
    transition="dialog-bottom-transition"
    @update:model-value="$emit('update:modelValue', $event)"
    persistent
    width="100%"
    max-width="1200"
  >
    <v-card class="attribute-values-dialog bg-slate-50 rounded-xl overflow-hidden">
      <AppPageHeader :title="attribute?.name" stickyTop="0" class="bg-white border-b">
        <template #prepend>
          <v-avatar color="primary-lighten-5" size="48" class="border-primary-10 ms-4">
            <v-icon :icon="isColor ? 'ri-palette-fill' : 'ri-equalizer-fill'" color="primary" size="24" />
          </v-avatar>
        </template>

        <template #append>
          <v-btn icon="ri-close-line" variant="text" color="slate-400" @click="$emit('update:modelValue', false)" />
        </template>

        <template #controls>
          <v-col cols="12" md="6" class="d-flex align-center">
            <div class="d-flex align-center gap-4 ms-4">
              <span class="text-subtitle-2 text-slate-400 font-weight-bold">طريقة العرض:</span>
              <v-btn-toggle v-model="viewMode" mandatory class="image-style-toggle" density="comfortable">
                <v-btn value="list" icon="ri-list-check" />
                <v-btn value="grid" icon="ri-grid-fill" />
              </v-btn-toggle>

              <v-btn prepend-icon="ri-add-line" variant="flat" class="gradient-add-btn ms-2 px-6" @click="handleCreate"> إضافة قيمة </v-btn>
            </div>
          </v-col>

          <v-spacer />

          <v-col cols="12" md="4" class="mt-4 mt-md-0 d-flex align-center">
            <v-text-field
              v-model="searchQuery"
              prepend-inner-icon="ri-search-2-line"
              placeholder="بحث عن قيمة..."
              variant="flat"
              density="compact"
              hide-details
              class="pill-search-input w-full me-4"
              bg-color="slate-50"
              rounded="pill"
            ></v-text-field>
          </v-col>
        </template>
      </AppPageHeader>

      <v-card-text class="pa-6 pa-md-10 content-area">
        <v-fade-transition mode="out-in">
          <!-- Loading State -->
          <div v-if="loading && !values.length" :key="'loading'" class="d-flex flex-column align-center justify-center py-16">
            <v-progress-circular indeterminate color="primary" size="64" width="6" />
            <span class="mt-6 text-body-1 text-slate-500 font-weight-medium">جاري المزامنة...</span>
          </div>

          <!-- Empty State -->
          <div v-else-if="!filteredValues.length" :key="'empty'" class="py-12">
            <EmptyState
              icon="ri-bubble-chart-line"
              icon-size="80"
              title="لم يتم العثور على نتائج"
              message="حاول تغيير معايير البحث أو ابدأ بإضافة قيمة جديدة"
              show-action
              action-text="إضافة قيمة"
              @action="handleCreate"
            />
          </div>

          <!-- Content View -->
          <div v-else :key="viewMode">
            <!-- Image Style Grid -->
            <v-row v-if="viewMode === 'grid'">
              <v-col v-for="(item, index) in filteredValues" :key="item.id" cols="12" sm="6" md="4" lg="3">
                <v-card
                  class="image-style-card border-slate-50"
                  @click="handleEdit(item)"
                  v-intersect="{ handler: isIntersecting => onReveal(index, isIntersecting) }"
                  :class="{ revealed: revealedItems[index] }"
                >
                  <v-card-text class="pa-10 d-flex flex-column align-center text-center">
                    <v-avatar
                      v-if="isColor && (item.color || item.value)"
                      size="80"
                      class="mb-6 elevation-4 border-white-4"
                      :style="{ backgroundColor: item.color || item.value }"
                    ></v-avatar>
                    <v-avatar v-else size="80" color="slate-50" class="mb-6 border">
                      <v-icon icon="ri-text-snippet-fill" size="36" color="primary" />
                    </v-avatar>

                    <div class="text-subtitle-1 font-weight-black text-slate-800 mb-1 line-clamp-1">{{ item.name }}</div>
                    <div v-if="isColor" class="text-caption font-weight-bold text-slate-400 mono">
                      {{ (item.color || item.value || '').toUpperCase() }}
                    </div>
                  </v-card-text>

                  <v-card-actions class="card-footer px-4 py-2 d-flex justify-center border-t border-slate-50">
                    <v-btn icon="ri-pencil-fill" variant="text" color="info" size="small" @click.stop="handleEdit(item)" />
                    <v-btn icon="ri-delete-bin-fill" variant="text" color="error" size="small" @click.stop="handleDelete(item)" />
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>

            <!-- List View -->
            <v-card v-else class="rounded-xl border overflow-hidden flat">
              <AppDataTable
                :headers="headers"
                :items="filteredValues"
                :loading="loading"
                permission-module="attributes"
                :can-view="false"
                :can-edit="true"
                :can-delete="true"
                class="minimal-table"
                @edit="handleEdit"
                @delete="handleDelete"
              >
                <template #item.name="{ item }">
                  <div class="d-flex align-center py-2">
                    <v-avatar
                      v-if="isColor && (item.color || item.value)"
                      size="32"
                      class="me-3 border"
                      :style="{ backgroundColor: item.color || item.value }"
                    ></v-avatar>
                    <v-avatar v-else size="32" color="slate-50" class="me-3 border">
                      <v-icon icon="ri-text" size="16" color="primary" />
                    </v-avatar>
                    <span class="font-weight-bold text-slate-700">{{ item.name }}</span>
                  </div>
                </template>
                <template #item.color="{ item }">
                  <div v-if="isColor" class="d-flex align-center">
                    <span class="mono text-caption font-weight-bold grey-900 bg-slate-100 px-2 py-1 rounded">{{
                      (item.color || item.value || '-').toUpperCase()
                    }}</span>
                  </div>
                  <span v-else class="text-slate-300">-</span>
                </template>
              </AppDataTable>
            </v-card>
          </div>
        </v-fade-transition>
      </v-card-text>
    </v-card>

    <!-- Refined Form Dialog -->
    <AppDialog
      v-model="showFormDialog"
      :title="isEdit ? 'تعديل البيانات' : 'إضافة جديدة'"
      :icon="isEdit ? 'ri-edit-2-line' : 'ri-magic-line'"
      :loading="saving"
      max-width="550"
      @confirm="handleSave"
    >
      <v-form ref="formRef" class="pt-2">
        <!-- Visual Preview Cell -->
        <div class="preview-cell mb-6 rounded-xl pa-4 bg-slate-50 border border-dashed">
          <div class="d-flex align-center mb-4">
            <div class="text-caption font-weight-black text-slate-400">معاينة القيمة</div>
            <v-spacer />
            <v-chip v-if="isColor" size="x-small" color="primary" variant="flat" class="mono font-weight-bold">
              {{ formData.color || '#000000' }}
            </v-chip>
          </div>
          <div class="d-flex align-center justify-center py-2">
            <v-avatar v-if="isColor" size="80" class="elevation-6 border-white-4" :style="{ backgroundColor: previewHex || '#f1f5f9' }">
              <v-icon v-if="!previewHex" icon="ri-palette-line" color="slate-300" />
            </v-avatar>
            <div v-else class="text-h4 font-weight-black text-primary px-6 py-2 bg-white rounded-lg border elevation-1">
              {{ formData.name || '---' }}
            </div>
          </div>
        </div>

        <v-row>
          <v-col cols="12">
            <template v-if="isColor">
              <div class="color-control mb-6">
                <v-color-picker v-model="formData.color" hide-inputs show-swatches width="100%" class="rounded-lg border flat" elevation="0" />
              </div>

              <v-combobox
                v-model="formData.name"
                :items="colorSuggestions"
                item-title="name_ar"
                item-value="name_ar"
                label="اسم اللون"
                placeholder="أدخل اسماً أو اختر من المقترحات..."
                variant="outlined"
                bg-color="white"
                rounded="lg"
                class="mb-2"
                @update:model-value="handleColorSelection"
              >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props" :title="item.raw.name_ar">
                    <template v-slot:prepend>
                      <v-avatar size="20" :style="{ backgroundColor: item.raw.hex }" class="me-2 border"></v-avatar>
                    </template>
                  </v-list-item>
                </template>
              </v-combobox>
            </template>

            <AppInput
              v-else
              v-model="formData.name"
              label="اسم القيمة"
              placeholder="مثال: XL، قطن، 128GB..."
              :rules="[v => !!v || 'هذا الحقل مطلوب']"
              rounded="lg"
            />
          </v-col>
        </v-row>
      </v-form>
    </AppDialog>

    <!-- Confirm Dialog -->
    <AppConfirmDialog
      v-model="showDeleteDialog"
      title="حذف القيمة"
      subtitle="سيتم حذف هذه القيمة نهائياً من النظام. هل أنت متأكد؟"
      confirm-text="نعم، حذف القيمة"
      cancel-text="تراجع"
      type="error"
      icon="ri-delete-bin-6-line"
      :loading="deleting"
      @confirm="confirmDelete"
    />
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import { isColorProperty, suggestClosestColors, getExactColorHexCode } from '@/utils/color-utils';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import EmptyState from '@/components/common/EmptyState.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  attribute: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);

const api = useApi(`/api/attribute-values`);
const values = ref([]);
const loading = ref(false);
const viewMode = ref('grid');
const showFormDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedItem = ref(null);
const saving = ref(false);
const deleting = ref(false);
const formRef = ref(null);
const searchQuery = ref('');
const revealedItems = ref({});

const formData = ref({ name: '', color: '', attribute_id: null });
const isEdit = computed(() => !!selectedItem.value?.id);
const isColor = computed(() => (props.attribute ? isColorProperty(props.attribute.name) : false));

const filteredValues = computed(() => {
  if (!searchQuery.value) return values.value;
  const q = searchQuery.value.toLowerCase();
  return values.value.filter(v => v.name.toLowerCase().includes(q) || (v.color && v.color.toLowerCase().includes(q)));
});

const headers = computed(() => {
  const baseHeaders = [{ title: 'القيمة', key: 'name', sortable: true }];
  if (isColor.value) {
    baseHeaders.push({ title: 'اللون', key: 'color', sortable: false });
  }
  baseHeaders.push({ title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' });
  return baseHeaders;
});

const colorSuggestions = computed(() => {
  if (!formData.value.name || typeof formData.value.name !== 'string') return [];
  return suggestClosestColors(formData.value.name, 5);
});

const previewHex = computed(() => {
  if (formData.value.color) return formData.value.color;
  if (formData.value.name) {
    return getExactColorHexCode(formData.value.name);
  }
  return null;
});

const fetchValues = async () => {
  if (!props.attribute?.id) return;
  loading.value = true;
  revealedItems.value = {};
  try {
    const res = await api.get({ attribute_id: props.attribute.id, per_page: 100 });
    values.value = res.data || [];
  } catch (err) {
    console.error('Error fetching values:', err);
  } finally {
    loading.value = false;
  }
};

const onReveal = (index, isVisible) => {
  if (isVisible) revealedItems.value[index] = true;
};

const handleColorSelection = val => {
  if (typeof val === 'object' && val !== null) {
    formData.value.name = val.name_ar;
    formData.value.color = val.hex;
  } else {
    const hex = getExactColorHexCode(val);
    if (hex) {
      formData.value.color = hex;
    }
  }
};

const handleCreate = () => {
  selectedItem.value = null;
  formData.value = { name: '', color: '', attribute_id: props.attribute.id };
  showFormDialog.value = true;
};

const handleEdit = item => {
  selectedItem.value = item;
  formData.value = {
    name: item.name,
    color: item.color || item.value || '',
    attribute_id: props.attribute.id,
    id: item.id,
  };
  showFormDialog.value = true;
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
    const payload = { ...formData.value };
    if (payload.id) {
      await api.update(payload.id, payload, { successMessage: 'تم التحديث بنجاح' });
    } else {
      await api.create(payload, { successMessage: 'تمت الإضافة بنجاح' });
    }
    showFormDialog.value = false;
    fetchValues();
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async () => {
  deleting.value = true;
  try {
    await api.remove(selectedItem.value.id, { successMessage: 'تم الحذف بنجاح' });
    showDeleteDialog.value = false;
    fetchValues();
  } finally {
    deleting.value = false;
  }
};

watch(
  () => props.modelValue,
  newVal => {
    if (newVal) fetchValues();
  }
);
</script>

<style scoped>
/* Color Palette */
.bg-slate-50 {
  background-color: #f8fafc !important;
}
.text-slate-800 {
  color: #1e293b !important;
}
.text-slate-700 {
  color: #334155 !important;
}
.text-slate-500 {
  color: #64748b !important;
}
.text-slate-400 {
  color: #94a3b8 !important;
}
.text-slate-300 {
  color: #cbd5e1 !important;
}
.border-slate-50 {
  border-color: #f1f5f9 !important;
}

/* Custom Styles */
.attribute-values-dialog {
  min-height: 80vh;
}

.primary-lighten-5 {
  background-color: rgb(var(--v-theme-primary), 0.08) !important;
}

.border-primary-10 {
  border: 1px solid rgb(var(--v-theme-primary), 0.15) !important;
}

.gradient-add-btn {
  background: linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%) !important;
  color: white !important;
  border-radius: 12px;
  font-weight: 800;
  letter-spacing: 0.5px;
  text-transform: none;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.2) !important;
}

.image-style-toggle {
  background: #f1f5f9;
  border-radius: 10px;
  padding: 2px;
}

.image-style-toggle .v-btn {
  border-radius: 8px !important;
  min-width: 44px !important;
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
  opacity: 0;
  transform: translateY(20px);
}

.image-style-card.revealed {
  opacity: 1;
  transform: translateY(0);
}

.image-style-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.06) !important;
  border-color: rgba(124, 58, 237, 0.1) !important;
}

.border-white-4 {
  border: 4px solid white !important;
}

.mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  letter-spacing: 0.5px;
}

/* Preview Area */
.preview-cell {
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
}

.mw-350 {
  max-width: 350px;
}

.gap-4 {
  gap: 16px;
}

/* Utils */
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
