<template>
  <v-card class="role-form-card" flat>
    <v-card-text class="pa-6">
      <v-form ref="formRef" v-model="isValid">
        <v-row>
          <v-col cols="12" md="6">
            <AppInput
              v-model="form.label"
              label="اسم الدور (بالعربي)"
              placeholder="مثال: محاسب، مدير مبيعات..."
              required
              :rules="[v => !!v || 'الاسم مطلوب']"
            />
          </v-col>
          <v-col cols="12" md="6">
            <AppInput
              v-model="form.name"
              label="رمز الدور (English Key) - اختياري"
              placeholder="سيتم التوليد تلقائياً إن لم يُملأ"
              :disabled="isEditMode"
              hint="سيتم التوليد تلقائياً من الاسم العربي"
            />
          </v-col>
          <v-col cols="12">
            <AppInput v-model="form.description" label="الوصف" placeholder="اشرح مهام هذا الدور باختصار..." textarea />
          </v-col>
        </v-row>

        <div class="mt-8">
          <div class="d-flex align-center justify-space-between mb-4">
            <div>
              <h3 class="text-h6 font-weight-bold">صلاحيات الدور</h3>
              <p class="text-caption text-grey">حدد العمليات التي يستطيع أصحاب هذا الدور القيام بها</p>
            </div>
            <v-chip color="primary" size="small">{{ form.permissions.length }} صلاحية مختارة</v-chip>
          </div>

          <PermissionSelector v-model="form.permissions" :available-permissions="availablePermissions" :show-expert-toggle="false" />
        </div>
      </v-form>
    </v-card-text>

    <v-divider />

    <v-card-actions class="pa-6 bg-grey-lighten-5 rounded-b-xl">
      <v-spacer />
      <AppButton variant="tonal" color="grey" @click="$emit('cancel')">إلغاء</AppButton>
      <AppButton color="primary" :loading="loading" :disabled="!isValid" class="px-8" @click="handleSubmit">
        {{ isEditMode ? 'تحديث الدور' : 'إنشاء الدور' }}
      </AppButton>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import PermissionSelector from './PermissionSelector.vue';

const props = defineProps({
  role: {
    type: Object,
    default: () => ({}),
  },
  availablePermissions: {
    type: Object,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['save', 'cancel']);

const formRef = ref(null);
const isValid = ref(false);

const form = ref({
  name: props.role.name || '',
  label: props.role.label || '',
  description: props.role.description || '',
  permissions: props.role.permissions?.map(p => p.name) || [],
});

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (valid) {
    emit('save', { ...form.value });
  }
};
</script>

<style scoped>
.role-form-card {
  border-radius: 20px;
}
</style>
