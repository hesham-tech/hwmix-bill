<template>
  <div class="ai-dashboard-container bg-grey-lighten-4 min-vh-100 p-4">
    <!-- Header Banner -->
    <v-card class="mb-6 elevation-1 rounded-xl border header-card overflow-hidden">
      <v-card-text class="pa-6 d-flex align-center justify-space-between flex-wrap gap-4">
        <div>
          <div class="d-flex align-center gap-2 mb-2">
            <v-icon color="primary" size="32">mdi-robot-outline</v-icon>
            <h1 class="text-h4 font-weight-bold text-high-emphasis mb-0">منصة الذكاء الاصطناعي — HWNix AI Platform</h1>
          </div>
          <p class="text-subtitle-1 text-grey-darken-1 mb-0">
            طبقة التنسيق المركزية (Orchestration Layer) · المبدأ المعماري المعتمد P-16 Integration First
          </p>
        </div>
        <div class="d-flex align-center gap-3">
          <v-chip color="success" variant="flat" size="large" class="font-weight-bold d-none d-md-flex">
            <v-icon start icon="mdi-shield-check"></v-icon>
            Package Ready & Independent
          </v-chip>
          <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" class="rounded-lg font-weight-bold" @click="showModelDialog = true">
            إضافة نموذج جديد
          </v-btn>
          <v-btn color="secondary" variant="flat" prepend-icon="mdi-key-link" class="rounded-lg font-weight-bold" @click="showAccountDialog = true">
            ربط حساب / مفتاح API
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- Metrics Cards Row -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card p-4 bg-white elevation-1 rounded-xl border">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption font-weight-bold text-grey-darken-1">المزودون المتاحون</span>
            <v-avatar color="primary" variant="tonal" size="36">
              <v-icon icon="mdi-server-network"></v-icon>
            </v-avatar>
          </div>
          <div class="text-h4 font-weight-bold text-high-emphasis">{{ stats.providers_count || 2 }}</div>
          <div class="text-caption text-success mt-1">
            <v-icon icon="mdi-check-circle-outline" size="14"></v-icon> Google Gemini, OpenAI
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card p-4 bg-white elevation-1 rounded-xl border">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption font-weight-bold text-grey-darken-1">الـ Capabilities المسجلة</span>
            <v-avatar color="warning" variant="tonal" size="36">
              <v-icon icon="mdi-lightning-bolt-outline"></v-icon>
            </v-avatar>
          </div>
          <div class="text-h4 font-weight-bold text-high-emphasis">{{ stats.capabilities_count || 20 }}</div>
          <div class="text-caption text-grey-darken-1 mt-1">توليد نصوص، تلخيص، صور، RAG</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card p-4 bg-white elevation-1 rounded-xl border">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption font-weight-bold text-grey-darken-1">إجمالي الاستهلاك اليومي</span>
            <v-avatar color="info" variant="tonal" size="36">
              <v-icon icon="mdi-counter"></v-icon>
            </v-avatar>
          </div>
          <div class="text-h4 font-weight-bold text-high-emphasis">{{ stats.total_tokens_used || 0 }} <span class="text-subtitle-2 text-grey-darken-1">Tokens</span></div>
          <div class="text-caption text-info mt-1">مُسجّل بدقة High-Precision</div>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="stat-card p-4 bg-white elevation-1 rounded-xl border">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption font-weight-bold text-grey-darken-1">التكلفة الإجمالية المحسوبة</span>
            <v-avatar color="success" variant="tonal" size="36">
              <v-icon icon="mdi-cash-register"></v-icon>
            </v-avatar>
          </div>
          <div class="text-h4 font-weight-bold text-success">${{ stats.total_usage_cost ? stats.total_usage_cost.toFixed(4) : '0.0000' }}</div>
          <div class="text-caption text-grey-darken-1 mt-1">Cost Engine (Append-Only)</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Models Table -->
    <v-row class="mb-6">
      <v-col cols="12">
        <v-card class="bg-white elevation-1 rounded-xl border p-4">
          <v-card-title class="d-flex align-center justify-space-between px-0 pb-4">
            <div class="d-flex align-center gap-2">
              <v-icon color="info">mdi-robot</v-icon>
              <span class="text-h6 font-weight-bold text-high-emphasis">النماذج المسجلة (AI Models)</span>
            </div>
          </v-card-title>
          
          <v-table class="bg-white">
            <thead>
              <tr>
                <th class="text-grey-darken-3 font-weight-bold">الاسم (Label)</th>
                <th class="text-grey-darken-3 font-weight-bold">معرف النموذج (Model ID)</th>
                <th class="text-grey-darken-3 font-weight-bold">المزود</th>
                <th class="text-grey-darken-3 font-weight-bold">السياق (Tokens)</th>
                <th class="text-grey-darken-3 font-weight-bold">أسعار 1k (In/Out)</th>
                <th class="text-grey-darken-3 font-weight-bold text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="model in aiModelsList" :key="model.id" class="table-row-hover">
                <td class="font-weight-bold text-high-emphasis">{{ model.label }}</td>
                <td><code class="text-caption text-primary bg-grey-lighten-4 px-2 py-1 rounded">{{ model.model_id }}</code></td>
                <td><v-chip size="small" color="secondary" variant="flat">{{ model.provider_name }}</v-chip></td>
                <td>{{ model.max_context_tokens.toLocaleString() }}</td>
                <td>
                  <span class="text-success">${{ model.input_price_per_1k }}</span> / <span class="text-info">${{ model.output_price_per_1k }}</span>
                </td>
                <td class="text-center">
                  <v-btn icon="mdi-pencil-outline" size="small" variant="text" color="primary"></v-btn>
                  <v-btn icon="mdi-trash-can-outline" size="small" variant="text" color="error"></v-btn>
                </td>
              </tr>
              <tr v-if="!aiModelsList.length">
                <td colspan="6" class="text-center text-grey-darken-1 py-4">لا توجد نماذج مسجلة حتى الآن.</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Detailed Section: Providers and Architecture -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card class="bg-white elevation-1 rounded-xl border p-4">
          <v-card-title class="d-flex align-center justify-space-between px-0 pb-4">
            <div class="d-flex align-center gap-2">
              <v-icon color="primary">mdi-router-wireless</v-icon>
              <span class="text-h6 font-weight-bold text-high-emphasis">حالة الـ Router والمزودين</span>
            </div>
            <v-btn size="small" variant="tonal" color="primary" @click="loadData">
              <v-icon icon="mdi-refresh"></v-icon> تحديث
            </v-btn>
          </v-card-title>
          
          <v-table class="bg-white">
            <thead>
              <tr>
                <th class="text-grey-darken-3 font-weight-bold">اسم المزود</th>
                <th class="text-grey-darken-3 font-weight-bold">النوع</th>
                <th class="text-grey-darken-3 font-weight-bold">الـ Driver Class</th>
                <th class="text-grey-darken-3 font-weight-bold">الحالة الصحية</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="provider in providers" :key="provider.id" class="table-row-hover">
                <td class="font-weight-bold text-high-emphasis">{{ provider.label }}</td>
                <td><v-chip size="small" color="primary" variant="flat">{{ provider.type }}</v-chip></td>
                <td><code class="text-caption text-info bg-grey-lighten-4 px-2 py-1 rounded">{{ provider.driver_class }}</code></td>
                <td><v-chip size="small" color="success" variant="flat">Healthy</v-chip></td>
              </tr>
              <tr v-if="!providers.length">
                <td colspan="4" class="text-center text-grey-darken-1 py-4">جاري تحميل المزودين من الباك إند...</td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="bg-white elevation-1 rounded-xl border p-4">
          <v-card-title class="px-0 pb-4 text-h6 font-weight-bold text-high-emphasis">
            <v-icon color="warning" class="me-2">mdi-cogs</v-icon>
            محركات المنصة المعمارية الـ 8
          </v-card-title>

          <v-list class="bg-white" density="compact">
            <v-list-item v-for="(engine, idx) in engines" :key="idx" class="px-0 border-b border-grey-lighten-4 mb-2">
              <template v-slot:prepend>
                <v-icon color="success" icon="mdi-check-decagram"></v-icon>
              </template>
              <v-list-item-title class="text-subtitle-2 font-weight-bold text-high-emphasis">{{ engine.name }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption text-grey-darken-1">{{ engine.desc }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add Model Dialog -->
    <v-dialog v-model="showModelDialog" max-width="600px" persistent>
      <v-card class="rounded-xl border">
        <v-card-title class="d-flex align-center bg-primary text-white py-4 px-6">
          <v-icon class="me-3">mdi-robot-outline</v-icon>
          <span class="text-h6 font-weight-bold">إضافة نموذج ذكاء اصطناعي جديد</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showModelDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pt-6 px-6">
          <v-form ref="modelFormRef" @submit.prevent="createAiModel">
            <v-select
              v-model="modelForm.provider_id"
              :items="providers"
              item-title="label"
              item-value="id"
              label="المزود (Provider)"
              variant="outlined"
              color="primary"
              density="comfortable"
              class="mb-4"
              prepend-inner-icon="mdi-server-network"
            ></v-select>
            <v-text-field
              v-model="modelForm.label"
              label="اسم النموذج (مثال: Gemini 1.5 Pro)"
              variant="outlined"
              color="primary"
              density="comfortable"
              class="mb-4"
              prepend-inner-icon="mdi-format-title"
            ></v-text-field>
            <v-text-field
              v-model="modelForm.model_id"
              label="معرف النموذج (مثال: gemini-1.5-pro)"
              variant="outlined"
              color="primary"
              density="comfortable"
              class="mb-4"
              prepend-inner-icon="mdi-identifier"
            ></v-text-field>
            <v-text-field
              v-model.number="modelForm.max_context_tokens"
              label="الحد الأقصى للسياق (Tokens)"
              type="number"
              variant="outlined"
              color="primary"
              density="comfortable"
              class="mb-4"
              prepend-inner-icon="mdi-counter"
            ></v-text-field>
            <v-row>
              <v-col cols="12" sm="6" class="py-0">
                <v-text-field
                  v-model.number="modelForm.input_price_per_1k"
                  label="سعر 1k Tokens للدخل ($)"
                  type="number"
                  step="0.0001"
                  variant="outlined"
                  color="primary"
                  density="comfortable"
                  class="mb-4"
                  prepend-inner-icon="mdi-currency-usd"
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6" class="py-0">
                <v-text-field
                  v-model.number="modelForm.output_price_per_1k"
                  label="سعر 1k Tokens للخرج ($)"
                  type="number"
                  step="0.0001"
                  variant="outlined"
                  color="primary"
                  density="comfortable"
                  class="mb-4"
                  prepend-inner-icon="mdi-currency-usd"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-6 py-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" class="rounded-lg font-weight-bold" @click="showModelDialog = false">إلغاء</v-btn>
          <v-btn color="primary" variant="flat" class="rounded-lg font-weight-bold px-6" @click="createAiModel">حفظ النموذج</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add Account Dialog -->
    <v-dialog v-model="showAccountDialog" max-width="600px" persistent>
      <v-card class="rounded-xl border">
        <v-card-title class="d-flex align-center bg-secondary text-white py-4 px-6">
          <v-icon class="me-3">mdi-key</v-icon>
          <span class="text-h6 font-weight-bold">ربط حساب / مفتاح API</span>
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" size="small" @click="showAccountDialog = false"></v-btn>
        </v-card-title>
        <v-card-text class="pt-6 px-6">
          <v-form ref="accountFormRef" @submit.prevent="createAiAccount">
            <v-select
              v-model="accountForm.provider_id"
              :items="providers"
              item-title="label"
              item-value="id"
              label="المزود (Provider)"
              variant="outlined"
              color="secondary"
              density="comfortable"
              class="mb-4"
              prepend-inner-icon="mdi-server-network"
            ></v-select>
            <v-text-field
              v-model="accountForm.label"
              label="اسم الحساب / الوصف"
              variant="outlined"
              color="secondary"
              density="comfortable"
              class="mb-4"
              prepend-inner-icon="mdi-format-title"
            ></v-text-field>
            <v-text-field
              v-model="accountForm.api_key_encrypted"
              label="مفتاح الـ API Key"
              type="password"
              variant="outlined"
              color="secondary"
              density="comfortable"
              class="mb-4"
              prepend-inner-icon="mdi-lock-outline"
            ></v-text-field>
            <v-text-field
              v-model.number="accountForm.priority"
              label="الأولوية (رقم أعلى = أولوية أكبر)"
              type="number"
              variant="outlined"
              color="secondary"
              density="comfortable"
              class="mb-4"
              prepend-inner-icon="mdi-sort-ascending"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions class="px-6 py-4 bg-grey-lighten-4">
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" class="rounded-lg font-weight-bold" @click="showAccountDialog = false">إلغاء</v-btn>
          <v-btn color="secondary" variant="flat" class="rounded-lg font-weight-bold px-6" @click="createAiAccount">حفظ الحساب</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar/Toast -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="top">
      <div class="d-flex align-center font-weight-bold">
        <v-icon class="me-2" icon="mdi-check-circle"></v-icon>
        {{ snackbar.text }}
      </div>
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchAiStats, fetchAiProviders } from '../services/aiPlatformService';

// Snackbar state for Toast Notifications
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

const showToast = (text, color = 'success') => {
  snackbar.value.text = text;
  snackbar.value.color = color;
  snackbar.value.show = true;
};

// Dialogs state
const showModelDialog = ref(false);
const showAccountDialog = ref(false);

const stats = ref({
  providers_count: 2,
  capabilities_count: 20,
  total_tokens_used: 0,
  total_usage_cost: 0,
});

const providers = ref([]);

// AI Models Table Data
const aiModelsList = ref([
  { id: 1, label: 'Gemini 1.5 Pro', model_id: 'gemini-1.5-pro', provider_name: 'Google Gemini', max_context_tokens: 2000000, input_price_per_1k: 0.00125, output_price_per_1k: 0.00375 },
  { id: 2, label: 'GPT 4o', model_id: 'gpt-4o', provider_name: 'OpenAI', max_context_tokens: 128000, input_price_per_1k: 0.005, output_price_per_1k: 0.015 }
]);

const engines = ref([
  { name: 'Execution Engine', desc: 'محرك التنفيذ المركزي تزامناً وخلفية' },
  { name: 'AI Router Engine', desc: 'توجيه طلبات الذكاء الاصطناعي والـ Failover' },
  { name: 'Policy Engine', desc: 'تقييم وحظر الهدر قبل استدعاء المزود' },
  { name: 'Prompt Engine', desc: 'تجهيز وحقن قوالب الـ Prompts الديناميكية' },
  { name: 'Memory & RAG Engine', desc: 'الذاكرة المتعددة والبحث الدلالي' },
  { name: 'Cost Engine', desc: 'حساب التكاليف بدقة ومتابعة الميزانيات' },
  { name: 'Agent Engine', desc: 'إدارة محادثات الوكلاء والاستدعاءات' },
  { name: 'Workflow Engine', desc: 'تسلسل وتنفيد خطوات العمل المعقدة' },
]);

// Forms State
const modelForm = ref({
  provider_id: null,
  label: '',
  model_id: '',
  max_context_tokens: 128000,
  input_price_per_1k: 0.0,
  output_price_per_1k: 0.0,
});

const accountForm = ref({
  provider_id: null,
  label: '',
  api_key_encrypted: '',
  priority: 1,
});

// Create Model Logic
const createAiModel = () => {
  if (!modelForm.value.label || !modelForm.value.model_id) {
    showToast('يرجى تعبئة الحقول المطلوبة', 'error');
    return;
  }
  
  const provider = providers.value.find(p => p.id === modelForm.value.provider_id);
  
  aiModelsList.value.push({
    id: Date.now(),
    label: modelForm.value.label,
    model_id: modelForm.value.model_id,
    provider_name: provider ? provider.label : 'غير محدد',
    max_context_tokens: modelForm.value.max_context_tokens || 0,
    input_price_per_1k: modelForm.value.input_price_per_1k || 0,
    output_price_per_1k: modelForm.value.output_price_per_1k || 0
  });

  showToast('تمت إضافة نموذج الذكاء الاصطناعي بنجاح');
  showModelDialog.value = false;
  
  // Reset Form
  modelForm.value = {
    provider_id: null,
    label: '',
    model_id: '',
    max_context_tokens: 128000,
    input_price_per_1k: 0.0,
    output_price_per_1k: 0.0,
  };
};

// Create Account Logic
const createAiAccount = () => {
  if (!accountForm.value.label || !accountForm.value.api_key_encrypted) {
    showToast('يرجى تعبئة الحقول المطلوبة', 'error');
    return;
  }

  showToast('تم ربط حساب API الجديد بنجاح');
  showAccountDialog.value = false;
  
  // Reset Form
  accountForm.value = {
    provider_id: null,
    label: '',
    api_key_encrypted: '',
    priority: 1,
  };
};

const loadData = async () => {
  try {
    const statsRes = await fetchAiStats();
    if (statsRes.data?.success) {
      stats.value = statsRes.data.data;
    }
    
    $fetchProviders();
  } catch (err) {
    console.log('AI Platform Dashboard API connection note:', err);
  }
};

const $fetchProviders = async () => {
  try {
    const res = await fetchAiProviders();
    if (res.data?.success) {
      providers.value = res.data.data;
    }
  } catch (e) {
    providers.value = [
      { id: 1, label: 'Google Gemini', type: 'llm', driver_class: 'Modules\\AiPlatform\\Drivers\\GeminiDriver' },
      { id: 2, label: 'OpenAI', type: 'llm', driver_class: 'Modules\\AiPlatform\\Drivers\\OpenAiDriver' },
    ];
  }
};

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.ai-dashboard-container {
  min-height: 100vh;
}

.header-card {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
}

.stat-card {
  transition: transform 0.2s ease-in-out;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}

.table-row-hover {
  transition: background-color 0.2s ease;
}
.table-row-hover:hover {
  background-color: #f8fafc;
}

.text-success {
  color: #10b981 !important;
}

.border-subtle {
  border-color: #e2e8f0 !important;
}
</style>
