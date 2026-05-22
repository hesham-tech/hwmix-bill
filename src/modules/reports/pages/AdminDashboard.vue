<template>
  <div class="admin-dashboard">
    <div class="px-4 pt-4 mb-2">
      <div class="d-flex align-center justify-space-between mb-1 gap-2 flex-wrap">
        <div>
          <h1 class="text-h6 text-md-h4 font-weight-bold mb-0">لوحة التحكم الإحصائية</h1>
          <p class="text-xxs text-md-body-1 text-grey mb-0 mt-1">تحليل أداء النظام، الفواتير، وحركات المخزون في مكان واحد</p>
        </div>
        <div class="d-flex gap-2">
          <!-- Customization Mode Controls -->
          <template v-if="isCustomizing">
            <AppButton
              color="error"
              prepend-icon="ri-refresh-line"
              variant="outlined"
              @click="resetToDefaults"
              :size="xs ? 'x-small' : 'small'"
            >
              <span v-if="!xs">إعادة الضبط</span>
            </AppButton>
            <AppButton
              color="success"
              prepend-icon="ri-check-line"
              variant="flat"
              @click="saveCustomization"
              :loading="saving"
              :size="xs ? 'x-small' : 'small'"
            >
              <span v-if="!xs">حفظ وإغلاق</span>
            </AppButton>
          </template>

          <!-- Normal State Controls -->
          <template v-else>
            <AppButton
              color="primary"
              prepend-icon="ri-dashboard-line"
              variant="outlined"
              @click="startCustomization"
              :size="xs ? 'x-small' : 'small'"
              class="tour-dashboard-customize"
            >
              <span v-if="!xs">تخصيص الواجهة</span>
            </AppButton>
            <AppButton
              color="primary"
              prepend-icon="ri-refresh-line"
              variant="tonal"
              :loading="refreshing"
              @click="refreshAll"
              :size="xs ? 'x-small' : 'small'"
              class="tour-dashboard-refresh"
            >
              <span v-if="!xs">تحديث البيانات</span>
            </AppButton>
          </template>
        </div>
      </div>

      <!-- Customization Mode Alert -->
      <v-alert v-if="isCustomizing" type="info" variant="tonal" density="compact" class="mt-3 text-caption rounded-lg border-info">
        أنت الآن في <strong>وضع التخصيص</strong>. اسحب العناصر لتغيير ترتيبها، واستخدم أيقونة العين لإظهار أو إخفاء أي عنصر.
      </v-alert>
    </div>

    <!-- Stats Section -->
    <ShareView file-name="dashboard-summary" background-color="#f8f9fa" top="0px" left="0px" :quality="0.5">
      <div class="px-6 mb-2">
        <!-- Loading State -->
        <v-progress-linear v-if="loading" indeterminate color="primary" class="rounded-t mb-2" />

        <transition-group name="flip-list" tag="div" class="d-flex flex-column w-100">
          <template v-for="(stat, index) in localStats" :key="stat.key">
            <div
              v-show="isCustomizing || stat.visible"
              :draggable="isCustomizing"
              @dragstart="onDragStart($event, index, 'stats')"
              @dragover="onDragOver($event, index, 'stats')"
              @dragleave="onDragLeave($event, index, 'stats')"
              @dragend="onDragEnd"
              @drop="onDrop($event, index, 'stats')"
              class="position-relative mb-4 customization-col-item"
              :class="{
                'drag-active-item': draggingIndex === index && dragType === 'stats',
                'drag-over-above': dragOverIndex === index && draggingIndex > index && dragType === 'stats',
                'drag-over-below': dragOverIndex === index && draggingIndex < index && dragType === 'stats',
                'opacity-50 grayscale': isCustomizing && !stat.visible
              }"
            >
              <!-- Overlay Controls -->
              <div v-if="isCustomizing" class="customizer-overlay rounded-lg d-flex align-start justify-space-between pa-2">
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

              <!-- Component -->
              <div :class="{ 'pointer-events-none': isCustomizing }">
                <AnalyticsStatsCards
                  v-if="stat.key === 'analyticsStats'"
                  :stats="advancedStats"
                  :loading="analyticsLoading"
                />
                <StatsCards
                  v-if="stat.key === 'basicStats'"
                  :stats="stats"
                  :loading="loading"
                />
              </div>
            </div>
          </template>
        </transition-group>
      </div>
    </ShareView>

    <!-- Dynamic Sections Layout Row -->
    <transition-group name="flip-list" tag="div" class="v-row px-6 mx-0 pb-6 mt-2">
      <template v-for="(section, index) in localSections" :key="section.key">
        <v-col
          v-show="isCustomizing || section.visible"
          cols="12"
          :lg="section.cols"
          :md="section.cols === 6 ? 6 : 12"
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
            'opacity-50 grayscale': isCustomizing && !section.visible
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
            <template v-if="section.key === 'productIntelligenceTable'">
              <ProductIntelligenceTable :data="advancedTopProducts" :loading="analyticsLoading" @sort-change="handleSortChange" />
            </template>
            <template v-if="section.key === 'salesTrendChart'">
              <SalesTrendChart :data="salesTrend" :loading="loading" />
            </template>
            <template v-if="section.key === 'dashboardTasksWidget'">
              <DashboardTasksWidget />
            </template>
            <template v-if="section.key === 'topProductsChart'">
              <TopProductsChart :data="basicTopProducts" :loading="loading" />
            </template>
            <template v-if="section.key === 'quickActions'">
              <QuickActions :actions="quickActions" @action-click="handleAction" />
            </template>
            <template v-if="section.key === 'recentInvoices'">
              <RecentInvoices :invoices="recentInvoices" :loading="loading" />
            </template>
            <template v-if="section.key === 'upcomingPayments'">
              <UpcomingPayments :payments="upcomingPayments" :loading="loadingUpcoming" />
            </template>
            <template v-if="section.key === 'upcomingInstallments'">
              <UpcomingInstallments :installments="upcomingInstallments" :loading="loadingInstallments" />
            </template>
            <template v-if="section.key === 'profitSummaryWidget'">
              <ProfitSummaryWidget />
            </template>
            <template v-if="section.key === 'reportsQuickLinks'">
              <ReportsQuickLinks />
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
import { useDisplay } from 'vuetify';
import { useUIPreferencesStore } from '@/stores/uiPreferences';
import { useDashboardData } from '../composables/useDashboardData';
import { useAnalytics } from '../composables/useAnalytics';
import { toast } from 'vue3-toastify';
import AppButton from '@/components/common/AppButton.vue';
import ShareView from '@/modules/capture/components/ShareView.vue';
import StatsCards from '../components/StatsCards.vue';
import AnalyticsStatsCards from '../components/AnalyticsStatsCards.vue';
import ProductIntelligenceTable from '../components/ProductIntelligenceTable.vue';
import QuickActions from '../components/QuickActions.vue';
import RecentInvoices from '../components/RecentInvoices.vue';
import UpcomingPayments from '../components/UpcomingPayments.vue';
import UpcomingInstallments from '../components/UpcomingInstallments.vue';
import SalesTrendChart from '../components/SalesTrendChart.vue';
import TopProductsChart from '../components/TopProductsChart.vue';
import DashboardTasksWidget from '@/modules/tasks/components/DashboardTasksWidget.vue';
import ProfitSummaryWidget from '../components/ProfitSummaryWidget.vue';
import ReportsQuickLinks from '../components/ReportsQuickLinks.vue';

const router = useRouter();
const { xs } = useDisplay();
const uiPrefsStore = useUIPreferencesStore();

const {
  stats,
  recentInvoices,
  upcomingPayments,
  upcomingInstallments,
  salesTrend,
  topProducts: basicTopProducts,
  loading: dashboardLoading,
  loadingUpcoming,
  loadingInstallments,
  refreshing,
  refreshAll: refreshBasic,
} = useDashboardData();

const {
  loading: analyticsLoading,
  dashboardStats: advancedStats,
  topProducts: advancedTopProducts,
  fetchDashboardStats,
  fetchTopProducts,
} = useAnalytics();

const loading = computed(() => dashboardLoading.value || analyticsLoading.value);

const handleSortChange = sortBy => {
  fetchTopProducts({ sort_by: sortBy });
};

const refreshAll = async () => {
  await Promise.all([refreshBasic(), fetchDashboardStats(), fetchTopProducts()]);
};

const quickActions = [
  {
    title: 'فاتورة جديدة',
    subtitle: 'إنشاء فاتورة بيع',
    icon: 'ri-file-add-line',
    color: 'primary',
    route: '/app/invoices/create',
  },
  {
    title: 'تسجيل دفعة',
    subtitle: 'إضافة دفعة جديدة',
    icon: 'ri-money-dollar-circle-line',
    color: 'success',
    route: '/app/payments/create',
  },
  {
    title: 'منتج جديد',
    subtitle: 'إضافة منتج للمخزون',
    icon: 'ri-shopping-bag-line',
    color: 'info',
    route: '/app/products/create',
  },
  {
    title: 'عرض التقارير',
    subtitle: 'تقارير مفصلة',
    icon: 'ri-bar-chart-line',
    color: 'warning',
    route: '/app/reports',
  },
];

const handleAction = route => {
  router.push(route);
};

// -------------------------------------------------------------
// In-Place Dashboard Customization Logic
// -------------------------------------------------------------

const isCustomizing = ref(false);
const saving = ref(false);

const localStats = ref([]);
const localSections = ref([]);

const defaultStats = [
  { key: 'analyticsStats', title: 'تحليلات الأداء المتقدمة', visible: true },
  { key: 'basicStats', title: 'الإحصائيات الأساسية', visible: true }
];

const defaultSections = [
  { key: 'productIntelligenceTable', title: 'تحليل أداء المنتجات المتقدم', visible: true, cols: 12 },
  { key: 'salesTrendChart', title: 'الرسم البياني للمبيعات', visible: true, cols: 8 },
  { key: 'dashboardTasksWidget', title: 'مهام الفريق', visible: true, cols: 4 },
  { key: 'topProductsChart', title: 'أكثر المنتجات مبيعاً (رسم بياني)', visible: true, cols: 12 },
  { key: 'quickActions', title: 'إجراءات سريعة', visible: true, cols: 4 },
  { key: 'recentInvoices', title: 'أحدث الفواتير', visible: true, cols: 8 },
  { key: 'upcomingPayments', title: 'المدفوعات القادمة', visible: true, cols: 6 },
  { key: 'upcomingInstallments', title: 'الأقساط المستحقة', visible: true, cols: 6 },
  { key: 'profitSummaryWidget', title: 'ملخص الأرباح', visible: true, cols: 6 },
  { key: 'reportsQuickLinks', title: 'روابط التقارير', visible: true, cols: 6 }
];

// Re-sync local states when preferences are loaded
const syncLocalWithPreferences = () => {
  const pref = uiPrefsStore.getPreference('dashboard.admin');
  let loadedStats = [];
  let loadedSections = [];

  if (!pref || !pref.columns) {
    loadedStats = [...defaultStats];
    loadedSections = [...defaultSections];
  } else {
    // Parse stats
    const prefStats = pref.columns.filter(c => ['analyticsStats', 'basicStats'].includes(c.key));
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
    const prefSections = pref.columns.filter(c => !['analyticsStats', 'basicStats'].includes(c.key));
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

const toggleVisibility = (item) => {
  item.visible = !item.visible;
  savePreferencesToStore(true); // Silent save per Rule 14.2
};

// Drag and drop state
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
    // Use an invisible ghost image to prevent massive elements from blocking view
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
  if (dragOverIndex.value === index) dragOverIndex.value = null;
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
      ...localSections.value.map(s => ({ key: s.key, visible: s.visible }))
    ];
    await uiPrefsStore.savePreference('dashboard.admin', { columns });
    if (!silent) {
      toast.success('تم حفظ التخصيص بنجاح');
      isCustomizing.value = false;
    }
  } catch (error) {
    console.error('Failed to save admin dashboard preferences:', error);
    if (!silent) toast.error('حدث خطأ أثناء حفظ التعديلات');
  } finally {
    if (!silent) saving.value = false;
  }
};

const saveCustomization = () => savePreferencesToStore(false);

const resetToDefaults = async () => {
  saving.value = true;
  try {
    await uiPrefsStore.resetPreference('dashboard.admin');
    localStats.value = JSON.parse(JSON.stringify(defaultStats));
    localSections.value = JSON.parse(JSON.stringify(defaultSections));
    toast.success('تم تعيين لوحة التحكم للوضع الافتراضي');
    isCustomizing.value = false;
  } catch (error) {
    console.error('Failed to reset dashboard preferences:', error);
    toast.error('حدث خطأ أثناء إعادة الضبط');
  } finally {
    saving.value = false;
  }
};

onMounted(async () => {
  await refreshAll();
  await uiPrefsStore.loadPreferences('dashboard.admin');
  syncLocalWithPreferences();
});
</script>

<style scoped>
.admin-dashboard {
  padding-bottom: 24px;
}
.gap-2 {
  gap: 8px;
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

/* Tactile Drag-and-Drop styles */
.flip-list-move {
  transition: transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}
.customization-col-item {
  transition: transform 0.2s cubic-bezier(0.25, 0.8, 0.25, 1), opacity 0.2s ease, filter 0.2s ease;
  user-select: none;
}
.drag-active-item {
  opacity: 0.4 !important;
  background-color: rgba(var(--v-theme-primary), 0.05) !important;
  border: 2px dashed rgb(var(--v-theme-primary)) !important;
  transform: scale(0.98);
}
.drag-over-above {
  border-top: 4px solid rgb(var(--v-theme-primary)) !important;
  padding-top: 4px !important;
}
.drag-over-below {
  border-bottom: 4px solid rgb(var(--v-theme-primary)) !important;
  padding-bottom: 4px !important;
}
</style>
