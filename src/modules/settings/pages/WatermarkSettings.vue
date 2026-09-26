<template>
  <div class="watermark-settings-page pb-8">
    <div class="page-header mb-6">
      <div class="d-flex align-center">
        <v-btn icon variant="text" class="mr-2" @click="$router.push({ name: 'settings' })">
          <v-icon>mdi-arrow-right</v-icon>
        </v-btn>
        <div>
          <h1 class="text-h4 font-weight-bold primary--text mb-1">إعدادات العلامة المائية للصور</h1>
          <p class="text-subtitle-1 text-grey-darken-1 mb-0">تخصيص العلامة المائية التي تظهر على صور المنتجات الخاصة بك</p>
        </div>
      </div>
    </div>

    <!-- Alert for SaaS Limit -->
    <v-alert
      v-if="!canCustomize"
      type="warning"
      variant="tonal"
      class="mb-6"
      border="start"
      elevation="2"
      icon="mdi-crown"
    >
      <div class="d-flex align-center justify-space-between">
        <div>
          <h3 class="text-h6 font-weight-bold mb-1">ميزة حصرية للباقات المتقدمة!</h3>
          <p class="mb-0">
            خطتك الحالية لا تدعم تخصيص العلامة المائية الخاصة بك. يتم حالياً تطبيق العلامة المائية الافتراضية للمنصة.
            قم بترقية باقتك للتمتع بإمكانية وضع شعارك الخاص ونصوصك المخصصة على صور منتجاتك.
          </p>
        </div>
        <v-btn color="warning" variant="flat" :to="{ name: 'my-subscription' }" class="font-weight-bold">
          ترقية الباقة الآن
        </v-btn>
      </div>
    </v-alert>

    <v-row>
      <!-- Settings Panel -->
      <v-col cols="12" md="7" lg="8">
        <v-card class="elevation-2 rounded-lg h-100" :disabled="!canCustomize || loading">
          <v-card-title class="pa-4 bg-grey-lighten-4 border-bottom d-flex align-center">
            <v-icon color="primary" class="ml-2">mdi-watermark</v-icon>
            خيارات العلامة المائية
            <v-spacer></v-spacer>
            <v-switch
              v-model="settings.enabled"
              color="primary"
              hide-details
              inset
              label="تفعيل العلامة المائية"
            ></v-switch>
          </v-card-title>

          <v-card-text class="pa-6" :class="{ 'opacity-50': !settings.enabled }">
            <v-row>
              <!-- Target Entities -->
              <v-col cols="12">
                <v-select
                  v-model="settings.apply_to"
                  :items="entityOptions"
                  label="تطبيق العلامة المائية على"
                  multiple
                  chips
                  variant="outlined"
                  hint="اختر الكيانات التي سيتم وضع العلامة المائية على صورها"
                  persistent-hint
                ></v-select>
              </v-col>

              <!-- Type Selection -->
              <v-col cols="12">
                <p class="text-subtitle-1 font-weight-bold mb-3">نوع العلامة المائية</p>
                <v-btn-toggle
                  v-model="settings.type"
                  color="primary"
                  group
                  mandatory
                  class="w-100 d-flex rounded-lg overflow-hidden border"
                >
                  <v-btn value="text" class="flex-grow-1" size="large">
                    <v-icon class="ml-2">mdi-format-text</v-icon> نص فقط
                  </v-btn>
                  <v-btn value="image" class="flex-grow-1" size="large">
                    <v-icon class="ml-2">mdi-image</v-icon> صورة فقط
                  </v-btn>
                  <v-btn value="both" class="flex-grow-1" size="large">
                    <v-icon class="ml-2">mdi-layers</v-icon> صورة ونص معاً
                  </v-btn>
                </v-btn-toggle>
              </v-col>

              <v-divider class="my-4 w-100"></v-divider>

              <!-- Text Settings -->
              <v-col cols="12" md="6" v-if="['text', 'both'].includes(settings.type)">
                <v-text-field
                  v-model="settings.text"
                  label="النص المراد إظهاره"
                  variant="outlined"
                  prepend-inner-icon="mdi-format-title"
                ></v-text-field>

                <div class="d-flex align-center mt-2 mb-4">
                  <span class="ml-4 font-weight-medium">لون النص:</span>
                  <input type="color" v-model="settings.color" class="cursor-pointer" style="width: 50px; height: 35px; border: none; border-radius: 4px;" />
                  <span class="mr-4 text-grey">{{ settings.color }}</span>
                  <v-spacer></v-spacer>
                  <v-switch
                    v-model="settings.stroke"
                    color="primary"
                    hide-details
                    label="إطار أبيض حول النص (Stroke)"
                    density="compact"
                  ></v-switch>
                </div>

                <p class="mb-1 text-body-2 text-grey-darken-1">حجم النص ({{ settings.size }}px)</p>
                <v-slider
                  v-model="settings.size"
                  min="10"
                  max="100"
                  step="1"
                  thumb-label
                  color="primary"
                ></v-slider>
              </v-col>

              <!-- Image Settings -->
              <v-col cols="12" md="6" v-if="['image', 'both'].includes(settings.type)">
                <v-file-input
                  v-model="logoFile"
                  accept="image/png, image/jpeg, image/webp"
                  label="صورة الشعار (Logo)"
                  variant="outlined"
                  prepend-icon=""
                  prepend-inner-icon="mdi-camera"
                  show-size
                  @update:modelValue="onLogoSelected"
                  :hint="settings.image_path ? 'يوجد شعار محفوظ مسبقاً' : ''"
                  persistent-hint
                ></v-file-input>

                <p class="mt-4 mb-1 text-body-2 text-grey-darken-1">حجم الشعار مقارنة بالصورة ({{ settings.scale }}%)</p>
                <v-slider
                  v-model="settings.scale"
                  min="10"
                  max="100"
                  step="1"
                  thumb-label
                  color="primary"
                ></v-slider>
              </v-col>

              <v-divider class="my-4 w-100" v-if="settings.type === 'both'"></v-divider>

              <!-- Position -->
              <v-col cols="12" md="12">
                <p class="text-subtitle-1 font-weight-bold mb-3">موضع العلامة المائية</p>
                <v-item-group v-model="settings.position" mandatory class="d-flex justify-center position-grid">
                  <v-container class="pa-0" style="max-width: 300px;">
                    <v-row no-gutters>
                      <v-col cols="4" class="pa-1">
                        <v-item v-slot="{ isSelected, toggle }" value="top-right">
                          <v-card :color="isSelected ? 'primary' : 'grey-lighten-4'" class="d-flex align-center justify-center cursor-pointer border" height="60" @click="toggle" rounded="lg">
                            <v-icon :color="isSelected ? 'white' : 'grey-darken-1'">mdi-arrow-top-right</v-icon>
                          </v-card>
                        </v-item>
                      </v-col>
                      <v-col cols="4" class="pa-1">
                        <v-item v-slot="{ isSelected, toggle }" value="top-left">
                          <v-card :color="isSelected ? 'primary' : 'grey-lighten-4'" class="d-flex align-center justify-center cursor-pointer border" height="60" @click="toggle" rounded="lg">
                            <v-icon :color="isSelected ? 'white' : 'grey-darken-1'">mdi-arrow-top-left</v-icon>
                          </v-card>
                        </v-item>
                      </v-col>
                      <v-col cols="4" class="pa-1">
                        <v-item v-slot="{ isSelected, toggle }" value="center">
                          <v-card :color="isSelected ? 'primary' : 'grey-lighten-4'" class="d-flex align-center justify-center cursor-pointer border" height="60" @click="toggle" rounded="lg">
                            <v-icon :color="isSelected ? 'white' : 'grey-darken-1'">mdi-target</v-icon>
                          </v-card>
                        </v-item>
                      </v-col>
                      <v-col cols="6" class="pa-1">
                        <v-item v-slot="{ isSelected, toggle }" value="bottom-right">
                          <v-card :color="isSelected ? 'primary' : 'grey-lighten-4'" class="d-flex align-center justify-center cursor-pointer border" height="60" @click="toggle" rounded="lg">
                            <v-icon :color="isSelected ? 'white' : 'grey-darken-1'">mdi-arrow-bottom-right</v-icon>
                          </v-card>
                        </v-item>
                      </v-col>
                      <v-col cols="6" class="pa-1">
                        <v-item v-slot="{ isSelected, toggle }" value="bottom-left">
                          <v-card :color="isSelected ? 'primary' : 'grey-lighten-4'" class="d-flex align-center justify-center cursor-pointer border" height="60" @click="toggle" rounded="lg">
                            <v-icon :color="isSelected ? 'white' : 'grey-darken-1'">mdi-arrow-bottom-left</v-icon>
                          </v-card>
                        </v-item>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-item-group>
              </v-col>
              
              <v-divider class="my-4 w-100"></v-divider>

              <!-- Opacity Settings -->
              <v-col cols="12">
                <p class="mb-1 text-subtitle-1 font-weight-bold">شفافية العلامة المائية ({{ settings.opacity }}%)</p>
                <v-slider
                  v-model="settings.opacity"
                  min="10"
                  max="100"
                  step="1"
                  thumb-label
                  color="primary"
                ></v-slider>
              </v-col>
            </v-row>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions class="pa-4 bg-grey-lighten-5">
            <v-spacer></v-spacer>
            <v-btn
              color="primary"
              variant="flat"
              size="large"
              :loading="saving"
              @click="saveSettings"
              prepend-icon="mdi-content-save"
              class="px-6 font-weight-bold"
            >
              حفظ الإعدادات
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Live Preview Panel -->
      <v-col cols="12" md="5" lg="4">
        <v-card class="elevation-2 rounded-lg h-100 preview-card">
          <v-card-title class="pa-4 bg-grey-lighten-4 border-bottom d-flex align-center">
            <v-icon color="secondary" class="ml-2">mdi-eye-outline</v-icon>
            محاكاة حية (Live Preview)
          </v-card-title>
          
          <v-card-text class="pa-6 d-flex flex-column align-center justify-center">
            <div class="preview-container elevation-4" :class="{ 'is-disabled': !settings.enabled || !canCustomize }">
              <div class="preview-product-placeholder d-flex align-center justify-center">
                <v-icon size="100" color="grey-lighten-1">mdi-image-outline</v-icon>
              </div>
              
              <!-- Dynamic Watermark Overlay -->
              <div class="watermark-overlay" :style="watermarkStyle">
                <img v-if="previewLogoUrl && ['image', 'both'].includes(settings.type)" :src="previewLogoUrl" class="watermark-logo" :style="logoStyle" />
                <span v-if="['text', 'both'].includes(settings.type)" class="watermark-text" :class="{ 'with-stroke': settings.stroke }">
                  {{ settings.text }}
                </span>
              </div>
            </div>
            
            <p class="text-caption text-grey-darken-1 mt-6 text-center">
              هذه الصورة للمحاكاة فقط. حجم العلامة المائية قد يختلف قليلاً في النتيجة النهائية حسب أبعاد الصورة الأصلية.
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

const loading = ref(true);
const saving = ref(false);
const canCustomize = ref(false);

const logoFile = ref(null);
const previewLogoUrl = ref('');

const entityOptions = [
  { title: 'المنتجات', value: 'product' },
  { title: 'متغيرات المنتجات (Variants)', value: 'variant' },
  { title: 'الأقسام (Categories)', value: 'category' },
  { title: 'الماركات (Brands)', value: 'brand' },
  { title: 'ملفات عشوائية (Misc)', value: 'misc' },
];

const settings = ref({
  enabled: true,
  type: 'text',
  text: 'hwnix.com',
  image_path: null,
  position: 'bottom-right',
  opacity: 40,
  size: 24,
  color: '#888888',
  stroke: true,
  scale: 20,
  apply_to: ['product', 'variant'],
});

const loadSettings = async () => {
  loading.value = true;
  try {
    const res = await companyService.getWatermarkSettings();
    const dataObj = Array.isArray(res.data) ? res.data[0] : res.data;
    if (dataObj) {
      canCustomize.value = dataObj.can_customize;
      if (dataObj.settings) {
        settings.value = { ...settings.value, ...dataObj.settings };
        if (settings.value.image_path) {
          previewLogoUrl.value = import.meta.env.VITE_API_URL.replace('/api/v1', '') + '/storage/' + settings.value.image_path;
        }
      }
    }
  } catch (error) {
    console.error('فشل في تحميل الإعدادات', error);
  } finally {
    loading.value = false;
  }
};

const onLogoSelected = (files) => {
  if (!files) return;
  const file = Array.isArray(files) ? files[0] : (files instanceof File ? files : null);
  if (file) {
    previewLogoUrl.value = URL.createObjectURL(file);
  }
};

const saveSettings = async () => {
  saving.value = true;
  try {
    const formData = new FormData();
    Object.keys(settings.value).forEach(key => {
      if (key === 'apply_to' && Array.isArray(settings.value[key])) {
        settings.value[key].forEach((val, i) => formData.append(`apply_to[${i}]`, val));
      } else {
        formData.append(key, settings.value[key] === true ? 1 : (settings.value[key] === false ? 0 : settings.value[key]));
      }
    });

    const file = Array.isArray(logoFile.value) ? logoFile.value[0] : (logoFile.value instanceof File ? logoFile.value : null);
    if (file) {
      formData.append('logo', file);
    }

    const res = await companyService.updateWatermarkSettings(formData);
    
    const dataObj = Array.isArray(res.data) ? res.data[0] : res.data;
    if (dataObj) {
      settings.value = { ...settings.value, ...dataObj };
      const fileObj = Array.isArray(logoFile.value) ? logoFile.value[0] : (logoFile.value instanceof File ? logoFile.value : null);
      if (settings.value.image_path && !fileObj) {
        previewLogoUrl.value = import.meta.env.VITE_API_URL.replace('/api/v1', '') + '/storage/' + settings.value.image_path;
      }
    }
  } catch (error) {
    console.error(error);
  } finally {
    saving.value = false;
  }
};

// Computed styles for Live Preview
const watermarkStyle = computed(() => {
  const pos = settings.value.position;
  let justify = 'center';
  let align = 'center';
  
  if (pos.includes('left')) justify = 'flex-start';
  if (pos.includes('right')) justify = 'flex-end';
  
  if (pos.includes('top')) align = 'flex-start';
  if (pos.includes('bottom')) align = 'flex-end';

  return {
    justifyContent: justify,
    alignItems: align,
    color: settings.value.color,
    fontSize: `${settings.value.size}px`,
    opacity: settings.value.opacity / 100,
  };
});

const logoStyle = computed(() => {
  return {
    width: `${settings.value.scale}%`,
    objectFit: 'contain'
  };
});

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.preview-container {
  position: relative;
  width: 100%;
  max-width: 350px;
  aspect-ratio: 1 / 1;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
}

.preview-container.is-disabled {
  opacity: 0.5;
  filter: grayscale(100%);
}

.preview-product-placeholder {
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
}

.watermark-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 15px;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.watermark-logo {
  max-height: 50%;
  margin-bottom: 5px;
}

.watermark-text {
  font-family: 'Arial', sans-serif;
  font-weight: bold;
  line-height: 1;
}

.watermark-text.with-stroke {
  text-shadow: 
    -2px -2px 0 #fff,  
     2px -2px 0 #fff,
    -2px  2px 0 #fff,
     2px  2px 0 #fff;
}
</style>
