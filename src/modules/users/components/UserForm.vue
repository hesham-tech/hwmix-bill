<template>
  <div class="user-form-container">
    <v-form ref="formRef" @submit.prevent="handleSubmit" class="user-form pa-4">
      <!-- Avatar Selection -->
      <div class="d-flex justify-center mb-8">
        <div class="avatar-selection-zone position-relative cursor-pointer" @click="showMediaGallery = true">
          <v-avatar
            size="120"
            :color="!imagePreview ? 'primary-lighten-5' : undefined"
            class="border-2 border-dashed elevation-2 hover-scale overflow-hidden"
          >
            <v-img v-if="imagePreview" :src="imagePreview" cover />
            <v-icon v-else icon="ri-user-add-line" size="40" color="primary-lighten-1" />

            <div class="change-overlay d-flex flex-column align-center justify-center">
              <v-icon icon="ri-camera-switch-line" color="white" size="24" />
              <span class="text-white text-caption mt-1 font-weight-bold">تغيير الصورة</span>
            </div>
          </v-avatar>
          <v-btn
            icon="ri-gallery-line"
            size="x-small"
            color="primary"
            class="position-absolute bottom-0 right-0 elevation-4"
            @click.stop="showMediaGallery = true"
          />
        </div>
      </div>

      <!-- Found User Notice -->
      <v-expand-transition>
        <v-alert
          v-if="lookupResult && !isEditMode"
          type="info"
          variant="tonal"
          class="mb-6 rounded-xl border-primary animate__animated animate__fadeIn"
          prepend-icon="ri-user-shared-line"
        >
          <div class="d-flex align-center justify-space-between flex-wrap gap-2">
            <div>
              <div class="font-weight-bold">تم العثور على مستخدم موجود مسبقاً!</div>
              <div class="text-caption">سيتم ربط هذا المستخدم بالشركة الحالية مع الحفاظ على هويته العالمية.</div>
            </div>
            <v-btn size="small" variant="text" color="primary" @click="resetForm">مسح البيانات والبدء من جديد</v-btn>
          </div>
        </v-alert>
      </v-expand-transition>

      <v-row>
        <!-- Security & Status (Always visible but styled) -->
        <v-col cols="12">
          <div class="d-flex align-center gap-2 mb-2 text-primary font-weight-bold">
            <v-icon icon="ri-information-line" />
            <span>المعلومات الأساسية</span>
          </div>
          <v-divider class="mb-4" />
        </v-col>

        <!-- Phone (Lookup Trigger) -->
        <v-col cols="12" md="6">
          <AppInput
            v-model="form.phone"
            label="رقم الهاتف *"
            :rules="[required, phone]"
            prepend-inner-icon="ri-phone-line"
            :loading="lookupLoading === 'phone'"
            @blur="handleLookup('phone')"
            :disabled="isEditMode"
          >
            <template #append-inner>
              <v-icon v-if="fieldValid.phone" icon="ri-checkbox-circle-fill" color="success" />
            </template>
          </AppInput>
        </v-col>

        <!-- Email (Lookup Trigger) -->
        <v-col cols="12" md="6">
          <AppInput
            v-model="form.email"
            label="البريد الإلكتروني"
            type="email"
            :rules="[email]"
            prepend-inner-icon="ri-mail-line"
            :loading="lookupLoading === 'email'"
            @blur="handleLookup('email')"
            :disabled="isEditMode"
          >
            <template #append-inner>
              <v-icon v-if="fieldValid.email" icon="ri-checkbox-circle-fill" color="success" />
            </template>
          </AppInput>
        </v-col>

        <v-col cols="12" md="6">
          <AppInput v-model="form.full_name" label="الاسم الكامل *" :rules="[required]" prepend-inner-icon="ri-user-follow-line" />
        </v-col>

        <v-col cols="12" md="6">
          <AppInput v-model="form.nickname" label="الاسم المختصر (اللقب) *" :rules="[required]" prepend-inner-icon="ri-user-star-line" />
        </v-col>

        <v-col cols="12" md="6">
          <AppInput v-model="form.username" label="اسم المستخدم (Username)" :rules="[]" prepend-inner-icon="ri-at-line" />
        </v-col>

        <v-col cols="12" md="6">
          <v-select
            v-model="form.role"
            :items="roleOptions"
            label="الدور الوظيفي"
            prepend-inner-icon="ri-shield-user-line"
            variant="outlined"
            density="comfortable"
          />
        </v-col>

        <!-- Security Section (Hide if linking existing user) -->
        <v-col v-if="!form.id" cols="12" class="mt-4">
          <div class="d-flex align-center gap-2 mb-2 text-warning font-weight-bold">
            <v-icon icon="ri-lock-password-line" />
            <span>الأمان والحالة</span>
          </div>
          <v-divider class="mb-4" />
        </v-col>

        <v-col v-if="!form.id" cols="12" md="6">
          <AppInput
            v-model="form.password"
            :label="isEditMode ? 'كلمة المرور (اتركها فارغة للتخطي)' : 'كلمة المرور *'"
            type="text"
            :rules="isEditMode ? [] : [required, minLength(8)]"
            prepend-inner-icon="ri-lock-line"
          />
        </v-col>

        <v-col cols="12" md="6">
          <v-card
            variant="tonal"
            :color="form.is_active ? 'success' : 'error'"
            class="pa-2 rounded-lg d-flex align-center justify-space-between"
            height="56"
          >
            <span class="ms-2 font-weight-bold">{{ form.is_active ? 'المستخدم نشط' : 'المستخدم معطل' }}</span>
            <AppSwitch v-model="form.is_active" hide-details />
          </v-card>
        </v-col>
      </v-row>

      <!-- Actions -->
      <div class="d-flex justify-end gap-3 mt-8">
        <AppButton variant="tonal" color="grey" @click="$emit('cancel')">إلغاء</AppButton>
        <AppButton :loading="loading" color="primary" class="px-8 font-weight-bold rounded-pill" @click="handleSubmit">
          <v-icon :icon="form.id ? 'ri-user-received-line' : 'ri-save-line'" class="me-2" />
          {{ isEditMode ? 'تحديث البيانات' : form.id ? 'ربط الحساب' : 'إنشاء المستخدم' }}
        </AppButton>
      </div>

      <!-- Media Gallery -->
      <MediaGallery v-model="showMediaGallery" type="avatar" @select="handleImageSelect" />
    </v-form>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import MediaGallery from '@/components/common/MediaGallery.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import { required, email, phone, minLength } from '@/utils/validators';
import { PERMISSIONS } from '@/config/permissions';
import { useUserStore } from '../store/user.store';

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

const store = useUserStore();
const formRef = ref(null);
const loading = ref(false);
const showMediaGallery = ref(false);
const imagePreview = ref(props.modelValue?.avatar_url || null);

// Lookup State
const lookupLoading = ref(null);
const lookupResult = ref(null);
const fieldValid = ref({ phone: false, email: false });

const handleLookup = async field => {
  const value = form.value[field];
  if (!value || value.length < 3) return;

  // Basic format validation before lookup
  if (field === 'email' && !value.includes('@')) return;
  if (field === 'phone' && value.length < 8) return;

  lookupLoading.value = field;
  try {
    const result = await store.lookupUser({ [field]: value });

    // FIX: Check if result exists and is an object, not just a success response
    if (result && typeof result === 'object' && Object.keys(result).length > 0) {
      lookupResult.value = result;
      fieldValid.value[field] = true;

      // Autofill logic
      form.value.id = result.id;
      form.value.full_name = result.full_name || form.value.full_name;
      form.value.nickname = result.nickname || form.value.nickname;
      form.value.username = result.username || form.value.username;
      form.value.email = result.email || form.value.email;
      form.value.phone = result.phone || form.value.phone;
      if (result.avatar_url) {
        imagePreview.value = result.avatar_url;
      }
    } else {
      lookupResult.value = null;
      fieldValid.value[field] = true; // Mark as "Available" (standard green check)
    }
  } catch (error) {
    console.error('Lookup failed:', error);
  } finally {
    lookupLoading.value = null;
  }
};

const resetForm = () => {
  form.value = {
    full_name: '',
    nickname: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    role: 'sales',
    is_active: true,
    address: '',
    notes: '',
    images_ids: [],
  };
  imagePreview.value = null;
  lookupResult.value = null;
  fieldValid.value = { phone: false, email: false };
};

const form = ref({
  full_name: '',
  nickname: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  role: 'sales',
  is_active: true,
  address: '',
  notes: '',
  images_ids: [],
  ...props.modelValue,
});

onMounted(() => {
  store.fetchRoles();
});

const roleOptions = computed(() => {
  return [...store.roles.map(r => ({ title: r.label || r.name, value: r.name })), { title: 'عميل', value: 'customer' }];
});

const handleImageSelect = image => {
  form.value.images_ids = [image.id];
  imagePreview.value = image.url;
};

const handleSubmit = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const data = { ...form.value };
    data.status = data.is_active ? 'active' : 'inactive';

    if (props.isEditMode && !data.password) {
      delete data.password;
    }

    emit('save', data);
  } finally {
    loading.value = false;
  }
};

watch(
  () => props.modelValue,
  newVal => {
    if (newVal) {
      form.value = { ...form.value, ...newVal };
      if (newVal.avatar_url) {
        imagePreview.value = newVal.avatar_url;
      }
    }
  },
  { deep: true, immediate: true }
);
</script>

<style scoped>
.lookup-step {
  max-width: 600px;
  margin: 0 auto;
}

.border-primary {
  border: 1px solid rgb(var(--v-theme-primary)) !important;
  background-color: rgb(var(--v-theme-primary-lighten-5), 0.3) !important;
}

.user-form-container {
  min-height: 400px;
}

.avatar-selection-zone .change-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--v-theme-primary), 0.7);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 2;
}

.avatar-selection-zone:hover .change-overlay {
  opacity: 1;
}

.hover-scale {
  transition: transform 0.2s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

.user-form :deep(.v-divider) {
  opacity: 1;
  border-color: #eee;
}
</style>
