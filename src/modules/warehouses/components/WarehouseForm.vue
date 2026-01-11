<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-row dense>
      <!-- Name -->
      <v-col cols="12">
        <AppInput
          v-model="form.name"
          label="اسم المخزن *"
          placeholder="مثال: المخزن الرئيسي"
          :rules="[required]"
          prepend-inner-icon="ri-building-4-line"
        />
      </v-col>

      <!-- Location -->
      <v-col cols="12">
        <AppInput v-model="form.location" label="وقع المخزن / العنوان" placeholder="ادخل العنوان بالتفصيل" prepend-inner-icon="ri-map-pin-line" />
      </v-col>

      <!-- Description -->
      <v-col cols="12">
        <AppTextarea
          v-model="form.description"
          label="وصف إضافي"
          placeholder="أي تفاصيل أخرى عن المخزن..."
          rows="3"
          prepend-inner-icon="ri-file-text-line"
        />
      </v-col>

      <!-- Active Status -->
      <v-col cols="12">
        <div class="pa-4 border rounded-lg bg-grey-lighten-5 d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center">
            <v-icon
              :icon="form.is_active ? 'ri-checkbox-circle-line' : 'ri-close-circle-line'"
              :color="form.is_active ? 'success' : 'grey'"
              class="me-3"
            />
            <div>
              <div class="font-weight-bold">حالة المستودع</div>
              <div class="text-caption text-grey">تحديد ما إذا كان المخزن متاحاً للاستخدام حالياً</div>
            </div>
          </div>
          <AppSwitch v-model="form.is_active" hide-details />
        </div>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import AppSwitch from '@/components/common/AppSwitch.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppTextarea from '@/components/common/AppTextarea.vue';
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

  if (!valid) return false; // Return false if invalid

  emit('save', form.value);
  return true;
};

// Expose methods to parent
defineExpose({
  handleSubmit,
});

watch(
  () => props.modelValue,
  newVal => {
    form.value = { ...form.value, ...newVal };
  },
  { deep: true }
);
</script>
