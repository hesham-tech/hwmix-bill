<template>
  <v-dialog
    v-model="visible"
    persistent
    max-width="700px"
    scrollable
    class="registration-legal-dialog"
  >
    <v-card class="rounded-xl pa-4 text-right" v-if="!loading && !error && currentDoc">
      <!-- Dialog Header -->
      <v-card-title class="text-h5 font-weight-black border-b pb-4 mb-4 d-flex align-center justify-between">
        <div class="d-flex align-center gap-2">
          <v-avatar color="primary-lighten-5" size="40" rounded="lg">
            <v-icon :icon="currentStep === 1 ? 'ri-file-list-3-line' : 'ri-shield-user-line'" color="primary" />
          </v-avatar>
          <div>
            <span class="font-weight-black">{{ currentDoc.title }}</span>
            <span class="text-caption text-grey ms-2 block-sm">إصدار v{{ currentDoc.version }}</span>
          </div>
        </div>
      </v-card-title>

      <!-- Scrollable Text Content -->
      <v-card-text class="py-2" style="max-height: 50vh;">
        <!-- Alert bar showing current step -->
        <v-alert
          type="info"
          variant="tonal"
          class="mb-6 rounded-lg text-right"
          icon="ri-information-line"
          density="comfortable"
        >
          <span class="text-body-2 font-weight-bold">
            خطوة {{ currentStep }} من 2: يرجى مراجعة الشروط والبنود أدناه والضغط على "أوافق" للمتابعة.
          </span>
        </v-alert>

        <!-- Document Text Body -->
        <div class="legal-document-body text-body-1 leading-relaxed text-slate-700" v-html="currentDoc.content"></div>
      </v-card-text>

      <!-- Dialog Actions / Sticky Buttons -->
      <v-card-actions class="border-t pt-4 justify-space-between align-center">
        <v-btn
          color="error"
          variant="outlined"
          class="rounded-lg px-6 font-weight-bold"
          @click="handleDisagree"
        >
          غير موافق
        </v-btn>

        <div class="d-flex align-center gap-4">
          <span class="text-caption text-grey">الخطوة {{ currentStep }} من 2</span>
          <v-btn
            color="primary"
            variant="flat"
            class="rounded-lg px-8 font-weight-bold"
            @click="handleAgree"
          >
            {{ currentStep === 1 ? 'أوافق والمتابعة' : 'أوافق وإتمام التسجيل' }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>

    <!-- Loading State -->
    <v-card class="rounded-xl pa-8 text-center" v-else-if="loading">
      <v-card-text>
        <v-progress-circular indeterminate color="primary" size="48" width="4" class="mb-4" />
        <div class="text-subtitle-1 font-weight-bold text-grey-darken-1">جاري تحميل وثائق الامتثال القانوني...</div>
      </v-card-text>
    </v-card>

    <!-- Error State -->
    <v-card class="rounded-xl pa-8 text-center" v-else-if="error">
      <v-card-text>
        <v-avatar color="error-lighten-5" size="64" class="mb-4">
          <v-icon icon="ri-error-warning-line" color="error" size="32" />
        </v-avatar>
        <div class="text-h6 font-weight-bold mb-2">عذراً، فشل تحميل الوثائق الشروط</div>
        <p class="text-body-2 text-grey mb-6">حدث خطأ أثناء جلب المستندات القانونية النشطة للمنصة.</p>
        <v-btn color="primary" variant="flat" class="rounded-lg px-6 font-weight-bold" @click="fetchDocuments">إعادة المحاولة</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import apiClient from '@/services/api';

const props = defineProps({
  modelValue: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue', 'agree', 'disagree']);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const loading = ref(false);
const error = ref(false);
const currentStep = ref(1);

const termsDoc = ref(null);
const privacyDoc = ref(null);

const currentDoc = computed(() => {
  return currentStep.value === 1 ? termsDoc.value : privacyDoc.value;
});

const fetchDocuments = async () => {
  loading.value = true;
  error.value = false;
  try {
    const [termsRes, privacyRes] = await Promise.all([
      apiClient.get('v1/legal/documents/terms-of-use/active'),
      apiClient.get('v1/legal/documents/privacy-policy/active')
    ]);

    if (termsRes.data?.status && privacyRes.data?.status) {
      termsDoc.value = termsRes.data.data;
      privacyDoc.value = privacyRes.data.data;
    } else {
      throw new Error('Invalid response status');
    }
  } catch (err) {
    console.error('Failed to load legal agreements in dialog:', err);
    error.value = true;
  } finally {
    loading.value = false;
  }
};

const handleAgree = () => {
  if (currentStep.value === 1) {
    currentStep.value = 2;
  } else {
    emit('agree');
    visible.value = false;
  }
};

const handleDisagree = () => {
  emit('disagree');
  visible.value = false;
};

// مراقبة فتح الديالوج للبدء في جلب البيانات وتصفير الخطوة
watch(visible, (isOpen) => {
  if (isOpen) {
    currentStep.value = 1;
    // جلب البيانات فقط إذا لم تكن محملة مسبقاً لتوفير البيانات وتسريع الاستجابة
    if (!termsDoc.value || !privacyDoc.value) {
      fetchDocuments();
    }
  }
});
</script>

<script>
// تعليق عربي لقواعد الكلاسات: مكون نافذة منبثقة تفاعلية للموافقة على شروط الاستخدام وسياسة الخصوصية خطوة بخطوة أثناء إنشاء الحساب.
</script>

<style scoped>
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }
.block-sm { display: inline; }

@media (max-width: 600px) {
  .block-sm {
    display: block;
    margin-right: 0 !important;
    margin-top: 4px;
  }
}

.legal-document-body {
  line-height: 2;
}
.legal-document-body :deep(p) {
  margin-bottom: 16px;
}
.legal-document-body :deep(h2) {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a3d8f;
  margin-top: 25px;
  margin-bottom: 12px;
}
.legal-document-body :deep(ul) {
  margin-bottom: 16px;
  padding-right: 20px;
}
</style>
