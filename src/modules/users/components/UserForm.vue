<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-row>
      <!-- Name -->
      <v-col cols="12" md="6">
        <AppInput v-model="form.name" label="الاسم *" :rules="[required]" prepend-inner-icon="ri-user-line" />
      </v-col>

      <!-- Email -->
      <v-col cols="12" md="6">
        <AppInput v-model="form.email" label="البريد الإلكتروني *" type="email" :rules="[required, email]" prepend-inner-icon="ri-mail-line" />
      </v-col>

      <!-- Phone -->
      <v-col cols="12" md="6">
        <AppInput v-model="form.phone" label="الهاتف" :rules="[phone]" prepend-inner-icon="ri-phone-line" />
      </v-col>

      <!-- Password (only for new users) -->
      <v-col v-if="!isEditMode" cols="12" md="6">
        <AppInput
          v-model="form.password"
          label="كلمة المرور *"
          type="password"
          :rules="[required, strongPassword]"
          prepend-inner-icon="ri-lock-line"
        />
      </v-col>

      <!-- Role -->
      <v-col cols="12" md="6">
        <v-select v-model="form.role" :items="roleOptions" label="الدور" prepend-inner-icon="ri-shield-user-line" />
      </v-col>

      <!-- Status -->
      <v-col cols="12" md="6">
        <v-switch v-model="form.is_active" label="مستخدم نشط" color="success" hide-details />
      </v-col>

      <!-- Address -->
      <v-col cols="12">
        <v-textarea v-model="form.address" label="العنوان" rows="2" prepend-inner-icon="ri-map-pin-line" />
      </v-col>

      <!-- Notes -->
      <v-col cols="12">
        <v-textarea v-model="form.notes" label="ملاحظات" rows="2" prepend-inner-icon="ri-file-text-line" />
      </v-col>
    </v-row>

    <!-- Actions -->
    <FormActions :loading="loading" @cancel="$emit('cancel')" @submit="handleSubmit" />
  </v-form>
</template>

<script setup>
import { ref, watch } from 'vue';
import { AppInput, FormActions } from '@/components';
import { required, email, phone, strongPassword } from '@/utils/validators';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save', 'cancel']);

const formRef = ref(null);
const loading = ref(false);

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  role: 'employee',
  is_active: true,
  address: '',
  notes: '',
  ...props.modelValue,
});

const roleOptions = [
  { title: 'مدير عام', value: 'admin.super' },
  { title: 'مدير شركة', value: 'admin.company' },
  { title: 'موظف', value: 'employee' },
  { title: 'عميل', value: 'customer' },
];

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();

  if (!valid) return;

  loading.value = true;

  // Remove password if editing
  const data = { ...form.value };
  if (props.isEditMode && !data.password) {
    delete data.password;
  }

  emit('save', data);
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
