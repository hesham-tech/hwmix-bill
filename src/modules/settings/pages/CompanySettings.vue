<template>
  <div class="company-settings-page">
    <!-- Header -->
    <div class="page-header mb-8">
      <h1 class="text-h3 font-weight-bold primary--text mb-2">إعدادات الشركة</h1>
      <p class="text-subtitle-1 text-grey-darken-1">تخصيص الهوية البصرية وإدارة البيانات الأساسية للنظام</p>
    </div>

    <!-- Main Tabbed Layout -->
    <v-row class="pb-16 mb-16">
      <!-- Tabs Column (Desktop) -->
      <v-col cols="12" md="3" class="d-none d-md-block">
        <v-card flat border class="pa-2 rounded-xl mb-4">
          <v-tabs
            v-model="activeTab"
            direction="vertical"
            color="primary"
            class="company-settings-tabs tour-settings-tabs"
            grow
          >
            <v-tab
              v-for="tab in tabsList"
              :key="tab.value"
              :value="tab.value"
              :class="['justify-start py-3 rounded-lg mb-1', 'tour-settings-tab-' + tab.value]"
            >
              <v-icon start :icon="tab.icon" class="me-3" />
              <div class="text-start">
                <div class="font-weight-bold text-body-1">{{ tab.title }}</div>
                <div class="text-xxs text-grey-darken-1">{{ tab.subtitle }}</div>
              </div>
            </v-tab>
          </v-tabs>
        </v-card>
      </v-col>

      <!-- Tabs Column (Mobile) -->
      <v-col cols="12" class="d-md-none">
        <div class="mobile-tabs-container mb-4 tour-settings-tabs">
          <button
            v-for="tab in tabsList"
            :key="tab.value"
            type="button"
            class="mobile-tab-pill"
            :class="[{ 'active': activeTab === tab.value }, 'tour-settings-tab-' + tab.value]"
            @click="activeTab = tab.value"
          >
            <v-icon :icon="tab.icon" size="18" class="me-2" />
            <span class="text-body-2 font-weight-bold">{{ tab.title }}</span>
          </button>
        </div>
      </v-col>

      <!-- Content Column -->
      <v-col cols="12" md="9">
        <v-form ref="formRef">
          <v-window v-model="activeTab" class="bg-transparent overflow-visible">
            <!-- TAB 1: BASIC IDENTITY -->
            <v-window-item value="basic">
              <v-row>
                <!-- Visual Branding (Logo) -->
                <v-col cols="12" lg="4">
                  <AppCard title="الهوية البصرية" icon="ri-magic-line" no-padding>
                    <v-card-text class="pa-8 text-center bg-grey-lighten-5">
                      <div class="logo-preview-zone mx-auto mb-4 cursor-pointer">
                        <AppAvatar
                          :img-url="formData.logo"
                          :name="formData.name"
                          size="180"
                          type="company"
                          :editable="canUpdate"
                          rounded="md"
                          class="border-2 border-dashed elevation-3 hover-scale overflow-hidden"
                          @edit="showMediaGallery = true"
                          @crop="handleCurrentCrop"
                        />
                      </div>
                      <h3 class="text-subtitle-1 font-weight-bold mb-1">شعار الشركة</h3>
                      <p class="text-caption text-grey-darken-1 px-2">
                        سيظهر هذا الشعار في الفواتير، التقارير، وفي القائمة الجانبية للنظام. يُنصح باستخدام صورة بخلفية شفافة (PNG) وبأبعاد 512×512.
                      </p>
                    </v-card-text>
                  </AppCard>
                </v-col>

                <!-- Basic Legal/Commercial Details -->
                <v-col cols="12" lg="8">
                  <AppCard title="البيانات الأساسية والقانونية" icon="ri-information-line" class="mb-4">
                    <v-row dense>
                      <v-col cols="12" md="6">
                        <AppInput
                          v-model="formData.name"
                          label="الاسم التجاري للشركة *"
                          prepend-inner-icon="ri-building-2-fill"
                          required
                          :rules="[rules.required]"
                          :error-messages="errors.name"
                        >
                          <template v-if="isFieldChanged('name')" #append-inner>
                            <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSave" />
                            <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertField('name')" />
                          </template>
                        </AppInput>
                      </v-col>

                      <v-col cols="12" md="6">
                        <AppInput
                          v-model="formData.owner_name"
                          label="اسم صاحب المنشأة"
                          prepend-inner-icon="ri-user-star-line"
                          :error-messages="errors.owner_name"
                        >
                          <template v-if="isFieldChanged('owner_name')" #append-inner>
                            <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSave" />
                            <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertField('owner_name')" />
                          </template>
                        </AppInput>
                      </v-col>

                      <v-col cols="12" md="6">
                        <AppInput
                          v-model="formData.tax_number"
                          label="الرقم الضريبي (VAT)"
                          prepend-inner-icon="ri-id-card-line"
                          placeholder="أدخل الرقم الضريبي المكون من 15 رقم"
                          :error-messages="errors.tax_number"
                        >
                          <template v-if="isFieldChanged('tax_number')" #append-inner>
                            <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSave" />
                            <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertField('tax_number')" />
                          </template>
                        </AppInput>
                      </v-col>

                      <v-col cols="12" md="6">
                        <AppInput
                          v-model="formData.address"
                          label="العنوان الرسمي"
                          prepend-inner-icon="ri-map-pin-2-line"
                          placeholder="المدينة، الحي، اسم الشارع"
                          :error-messages="errors.address"
                        >
                          <template v-if="isFieldChanged('address')" #append-inner>
                            <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSave" />
                            <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertField('address')" />
                          </template>
                        </AppInput>
                      </v-col>
                    </v-row>
                  </AppCard>

                  <!-- Business Context -->
                  <AppCard title="سياق العمل" icon="ri-briefcase-line">
                    <AppInput
                      v-model="formData.field"
                      label="مجال نشاط الشركة"
                      placeholder="مثال: تجارة الملابس، مواد بناء..."
                      prepend-inner-icon="ri-service-line"
                      class="mb-4"
                      :error-messages="errors.field"
                    >
                      <template v-if="isFieldChanged('field')" #append-inner>
                        <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSave" />
                        <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertField('field')" />
                      </template>
                    </AppInput>
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
                    >
                      <template v-if="isFieldChanged('description')" #append-inner>
                        <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSave" />
                        <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertField('description')" />
                      </template>
                    </AppInput>
                  </AppCard>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- TAB 2: COMMUNICATIONS & SOCIAL -->
            <v-window-item value="contact">
              <v-row>
                <v-col cols="12">
                  <AppCard title="قنوات الاتصال والتواصل" icon="ri-customer-service-2-line" icon-color="success">
                    <v-row dense>
                      <v-col cols="12" md="6">
                        <AppInput
                          v-model="formData.phone"
                          label="رقم التواصل الرئيسي"
                          prepend-inner-icon="ri-phone-fill"
                          dir="ltr"
                          :error-messages="errors.phone"
                        >
                          <template v-if="isFieldChanged('phone')" #append-inner>
                            <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSave" />
                            <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertField('phone')" />
                          </template>
                        </AppInput>
                      </v-col>

                      <v-col cols="12" md="6">
                        <AppInput
                          v-model="formData.email"
                          label="البريد الإلكتروني الرسمي"
                          prepend-inner-icon="ri-mail-send-line"
                          type="email"
                          dir="ltr"
                          :error-messages="errors.email"
                        >
                          <template v-if="isFieldChanged('email')" #append-inner>
                            <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSave" />
                            <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertField('email')" />
                          </template>
                        </AppInput>
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
                        >
                          <template v-if="isFieldChanged('website')" #append-inner>
                            <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSave" />
                            <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertField('website')" />
                          </template>
                        </AppInput>
                      </v-col>
                    </v-row>

                    <!-- Social Media Links -->
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
                        >
                          <template v-if="isFieldChanged('social_links.' + index + '.url')" #append-inner>
                            <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSave" />
                            <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertField('social_links.' + index + '.url')" />
                          </template>
                        </AppInput>

                        <AppButton icon="ri-delete-bin-line" variant="text" color="error" size="small" @click="removeSocialLink(index)" />
                      </div>

                      <AppButton variant="tonal" block prepend-icon="ri-add-line" class="mt-2" @click="addSocialLink"> إضافة رابط تواصل </AppButton>
                    </AppCard>
                  </AppCard>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- TAB 3: INVENTORY & PROFIT -->
            <v-window-item value="inventory">
              <v-row>
                <!-- Inventory & Pricing Settings -->
                <v-col cols="12">
                  <AppCard title="إعدادات المخزون والتسعير" icon="ri-money-dollar-box-line" class="mb-4 tour-settings-inventory" icon-color="primary">
                    <v-row dense>
                      <v-col cols="12">
                        <v-select
                          v-model="formData.settings.inventory_valuation_method"
                          :items="[
                            { title: 'المتوسط المرجح (Average Cost) - موصى به', value: 'average' },
                            { title: 'الوارد أولاً يصرف أولاً (FIFO / Batches)', value: 'fifo' },
                            { title: 'آخر سعر شراء (Last Purchase Price)', value: 'last_purchase_price' },
                          ]"
                          label="طريقة تقييم المخزون وحساب الأرباح"
                          prepend-inner-icon="ri-bar-chart-box-line"
                          variant="outlined"
                          density="comfortable"
                          @update:model-value="handleSave"
                        />
                      </v-col>
                      <v-col cols="12" class="d-flex align-center mt-2">
                        <v-switch
                          v-model="formData.settings.auto_update_purchase_price"
                          color="primary"
                          hide-details
                          @update:model-value="handleSave"
                        >
                          <template #label>
                            <span class="me-2">تحديث السعر الافتراضي عند الشراء</span>
                            <AppFieldHelp text="سيقوم النظام تلقائياً بتحديث سعر الشراء الافتراضي في بطاقة المنتج بآخر سعر تم الشراء به في الفاتورة." />
                          </template>
                        </v-switch>
                      </v-col>
                    </v-row>
                  </AppCard>
                </v-col>

                <!-- System Preferences -->
                <v-col cols="12">
                  <AppCard title="تفضيلات المنتجات" icon="ri-settings-4-line" icon-color="primary">
                    <v-row dense>
                      <v-col cols="12">
                        <v-switch
                          v-model="formData.settings.enable_digital_products"
                          color="primary"
                          hide-details
                          @update:model-value="handleSave"
                        >
                          <template #label>
                            <span class="me-2">تفعيل ودعم المنتجات الرقمية (الأكواد والملفات)</span>
                            <AppFieldHelp text="يتيح بيع منتجات غير ملموسة وتسليم روابط أو مفاتيح ترخيص للعملاء تلقائياً عند تأكيد البيع." />
                          </template>
                        </v-switch>
                      </v-col>
                    </v-row>
                  </AppCard>
                </v-col>

                <!-- Retention Settings -->
                <v-col cols="12">
                  <AppCard title="إعدادات الاحتفاظ بسجلات الأنشطة" icon="ri-history-line" icon-color="primary">
                    <v-row dense>
                      <v-col cols="12" md="6">
                        <AppInput
                          v-model.number="formData.settings.activity_log_retention_value"
                          label="مدة الاحتفاظ بالسجلات"
                          type="number"
                          min="1"
                          required
                          prepend-inner-icon="ri-time-line"
                        >
                          <template v-if="isFieldChanged('settings.activity_log_retention_value')" #append-inner>
                            <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSave" />
                            <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertField('settings.activity_log_retention_value')" />
                          </template>
                        </AppInput>
                      </v-col>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="formData.settings.activity_log_retention_unit"
                          :items="[
                            { title: 'يوم (Days)', value: 'days' },
                            { title: 'شهر (Months)', value: 'months' },
                            { title: 'سنة (Years)', value: 'years' },
                          ]"
                          label="وحدة الوقت"
                          prepend-inner-icon="ri-calendar-line"
                          variant="outlined"
                          density="comfortable"
                          @update:model-value="handleSave"
                        />
                      </v-col>
                      <v-col cols="12">
                        <p class="text-caption text-grey-darken-1 px-2 mb-0">
                          * سيقوم النظام تلقائياً بحذف سجلات الأنشطة القديمة التي تجاوزت المدة المحددة لتوفير مساحة الاستضافة والحفاظ على الأداء العام للنظام.
                        </p>
                      </v-col>
                    </v-row>
                  </AppCard>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- TAB 4: PRINTING & PREFERENCES -->
            <v-window-item value="preferences">
              <v-row>

                <!-- Printing Settings -->
                <v-col cols="12">
                  <AppCard title="إعدادات الطباعة" icon="ri-printer-line" class="mb-4" icon-color="primary">
                    <v-row dense>
                      <v-col cols="12" md="6">
                        <v-select
                          v-model="formData.print_settings.print_format"
                          :items="[
                            { title: 'A4 (قياسي)', value: 'standard' },
                            { title: 'A5 (صغير)', value: 'a5' },
                            { title: 'حراري (80mm)', value: 'thermal' },
                            { title: 'حراري (58mm)', value: 'thermal_58' },
                          ]"
                          label="تنسيق الطباعة المفضل"
                          prepend-inner-icon="ri-layout-grid-line"
                          variant="outlined"
                          density="comfortable"
                          @update:model-value="handleSave"
                        />
                      </v-col>

                      <v-col cols="12" md="6" class="d-flex align-center">
                        <v-switch
                          v-model="formData.print_settings.show_logo"
                          color="primary"
                          hide-details
                          @update:model-value="handleSave"
                        >
                          <template #label>
                            <span class="me-2">إظهار شعار الشركة في المطبوعات</span>
                            <AppFieldHelp text="عند التفعيل، سيتم طباعة شعار الشركة أعلى الترويسة في الفواتير الورقية والإلكترونية." />
                          </template>
                        </v-switch>
                      </v-col>

                      <v-col cols="12">
                        <AppInput
                          v-model="formData.print_settings.footer_text"
                          label="نص تذييل الفاتورة"
                          placeholder="مثال: شكراً لزيارتكم، البضاعة المباعة لا ترد ولا تستبدل..."
                          prepend-inner-icon="ri-text-spacing"
                          type="textarea"
                          rows="2"
                        >
                          <template v-if="isFieldChanged('print_settings.footer_text')" #append-inner>
                            <v-btn icon="ri-check-line" variant="text" color="success" size="x-small" density="comfortable" class="me-1" @click.stop="handleSave" />
                            <v-btn icon="ri-close-line" variant="text" color="error" size="x-small" density="comfortable" @click.stop="revertField('print_settings.footer_text')" />
                          </template>
                        </AppInput>
                      </v-col>
                    </v-row>
                  </AppCard>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
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
        class="px-12 font-weight-bold tour-settings-save"
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
// مكون إعدادات الشركة: يتيح تعديل الشعار، البيانات الأساسية والقانونية، قنوات التواصل، وتفضيلات النظام والطباعة.
import { ref, onMounted, computed } from 'vue';
import { useApi } from '@/composables/useApi';
import { useUserStore } from '@/stores/user';
import { usePermissions } from '@/composables/usePermissions';
import MediaGallery from '@/components/common/MediaGallery.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppImageCropper from '@/components/common/AppImageCropper.vue';
import AppCard from '@/components/common/AppCard.vue';
import AppInput from '@/components/common/AppInput.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppFieldHelp from '@/components/common/AppFieldHelp.vue';
import { toast } from 'vue3-toastify';
import { useAuthStore } from '@/stores/auth';
import { PERMISSIONS } from '@/config/permissions';
import { useGuidance } from '@/modules/guidance/composables/useGuidance';

const userStore = useUserStore();
const authStore = useAuthStore();
const { can } = usePermissions();
const api = useApi('/api/companies');
const { markAsCompleted } = useGuidance();

const activeTab = ref('basic');
const originalData = ref(null);

const isFieldChanged = (path) => {
  if (!originalData.value) return false;
  const keys = path.split('.');
  let currentVal = formData.value;
  let originalVal = originalData.value;
  for (const key of keys) {
    if (currentVal === undefined || currentVal === null) return false;
    if (originalVal === undefined || originalVal === null) return false;
    currentVal = currentVal[key];
    originalVal = originalVal[key];
  }
  return currentVal !== originalVal;
};

const revertField = (path) => {
  if (!originalData.value) return;
  const keys = path.split('.');
  let currentParent = formData.value;
  let originalParent = originalData.value;
  
  for (let i = 0; i < keys.length - 1; i++) {
    currentParent = currentParent[keys[i]];
    originalParent = originalParent[keys[i]];
  }
  
  const lastKey = keys[keys.length - 1];
  currentParent[lastKey] = originalParent[lastKey];
};

const tabsList = [
  { value: 'basic', title: 'البيانات الأساسية', icon: 'ri-building-2-line', subtitle: 'هوية المنشأة والشعار' },
  { value: 'inventory', title: 'المخزون والأرباح', icon: 'ri-funds-box-line', subtitle: 'طرق التقييم وتحديث الأسعار' },
  { value: 'preferences', title: 'الطباعة والتفضيلات', icon: 'ri-printer-line', subtitle: 'إعدادات الفواتير المطبوعة' },
  { value: 'contact', title: 'قنوات التواصل', icon: 'ri-contacts-line', subtitle: 'روابط الاتصال والشبكات' }
];

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
  settings: {
    enable_digital_products: false,
    inventory_valuation_method: 'average',
    auto_update_purchase_price: true,
    activity_log_retention_value: 1,
    activity_log_retention_unit: 'years',
  },
  print_settings: {
    print_format: 'thermal',
    show_logo: true,
    footer_text: 'شكراً لتعاملكم معنا',
  },
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

const handleImageSelect = async image => {
  formData.value.logo = image.url;
  formData.value.images_ids = [image.id];
  await handleSave();
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
  const companyId = userStore.currentUser?.active_company_id;
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
        settings: {
          enable_digital_products: false,
          inventory_valuation_method: 'average',
          auto_update_purchase_price: true,
          activity_log_retention_value: 1,
          activity_log_retention_unit: 'years',
          ...(data.settings || {}),
        },
        print_settings: data.print_settings || {
          print_format: 'thermal',
          show_logo: true,
          footer_text: 'شكراً لتعاملكم معنا',
        },
      };
      originalData.value = JSON.parse(JSON.stringify(formData.value));
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

    // Nest print_settings back into settings
    payload.settings = {
      ...payload.settings,
      print_settings: payload.print_settings,
    };
    delete payload.print_settings;

    await api.update(formData.value.id, payload);
    originalData.value = JSON.parse(JSON.stringify(formData.value));
    toast.success('تم حفظ التغييرات بنجاح');
    
    // وسم خطوة تهيئة بيانات الشركة كمنتهية في نظام التهيئة
    await markAsCompleted('onboarding.setup_company');
    
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

onMounted(async () => {
  await loadCompanyData();
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

/* Tabs styling */
.company-settings-tabs :deep(.v-tab) {
  text-transform: none;
  letter-spacing: normal;
  transition: all 0.3s ease;
  min-height: 48px;
  opacity: 0.8;
}

@media (min-width: 960px) {
  .company-settings-tabs :deep(.v-tab) {
    min-height: 64px;
  }
}

.company-settings-tabs :deep(.v-tab--selected) {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
  color: rgb(var(--v-theme-primary)) !important;
  opacity: 1;
}

.company-settings-tabs :deep(.v-tab__slider) {
  border-radius: 4px;
}

.text-xxs {
  font-size: 0.7rem;
}

/* Mobile Tabs Scrollbar container */
.mobile-tabs-container {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  scrollbar-width: none; /* Hide scrollbar for Firefox */
  -webkit-overflow-scrolling: touch; /* Smooth inertia scrolling for iOS */
  padding: 4px;
}

.mobile-tabs-container::-webkit-scrollbar {
  display: none; /* Hide scrollbar for Chrome, Safari, Opera */
}

/* Tab pill buttons */
.mobile-tab-pill {
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  border-radius: 50px;
  background-color: #fff;
  border: 1px solid rgba(var(--v-border-color), 0.15);
  color: rgba(var(--v-theme-on-surface), 0.7);
  white-space: nowrap;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  outline: none;
  cursor: pointer;
}

.mobile-tab-pill:active {
  transform: scale(0.97);
}

.mobile-tab-pill.active {
  background-color: rgb(var(--v-theme-primary));
  color: #fff !important;
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 4px 12px rgba(var(--v-theme-primary), 0.25);
}

.mobile-tab-pill .v-icon {
  transition: color 0.25s ease;
}

.mobile-tab-pill.active .v-icon {
  color: #fff !important;
}
</style>
