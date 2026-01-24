<template>
  <div class="company-settings-page">
    <!-- Header -->
    <div class="page-header mb-8">
      <h1 class="text-h3 font-weight-bold primary--text mb-2">إعدادات الشركة</h1>
      <p class="text-subtitle-1 text-grey-darken-1">تخصيص الهوية البصرية وإدارة البيانات الأساسية للنظام</p>
    </div>

    <!-- Main Content Layout -->
    <v-row class="pb-16 mb-16">
      <!-- Increased padding to clear the fixed footer -->
      <!-- Left Column: Branding & Media -->
      <v-col cols="12" lg="4">
        <AppCard title="الهوية البصرية" icon="ri-magic-line" class="mb-6" no-padding>
          <v-card-text class="pa-8 text-center bg-grey-lighten-5">
            <!-- Professional Logo Preview (Standardized with Brands) -->
            <div class="logo-preview-zone mx-auto mb-6 cursor-pointer">
              <AppAvatar
                :img-url="formData.logo"
                :name="formData.name"
                size="180"
                type="company"
                :editable="canUpdate"
                rounded="xl"
                class="border-2 border-dashed elevation-3 hover-scale overflow-hidden"
                @edit="showMediaGallery = true"
                @crop="handleCurrentCrop"
              />
            </div>

            <h3 class="text-h6 font-weight-bold mb-1">شعار الشركة</h3>
            <p class="text-caption text-grey-darken-1 px-4">
              سيظهر هذا الشعار في الفواتير، التقارير، وفي القائمة الجانبية للنظام. يُنصح باستخدام صورة بخلفية شفافة (PNG) وبأبعاد 512×512.
            </p>
          </v-card-text>
        </AppCard>

        <!-- Business Context Card -->
        <AppCard title="سياق العمل" icon="ri-briefcase-line" class="mb-6">
          <AppInput
            v-model="formData.field"
            label="مجال نشاط الشركة"
            placeholder="مثال: تجارة الملابس، مواد بناء..."
            prepend-inner-icon="ri-service-line"
            class="mb-4"
            :error-messages="errors.field"
          />
          <AppInput
            v-model="formData.description"
            label="نبذة عن الشركة"
            type="textarea"
            prepend-inner-icon="ri-article-line"
            placeholder="وصف مختصر يظهر في بعض التقارير المخصصة..."
            rows="3"
            counter
            maxlength="500"
            :error-messages="errors.description"
          />
        </AppCard>
      </v-col>

      <!-- Right Column: Forms & Data -->
      <v-col cols="12" lg="8">
        <v-form ref="formRef">
          <!-- Information Section -->
          <AppCard title="البيانات الأساسية والقانونية" icon="ri-information-line" class="mb-6">
            <v-row>
              <v-col cols="12" md="6">
                <AppInput
                  v-model="formData.name"
                  label="الاسم التجاري للشركة *"
                  prepend-inner-icon="ri-building-2-fill"
                  :rules="[rules.required]"
                  :error-messages="errors.name"
                />
              </v-col>

              <v-col cols="12" md="6">
                <AppInput
                  v-model="formData.owner_name"
                  label="اسم صاحب المنشأة"
                  prepend-inner-icon="ri-user-star-line"
                  :error-messages="errors.owner_name"
                />
              </v-col>

              <v-col cols="12" md="6">
                <AppInput
                  v-model="formData.tax_number"
                  label="الرقم الضريبي (VAT)"
                  prepend-inner-icon="ri-id-card-line"
                  placeholder="أدخل الرقم الضريبي المكون من 15 رقم"
                  :error-messages="errors.tax_number"
                />
              </v-col>

              <v-col cols="12" md="6">
                <AppInput
                  v-model="formData.address"
                  label="العنوان الرسمي"
                  prepend-inner-icon="ri-map-pin-2-line"
                  placeholder="المدينة، الحي، اسم الشارع"
                  :error-messages="errors.address"
                />
              </v-col>
            </v-row>
          </AppCard>

          <!-- Communications Card -->
          <AppCard title="قنوات الاتصال والتواصل" icon="ri-customer-service-2-line" icon-color="success">
            <v-row>
              <v-col cols="12" md="6">
                <AppInput
                  v-model="formData.phone"
                  label="رقم التواصل الرئيسي"
                  prepend-inner-icon="ri-phone-fill"
                  dir="ltr"
                  :error-messages="errors.phone"
                />
              </v-col>

              <v-col cols="12" md="6">
                <AppInput
                  v-model="formData.email"
                  label="البريد الإلكتروني الرسمي"
                  prepend-inner-icon="ri-mail-send-line"
                  type="email"
                  dir="ltr"
                  :error-messages="errors.email"
                />
              </v-col>

              <v-col cols="12">
                <AppInput
                  v-model="formData.website"
                  label="الموقع الإلكتروني"
                  prepend-inner-icon="ri-global-fill"
                  placeholder="https://example.com"
                  dir="ltr"
                  :error-messages="errors.website"
                  @blur="sanitizeUrl(formData, 'website')"
                />
              </v-col>
            </v-row>

            <!-- Social Media Card -->
            <AppCard title="وسائل التواصل الاجتماعي" icon="ri-share-line" class="my-4">
              <div v-for="(link, index) in formData.social_links" :key="index" class="d-flex align-center gap-3 mb-4">
                <v-select
                  v-model="link.platform"
                  :items="socialPlatforms"
                  item-title="title"
                  item-value="value"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  style="width: 140px; flex-shrink: 0"
                >
                  <template #prepend-inner>
                    <v-icon :icon="getPlatformIcon(link.platform)" size="20" :color="getPlatformColor(link.platform)" />
                  </template>
                </v-select>

                <AppInput
                  v-model="link.url"
                  placeholder="رابط الحساب..."
                  hide-details
                  class="flex-grow-1"
                  dir="ltr"
                  @blur="sanitizeUrl(link, 'url')"
                />

                <AppButton icon="ri-delete-bin-line" variant="text" color="error" size="small" @click="removeSocialLink(index)" />
              </div>

              <AppButton variant="tonal" block prepend-icon="ri-add-line" class="mt-2" @click="addSocialLink"> إضافة رابط تواصل </AppButton>
            </AppCard>
          </AppCard>
        </v-form>
      </v-col>
    </v-row>

    <!-- Fixed Bottom Footer Actions -->
    <div v-if="canUpdate" style="position: sticky; bottom: 15px; z-index: 100" class="d-flex justify-center">
      <AppButton
        size="x-large"
        elevation="8"
        prepend-icon="ri-save-fill"
        :loading="saving"
        rounded="pill"
        class="px-12 font-weight-bold"
        @click="handleSave"
      >
        حفظ كافة التغييرات
      </AppButton>
    </div>

    <!-- Global Loader -->
    <v-overlay :model-value="loading" class="align-center justify-center" persistent>
      <v-progress-circular color="primary" indeterminate size="64" />
    </v-overlay>

    <!-- Professional Media Gallery Component (Standardized) -->
    <MediaGallery v-model="showMediaGallery" type="logo" @select="handleImageSelect" />

    <!-- Image Cropper for existing images -->
    <AppImageCropper v-model="showCropper" :image-src="cropperImageSrc" @cropped="handleCroppedImage" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';
import { useUserStore } from '@/stores/user';
import { usePermissions } from '@/composables/usePermissions';
import MediaGallery from '@/components/common/MediaGallery.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppImageCropper from '@/components/common/AppImageCropper.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import { toast } from 'vue3-toastify';
import { useAuthStore } from '@/stores/auth';
import { PERMISSIONS } from '@/config/permissions';
import { computed } from 'vue';

const userStore = useUserStore();
const authStore = useAuthStore();
const { can } = usePermissions();
const api = useApi('/api/companies');

const isSuperAdmin = computed(() => authStore.user?.permissions?.includes(PERMISSIONS.ADMIN_SUPER));
const isCompanyAdmin = computed(() => authStore.user?.permissions?.includes(PERMISSIONS.ADMIN_COMPANY));

const canUpdate = computed(() => {
  return (
    can(PERMISSIONS.ADMIN_SUPER) || can(PERMISSIONS.ADMIN_COMPANY) || can(PERMISSIONS.COMPANIES_UPDATE_ALL) || can(PERMISSIONS.COMPANIES_UPDATE_SELF)
  );
});

const loading = ref(false);
const saving = ref(false);
const showMediaGallery = ref(false);
const formRef = ref(null);
const errors = ref({});
const showCropper = ref(false);
const cropperImageSrc = ref('');

const formData = ref({
  id: null,
  name: '',
  owner_name: '',
  field: '',
  tax_number: '',
  phone: '',
  email: '',
  address: '',
  description: '',
  website: '',
  logo: '',
  social_links: [],
  images_ids: [],
});

const socialPlatforms = [
  { title: 'فيسبوك', value: 'facebook', icon: 'ri-facebook-fill', color: '#1877F2' },
  { title: 'واتساب', value: 'whatsapp', icon: 'ri-whatsapp-line', color: '#25D366' },
  { title: 'إنستجرام', value: 'instagram', icon: 'ri-instagram-line', color: '#E4405F' },
  { title: 'تويتر (X)', value: 'twitter', icon: 'ri-twitter-x-fill', color: '#000000' },
  { title: 'لينكد إن', value: 'linkedin', icon: 'ri-linkedin-box-line', color: '#0A66C2' },
  { title: 'تيك توك', value: 'tiktok', icon: 'ri-tiktok-line', color: '#000000' },
  { title: 'يوتيوب', value: 'youtube', icon: 'ri-youtube-line', color: '#FF0000' },
  { title: 'سناب شات', value: 'snapchat', icon: 'ri-snapchat-line', color: '#FFFC00' },
  { title: 'تليجرام', value: 'telegram', icon: 'ri-telegram-line', color: '#26A5E4' },
  { title: 'أخرى', value: 'other', icon: 'ri-links-line', color: '#607D8B' },
];

const getPlatformIcon = platform => {
  const p = socialPlatforms.find(i => i.value === platform);
  return p ? p.icon : 'ri-links-line';
};

const getPlatformColor = platform => {
  const p = socialPlatforms.find(i => i.value === platform);
  return p ? p.color : undefined;
};

const addSocialLink = () => {
  formData.value.social_links.push({ platform: 'facebook', url: '' });
};

const removeSocialLink = index => {
  formData.value.social_links.splice(index, 1);
};

const sanitizeUrl = (obj, key) => {
  if (!obj[key]) return;
  const val = obj[key].trim();
  if (!val) return;

  // If it doesn't start with http:// or https://, add https://
  if (!/^https?:\/\//i.test(val)) {
    obj[key] = `https://${val}`;
  }
};

const rules = {
  required: v => !!v || 'هذا الحقل مطلوب أساسي لاستكمال البيانات',
};

const handleImageSelect = image => {
  formData.value.logo = image.url;
  formData.value.images_ids = [image.id];
  toast.success('تم اختيار الشعار بنجاح، يرجى الحفظ لاعتماد التغييرات');
};

const handleCurrentCrop = () => {
  if (!formData.value.logo) return;
  cropperImageSrc.value = formData.value.logo;
  showCropper.value = true;
};

const handleCroppedImage = async blob => {
  saving.value = true;
  const imageApi = useApi('/api/images');
  const uploadData = new FormData();
  const file = new File([blob], `logo_cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
  uploadData.append('images[]', file);
  uploadData.append('type', 'logo');

  try {
    const res = await imageApi.create(uploadData, { showLoading: false });
    if (res.data && res.data.length > 0) {
      const newImage = res.data[0];
      formData.value.logo = newImage.url;
      formData.value.images_ids = [newImage.id];
      // Save settings immediately
      await handleSave();
    }
  } catch (error) {
    console.error('Logo crop save failed:', error);
  } finally {
    saving.value = false;
    showCropper.value = false;
  }
};

const loadCompanyData = async () => {
  const companyId = userStore.currentUser?.company_id;
  if (!companyId) return;

  loading.value = true;
  try {
    const response = await api.getById(companyId, { showLoading: false });
    if (response.data) {
      const data = response.data;
      formData.value = {
        id: data.id,
        name: data.name || '',
        owner_name: data.owner_name || '',
        field: data.field || '',
        tax_number: data.tax_number || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        description: data.description || '',
        website: data.website || '',
        logo: data.logo || '',
        social_links: Array.isArray(data.social_links) ? data.social_links : [],
        images_ids: [],
      };
    }
  } catch (error) {
    console.error('Error loading company data:', error);
    toast.error('فشل في تحميل بيانات الشركة');
  } finally {
    loading.value = false;
  }
};

const handleSave = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) {
    toast.error('يرجى تصحيح الأخطاء في الحقول المطلوبة');
    return;
  }

  saving.value = true;
  errors.value = {};

  try {
    const payload = { ...formData.value };

    // Only send images_ids if a new logo was selected
    if (payload.images_ids.length === 0) {
      delete payload.images_ids;
    }

    await api.update(formData.value.id, payload);

    // Refresh user info to update global branding (like sidebar logo)
    await userStore.fetchUser();
  } catch (error) {
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors;
    }
    console.error('Save error:', error);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  loadCompanyData();
});
</script>

<style scoped>
.company-settings-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 16px;
  background-color: #f8f9fa;
  min-height: 100vh;
  position: relative;
}

.sticky-footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border-top: 1px solid rgba(var(--v-border-color), 0.1);
  z-index: 1000;
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.05);
  /* Respect sidebar width if it affects layout */
}

.logo-preview-zone {
  width: 180px;
  height: 180px;
}

.logo-preview-zone .change-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--v-theme-primary), 0.75);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 2;
  backdrop-filter: blur(2px);
}

.logo-preview-zone:hover .change-overlay {
  opacity: 1;
}

.hover-scale {
  transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.logo-preview-zone:hover .hover-scale {
  transform: scale(1.05);
}

.gap-3 {
  gap: 12px;
}

/* RTL Layout Fix for dir="ltr" inputs */
[dir='ltr'] :deep(.v-field__input) {
  text-align: left;
}

/* Custom elevations and shadows */
.elevation-6 {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.border-dashed {
  border: 2px dashed #cfd8dc !important;
}
</style>
