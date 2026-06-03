<template>
  <div class="public-legal-layout min-h-screen">
    <!-- Background Blur Decorative Blobs -->
    <div class="blob blob-1"></div>
    <div class="blob blob-2"></div>

    <v-container class="py-12 position-relative" style="z-index: 10;">
      <!-- Header / Brand logo -->
      <div class="d-flex align-center justify-center gap-2 mb-8 no-print">
        <router-link :to="homePath" class="d-flex align-center gap-2 text-decoration-none">
          <div class="store-logo" :style="logoUrl ? 'background: transparent; box-shadow: none;' : ''">
            <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="logo-img-store" />
            <span v-else class="logo-h-store">{{ companyName.charAt(0) }}</span>
          </div>
          <span class="store-brand-name font-weight-black text-h5">{{ companyName }}</span>
        </router-link>
      </div>

      <!-- Main Content Card -->
      <v-row justify="center">
        <v-col cols="12" md="10" lg="8">
          <v-card class="glass-card pa-8 pa-sm-12 rounded-xl border elevation-12">
            
            <!-- Loading State -->
            <div v-if="loading" class="d-flex flex-column align-center justify-center py-16">
              <v-progress-circular indeterminate color="primary" size="64" width="6" class="mb-4" />
              <span class="text-subtitle-1 text-grey-darken-1 font-weight-bold">جاري تحميل المستند القانوني...</span>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="d-flex flex-column align-center justify-center text-center py-12">
              <v-avatar color="error-lighten-5" size="80" class="mb-6">
                <v-icon icon="ri-error-warning-line" color="error" size="48" />
              </v-avatar>
              <h2 class="text-h5 font-weight-bold mb-3 text-red-darken-2">لم نتمكن من العثور على الصفحة</h2>
              <p class="text-body-1 text-grey mb-8 max-w-500">
                المستند القانوني المطلوب غير منشور حالياً أو ربما تم تغييره.
              </p>
              <v-btn color="primary" variant="elevated" prepend-icon="ri-home-4-line" :to="homePath" class="rounded-pill px-8">
                العودة للرئيسية
              </v-btn>
            </div>

            <!-- Content State -->
            <div v-else>
              <!-- Back button / Print button row -->
              <div class="d-flex justify-space-between align-center mb-8 no-print">
                <v-btn variant="text" color="primary" prepend-icon="ri-arrow-right-line" class="font-weight-bold" @click="$router.go(-1)">
                  رجوع
                </v-btn>
                <div class="d-flex gap-2">
                  <v-btn variant="outlined" color="primary" prepend-icon="ri-printer-line" class="rounded-pill px-6 font-weight-bold" @click="printDocument">
                    طباعة المستند
                  </v-btn>
                </div>
              </div>

              <!-- Meta / Document Header -->
              <div class="border-b pb-6 mb-8 text-right">
                <h1 class="text-h3 font-weight-black mb-4 gradient-text">{{ documentVersion.title }}</h1>
                <div class="d-flex flex-wrap gap-x-6 gap-y-2 text-subtitle-2 text-grey-darken-1">
                  <div class="d-flex align-center gap-1">
                    <v-icon icon="ri-git-commit-line" size="16" />
                    <span>رقم الإصدار: {{ documentVersion.version }}</span>
                  </div>
                  <div class="d-flex align-center gap-1">
                    <v-icon icon="ri-time-line" size="16" />
                    <span>تاريخ النشر: {{ formatDate(documentVersion.published_at) }}</span>
                  </div>
                </div>
              </div>

              <!-- Main Content Body -->
              <div class="legal-content text-right text-body-1 leading-relaxed" v-html="documentVersion.content"></div>
              
              <!-- Footer Agreement Checkbox for unregistered/guest users -->
              <div class="border-t pt-8 mt-12 text-center no-print">
                <p class="text-subtitle-2 text-grey mb-4">
                  تصفحك للموقع أو استخدامك للمنصة يعتبر موافقة تلقائية على هذا المستند والشروط المنصوص عليها فيه.
                </p>
                <v-btn color="primary" variant="flat" :to="homePath" class="rounded-pill px-8 font-weight-bold">
                  أوافق والعودة للموقع
                </v-btn>
              </div>
            </div>

          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import apiClient from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { useBranding } from '@/composables/useBranding';

const route = useRoute();
const authStore = useAuthStore();
const userStore = useUserStore();

const { logoUrl, companyName, fetchBranding } = useBranding();

const homePath = computed(() => {
  if (route.query.from === 'saas') {
    return '/saas';
  }
  if (authStore.isAuthenticated && userStore.isStaff) {
    return '/app/admin/dashboard';
  }
  return '/';
});

const loading = ref(true);
const error = ref(false);
const documentVersion = ref(null);

const documentTitles = {
  'privacy-policy': 'سياسة الخصوصية',
  'terms-of-use': 'شروط الاستخدام',
  'refund-policy': 'سياسة الاسترداد',
  'cookie-policy': 'سياسة ملفات الارتباط'
};

const fetchLegalDocument = async (key) => {
  loading.value = true;
  error.value = false;
  try {
    const url = `v1/legal/documents/${key}/active`;
    const response = await apiClient.get(url);
    if (response.data && response.data.status) {
      documentVersion.value = response.data.data;
    } else {
      error.value = true;
    }
  } catch (err) {
    console.error('Failed to load legal document:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'غير محدد';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const printDocument = () => {
  window.print();
};

onMounted(() => {
  fetchBranding();
  fetchLegalDocument(route.params.key);
});

watch(() => route.params.key, (newKey) => {
  if (newKey) {
    fetchLegalDocument(newKey);
  }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

.public-legal-layout {
  font-family: 'Cairo', sans-serif;
  background-color: #f8fafc;
  position: relative;
  overflow: hidden;
  direction: rtl;
}

/* Background blur blobs */
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.12;
  z-index: 1;
}
.blob-1 {
  top: -100px;
  right: -100px;
  width: 400px;
  height: 400px;
  background-color: #1a3d8f;
}
.blob-2 {
  bottom: -150px;
  left: -150px;
  width: 500px;
  height: 500px;
  background-color: #6a5ae0;
}

/* Store logo & branding matching landing page */
.store-logo {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #1a3d8f, #6a5ae0);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(26, 61, 143, 0.3);
}
.logo-img-store {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.logo-h-store {
  color: #fff;
  font-size: 1.3rem;
  font-weight: 900;
  line-height: 1;
}
.store-brand-name {
  background: linear-gradient(135deg, #1a3d8f, #6a5ae0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Glassmorphic card design */
.glass-card {
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
  border-color: rgba(26, 61, 143, 0.08) !important;
}

.gradient-text {
  background: linear-gradient(135deg, #1a3d8f, #6a5ae0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.max-w-500 {
  max-width: 500px;
}

.gap-x-6 {
  column-gap: 24px;
}
.gap-y-2 {
  row-gap: 8px;
}

/* Text & list stylings inside legal document content */
.legal-content {
  line-height: 2.2;
  color: #334155;
}

.legal-content :deep(p) {
  margin-bottom: 24px;
}

.legal-content :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a3d8f;
  margin-top: 40px;
  margin-bottom: 20px;
}

.legal-content :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #6a5ae0;
  margin-top: 30px;
  margin-bottom: 15px;
}

.legal-content :deep(ul), .legal-content :deep(ol) {
  margin-bottom: 24px;
  padding-right: 24px;
}

.legal-content :deep(li) {
  margin-bottom: 8px;
}

/* Print specific styles */
@media print {
  .no-print {
    display: none !important;
  }
  .public-legal-layout {
    background: white !important;
    padding: 0 !important;
  }
  .glass-card {
    border: none !important;
    box-shadow: none !important;
    background: transparent !important;
    padding: 0 !important;
  }
  .blob {
    display: none !important;
  }
}
</style>
