<!-- كلاس حوار لإضافة وتعديل قيم الخصائص (يدعم تخصيص وتوليد الألوان تلقائياً) بشكل موحد ومستقل -->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="isEdit ? 'تعديل البيانات' : 'إضافة جديدة'"
    :icon="isEdit ? 'ri-edit-2-line' : 'ri-magic-line'"
    :loading="saving"
    max-width="550"
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="handleSave"
  >
    <v-form ref="formRef" class="pt-2">
      <!-- Visual Preview Cell -->
      <div class="preview-cell mb-2 rounded-md pa-4 bg-slate-50 border border-dashed">
        <div class="d-flex align-center mb-4">
          <div class="text-caption font-weight-bold text-slate-400">معاينة القيمة</div>
          <v-spacer />
          <v-chip v-if="isColor" size="x-small" color="primary" variant="flat" class="mono font-weight-bold">
            {{ formData.color || '#000000' }}
          </v-chip>
        </div>
        <div class="d-flex align-center justify-center py-2">
          <v-avatar v-if="isColor" size="80" class="elevation-6 border-white-4" :style="{ backgroundColor: previewHex || '#f1f5f9' }">
            <v-icon v-if="!previewHex" icon="ri-palette-line" color="slate-300" />
          </v-avatar>
          <div v-else class="text-h4 font-weight-bold text-primary px-6 py-2 bg-white rounded-md border elevation-1">
            {{ formData.name || '---' }}
          </div>
        </div>
      </div>

      <v-row>
        <v-col cols="12">
          <template v-if="isColor">
            <div class="text-caption font-weight-bold text-slate-400 mb-1">ابدأ بكتابة اسم اللون وسيقوم النظام بتوليد درجة اللون تلقائياً</div>
            <div class="text-caption font-weight-bold text-slate-400 mb-1">أو اختر لوناً مخصصاً من لوحة الألوان بالأسفل:</div>
            <v-combobox
              v-model="formData.name"
              :items="colorSuggestions"
              item-title="name_ar"
              item-value="name_ar"
              label="اسم اللون"
              placeholder="أدخل اسماً أو اختر من المقترحات..."
              variant="outlined"
              bg-color="white"
              rounded="md"
              class="ma-4"
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
            <div class="color-control mb-2">
              <v-color-picker v-model="formData.color" hide-inputs show-swatches width="100%" class="rounded-md border flat" elevation="0" />
            </div>
          </template>

          <AppInput
            v-else
            v-model="formData.name"
            label="اسم القيمة"
            placeholder="مثال: XL، قطن، 128GB..."
            :rules="[v => !!v || 'هذا الحقل مطلوب']"
            rounded="md"
          />
        </v-col>
      </v-row>
    </v-form>
  </AppDialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import { isColorProperty, suggestClosestColors, getExactColorHexCode } from '@/utils/color-utils';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  attribute: {
    type: Object,
    required: true,
  },
  attributeValue: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const api = useApi('/api/attribute-values');
const saving = ref(false);
const formRef = ref(null);

const formData = ref({ name: '', color: '', attribute_id: null });
const isEdit = computed(() => !!props.attributeValue?.id);
const isColor = computed(() => (props.attribute ? isColorProperty(props.attribute.name) : false));

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

const handleSave = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  try {
    const payload = { ...formData.value };
    let result;
    if (payload.id) {
      result = await api.update(payload.id, payload, { successMessage: 'تم التحديث بنجاح' });
    } else {
      result = await api.create(payload, { successMessage: 'تمت الإضافة بنجاح' });
    }
    
    emit('saved', result.data?.[0] || result.data || result);
    emit('update:modelValue', false);
  } finally {
    saving.value = false;
  }
};

watch(
  [() => props.attributeValue, () => props.attribute, () => props.modelValue],
  ([val, attr, show]) => {
    if (show) {
      if (val) {
        formData.value = {
          name: val.name,
          color: val.color || val.value || '',
          attribute_id: attr?.id,
          id: val.id,
        };
      } else {
        formData.value = {
          name: '',
          color: '',
          attribute_id: attr?.id,
        };
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.preview-cell {
  background: #f8fafc;
  border: 2px dashed #e2e8f0;
}
.border-white-4 {
  border: 4px solid white !important;
}
.mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}
.bg-slate-50 {
  background-color: #f8fafc !important;
}
.text-slate-400 {
  color: #94a3b8 !important;
}
</style>
