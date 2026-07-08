<template>
  <v-container class="py-8 text-right user-acceptance-history" fluid>
    <div class="mb-8">
      <h1 class="text-h4 font-weight-black mb-2 text-primary d-flex align-center gap-2">
        <v-icon icon="ri-history-line" color="primary" />
        سجل الشروط والموافقات القانونية
      </h1>
      <p class="text-subtitle-1 text-grey-darken-1">
        سجل كامل بالاتفاقيات القانونية والسياسات التي قمت بالموافقة عليها مسبقاً داخل المنصة.
      </p>
    </div>

    <!-- Loader -->
    <div v-if="loading" class="d-flex flex-column align-center justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="64" width="6" class="mb-4" />
      <span class="text-subtitle-1 text-grey-darken-1">جاري تحميل سجل الموافقات...</span>
    </div>

    <!-- Empty State -->
    <v-card v-else-if="history.length === 0" class="pa-12 text-center border rounded-xl bg-white elevation-1">
      <v-avatar color="primary-lighten-5" size="80" class="mb-6">
        <v-icon icon="ri-chat-shield-line" color="primary" size="40" />
      </v-avatar>
      <h2 class="text-h5 font-weight-bold mb-2">لا توجد موافقات مسجلة بعد</h2>
      <p class="text-body-1 text-grey mb-6">
        لم نقم بتسجيل أي موافقة على شروط الاستخدام أو سياسات الخصوصية لحسابك بعد.
      </p>
      <v-btn color="primary" variant="flat" :to="homePath" class="rounded-pill px-8 font-weight-bold">
        الذهاب للرئيسية
      </v-btn>
    </v-card>

    <!-- History Timeline / List -->
    <v-row v-else justify="center">
      <v-col cols="12" lg="10">
        <v-card class="border rounded-xl bg-white elevation-1 pa-6">
          <v-timeline side="end" align="start" truncate-line="both">
            <v-timeline-item
              v-for="item in history"
              :key="item.id"
              dot-color="primary"
              size="small"
              class="mb-6"
            >
              <template v-slot:opposite>
                <span class="text-subtitle-2 text-grey-darken-2 font-weight-black">
                  {{ formatDate(item.accepted_at) }}
                </span>
              </template>

              <v-card variant="outlined" class="pa-4 rounded-lg bg-slate-50 hover-card border-slate-200">
                <div class="d-flex justify-space-between align-start flex-wrap gap-2 mb-2">
                  <div>
                    <h3 class="text-subtitle-1 font-weight-black text-primary mb-1">
                      {{ item.version?.title || 'اتفاقية الشروط' }}
                    </h3>
                    <div class="d-flex align-center gap-2 flex-wrap text-caption text-grey-darken-1">
                      <span class="bg-primary-lighten-5 text-primary px-2 py-0.5 rounded font-weight-bold">
                        إصدار v{{ item.version?.version }}
                      </span>
                      <span class="d-flex align-center gap-1">
                        <v-icon icon="ri-computer-line" size="14" />
                        IP: {{ item.ip_address || 'غير متوفر' }}
                      </span>
                    </div>
                  </div>

                  <v-btn
                    color="primary"
                    variant="outlined"
                    size="small"
                    class="font-weight-bold rounded-pill"
                    prepend-icon="ri-article-line"
                    @click="viewAcceptedTerms(item)"
                  >
                    عرض الشروط المقبولة
                  </v-btn>
                </div>

                <!-- Browser Agent info -->
                <p class="text-caption text-grey text-truncate max-w-500" v-if="item.user_agent">
                  المتصفح: {{ item.user_agent }}
                </p>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>
    </v-row>

    <!-- Modal to View Accepted Terms -->
    <v-dialog v-model="termsDialog" max-width="800px" scrollable>
      <v-card class="rounded-xl pa-2 text-right" v-if="selectedAcceptance">
        <v-card-title class="text-h5 font-weight-black border-b pb-4 mb-4 d-flex justify-space-between align-center">
          <div>
            <span>{{ selectedAcceptance.version?.title }}</span>
            <v-chip color="primary" class="ms-2 font-weight-bold" size="small">v{{ selectedAcceptance.version?.version }}</v-chip>
          </div>
          <v-btn icon="ri-close-line" variant="text" @click="termsDialog = false" />
        </v-card-title>

        <v-card-text style="max-height: 60vh;">
          <div class="mb-6 alert-box bg-slate-50 border rounded-lg pa-4 text-subtitle-2 text-grey-darken-2">
            <div class="d-flex align-center gap-1 mb-2 font-weight-bold text-primary">
              <v-icon icon="ri-checkbox-shield-line" />
              تم إثبات موافقتك على هذا الإصدار
            </div>
            <div>تاريخ القبول: {{ formatDate(selectedAcceptance.accepted_at) }}</div>
            <div>عنوان الـ IP المستخدم: {{ selectedAcceptance.ip_address || 'غير مسجل' }}</div>
          </div>
          
          <!-- Content render -->
          <div class="legal-content-body text-body-1 leading-relaxed text-slate-700" v-html="selectedAcceptance.version?.content"></div>
        </v-card-text>

        <v-card-actions class="border-t pt-4 justify-end">
          <v-btn color="primary" variant="flat" class="px-6 rounded-lg font-weight-bold" @click="termsDialog = false">إغلاق</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getAll } from '@/services/api';
import notificationManager from '@/services/notificationManager';
import { useAuthStore } from '@/stores/auth';
import { useUserStore } from '@/stores/user';
import { formatDateTime } from '@/utils/formatters';

const authStore = useAuthStore();
const userStore = useUserStore();

const homePath = computed(() => {
  if (authStore.isAuthenticated && userStore.isStaff) {
    return '/app/admin/dashboard';
  }
  return '/';
});

const loading = ref(true);
const history = ref([]);
const termsDialog = ref(false);
const selectedAcceptance = ref(null);

const formatDate = (dateString) => {
  if (!dateString) return '';
  return formatDateTime(dateString);
};

const loadHistory = async () => {
  loading.value = true;
  try {
    const res = await getAll('v1/legal/my-acceptances', null, false, false, false);
    if (res && res.status) {
      history.value = res.data;
    }
  } catch (err) {
    console.error('Failed to load history:', err);
    notificationManager.error('حدث خطأ في تحميل سجل الشروط.');
  } finally {
    loading.value = false;
  }
};

const viewAcceptedTerms = (acceptance) => {
  selectedAcceptance.value = acceptance;
  termsDialog.value = true;
};

onMounted(() => {
  loadHistory();
});
</script>

<script>
// تعليق عربي لقواعد الكلاسات: مكون يعرض خطاً زمنياً بجميع شروط الاستخدام والسياسات التي وافق عليها المستخدم سابقاً.
</script>

<style scoped>
.gap-2 { gap: 8px; }
.gap-1 { gap: 4px; }
.max-w-500 { max-width: 500px; }

.hover-card {
  transition: all 0.3s ease;
}
.hover-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.04) !important;
}

.legal-content-body {
  line-height: 2.2;
}
.legal-content-body :deep(p) {
  margin-bottom: 20px;
}
.legal-content-body :deep(h2) {
  font-size: 1.35rem;
  font-weight: 700;
  color: #1a3d8f;
  margin-top: 30px;
  margin-bottom: 15px;
}
.legal-content-body :deep(ul) {
  margin-bottom: 20px;
  padding-right: 20px;
}
</style>
