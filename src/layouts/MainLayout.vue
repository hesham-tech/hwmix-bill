<template>
  <Sidebar v-model="drawer" />

  <v-app-bar color="surface" elevation="0" class="border-b">
    <v-app-bar-nav-icon color="primary" @click="drawer = !drawer" class="d-flex d-sm-none" />

    <v-spacer />

    <!-- Right-side tools container -->
    <div class="d-flex align-center px-0 px-sm-1 ga-0">
      <!-- عرض الرصيد للمستحدم الحالى -->
      <div v-if="userStore.currentUser" class="d-flex align-center">
        <v-btn icon="ri-search-line" variant="tonal" color="primary" @click="isSearchOpen = true" class="me-2 rounded-lg" size="38" />
        <v-chip
          :color="userStore.currentUser.balance < 0 ? 'error' : 'success'"
          variant="tonal"
          class="rounded-pill font-weight-black px-4"
          height="36"
        >
          <v-icon start icon="ri-wallet-3-line" size="16" class="me-1" />
          <span class="text-caption text-sm-body-2">
            <span class="d-none d-sm-inline opacity-70 me-1"></span>
            {{ formatCurrency(userStore.currentUser.balance) }}
          </span>
        </v-chip>
      </div>

      <!-- <v-tooltip location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            icon="ri-customer-service-2-line"
            variant="text"
            color="error"
            class="mx-1 d-none d-sm-flex"
            @click="handleManualReport('feedback')"
          />
        </template>
        الدعم الفني والاقتراحات
      </v-tooltip> -->

      <!-- Print Format Selection Menu -->
      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-tooltip location="bottom">
            <template #activator="{ props: tooltipProps }">
              <AppButton
                v-bind="{ ...props, ...tooltipProps }"
                icon
                variant="tonal"
                color="primary"
                class="d-none d-sm-flex rounded-lg me-2"
                size="38"
                :loading="isUpdatingPrint"
              >
                <v-icon size="20">{{ getPrintFormatIcon(userStore.currentCompany?.print_settings?.print_format) }}</v-icon>
              </AppButton>
            </template>
            إعدادات الطباعة: {{ getPrintFormatLabel(userStore.currentCompany?.print_settings?.print_format) }}
          </v-tooltip>
        </template>
        <v-list density="compact" min-width="180">
          <v-list-item
            v-for="format in printFormats"
            :key="format.id"
            :active="userStore.currentCompany?.print_settings?.print_format === format.id"
            @click="handlePrintFormatChange(format.id)"
          >
            <template #prepend>
              <v-icon :icon="format.icon" size="small" class="me-2" />
            </template>
            <v-list-item-title>{{ format.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <!-- <v-tooltip location="bottom">
        <template #activator="{ props: tooltipProps }">
          <AppButton v-bind="tooltipProps" icon variant="text" @click="toggleLanguage" class="mx-1 d-none d-sm-flex">
            <v-icon>ri-translate-2</v-icon>
          </AppButton>
        </template>
        {{ localeStore.locale === 'ar' ? 'English' : 'عربي' }}
      </v-tooltip> -->

      <!-- أدوات سريعة -->
      <v-menu v-model="isQuickToolsMenuOpen" :close-on-content-click="false">
        <template #activator="{ props }">
          <AppButton v-bind="props" icon variant="tonal" color="primary" class="d-none d-sm-flex rounded-lg me-2" size="38">
            <v-icon size="20">ri-apps-2-line</v-icon>
          </AppButton>
        </template>
        <v-list density="compact" min-width="200" class="pa-2">
          <div class="text-caption text-grey px-2 mb-2">أدوات الوصول السريع</div>
          <v-row no-gutters>
            <v-col cols="6" class="pa-1">
              <v-card variant="tonal" color="primary" class="text-center pa-3 cursor-pointer" @click="appState.openCalculator()">
                <v-icon icon="ri-calculator-line" size="24" />
                <div class="text-caption mt-1">آلة حاسبة</div>
              </v-card>
            </v-col>
            <v-col cols="6" class="pa-1">
              <v-card
                variant="tonal"
                color="info"
                class="text-center pa-3 cursor-pointer"
                @click="appState.openInstallmentCalc({ mode: 'standalone' })"
              >
                <v-icon icon="ri-calendar-2-line" size="24" />
                <div class="text-caption mt-1">حساب أقساط</div>
              </v-card>
            </v-col>
          </v-row>
        </v-list>
      </v-menu>

      <v-menu>
        <template #activator="{ props }">
          <AppButton v-bind="props" variant="text" class="user-menu-btn px-1 ms-0">
            <AppAvatar
              :img-url="userStore.currentUser?.avatar_url"
              :name="userStore.currentUser?.full_name"
              size="30"
              class="ms-1"
              :previewable="false"
            />
            <span class="user-name-text text-truncate">{{ userName }}</span>
            <v-icon icon="ri-arrow-down-s-line" size="x-small" class="ms-1" />
          </AppButton>
        </template>
        <v-list density="compact">
          <v-list-item prepend-icon="ri-user-settings-line" title="الملف الشخصي" to="/app/profile" />
          <v-list-item prepend-icon="ri-device-line" title="إدارة الأجهزة" to="/app/sessions" />
          <v-list-item v-if="userStore.isStaff" prepend-icon="ri-settings-3-line" title="الإعدادات" to="/app/settings" />

          <!-- أدوات تظهر فقط على الموبايل في القائمة -->
          <template v-if="xs">
            <v-divider class="my-1" />

            <!-- Print Formats Group for Mobile -->
            <v-list-group value="print_formats" fluid :indent-strategy="'none'">
              <template #activator="{ props }">
                <v-list-item v-bind="props" prepend-icon="ri-printer-line" title="تنسيق الطباعة" />
              </template>

              <v-list-item
                v-for="format in printFormats"
                :key="format.id"
                :title="format.title"
                :prepend-icon="format.icon"
                :active="userStore.currentCompany?.print_settings?.print_format === format.id"
                @click="handlePrintFormatChange(format.id)"
                size="small"
                class="ps-0"
              />
            </v-list-group>

            <!-- <v-list-item prepend-icon="ri-translate-2" :title="localeStore.locale === 'ar' ? 'English' : 'عربي'" @click="toggleLanguage" />
            <v-list-item prepend-icon="ri-customer-service-2-line" title="الدعم الفني" @click="handleManualReport('feedback')" /> -->
            <v-list-item prepend-icon="ri-calculator-line" title="آلة حاسبة" @click="appState.openCalculator()" />
            <v-list-item prepend-icon="ri-calendar-2-line" title="حساب أقساط" @click="appState.openInstallmentCalc({ mode: 'standalone' })" />
          </template>

          <v-divider class="my-1" />
          <v-list-item prepend-icon="ri-refresh-line" title="تحديث بيانات النظام" @click="showClearCacheDialog = true" class="text-info" />
          <v-list-item prepend-icon="ri-logout-box-line" title="تسجيل الخروج" @click="handleLogout" class="text-error" />
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>

  <v-main class="main-content">
    <div class="sticky-breadcrumbs-container border-b">
      <v-container fluid class="py-1 px-1">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 text-caption">
          <template #divider>
            <v-icon icon="ri-arrow-left-s-line" size="small" />
          </template>
        </v-breadcrumbs>
      </v-container>
    </div>

    <v-container fluid class="pa-6">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-container>

    <!-- Tools Overlay (Non-modal) -->
    <div class="tools-layer">
      <!-- Global Calculator -->
      <transition name="scale">
        <div
          v-if="appState.calculator.isOpen"
          v-draggable="{ id: 'calc', position: toolPositions.calc }"
          class="floating-tool-window"
          :style="{ zIndex: activeTool === 'calc' ? 2001 : 2000 }"
          @mousedown="setActiveTool('calc')"
          @touchstart="setActiveTool('calc')"
        >
          <v-card width="320" class="tool-premium-card elevation-2">
            <header class="dialog-premium-header pa-3 d-flex align-center justify-space-between text-white drag-handle cursor-move variant-blue">
              <div class="d-flex align-center gap-2">
                <v-icon icon="ri-calculator-line" color="white" size="20" />
                <span class="text-subtitle-2 font-weight-bold">آلة حاسبة</span>
              </div>
              <v-btn icon="ri-close-line" variant="tonal" color="white" class="no-drag" size="x-small" @click="appState.closeCalculator" />
            </header>
            <div class="tool-content">
              <Calculator @close="appState.closeCalculator" />
            </div>
          </v-card>
        </div>
      </transition>

      <!-- Global Installment Calculator -->
      <transition name="scale">
        <div
          v-if="appState.installmentCalc.isOpen"
          v-draggable="{ id: 'installment', position: toolPositions.installment }"
          class="floating-tool-window"
          :style="{ zIndex: activeTool === 'installment' ? 2001 : 2000 }"
          @mousedown="setActiveTool('installment')"
          @touchstart="setActiveTool('installment')"
        >
          <v-card width="350" class="tool-premium-card elevation-2">
            <header class="dialog-premium-header pa-3 d-flex align-center justify-space-between text-white drag-handle cursor-move variant-purple">
              <div class="d-flex align-center gap-2">
                <v-icon icon="ri-calendar-todo-line" color="white" size="20" />
                <span class="text-subtitle-2 font-weight-bold">
                  {{ appState.installmentCalc.mode === 'invoice' ? 'تأكيد خطة التقسيط' : 'حاسبة الأقساط المتقدمة' }}
                </span>
              </div>
              <v-btn icon="ri-close-line" variant="tonal" color="white" class="no-drag" size="x-small" @click="appState.closeInstallmentCalc" />
            </header>
            <div class="tool-content">
              <InstallmentCalc
                :mode="appState.installmentCalc.mode"
                :initial-total="appState.installmentCalc.initialTotal"
                @close="appState.closeInstallmentCalc"
                @save="
                  data => {
                    if (appState.installmentCalc.onSave) appState.installmentCalc.onSave(data);
                    appState.closeInstallmentCalc();
                  }
                "
              />
            </div>
          </v-card>
        </div>
      </transition>
    </div>
    <AppConfirmDialog
      ref="confirmLogoutDialog"
      title="تسجيل الخروج"
      message="هل أنت متأكد أنك تريد تسجيل الخروج؟"
      confirm-text="خروج"
      confirm-color="error"
    />

    <!-- Cache Clearing Confirmation Dialog -->
    <AppConfirmDialog
      ref="confirmCacheDialog"
      v-model="showClearCacheDialog"
      title="تحديث ذاكرة النظام"
      message="هل تريد تحديث بيانات النظام ومسح الذاكرة المؤقتة؟ سيتم إعادة تحميل الصفحة والتوجه للرئيسية لحل أي مشاكل فنية ناتجة عن التحديثات."
      confirm-text="تحديث الآن"
      confirm-color="info"
      icon="ri-refresh-line"
      @confirm="handleClearCache"
    />

    <!-- Global Search Dialog -->
    <GlobalSearchDialog v-model="isSearchOpen" />
  </v-main>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useLocaleStore } from '@/stores/locale';
import { useappState } from '@/stores/appState';
import { authService } from '@/api';
import Sidebar from '@/components/layout/Sidebar.vue';
import GlobalSearchDialog from '@/layouts/components/GlobalSearchDialog.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import Calculator from '@/components/tools/Calculator.vue';
import InstallmentCalc from '@/components/tools/InstallmentCalc.vue';
import { toast } from 'vue3-toastify';
import { useDisplay } from 'vuetify';
import { formatCurrency } from '@/utils/formatters';
import { clearAppCache } from '@/utils/maintenance';
import { onMounted, onUnmounted } from 'vue';

const { xs } = useDisplay();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const localeStore = useLocaleStore();
const appState = useappState();

const isSearchOpen = ref(false);

// نجعل القائمة مغلقة افتراضياً في الجوال ومفتوحة في الحاسوب
const drawer = ref(!xs.value);

// مراقبة الحجم لضبط الـ drawer
watch(
  xs,
  isMobile => {
    drawer.value = !isMobile;
  },
  { immediate: true }
);

// Keyboard shortcuts
const handleKeyDown = e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    isSearchOpen.value = true;
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);

  // تصفير المواقع الافتراضية القديمة لضمان تفعيل التوسيط الجديد
  const oldCalc = localStorage.getItem('tool_pos_calc');
  if (oldCalc === '{"x":50,"y":100}') {
    localStorage.removeItem('tool_pos_calc');
    toolPositions.value.calc = null;
  }

  const oldInst = localStorage.getItem('tool_pos_installment');
  if (oldInst === '{"x":400,"y":100}') {
    localStorage.removeItem('tool_pos_installment');
    toolPositions.value.installment = null;
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const userName = computed(() => userStore.currentUser?.full_name || 'المستخدم');

const breadcrumbs = computed(() => {
  const homePath = userStore.isStaff ? '/app/admin/dashboard' : '/app/portal';
  const items = [{ title: 'الرئيسية', to: homePath, disabled: false }];

  if (route.meta.breadcrumbs) {
    items.push(...route.meta.breadcrumbs);
  } else if (route.meta.title) {
    items.push({ title: route.meta.title, disabled: true });
  }
  return items;
});

const handleManualReport = async (type = 'feedback') => {
  const { collectErrorInfo } = await import('@/modules/support/services/error-collector');
  await appState.triggerManualReport(type, (error, context) => {
    return collectErrorInfo(error, {
      ...context,
      onCaptureStart: () => {
        appState.isCapturing = true;
      },
      onCaptureEnd: () => {
        appState.isCapturing = false;
      },
    });
  });
};

const toggleLanguage = () => {
  localeStore.toggleLocale();
  toast.success(localeStore.locale === 'ar' ? 'تم التبديل للعربية' : 'Switched to English');
};

const isUpdatingPrint = ref(false);
const printFormats = [
  { id: 'standard', title: 'A4 (قياسي)', icon: 'ri-file-text-line' },
  { id: 'a5', title: 'A5 (صغير)', icon: 'ri-file-list-2-line' },
  { id: 'thermal', title: 'حراري (80mm)', icon: 'ri-ticket-2-line' },
  { id: 'thermal_58', title: 'حراري (58mm)', icon: 'ri-ticket-line' },
];

const getPrintFormatIcon = formatId => {
  return printFormats.find(f => f.id === formatId)?.icon || 'ri-printer-line';
};

const getPrintFormatLabel = formatId => {
  return printFormats.find(f => f.id === formatId)?.title || 'A4';
};

const handlePrintFormatChange = async format => {
  try {
    isUpdatingPrint.value = true;
    await userStore.updatePrintFormat(format);
    toast.success(`تم التغيير إلى ${getPrintFormatLabel(format)}`);
  } catch (error) {
    toast.error('فشل تحديث إعدادات الطباعة');
  } finally {
    isUpdatingPrint.value = false;
  }
};

const handleLogout = async () => {
  const confirmed = await confirmLogoutDialog.value.open();
  if (!confirmed) return;

  try {
    await authService.logout();
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/login');
  } catch (error) {
    toast.error('فشل تسجيل الخروج');
  }
};

const isQuickToolsMenuOpen = ref(false);
const confirmLogoutDialog = ref(null);
const confirmCacheDialog = ref(null);
const showClearCacheDialog = ref(false);

const handleClearCache = async () => {
  toast.info('جاري تحديث بيانات النظام...', { autoClose: 2000 });
  await clearAppCache();
};

// التفاعل مع النوافذ العائمة
const activeTool = ref(null);
const setActiveTool = toolId => {
  activeTool.value = toolId;
};

// الاحداثيات الافتراضية في منتصف الشاشة
const getDefaultPos = (width, estimatedHeight = 500) => {
  if (typeof window === 'undefined') return { x: 50, y: 100 };
  return {
    x: Math.max(10, (window.innerWidth - width) / 2),
    y: Math.max(10, (window.innerHeight - estimatedHeight) / 2),
  };
};

const toolPositions = ref({
  calc: JSON.parse(localStorage.getItem('tool_pos_calc')),
  installment: JSON.parse(localStorage.getItem('tool_pos_installment')),
});

// مراقبة فتح الأدوات لتحديد الموقع الافتراضي إذا لم يكن موجوداً
watch(
  () => appState.calculator.isOpen,
  isOpen => {
    if (isOpen && !toolPositions.value.calc) {
      toolPositions.value.calc = getDefaultPos(320, 450);
    }
  },
  { immediate: true }
);

watch(
  () => appState.installmentCalc.isOpen,
  isOpen => {
    if (isOpen && !toolPositions.value.installment) {
      toolPositions.value.installment = getDefaultPos(350, 550);
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.sticky-breadcrumbs-container {
  position: sticky;
  top: 48px;
  z-index: 5;
  background: rgb(var(--v-theme-surface));
}

.main-content {
  background: rgb(var(--v-theme-background));
  min-height: 100vh;
}

.user-menu-btn {
  text-transform: none;
  font-weight: 500;
}

.user-name-text {
  max-width: 80px;
  font-size: 0.85rem;
  margin-inline-start: 4px;
}

@media (min-width: 600px) {
  .user-name-text {
    max-width: 150px;
    font-size: 0.95rem;
  }
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* Floating Window Layer */
.tools-layer {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 2000;
  pointer-events: none; /* Allow underlying clicks */
}

.floating-tool-window {
  position: fixed;
  pointer-events: auto; /* Re-enable clicks for the tool itself */
  user-select: none;
}

.tool-premium-card {
  border-radius: 4px !important;
  overflow: hidden;
  border: 1px solid rgba(var(--v-border-color), 0.1) !important;
}

.dialog-premium-header {
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
}

.dialog-premium-header.variant-blue {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}

.dialog-premium-header.variant-purple {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
}

.gap-2 {
  gap: 8px;
}

.tool-content {
  background: #f8fafc;
}

/* Tool Scale Transition */
.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from,
.scale-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
