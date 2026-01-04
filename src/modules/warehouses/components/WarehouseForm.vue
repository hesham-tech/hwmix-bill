<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-row>
      <!-- Name -->
      <v-col cols="12">
        <AppInput v-model="form.name" label="اسم المخزن *" :rules="[required]" prepend-inner-icon="ri-building-4-line" />
      </v-col>

      <!-- Location -->
      <v-col cols="12">
        <AppInput v-model="form.location" label="الموقع" prepend-inner-icon="ri-map-pin-line" />
      </v-col>

      <!-- Description -->
      <v-col cols="12">
        <v-textarea v-model="form.description" label="الوصف" rows="3" prepend-inner-icon="ri-file-text-line" />
      </v-col>

      <!-- Active Status -->
      <v-col cols="12">
        <v-switch v-model="form.is_active" label="مخزن نشط" color="success" hide-details />
      </v-col>
    </v-row>

    <!-- Actions -->
    <FormActions :loading="loading" @cancel="$emit('cancel')" @submit="handleSubmit" />
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { AppInput, FormActions } from '@/components';
import { required } from '@/utils/validators';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['save', 'cancel']);

const formRef = ref(null);
const loading = ref(false);

const form = ref({
  name: '',
  location: '',
  description: '',
  is_active: true,
  ...props.modelValue,
});

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();

  if (!valid) return;

  loading.value = true;
  emit('save', form.value);
  loading.value = false;
};

watch(
  () => props.modelValue,
  newVal => {
    form.value = { ...form.value, ...newVal };
  },
  { deep: true }
);
</script>
