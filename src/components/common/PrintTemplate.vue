<template>
  <div class="print-container" id="print-area">
    <!-- Invoice/Report Header -->
    <div class="print-header d-flex justify-space-between align-start mb-8">
      <div class="company-brand">
        <h1 class="text-h4 font-weight-bold mb-1">{{ settings.company_name || 'وجدي العربي' }}</h1>
        <p class="text-subtitle-1 mb-0">{{ settings.company_address || 'العنوان غير محدد' }}</p>
        <p class="text-subtitle-2">هاتف: {{ settings.company_phone || '01007888009' }}</p>
      </div>

      <div class="document-meta text-left">
        <h2 class="text-h5 font-weight-bold text-uppercase mb-2">{{ title }}</h2>
        <div class="d-flex justify-space-between gap-4">
          <span class="font-weight-bold">الرقم:</span>
          <span>{{ reference }}</span>
        </div>
        <div class="d-flex justify-space-between gap-4">
          <span class="font-weight-bold">التاريخ:</span>
          <span>{{ date }}</span>
        </div>
      </div>
    </div>

    <v-divider class="my-6 border-opacity-50" />

    <!-- Document Body -->
    <div class="document-content">
      <slot />
    </div>

    <!-- Signatures / Footer -->
    <div class="print-footer mt-12 pt-8 border-t">
      <v-row>
        <v-col cols="4" class="text-center">
          <div class="text-subtitle-2 mb-8">توقيع المستلم</div>
          <div class="border-b-thin w-75 mx-auto"></div>
        </v-col>
        <v-col cols="4" class="text-center">
          <div class="text-subtitle-2 mb-8">الختم</div>
          <div
            class="stamp-placeholder mx-auto border-dashed rounded-circle py-8 px-4"
            style="width: 100px; height: 100px; border: 2px dashed #ccc"
          ></div>
        </v-col>
        <v-col cols="4" class="text-center">
          <div class="text-subtitle-2 mb-8">توقيع المحاسب</div>
          <div class="border-b-thin w-75 mx-auto"></div>
        </v-col>
      </v-row>

      <div class="text-center mt-12 text-disable text-caption">
        طبع بواسطة نظام وجدي العربي للمبيعات - {{ new Date().toLocaleString('en-US').replace(/,/g, "'") }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useApi } from '@/composables/useApi';

const props = defineProps({
  title: { type: String, default: 'مستند' },
  reference: { type: String, default: '---' },
  date: { type: String, default: () => new Date().toLocaleDateString('en-US').replace(/,/g, "'") },
});

const settingsApi = useApi('/api/settings');
const settings = ref({});

onMounted(async () => {
  const res = await settingsApi.get({}, { showLoading: false, showError: false });
  settings.value = res.data || {};
});
</script>

<style scoped>
.print-container {
  padding: 40px;
  background: white;
  color: black;
  font-family: 'Inter', 'Roboto', sans-serif;
  direction: rtl;
}

@media print {
  .print-container {
    padding: 0;
  }

  /* Ensure colors and backgrounds are printed */
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}

.text-left {
  text-align: left;
}

.gap-4 {
  gap: 1rem;
}

.border-t {
  border-top: 1px solid #eee;
}

.border-b-thin {
  border-bottom: 1px solid #333;
}
</style>
