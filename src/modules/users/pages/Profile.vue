<template>
  <div class="profile-page">
    <div class="page-header mb-8">
      <h1 class="text-h3 font-weight-bold primary--text mb-2">الملف الشخصي</h1>
      <p class="text-subtitle-1 text-grey-darken-1">إدارة بياناتك الشخصية وإعدادات الحساب</p>
    </div>

    <v-row class="pb-16 mb-16">
      <!-- Left Column: Avatar & Quick Info -->
      <v-col cols="12" lg="4">
        <AppCard title="الصورة الشخصية" icon="ri-user-smile-line" class="mb-2" no-padding>
          <v-card-text class="pa-8 text-center bg-grey-lighten-5">
            <AppAvatar
              :img-url="formData.avatar_url"
              :name="formData.name"
              size="180"
              type="user"
              editable
              class="border-2 border-dashed elevation-3 hover-scale overflow-hidden"
              @edit="showMediaGallery = true"
              @crop="handleCurrentCrop"
            />

            <h3 class="text-h6 font-weight-bold mb-1">{{ userStore.currentUser?.name }}</h3>
            <v-chip color="primary" variant="tonal" size="small" class="mb-4">
              {{ userStore.currentUser?.role || 'مستخدم' }}
            </v-chip>

            <v-divider class="mb-4" />

            <div class="d-flex justify-space-around">
              <div class="text-center">
                <div class="text-caption text-grey">كود المستخدم</div>
                <div class="text-body-1 font-weight-bold">#{{ userStore.currentUser?.id }}</div>
              </div>
              <v-divider vertical inset />
              <div class="text-center">
                <div class="text-caption text-grey">الرصيد الحالي</div>
                <div class="text-body-1 font-weight-bold text-success">{{ userStore.currentUser?.balance || 0 }}</div>
              </div>
            </div>
          </v-card-text>
        </AppCard>

        <!-- Account Specs -->
        <AppCard title="معلومات الحساب" icon="ri-key-line" class="mb-2">
          <AppInput
            v-model="formData.username"
            label="اسم المستخدم (Username)"
            prepend-inner-icon="ri-at-line"
            dir="ltr"
            placeholder="مثال: hwmix_owner"
            :error-messages="errors.username"
          />
          <AppInput
            v-model="formData.position"
            label="المسمى الوظيفي"
            prepend-inner-icon="ri-briefcase-line"
            placeholder="مثال: مدير مبيعات، عميل مميز..."
            :error-messages="errors.position"
          />
        </AppCard>
      </v-col>

      <!-- Right Column: Profile Form -->
      <v-col cols="12" lg="8">
        <v-form ref="formRef" @submit.prevent="handleSave">
          <AppCard title="البيانات الشخصية" icon="ri-profile-line" class="mb-2">
            <v-row>
              <v-col cols="12" md="8">
                <AppInput
                  v-model="formData.full_name"
                  label="الاسم الكامل *"
                  prepend-inner-icon="ri-user-line"
                  :rules="[rules.required]"
                  :error-messages="errors.full_name"
                />
              </v-col>

              <v-col cols="12" md="4">
                <AppInput
                  v-model="formData.nickname"
                  label="الاسم المستعار / اللقب *"
                  prepend-inner-icon="ri-user-heart-line"
                  :rules="[rules.required]"
                  :error-messages="errors.nickname"
                />
              </v-col>

              <v-col cols="12" md="6">
                <AppInput
                  v-model="formData.email"
                  label="البريد الإلكتروني"
                  prepend-inner-icon="ri-mail-line"
                  type="email"
                  dir="ltr"
                  :rules="formData.email ? [rules.email] : []"
                  :error-messages="errors.email"
                />
              </v-col>

              <v-col cols="12" md="6">
                <AppInput
                  v-model="formData.phone"
                  label="رقم الهاتف *"
                  prepend-inner-icon="ri-phone-line"
                  dir="ltr"
                  :rules="[rules.required]"
                  :error-messages="errors.phone"
                />
              </v-col>
            </v-row>
          </AppCard>

          <div class="d-flex justify-end gap-3 mt-6">
            <AppButton size="large" prepend-icon="ri-save-fill" :loading="saving" class="px-8 font-weight-bold" type="submit">
              حفظ التغييرات
            </AppButton>
          </div>
        </v-form>
      </v-col>
      <v-col cols="12" lg="4">
        <AppCard title="إجراءات سريعة" icon="ri-flashlight-line">
          <v-list density="compact" nav>
            <v-list-item prepend-icon="ri-lock-password-line" title="تغيير كلمة المرور" to="/forgot-password" />
            <v-list-item prepend-icon="ri-history-line" title="سجل نشاطاتي" :to="`/app/activity-logs?user_id=${userStore.currentUser?.id}`" />
          </v-list>
        </AppCard>
      </v-col>
    </v-row>

    <!-- Professional Media Gallery Component -->
    <MediaGallery v-model="showMediaGallery" type="avatar" @select="handleImageSelect" />

    <!-- Image Cropper for existing images -->
    <AppImageCropper v-model="showCropper" :image-src="cropperImageSrc" crop-type="circle" @cropped="handleCroppedImage" />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useUserStore } from '@/stores/user';
import { useApi } from '@/composables/useApi';
import { toast } from 'vue3-toastify';
import AppCard from '@/components/common/AppCard.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import MediaGallery from '@/components/common/MediaGallery.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppImageCropper from '@/components/common/AppImageCropper.vue';

const userStore = useUserStore();
const api = useApi('/api/users');
const formRef = ref(null);
const saving = ref(false);
const showMediaGallery = ref(false);
const errors = ref({});

const formData = reactive({
  id: null,
  full_name: '',
  nickname: '',
  username: '',
  position: '',
  email: '',
  phone: '',
  avatar_url: '',
  name: '',
  images_ids: [],
});

const showCropper = ref(false);
const cropperImageSrc = ref('');

const rules = {
  required: v => !!v || 'هذا الحقل مطلوب',
  email: v => /.+@.+\..+/.test(v) || 'يرجى إدخال بريد إلكتروني صحيح',
};

const handleImageSelect = image => {
  formData.avatar_url = image.url;
  formData.images_ids = [image.id];
  toast.success('تم اختيار الصورة بنجاح');
};

const handleCurrentCrop = () => {
  if (!formData.avatar_url) return;
  cropperImageSrc.value = formData.avatar_url;
  showCropper.value = true;
};

const handleCroppedImage = async blob => {
  saving.value = true;
  const imageApi = useApi('/api/images');
  const uploadData = new FormData();
  const file = new File([blob], `avatar_cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
  uploadData.append('images[]', file);
  uploadData.append('type', 'avatar');

  try {
    const res = await imageApi.create(uploadData, { showLoading: false });
    if (res.data && res.data.length > 0) {
      const newImage = res.data[0];
      formData.avatar_url = newImage.url;
      formData.images_ids = [newImage.id];
      // Save profile immediately
      await handleSave();
    }
  } catch (error) {
    console.error('Crop save failed:', error);
  } finally {
    saving.value = false;
    showCropper.value = false;
  }
};

const initForm = () => {
  const user = userStore.currentUser;
  if (!user) return;

  formData.id = user.id;
  formData.full_name = user.full_name || '';
  formData.nickname = user.nickname || '';
  formData.username = user.username || '';
  formData.position = user.position || '';
  formData.email = user.email || '';
  formData.phone = user.phone || '';
  formData.avatar_url = user.avatar_url || '';
  formData.name = user.name || '';
  formData.images_ids = [];
};

const handleSave = async () => {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  saving.value = true;
  errors.value = {};

  try {
    const payload = { ...formData };
    if (payload.images_ids.length === 0) {
      delete payload.images_ids;
    }

    await api.update(formData.id, payload);

    // Refresh user data in store
    await userStore.fetchUser();
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    }
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (userStore.currentUser) {
    initForm();
  } else {
    userStore.fetchUser().then(initForm);
  }
});
</script>

<style scoped>
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 16px;
}

.avatar-preview-zone {
  position: relative;
  width: 180px;
  height: 180px;
}

.avatar-preview-zone .change-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--v-theme-primary), 0.7);
  opacity: 0;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.avatar-preview-zone:hover .change-overlay {
  opacity: 1;
}

.hover-scale {
  transition: transform 0.3s ease;
}

.avatar-preview-zone:hover .hover-scale {
  transform: scale(1.05);
}

.border-dashed {
  border: 2px dashed #e0e0e0 !important;
}

.gap-3 {
  gap: 12px;
}
</style>
