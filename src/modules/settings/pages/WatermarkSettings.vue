<template>
  <div class="watermark-settings-page pb-8" dir="rtl">

    <!-- Page Header -->
    <div class="d-flex align-center mb-6">
      <v-btn icon variant="text" class="ml-3" @click="$router.push({ name: 'settings' })">
        <v-icon>mdi-arrow-right</v-icon>
      </v-btn>
      <div>
        <h1 class="text-h5 font-weight-bold mb-0">إعدادات العلامة المائية</h1>
        <p class="text-body-2 text-medium-emphasis mb-0">تخصيص العلامة المائية التي تظهر على صور المنتجات</p>
      </div>
    </div>

    <!-- Upgrade Alert -->
    <v-alert
      v-if="!canCustomize"
      type="warning"
      variant="tonal"
      class="mb-6"
      border="start"
      icon="mdi-crown"
    >
      <div class="d-flex align-center justify-space-between flex-wrap gap-3">
        <div>
          <strong>ميزة حصرية للباقات المتقدمة!</strong>
          <p class="mb-0 mt-1 text-body-2">
            خطتك الحالية لا تدعم تخصيص العلامة المائية. قم بالترقية لوضع شعارك الخاص على صور منتجاتك.
          </p>
        </div>
        <v-btn color="warning" variant="flat" :to="{ name: 'my-subscription' }" size="small">
          ترقية الآن
        </v-btn>
      </div>
    </v-alert>

    <v-row>
      <!-- ===== Settings Panel ===== -->
      <v-col cols="12" lg="7">
        <v-card class="rounded-xl" elevation="2" :disabled="!canCustomize || loading">

          <!-- Enable Toggle Header -->
          <v-card-title class="pa-5 d-flex align-center border-b">
            <v-icon color="primary" class="ml-3" size="24">mdi-watermark</v-icon>
            <span class="text-subtitle-1 font-weight-bold">إعدادات العلامة المائية</span>
            <v-spacer />
            <v-switch
              v-model="settings.enabled"
              color="primary"
              hide-details
              inset
              :label="settings.enabled ? 'مفعّلة' : 'معطّلة'"
              density="compact"
            />
          </v-card-title>

          <v-card-text class="pa-5" :class="{ 'opacity-40 pointer-events-none': !settings.enabled }">

            <!-- Section 1: Target -->
            <p class="text-overline text-medium-emphasis mb-2">تطبيق على</p>
            <v-select
              v-model="settings.apply_to"
              :items="entityOptions"
              label="تطبيق العلامة على"
              multiple
              chips
              closable-chips
              variant="outlined"
              density="compact"
              class="mb-5"
              hide-details
            />

            <v-divider class="mb-5" />

            <!-- Section 2: Type -->
            <p class="text-overline text-medium-emphasis mb-2">نوع العلامة المائية</p>
            <v-btn-toggle
              v-model="settings.type"
              color="primary"
              mandatory
              divided
              variant="outlined"
              class="w-100 mb-5 rounded-lg"
            >
              <v-btn value="text" class="flex-grow-1">
                <v-icon size="18" class="ml-2">mdi-format-text</v-icon>
                نص
              </v-btn>
              <v-btn value="image" class="flex-grow-1">
                <v-icon size="18" class="ml-2">mdi-image-outline</v-icon>
                صورة
              </v-btn>
              <v-btn value="both" class="flex-grow-1">
                <v-icon size="18" class="ml-2">mdi-layers-outline</v-icon>
                نص + صورة
              </v-btn>
            </v-btn-toggle>

            <v-divider class="mb-5" />

            <!-- Section 3: Text Settings -->
            <template v-if="['text', 'both'].includes(settings.type)">
              <p class="text-overline text-medium-emphasis mb-3">إعدادات النص</p>
              <v-row>
                <v-col cols="12" sm="8">
                  <v-text-field
                    v-model="settings.text"
                    label="نص العلامة المائية"
                    variant="outlined"
                    density="compact"
                    prepend-inner-icon="mdi-format-title"
                    hide-details
                    class="mb-3"
                  />
                </v-col>
                <v-col cols="12" sm="4">
                  <div class="d-flex align-center gap-2 h-100">
                    <label class="text-body-2 text-medium-emphasis">لون النص:</label>
                    <input
                      type="color"
                      v-model="settings.color"
                      class="color-picker-input cursor-pointer"
                    />
                    <span class="text-caption text-medium-emphasis">{{ settings.color }}</span>
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span class="text-body-2">حجم النص</span>
                    <span class="text-caption text-primary font-weight-bold">{{ settings.size }}px</span>
                  </div>
                  <v-slider v-model="settings.size" min="8" max="120" step="1" thumb-label="always" color="primary" hide-details class="mb-2" />
                </v-col>
                <v-col cols="12">
                  <v-switch
                    v-model="settings.stroke"
                    color="primary"
                    hide-details
                    density="compact"
                    label="إطار أبيض حول النص (Stroke)"
                  />
                </v-col>
              </v-row>
              <v-divider class="mb-5 mt-2" v-if="settings.type === 'both'" />
            </template>

            <!-- Section 4: Image Settings -->
            <template v-if="['image', 'both'].includes(settings.type)">
              <p class="text-overline text-medium-emphasis mb-3">إعدادات الصورة (Logo)</p>
              <v-row>
                <v-col cols="12">
                  <!-- Upload Zone -->
                  <div
                    class="upload-zone rounded-lg d-flex flex-column align-center justify-center cursor-pointer mb-3"
                    :class="{ 'upload-zone--active': isDragOver }"
                    @dragover.prevent="isDragOver = true"
                    @dragleave.prevent="isDragOver = false"
                    @drop.prevent="onDrop"
                    @click="triggerFileInput"
                  >
                    <template v-if="previewLogoUrl">
                      <img :src="previewLogoUrl" class="logo-preview-img rounded" />
                      <p class="text-caption text-medium-emphasis mt-2 mb-0">انقر للتغيير</p>
                    </template>
                    <template v-else>
                      <v-icon size="40" color="primary" class="mb-2">mdi-cloud-upload-outline</v-icon>
                      <p class="text-body-2 font-weight-medium mb-1">اسحب صورة الشعار هنا</p>
                      <p class="text-caption text-medium-emphasis mb-0">أو انقر للاختيار · PNG / JPEG / WEBP</p>
                    </template>
                  </div>

                  <!-- Hidden real input -->
                  <input
                    ref="fileInputRef"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    class="d-none"
                    @change="onFileInputChange"
                  />

                  <!-- Remove logo button -->
                  <v-btn
                    v-if="previewLogoUrl"
                    variant="text"
                    color="error"
                    size="small"
                    prepend-icon="mdi-delete-outline"
                    @click.stop="removeLogo"
                    class="mb-3"
                  >
                    حذف الشعار
                  </v-btn>
                </v-col>

                <v-col cols="12">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span class="text-body-2">حجم الشعار مقارنةً بالصورة</span>
                    <span class="text-caption text-primary font-weight-bold">{{ settings.scale }}%</span>
                  </div>
                  <v-slider v-model="settings.scale" min="5" max="80" step="1" thumb-label="always" color="primary" hide-details />
                </v-col>
              </v-row>

              <v-divider class="mb-5 mt-2" />
            </template>

            <!-- Section 5: Position Grid -->
            <p class="text-overline text-medium-emphasis mb-3">موضع العلامة المائية</p>
            <div class="position-grid-wrapper mb-5">
              <div class="position-grid">
                <button
                  v-for="pos in positions"
                  :key="pos.value"
                  class="position-cell"
                  :class="{ active: settings.position === pos.value }"
                  @click="settings.position = pos.value"
                  type="button"
                  :title="pos.label"
                >
                  <v-icon size="20">{{ pos.icon }}</v-icon>
                  <span class="position-label">{{ pos.label }}</span>
                </button>
              </div>
            </div>

            <!-- Section 6: Opacity -->
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-overline text-medium-emphasis">الشفافية</span>
              <span class="text-caption text-primary font-weight-bold">{{ settings.opacity }}%</span>
            </div>
            <v-slider
              v-model="settings.opacity"
              min="10"
              max="100"
              step="1"
              thumb-label="always"
              color="primary"
              hide-details
            />

          </v-card-text>

          <!-- Save Button -->
          <v-divider />
          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              color="primary"
              variant="flat"
              size="large"
              :loading="saving"
              @click="saveSettings"
              prepend-icon="mdi-content-save-outline"
              class="px-8 rounded-lg font-weight-bold"
            >
              حفظ الإعدادات
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- ===== Live Preview Panel ===== -->
      <v-col cols="12" lg="5">
        <v-card class="rounded-xl sticky-preview" elevation="2">
          <v-card-title class="pa-5 d-flex align-center border-b">
            <v-icon color="secondary" class="ml-3" size="24">mdi-eye-outline</v-icon>
            <span class="text-subtitle-1 font-weight-bold">معاينة حية</span>
          </v-card-title>

          <v-card-text class="pa-6 d-flex flex-column align-center">
            <!-- Preview Box -->
            <div class="preview-box rounded-xl elevation-3" :class="{ 'is-disabled': !settings.enabled || !canCustomize }">
              <!-- Background Product Placeholder -->
              <div class="preview-bg d-flex flex-column align-center justify-center">
                <v-icon size="80" color="grey-lighten-2">mdi-image-outline</v-icon>
                <span class="text-caption text-grey-lighten-1 mt-2">صورة المنتج</span>
              </div>

              <!-- Watermark Layer -->
              <div class="watermark-layer" :style="watermarkContainerStyle">
                <div class="watermark-content" :style="watermarkContentStyle">
                  <img
                    v-if="previewLogoUrl && ['image', 'both'].includes(settings.type)"
                    :src="previewLogoUrl"
                    class="wm-image"
                    :style="logoStyle"
                  />
                  <span
                    v-if="['text', 'both'].includes(settings.type) && settings.text"
                    class="wm-text"
                    :class="{ 'wm-stroke': settings.stroke }"
                    :style="textStyle"
                  >{{ settings.text }}</span>
                </div>
              </div>
            </div>

            <p class="text-caption text-medium-emphasis text-center mt-4 mb-0" style="max-width:300px;">
              المعاينة تقريبية. قد تختلف النتيجة الفعلية طفيفاً حسب أبعاد الصورة الأصلية.
            </p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import companyService from '@/api/services/company.service';

// ─── State ────────────────────────────────────────────────────────────────────
const loading    = ref(true);
const saving     = ref(false);
const canCustomize = ref(false);
const isDragOver = ref(false);
const logoFile   = ref(null);         // actual File object
const previewLogoUrl = ref('');       // object URL or server URL
const fileInputRef   = ref(null);

// ─── Options ──────────────────────────────────────────────────────────────────
const entityOptions = [
  { title: 'المنتجات',                    value: 'product'  },
  { title: 'متغيرات المنتجات (Variants)', value: 'variant'  },
  { title: 'الأقسام (Categories)',        value: 'category' },
  { title: 'الماركات (Brands)',           value: 'brand'    },
  { title: 'ملفات عشوائية (Misc)',        value: 'misc'     },
];

const positions = [
  { value: 'top-right',    icon: 'mdi-arrow-top-right',    label: 'أعلى يمين'   },
  { value: 'top-center',   icon: 'mdi-arrow-up',           label: 'أعلى وسط'    },
  { value: 'top-left',     icon: 'mdi-arrow-top-left',     label: 'أعلى يسار'   },
  { value: 'center-right', icon: 'mdi-arrow-right',        label: 'وسط يمين'    },
  { value: 'center',       icon: 'mdi-circle-small',       label: 'وسط'         },
  { value: 'center-left',  icon: 'mdi-arrow-left',         label: 'وسط يسار'    },
  { value: 'bottom-right', icon: 'mdi-arrow-bottom-right', label: 'أسفل يمين'   },
  { value: 'bottom-center',icon: 'mdi-arrow-down',         label: 'أسفل وسط'    },
  { value: 'bottom-left',  icon: 'mdi-arrow-bottom-left',  label: 'أسفل يسار'   },
];

// ─── Settings ─────────────────────────────────────────────────────────────────
const settings = ref({
  enabled:   true,
  type:      'text',
  text:      'hwnix.com',
  image_path: null,
  position:  'bottom-right',
  opacity:   40,
  size:      24,
  color:     '#888888',
  stroke:    true,
  scale:     20,
  apply_to:  ['product', 'variant'],
});

// ─── Load ─────────────────────────────────────────────────────────────────────
const loadSettings = async () => {
  loading.value = true;
  try {
    const res = await companyService.getWatermarkSettings();
    const dataObj = Array.isArray(res.data) ? res.data[0] : res.data;
    if (dataObj) {
      canCustomize.value = dataObj.can_customize ?? false;
      if (dataObj.settings) {
        settings.value = { ...settings.value, ...dataObj.settings };
        if (settings.value.image_path) {
          previewLogoUrl.value =
            import.meta.env.VITE_API_URL.replace('/api/v1', '') +
            '/storage/' + settings.value.image_path;
        }
      }
    }
  } catch (error) {
    console.error('فشل في تحميل الإعدادات', error);
  } finally {
    loading.value = false;
  }
};

// ─── File Handling ────────────────────────────────────────────────────────────
const applyFile = (file) => {
  if (!file || !(file instanceof File)) return;
  logoFile.value   = file;
  previewLogoUrl.value = URL.createObjectURL(file);
};

const triggerFileInput = () => fileInputRef.value?.click();

const onFileInputChange = (event) => {
  const file = event.target.files?.[0];
  applyFile(file);
};

const onDrop = (event) => {
  isDragOver.value = false;
  const file = event.dataTransfer?.files?.[0];
  applyFile(file);
};

const removeLogo = () => {
  logoFile.value = null;
  previewLogoUrl.value = '';
  settings.value.image_path = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
};

// ─── Save ─────────────────────────────────────────────────────────────────────
const saveSettings = async () => {
  saving.value = true;
  try {
    const formData = new FormData();
    Object.keys(settings.value).forEach(key => {
      if (key === 'apply_to' && Array.isArray(settings.value[key])) {
        settings.value[key].forEach((val, i) => formData.append(`apply_to[${i}]`, val));
      } else if (settings.value[key] !== null && settings.value[key] !== undefined) {
        formData.append(key, settings.value[key] === true ? 1 : (settings.value[key] === false ? 0 : settings.value[key]));
      }
    });

    if (logoFile.value instanceof File) {
      formData.append('logo', logoFile.value);
    }

    const res = await companyService.updateWatermarkSettings(formData);
    const dataObj = Array.isArray(res.data) ? res.data[0] : res.data;
    if (dataObj?.settings) {
      settings.value = { ...settings.value, ...dataObj.settings };
      // If server stored an image path and we didn't upload a new one:
      if (settings.value.image_path && !logoFile.value) {
        previewLogoUrl.value =
          import.meta.env.VITE_API_URL.replace('/api/v1', '') +
          '/storage/' + settings.value.image_path;
      }
    }
  } catch (error) {
    console.error('فشل حفظ الإعدادات', error);
  } finally {
    saving.value = false;
  }
};

// ─── Computed Styles for Preview ──────────────────────────────────────────────
const positionMap = {
  'top-right':     { justify: 'flex-end',    align: 'flex-start' },
  'top-center':    { justify: 'center',      align: 'flex-start' },
  'top-left':      { justify: 'flex-start',  align: 'flex-start' },
  'center-right':  { justify: 'flex-end',    align: 'center'     },
  'center':        { justify: 'center',      align: 'center'     },
  'center-left':   { justify: 'flex-start',  align: 'center'     },
  'bottom-right':  { justify: 'flex-end',    align: 'flex-end'   },
  'bottom-center': { justify: 'center',      align: 'flex-end'   },
  'bottom-left':   { justify: 'flex-start',  align: 'flex-end'   },
};

const watermarkContainerStyle = computed(() => {
  const map = positionMap[settings.value.position] ?? positionMap['bottom-right'];
  return {
    display: 'flex',
    justifyContent: map.justify,
    alignItems: map.align,
  };
});

const watermarkContentStyle = computed(() => ({
  opacity: settings.value.opacity / 100,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
}));

const textStyle = computed(() => ({
  color:      settings.value.color,
  fontSize:   `${settings.value.size * 0.4}px`,
  fontWeight: 'bold',
  fontFamily: 'Arial, sans-serif',
  lineHeight: 1,
}));

const logoStyle = computed(() => ({
  width:      `${settings.value.scale}%`,
  maxWidth:   '120px',
  objectFit:  'contain',
}));

// ─── Init ─────────────────────────────────────────────────────────────────────
onMounted(loadSettings);
</script>

<style scoped>
/* Position Grid */
.position-grid-wrapper {
  display: flex;
  justify-content: center;
}

.position-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  width: 100%;
  max-width: 320px;
}

.position-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 4px;
  border: 1.5px solid #e0e0e0;
  border-radius: 10px;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.15s ease;
  color: #9e9e9e;
  font-size: 0;
}

.position-cell:hover {
  border-color: #1976d2;
  color: #1976d2;
  background: #e3f2fd;
}

.position-cell.active {
  border-color: #1976d2;
  background: #1976d2;
  color: #fff;
  box-shadow: 0 2px 8px rgba(25, 118, 210, 0.35);
}

.position-label {
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0;
  white-space: nowrap;
  font-family: 'Tajawal', sans-serif;
}

/* Upload Zone */
.upload-zone {
  border: 2px dashed #bdbdbd;
  padding: 28px 16px;
  text-align: center;
  background: #fafafa;
  transition: border-color 0.2s, background 0.2s;
  min-height: 140px;
}

.upload-zone:hover,
.upload-zone--active {
  border-color: #1976d2;
  background: #e3f2fd;
}

.logo-preview-img {
  max-height: 90px;
  max-width: 80%;
  object-fit: contain;
}

/* Color picker */
.color-picker-input {
  width: 40px;
  height: 32px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

/* Preview Box */
.preview-box {
  position: relative;
  width: 100%;
  max-width: 320px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
  background: #f5f5f5;
  border: 1px solid #e0e0e0;
}

.preview-box.is-disabled {
  opacity: 0.4;
  filter: grayscale(1);
}

.preview-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f5f5f5 0%, #eeeeee 100%);
}

.watermark-layer {
  position: absolute;
  inset: 0;
  padding: 12px;
  pointer-events: none;
}

.watermark-content {
  /* flex/opacity set via inline style */
}

/* Watermark text stroke */
.wm-stroke {
  text-shadow:
    -1px -1px 0 #fff,
     1px -1px 0 #fff,
    -1px  1px 0 #fff,
     1px  1px 0 #fff;
}

/* Sticky preview on large screens */
@media (min-width: 1280px) {
  .sticky-preview {
    position: sticky;
    top: 80px;
  }
}

/* Pointer events helper */
.pointer-events-none {
  pointer-events: none;
}
</style>
