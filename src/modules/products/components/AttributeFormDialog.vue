<!-- كلاس حوار لإضافة وتعديل الخصائص (السمات) وقيمها الأولية بشكل موحد ومستقل -->
<template>
  <AppDialog
    :model-value="modelValue"
    :title="isEdit ? 'تعديل الخاصية' : 'خاصية جديدة'"
    :icon="isEdit ? 'ri-edit-box-line' : 'ri-add-line'"
    :loading="saving"
    max-width="600"
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="handleSave"
  >
    <v-form ref="formRef" class="pt-2">
      <v-row>
        <v-col cols="12">
          <AppInput
            v-model="formData.name"
            label="اسم الخاصية *"
            placeholder="مثال: اللون، المقاس، الحجم..."
            required
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
            <div v-if="formData.values.length" class="values-form-list pa-2 bg-grey-lighten-5 rounded-md border">
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

          <div v-if="!formData.values.length" class="text-center pa-2 text-grey-darken-1 border border-dashed rounded-md bg-grey-lighten-5">
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
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import { isColorProperty, suggestClosestColors, getExactColorHexCode } from '@/utils/color-utils';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';

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

const emit = defineEmits(['update:modelValue', 'saved']);

const api = useApi('/api/attributes');
const saving = ref(false);
const formRef = ref(null);

const formData = ref({ name: '', values: [], active: true });
const isEdit = computed(() => !!props.attribute?.id);

const rules = { required: v => !!v || 'هذا الحقل مطلوب' };

const getAttributeValues = item => {
  if (!item) return [];
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

    let result;
    if (isEdit.value) {
      result = await api.update(props.attribute.id, payload, { successMessage: 'تم التحديث بنجاح' });
    } else {
      result = await api.create(payload, { successMessage: 'تم إضافة الخاصية بنجاح' });
    }

    emit('saved', result.data?.[0] || result.data || result);
    emit('update:modelValue', false);
  } finally {
    saving.value = false;
  }
};

watch(
  () => props.attribute,
  newVal => {
    if (newVal) {
      const values = getAttributeValues(newVal);
      formData.value = {
        name: newVal.name,
        values: values.map(v => (typeof v === 'string' ? { name: v, color: '' } : { name: v.name, color: v.color || v.value || '' })),
        active: !!newVal.active,
      };
    } else {
      formData.value = { name: '', values: [], active: true };
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.values-form-list {
  max-height: 250px;
  overflow-y: auto;
}
.border-dashed {
  border: 1px dashed rgba(0, 0, 0, 0.1);
}
.gap-2 {
  gap: 8px;
}
</style>
