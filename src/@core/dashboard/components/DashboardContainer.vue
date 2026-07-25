<template>
  <div class="dashboard-container-grid">
    <div ref="gridContainer" class="grid-stack">
      <div 
        v-for="inst in activeWidgetInstances" 
        :key="inst.id"
        :id="`widget-wrapper-${inst.id}`"
        class="grid-stack-item"
        :gs-x="inst.x"
        :gs-y="inst.y"
        :gs-w="inst.w"
        :gs-h="inst.h"
        :gs-min-w="inst.minW || 2"
        :gs-max-w="inst.maxW || 12"
        :gs-min-h="inst.minH || 2"
        :gs-max-h="inst.maxH || 12"
        :data-instance-id="inst.id"
      >
        <div class="grid-stack-item-content pa-1">
          <ErrorBoundary @error="handleWidgetError(inst.id, $event)">
            <div v-if="designMode" class="widget-design-overlay d-flex align-start justify-space-between pa-2">
              <div class="drag-handle-badge bg-white rounded shadow-sm px-2 py-1 border d-flex align-center">
                <v-icon icon="ri-drag-move-2-fill" size="16" color="primary" class="mr-1" />
                <span class="text-caption font-weight-bold text-primary truncate-text">{{ getWidgetTitle(inst.widgetId) }}</span>
              </div>
              <div class="d-flex gap-1">
                <v-btn 
                  icon
                  size="x-small" 
                  color="info" 
                  variant="flat" 
                  class="shadow-sm border rounded-circle tour-widget-reset"
                  @click="resetSingleWidget(inst.id)"
                >
                  <v-icon icon="ri-restart-line" size="14" />
                  <v-tooltip activator="parent" location="top">إعادة الضبط للافتراضي</v-tooltip>
                </v-btn>
                <v-btn 
                  icon
                  size="x-small" 
                  color="warning" 
                  variant="flat" 
                  class="shadow-sm border rounded-circle"
                  @click="hideWidget(inst.id)"
                >
                  <v-icon icon="ri-eye-off-line" size="14" />
                  <v-tooltip activator="parent" location="top">اخفاء مؤقت</v-tooltip>
                </v-btn>
                <v-btn 
                  icon
                  size="x-small" 
                  color="error" 
                  variant="flat" 
                  class="shadow-sm border rounded-circle"
                  @click="removeWidgetInstance(inst.id)"
                >
                  <v-icon icon="ri-delete-bin-line" size="14" />
                  <v-tooltip activator="parent" location="top">إزالة المكون</v-tooltip>
                </v-btn>
              </div>
            </div>

            <component 
              :is="getWidgetComponent(inst.widgetId)" 
              v-if="getWidgetComponent(inst.widgetId) && inst.visible !== false"
              :instance-id="inst.id"
              :user-config="inst.userConfig"
              :is-active="activeWidgetsStatus[inst.id]"
              @resize="onWidgetResize(inst.id, $event)"
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { LayoutAdapter } from '../adapters/LayoutAdapter';
import ErrorBoundary from './ErrorBoundary.vue';
import widgetRegistry from '../registry/WidgetRegistry';
import { useDashboardStore } from '../store/dashboardStore';
import notificationManager from '@/services/notificationManager';

const props = defineProps({
  widgetInstances: {
    type: Array,
    required: true
  },
  designMode: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['layout-change']);
const dashboardStore = useDashboardStore();

const gridContainer = ref(null);
let layoutAdapter = null;

// تصفية نسخ المكونات المعروضة (القابلة للرندرة)
const activeWidgetInstances = computed(() => {
  return props.widgetInstances.filter(inst => {
    const reg = widgetRegistry.get(inst.widgetId);
    return reg !== null && inst.visible !== false;
  });
});

// تتبع حالة نشاط الويدجتس الفردية
const activeWidgetsStatus = ref({});

const getWidgetComponent = (widgetId) => {
  const reg = widgetRegistry.get(widgetId);
  return reg ? reg.component : null;
};

const getWidgetTitle = (widgetId) => {
  const reg = widgetRegistry.get(widgetId);
  return reg ? reg.metadata.title || widgetId : widgetId;
};

// دالة مساعدة: استخراج العنصر الـ DOM لويدجت معين
const getWidgetEl = (instanceId) => {
  return gridContainer.value
    ? gridContainer.value.querySelector(`[data-instance-id="${instanceId}"]`)
    : null;
};

// تهيئة محول التخطيط — يُستدعى مرة واحدة فقط عند onMounted
const initGridAdapter = () => {
  if (!gridContainer.value) return;

  layoutAdapter = new LayoutAdapter(gridContainer.value, {
    column: 12,
    cellHeight: 'auto',
    margin: 8,
    staticGrid: !props.designMode
  });

  // الـ change callback يُحدِّث الـ SSOT فقط عبر updateWidgetPosition
  layoutAdapter.initGrid(activeWidgetInstances.value, (changes) => {
    changes.forEach(change => {
      dashboardStore.updateWidgetPosition(change.id, {
        x: change.x,
        y: change.y,
        w: change.w,
        h: change.h
      });
    });
    emit('layout-change');
  });

  if (props.designMode) {
    layoutAdapter.enableDesignMode();
  } else {
    layoutAdapter.disableDesignMode();
  }
};

// إعادة ضبط ويدجت فردية للافتراضي
const resetSingleWidget = (instanceId) => {
  const defaults = dashboardStore.resetWidgetToDefault(instanceId);
  if (defaults && layoutAdapter) {
    const el = getWidgetEl(instanceId);
    if (el && layoutAdapter.grid) {
      layoutAdapter.grid.update(el, { w: defaults.w, h: defaults.h });
    }
  }
  notificationManager.success('تمت إعادة ضبط المكون للوضع الافتراضي');
  emit('layout-change');
};

// إخفاء ويدجت: أولاً إزالتها من GridStack ثم تحديث الـ Store
const hideWidget = (instanceId) => {
  const el = getWidgetEl(instanceId);
  if (el && layoutAdapter) {
    layoutAdapter.removeWidgetEl(el);
  }
  dashboardStore.setWidgetVisibility(instanceId, false);
  emit('layout-change');
};

// حذف ويدجت: متزامن — Grid أولاً ثم Store
const removeWidgetInstance = (instanceId) => {
  const el = getWidgetEl(instanceId);
  if (el && layoutAdapter) {
    layoutAdapter.removeWidgetEl(el);
  }
  if (dashboardStore.layout && dashboardStore.layout.widgetInstances) {
    dashboardStore.layout.widgetInstances = dashboardStore.layout.widgetInstances.filter(wi => wi.id !== instanceId);
    dashboardStore.saveLayout(false);
  }
  emit('layout-change');
};

const handleWidgetError = (instanceId, errPayload) => {
  console.error(`[DashboardRuntime] تعطل المكون ذي المعرف ${instanceId}:`, errPayload.error);
};

const onWidgetResize = (instanceId, newSize) => {
  // تفويض التكبير للـ LayoutAdapter
};

// مراقبة وضع التصميم
watch(() => props.designMode, (newVal) => {
  if (!layoutAdapter) return;
  if (newVal) {
    layoutAdapter.enableDesignMode();
  } else {
    layoutAdapter.disableDesignMode();
  }
});

// ===================================================================
// آلية المزامنة الجديدة: layoutSignature بدلاً من deep watch
// مسؤولية: Add / Remove / Visible فقط
// خصائص GridStack الأخرى (minW, locked...) تُعالَج عبر API مباشر
// ===================================================================
const layoutSignature = computed(() =>
  props.widgetInstances
    .map(i => `${i.id}:${i.visible !== false ? 1 : 0}`)
    .join('|')
);

// تتبع آخر مجموعة IDs لمقارنتها
let _prevSignatureMap = new Map();

watch(layoutSignature, (newSig) => {
  if (!layoutAdapter) return;

  // بناء الـ Map الحالي
  const currentMap = new Map(
    props.widgetInstances.map(i => [i.id, i.visible !== false])
  );

  // إيجاد العناصر المضافة أو المُظهَرة
  const toAdd = [];
  const toRemove = [];

  currentMap.forEach((visible, id) => {
    const prevVisible = _prevSignatureMap.get(id);
    if (prevVisible === undefined) {
      // عنصر جديد
      if (visible) toAdd.push(id);
    } else if (!prevVisible && visible) {
      // كان مخفياً وأصبح ظاهراً
      toAdd.push(id);
    }
  });

  _prevSignatureMap.forEach((prevVisible, id) => {
    const currVisible = currentMap.get(id);
    if (currVisible === undefined) {
      // عنصر محذوف
      toRemove.push(id);
    } else if (prevVisible && !currVisible) {
      // كان ظاهراً وأصبح مخفياً
      toRemove.push(id);
    }
  });

  _prevSignatureMap = currentMap;

  nextTick(() => {
    // إزالة العناصر أولاً لتجنب الـ collision
    toRemove.forEach(id => {
      const el = getWidgetEl(id);
      if (el) layoutAdapter.removeWidgetEl(el);
    });

    // ثم إضافة العناصر الجديدة
    toAdd.forEach(id => {
      const el = getWidgetEl(id);
      if (el) {
        layoutAdapter.makeWidgetEl(el);
        activeWidgetsStatus.value[id] = true;
      }
    });
  });
});

onMounted(() => {
  nextTick(() => {
    initGridAdapter();
    // تهيئة الـ signature Map الأولي
    _prevSignatureMap = new Map(
      props.widgetInstances.map(i => [i.id, i.visible !== false])
    );
    // تفعيل حالة النشاط لجميع المكونات
    activeWidgetInstances.value.forEach(inst => {
      activeWidgetsStatus.value[inst.id] = true;
    });
  });
});

onBeforeUnmount(() => {
  if (layoutAdapter) {
    layoutAdapter.destroyGrid();
    layoutAdapter = null;
  }
});
</script>

<script>
/**
 * حاوية التخطيط الشبكي الموحدة المعزولة لـ Dashboard Engine (مساحة عمل واحدة)
 */
export default {
  name: 'DashboardContainer'
}
</script>

<style scoped>
@import 'gridstack/dist/gridstack.css';

.dashboard-container-grid {
  width: 100%;
}
.grid-stack {
  min-height: 400px;
  background: transparent;
  transition: background 0.3s ease;
}

/* Customizer controls overlay */
.widget-design-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(var(--v-theme-primary), 0.03);
  border: 2px dashed rgb(var(--v-theme-primary));
  z-index: 10;
  border-radius: 8px;
  /* pointer-events: none — مشروط باختبار جميع تفاعلات Design Mode قبل التفعيل */
  pointer-events: none;
}

/* الأزرار والـ drag handle تحتاج التفاعل دائماً */
.widget-design-overlay .drag-handle-badge,
.widget-design-overlay .v-btn {
  pointer-events: auto;
}

.drag-handle-badge {
  cursor: grab;
  user-select: none;
}
.drag-handle-badge:active {
  cursor: grabbing;
}
.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
