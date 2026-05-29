<template>
  <v-dialog v-model="isOpen" max-width="800" persistent scrollable>
    <v-card class="rounded-xl overflow-hidden">
      <!-- Header -->
      <v-toolbar color="primary" density="comfortable" flat>
        <v-icon icon="ri-upload-cloud-2-line" class="ms-4 me-2" />
        <v-toolbar-title class="text-h6 font-weight-bold">استيراد المنتجات من ملف CSV</v-toolbar-title>
        <v-spacer />
        <v-btn icon="ri-close-line" :disabled="importing" @click="close" />
      </v-toolbar>

      <v-card-text class="pa-6 custom-scrollbar">
        <!-- Step 1: Upload File & Instructions -->
        <div v-if="step === 'upload'">
          <div class="mb-6 bg-blue-lighten-5 border rounded-xl pa-4 text-body-2 text-blue-darken-3 d-flex align-start">
            <v-icon icon="ri-information-line" class="me-3 mt-1" size="24" />
            <div>
              <div class="font-weight-bold mb-1">تعليمات الاستيراد:</div>
              <ul>
                <li>يجب أن يكون الملف بامتداد CSV (ترميز UTF-8).</li>
                <li>يجب أن يحتوي الملف على الأعمدة بالترتيب التالي: (الرقم، اسم المنتج، الوصف، نشط).</li>
                <li>اسم المنتج هو حقل إلزامي لكل سطر.</li>
              </ul>
              <v-btn variant="text" size="small" prepend-icon="ri-download-line" color="primary" class="mt-2 font-weight-bold" @click="downloadSampleCSV">
                تحميل ملف CSV تجريبي نموذج
              </v-btn>
            </div>
          </div>

          <!-- Dropzone -->
          <div
            class="import-dropzone border-2 border-dashed rounded-xl pa-8 text-center cursor-pointer"
            :class="{ 'border-primary bg-grey-lighten-4': dragActive }"
            @dragover.prevent="dragActive = true"
            @dragleave.prevent="dragActive = false"
            @drop.prevent="handleDrop"
            @click="$refs.fileInput.click()"
          >
            <input ref="fileInput" type="file" accept=".csv" class="d-none" @change="handleFileSelected" />
            <v-icon icon="ri-file-excel-2-line" size="64" color="primary" class="mb-4 opacity-75" />
            <h3 class="text-h6 font-weight-bold mb-2">اسحب وأفلت ملف الـ CSV هنا</h3>
            <p class="text-caption text-grey mb-4">أو انقر لتصفح واختيار الملف من جهازك (بحد أقصى 10 ميجا)</p>
            <v-chip v-if="selectedFile" color="primary" label class="font-weight-bold">
              <v-icon start icon="ri-file-line" />
              {{ selectedFile.name }} ({{ (selectedFile.size / 1024).toFixed(1) }} KB)
            </v-chip>
          </div>
        </div>

        <!-- Step 2: Processing / Progress -->
        <div v-else-if="step === 'progress'" class="text-center py-10">
          <v-progress-circular
            :model-value="progress"
            :rotate="360"
            :size="120"
            :width="12"
            color="primary"
            class="mb-6"
          >
            <span class="text-h6 font-weight-bold">{{ progress }}%</span>
          </v-progress-circular>

          <h3 class="text-h6 font-weight-bold mb-2">{{ statusText }}</h3>
          <p class="text-body-2 text-grey">يرجى الانتظار وعدم إغلاق الصفحة حتى تنتهي المعالجة بالخلفية...</p>
        </div>

        <!-- Step 3: Result Summary -->
        <div v-else-if="step === 'result'">
          <div class="text-center mb-6">
            <v-icon
              :icon="resultStats.failed_count === 0 ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill'"
              :color="resultStats.failed_count === 0 ? 'success' : 'warning'"
              size="64"
              class="mb-2"
            />
            <h3 class="text-h5 font-weight-bold">اكتملت عملية الاستيراد</h3>
            <p class="text-subtitle-2 text-grey">تمت معالجة الملف بنجاح، إليك ملخص العملية:</p>
          </div>

          <!-- Stats Cards -->
          <v-row class="mb-6 text-center">
            <v-col cols="6">
              <div class="border rounded-xl pa-4 bg-success-lighten-5 border-success">
                <div class="text-h4 font-weight-bold text-success">{{ resultStats.success_count }}</div>
                <div class="text-caption text-success font-weight-bold">أسطر تم استيرادها بنجاح</div>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="border rounded-xl pa-4 bg-error-lighten-5 border-error">
                <div class="text-h4 font-weight-bold text-error">{{ resultStats.failed_count }}</div>
                <div class="text-caption text-error font-weight-bold">أسطر فشل استيرادها</div>
              </div>
            </v-col>
          </v-row>

          <!-- Failed Details Table -->
          <div v-if="resultStats.failed_details && resultStats.failed_details.length > 0">
            <h4 class="text-subtitle-1 font-weight-bold mb-3 text-error">تفاصيل الأسطر الفاشلة وأسباب الأخطاء:</h4>
            <v-table class="border rounded-xl overflow-hidden" density="comfortable">
              <thead>
                <tr class="bg-grey-lighten-4">
                  <th class="font-weight-bold text-caption">رقم السطر</th>
                  <th class="font-weight-bold text-caption">محتوى السطر</th>
                  <th class="font-weight-bold text-caption text-error">سبب الفشل</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="errRow in resultStats.failed_details" :key="errRow.row">
                  <td class="text-caption font-weight-bold text-center" style="width: 80px">{{ errRow.row }}</td>
                  <td class="text-caption text-truncate" style="max-width: 250px" :title="errRow.data?.join(', ')">
                    <code>{{ errRow.data?.join(', ') || '---' }}</code>
                  </td>
                  <td class="text-caption text-error font-weight-bold">{{ errRow.reason }}</td>
                </tr>
              </tbody>
            </v-table>
          </div>
        </div>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4 bg-grey-lighten-5">
        <v-btn v-if="step === 'upload'" variant="text" color="grey" @click="close" :disabled="importing">إلغاء</v-btn>
        <v-spacer />
        <v-btn
          v-if="step === 'upload'"
          color="primary"
          :disabled="!selectedFile"
          :loading="importing"
          class="px-8 font-weight-bold"
          @click="uploadAndStartImport"
        >
          بدء الاستيراد
        </v-btn>
        <v-btn v-if="step === 'result'" color="primary" class="px-8 font-weight-bold" @click="close">
          موافق وإغلاق
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
// تعليق عربي: نافذة ديالوج لاستيراد المنتجات بالخلفية عبر رفع ملف CSV وتتبع التقدم لايف وعرض الأخطاء والسطور الفاشلة.

import { ref } from 'vue';
import { useApi } from '@/composables/useApi';
import { toast } from 'vue3-toastify';

const isOpen = ref(false);
const step = ref('upload'); // upload, progress, result
const dragActive = ref(false);
const selectedFile = ref(null);
const fileInput = ref(null);

const progress = ref(0);
const statusText = ref('');
const importing = ref(false);

const resultStats = ref({
  success_count: 0,
  failed_count: 0,
  failed_details: []
});

const emit = defineEmits(['imported']);
const api = useApi('/api/v1/export-import');

let pollingInterval = null;

const open = () => {
  isOpen.value = true;
  step.value = 'upload';
  selectedFile.value = null;
  progress.value = 0;
  importing.value = false;
};

const close = () => {
  if (importing.value) return;
  isOpen.value = false;
  clearInterval(pollingInterval);
};

const handleFileSelected = (e) => {
  const file = e.target.files[0];
  if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
    selectedFile.value = file;
  } else {
    toast.error('يرجى اختيار ملف CSV صالح فقط.');
  }
};

const handleDrop = (e) => {
  dragActive.value = false;
  const file = e.dataTransfer.files[0];
  if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
    selectedFile.value = file;
  } else {
    toast.error('يرجى اختيار ملف CSV صالح فقط.');
  }
};

const downloadSampleCSV = () => {
  const csvContent = "\uFEFF#,اسم المنتج,الوصف,نشط\n1,منتج ملموس تجريبي 1,هذا وصف قصير للمنتج,نعم\n2,منتج ملموس تجريبي 2,وصف منتج مؤرشف آخر,لا\n";
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'products_import_sample.csv');
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const uploadAndStartImport = async () => {
  if (!selectedFile.value) return;
  importing.value = true;
  statusText.value = 'جاري رفع الملف وجدولة عملية الاستيراد...';
  step.value = 'progress';

  try {
    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('model_type', 'products');

    const res = await api.create(formData, { showLoading: false });
    if (res.data && res.data.id) {
      startPolling(res.data.id);
    }
  } catch (error) {
    console.error('Import upload failed:', error);
    step.value = 'upload';
    importing.value = false;
  }
};

const startPolling = (jobId) => {
  progress.value = 10;
  statusText.value = 'تمت الجدولة بنجاح. جاري الاستيراد بالخلفية...';
  
  pollingInterval = setInterval(async () => {
    try {
      const res = await api.getById(jobId, { showLoading: false, showError: false });
      if (res.data) {
        progress.value = res.data.progress || 10;
        
        if (res.data.status === 'processing') {
          statusText.value = 'جاري معالجة الأسطر وإدراج المنتجات...';
        }
        
        if (res.data.status === 'completed' || res.data.status === 'failed') {
          clearInterval(pollingInterval);
          importing.value = false;
          
          if (res.data.errors) {
            resultStats.value = {
              success_count: res.data.errors.success_count ?? 0,
              failed_count: res.data.errors.failed_count ?? 0,
              failed_details: res.data.errors.failed_details ?? []
            };
          } else {
            resultStats.value = {
              success_count: 0,
              failed_count: 0,
              failed_details: []
            };
          }
          
          step.value = 'result';
          emit('imported');
        }
      }
    } catch (error) {
      console.error('Error polling job status:', error);
    }
  }, 2000);
};

defineExpose({ open });
</script>

<style scoped>
.import-dropzone {
  transition: all 0.3s ease;
}
.import-dropzone:hover {
  background-color: #f5f5f5;
  border-color: rgb(var(--v-theme-primary)) !important;
}
</style>
