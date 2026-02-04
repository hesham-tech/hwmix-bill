<template>
  <AppDialog
    :model-value="modelValue"
    :title="isEdit ? 'تعديل طريقة الدفع' : 'طريقة دفع جديدة'"
    :icon="isEdit ? 'ri-edit-line' : 'ri-bank-card-line'"
    :loading="loading"
    max-width="600"
    @update:model-value="$emit('update:modelValue', $event)"
    @confirm="handleSubmit"
  >
    <template #prepend-title>
      <v-icon :icon="isEdit ? 'ri-edit-line' : 'ri-bank-card-line'" class="me-2" />
    </template>
    <v-form ref="formRef" @submit.prevent="handleSubmit">
      <v-row>
        <!-- Logo Selection Section -->
        <v-col cols="12" class="d-flex justify-center mb-4">
          <div class="logo-preview-zone position-relative cursor-pointer" @click="showMediaGallery = true">
            <v-avatar size="120" rounded="md" color="grey-lighten-4" class="border-2 border-dashed elevation-1 hover-scale overflow-hidden">
              <v-img v-if="imagePreview" :src="imagePreview" cover />
              <v-icon v-else icon="ri-image-add-line" size="40" color="grey-lighten-1" />

              <div class="change-overlay d-flex flex-column align-center justify-center rounded-md">
                <v-icon icon="ri-exchange-line" color="white" size="24" />
                <span class="text-white text-caption mt-1 font-weight-bold">تغيير الشعار</span>
              </div>
            </v-avatar>
          </div>
        </v-col>

        <v-col cols="12">
          <AppInput
            v-model="formData.name"
            label="اسم طريقة الدفع *"
            prepend-inner-icon="ri-bank-card-line"
            :rules="[rules.required]"
            :error-messages="errors.name"
          />
        </v-col>

        <v-col cols="12">
          <AppInput
            v-model="formData.code"
            label="الكود *"
            prepend-inner-icon="ri-key-line"
            :rules="[rules.required]"
            :error-messages="errors.code"
            :disabled="isEdit"
            hint="كود فريد للتعريف بالنظام (مثل: CASH, BANK)"
            persistent-hint
          />
        </v-col>

        <v-col v-if="canToggle" cols="12">
          <v-card variant="tonal" :color="formData.active ? 'primary' : 'grey'" class="pa-4 rounded-md mt-4">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-bold">حالة النشاط</div>
                <div class="text-caption">تفعيل أو تعطيل هذه الطريقة في شاشات الدفع</div>
              </div>
              <AppSwitch v-model="formData.active" label="نشط" hide-details />
            </div>
          </v-card>
        </v-col>

        <v-col v-if="isSuperAdmin" cols="12">
          <v-card variant="tonal" :color="formData.is_system ? 'info' : 'grey'" class="pa-4 rounded-md">
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-subtitle-1 font-weight-bold">طريقة أساسية (System)</div>
                <div class="text-caption">إذا تم تفعيلها، ستظهر لجميع الشركات كنظام افتراضي</div>
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
import { ref, watch, computed, onMounted } from 'vue';
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

onMounted(() => {
  // User permissions debug logs removed as problem is solved
});

const canToggle = computed(() => {
  if (isSuperAdmin.value) return true;
  // طرق السـيستم لا يمكن لغير السوبر أدمن تعديل حالتها
  if (props.paymentMethod?.is_system) return false;

  return isCompanyAdmin.value || userStore.hasPermission(PERMISSIONS.PAYMENT_METHODS_UPDATE_ALL);
});

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
const showMediaGallery = ref(false);
const imagePreview = ref(null);
const errors = ref({});

const formData = ref({
  name: '',
  code: '',
  active: true,
  is_system: false,
  image_id: null,
});

const isEdit = computed(() => !!props.paymentMethod?.id);

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
    code: '',
    active: true,
    is_system: false,
    image_id: null,
  };
  imagePreview.value = null;
  errors.value = {};
  formRef.value?.resetValidation();
};

// Watch for payment method changes to pre-fill form
watch(
  () => props.paymentMethod,
  newVal => {
    if (newVal) {
      formData.value = {
        name: newVal.name || '',
        code: newVal.code || '',
        active: Boolean(newVal.active ?? true),
        is_system: Boolean(newVal.is_system),
        image_id: newVal.image_id || null,
      };
      console.log('Payment Method Loaded:', newVal.name, 'is_system:', newVal.is_system, 'cast:', formData.value.is_system);
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

.max-width-300 {
  max-width: 300px;
}

.hover-scale {
  transition: transform 0.2s;
}

.hover-scale:hover {
  transform: scale(1.02);
}
</style>
