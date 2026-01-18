<template>
  <Sidebar v-model="drawer" />

  <v-app-bar color="surface" elevation="0" class="border-b">
    <v-app-bar-nav-icon color="primary" @click="drawer = !drawer" class="d-flex d-sm-none" />

    <v-spacer />

    <!-- عرض الرصيد للمستحدم الحالى -->
    <div v-if="userStore.currentUser" class="d-flex align-center me-4">
      <div class="d-flex flex-column align-end line-height-tight">
        <span class="text-caption text-grey d-none d-sm-inline">رصيدك الحالي</span>
        <span class="font-weight-black text-body-1" :class="userStore.currentUser.balance < 0 ? 'text-error' : 'text-success'">
          {{ formatCurrency(userStore.currentUser.balance) }}
        </span>
      </div>
    </div>

    <v-tooltip location="bottom">
      <template #activator="{ props: tooltipProps }">
        <AppButton v-bind="tooltipProps" icon variant="text" @click="toggleLanguage" class="mx-1">
          <v-icon>ri-translate-2</v-icon>
        </AppButton>
      </template>
      {{ localeStore.locale === 'ar' ? 'English' : 'عربي' }}
    </v-tooltip>

    <!-- أدوات سريعة -->
    <v-menu v-model="isQuickToolsMenuOpen" :close-on-content-click="false">
      <template #activator="{ props }">
        <AppButton v-bind="props" icon variant="text" class="mx-1">
          <v-icon>ri-apps-2-line</v-icon>
        </AppButton>
      </template>
      <v-list density="compact" min-width="200" class="pa-2">
        <div class="text-caption text-grey px-2 mb-2">أدوات الوصول السريع</div>
        <v-row no-gutters>
          <v-col cols="6" class="pa-1">
            <v-card variant="tonal" color="primary" class="text-center pa-3 cursor-pointer" @click="openCalculator">
              <v-icon icon="ri-calculator-line" size="24" />
              <div class="text-caption mt-1">آلة حاسبة</div>
            </v-card>
          </v-col>
          <v-col cols="6" class="pa-1">
            <v-card variant="tonal" color="info" class="text-center pa-3 cursor-pointer" @click="openInstallmentCalc">
              <v-icon icon="ri-calendar-2-line" size="24" />
              <div class="text-caption mt-1">حساب أقساط</div>
            </v-card>
          </v-col>
        </v-row>
      </v-list>
    </v-menu>

    <v-menu>
      <template #activator="{ props }">
        <AppButton v-bind="props" variant="text" class="user-menu-btn px-2">
          <AppAvatar :img-url="userStore.currentUser?.avatar_url" :name="userStore.currentUser?.full_name" size="30" class="ml-2" />
          <span class="d-none d-sm-inline">{{ userName }}</span>
          <v-icon icon="ri-arrow-down-s-line" size="x-small" class="ms-1" />
        </AppButton>
      </template>
      <v-list density="compact">
        <v-list-item prepend-icon="ri-user-settings-line" title="الملف الشخصي" to="/profile" />
        <v-list-item prepend-icon="ri-settings-3-line" title="الإعدادات" to="/settings" />
        <v-divider class="my-1" />
        <v-list-item prepend-icon="ri-logout-box-line" title="تسجيل الخروج" @click="handleLogout" class="text-error" />
      </v-list>
    </v-menu>
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

    <!-- Floating Tools Overlay -->
    <div v-if="isCalculatorOpen || isInstallmentCalcOpen" class="tools-overlay">
      <div
        v-if="isCalculatorOpen"
        v-draggable="{ id: 'calc', position: toolPositions.calc }"
        class="floating-tool-wrapper"
        :style="{
          top: toolPositions.calc.y + 'px',
          left: toolPositions.calc.x + 'px',
          zIndex: activeTool === 'calc' ? 2001 : 2000,
        }"
        @mousedown="setActiveTool('calc')"
        @touchstart="setActiveTool('calc')"
      >
        <Calculator @close="isCalculatorOpen = false" />
      </div>
      <div
        v-if="isInstallmentCalcOpen"
        v-draggable="{ id: 'installment', position: toolPositions.installment }"
        class="floating-tool-wrapper"
        :style="{
          top: toolPositions.installment.y + 'px',
          left: toolPositions.installment.x + 'px',
          zIndex: activeTool === 'installment' ? 2001 : 2000,
        }"
        @mousedown="setActiveTool('installment')"
        @touchstart="setActiveTool('installment')"
      >
        <InstallmentCalc @close="isInstallmentCalcOpen = false" />
      </div>
    </div>
  </v-main>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useLocaleStore } from '@/stores/locale';
import { authService } from '@/api';
import Sidebar from '@/components/layout/Sidebar.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import Calculator from '@/components/tools/Calculator.vue';
import InstallmentCalc from '@/components/tools/InstallmentCalc.vue';
import { toast } from 'vue3-toastify';
import { useDisplay } from 'vuetify';

const { xs } = useDisplay();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const localeStore = useLocaleStore();

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

const userName = computed(() => userStore.currentUser?.full_name || 'المستخدم');

const formatCurrency = amount => {
  if (amount === undefined || amount === null) return '0 ج.م';
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(amount);
};

const breadcrumbs = computed(() => {
  const items = [{ title: 'الرئيسية', to: '/dashboard', disabled: false }];
  if (route.meta.breadcrumbs) {
    items.push(...route.meta.breadcrumbs);
  } else if (route.meta.title) {
    items.push({ title: route.meta.title, disabled: true });
  }
  return items;
});

const toggleLanguage = () => {
  localeStore.toggleLocale();
  toast.success(localeStore.locale === 'ar' ? 'تم التبديل للعربية' : 'Switched to English');
};

const handleLogout = async () => {
  try {
    await authService.logout();
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/login');
  } catch (error) {
    toast.error('فشل تسجيل الخروج');
  }
};

// أدوات النظام
const isCalculatorOpen = ref(false);
const isInstallmentCalcOpen = ref(false);
const isQuickToolsMenuOpen = ref(false);
const activeTool = ref(null); // لتتبع التطبيق النشط حالياً

// دوال مساعدة لفتح الأدوات وإغلاق القائمة
const openCalculator = () => {
  isCalculatorOpen.value = true;
  isQuickToolsMenuOpen.value = false;
  activeTool.value = 'calc'; // جعله نشطاً عند الفتح
};

const openInstallmentCalc = () => {
  isInstallmentCalcOpen.value = true;
  isQuickToolsMenuOpen.value = false;
  activeTool.value = 'installment'; // جعله نشطاً عند الفتح
};

// تعيين التطبيق النشط (للنقر والسحب)
const setActiveTool = toolId => {
  activeTool.value = toolId;
};

// إدارة سحب وإسقاط الأدوات وتخزين مواقعها
const toolPositions = ref({
  calc: JSON.parse(localStorage.getItem('tool_pos_calc')) || { x: 20, y: 70 },
  installment: JSON.parse(localStorage.getItem('tool_pos_installment')) || { x: 320, y: 70 },
});

const savePosition = (id, pos) => {
  toolPositions.value[id] = pos;
  localStorage.setItem(`tool_pos_${id}`, JSON.stringify(pos));
};

// Directive للسحب والإفلات
const vDraggable = {
  mounted(el, binding) {
    const handle = el.querySelector('.drag-handle') || el;
    let startX, startY, initialX, initialY;

    const onMouseDown = e => {
      // منع التفاعل إذا كان المستخدم يضغط على زر
      if (e.target.closest('button')) return;

      e.preventDefault();
      startX = e.clientX;
      startY = e.clientY;

      // الحصول على الموقع الحالي الفعلي للعنصر من الـ DOM لضمان عدم القفز
      initialX = el.offsetLeft;
      initialY = el.offsetTop;

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = e => {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      const newPos = { x: initialX + dx, y: initialY + dy };

      // تطبيق فوري للموقع على العنصر للنعومة
      el.style.left = `${newPos.x}px`;
      el.style.top = `${newPos.y}px`;

      // تخزين الموقع المؤقت على العنصر للرجوع إليه عند الانتهاء
      el._currentPos = newPos;
    };

    const onMouseUp = () => {
      if (el._currentPos) {
        savePosition(binding.value.id, el._currentPos);
      }
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    handle.addEventListener('mousedown', onMouseDown);

    // دعم اللمس للجوال
    const onTouchStart = e => {
      if (e.target.closest('button')) return;
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      initialX = el.offsetLeft;
      initialY = el.offsetTop;
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
    };

    const onTouchMove = e => {
      const touch = e.touches[0];
      const dx = touch.clientX - startX;
      const dy = touch.clientY - startY;
      const newPos = { x: initialX + dx, y: initialY + dy };
      el.style.left = `${newPos.x}px`;
      el.style.top = `${newPos.y}px`;
      el._currentPos = newPos;
    };

    const onTouchEnd = () => {
      if (el._currentPos) {
        savePosition(binding.value.id, el._currentPos);
      }
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    handle.addEventListener('touchstart', onTouchStart);
  },
  // تأكد من تحديث المعاملات إذا تغيرت من الخارج
  updated(el, binding) {
    if (binding.value.position && !el._currentPos) {
      el.style.left = `${binding.value.position.x}px`;
      el.style.top = `${binding.value.position.y}px`;
    }
  },
};
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

/* Floating Tools Positioning */
.tools-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 2000;
}
.floating-tool-wrapper {
  position: absolute;
  pointer-events: auto;
  filter: drop-shadow(0 10px 25px rgba(0, 0, 0, 0.2));
  user-select: none;
}
.cursor-move {
  cursor: move !important;
}
.calc-pos {
  top: 70px;
  left: 20px;
}
.installment-pos {
  top: 70px;
  left: 320px;
}
</style>
