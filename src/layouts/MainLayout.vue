<template>
  <Sidebar v-model="drawer" />

  <v-app-bar color="surface" elevation="0" class="border-b" height="48">
    <v-app-bar-nav-icon color="primary" @click="drawer = !drawer" class="d-flex d-sm-none" size="small" />

    <v-spacer />

    <!-- Right-side tools container -->
    <div class="d-flex align-center px-0 px-sm-1 ga-2">
      <!-- Search and Balance -->
      <v-btn
        v-if="userStore.currentUser"
        icon="ri-search-line"
        variant="text"
        color="primary"
        @click="isSearchOpen = true"
        class="rounded-lg tour-nav-search"
        :size="xs ? 30 : 34"
      />

      <!-- Updates History Button -->
      <div v-if="userStore.currentUser" class="d-none d-sm-flex">
        <v-tooltip location="bottom">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              icon="ri-sparkling-line"
              variant="text"
              color="primary"
              class="rounded-lg tour-nav-updates"
              size="34"
              @click="showUpdatesHistory"
            />
          </template>
          سجل التحديثات والجديد
        </v-tooltip>
      </div>

      <!-- Contextual Help Button -->
      <v-tooltip location="bottom">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            v-bind="tooltipProps"
            icon="ri-question-line"
            variant="text"
            color="primary"
            class="help-trigger-btn rounded-lg d-none d-sm-inline-flex tour-nav-help contextual-help-trigger"
            size="34"
            @click="isHelpDrawerOpen = true"
          />
        </template>
        المساعدة الإرشادية ودليل الصفحة
      </v-tooltip>

      <AppBalanceDisplay
        v-if="userStore.currentUser"
        :amount="userStore.currentUser.balance"
        perspective="admin"
        custom-class="rounded-pill font-weight-black px-2 tour-nav-balance"
        :height="xs ? 28 : 32"
        prepend-icon="ri-wallet-3-line"
        value-class="text-xxs text-sm-caption"
      />

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

      <!-- Branch Switcher -->
      <BranchSwitcher class="d-none d-sm-flex tour-nav-branch" />

      <!-- Print Format Selection Menu -->
      <v-menu location="bottom end">
        <template #activator="{ props }">
          <v-tooltip location="bottom">
            <template #activator="{ props: tooltipProps }">
              <AppButton
                v-bind="{ ...props, ...tooltipProps }"
                icon
                variant="text"
                color="primary"
                class="d-none d-sm-flex rounded-lg tour-nav-print"
                size="34"
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



      <!-- Theme Switcher for Desktop -->
      <div class="d-none d-sm-flex mx-1">
        <NavbarThemeSwitcher />
      </div>

      <!-- أدوات سريعة -->
      <v-menu v-model="isQuickToolsMenuOpen" :close-on-content-click="false">
        <template #activator="{ props }">
          <AppButton v-bind="props" icon variant="text" color="primary" class="d-none d-sm-flex rounded-lg tour-nav-tools" size="34">
            <v-icon size="20">ri-apps-2-line</v-icon>
          </AppButton>
        </template>
        <v-list density="compact" min-width="200" class="pa-2">
          <div class="text-caption text-grey px-2 mb-2">أدوات الوصول السريع</div>
          <v-row no-gutters>
            <v-col cols="4" class="pa-1">
              <v-card
                variant="tonal"
                color="primary"
                class="text-center pa-2 cursor-pointer d-flex flex-column align-center justify-center"
                height="70"
                @click="appState.openPercentageTool()"
              >
                <v-icon icon="ri-percent-line" size="20" class="mb-1" />
                <div class="text-caption text-no-wrap">حساب نسبة</div>
              </v-card>
            </v-col>
            <v-col cols="4" class="pa-1">
              <v-card
                variant="tonal"
                color="primary"
                class="text-center pa-2 cursor-pointer d-flex flex-column align-center justify-center"
                height="70"
                @click="appState.openCalculator()"
              >
                <v-icon icon="ri-calculator-line" size="20" class="mb-1" />
                <div class="text-caption text-no-wrap">آلة حاسبة</div>
              </v-card>
            </v-col>
            <v-col cols="4" class="pa-1">
              <v-card
                variant="tonal"
                color="primary"
                class="text-center pa-2 cursor-pointer d-flex flex-column align-center justify-center"
                height="70"
                @click="appState.openInstallmentCalc({ mode: 'standalone' })"
              >
                <v-icon icon="ri-calendar-2-line" size="20" class="mb-1" />
                <div class="text-caption text-no-wrap">أقساط</div>
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
              size="28"
              class="me-1"
              :previewable="false"
            />
            <span class="user-name-text text-truncate">{{ userName }}</span>
            <v-icon icon="ri-arrow-down-s-line" size="x-small" />
          </AppButton>
        </template>
        <v-list density="compact">
          <v-list-item prepend-icon="ri-user-settings-line" title="الملف الشخصي" to="/app/profile" />
          <v-list-item v-if="userStore.isAdmin || userStore.isCompanyAdmin" prepend-icon="ri-vip-crown-2-line" title="اشتراكي الحالي" to="/app/my-subscription" />
          <v-list-item v-if="userStore.currentUser" prepend-icon="ri-sparkling-line" title="سجل التحديثات" @click="showUpdatesHistory" />
          <v-list-item prepend-icon="ri-device-line" title="إدارة الأجهزة" to="/app/sessions" />
          <v-list-item v-if="userStore.isStaff" prepend-icon="ri-settings-3-line" title="الإعدادات" to="/app/settings" />

          <!-- أدوات تظهر فقط على الموبايل في القائمة -->
          <template v-if="xs">
            <v-divider class="my-1" />
            
            <div class="px-4 py-2">
              <div class="text-xxs text-grey mb-1">الفرع الحالي</div>
              <BranchSwitcher :show-on-mobile="true" />
            </div>

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

            <!-- Theme Selection Group for Mobile -->
            <v-list-group value="themes" fluid :indent-strategy="'none'">
              <template #activator="{ props }">
                <v-list-item v-bind="props" prepend-icon="ri-palette-line" title="مظهر النظام (الثيم)" />
              </template>

              <v-list-item
                v-for="theme in systemThemes"
                :key="theme.name"
                :title="themeLabels[theme.name]"
                :prepend-icon="theme.icon"
                :active="globalTheme.name.value === theme.name"
                @click="selectTheme(theme.name)"
                size="small"
                class="ps-0"
              />
            </v-list-group>

            <!-- Mini Apps Group for Mobile -->
            <v-list-group value="mini_apps" fluid :indent-strategy="'none'">
              <template #activator="{ props }">
                <v-list-item v-bind="props" prepend-icon="ri-apps-2-line" title="أدوات سريعة" />
              </template>
              <v-list-item
                title="حساب نسبة مئوية"
                prepend-icon="ri-percent-line"
                @click="appState.openPercentageTool()"
                size="small"
                class="ps-0"
              />
              <v-list-item
                title="آلة حاسبة"
                prepend-icon="ri-calculator-line"
                @click="appState.openCalculator()"
                size="small"
                class="ps-0"
              />
              <v-list-item
                title="حساب أقساط"
                prepend-icon="ri-calendar-2-line"
                @click="appState.openInstallmentCalc({ mode: 'standalone' })"
                size="small"
                class="ps-0"
              />
            </v-list-group>

            <v-divider class="my-1" />
            <v-list-item prepend-icon="ri-question-line" title="دليل الصفحة المساعد" @click="isHelpDrawerOpen = true" />
          </template>

          <v-divider class="my-1" />
          <v-list-item prepend-icon="ri-refresh-line" title="تحديث بيانات النظام" @click="showClearCacheDialog = true" class="text-info" />
          <v-list-item prepend-icon="ri-logout-box-line" title="تسجيل الخروج" @click="handleLogout" class="text-error" />
        </v-list>
      </v-menu>
    </div>
  </v-app-bar>

  <v-main class="main-content">
    <!-- حزام تحذير قرب انتهاء ليميت الباقة (يظهر تلقائياً عند 90% استهلاك لأي مورد) -->
    <transition name="expand">
      <div v-if="nearingLimitResources.length > 0" class="limit-warning-bar border-b py-2 px-4 d-flex align-center justify-space-between text-caption font-weight-bold">
        <div class="d-flex align-center ga-2 flex-wrap">
          <v-icon icon="ri-error-warning-fill" color="warning" class="animate-pulse me-1" size="18" />
          <span class="text-warning-light">تنبيه استهلاك الباقة:</span>
          <span v-for="res in nearingLimitResources" :key="res.key" class="text-amber-light me-3">
            وصل استهلاك {{ res.name }} إلى {{ res.percent }}% ({{ res.current }} من {{ res.max }})
          </span>
        </div>
        <v-btn
          color="warning"
          size="x-small"
          variant="flat"
          class="font-weight-black rounded-lg px-3 ms-2"
          to="/app/my-subscription"
        >
          <v-icon icon="ri-vip-crown-line" size="12" class="me-1" />
          ترقية الاشتراك
        </v-btn>
      </div>
    </transition>

    <div class="sticky-breadcrumbs-container border-b bg-surface">
      <v-container fluid class="py-0 px-1">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 text-caption">
          <template #divider>
            <v-icon icon="ri-arrow-left-s-line" size="small" />
          </template>
        </v-breadcrumbs>
      </v-container>
    </div>

    <v-container fluid class="pa-6 position-relative">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <!-- Glassmorphic Paywall Subscription Lock Overlay -->
      <transition name="fade">
        <div v-if="isSubscriptionBlocked" class="premium-subscription-lock-overlay">
          <v-card class="premium-paywall-card text-center pa-6 elevation-8" max-width="480">
            <div class="lock-icon-container mb-4">
              <v-icon icon="ri-lock-password-fill" size="48" color="amber" class="lock-pulse-icon" />
            </div>
            
            <h3 class="text-h6 font-weight-black mb-3 text-white">انتهت الفترة التجريبية للاشتراك 🔒</h3>
            <p class="text-body-2 text-grey-lighten-1 mb-6 lh-relaxed">
              لتتمكن من مواصلة استخدام النظام والوصول إلى كافة الأقسام ولوحة التحكم، يرجى تفعيل أو تجديد باقة اشتراكك.
            </p>
            
            <div class="d-flex flex-column gap-3 align-stretch">
              <v-btn
                color="amber"
                block
                class="font-weight-black text-subtitle-2 rounded-lg py-3 paywall-btn mb-2"
                to="/app/my-subscription"
              >
                <v-icon icon="ri-vip-crown-fill" size="18" class="me-2" />
                تجديد / ترقية الاشتراك الآن
              </v-btn>
              
              <v-btn
                variant="text"
                color="grey-lighten-1"
                class="text-caption rounded-lg"
                @click="handleLogout"
              >
                <v-icon icon="ri-logout-box-line" size="14" class="me-1" />
                تسجيل الخروج
              </v-btn>
            </div>
          </v-card>
        </div>
      </transition>
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
                :initial-data="appState.installmentCalc.initialData"
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
      <!-- Global Percentage Tool -->
      <transition name="scale">
        <div
          v-if="appState.percentageTool.isOpen"
          v-draggable="{ id: 'percent', position: toolPositions.percent }"
          class="floating-tool-window"
          :style="{ zIndex: activeTool === 'percent' ? 2001 : 2000 }"
          @mousedown="setActiveTool('percent')"
          @touchstart="setActiveTool('percent')"
        >
          <v-card width="300" class="tool-premium-card elevation-2">
            <header class="dialog-premium-header pa-3 d-flex align-center justify-space-between text-white drag-handle cursor-move variant-blue">
              <div class="d-flex align-center gap-2">
                <v-icon icon="ri-percent-line" color="white" size="20" />
                <span class="text-subtitle-2 font-weight-bold">حساب النسبة الذكي</span>
              </div>
              <v-btn icon="ri-close-line" variant="tonal" color="white" class="no-drag" size="x-small" @click="appState.closePercentageTool" />
            </header>
            <div class="tool-content">
              <PercentageTool @close="appState.closePercentageTool" />
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

    <!-- Dialog for System Release Notes / What's New Updates -->
    <AppSystemUpdatesDialog ref="systemUpdatesDialog" />
  </v-main>

  <!-- Guidance System Components -->
  <ContextualHelpDrawer
    v-model="isHelpDrawerOpen"
    :tour-key="activeTourKey"
    @restart-tour="handleRestartTour"
  />
  <GuidanceTour />
  <OnboardingChecklist />
  <HintBubble />
  
  <!-- Legal Document Acceptance Modal -->
  <LegalAcceptanceModal ref="legalAcceptanceModal" />
</template>

<script setup>
import { ref, computed, watch, defineAsyncComponent, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useLocaleStore } from '@/stores/locale';
import { useappState } from '@/stores/appState';
import { authService } from '@/api';
import Sidebar from '@/components/layout/Sidebar.vue';
import BranchSwitcher from '@/components/layout/BranchSwitcher.vue';
import NavbarThemeSwitcher from '@/layouts/components/NavbarThemeSwitcher.vue';
import GlobalSearchDialog from '@/layouts/components/GlobalSearchDialog.vue';
import AppSystemUpdatesDialog from '@/components/common/AppSystemUpdatesDialog.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import AppBalanceDisplay from '@/components/common/AppBalanceDisplay.vue';
import Calculator from '@/components/tools/Calculator.vue';
import InstallmentCalc from '@/components/tools/InstallmentCalc.vue';
import PercentageTool from '@/components/tools/PercentageTool.vue';
import LegalAcceptanceModal from '@/modules/legal/components/LegalAcceptanceModal.vue';
import { toast } from 'vue3-toastify';
import { useDisplay, useTheme } from 'vuetify';
import { formatCurrency } from '@/utils/formatters';
import { clearAppCache } from '@/utils/maintenance';

const { global: globalTheme } = useTheme();

const systemThemes = [
  { name: 'light', icon: 'ri-sun-line' },
  { name: 'dark', icon: 'ri-moon-clear-line' },
  { name: 'cozy', icon: 'ri-cup-line' },
];

const themeLabels = {
  light: 'الوضع النهاري',
  dark: 'الوضع الليلي',
  cozy: 'الوضع الدافئ (كوزي)',
};

const selectTheme = (themeNameValue) => {
  globalTheme.name.value = themeNameValue;
  localStorage.setItem('theme', themeNameValue);
};

// استيرادات نظام الإرشاد (Guidance System)
import { useGuidanceStore } from '@/modules/guidance/store/useGuidanceStore';
import { useTour } from '@/modules/guidance/composables/useTour';
import { useHint } from '@/modules/guidance/composables/useHint';
import dashboardTour from '@/modules/guidance/content/tours/dashboard.tour.js';
import invoicesTour from '@/modules/guidance/content/tours/invoices.tour.js';
import productsTour from '@/modules/guidance/content/tours/products.tour.js';
import customersTour from '@/modules/guidance/content/tours/customers.tour.js';
import settingsTour from '@/modules/guidance/content/tours/settings.tour.js';
import usersTour from '@/modules/guidance/content/tours/users.tour.js';
import rolesTour from '@/modules/guidance/content/tours/roles.tour.js';
import notificationWorkflowsTour from '@/modules/guidance/content/tours/notification-workflows.tour.js';
import notificationTemplatesTour from '@/modules/guidance/content/tours/notification-templates.tour.js';
import mailSettingsTour from '@/modules/guidance/content/tours/mail-settings.tour.js';
import whatsappSettingsTour from '@/modules/guidance/content/tours/whatsapp-settings.tour.js';

// تعريف المكونات بشكل غير متزامن (Lazy loading) لمنع زيادة حجم الـ main bundle
const GuidanceTour = defineAsyncComponent(() => import('@/modules/guidance/components/GuidanceTour.vue'));
const OnboardingChecklist = defineAsyncComponent(() => import('@/modules/guidance/components/OnboardingChecklist.vue'));
const HintBubble = defineAsyncComponent(() => import('@/modules/guidance/components/HintBubble.vue'));
const ContextualHelpDrawer = defineAsyncComponent(() => import('@/modules/guidance/components/ContextualHelpDrawer.vue'));

const isHelpDrawerOpen = ref(false);
const { xs } = useDisplay();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const localeStore = useLocaleStore();
const appState = useappState();
const guidanceStore = useGuidanceStore();
const { startTour } = useTour();
const { showHint } = useHint();

// مراقبة تغيير الصفحة لبدء الجولة التعريفية المناسبة تلقائياً أو عرض تلميحات سريعة
watch(
  () => route.name,
  (newRouteName) => {
    if (!newRouteName) return;
    
    // تأخير طفيف لضمان استقرار تحميل مكونات الصفحة وتواجد العناصر المستهدفة
    setTimeout(() => {
      if (newRouteName === 'admin-dashboard') {
        const started = startTour(dashboardTour, 'tour.dashboard');
        if (!started) {
          showHint({
            key: 'hint.dashboard_drag',
            title: 'ترتيب واجهة العمل',
            content: 'يمكنك سحب وإفلات الأدوات المساعدة كالحاسبة وحاسبة النسب ووضعها في أي مكان يناسبك على الشاشة لسهولة الوصول.'
          });
        }
      } else if (newRouteName === 'invoices') {
        const started = startTour(invoicesTour, 'tour.invoices');
        if (!started) {
          showHint({
            key: 'hint.invoice_installments',
            title: 'جدولة المستحقات',
            content: 'عند إنشاء فاتورة، يمكنك تحديد طريقة الدفع بالأقساط وجدولتها، وسيقوم النظام بتنبيهك تلقائياً عند حلول موعد السداد.'
          });
        }
      } else if (newRouteName === 'products') {
        const started = startTour(productsTour, 'tour.products');
        if (!started) {
          showHint({
            key: 'hint.product_excel',
            title: 'استيراد سريع للمنتجات',
            content: 'وفر وقتك واستخدم ميزة استيراد المنتجات من ملف Excel لرفع كافة أصناف ومخزون متجرك دفعة واحدة.'
          });
        }
      } else if (newRouteName === 'customers') {
        const started = startTour(customersTour, 'tour.customers');
        if (!started) {
          showHint({
            key: 'hint.customer_statement',
            title: 'كشف حساب العملاء',
            content: 'يمكنك استخراج كشف حساب مالي تفصيلي لأي عميل بنقرة واحدة وتصديره بصيغة PDF لمشاركته مباشرة.'
          });
        }
      } else if (newRouteName === 'company' || newRouteName === 'settings') {
        startTour(settingsTour, 'tour.settings');
      } else if (newRouteName === 'users') {
        startTour(usersTour, 'tour.users');
      } else if (newRouteName === 'roles') {
        startTour(rolesTour, 'tour.roles');
      } else if (newRouteName === 'notification-workflows') {
        startTour(notificationWorkflowsTour, 'tour.notification_workflows');
      } else if (newRouteName === 'notification-templates') {
        startTour(notificationTemplatesTour, 'tour.notification_templates');
      } else if (newRouteName === 'mail-settings') {
        startTour(mailSettingsTour, 'tour.mail_settings');
      } else if (newRouteName === 'whatsapp-settings') {
        startTour(whatsappSettingsTour, 'tour.whatsapp_settings');
      }
    }, 1200);
  },
  { immediate: true }
);

// المساعدة السياقية النشطة للجولة التعريفية
const activeTourKey = computed(() => {
  if (route.name === 'admin-dashboard') return 'tour.dashboard';
  if (route.name === 'invoices') return 'tour.invoices';
  if (route.name === 'products') return 'tour.products';
  if (route.name === 'customers') return 'tour.customers';
  if (route.name === 'company' || route.name === 'settings') return 'tour.settings';
  if (route.name === 'users') return 'tour.users';
  if (route.name === 'roles') return 'tour.roles';
  if (route.name === 'notification-workflows') return 'tour.notification_workflows';
  if (route.name === 'notification-templates') return 'tour.notification_templates';
  if (route.name === 'mail-settings') return 'tour.mail_settings';
  if (route.name === 'whatsapp-settings') return 'tour.whatsapp_settings';
  return '';
});

const handleRestartTour = () => {
  toast.info('جاري بدء الجولة...', { autoClose: 1500 });
  
  setTimeout(() => {
    let success = false;
    if (route.name === 'admin-dashboard') {
      success = startTour(dashboardTour, 'tour.dashboard', true);
    } else if (route.name === 'invoices') {
      success = startTour(invoicesTour, 'tour.invoices', true);
    } else if (route.name === 'products') {
      success = startTour(productsTour, 'tour.products', true);
    } else if (route.name === 'customers') {
      success = startTour(customersTour, 'tour.customers', true);
    } else if (route.name === 'company' || route.name === 'settings') {
      success = startTour(settingsTour, 'tour.settings', true);
    } else if (route.name === 'users') {
      success = startTour(usersTour, 'tour.users', true);
    } else if (route.name === 'roles') {
      success = startTour(rolesTour, 'tour.roles', true);
    } else if (route.name === 'notification-workflows') {
      success = startTour(notificationWorkflowsTour, 'tour.notification_workflows', true);
    } else if (route.name === 'notification-templates') {
      success = startTour(notificationTemplatesTour, 'tour.notification_templates', true);
    } else if (route.name === 'mail-settings') {
      success = startTour(mailSettingsTour, 'tour.mail_settings', true);
    } else if (route.name === 'whatsapp-settings') {
      success = startTour(whatsappSettingsTour, 'tour.whatsapp_settings', true);
    } else {
      toast.error('عذراً، لا توجد جولة إرشادية لهذه الصفحة.');
      return;
    }
    
    if (!success) {
      toast.error('حدث خطأ أثناء تحميل الجولة. يرجى تنشيط الصفحة.');
    }
  }, 350); // delay to let drawer close cleanly
};

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

onMounted(async () => {
  window.addEventListener('keydown', handleKeyDown);

  // تهيئة إرشاد المستخدم والشركة النشطة
  await guidanceStore.initGuidance();

  // تصفير المواقع الافتراضية القديمة لضمان تفعيل التوسيط الجديد
  const oldCalc = localStorage.getItem('tool_pos_calc');
  if (oldCalc === '{"x":50,"y":100}') {
    localStorage.removeItem('tool_pos_calc');
    toolPositions.value.calc = null;
  }

  const oldInst = localStorage.getItem('tool_pos_installment');
  if (oldInst === '{"x":400,"y":100}') {
    toolPositions.value.installment = null;
  }

  // فحص الشروط والمستندات القانونية المعلقة للمستخدم عند دخول لوحة التحكم
  legalAcceptanceModal.value?.checkPendingAgreements();
});

const legalAcceptanceModal = ref(null);

// إعادة الفحص عند تغيير مسار الصفحة لضمان الامتثال
watch(
  () => route.path,
  () => {
    legalAcceptanceModal.value?.checkPendingAgreements();
  }
);

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const userName = computed(() => userStore.currentUser?.full_name || 'المستخدم');

// التحقق من حالة الاشتراك لتأمين لوحة العمل في حال انتهاء الصلاحية
const isSubscriptionBlocked = computed(() => {
  if (!userStore.currentUser) return false;
  if (userStore.isAdmin) return false; // السوبر أدمن مستثنى
  if (!userStore.isStaff) return false; // مستخدمو بوابة العملاء مستثنون
  if (route.name === 'my-subscription') return false; // صفحة الاشتراك مستثناة لتمكين الدفع

  const sub = userStore.currentUser?.subscription;
  if (!sub) return true; // غياب معلومات الاشتراك يعني غير نشط

  const status = sub.status || 'inactive';
  if (status === 'inactive' || status === 'expired' || status === 'pending') {
    return true;
  }

  if (status === 'trial' && sub.trial_ends_at) {
    return new Date(sub.trial_ends_at) < new Date();
  }

  return false;
});

// فحص الموارد التي تقترب من استهلاك 90% أو أكثر
const nearingLimitResources = computed(() => {
  const limits = userStore.currentUser?.subscription?.limits;
  if (!limits) return [];

  const result = [];
  const resourceNames = {
    users: 'المستخدمين',
    products: 'المنتجات',
    invoices: 'الفواتير',
    warehouses: 'المخازن'
  };

  Object.keys(limits).forEach(key => {
    const limitObj = limits[key];
    if (limitObj && !limitObj.is_unlimited && limitObj.percent >= 90) {
      result.push({
        key,
        name: resourceNames[key] || key,
        current: limitObj.current,
        max: limitObj.max,
        percent: limitObj.percent
      });
    }
  });

  return result;
});

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
    await authService.logout({ showToast: true });
  } catch (error) {
    toast.error('فشل تسجيل الخروج');
  }
};

const isQuickToolsMenuOpen = ref(false);
const confirmLogoutDialog = ref(null);
const confirmCacheDialog = ref(null);
const showClearCacheDialog = ref(false);
const systemUpdatesDialog = ref(null);
const helpBtnRef = ref(null);

const showUpdatesHistory = () => {
  systemUpdatesDialog.value?.show(true);
};

const openHelpDrawer = () => {
  helpBtnRef.value?.open();
};

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
  percent: JSON.parse(localStorage.getItem('tool_pos_percent')),
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
  () => appState.percentageTool.isOpen,
  isOpen => {
    if (isOpen && !toolPositions.value.percent) {
      toolPositions.value.percent = getDefaultPos(300, 400);
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
/* Glassmorphic Subscription Paywall Lock Overlay */
.premium-subscription-lock-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.75); /* Slate 900 with opacity */
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  border-radius: 16px;
  animation: fadeIn 0.4s ease;
  padding: 24px;
}

.premium-paywall-card {
  background: rgba(30, 41, 59, 0.8) !important; /* Slate 800 with opacity */
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  backdrop-filter: blur(8px);
  border-radius: 20px !important;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2) !important;
}

.lock-icon-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: rgba(245, 158, 11, 0.1); /* Amber 500 with opacity */
  border-radius: 50%;
  border: 1px solid rgba(245, 158, 11, 0.2);
  margin: 0 auto;
}

.lock-pulse-icon {
  animation: pulseLock 2s infinite ease-in-out;
}

.paywall-btn {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important;
  color: #0f172a !important;
  box-shadow: 0 4px 14px 0 rgba(245, 158, 11, 0.3) !important;
  transition: all 0.3s ease !important;
}

.paywall-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px 0 rgba(245, 158, 11, 0.4) !important;
}

/* Fade Transition for paywall */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes pulseLock {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); filter: drop-shadow(0 0 8px rgba(245, 158, 11, 0.5)); }
}

.sticky-breadcrumbs-container {
  position: sticky;
  top: 33px;
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
    max-width: 120px;
    font-size: 0.85rem;
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

.dialog-premium-header.variant-green {
  background: linear-gradient(135deg, #059669 0%, #10b981 100%);
}

.gap-2 {
  gap: 8px;
}

.tool-content {
  border-radius: 4px !important;
  border: 4px solid rgba(var(--v-theme-primary), 0.08) !important;
  background: #f1f5f9;
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

/* Limit Warning Bar Styles */
.limit-warning-bar {
  background: #fffbeb;
  border-bottom: 1px solid #fde68a !important;
  color: #92400e !important;
  z-index: 10;
  position: relative;
  transition: all 0.3s ease;
}

.text-warning-light {
  color: #b45309 !important;
}

.text-amber-light {
  color: #d97706 !important;
}

.bg-warning-glow {
  background: rgba(245, 158, 11, 0.08) !important;
}

/* Dark Theme overrides for Limit Warning Bar */
.v-theme--dark .limit-warning-bar {
  background: linear-gradient(90deg, rgba(217, 119, 6, 0.16), rgba(245, 158, 11, 0.05)) !important;
  border-bottom: 1px solid rgba(245, 158, 11, 0.28) !important;
  color: #fef08a !important;
}

.v-theme--dark .text-warning-light {
  color: #fbbf24 !important;
}

.v-theme--dark .text-amber-light {
  color: #fef08a !important;
}

@keyframes warningPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.05); }
}

.animate-pulse {
  animation: warningPulse 2s infinite ease-in-out;
  display: inline-block;
}

/* Expand Transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 100px;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
</style>
