<template>
  <div class="customer-dashboard pa-4 pa-sm-6">
    <!-- Welcome Header -->
    <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-center mb-8 gap-4">
      <div>
        <h1 class="text-h3 font-weight-bold primary-gradient-text mb-2">{{ dynamicGreeting }}, {{ userName }}!</h1>
        <p class="text-subtitle-1 text-grey-darken-1">نظرة سريعة على جميع نشاطاتك المالية ومشترياتك</p>
      </div>
      <div class="d-flex gap-3 align-center">
        <!-- Customization Mode Controls -->
        <template v-if="isCustomizing">
          <v-btn
            color="error"
            prepend-icon="ri-refresh-line"
            variant="outlined"
            @click="resetToDefaults"
            class="rounded-md font-weight-bold"
            height="48"
          >
            إعادة الضبط
          </v-btn>
          <v-btn
            color="success"
            prepend-icon="ri-check-line"
            variant="flat"
            @click="saveCustomization"
            :loading="saving"
            class="rounded-md font-weight-bold"
            height="48"
          >
            حفظ وإغلاق
          </v-btn>
        </template>

        <!-- Normal State Controls -->
        <template v-else>
          <v-btn
            prepend-icon="ri-dashboard-line"
            variant="outlined"
            color="primary"
            class="rounded-md font-weight-bold"
            height="48"
            @click="startCustomization"
          >
            تخصيص الواجهة
          </v-btn>
          <v-btn
            prepend-icon="ri-refresh-line"
            variant="tonal"
            color="primary"
            class="rounded-md font-weight-bold"
            height="48"
            :loading="refreshing"
            @click="refreshAll"
          >
            تحديث البيانات
          </v-btn>
        </template>
      </div>
    </div>

    <!-- Customization Alert -->
    <v-alert v-if="isCustomizing" type="info" variant="tonal" density="compact" class="mb-6 text-caption rounded-lg border-info">
      أنت الآن في <strong>وضع التخصيص</strong>. اسحب العناصر لتغيير ترتيبها، واستخدم أيقونة العين لإظهار أو إخفاء أي عنصر.
    </v-alert>

    <!-- Dynamic Stats Grid (Horizontal Scrolling on mobile, tight layout) -->
    <transition-group name="flip-list" tag="div" class="stats-tray d-flex gap-4 mb-8 overflow-x-auto pb-4 pt-2 px-2">
      <template v-for="(stat, index) in localStats" :key="stat.key">
        <div
          v-show="isCustomizing || stat.visible"
          :draggable="isCustomizing"
          @dragstart="onDragStart($event, index, 'stats')"
          @dragover="onDragOver($event, index, 'stats')"
          @dragleave="onDragLeave($event, index, 'stats')"
          @dragend="onDragEnd"
          @drop="onDrop($event, index, 'stats')"
          class="position-relative customization-col-item"
          :class="{
            'drag-active-item': draggingIndex === index && dragType === 'stats',
            'drag-over-right': dragOverIndex === index && draggingIndex < index && dragType === 'stats',
            'drag-over-left': dragOverIndex === index && draggingIndex > index && dragType === 'stats',
            'opacity-50 grayscale': isCustomizing && !stat.visible,
            'flex-grow-1': stat.key === 'balance',
          }"
        >
          <!-- Customizer Overlay -->
          <div v-if="isCustomizing" class="customizer-overlay rounded-xl d-flex align-start justify-space-between pa-2">
            <div class="d-flex align-center bg-white rounded shadow-sm px-2 py-1 drag-handle cursor-grab border">
              <v-icon icon="ri-drag-move-2-fill" size="20" color="primary" class="mr-2" />
              <span class="text-caption font-weight-bold text-primary">{{ stat.title }}</span>
            </div>
            <v-btn
              :icon="stat.visible ? 'ri-eye-line' : 'ri-eye-off-line'"
              size="small"
              variant="flat"
              class="shadow-sm border"
              :color="stat.visible ? 'white' : 'error'"
              @click="toggleVisibility(stat)"
            />
          </div>

          <div :class="{ 'pointer-events-none': isCustomizing }" class="h-100">
            <!-- Balance Card -->
            <div
              v-if="stat.key === 'balance'"
              class="stat-card-premium px-6 py-4 rounded-xl shadow-sm d-flex flex-column justify-center min-w-280 h-100"
              :class="stats.remainingBalance > 0 ? 'bg-error-gradient' : 'balance-hero'"
            >
              <div class="d-flex align-center gap-3 mb-2">
                <v-avatar color="white" size="32" class="shadow-sm">
                  <v-icon icon="ri-wallet-3-line" :color="stats.remainingBalance > 0 ? 'error' : 'primary'" size="18" />
                </v-avatar>
                <span class="text-subtitle-2 font-weight-bold text-white opacity-80">رصيدك الحالي</span>
              </div>
              <AppBalanceDisplay
                :amount="stats.remainingBalance"
                perspective="customer"
                value-class="text-h3 font-weight-black text-white"
                label-class="text-caption text-white opacity-60 mt-1"
                custom-class="d-flex flex-column"
              />
            </div>

            <!-- Installment Plans Card -->
            <div
              v-if="stat.key === 'activeInstallmentPlans'"
              class="stat-card-premium bg-white border px-6 py-4 rounded-xl shadow-sm d-flex flex-column justify-center min-w-200 h-100"
            >
              <div class="d-flex align-center gap-3 mb-2">
                <v-avatar color="orange-lighten-5" size="32">
                  <v-icon icon="ri-calendar-todo-line" color="orange" size="18" />
                </v-avatar>
                <span class="text-subtitle-2 font-weight-bold text-slate-500">خطط التقسيط</span>
              </div>
              <div class="text-h4 font-weight-black text-slate-900 line-height-1">
                {{ stats.activeInstallmentPlans || 0 }} <span class="text-body-2 font-weight-bold text-grey">خطة</span>
              </div>
            </div>

            <!-- Upcoming/Late Installments Card -->
            <div
              v-if="stat.key === 'upcomingInstallments'"
              class="stat-card-premium bg-white border px-6 py-4 rounded-xl shadow-sm d-flex flex-column justify-center min-w-200 h-100"
            >
              <div class="d-flex align-center gap-3 mb-2">
                <v-avatar color="error-lighten-5" size="32">
                  <v-icon icon="ri-alarm-warning-line" color="error" size="18" />
                </v-avatar>
                <span class="text-subtitle-2 font-weight-bold text-slate-500">أقساط متأخرة وقادمة</span>
              </div>
              <div class="text-h4 font-weight-black text-error line-height-1">
                {{ upcomingInstallments?.length || 0 }} <span class="text-body-2 font-weight-bold text-grey">قسط</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </transition-group>

    <!-- Dynamic Main Layout Row -->
    <transition-group name="flip-list" tag="div" class="v-row pb-6">
      <template v-for="(section, index) in localSections" :key="section.key">
        <v-col
          v-show="isCustomizing || section.visible"
          cols="12"
          :lg="section.cols"
          :draggable="isCustomizing"
          @dragstart="onDragStart($event, index, 'sections')"
          @dragover="onDragOver($event, index, 'sections')"
          @dragleave="onDragLeave($event, index, 'sections')"
          @dragend="onDragEnd"
          @drop="onDrop($event, index, 'sections')"
          class="position-relative customization-col-item"
          :class="{
            'drag-active-item': draggingIndex === index && dragType === 'sections',
            'drag-over-above': dragOverIndex === index && draggingIndex > index && dragType === 'sections',
            'drag-over-below': dragOverIndex === index && draggingIndex < index && dragType === 'sections',
            'opacity-50 grayscale': isCustomizing && !section.visible,
          }"
        >
          <!-- Customizer Overlay -->
          <div v-if="isCustomizing" class="customizer-overlay customizer-overlay-col rounded-lg d-flex align-start justify-space-between pa-2">
            <div class="d-flex align-center bg-white rounded shadow-sm px-2 py-1 drag-handle cursor-grab border">
              <v-icon icon="ri-drag-move-2-fill" size="20" color="primary" class="mr-2" />
              <span class="text-caption font-weight-bold text-primary">{{ section.title }}</span>
            </div>
            <v-btn
              :icon="section.visible ? 'ri-eye-line' : 'ri-eye-off-line'"
              size="small"
              variant="flat"
              class="shadow-sm border"
              :color="section.visible ? 'white' : 'error'"
              @click="toggleVisibility(section)"
            />
          </div>

          <div :class="{ 'pointer-events-none': isCustomizing }">
            <!-- Recent Purchases Section -->
            <template v-if="section.key === 'recentPurchases'">
              <div class="d-flex align-center justify-space-between mb-4">
                <h2 class="text-h5 font-weight-bold d-flex align-center gap-2">
                  <v-icon icon="ri-bill-line" color="primary" />
                  أحدث المشتريات
                </h2>
                <v-btn variant="text" color="primary" to="/app/purchases" class="font-weight-bold">
                  عرض الكل
                  <v-icon end icon="ri-arrow-left-s-line" />
                </v-btn>
              </div>

              <div v-if="loading" class="d-flex justify-center py-12">
                <v-progress-circular indeterminate color="primary" size="48" />
              </div>

              <div
                v-else-if="!recentInvoices || recentInvoices.length === 0"
                class="empty-state text-center py-12 border rounded-md bg-grey-lighten-5 border-dashed mb-8"
              >
                <v-icon icon="ri-inbox-line" size="48" color="grey" class="mb-2 opacity-50" />
                <div class="text-grey font-weight-bold">لا يوجد مشتريات حديثة</div>
              </div>

              <v-row v-else class="dense-grid mb-8">
                <v-col v-for="item in (recentInvoices || []).slice(0, 4)" :key="item.id" cols="12" sm="6" class="pa-2">
                  <PortalPurchaseCard :purchase="item" @view="viewInvoice" />
                </v-col>
              </v-row>
            </template>

            <!-- Recent Payments Section -->
            <template v-if="section.key === 'recentPayments'">
              <div class="d-flex align-center justify-space-between mb-4">
                <h2 class="text-h5 font-weight-bold d-flex align-center gap-2">
                  <v-icon icon="ri-money-dollar-circle-line" color="success" />
                  أحدث المدفوعات
                </h2>
                <v-btn variant="text" color="primary" to="/app/customer-payments" class="font-weight-bold">
                  سجل المدفوعات
                  <v-icon end icon="ri-arrow-left-s-line" />
                </v-btn>
              </div>

              <v-card variant="flat" border class="rounded-xl overflow-hidden bg-white mb-8">
                <v-table hover>
                  <thead>
                    <tr class="bg-grey-lighten-4">
                      <th class="text-right text-caption font-weight-bold text-grey-darken-1">التاريخ</th>
                      <th class="text-right text-caption font-weight-bold text-grey-darken-1">المبلغ</th>
                      <th class="text-right text-caption font-weight-bold text-grey-darken-1">طريقة الدفع</th>
                      <th class="text-right text-caption font-weight-bold text-grey-darken-1">المستلم</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="!recentPayments || recentPayments.length === 0">
                      <td colspan="4" class="text-center py-8 text-grey">لا توجد مدفوعات مسجلة</td>
                    </tr>
                    <tr v-for="payment in recentPayments" :key="payment.id" class="cursor-pointer">
                      <td class="text-body-2">{{ formatDate(payment.payment_date) }}</td>
                      <td class="text-body-2 font-weight-bold text-success">{{ formatCurrency(payment.amount) }}</td>
                      <td class="text-body-2">
                        <v-chip size="x-small" label color="primary" variant="tonal">
                          {{ payment.payment_method?.name || payment.method || 'نقدي' }}
                        </v-chip>
                      </td>
                      <td class="text-body-2 text-grey">{{ payment.creator?.full_name || 'النظام' }}</td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card>
            </template>

            <!-- Upcoming/Late Installments Timeline Section -->
            <template v-if="section.key === 'installmentsTimeline'">
              <v-card variant="flat" border class="pa-4 rounded-xl mb-4 bg-white shadow-sm border-slate-200">
                <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center gap-2 text-slate-900 border-bottom pb-2">
                  <v-icon icon="ri-calendar-todo-line" color="orange" />
                  الأقساط القادمة والمتأخرة
                </h3>
                <PortalInstallmentTimeline :installments="upcomingInstallments?.slice(0, 5)" />
                <v-btn
                  v-if="upcomingInstallments?.length > 5"
                  block
                  variant="text"
                  color="secondary"
                  size="small"
                  to="/app/customer-installments"
                  class="mt-2 font-weight-bold"
                >
                  عرض كافة الأقساط
                </v-btn>
              </v-card>
            </template>

            <!-- Quick Links Section -->
            <template v-if="section.key === 'quickLinks'">
              <v-card variant="flat" border class="pa-4 rounded-xl mb-4 bg-white shadow-sm border-slate-200">
                <h3 class="text-subtitle-1 font-weight-bold mb-4 d-flex align-center gap-2 text-slate-900 border-bottom pb-2">
                  <v-icon icon="ri-flashlight-line" color="warning" />
                  روابط سريعة
                </h3>
                <div class="d-flex flex-column gap-2">
                  <v-btn
                    block
                    color="primary"
                    variant="tonal"
                    prepend-icon="ri-file-search-line"
                    to="/app/purchases"
                    height="40"
                    class="font-weight-bold justify-start rounded-lg text-caption"
                  >
                    البحث عن فاتورة
                  </v-btn>
                  <v-btn
                    block
                    color="info"
                    variant="tonal"
                    prepend-icon="ri-exchange-funds-line"
                    to="/app/customer-transactions"
                    height="40"
                    class="font-weight-bold justify-start rounded-lg text-caption"
                  >
                    سجل المعاملات
                  </v-btn>
                  <v-btn
                    v-if="userStore.hasInstallments"
                    block
                    color="success"
                    variant="tonal"
                    prepend-icon="ri-money-dollar-circle-line"
                    to="/app/customer-payments"
                    height="40"
                    class="font-weight-bold justify-start rounded-lg text-caption"
                  >
                    سجل مدفوعاتي
                  </v-btn>
                </div>
              </v-card>
            </template>
          </div>
        </v-col>
      </template>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useUIPreferencesStore } from '@/stores/uiPreferences';
import { useDashboardData } from '@/modules/reports/composables/useDashboardData';
import { formatCurrency, formatDate } from '@/utils/formatters';
import notificationManager from '@/services/notificationManager';
import AppBalanceDisplay from '@/components/common/AppBalanceDisplay.vue';
import PortalPurchaseCard from '../../components/PortalPurchaseCard.vue';
import PortalInstallmentTimeline from '../../components/PortalInstallmentTimeline.vue';

const userStore = useUserStore();
const uiPrefsStore = useUIPreferencesStore();
const router = useRouter();
const { stats, recentInvoices, recentPayments, upcomingInstallments, refreshing, loading, refreshAll } = useDashboardData();

const userName = computed(() => userStore.currentUser?.full_name?.split(' ')[0] || 'أهلاً بك');
const dynamicGreeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 5) return 'ليلة سعيدة';
  if (hour < 12) return 'صباح الخير';
  if (hour < 18) return 'مساء الخير';
  return 'ليلة سعيدة';
});

const viewInvoice = invoice => {
  router.push(`/app/purchases/${invoice.id}`);
};

// -------------------------------------------------------------
// In-Place Dashboard Customization Logic
// -------------------------------------------------------------

const isCustomizing = ref(false);
const saving = ref(false);

const localStats = ref([]);
const localSections = ref([]);

const defaultStats = [
  { key: 'balance', title: 'رصيدك الحالي', visible: true },
  { key: 'activeInstallmentPlans', title: 'خطط التقسيط', visible: true },
  { key: 'upcomingInstallments', title: 'أقساط متأخرة وقادمة', visible: true },
];

const defaultSections = [
  { key: 'recentPurchases', title: 'أحدث المشتريات', visible: true, cols: 8 },
  { key: 'recentPayments', title: 'أحدث المدفوعات', visible: true, cols: 8 },
  { key: 'installmentsTimeline', title: 'الأقساط القادمة والمتأخرة', visible: true, cols: 4 },
  { key: 'quickLinks', title: 'الروابط السريعة', visible: true, cols: 4 },
];

const syncLocalWithPreferences = () => {
  const pref = uiPrefsStore.getPreference('dashboard.client');
  let loadedStats = [];
  let loadedSections = [];

  if (!pref || !pref.columns) {
    loadedStats = [...defaultStats];
    loadedSections = [...defaultSections];
  } else {
    // Parse stats
    const prefStats = pref.columns.filter(c => ['balance', 'activeInstallmentPlans', 'upcomingInstallments'].includes(c.key));
    prefStats.forEach(p => {
      const orig = defaultStats.find(s => s.key === p.key);
      if (orig) loadedStats.push({ ...orig, visible: p.visible });
    });
    defaultStats.forEach(orig => {
      if (!loadedStats.some(s => s.key === orig.key)) {
        loadedStats.push({ ...orig, visible: false });
      }
    });

    // Parse sections
    const prefSections = pref.columns.filter(c => ['recentPurchases', 'recentPayments', 'installmentsTimeline', 'quickLinks'].includes(c.key));
    prefSections.forEach(p => {
      const orig = defaultSections.find(s => s.key === p.key);
      if (orig) loadedSections.push({ ...orig, visible: p.visible });
    });
    defaultSections.forEach(orig => {
      if (!loadedSections.some(s => s.key === orig.key)) {
        loadedSections.push({ ...orig, visible: false });
      }
    });
  }

  localStats.value = JSON.parse(JSON.stringify(loadedStats));
  localSections.value = JSON.parse(JSON.stringify(loadedSections));
};

const startCustomization = () => {
  syncLocalWithPreferences();
  isCustomizing.value = true;
};

const toggleVisibility = item => {
  item.visible = !item.visible;
  savePreferencesToStore(true);
};

// Drag and drop state and logic
let dragIndex = null;
const dragType = ref('');
const draggingIndex = ref(null);
const dragOverIndex = ref(null);

const onDragStart = (event, index, type) => {
  if (!isCustomizing.value) return;
  dragIndex = index;
  dragType.value = type;
  draggingIndex.value = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    const ghost = document.createElement('div');
    document.body.appendChild(ghost);
    event.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => document.body.removeChild(ghost), 0);
  }
};

const onDragOver = (event, index, type) => {
  if (draggingIndex.value === null || dragType.value !== type) return;
  event.preventDefault();
  dragOverIndex.value = index;
};

const onDragLeave = (event, index, type) => {
  if (dragOverIndex.value === index) {
    dragOverIndex.value = null;
  }
};

const onDragEnd = () => {
  draggingIndex.value = null;
  dragOverIndex.value = null;
  dragIndex = null;
  dragType.value = '';
};

const onDrop = (event, index, type) => {
  if (dragIndex === null || dragIndex === index || dragType.value !== type) {
    onDragEnd();
    return;
  }

  const items = type === 'stats' ? localStats.value : localSections.value;
  const draggedItem = items[dragIndex];
  items.splice(dragIndex, 1);
  items.splice(index, 0, draggedItem);
  onDragEnd();

  savePreferencesToStore(true);
};

const savePreferencesToStore = async (silent = false) => {
  if (!silent) saving.value = true;
  try {
    const columns = [
      ...localStats.value.map(s => ({ key: s.key, visible: s.visible })),
      ...localSections.value.map(s => ({ key: s.key, visible: s.visible })),
    ];

    await uiPrefsStore.savePreference('dashboard.client', { columns });
    if (!silent) {
      notificationManager.success('تم حفظ التخصيص بنجاح');
      isCustomizing.value = false;
    }
  } catch (error) {
    console.error('Failed to save dashboard preferences:', error);
    if (!silent) notificationManager.error('حدث خطأ أثناء حفظ التعديلات');
  } finally {
    if (!silent) saving.value = false;
  }
};

const saveCustomization = () => {
  savePreferencesToStore(false);
};

const resetToDefaults = async () => {
  saving.value = true;
  try {
    await uiPrefsStore.resetPreference('dashboard.client');
    localStats.value = JSON.parse(JSON.stringify(defaultStats));
    localSections.value = JSON.parse(JSON.stringify(defaultSections));
    notificationManager.success('تم تعيين لوحة التحكم للوضع الافتراضي');
    isCustomizing.value = false;
  } catch (error) {
    console.error('Failed to reset dashboard preferences:', error);
    notificationManager.error('حدث خطأ أثناء إعادة الضبط');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  refreshAll();
  await uiPrefsStore.loadPreferences('dashboard.client');
  syncLocalWithPreferences();
});
</script>

<script>
//   كلاس لإدارة وعرض لوحة تحكم العميل مع التخصيص المباشر
export default {
  name: 'CustomerDashboard',
};
</script>

<style scoped>
.customer-dashboard {
  background-color: #f8fafc;
  min-height: 100vh;
}

.primary-gradient-text {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #1a237e 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.balance-hero {
  background: linear-gradient(135deg, rgb(var(--v-theme-primary)) 0%, #303f9f 100%);
}

.bg-error-gradient {
  background: linear-gradient(135deg, #ef4444 0%, #991b1b 100%);
}

.stat-card-premium {
  transition: all 0.2s ease;
}

.gap-3 {
  gap: 12px;
}
.gap-4 {
  gap: 16px;
}

.min-w-280 {
  min-width: 280px;
}
.min-w-200 {
  min-width: 200px;
}

.line-height-1 {
  line-height: 1;
}

.stats-tray::-webkit-scrollbar {
  display: none;
}
.stats-tray {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.dense-grid {
  margin: -8px;
}

.shadow-sm {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

.text-slate-500 {
  color: #64748b;
}
.text-slate-900 {
  color: #0f172a;
}
.border-slate-200 {
  border-color: #e2e8f0 !important;
}

/* In-Place WYSIWYG Editor Styles */
.customizer-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.05);
  border: 2px dashed rgb(var(--v-theme-primary));
  z-index: 10;
  backdrop-filter: blur(1px);
  transition: all 0.2s ease;
}
.customizer-overlay-col {
  /* Offset for the 12px v-col padding */
  top: 12px;
  left: 12px;
  right: 12px;
  bottom: 12px;
}
.customizer-overlay:hover {
  background: rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(2px);
}
.grayscale {
  filter: grayscale(100%);
}
.pointer-events-none {
  pointer-events: none;
}
.drag-handle {
  cursor: grab;
}
.drag-handle:active {
  cursor: grabbing;
}

/* Tactile & Smooth Drag-and-Drop */
.flip-list-move {
  transition: transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.customization-col-item {
  transition:
    transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1),
    opacity 0.2s ease,
    filter 0.2s ease;
  user-select: none;
}
.drag-active-item {
  opacity: 0.4 !important;
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
  border: 2px dashed rgb(var(--v-theme-primary)) !important;
  transform: scale(0.98);
}
/* Vertical Drop Targets */
.drag-over-above {
  border-top: 4px solid rgb(var(--v-theme-primary)) !important;
  padding-top: 4px !important;
}
.drag-over-below {
  border-bottom: 4px solid rgb(var(--v-theme-primary)) !important;
  padding-bottom: 4px !important;
}
/* Horizontal Drop Targets */
.drag-over-right {
  border-right: 4px solid rgb(var(--v-theme-primary)) !important;
  padding-right: 4px !important;
}
.drag-over-left {
  border-left: 4px solid rgb(var(--v-theme-primary)) !important;
  padding-left: 4px !important;
}
</style>
