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
                <AppBalanceDisplay 
                  :amount="userStore.currentUser?.receivable_balance ?? 0" 
                  perspective="admin"
                  value-class="text-body-1 font-weight-bold"
                />
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

          <!-- Removed old save button container because we are now using the sticky footer -->
        </v-form>
      </v-col>

      <!-- Quick Actions Column -->
      <v-col cols="12" lg="4">
        <AppCard title="إجراءات سريعة" icon="ri-flashlight-line">
          <v-list density="compact" nav>
            <v-list-item prepend-icon="ri-lock-password-line" title="تغيير كلمة المرور" @click="showPasswordDialog = true" />
            <v-list-item prepend-icon="ri-history-line" title="سجل نشاطاتي" :to="`/app/activity-logs?user_id=${userStore.currentUser?.id}`" />
          </v-list>
        </AppCard>
      </v-col>

      <!-- Guidance Settings Column -->
      <v-col cols="12" lg="8">
        <AppCard title="إعدادات المساعدة والدعم الإرشادي" icon="ri-guide-line">
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <h4 class="text-subtitle-1 font-weight-bold mb-1">نظام التوجيه والتعليم المساعد</h4>
                <p class="text-caption text-grey">تفعيل أو تعطيل الجولات التعريفية التلقائية والتعليمات التفاعلية داخل النظام.</p>
              </div>
              <AppSwitch
                v-model="guidanceEnabled"
                hide-details
                color="primary"
                @change="handleGuidanceToggle"
              />
            </div>
            
            <v-divider class="my-4" />

            <div class="d-flex align-center justify-space-between">
              <div>
                <h4 class="text-subtitle-1 font-weight-bold mb-1">إعادة تشغيل الجولات الإرشادية</h4>
                <p class="text-caption text-grey">سيؤدي هذا إلى إعادة تشغيل كافة الجولات التعريفية وقائمة التهيئة من البداية.</p>
              </div>
              <AppButton
                color="warning"
                variant="tonal"
                prepend-icon="ri-restart-line"
                @click="handleResetGuidance"
              >
                إعادة ضبط
              </AppButton>
            </div>
          </v-card-text>
        </AppCard>
      </v-col>
    </v-row>

    <!-- Professional Media Gallery Component -->
    <MediaGallery v-model="showMediaGallery" type="avatar" @select="handleImageSelect" />

    <!-- Image Cropper for existing images -->
    <AppImageCropper v-model="showCropper" :image-src="cropperImageSrc" crop-type="circle" @cropped="handleCroppedImage" />

    <!-- Sticky Save Footer -->
    <v-footer app border class="sticky-save-footer pa-4 px-8 bg-white elevation-10">
      <div class="max-width-container d-flex align-center justify-space-between w-100">
        <div class="d-none d-md-flex align-center gap-2">
          <v-icon icon="ri-information-line" color="grey" size="sm" />
          <span class="text-caption text-grey">تأكد من مراجعة كافة البيانات قبل الحفظ</span>
        </div>
        <div class="d-flex align-center gap-3 ms-auto">
          <AppButton v-if="userStore.currentUser" variant="tonal" color="grey" @click="initForm"> إعادة تعيين </AppButton>
          <AppButton
            size="large"
            prepend-icon="ri-save-fill"
            :loading="saving"
            class="px-8 font-weight-bold shadow-md rounded-pill"
            @click="handleSave"
          >
            حفظ كافة التغييرات
          </AppButton>
        </div>
      </div>
    </v-footer>

    <!-- Change Password Dialog -->
    <AppDialog
      v-model="showPasswordDialog"
      title="تغيير كلمة المرور"
      subtitle="قم بتعيين كلمة مرور جديدة قوية لحماية حسابك"
      icon="ri-lock-password-line"
      max-width="500"
    >
      <v-form ref="passwordFormRef" @submit.prevent="handleUpdatePassword">
        <v-alert type="info" variant="tonal" class="mb-4 rounded-lg text-caption" density="compact">
          يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل وتكون مزيجاً من الأحرف والأرقام.
        </v-alert>

        <AppInput
          v-model="passwordForm.password"
          label="كلمة المرور الجديدة *"
          :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="ri-lock-2-line"
          :append-inner-icon="showPassword ? 'ri-eye-line' : 'ri-eye-off-line'"
          @click:append-inner="showPassword = !showPassword"
          :rules="[rules.required, rules.minLength(8)]"
          required
          class="mb-1"
        />

        <!-- مؤشر قوة كلمة المرور -->
        <div class="strength-meter mb-4" v-if="passwordForm.password.length > 0">
          <div class="strength-bars">
            <div v-for="n in 4" :key="n" class="strength-bar"
              :class="{ 'strength-bar--active': passwordStrength >= n, [`strength-bar--${passwordStrengthColor}`]: passwordStrength >= n }">
            </div>
          </div>
          <span class="strength-label" :class="`text-${passwordStrengthColor}`">{{ passwordStrengthLabel }}</span>
        </div>

        <AppInput
          v-model="passwordForm.password_confirmation"
          label="تأكيد كلمة المرور الجديدة *"
          :type="showPasswordConfirm ? 'text' : 'password'"
          prepend-inner-icon="ri-lock-check-line"
          :append-inner-icon="showPasswordConfirm ? 'ri-eye-line' : 'ri-eye-off-line'"
          @click:append-inner="showPasswordConfirm = !showPasswordConfirm"
          :rules="[rules.required, confirmPasswordRule]"
          required
        />

        <!-- علامة تطابق كلمتي المرور -->
        <div v-if="passwordForm.password_confirmation && passwordForm.password" class="match-indicator mb-2">
          <template v-if="passwordForm.password === passwordForm.password_confirmation">
            <v-icon icon="ri-checkbox-circle-line" size="14" class="me-1" color="success" />
            <span class="text-success text-caption font-weight-bold">كلمتا المرور متطابقتان</span>
          </template>
          <template v-else>
            <v-icon icon="ri-close-circle-line" size="14" class="me-1" color="error" />
            <span class="text-error text-caption font-weight-bold">كلمتا المرور غير متطابقتين</span>
          </template>
        </div>
      </v-form>

      <template #actions>
        <AppButton variant="tonal" color="grey" @click="closePasswordDialog">إلغاء</AppButton>
        <AppButton :loading="passwordSaving" color="primary" class="px-6 font-weight-bold rounded-pill" @click="handleUpdatePassword">
          تحديث كلمة المرور
        </AppButton>
      </template>
    </AppDialog>
  </div>
</template>

<script setup>
/**
 * مكون صفحة الملف الشخصي للمستخدم - إدارة البيانات الشخصية وتفضيلات جولات الدعم والإرشاد والمساعدة الذكية.
 */

import { ref, onMounted, reactive, computed } from 'vue';
import { useUserStore } from '@/stores/user';
import { useApi } from '@/composables/useApi';
import { toast } from 'vue3-toastify';
import AppCard from '@/components/common/AppCard.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import MediaGallery from '@/components/common/MediaGallery.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppImageCropper from '@/components/common/AppImageCropper.vue';
import AppBalanceDisplay from '@/components/common/AppBalanceDisplay.vue';
import AppSwitch from '@/components/common/AppSwitch.vue';
import { useGuidance } from '@/modules/guidance/composables/useGuidance';

const userStore = useUserStore();
const api = useApi('/api/users');
const formRef = ref(null);
const passwordFormRef = ref(null);
const saving = ref(false);
const passwordSaving = ref(false);
const showMediaGallery = ref(false);
const showPasswordDialog = ref(false);

const { isEnabled, toggleGuidance, resetProgress } = useGuidance();

const guidanceEnabled = computed({
  get: () => isEnabled.value,
  set: (val) => toggleGuidance(val)
});

const handleGuidanceToggle = (val) => {
  toast.success(val ? 'تم تفعيل جولات المساعدة والإرشاد بنجاح' : 'تم تعطيل جولات المساعدة والإرشاد');
};

const handleResetGuidance = async () => {
  try {
    await resetProgress();
    toast.success('تم إعادة ضبط جولات المساعدة والتهيئة بنجاح');
  } catch (error) {
    toast.error('حدث خطأ أثناء إعادة ضبط جولات المساعدة');
  }
};
const showPassword = ref(false);
const showPasswordConfirm = ref(false);
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

const passwordForm = reactive({
  password: '',
  password_confirmation: '',
});

// مؤشر قوة كلمة المرور
const passwordStrength = computed(() => {
  const p = passwordForm.password;
  if (!p) return 0;
  let score = 0;
  if (p.length >= 8) score++;
  if (p.length >= 12) score++;
  if (/[A-Z]/.test(p) || /[a-z]/.test(p)) score++;
  if (/[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p)) score++;
  return Math.min(score, 4);
});

const passwordStrengthColor = computed(() => {
  const map = ['', 'error', 'warning', 'blue', 'success'];
  return map[passwordStrength.value] || '';
});

const passwordStrengthLabel = computed(() => {
  const map = ['', 'ضعيفة جداً', 'ضعيفة', 'جيدة', 'قوية جداً'];
  return map[passwordStrength.value] || '';
});

const confirmPasswordRule = (val) => {
  return val === passwordForm.password || 'تأكيد كلمة المرور غير متطابق';
};

const rules = {
  required: v => !!v || 'هذا الحقل مطلوب',
  email: v => /.+@.+\..+/.test(v) || 'يرجى إدخال بريد إلكتروني صحيح',
  minLength: min => v => (v && v.length >= min) || `يجب أن لا يقل عن ${min} أحرف`,
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

    await api.update(formData.id, payload, { showSuccess: false });

    // Refresh user data in store
    await userStore.fetchUser();
    toast.success('تم حفظ التغييرات بنجاح');
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    }
  } finally {
    saving.value = false;
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

const handleUpdatePassword = async () => {
  const { valid } = await passwordFormRef.value.validate();
  if (!valid) return;

  passwordSaving.value = true;
  try {
    await api.update(formData.id, {
      password: passwordForm.password,
      password_confirmation: passwordForm.password_confirmation,
    }, { showSuccess: false });
    toast.success('تم تحديث كلمة المرور بنجاح');
    closePasswordDialog();
  } catch (error) {
    if (error.response?.data?.errors) {
      toast.error(Object.values(error.response.data.errors)[0][0]);
    }
  } finally {
    passwordSaving.value = false;
  }
};

const closePasswordDialog = () => {
  showPasswordDialog.value = false;
  passwordForm.password = '';
  passwordForm.password_confirmation = '';
  showPassword.value = false;
  showPasswordConfirm.value = false;
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

.sticky-save-footer {
  z-index: 100;
  height: 80px;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(8px);
  border-top: 1px solid #eee !important;
}

.max-width-container {
  max-width: 1200px;
  margin: 0 auto;
}

.shadow-md {
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.2) !important;
}

.rounded-pill {
  border-radius: 9999px !important;
}

/* Ensure content doesn't get hidden behind the sticky footer */
.pb-16 {
  padding-bottom: 100px !important;
}

/* Password Strength Meter */
.strength-meter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.strength-bars {
  display: flex;
  gap: 4px;
  flex: 1;
}
.strength-bar {
  height: 4px;
  flex: 1;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.06);
  transition: background 0.3s ease;
}
.strength-bar--active.strength-bar--error { background: #f87171; }
.strength-bar--active.strength-bar--warning { background: #fbbf24; }
.strength-bar--active.strength-bar--blue { background: #60a5fa; }
.strength-bar--active.strength-bar--success { background: #4ade80; }
.strength-label {
  font-size: 0.72rem;
  font-weight: 700;
  white-space: nowrap;
}
.match-indicator {
  display: flex;
  align-items: center;
  margin-top: 4px;
}
</style>
