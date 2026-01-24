<template>
  <AppDialog
    :model-value="modelValue"
    :title="isEdit ? 'تعديل نوع الخزينة' : 'نوع خزينة جديد'"
    :icon="isEdit ? 'ri-edit-line' : 'ri-inbox-archive-line'"
    :loading="loading"
    max-width="600"
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="handleSubmit"
  >
    <template #prepend-title>
      <v-icon :icon="isEdit ? 'ri-edit-line' : 'ri-inbox-archive-line'" class="me-2" />
    </template>
    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <v-row>
        <!-- Logo Selection Section -->
        <v-col cols="12" class="d-flex justify-center mb-4">
          <div class="logo-preview-zone position-relative cursor-pointer" @click="showMediaGallery = true">
            <v-avatar size="120" rounded="xl" color="grey-lighten-4" class="border-2 border-dashed elevation-1 hover-scale overflow-hidden">
              <v-img v-if="imagePreview" :src="imagePreview" cover />
              <v-icon v-else icon="ri-image-add-line" size="40" color="grey-lighten-1" />

              <div class="change-overlay d-flex flex-column align-center justify-center rounded-lg">
                <v-icon icon="ri-exchange-line" color="white" size="24" />
                <span class="text-white text-caption mt-1 font-weight-bold">تغيير الشعار</span>
              </div>
            </v-avatar>
          </div>
        </v-col>

        <v-col cols="12">
          <AppInput
            v-model="formData.name"
            label="اسم نوع الخزينة *"
            prepend-inner-icon="ri-inbox-archive-line"
            :rules="[rules.required]"
            :error-messages="errors.name"
          />
        </v-col>

        <v-col cols="12">
          <AppInput
            v-model="formData.description"
            label="الوصف *"
            prepend-inner-icon="ri-article-line"
            :rules="[rules.required]"
            :error-messages="errors.description"
          />
        </v-col>

        <v-col v-if="canToggle" cols="12">
          <v-card variant="tonal" :color="formData.is_active ? 'primary' : 'grey'" class="pa-4 rounded-lg mt-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-bold">حالة النشاط</div>
                <div class="text-subtitle-2 opacity-70">تفعيل أو تعطيل هذا النوع في شاشات الخزينة</div>
              </div>
              <AppSwitch v-model="formData.is_active" label="نشط" hide-details />
            </div>
          </v-card>
        </v-col>

        <v-col v-if="isSuperAdmin" cols="12">
          <v-card variant="tonal" :color="formData.is_system ? 'info' : 'grey'" class="pa-4 rounded-lg">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-bold">نوع أساسي (System)</div>
                <div class="text-subtitle-2 opacity-70">إذا تم تفعيلها، ستظهر لجميع الشركات كنظام افتراضي</div>
              </div>
              <AppSwitch v-model="formData.is_system" color="info" hide-details />
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-form>

    <!-- Media Gallery Wrapper -->
    <MediaGallery v-model="showMediaGallery" type="logo" @select="handleImageSelect" />
  </AppDialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import AppDialog from '@/components/common/AppDialog.vue';
import AppInput from '@/components/common/AppInput.vue';
import MediaGallery from '@/components/common/MediaGallery.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';
import { useUserStore } from '@/stores/user';
import { PERMISSIONS } from '@/config/permissions';

const userStore = useUserStore();
const isSuperAdmin = computed(() => userStore.isAdmin);
const isCompanyAdmin = computed(() => userStore.isCompanyAdmin);

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  cashBoxType: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'saved']);

const canToggle = computed(() => {
  if (isSuperAdmin.value) return true;
  if (props.cashBoxType?.is_system) return false;

  return isCompanyAdmin.value || userStore.hasPermission(PERMISSIONS.CASH_BOX_TYPES_UPDATE_ALL);
});

const api = useApi('/api/cash-box-types');
const formRef = ref(null);
const loading = ref(false);
const showMediaGallery = ref(false);
const imagePreview = ref(null);
const errors = ref({});

const formData = ref({
  name: '',
  description: '',
  is_active: true,
  is_system: false,
  image_id: null,
});

const isEdit = computed(() => !!props.cashBoxType?.id);

const rules = {
  required: v => !!v || 'هذا الحقل مطلوب',
};

const handleImageSelect = image => {
  formData.value.image_id = image.id;
  imagePreview.value = image.url;
};

const resetForm = () => {
  formData.value = {
    name: '',
    description: '',
    is_active: true,
    is_system: false,
    image_id: null,
  };
  imagePreview.value = null;
  errors.value = {};
  formRef.value?.resetValidation();
};

watch(
  () => props.cashBoxType,
  newVal => {
    if (newVal) {
      formData.value = {
        name: newVal.name || '',
        description: newVal.description || '',
        is_active: Boolean(newVal.is_active ?? true),
        is_system: Boolean(newVal.is_system),
        image_id: newVal.image_id || null,
      };
      imagePreview.value = newVal.image_url || null;
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

const handleSubmit = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  errors.value = {};

  try {
    if (isEdit.value) {
      await api.update(props.cashBoxType.id, formData.value, {
        successMessage: 'تم تحديث نوع الخزينة بنجاح',
      });
    } else {
      await api.create(formData.value, {
        successMessage: 'تم إضافة نوع الخزينة بنجاح',
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
</script>

<style scoped>
.logo-preview-zone .change-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 2;
}

.logo-preview-zone:hover .change-overlay {
  opacity: 1;
}

.hover-scale {
  transition: transform 0.2s;
}

.hover-scale:hover {
  transform: scale(1.02);
}
</style>
