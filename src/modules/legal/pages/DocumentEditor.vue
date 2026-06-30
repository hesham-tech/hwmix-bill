<template>
  <v-container class="py-8 text-right legal-document-editor" fluid>
    <!-- Header with actions -->
    <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-4 mb-8">
      <div>
        <v-btn variant="text" color="primary" prepend-icon="ri-arrow-right-line" class="font-weight-bold mb-2 no-print" @click="$router.push('/app/admin/legal-documents')">
          العودة للوحة التحكم
        </v-btn>
        <h1 class="text-h4 font-weight-black text-primary d-flex align-center gap-2">
          <v-icon icon="ri-edit-box-line" />
          {{ isEditMode ? 'تعديل مسودة الإصدار' : 'إنشاء مسودة إصدار جديدة' }}
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          المستند: <span class="font-weight-bold text-primary">{{ getDocTitle(docKey) }}</span>
        </p>
      </div>

      <div class="d-flex gap-2 no-print">
        <v-btn
          color="primary"
          variant="flat"
          prepend-icon="ri-save-line"
          class="rounded-lg font-weight-bold px-6"
          :loading="saving"
          @click="saveDraft"
        >
          حفظ كمسودة
        </v-btn>
      </div>
    </div>

    <v-row>
      <!-- Configuration sidebar -->
      <v-col cols="12" md="4" class="no-print">
        <v-card class="border pa-6 rounded-xl bg-white elevation-1 h-100">
          <h2 class="text-h6 font-weight-bold mb-6 border-b pb-3 text-primary d-flex align-center gap-2">
            <v-icon icon="ri-settings-4-line" />
            بيانات الإصدار
          </h2>

          <v-form ref="formRef">
            <v-text-field
              v-model="form.version"
              label="رقم الإصدار"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              placeholder="مثال: 1.0 أو 2.1"
              persistent-hint
              hint="تأكد من كتابة رقم إصدار تسلسلي غير مكرر"
              required
            />

            <v-text-field
              v-model="form.title"
              label="عنوان المستند في هذا الإصدار"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              placeholder="مثال: شروط الخدمة - تحديث يونيو 2026"
              required
            />

            <v-textarea
              v-model="form.summary"
              label="ملخص التغييرات وسجل التحديثات"
              variant="outlined"
              density="comfortable"
              rows="4"
              class="mb-4"
              placeholder="اكتب هنا النقاط التي تم تعديلها أو إضافتها في هذا الإصدار ليراها المستخدم..."
              persistent-hint
              hint="سيتم عرض هذا الملخص للمستخدمين عند مطالبتهم بالموافقة"
            />
          </v-form>
        </v-card>
      </v-col>

      <!-- Document Content Workspace -->
      <v-col cols="12" md="8">
        <v-card class="border rounded-xl bg-white elevation-1">
          <v-tabs v-model="activeTab" bg-color="transparent" color="primary" class="border-b no-print" grow>
            <v-tab value="edit" class="font-weight-bold">
              <v-icon icon="ri-markdown-line" class="me-2" />
              صياغة المحتوى
            </v-tab>
            <v-tab value="preview" class="font-weight-bold" @click="updatePreview">
              <v-icon icon="ri-eye-line" class="me-2" />
              المعاينة الحية
            </v-tab>
            <v-tab value="compare" class="font-weight-bold" @click="loadActiveVersionForComparison" v-if="activePublishedContent">
              <v-icon icon="ri-git-merge-line" class="me-2" />
              مقارنة التغييرات (Diff)
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab">
            <!-- Edit Pane -->
            <v-window-item value="edit" class="pa-6">
              <div class="mb-4 d-flex justify-space-between align-center text-subtitle-2 text-grey-darken-1">
                <span>يدعم التنسيقات عن طريق لغة HTML أو النصوص العادية</span>
                <span>نصيحة: استخدم وسوم <code class="bg-grey-lighten-3 px-1 rounded">&lt;h2&gt;</code> للعناوين الفرعية</span>
              </div>
              <v-textarea
                v-model="form.content"
                variant="outlined"
                rows="24"
                no-resize
                class="font-mono"
                placeholder="اكتب محتوى المستند القانوني هنا بالكامل..."
                style="font-family: 'Courier New', Courier, monospace; line-height: 1.6; font-size: 1.05rem;"
                required
              />
            </v-window-item>

            <!-- Preview Pane -->
            <v-window-item value="preview" class="pa-8 pa-sm-12">
              <div class="border-b pb-4 mb-6">
                <h1 class="text-h3 font-weight-black mb-2 text-primary">{{ form.title || 'عنوان المستند' }}</h1>
                <span class="text-subtitle-2 text-grey">معاينة الإصدار: v{{ form.version || '0.0' }}</span>
              </div>
              <div class="legal-preview-body text-body-1 leading-relaxed text-right" v-html="previewHtml"></div>
            </v-window-item>

            <!-- Compare Diff Pane -->
            <v-window-item value="compare" class="pa-6">
              <v-alert type="info" variant="tonal" class="mb-6 rounded-lg text-right">
                يعرض هذا القسم مقارنة سريعة بين محتوى الإصدار المنشور حالياً (على اليمين) والمسودة الحالية التي تقوم بتعديلها (على اليسار).
              </v-alert>

              <v-row>
                <!-- Current published version -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="pa-4 rounded-lg bg-grey-lighten-4 h-100">
                    <div class="border-b pb-2 mb-4 d-flex justify-space-between align-center">
                      <span class="font-weight-bold text-success">الإصدار المنشور والنشط حالياً</span>
                      <v-chip size="small" color="success">v{{ activePublishedVersionNumber }}</v-chip>
                    </div>
                    <div class="compare-content text-caption text-grey-darken-3 leading-relaxed" style="max-height: 500px; overflow-y: auto; white-space: pre-wrap;">
                      {{ activePublishedContent }}
                    </div>
                  </v-card>
                </v-col>

                <!-- Current draft version -->
                <v-col cols="12" md="6">
                  <v-card variant="outlined" class="pa-4 rounded-lg bg-primary-lighten-5 border-primary h-100">
                    <div class="border-b pb-2 mb-4 d-flex justify-space-between align-center">
                      <span class="font-weight-bold text-primary">المسودة الحالية المقترحة</span>
                      <v-chip size="small" color="primary">v{{ form.version }}</v-chip>
                    </div>
                    <div class="compare-content text-caption text-grey-darken-3 leading-relaxed" style="max-height: 500px; overflow-y: auto; white-space: pre-wrap;">
                      {{ form.content }}
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getOne, saveItem, getAll } from '@/services/api';
import apiClient from '@/services/api';
import { toast } from 'vue3-toastify';

const route = useRoute();
const useRouterInstance = useRouter();

const formRef = ref(null);
const activeTab = ref('edit');
const loading = ref(true);
const saving = ref(false);
const isEditMode = ref(false);

const documentId = ref(null);
const docKey = ref('');
const versionId = ref(null);

const form = ref({
  version: '',
  title: '',
  content: '',
  summary: ''
});

// Comparison variables
const activePublishedContent = ref('');
const activePublishedVersionNumber = ref('');

const previewHtml = ref('');

const getDocTitle = (key) => {
  const titles = {
    'privacy-policy': 'سياسة الخصوصية',
    'terms-of-use': 'شروط الخدمة والاستخدام',
    'refund-policy': 'سياسة الاسترداد والضمان',
    'cookie-policy': 'سياسة ملفات الارتباط (Cookies)'
  };
  return titles[key] || `اتفاقية: ${key}`;
};

const updatePreview = () => {
  previewHtml.value = form.value.content || '<p class="text-grey text-center">لا يوجد محتوى لعرضه حالياً.</p>';
};

const loadActiveVersionForComparison = async () => {
  if (!docKey.value) return;
  try {
    const url = `v1/legal/documents/${docKey.value}/active`;
    const response = await apiClient.get(url);
    if (response.data && response.data.status) {
      const activeDoc = response.data.data;
      activePublishedContent.value = activeDoc.content;
      activePublishedVersionNumber.value = activeDoc.version;
      
      // إذا كنا نقوم بإنشاء إصدار جديد (وليس تعديل مسودة)، نملأ المحتوى والمنشئ بالنسخة الحالية تلقائياً ليسهل التعديل عليها
      if (!isEditMode.value) {
        form.value.content = activeDoc.content;
        form.value.title = activeDoc.title;
        // اقتراح رقم الإصدار التالي تلقائياً
        const currentVer = parseFloat(activeDoc.version);
        if (!isNaN(currentVer)) {
          form.value.version = (currentVer + 1.0).toFixed(1);
        }
      }
    }
  } catch (err) {
    // No active published version found for comparison.
  }
};

const loadDraftData = async () => {
  if (!versionId.value) return;
  
  try {
    // Eagerly loading draft version. In our system, getOne loads data. We can fetch using Axios or custom service
    const url = `v1/legal/admin/documents/${documentId.value}`;
    const response = await apiClient.get(url);
    if (response.data && response.data.status) {
      const doc = response.data.data;
      const matchingVersion = doc.versions.find(v => v.id === parseInt(versionId.value));
      if (matchingVersion) {
        form.value = {
          version: matchingVersion.version,
          title: matchingVersion.title,
          content: matchingVersion.content,
          summary: matchingVersion.summary || ''
        };
      }
    }
  } catch (err) {
    console.error('Failed to load draft version:', err);
    toast.error('لم نتمكن من تحميل بيانات المسودة.');
  }
};

const saveDraft = async () => {
  if (!form.value.version || !form.value.title || !form.value.content) {
    toast.error('الرجاء إدخال رقم الإصدار والعنوان ومحتوى الشروط أولاً.');
    return;
  }

  saving.value = true;
  try {
    let res;
    if (isEditMode.value) {
      // تعديل مسودة موجودة بالفعل
      res = await saveItem('v1/legal/admin/versions', form.value, versionId.value, true, true);
    } else {
      // إنشاء مسودة جديدة
      const endpoint = `v1/legal/admin/documents/${documentId.value}/versions`;
      res = await saveItem(endpoint, form.value, false, true, true);
    }

    if (res && res.status) {
      useRouterInstance.push('/app/admin/legal-documents');
    }
  } catch (err) {
    console.error(err);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  documentId.value = route.query.documentId;
  docKey.value = route.query.docKey || '';
  
  if (route.query.versionId) {
    versionId.value = route.query.versionId;
    isEditMode.value = true;
    loadDraftData();
  } else {
    // Default draft version template
    form.value.title = getDocTitle(docKey.value);
  }

  // Pre-fetch comparison info
  loadActiveVersionForComparison();
});
</script>

<script>
// تعليق عربي لقواعد الكلاسات: مكون تعديل وصياغة إصدارات الشروط والسياسات القانونية ومقارنتها.
</script>

<style scoped>
.gap-4 { gap: 16px; }
.gap-2 { gap: 8px; }

.font-mono {
  font-family: monospace;
}

.legal-preview-body {
  line-height: 2.2;
  color: #334155;
}
.legal-preview-body :deep(p) {
  margin-bottom: 24px;
}
.legal-preview-body :deep(h2) {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a3d8f;
  margin-top: 40px;
  margin-bottom: 20px;
}
.legal-preview-body :deep(h3) {
  font-size: 1.25rem;
  font-weight: 600;
  color: #6a5ae0;
  margin-top: 30px;
  margin-bottom: 15px;
}
.legal-preview-body :deep(ul) {
  margin-bottom: 24px;
  padding-right: 24px;
}

.compare-content {
  direction: rtl;
}
</style>
