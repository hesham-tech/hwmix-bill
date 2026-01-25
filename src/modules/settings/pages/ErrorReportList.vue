<template>
  <div class="error-reports-page">
    <div class="page-header mb-6">
      <h1 class="text-h4 font-weight-bold ml-2">تقارير الأعطال</h1>
      <p class="text-body-1 text-grey">متابعة وتحليل المشاكل التقنية التي واجهها المستخدمون</p>
    </div>

    <AppDataTable
      title="سجل الأعطال"
      icon="ri-bug-line"
      :headers="headers"
      :items="reports"
      :total-items="total"
      :loading="loading"
      v-model:page="page"
      v-model:items-per-page="itemsPerPage"
      v-model:search="search"
      :searchable="true"
      :show-actions="false"
      class="text-no-wrap clickable-rows"
      @update:options="onTableOptionsUpdate"
      @click:row="showDetails"
    >
      <!-- Severity Column -->
      <template #[`item.severity`]="{ item }">
        <v-chip :color="getSeverityColor(item.severity)" size="small" variant="flat" class="font-weight-bold">
          {{ getSeverityLabel(item.severity) }}
        </v-chip>
      </template>

      <!-- Status Column -->
      <template #[`item.status`]="{ item }">
        <v-select
          v-model="item.status"
          :items="statusOptions"
          item-title="title"
          item-value="value"
          density="compact"
          variant="plain"
          hide-details
          class="status-select"
          :loading="updatingStatusId === item.id"
          @update:model-value="updateStatus(item)"
          @click.stop
        >
          <template #selection="{ item: selected }">
            <v-chip :color="getStatusColor(selected.value)" size="x-small" variant="tonal">
              {{ selected.title }}
            </v-chip>
          </template>
        </v-select>
      </template>

      <!-- User Column -->
      <template #[`item.user`]="{ item }">
        <div v-if="item.user" class="d-flex align-center">
          <AppAvatar :img-url="item.user.avatar_url" :name="item.user.name" type="user" size="28" class="me-2 border" />
          <div class="d-flex flex-column">
            <span class="text-body-2 font-weight-medium">{{ item.user.name }}</span>
            <span v-if="item.company" class="text-caption text-grey"> <v-icon icon="ri-building-line" size="10" /> {{ item.company.name }} </span>
          </div>
        </div>
        <span v-else class="text-grey text-caption">زائر (Guest)</span>
      </template>

      <!-- Type/Message Column -->
      <template #[`item.message`]="{ item }">
        <div class="d-flex flex-column max-width-300">
          <span class="text-body-2 font-weight-bold text-truncate">{{ item.message }}</span>
          <span class="text-caption text-primary">{{ item.type }}</span>
        </div>
      </template>

      <!-- Tech Info Column -->
      <template #[`item.tech`]="{ item }">
        <div class="d-flex align-center gap-2">
          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-icon v-bind="props" :icon="getBrowserIcon(item.browser)" size="18" color="grey-darken-1" />
            </template>
            <span>{{ item.browser }}</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template #activator="{ props }">
              <v-icon v-bind="props" :icon="getOSIcon(item.os)" size="18" color="grey-darken-1" />
            </template>
            <span>{{ item.os }}</span>
          </v-tooltip>
        </div>
      </template>

      <!-- Date Column -->
      <template #[`item.created_at`]="{ item }">
        <div class="d-flex flex-column">
          <span class="text-body-2">{{ formatDate(item.created_at).date }}</span>
          <span class="text-caption text-grey">{{ formatDate(item.created_at).time }}</span>
        </div>
      </template>

      <template #[`item.actions`]="{ item }">
        <AppButton icon="ri-eye-line" variant="text" size="small" color="primary" @click="showDetails(item)" />
      </template>
    </AppDataTable>

    <!-- Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="900px" scrollable>
      <v-card v-if="selectedReport" rounded="xl">
        <v-card-title class="d-flex justify-space-between align-center border-bottom pa-4">
          <div class="d-flex align-center">
            <v-icon icon="ri-bug-line" class="me-2 text-error" />
            <span class="font-weight-bold">تفاصيل الخطأ #{{ selectedReport.id }}</span>
          </div>
          <v-btn icon="ri-close-line" variant="text" size="small" @click="detailsDialog = false" />
        </v-card-title>

        <v-card-text class="pa-6">
          <v-row>
            <!-- Basic Info -->
            <v-col cols="12" md="8">
              <div class="mb-4">
                <div class="text-overline text-grey">رسالة الخطأ</div>
                <div class="text-h6 font-weight-bold text-error">{{ selectedReport.message }}</div>
              </div>

              <div class="mb-4">
                <div class="text-overline text-grey">الرابط المتأثر</div>
                <v-chip size="small" color="primary" variant="tonal" class="mt-1" ltr>
                  {{ selectedReport.url }}
                </v-chip>
              </div>
            </v-col>

            <v-col cols="12" md="4">
              <v-card variant="outlined" class="pa-3 bg-grey-lighten-5">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-caption text-grey">الأهمية:</span>
                  <v-chip :color="getSeverityColor(selectedReport.severity)" size="x-small">
                    {{ getSeverityLabel(selectedReport.severity) }}
                  </v-chip>
                </div>
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-caption text-grey">الحالة:</span>
                  <v-chip :color="getStatusColor(selectedReport.status)" size="x-small">
                    {{ getStatusLabel(selectedReport.status) }}
                  </v-chip>
                </div>
                <div class="d-flex align-center justify-space-between">
                  <span class="text-caption text-grey">الوقت:</span>
                  <span class="text-caption">{{ formatDate(selectedReport.created_at).full }}</span>
                </div>
              </v-card>
            </v-col>

            <!-- User Notes -->
            <v-col cols="12" v-if="selectedReport.user_notes">
              <v-alert color="info" variant="tonal" icon="ri-chat-voice-line" class="mb-4 pa-3">
                <div class="text-caption font-weight-bold">ملاحظات المستخدم:</div>
                <div class="text-body-2">{{ selectedReport.user_notes }}</div>
              </v-alert>
            </v-col>

            <!-- Device Info -->
            <v-col cols="12">
              <h3 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
                <v-icon icon="ri-computer-line" class="me-2" size="20" />
                معلومات البيئة (Environment)
              </h3>
              <v-row dense>
                <v-col cols="6" sm="3">
                  <v-sheet border rounded class="pa-2 text-center">
                    <v-icon :icon="getBrowserIcon(selectedReport.browser)" size="24" color="primary" />
                    <div class="text-caption mt-1">{{ selectedReport.browser }}</div>
                  </v-sheet>
                </v-col>
                <v-col cols="6" sm="3">
                  <v-sheet border rounded class="pa-2 text-center">
                    <v-icon :icon="getOSIcon(selectedReport.os)" size="24" color="info" />
                    <div class="text-caption mt-1">{{ selectedReport.os }}</div>
                  </v-sheet>
                </v-col>
              </v-row>
            </v-col>

            <!-- Screenshot Section -->
            <v-col cols="12" v-if="selectedReport.screenshot_url">
              <h3 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
                <v-icon icon="ri-image-line" class="me-2" size="20" />
                لقطة الشاشة (Screenshot)
              </h3>
              <v-card border rounded="lg" class="pa-2 bg-grey-lighten-4">
                <v-img
                  :src="selectedReport.screenshot_url"
                  max-height="400"
                  width="100%"
                  class="rounded cursor-pointer shadow-sm"
                  @click="openFullScreenshot(selectedReport.screenshot_url)"
                >
                  <template #placeholder>
                    <v-row class="fill-height ma-0" align="center" justify="center">
                      <v-progress-circular indeterminate color="primary" />
                    </v-row>
                  </template>
                </v-img>
              </v-card>
            </v-col>

            <!-- Stack Trace -->
            <v-col cols="12" v-if="selectedReport.stack_trace">
              <h3 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
                <v-icon icon="ri-code-line" class="me-2" size="20" />
                تتبع الخطأ (Stack Trace)
              </h3>
              <v-sheet dark class="bg-grey-darken-4 pa-4 rounded-lg overflow-x-auto">
                <pre class="text-caption text-white ltr">{{ selectedReport.stack_trace }}</pre>
              </v-sheet>
            </v-col>

            <!-- Payload / Extra Data -->
            <v-col cols="12" v-if="selectedReport.payload">
              <h3 class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
                <v-icon icon="ri-database-line" class="me-2" size="20" />
                حمولة البيانات (Payload)
              </h3>
              <v-sheet border rounded class="pa-0 bg-grey-lighten-4 overflow-hidden">
                <div class="text-caption pa-4 ltr">
                  <pre>{{ JSON.stringify(selectedReport.payload, null, 2) }}</pre>
                </div>
              </v-sheet>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4 border-top">
          <v-spacer />
          <AppButton color="grey-darken-1" variant="text" @click="detailsDialog = false">إغلاق</AppButton>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Full Image Preview Dialog -->
    <v-dialog v-model="screenshotPreviewDialog" max-width="95%">
      <v-card class="pa-2 overflow-hidden shadow-24" rounded="xl">
        <div class="d-flex justify-end pa-2">
          <v-btn icon="ri-close-line" variant="text" @click="screenshotPreviewDialog = false" />
        </div>
        <v-img :src="previewImageUrl" width="100%" height="auto" class="rounded-lg" />
        <v-card-actions class="justify-center pa-4">
          <v-btn color="primary" variant="tonal" prepend-icon="ri-download-line" :href="previewImageUrl" download> تحميل الصورة </v-btn>
          <v-btn color="grey" variant="text" @click="screenshotPreviewDialog = false"> إغلاق </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useApi } from '@/composables/useApi';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppButton from '@/components/common/AppButton.vue';

const api = useApi('/api/error-reports');

const reports = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(15);
const search = ref('');
const updatingStatusId = ref(null);
const detailsDialog = ref(false);
const selectedReport = ref(null);

const screenshotPreviewDialog = ref(false);
const previewImageUrl = ref('');

const openFullScreenshot = url => {
  previewImageUrl.value = url;
  screenshotPreviewDialog.value = true;
};

const headers = [
  { title: 'الأهمية', key: 'severity', width: '100px' },
  { title: 'المستخدم', key: 'user' },
  { title: 'الخطأ', key: 'message' },
  { title: 'البيئة', key: 'tech', align: 'center', width: '80px' },
  { title: 'الحالة', key: 'status', width: '150px' },
  { title: 'التاريخ', key: 'created_at', width: '120px' },
  { title: 'إجراءات', key: 'actions', align: 'end', sortable: false },
];

const statusOptions = [
  { title: 'قيد الانتظار', value: 'pending' },
  { title: 'قيد المراجعة', value: 'in_review' },
  { title: 'تم الإصلاح', value: 'resolved' },
  { title: 'تجاهل', value: 'ignored' },
];

const getSeverityColor = s => {
  const colors = { low: 'success', medium: 'warning', high: 'error', critical: 'deep-purple' };
  return colors[s] || 'grey';
};

const getSeverityLabel = s => {
  const labels = { low: 'منخفضة', medium: 'متوسطة', high: 'عالية', critical: 'حرجة' };
  return labels[s] || s;
};

const getStatusColor = s => {
  const colors = { pending: 'error', in_review: 'warning', resolved: 'success', ignored: 'grey' };
  return colors[s] || 'grey';
};

const getStatusLabel = s => {
  const option = statusOptions.find(o => o.value === s);
  return option ? option.title : s;
};

const getBrowserIcon = b => {
  if (!b) return 'ri-global-line';
  const ua = b.toLowerCase();
  if (ua.includes('chrome')) return 'ri-chrome-line';
  if (ua.includes('firefox')) return 'ri-firefox-line';
  if (ua.includes('safari')) return 'ri-safari-line';
  if (ua.includes('edge')) return 'ri-edge-line';
  return 'ri-global-line';
};

const getOSIcon = os => {
  if (!os) return 'ri-computer-line';
  const val = os.toLowerCase();
  if (val.includes('windows')) return 'ri-windows-fill';
  if (val.includes('mac') || val.includes('os x')) return 'ri-apple-fill';
  if (val.includes('linux')) return 'ri-ubuntu-fill';
  if (val.includes('android')) return 'ri-android-fill';
  if (val.includes('ios')) return 'ri-smartphone-line';
  return 'ri-computer-line';
};

const formatDate = date => {
  if (!date) return { date: '-', time: '', full: '-' };
  const d = new Date(date);
  return {
    date: d.toLocaleDateString('ar-EG'),
    time: d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    full: d.toLocaleString('ar-EG'),
  };
};

const onTableOptionsUpdate = options => {
  page.value = options.page;
  itemsPerPage.value = options.itemsPerPage;
  loadData();
};

watch(search, () => {
  page.value = 1;
  loadData();
});

const loadData = async () => {
  loading.value = true;
  try {
    const response = await api.get(
      {
        page: page.value,
        per_page: itemsPerPage.value,
        search: search.value,
        sort_by: 'created_at',
        sort_order: 'desc',
      },
      { showLoading: false }
    );
    reports.value = response.data || [];
    total.value = response.total || 0;
  } catch (error) {
    console.error('Error loading error reports:', error);
  } finally {
    loading.value = false;
  }
};

const updateStatus = async item => {
  updatingStatusId.value = item.id;
  try {
    await api.patch(item.id, { status: item.status });
  } catch (error) {
    console.error('Failed to update status:', error);
    // Revert status on failure?
    loadData();
  } finally {
    updatingStatusId.value = null;
  }
};

const showDetails = item => {
  selectedReport.value = item;
  detailsDialog.value = true;
};

onMounted(loadData);
</script>

<style scoped>
.error-reports-page {
  padding: 24px;
}

.clickable-rows :deep(tbody tr) {
  cursor: pointer;
  transition: background-color 0.2s;
}

.clickable-rows :deep(tbody tr:hover) {
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
}

.max-width-300 {
  max-width: 300px;
}

.ltr {
  direction: ltr;
  text-align: left;
}

.status-select :deep(.v-field__input) {
  padding: 4px 8px;
  min-height: auto;
}

.border-bottom {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.border-top {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.gap-2 {
  gap: 8px;
}
</style>
