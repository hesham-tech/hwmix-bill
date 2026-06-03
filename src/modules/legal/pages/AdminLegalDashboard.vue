<template>
  <v-container class="py-8 text-right legal-admin-dashboard" fluid>
    <!-- Header with Breadcrumbs & Action -->
    <div class="d-flex flex-column flex-sm-row justify-space-between align-start align-sm-center gap-4 mb-8">
      <div>
        <h1 class="text-h4 font-weight-black mb-2 text-primary d-flex align-center gap-2">
          <v-icon icon="ri-file-shield-2-line" color="primary" />
          إدارة المستندات والاتفاقيات القانونية
        </h1>
        <p class="text-subtitle-1 text-grey-darken-1">
          إدارة شروط الاستخدام، سياسات الخصوصية، تتبع الإصدارات وموافقات المستخدمين.
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="ri-add-line"
        class="rounded-lg font-weight-bold px-6 py-2 tour-add-document"
        size="large"
        @click="openCreateDialog"
      >
        إضافة مستند جديد
      </v-btn>
    </div>

    <!-- Statistics Cards -->
    <v-row class="mb-8">
      <v-col cols="12" sm="6" md="4">
        <v-card class="stat-card border pa-6 rounded-xl elevation-2 hover-card">
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="text-subtitle-2 text-grey-darken-1 font-weight-bold">إجمالي المستندات</span>
              <h2 class="text-h3 font-weight-black mt-2 text-primary">{{ documents.length }}</h2>
            </div>
            <v-avatar color="primary-lighten-5" size="56" rounded="lg">
              <v-icon icon="ri-file-text-line" color="primary" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="4">
        <v-card class="stat-card border pa-6 rounded-xl elevation-2 hover-card">
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="text-subtitle-2 text-grey-darken-1 font-weight-bold">المستندات النشطة</span>
              <h2 class="text-h3 font-weight-black mt-2 text-success">
                {{ documents.filter(d => d.is_active).length }}
              </h2>
            </div>
            <v-avatar color="success-lighten-5" size="56" rounded="lg">
              <v-icon icon="ri-checkbox-circle-line" color="success" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="stat-card border pa-6 rounded-xl elevation-2 hover-card">
          <div class="d-flex align-center justify-space-between">
            <div>
              <span class="text-subtitle-2 text-grey-darken-1 font-weight-bold">مستندات النظام العامة</span>
              <h2 class="text-h3 font-weight-black mt-2 text-info">
                {{ documents.filter(d => d.company_id === null).length }}
              </h2>
            </div>
            <v-avatar color="info-lighten-5" size="56" rounded="lg">
              <v-icon icon="ri-global-line" color="info" size="28" />
            </v-avatar>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Main List Loader -->
    <div v-if="loading" class="d-flex flex-column align-center justify-center py-16">
      <v-progress-circular indeterminate color="primary" size="64" width="6" class="mb-4" />
      <span class="text-subtitle-1 text-grey-darken-1">جاري تحميل المستندات...</span>
    </div>

    <!-- Empty State -->
    <v-card v-else-if="documents.length === 0" class="pa-12 text-center border rounded-xl bg-white elevation-1">
      <v-avatar color="primary-lighten-5" size="96" class="mb-6">
        <v-icon icon="ri-file-warning-line" color="primary" size="48" />
      </v-avatar>
      <h2 class="text-h5 font-weight-bold mb-2">لا توجد مستندات قانونية حالياً</h2>
      <p class="text-body-1 text-grey mb-6">
        ابدأ بإنشاء أول مستند قانوني للمنصة (مثل شروط الخدمة أو سياسة الخصوصية) لتتبع إصداراته.
      </p>
      <v-btn color="primary" class="rounded-lg font-weight-bold px-6" @click="openCreateDialog">
        إنشاء مستند الآن
      </v-btn>
    </v-card>

    <!-- Documents Data Grid -->
    <div v-else class="d-flex flex-column gap-6">
      <v-card
        v-for="doc in documents"
        :key="doc.id"
        class="document-row-card border rounded-xl overflow-hidden bg-white elevation-1 hover-lift"
      >
        <div class="d-flex flex-column flex-md-row justify-space-between align-start align-md-center pa-6 gap-4 border-b bg-grey-lighten-5">
          <div class="d-flex align-center gap-4">
            <v-avatar :color="doc.is_active ? 'primary-lighten-5' : 'grey-lighten-3'" size="48" rounded="lg">
              <v-icon :icon="doc.is_active ? 'ri-file-shield-line' : 'ri-file-line'" :color="doc.is_active ? 'primary' : 'grey'" size="24" />
            </v-avatar>
            <div>
              <div class="d-flex align-center gap-2 flex-wrap">
                <h3 class="text-h6 font-weight-black">{{ getDocumentTitle(doc.key) }}</h3>
                <v-chip size="small" variant="flat" :color="doc.is_active ? 'success' : 'grey'" class="font-weight-bold">
                  {{ doc.is_active ? 'نشط' : 'معطل' }}
                </v-chip>
                <v-chip size="small" variant="outlined" color="primary" class="font-weight-bold" v-if="doc.company_id === null">
                  عام (نظام SaaS)
                </v-chip>
                <v-chip size="small" variant="outlined" color="info" class="font-weight-bold" v-else>
                  خاص بالشركة
                </v-chip>
              </div>
              <p class="text-caption text-grey-darken-1 mt-1">
                المفتاح التعريفي: <code class="bg-grey-lighten-3 px-1 rounded">{{ doc.key }}</code>
              </p>
            </div>
          </div>

          <!-- Document actions -->
          <div class="d-flex gap-2">
            <v-btn
              color="primary"
              variant="outlined"
              prepend-icon="ri-add-circle-line"
              class="rounded-lg font-weight-bold"
              @click="openNewVersion(doc)"
            >
              إصدار جديد
            </v-btn>
            <v-btn
              color="error"
              variant="text"
              icon="ri-delete-bin-line"
              @click="confirmDeleteDoc(doc)"
            />
          </div>
        </div>

        <!-- Versions Table / Details -->
        <v-card-text class="pa-0">
          <v-table density="comfortable" class="versions-table">
            <thead>
              <tr class="bg-white">
                <th class="text-right font-weight-bold">الإصدار</th>
                <th class="text-right font-weight-bold">عنوان الإصدار</th>
                <th class="text-right font-weight-bold">الحالة</th>
                <th class="text-right font-weight-bold">تاريخ النشر</th>
                <th class="text-center font-weight-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!doc.versions || doc.versions.length === 0">
                <td colspan="5" class="text-center py-6 text-grey text-subtitle-2">
                  لا توجد إصدارات أو مسودات لهذا المستند حالياً. انقر على "إصدار جديد" للبدء بالصياغة.
                </td>
              </tr>
              <tr v-for="version in doc.versions" :key="version.id" :class="{'active-published-tr': version.status === 'published'}">
                <td class="font-weight-bold text-primary">v{{ version.version }}</td>
                <td>{{ version.title }}</td>
                <td>
                  <v-chip size="small" variant="flat" :color="getStatusColor(version.status)" class="font-weight-bold">
                    {{ getStatusText(version.status) }}
                  </v-chip>
                </td>
                <td>{{ formatDate(version.published_at) }}</td>
                <td>
                  <div class="d-flex justify-center gap-1">
                    <!-- Preview Content -->
                    <v-btn
                      color="secondary"
                      variant="tonal"
                      size="small"
                      prepend-icon="ri-eye-line"
                      class="font-weight-bold rounded-md"
                      @click="previewVersion(version)"
                    >
                      معاينة
                    </v-btn>

                    <!-- Report of compliance -->
                    <v-btn
                      v-if="version.status === 'published'"
                      color="info"
                      variant="tonal"
                      size="small"
                      prepend-icon="ri-pie-chart-line"
                      class="font-weight-bold rounded-md"
                      :to="`/app/admin/legal-documents/report/${version.id}`"
                    >
                      موافقات الامتثال
                    </v-btn>

                    <!-- Edit Draft -->
                    <v-btn
                      v-if="version.status === 'draft'"
                      color="primary"
                      variant="flat"
                      size="small"
                      prepend-icon="ri-edit-line"
                      class="font-weight-bold rounded-md"
                      @click="editVersion(doc, version)"
                    >
                      تعديل المسودة
                    </v-btn>

                    <!-- Publish Draft -->
                    <v-btn
                      v-if="version.status === 'draft'"
                      color="success"
                      variant="outlined"
                      size="small"
                      prepend-icon="ri-checkbox-circle-line"
                      class="font-weight-bold rounded-md"
                      @click="confirmPublishVersion(version)"
                    >
                      نشر الإصدار
                    </v-btn>

                    <!-- Delete Draft / Archive -->
                    <v-btn
                      v-if="version.status !== 'published'"
                      color="error"
                      variant="text"
                      icon="ri-delete-bin-line"
                      size="small"
                      @click="confirmDeleteVersion(version)"
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </div>

    <!-- Create Document Dialog -->
    <v-dialog v-model="createDialog" max-width="500px">
      <v-card class="rounded-xl pa-4 text-right">
        <v-card-title class="text-h5 font-weight-black border-b pb-4 mb-4">إنشاء مستند قانوني جديد</v-card-title>
        
        <v-card-text>
          <v-form ref="createFormRef">
            <v-select
              v-model="newDocForm.key"
              :items="predefinedKeys"
              label="نوع المستند القانوني"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              required
            />
            <v-text-field
              v-model="newDocForm.key"
              label="المفتاح التعريفي (Key)"
              variant="outlined"
              density="comfortable"
              class="mb-4"
              persistent-hint
              hint="يجب أن يكون باللغة الإنجليزية بدون مسافات (مثال: privacy-policy)"
              required
            />
            <v-switch
              v-model="newDocForm.is_active"
              label="تفعيل المستند حالياً"
              color="primary"
              inset
            />
          </v-form>
        </v-card-text>

        <v-card-actions class="pt-4 border-t gap-2 justify-end">
          <v-btn variant="text" class="font-weight-bold" @click="createDialog = false">إلغاء</v-btn>
          <v-btn color="primary" variant="flat" class="px-6 font-weight-bold" @click="submitCreateDoc">إنشاء المستند</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Preview Document Version Dialog -->
    <v-dialog v-model="previewDialog" max-width="800px" scrollable>
      <v-card class="rounded-xl pa-4 text-right">
        <v-card-title class="text-h5 font-weight-black border-b pb-4 mb-4 d-flex align-center justify-between">
          <div class="d-flex align-center gap-2">
            <v-avatar color="primary-lighten-5" size="40" rounded="lg">
              <v-icon icon="ri-file-text-line" color="primary" />
            </v-avatar>
            <div>
              <span class="font-weight-black">{{ previewVersionData.title }}</span>
              <span class="text-caption text-grey ms-2">إصدار v{{ previewVersionData.version }}</span>
            </div>
          </div>
        </v-card-title>
        
        <v-card-text class="py-4" style="max-height: 60vh;">
          <div class="legal-document-body text-body-1 leading-relaxed text-slate-700" v-html="previewVersionData.content"></div>
        </v-card-text>

        <v-card-actions class="pt-4 border-t gap-2 justify-end">
          <v-btn color="primary" variant="flat" class="px-6 font-weight-bold" @click="previewDialog = false">إغلاق المعاينة</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getAll, saveItem, deleteOne } from '@/services/api';
import apiClient from '@/services/api';
import { toast } from 'vue3-toastify';

const router = useRouter();
const loading = ref(true);
const documents = ref([]);
const createDialog = ref(false);
const createFormRef = ref(null);

const previewDialog = ref(false);
const previewVersionData = ref({ title: '', version: '', content: '' });

const previewVersion = (version) => {
  previewVersionData.value = version;
  previewDialog.value = true;
};

const predefinedKeys = [
  { title: 'سياسة الخصوصية', value: 'privacy-policy' },
  { title: 'شروط الخدمة والاستخدام', value: 'terms-of-use' },
  { title: 'سياسة الاسترداد والضمان', value: 'refund-policy' },
  { title: 'سياسة ملفات الارتباط (Cookies)', value: 'cookie-policy' }
];

const newDocForm = ref({
  key: '',
  is_active: true
});

const getDocumentTitle = (key) => {
  const match = predefinedKeys.find(item => item.value === key);
  return match ? match.title : `اتفاقية: ${key}`;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'published': return 'success';
    case 'draft': return 'warning';
    case 'archived': return 'grey-darken-1';
    default: return 'grey';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'published': return 'منشور ونشط';
    case 'draft': return 'مسودة معلقة';
    case 'archived': return 'مؤرشف تاريخي';
    default: return status;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'مسودة (لم ينشر)';
  const date = new Date(dateString);
  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const loadDocuments = async () => {
  loading.value = true;
  try {
    const res = await getAll('v1/legal/admin/documents', null, false, false, false);
    if (res && res.status) {
      documents.value = res.data;
    }
  } catch (err) {
    console.error('Failed to load documents:', err);
  } finally {
    loading.value = false;
  }
};

const openCreateDialog = () => {
  newDocForm.value = {
    key: '',
    is_active: true
  };
  createDialog.value = true;
};

const submitCreateDoc = async () => {
  if (!newDocForm.value.key) {
    toast.error('الرجاء إدخال المفتاح التعريفي للمستند.');
    return;
  }
  
  try {
    const res = await saveItem('v1/legal/admin/documents', newDocForm.value, false, true, true);
    if (res && res.status) {
      createDialog.value = false;
      loadDocuments();
    }
  } catch (err) {
    console.error(err);
  }
};

const confirmDeleteDoc = async (doc) => {
  if (confirm(`هل أنت متأكد من حذف المستند "${getDocumentTitle(doc.key)}" بالكامل وكل إصداراته؟`)) {
    try {
      const res = await deleteOne('v1/legal/admin/documents', doc.id, true, true);
      if (res && res.status) {
        loadDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  }
};

const openNewVersion = (doc) => {
  router.push({
    name: 'admin-legal-document-editor',
    query: {
      documentId: doc.id,
      docKey: doc.key
    }
  });
};

const editVersion = (doc, version) => {
  router.push({
    name: 'admin-legal-document-editor',
    query: {
      documentId: doc.id,
      docKey: doc.key,
      versionId: version.id
    }
  });
};

const confirmPublishVersion = async (version) => {
  if (confirm(`هل أنت متأكد من نشر الإصدار v${version.version}؟ سيؤدي هذا لتنشيطه فوراً للمستخدمين وأرشفة الإصدار المنشور حالياً.`)) {
    try {
      const response = await apiClient.post(`v1/legal/admin/versions/${version.id}/publish`);
      if (response.data && response.data.status) {
        toast.success('تم نشر الإصدار بنجاح بنجاح وأرشفة الإصدارات السابقة.');
        loadDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  }
};

const confirmDeleteVersion = async (version) => {
  if (confirm(`هل أنت متأكد من حذف الإصدار v${version.version} نهائياً؟`)) {
    try {
      const res = await deleteOne('v1/legal/admin/versions', version.id, true, true);
      if (res && res.status) {
        loadDocuments();
      }
    } catch (err) {
      console.error(err);
    }
  }
};

onMounted(() => {
  loadDocuments();
});
</script>

<script>
// تعليق عربي لقواعد الكلاسات: كود مكون لوحة التحكم التشغيلية للمستندات القانونية.
</script>

<style scoped>
.gap-4 { gap: 16px; }
.gap-6 { gap: 24px; }
.gap-2 { gap: 8px; }
.gap-1 { gap: 4px; }

.hover-card {
  transition: all 0.3s ease;
}
.hover-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(26, 61, 143, 0.08) !important;
}

.document-row-card {
  transition: all 0.3s ease;
}
.hover-lift:hover {
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.04) !important;
}

.active-published-tr {
  background-color: #f0fdf4 !important;
}

.versions-table th {
  font-size: 0.9rem;
  color: #475569;
}
.versions-table td {
  font-size: 0.95rem;
}
</style>
