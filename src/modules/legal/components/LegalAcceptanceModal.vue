<template>
  <!-- Blocking persistent modal for legal agreements -->
  <v-dialog
    v-model="visible"
    persistent
    max-width="750px"
    scrollable
    class="legal-acceptance-modal no-print"
  >
    <v-card class="rounded-xl pa-4 text-right" v-if="currentVersion">
      <!-- Modal Header -->
      <v-card-title class="text-h5 font-weight-black border-b pb-4 mb-4 d-flex align-center justify-between">
        <div class="d-flex align-center gap-2">
          <v-avatar color="primary-lighten-5" size="40" rounded="lg">
            <v-icon icon="ri-file-shield-2-line" color="primary" />
          </v-avatar>
          <div>
            <span class="font-weight-black">{{ currentVersion.title }}</span>
            <span class="text-caption text-grey ms-2 block-sm">تحديث إلزامي جديد v{{ currentVersion.version }}</span>
          </div>
        </div>
      </v-card-title>

      <!-- Scrollable Content -->
      <v-card-text class="py-2" style="max-height: 55vh;">
        <!-- Alert Box: What's New? (Changelog/Summary) -->
        <v-alert
          v-if="currentVersion.summary"
          type="info"
          variant="tonal"
          class="mb-6 rounded-lg text-right"
          icon="ri-information-line"
        >
          <div class="font-weight-bold mb-1">ما الجديد في هذا التحديث؟ (ملخص التغييرات)</div>
          <div style="white-space: pre-wrap;" class="text-body-2 leading-relaxed">
            {{ currentVersion.summary }}
          </div>
        </v-alert>

        <!-- Main legal document text content -->
        <div class="legal-document-text text-body-1 leading-relaxed text-slate-700" v-html="currentVersion.content"></div>
      </v-card-text>

      <!-- Modal Footer -->
      <v-card-actions class="border-t pt-4 flex-column align-stretch gap-4">
        <!-- Acceptance Checkbox -->
        <v-checkbox
          v-model="agreed"
          color="primary"
          hide-details
          class="font-weight-bold text-right"
        >
          <template v-slot:label>
            <span class="text-body-2 text-slate-800">
              لقد قرأت بعناية وأوافق بالكامل على جميع البنود والشروط الواردة في هذا التحديث.
            </span>
          </template>
        </v-checkbox>

        <!-- Button Actions -->
        <div class="d-flex justify-space-between align-center mt-2">
          <!-- Step indicator if multiple documents are pending -->
          <span class="text-caption text-grey" v-if="pendingVersions.length > 1">
            خطوة {{ currentIndex + 1 }} من {{ pendingVersions.length }}
          </span>
          <span v-else></span>

          <v-btn
            color="primary"
            variant="flat"
            size="large"
            class="rounded-lg px-10 font-weight-bold"
            :disabled="!agreed"
            :loading="submitting"
            @click="acceptCurrentVersion"
          >
            {{ isLastStep ? 'أوافق والدخول للوحة التحكم' : 'أوافق والمتابعة' }}
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import apiClient from '@/services/api';
import { toast } from 'vue3-toastify';

const visible = ref(false);
const pendingVersions = ref([]);
const currentIndex = ref(0);
const agreed = ref(false);
const submitting = ref(false);

const currentVersion = computed(() => {
  if (pendingVersions.value.length === 0 || currentIndex.value >= pendingVersions.value.length) {
    return null;
  }
  return pendingVersions.value[currentIndex.value];
});

const isLastStep = computed(() => {
  return currentIndex.value === pendingVersions.value.length - 1;
});

// Check if user has pending legal agreements
const checkPendingAgreements = async () => {
  // Check if user token exists in localStorage
  const token = localStorage.getItem('authToken');
  if (!token) return;

  try {
    const url = 'v1/legal/acceptances/pending';
    const response = await apiClient.get(url);
    if (response.data && response.data.status) {
      pendingVersions.value = response.data.data;
      if (pendingVersions.value.length > 0) {
        currentIndex.value = 0;
        agreed.value = false;
        visible.value = true;
      } else {
        visible.value = false;
      }
    }
  } catch (err) {
    console.error('Failed to check pending legal agreements:', err);
  }
};

// Accept currently viewed version
const acceptCurrentVersion = async () => {
  if (!currentVersion.value || !agreed.value) return;

  submitting.value = true;
  try {
    const url = 'v1/legal/acceptances';
    const response = await apiClient.post(url, {
      version_id: currentVersion.value.id
    });

    if (response.data && response.data.status) {
      toast.success(`تم تسجيل موافقتك على: ${currentVersion.value.title}`);
      
      // Move to next document or complete
      if (isLastStep.value) {
        visible.value = false;
        pendingVersions.value = [];
      } else {
        currentIndex.value++;
        agreed.value = false;
      }
    }
  } catch (err) {
    console.error('Failed to accept legal version:', err);
    toast.error('لم نتمكن من حفظ موافقتك، يرجى المحاولة مرة أخرى.');
  } finally {
    submitting.value = false;
  }
};

// Expose checks so route guards or main layout can trigger it
defineExpose({
  checkPendingAgreements
});

onMounted(() => {
  checkPendingAgreements();
});
</script>

<script>
// تعليق عربي لقواعد الكلاسات: مكون يظهر كبطاقة منبثقة إجبارية لحظر واجهة التطبيق حتى يوافق المستخدم على الشروط الجديدة.
</script>

<style scoped>
.gap-2 { gap: 8px; }
.gap-4 { gap: 16px; }

.block-sm {
  display: inline;
}

@media (max-width: 600px) {
  .block-sm {
    display: block;
    margin-right: 0 !important;
    margin-top: 4px;
  }
}

.legal-document-text {
  line-height: 2;
}
.legal-document-text :deep(p) {
  margin-bottom: 16px;
}
.legal-document-text :deep(h2) {
  font-size: 1.3rem;
  font-weight: 700;
  color: #1a3d8f;
  margin-top: 30px;
  margin-bottom: 12px;
}
.legal-document-text :deep(ul) {
  margin-bottom: 16px;
  padding-right: 20px;
}
</style>
