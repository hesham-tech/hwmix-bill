<template>
  <v-dialog v-model="isVisible" max-width="600px" persistent scrollable>
    <v-card :border="(isManualReport ? 'primary' : isConnectivityError ? 'warning' : 'error') + ' md'" rounded="xl" class="pa-4">
      <v-card-title class="d-flex align-center" :class="titleColor">
        <v-icon :icon="titleIcon" size="32" class="me-3" />
        <span class="text-h5 font-weight-bold">
          {{ titleText }}
        </span>
      </v-card-title>

      <v-card-text class="pt-4">
        <p class="text-body-1 mb-4">
          {{ descriptionText }}
        </p>

        <!-- Selector for Manual Report Type -->
        <v-btn-toggle v-if="isManualReport" v-model="reportType" mandatory color="primary" variant="tonal" class="mb-4 d-flex w-100">
          <v-btn value="feedback" prepend-icon="ri-error-warning-line" class="flex-grow-1"> بلاغ عن مشكلة </v-btn>
          <v-btn value="suggestion" prepend-icon="ri-lightbulb-line" class="flex-grow-1"> اقتراح جديد </v-btn>
        </v-btn-toggle>

        <v-alert
          v-if="pendingReport?.message && !isManualReport"
          variant="tonal"
          :color="isConnectivityError ? 'warning' : 'error'"
          density="compact"
          class="mb-4"
        >
          <div class="text-caption font-weight-bold">رسالة الخطأ:</div>
          <div class="text-caption">{{ pendingReport?.message }}</div>
        </v-alert>

        <v-textarea
          v-model="userNotes"
          :label="isManualReport ? 'تفاصيل البلاغ / الاقتراح *' : 'ملاحظات إضافية (اختياري)'"
          :placeholder="isManualReport ? 'يرجى كتابة تفاصيل ما تواجهه...' : 'ماذا كنت تفعل عند حدوث الخطأ؟'"
          variant="outlined"
          density="comfortable"
          rows="3"
          class="mb-4"
          hide-details
        />

        <!-- Screenshot Upload -->
        <v-file-input
          v-model="screenshot"
          label="إرفاق صورة (اختياري)"
          prepend-icon="ri-image-add-line"
          variant="outlined"
          density="compact"
          accept="image/*"
          class="mb-4"
          hide-details
          show-size
        >
          <template #selection="{ fileNames }">
            <template v-for="fileName in fileNames" :key="fileName">
              <v-chip size="small" label color="primary" class="me-2">
                {{ fileName }}
              </v-chip>
            </template>
          </template>
        </v-file-input>

        <!-- Screenshot Preview -->
        <v-expand-transition>
          <div v-if="screenshotUrl" class="mb-4">
            <div class="text-caption mb-1 d-flex justify-space-between align-center">
              <span>معاينة الصورة المرفقة:</span>
              <v-btn icon="ri-close-line" size="x-small" variant="text" color="error" @click="screenshot = null" />
            </div>
            <v-img
              :src="screenshotUrl"
              max-height="200"
              rounded="lg"
              class="bg-grey-lighten-3 border cursor-pointer screenshot-preview-img"
              @click="toggleFullPreview = true"
            />
          </div>
        </v-expand-transition>

        <!-- Full Size Preview Dialog -->
        <v-dialog v-model="toggleFullPreview" max-width="90%">
          <v-card class="pa-2 overflow-hidden position-relative" rounded="xl">
            <v-btn
              icon="ri-close-line"
              size="small"
              variant="elevated"
              color="white"
              class="position-absolute shadow-lg"
              style="top: 10px; right: 10px; z-index: 10"
              @click="toggleFullPreview = false"
            />
            <v-img :src="screenshotUrl" width="100%" height="auto" class="rounded" />
            <v-card-actions class="justify-center">
              <v-btn color="primary" variant="text" @click="toggleFullPreview = false"> إغلاق </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <v-expansion-panels variant="accordion" class="mb-4 shadow-0">
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-caption font-weight-medium px-2"> عرض التفاصيل التقنية التي سيتم إرسالها </v-expansion-panel-title>
            <v-expansion-panel-text class="technical-details bg-grey-lighten-4 rounded pa-3">
              <div class="detail-row"><strong>المتصفح:</strong> {{ pendingReport?.browser }}</div>
              <div class="detail-row"><strong>النظام:</strong> {{ pendingReport?.os }}</div>
              <div class="detail-row"><strong>الرابط:</strong> {{ pendingReport?.url }}</div>
              <div class="detail-row"><strong>المنطقة الزمنية:</strong> {{ pendingReport?.payload?.timezone }}</div>
              <div v-if="pendingReport?.payload?.request" class="detail-row">
                <strong>الطلب:</strong> {{ pendingReport?.payload?.request?.method }} {{ pendingReport?.payload?.request?.url }}
              </div>
              <div v-if="pendingReport?.stack_trace" class="detail-row mt-2"><strong>Stack Trace (Snippet):</strong></div>
              <pre v-if="pendingReport?.stack_trace" class="stack-text">{{ pendingReport?.stack_trace?.substring(0, 300) }}...</pre>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 bg-white border-top sticky-bottom">
        <v-btn color="grey-darken-1" variant="text" @click="close"> إغلاق </v-btn>
        <v-spacer />
        <v-btn v-if="isConnectivityError" color="primary" variant="tonal" prepend-icon="ri-refresh-line" @click="reloadPage"> إعادة تحميل </v-btn>
        <v-btn
          v-else
          :color="isManualReport ? 'primary' : 'error'"
          variant="flat"
          :loading="loading"
          :disabled="isManualReport && !userNotes"
          @click="submitReport"
        >
          {{ isManualReport ? 'إرسال' : 'إرسال التقرير' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useappState } from '@/stores/appState';
import errorReportService from '@/api/services/error-report.service';
import { toast } from 'vue3-toastify';

const appState = useappState();
const loading = ref(false);
const userNotes = ref('');
const screenshot = ref(null);
const screenshotUrl = ref(null);
const toggleFullPreview = ref(false);
const reportType = ref('feedback');

const isVisible = computed({
  get: () => !!appState.pendingReport,
  set: val => {
    if (!val) {
      close();
    }
  },
});

const pendingReport = computed(() => appState.pendingReport);

const isConnectivityError = computed(() => !!pendingReport.value?.isConnectivityError);
const isManualReport = computed(() => pendingReport.value?.type === 'feedback' || pendingReport.value?.type === 'suggestion');

// Dynamic UI Content
const titleText = computed(() => {
  if (isManualReport.value) return 'إبلاغ عن مشكلة أو اقتراح';
  if (isConnectivityError.value) return 'تعذر الاتصال بالسيرفر';
  return 'عفواً، حدث خطأ غير متوقع';
});

const titleIcon = computed(() => {
  if (isManualReport.value) return 'ri-customer-service-2-fill';
  if (isConnectivityError.value) return 'ri-wifi-off-line';
  return 'ri-error-warning-fill';
});

const titleColor = computed(() => {
  if (isManualReport.value) return 'text-primary';
  if (isConnectivityError.value) return 'text-warning';
  return 'text-error';
});

const descriptionText = computed(() => {
  if (isManualReport.value) return 'يسعدنا سماع رأيك أو الإبلاغ عن أي مشكلة تواجهك لمساعدتنا في تحسين التجربة.';
  if (isConnectivityError.value) return 'يبدو أن هناك مشكلة في الاتصال بالإنترنت أو أن خادم النظام غير متاح حالياً.';
  return 'نعتذر عن هذا الخلل. لقد قام النظام بتسجيل التفاصيل تلقائياً، يمكنك مساعدتنا عبر إرسال هذا التقرير.';
});

const close = () => {
  appState.pendingReport = null;
  userNotes.value = '';
  screenshot.value = null;
  reportType.value = 'feedback';
};

const reloadPage = () => {
  window.location.reload();
};

const submitReport = async () => {
  if (!appState.pendingReport) return;

  loading.value = true;
  try {
    const payload = {
      ...appState.pendingReport,
      user_notes: userNotes.value,
      type: isManualReport.value ? reportType.value : appState.pendingReport.type,
    };

    // Use FormData to support file upload
    const formData = new FormData();
    Object.keys(payload).forEach(key => {
      if (key === 'payload') {
        formData.append(key, JSON.stringify(payload[key]));
      } else if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key]);
      }
    });

    if (screenshot.value) {
      formData.append('screenshot', Array.isArray(screenshot.value) ? screenshot.value[0] : screenshot.value);
    }

    const success = await errorReportService.create(formData, { showToast: true, useFormData: true });

    if (success) {
      toast.success(isManualReport.value ? 'نشكرك على تواصلك! تم استلام بلاغك بنجاح.' : 'شكرًا لك! تم إرسال التقرير بنجاح.');
      close();
    }
  } catch (error) {
    console.error('Submit report error:', error);
  } finally {
    loading.value = false;
  }
};

// Update internal type if store changes it
watch(
  () => pendingReport.value,
  newReport => {
    if (newReport?.type === 'feedback' || newReport?.type === 'suggestion') {
      reportType.value = newReport.type;
    }
    // Auto-bind captured screenshot if available
    if (newReport?.autoScreenshot) {
      screenshot.value = newReport.autoScreenshot;
    }
  },
  { immediate: true }
);

// Manage screenshot preview URL
watch(screenshot, newFile => {
  if (screenshotUrl.value) {
    URL.revokeObjectURL(screenshotUrl.value);
    screenshotUrl.value = null;
  }

  if (newFile) {
    const file = Array.isArray(newFile) ? newFile[0] : newFile;
    if (file instanceof File || file instanceof Blob) {
      screenshotUrl.value = URL.createObjectURL(file);
    }
  }
});
</script>

<style scoped>
.technical-details {
  font-size: 0.75rem;
  max-height: 200px;
  overflow-y: auto;
}
.detail-row {
  margin-bottom: 4px;
}
.stack-text {
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  opacity: 0.7;
  font-size: 0.7rem;
}
.screenshot-preview-img {
  transition: transform 0.2s ease;
}
.screenshot-preview-img:hover {
  transform: scale(1.02);
  filter: brightness(0.95);
}

.sticky-bottom {
  position: sticky !important;
  bottom: 0;
  z-index: 10;
}
</style>
