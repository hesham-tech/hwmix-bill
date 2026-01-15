<template>
  <v-dialog v-model="isVisible" max-width="600px" persistent>
    <v-card border="error md" rounded="xl" class="pa-4">
      <v-card-title class="d-flex align-center text-error">
        <v-icon icon="ri-error-warning-fill" size="32" class="me-3" />
        <span class="text-h5 font-weight-bold">عفواً، حدث خطأ غير متوقع</span>
      </v-card-title>

      <v-card-text class="pt-4">
        <p class="text-body-1 mb-4">
          نعتذر عن هذا الخلل. لقد قام النظام بتسجيل تفاصيل الخطأ التقنية تلقائياً. يمكنك مساعدتنا في حل المشكلة بسرعة عبر إرسال هذا التقرير.
        </p>

        <v-alert variant="tonal" color="error" density="compact" class="mb-4">
          <div class="text-caption font-weight-bold">رسالة الخطأ:</div>
          <div class="text-caption">{{ pendingReport?.message }}</div>
        </v-alert>

        <v-expansion-panels variant="accordion" class="mb-4 shadow-0">
          <v-expansion-panel elevation="0">
            <v-expansion-panel-title class="text-caption font-weight-medium px-0"> عرض التفاصيل التقنية التي سيتم إرسالها </v-expansion-panel-title>
            <v-expansion-panel-text class="technical-details bg-grey-lighten-4 rounded pa-2">
              <div class="detail-row"><strong>المتصفح:</strong> {{ pendingReport?.browser }}</div>
              <div class="detail-row"><strong>النظام:</strong> {{ pendingReport?.os }}</div>
              <div class="detail-row"><strong>الرابط:</strong> {{ pendingReport?.url }}</div>
              <div class="detail-row mt-2"><strong>Stack Trace (Snippet):</strong></div>
              <pre class="stack-text">{{ pendingReport?.stack_trace?.substring(0, 300) }}...</pre>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn color="grey-darken-1" variant="text" @click="close"> إغلاق </v-btn>
        <v-spacer />
        <v-btn color="error" variant="flat" prepend-icon="ri-send-plane-fill" :loading="loading" @click="submitReport"> إرسال تقرير بالخطأ </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useappState } from '@/stores/appState';
import errorReportService from '@/api/services/error-report.service';
import { toast } from 'vue3-toastify';

const appState = useappState();
const loading = ref(false);

const isVisible = computed({
  get: () => !!appState.pendingReport,
  set: val => {
    if (!val) appState.pendingReport = null;
  },
});

const pendingReport = computed(() => appState.pendingReport);

const close = () => {
  appState.pendingReport = null;
};

const submitReport = async () => {
  if (!appState.pendingReport) return;

  loading.value = true;
  try {
    const success = await errorReportService.submit(appState.pendingReport);
    if (success) {
      toast.success('شكرًا لك! تم إرسال التقرير بنجاح وسيعمل الفريق على حله.');
      close();
    }
  } finally {
    loading.value = false;
  }
};
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
</style>
