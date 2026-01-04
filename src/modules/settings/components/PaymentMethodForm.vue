<template>
  <v-dialog :model-value="modelValue" max-width="600" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon :icon="isEdit ? 'ri-edit-line' : 'ri-add-line'" class="me-2" />
        {{ isEdit ? 'تعديل طريقة الدفع' : 'طريقة دفع جديدة' }}
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="formData.name"
                label="اسم طريقة الدفع *"
                prepend-inner-icon="ri-bank-card-line"
                :rules="[rules.required]"
                :error-messages="errors.name"
              />
            </v-col>

            <v-col cols="12">
              <v-switch v-model="formData.is_active" label="نشط" color="success" :true-value="1" :false-value="0" hide-details />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="handleCancel"> إلغاء </v-btn>
        <v-btn color="primary" variant="flat" :loading="loading" @click="handleSubmit"> حفظ </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useApi } from '@/composables/useApi';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  paymentMethod: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const api = useApi('/api/payment-methods');
const formRef = ref(null);
const loading = ref(false);
const errors = ref({});

const formData = ref({
  name: '',
  is_active: 1,
});

const isEdit = computed(() => !!props.paymentMethod?.id);

const rules = {
  required: v => !!v || 'هذا الحقل مطلوب',
};

// Watch for payment method changes to pre-fill form
watch(
  () => props.paymentMethod,
  newVal => {
    if (newVal) {
      formData.value = {
        name: newVal.name || '',
        is_active: newVal.is_active ?? 1,
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  errors.value = {};

  try {
    if (isEdit.value) {
      await api.update(props.paymentMethod.id, formData.value, {
        successMessage: 'تم تحديث طريقة الدفع بنجاح',
      });
    } else {
      await api.create(formData.value, {
        successMessage: 'تم إضافة طريقة الدفع بنجاح',
      });
    }

    emit('saved');
    emit('update:modelValue', false);
    resetForm();
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    }
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  emit('update:modelValue', false);
  resetForm();
};

const resetForm = () => {
  formData.value = {
    name: '',
    is_active: 1,
  };
  errors.value = {};
  formRef.value?.resetValidation();
};
</script>
