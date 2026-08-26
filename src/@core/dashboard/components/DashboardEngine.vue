<template>
  <div class="dashboard-engine pa-4">
    <!-- Header with controls -->
    <div class="d-flex align-center justify-space-between mb-4 gap-2 flex-wrap">
      <div>
        <h1 class="text-h6 text-md-h4 font-weight-bold mb-0">{{ title }}</h1>
        <p class="text-xxs text-md-body-2 text-grey mb-0 mt-1">{{ subtitle }}</p>
      </div>

      <div class="d-flex gap-2 align-center">
        <!-- Design Mode Controls -->
        <template v-if="dashboardStore.designMode">
          <v-btn
            color="success"
            variant="tonal"
            prepend-icon="ri-add-line"
            size="small"
            class="rounded-lg tour-add-widget-btn"
            @click="showWidgetLibrary = true"
          >
            إضافة مكون (Widget)
          </v-btn>
          <v-btn
            color="error"
            variant="outlined"
            prepend-icon="ri-refresh-line"
            size="small"
            class="rounded-lg"
            @click="resetToDefault"
          >
            استعادة الافتراضي
          </v-btn>

          <v-btn
            color="success"
            variant="flat"
            prepend-icon="ri-check-line"
            size="small"
            class="rounded-lg tour-save-exit-btn"
            @click="saveAndExit"
          >
            حفظ وإغلاق
          </v-btn>
        </template>

        <template v-else>
          <!-- Customize trigger for staff/admin -->
          <v-btn
            v-if="canCustomize"
            color="primary"
            variant="outlined"
            prepend-icon="ri-dashboard-line"
            size="small"
            class="rounded-lg tour-dashboard-customize"
            @click="startDesignMode"
          >
            تخصيص الواجهة
          </v-btn>

          <v-btn
            color="primary"
            variant="tonal"
            prepend-icon="ri-refresh-line"
            size="small"
            class="rounded-lg tour-dashboard-refresh"
            :loading="dashboardStore.loading"
            @click="refreshDashboard"
          >
            تحديث البيانات
          </v-btn>
        </template>
      </div>
    </div>

    <!-- Alert for customizer -->
    <v-alert
      v-if="dashboardStore.designMode"
      type="info"
      variant="tonal"
      density="compact"
      class="mb-4 text-caption rounded-lg border-info"
    >
      أنت الآن في <strong>وضع تصميم وتخصيص مساحة العمل</strong>. يمكنك سحب المكونات وإفلاتها بحرية تامة في أي مكان في الصفحة كاملة بدون حواجز، أو تكبير حجمها من الحافة السفلية.
    </v-alert>

    <!-- Global shared filters for the dashboard event bus -->
    <v-card v-if="showFilters" class="mb-4 rounded-lg border shadow-sm pa-3">
      <div class="d-flex gap-3 align-center flex-wrap">
        <span class="text-caption font-weight-bold text-grey-darken-1">
          <v-icon icon="ri-filter-3-line" class="mr-1" size="18" /> تصفية النتائج:
        </span>
        
        <v-btn-toggle v-model="selectedPeriod" mandatory selected-class="bg-primary text-white" density="compact" class="border rounded filters-toggle">
          <v-btn value="today" size="small">اليوم</v-btn>
          <v-btn value="week" size="small">الأسبوع</v-btn>
          <v-btn value="month" size="small">الشهر</v-btn>
        </v-btn-toggle>
      </div>
    </v-card>

    <!-- Unified Single Grid Workspace Renderer -->
    <div v-if="dashboardStore.layout && dashboardStore.layout.widgetInstances" class="dashboard-workspace-grid">
      <DashboardContainer
        :widget-instances="dashboardStore.layout.widgetInstances"
        :design-mode="dashboardStore.designMode"
        @layout-change="onLayoutChange"
      />
    </div>

    <!-- Fallback/Loading states -->
    <div v-else-if="dashboardStore.loading" class="d-flex flex-column align-center justify-center py-10">
      <v-progress-circular indeterminate color="primary" size="48" class="mb-2" />
      <span class="text-caption text-grey">جاري تهيئة محرك لوحة التحكم...</span>
    </div>

    <!-- Widget Library sliding drawer (Customizer Palette) -->
    <v-navigation-drawer
      v-model="showWidgetLibrary"
      location="left"
      temporary
      width="360"
      class="widget-library-drawer rounded-r-lg"
    >
      <div class="pa-4 border-b d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon icon="ri-grid-fill" color="primary" class="me-2" />
          <span class="text-subtitle-1 font-weight-bold">مكتبة المكونات (Widgets)</span>
        </div>
        <v-btn class="btn-close-library" icon="ri-close-line" size="small" variant="text" color="grey" @click="showWidgetLibrary = false" />
      </div>

      <div class="pa-4 widget-library-content overflow-y-auto" style="height: calc(100vh - 80px);">
        <!-- Active/Inactive list tabs -->
        <v-tabs v-model="drawerTab" color="primary" density="compact" class="mb-4">
          <v-tab value="available" class="text-caption font-weight-bold">متاحة للإضافة</v-tab>
          <v-tab value="hidden" class="text-caption font-weight-bold">المخفية باللوحة</v-tab>
        </v-tabs>

        <v-window v-model="drawerTab">
          <!-- Available to install widgets -->
          <v-window-item value="available">
            <div v-if="uninstalledWidgets.length > 0" class="d-flex flex-column gap-3">
              <v-card 
                v-for="widget in uninstalledWidgets" 
                :key="widget.id"
                border
                flat
                class="rounded-lg pa-3 widget-palette-card clickable"
                @click="addWidgetToLayout(widget.id)"
              >
                <div class="d-flex align-start justify-space-between">
                  <div>
                    <div class="font-weight-bold text-body-2 mb-1 text-grey-darken-3">{{ widget.metadata.title }}</div>
                    <div class="text-mini text-grey">{{ getCategoryLabel(widget.metadata.category) }}</div>
                  </div>
                  <v-btn icon="ri-add-circle-fill" size="x-small" color="success" variant="text" />
                </div>
              </v-card>
            </div>
            <div v-else class="text-center py-6 text-caption text-grey">
              تم إدراج كافة المكونات المتاحة باللوحة.
            </div>
          </v-window-item>

          <!-- Hidden widgets -->
          <v-window-item value="hidden">
            <div v-if="hiddenWidgets.length > 0" class="d-flex flex-column gap-3">
              <v-card 
                v-for="inst in hiddenWidgets" 
                :key="inst.id"
                border
                flat
                class="rounded-lg pa-3 widget-palette-card clickable"
                @click="restoreWidget(inst.id)"
              >
                <div class="d-flex align-start justify-space-between">
                  <div>
                    <div class="font-weight-bold text-body-2 mb-1 text-grey-darken-3">{{ getWidgetTitle(inst.widgetId) }}</div>
                    <div class="text-mini text-grey">معرف النسخة: {{ inst.id }}</div>
                  </div>
                  <v-btn icon="ri-eye-line" size="x-small" color="primary" variant="text" />
                </div>
              </v-card>
            </div>
            <div v-else class="text-center py-6 text-caption text-grey">
              لا توجد مكونات مخفية باللوحة حالياً.
            </div>
          </v-window-item>
        </v-window>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useDashboardStore } from '../store/dashboardStore';
import DashboardContainer from './DashboardContainer.vue';
import { useUserStore } from '@/stores/user';
import widgetRegistry from '../registry/WidgetRegistry';
import notificationManager from '@/services/notificationManager';

const props = defineProps({
  dashboardId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: 'لوحة التحكم'
  },
  subtitle: {
    type: String,
    default: 'مساحة العمل التفاعلية والتحليلات الجارية للنظام'
  },
  showFilters: {
    type: Boolean,
    default: true
  }
});

const dashboardStore = useDashboardStore();
const userStore = useUserStore();

const selectedPeriod = ref('month');
const showWidgetLibrary = ref(false);
const drawerTab = ref('available');

const canCustomize = computed(() => {
  return userStore.currentUser?.is_staff_or_admin || userStore.isStaff || false;
});

const getWidgetTitle = (widgetId) => {
  const reg = widgetRegistry.get(widgetId);
  return reg ? reg.metadata.title || widgetId : widgetId;
};

const getCategoryLabel = (cat) => {
  const labels = {
    financial: 'مالي ومبيعات',
    operational: 'تشغيلي ومخزون',
    workflow: 'سير العمل وفواتير',
    productivity: 'إنتاجية ومهام',
    personal: 'إجراءات سريعة'
  };
  return labels[cat] || cat;
};

// حساب المكونات المتاحة وغير المضافة بالكامل للوحة
const uninstalledWidgets = computed(() => {
  if (!dashboardStore.layout || !dashboardStore.layout.widgetInstances) return [];
  
  const usedWidgetIds = dashboardStore.layout.widgetInstances.map(wi => wi.widgetId);
  return dashboardStore.availableWidgets.filter(w => !usedWidgetIds.includes(w.id));
});

// حساب المكونات المضافة ولكن حالتها visible = false (المخفية)
const hiddenWidgets = computed(() => {
  if (!dashboardStore.layout || !dashboardStore.layout.widgetInstances) return [];
  return dashboardStore.layout.widgetInstances.filter(wi => wi.visible === false);
});

// إدراج ويدجت جديدة لللوحة كـ Grid Item مسطح وجلب بياناتها
const addWidgetToLayout = (widgetId) => {
  if (!dashboardStore.layout) return;

  const reg = widgetRegistry.get(widgetId);
  if (!reg) return;

  const newInstance = {
    id: `inst_added_${Date.now()}`,
    widgetId: widgetId,
    x: 0,
    y: 100, // يوضع أسفل التخطيط لتقوم GridStack بالترتيب التلقائي
    w: reg.metadata.defaultSize?.w || 3,
    h: reg.metadata.defaultSize?.h || 2,
    visible: true,
    userConfig: reg.metadata.defaultConfig ? JSON.parse(JSON.stringify(reg.metadata.defaultConfig)) : {}
  };

  dashboardStore.layout.widgetInstances.push(newInstance);
  dashboardStore.saveLayout(false);
  
  // جلب بيانات الويدجت الجديدة المضافة مركزياً
  dashboardStore.fetchAllWidgetsData({ period: selectedPeriod.value });
  notificationManager.success(`تمت إضافة مكون ${reg.metadata.title} بنجاح`);
};

// إعادة إظهار المكون المخفي بالشبكة وجلب بياناته
const restoreWidget = (instanceId) => {
  dashboardStore.setWidgetVisibility(instanceId, true, { period: selectedPeriod.value });
  notificationManager.success('تمت إعادة إظهار المكون باللوحة');
};

const startDesignMode = () => {
  dashboardStore.setDesignMode(true);
};

const saveAndExit = () => {
  dashboardStore.setDesignMode(false);
  notificationManager.success('تم حفظ تخطيط لوحة التحكم بنجاح');
  dashboardStore.saveLayout(true).catch(err => {
    console.error('فشل حفظ تخطيط لوحة التحكم:', err);
  });
};

const resetToDefault = async () => {
  if (confirm('هل أنت متأكد من رغبتك في إعادة ضبط اللوحة للوضع الافتراضي للباقة؟')) {
    await dashboardStore.resetToDefaultLayout({ period: selectedPeriod.value });
    notificationManager.success('تمت إعادة ضبط لوحة التحكم بنجاح');
  }
};

const onLayoutChange = () => {
  dashboardStore.saveLayout(false);
};

const refreshDashboard = async () => {
  await dashboardStore.fetchAllWidgetsData({ period: selectedPeriod.value });
};

watch(selectedPeriod, async (newPeriod, oldPeriod) => {
  if (oldPeriod && newPeriod !== oldPeriod) {
    await dashboardStore.fetchAllWidgetsData({ period: newPeriod });
  }
});

onMounted(async () => {
  // تهيئة اللوحة وجلب كافة البيانات للأدوات النشطة بناءً على فلتر الفترة المبدئي
  await dashboardStore.loadDashboard(props.dashboardId, { period: selectedPeriod.value });
});
</script>

<script>
/**
 * المحرك الحاكم الرئيسي لتهيئة ورندرة لوحة التحكم وإدارة سياق البيانات الموحد (Dashboard Engine)
 */
export default {
  name: 'DashboardEngine'
}
</script>

<style scoped>
.dashboard-engine {
  width: 100%;
}
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.widget-palette-card {
  transition: background-color 0.2s ease;
}
.widget-palette-card:hover {
  background-color: rgba(var(--v-theme-primary), 0.03);
}
.text-mini {
  font-size: 10px;
}
.clickable {
  cursor: pointer;
}

/* إصلاح مشكلة التفاف فلاتر التواريخ في شاشات الجوال */
.filters-toggle {
  display: flex;
  flex-wrap: wrap;
  height: auto !important;
}
.filters-toggle .v-btn {
  flex: 1 1 auto;
}
</style>
