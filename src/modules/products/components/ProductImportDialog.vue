<template>
  <AppDialog v-model="isOpen" title="رفع منتجات من إكسيل" icon="ri-upload-cloud-2-line" width="1000" :loading="importing" persistent>
    <div class="pa-4 import-container">
      <!-- Step 1: Upload -->
      <div v-if="step === 1" class="d-flex flex-column align-center justify-center py-10">
        <v-icon icon="ri-upload-cloud-2-line" size="80" color="primary" class="mb-4 opa-5" />
        <h3 class="text-h5 font-weight-bold mb-2">اختر ملف الإكسيل</h3>
        <p class="text-grey mb-6">يمكنك رفع ملف بأي تنسيق، سنقوم بربط الأعمدة في الخطوة التالية</p>

        <input type="file" ref="fileInput" accept=".xlsx, .xls, .csv" class="d-none" @change="handleFileChange" />

        <AppButton color="primary" size="large" prepend-icon="ri-file-add-line" class="px-10" @click="$refs.fileInput.click()">
          اختيار الملف
        </AppButton>
      </div>

      <!-- Step 2: Mapping -->
      <div v-else-if="step === 2">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h3 class="text-h6 font-weight-bold">ربط أعمدة الملف بحقول النظام</h3>
            <p class="text-caption text-grey">قم بتحديد الحقل المقابل لكل عمود في ملف الإكسيل الخاص بك</p>
          </div>
          <div class="d-flex align-center flex-wrap gap-2 mt-2 mt-sm-0">
            <div class="d-flex align-center border rounded-pill px-3 py-1 bg-grey-lighten-4">
              <span class="text-caption font-weight-bold text-grey-darken-1 me-3">تشفير الملف:</span>
              <div class="d-flex gap-1">
                <v-btn
                  size="x-small"
                  :color="selectedEncoding === 'utf-8' ? 'primary' : 'grey-lighten-2'"
                  :variant="selectedEncoding === 'utf-8' ? 'flat' : 'text'"
                  class="text-caption rounded-pill px-3"
                  @click="
                    selectedEncoding = 'utf-8';
                    reparseFile();
                  "
                >
                  UTF-8
                </v-btn>
                <v-btn
                  size="x-small"
                  :color="selectedEncoding === 'windows-1256' ? 'primary' : 'grey-lighten-2'"
                  :variant="selectedEncoding === 'windows-1256' ? 'flat' : 'text'"
                  class="text-caption rounded-pill px-3"
                  @click="
                    selectedEncoding = 'windows-1256';
                    reparseFile();
                  "
                >
                  Arabic (Win-1256)
                </v-btn>
              </div>
            </div>
            <AppButton variant="text" color="error" size="small" prepend-icon="ri-restart-line" @click="reset"> إعادة البداية </AppButton>
          </div>
        </div>

        <v-alert v-if="mappingError" type="error" variant="tonal" density="compact" class="mb-4" closable>
          {{ mappingError }}
        </v-alert>

        <div class="mapping-table-container border rounded-lg overflow-hidden">
          <v-table density="comfortable" class="mapping-table">
            <thead>
              <tr class="bg-grey-lighten-4">
                <th v-for="(header, idx) in excelHeaders" :key="idx" class="px-3 py-4" style="min-width: 200px">
                  <v-select
                    v-model="mappings[header]"
                    :items="systemFields"
                    label="ربط بحقل..."
                    density="compact"
                    variant="outlined"
                    hide-details
                    clearable
                    class="mb-2 bg-white"
                    placeholder="تجاهل هذا العمود"
                    item-title="label"
                    item-value="key"
                  >
                    <template #item="{ props, item }">
                      <!-- v-bind="props" already handles the title, removed manual title to avoid duplication -->
                      <v-list-item v-bind="props" :disabled="isFieldSelected(item.raw.key, header)">
                        <template #prepend>
                          <v-icon :icon="item.raw.icon" size="18" class="me-2" :color="isFieldSelected(item.raw.key, header) ? 'grey' : 'primary'" />
                        </template>
                        <template v-if="item.raw.required" #append>
                          <v-chip color="error" size="x-small" variant="flat">إجباري</v-chip>
                        </template>
                      </v-list-item>
                    </template>
                  </v-select>
                  <div class="text-truncate font-weight-bold text-primary" :title="header">
                    {{ header }}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIdx) in previewRows" :key="rowIdx">
                <td v-for="(header, colIdx) in excelHeaders" :key="colIdx" class="px-3 py-2 text-caption text-grey">
                  {{ row[header] }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </div>
      </div>

      <!-- Step 3: Success -->
      <div v-else-if="step === 3" class="d-flex flex-column align-center justify-center py-10">
        <v-icon icon="ri-checkbox-circle-fill" size="80" color="success" class="mb-4" />
        <h3 class="text-h5 font-weight-bold mb-2">تم الرفع بنجاح!</h3>
        <p class="text-grey mb-6">تمت إضافة {{ resultCount }} منتج إلى نظامك بنجاح.</p>

        <AppButton color="primary" @click="close"> إغلاق </AppButton>
      </div>
    </div>

    <template #actions>
      <AppButton v-if="step === 1" variant="text" @click="close">إلغاء</AppButton>
      <div v-if="step === 2" class="d-flex gap-2">
        <AppButton variant="text" color="grey" @click="step = 1">السابق</AppButton>
        <AppButton color="primary" prepend-icon="ri-rocket-2-line" :loading="importing" @click="startImport"> تنفيذ الرفع والربط </AppButton>
      </div>
    </template>
  </AppDialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import * as XLSX from 'xlsx';
import productService from '@/api/services/product.service';
import { toast } from 'vue3-toastify';

const isOpen = ref(false);
const step = ref(1);
const importing = ref(false);
const fileInput = ref(null);
const resultCount = ref(0);
const mappingError = ref('');

const excelData = ref([]);
const excelHeaders = ref([]);
const previewRows = ref([]);
const mappings = ref({});
const selectedEncoding = ref('utf-8');
const rawFileBuffer = ref(null);
const currentFileName = ref('');

const systemFields = [
  { key: 'name', label: 'اسم المنتج (عربي)', icon: 'ri-text', required: true },
  { key: 'name_en', label: 'اسم المنتج (إنجليزي)', icon: 'ri-text' },
  { key: 'sku', label: 'الباركود / SKU', icon: 'ri-barcode-line' },
  { key: 'category', label: 'التصنيف', icon: 'ri-folder-line' },
  { key: 'brand', label: 'الماركة', icon: 'ri-price-tag-3-line' },
  { key: 'sale_price', label: 'سعر البيع', icon: 'ri-money-dollar-circle-line' },
  { key: 'cost_price', label: 'سعر التكلفة', icon: 'ri-hand-coin-line' },
  { key: 'opening_stock', label: 'الرصيد الافتتاحي', icon: 'ri-stack-line' },
  { key: 'desc', label: 'الوصف القصير', icon: 'ri-file-text-line' },
];

const isFieldSelected = (fieldKey, currentHeader) => {
  return Object.entries(mappings.value).some(([h, k]) => k === fieldKey && h !== currentHeader);
};

const handleFileChange = e => {
  const file = e.target.files[0];
  if (!file) return;

  currentFileName.value = file.name;
  const reader = new FileReader();
  reader.onload = event => {
    rawFileBuffer.value = event.target.result;

    // Auto-detect if it looks like it needs windows-1256 (only if it's a CSV)
    if (file.name.endsWith('.csv')) {
      const data = new Uint8Array(rawFileBuffer.value);
      // Sample first few bytes to see if it's standard ASCII or likely Arabic
      const hasHighAscii = data.slice(0, 1000).some(b => b > 127);
      if (hasHighAscii) {
        // We'll let UTF-8 try first, then user can toggle, or we can be smart.
        // Actually, if it's a CSV and has high ascii, Windows-1256 is VERY common for Arabic Excel users.
        // selectedEncoding.value = 'windows-1256';
      }
    }

    processBuffer();
  };
  reader.readAsArrayBuffer(file);
};

const reparseFile = () => {
  if (rawFileBuffer.value) {
    processBuffer();
  }
};

const processBuffer = () => {
  try {
    const data = new Uint8Array(rawFileBuffer.value);
    let workbook;

    if (currentFileName.value.toLowerCase().endsWith('.csv')) {
      // Use TextDecoder for CSV - This is effectively "Solution 3" (Re-encoding)
      // but using native browser API instead of extra libraries like iconv-lite.
      const decoder = new TextDecoder(selectedEncoding.value);
      const decodedText = decoder.decode(data);

      workbook = XLSX.read(decodedText, {
        type: 'string',
        codepage: selectedEncoding.value === 'utf-8' ? 65001 : 1256,
      });
    } else {
      // For XLSX, XLSX library handles internal UTF-8 encoding perfectly
      workbook = XLSX.read(data, { type: 'array', cellDates: true });
    }

    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Explicitly use CP65001 if CSV and UTF-8
    const json = XLSX.utils.sheet_to_json(worksheet, {
      defval: '',
      raw: false,
      header: 0,
    });

    if (json.length === 0) {
      toast.error('الملف فارغ!');
      return;
    }

    excelData.value = json;
    excelHeaders.value = Object.keys(json[0]);
    previewRows.value = json.slice(0, 5);

    // Initial smart auto-mapping (only if mappings are empty)
    if (Object.keys(mappings.value).length === 0) {
      excelHeaders.value.forEach(header => {
        const match = systemFields.find(f => header.toLowerCase().includes(f.key.toLowerCase()) || header.includes(f.label));
        if (match) mappings.value[header] = match.key;
      });
    }

    step.value = 2;
  } catch (error) {
    console.error('File processing error:', error);
    toast.error('فشل في معالجة الملف. جرب تغيير نظام التشفير.');
  }
};

const startImport = async () => {
  // Check required fields
  const requiredFields = systemFields.filter(f => f.required).map(f => f.key);
  const mappedFields = Object.values(mappings.value);
  const missing = requiredFields.filter(f => !mappedFields.includes(f));

  if (missing.length > 0) {
    const labels = missing.map(f => systemFields.find(sf => sf.key === f).label).join('، ');
    mappingError.value = `يجب ربط الحقول التالية على الأقل: ${labels}`;
    return;
  }

  mappingError.value = '';
  importing.value = true;

  try {
    const payload = {
      mapping: mappings.value,
      data: excelData.value,
    };

    const response = await productService.import(payload);
    if (response.status || response.success) {
      resultCount.value = response.data.count || excelData.value.length;
      step.value = 3;
      emit('imported');
    }
  } catch (error) {
    console.error('Import Error:', error);
  } finally {
    importing.value = false;
  }
};

const open = () => {
  reset();
  isOpen.value = true;
};

const close = () => {
  isOpen.value = false;
};

const reset = () => {
  step.value = 1;
  excelData.value = [];
  excelHeaders.value = [];
  previewRows.value = [];
  mappings.value = {};
  mappingError.value = '';
  if (fileInput.value) fileInput.value.value = '';
};

const emit = defineEmits(['imported']);
defineExpose({ open });
</script>

<style scoped>
.import-container {
  min-height: 400px;
}
.mapping-table-container {
  max-width: 100%;
  overflow-x: auto;
}
.mapping-table th {
  vertical-align: top !important;
}
.opa-5 {
  opacity: 0.15;
}
</style>
