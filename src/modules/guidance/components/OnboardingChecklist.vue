<script setup>
/**
 * مكون قائمة البدء للمستخدمين الجدد (Onboarding Checklist)
 * يظهر كـ Widget جانبي في الركن السفلي الأيسر، ويوجه المستخدمين الجدد
 * لإكمال الخطوات الأساسية لتهيئة النظام (إضافة منتج، إضافة عميل، إنشاء فاتورة، ضبط إعدادات الشركة).
 */
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGuidance } from '../composables/useGuidance';
import { useUserStore } from '@/stores/user';

const router = useRouter();
const { isCompleted, markAsCompleted, uncompleteStep, isEnabled } = useGuidance();
const userStore = useUserStore();

const isCollapsed = ref(true);
const showCongratulations = ref(false);

/**
 * تبديل حالة إكمال الخطوة يدوياً عند النقر على المربع
 */
async function toggleStep(step) {
  if (isCompleted(step.key)) {
    await uncompleteStep(step.key);
  } else {
    await markAsCompleted(step.key);
  }
}

// الخطوات الأساسية للتهيئة ومفاتيحها ومسارات التوجيه
const steps = ref([
  {
    key: 'onboarding.setup_company',
    title: 'إعداد تفضيلات وبيانات الشركة',
    description: 'إضافة شعار الشركة، الاسم، والعنوان لطباعتها على الفواتير.',
    route: '/app/settings' // مسار إعدادات الشركة الافتراضي
  },
  {
    key: 'onboarding.add_product',
    title: 'إضافة أول منتج أو خدمة',
    description: 'أدخل تفاصيل منتجاتك أو خدماتك مع الأسعار والكميات المتاحة.',
    route: '/app/products/create'
  },
  {
    key: 'onboarding.add_customer',
    title: 'إضافة عميل جديد للنظام',
    description: 'تسجيل بيانات عملائك لمتابعة حساباتهم وإصدار فواتيرهم.',
    route: '/app/users'
  },
  {
    key: 'onboarding.create_invoice',
    title: 'إنشاء أول فاتورة مبيعات',
    description: 'جرب إصدار فاتورة مبيعات لعميلك الأول وطباعتها مباشرة.',
    route: '/app/invoices/create'
  }
]);

// حساب عدد الخطوات المكتملة
const completedCount = computed(() => {
  return steps.value.filter(step => isCompleted(step.key)).length;
});

// النسبة المئوية للإكمال
const progressPercent = computed(() => {
  return Math.round((completedCount.value / steps.value.length) * 100);
});

// هل كل الخطوات مكتملة؟
const isAllCompleted = computed(() => {
  return completedCount.value === steps.value.length;
});

// هل يجب إظهار الـ Widget؟
const shouldShowWidget = computed(() => {
  if (!isEnabled.value) return false;
  
  // لا يظهر للمستخدم القديم جداً (أكثر من 30 يوم)
  try {
    const createdAt = userStore.currentUser?.created_at;
    if (createdAt) {
      const createdDate = new Date(createdAt);
      const diffTime = Math.abs(new Date() - createdDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays > 30) return false;
    }
  } catch (e) {
    // Silent fail
  }

  // إذا تم إكمال كل الخطوات، وحصل المستخدم على تهنئة مسبقاً، نغلقها
  if (isAllCompleted.value && isCompleted('onboarding.complete_congrats')) {
    return false;
  }

  return true;
});

/**
 * التوجيه لصفحة المهمة
 */
function handleStepClick(step) {
  if (isCompleted(step.key)) return;
  router.push(step.route);
  isCollapsed.value = true; // غلق اللوحة للتركيز
}

/**
 * إنهاء التهنئة وإخفاء الـ Widget بشكل دائم
 */
async function finishOnboarding() {
  showCongratulations.value = false;
  await markAsCompleted('onboarding.complete_congrats');
}

// مراقبة الاكتمال لعرض التهنئة
watch(isAllCompleted, (newVal) => {
  if (newVal && !isCompleted('onboarding.complete_congrats')) {
    showCongratulations.value = true;
    isCollapsed.value = false;
  }
});

onMounted(() => {
  // للعملاء الجدد، نترك اللوحة مطوية افتراضياً لعدم إزعاج المستخدم
  if (shouldShowWidget.value && completedCount.value === 0) {
    // isCollapsed.value = false; (تم الإلغاء بناءً على طلب المستخدم)
  }
  
  // إذا اكتملت الخطوات بالفعل ولم تؤكد التهنئة بعد
  if (isAllCompleted.value && !isCompleted('onboarding.complete_congrats')) {
    showCongratulations.value = true;
    isCollapsed.value = false;
  }
});
</script>

<template>
  <div v-if="shouldShowWidget" class="onboarding-checklist-wrapper">
    <!-- التهنئة عند الاكتمال -->
    <div v-if="showCongratulations" class="congrats-card border shadow-lg text-center pa-5 animate-scale-up">
      <div class="congrats-icon-wrap mb-3">
        <v-icon icon="ri-trophy-line" color="warning" size="48" class="animate-bounce" />
      </div>
      <h3 class="text-h6 font-weight-bold text-slate-800 mb-2">رائع! لقد أكملت التهيئة بالكامل 🎉</h3>
      <p class="text-body-2 text-slate-600 mb-4">
        أصبح حسابك الآن جاهزاً بنسبة 100% لإدارة أعمالك بكفاءة عالية في HWNix ERP.
      </p>
      <button class="btn-success-action w-100 py-2 rounded-pill font-weight-bold" @click="finishOnboarding">
        ابدأ العمل الفعلي
      </button>
    </div>

    <!-- بطاقة الخطوات الرئيسية -->
    <div 
      v-else 
      :class="['checklist-card border shadow-lg', { 'collapsed': isCollapsed }]"
    >
      <!-- الهيدر والتقدم -->
      <div class="checklist-header" @click="isCollapsed = !isCollapsed">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center gap-2">
            <v-icon icon="ri-checkbox-circle-line" class="header-icon" />
            <span class="header-title font-weight-bold">خطوات الإعداد والتهيئة</span>
          </div>
          <div class="d-flex align-center gap-2">
            <span class="progress-label">{{ progressPercent }}%</span>
            <v-icon :icon="isCollapsed ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'" size="20" class="toggle-arrow" />
          </div>
        </div>
        
        <!-- شريط التقدم السريع -->
        <div class="progress-bar-container mt-2">
          <div class="progress-bar-fill" :style="{ width: `${progressPercent}%` }"></div>
        </div>
      </div>

      <!-- قائمة المهام (تظهر فقط عندما لا تكون مطوية) -->
      <div v-show="!isCollapsed" class="checklist-body animate-slide-up">
        <div class="welcome-text text-caption text-slate-500 mb-3">
          مرحباً بك! أكمل الخطوات التالية لتجهيز نظامك للعمل الفعلي:
        </div>

        <div class="steps-list">
          <div 
            v-for="step in steps" 
            :key="step.key"
            :class="['step-item', { 'step-completed': isCompleted(step.key) }]"
            @click="handleStepClick(step)"
          >
            <div class="step-checkbox" @click.stop="toggleStep(step)" title="وسم الخطوة كمنتهية يدوياً">
              <v-icon 
                :icon="isCompleted(step.key) ? 'ri-checkbox-fill' : 'ri-checkbox-blank-line'" 
                :color="isCompleted(step.key) ? 'success' : 'grey-darken-1'" 
                size="20"
              />
            </div>
            <div class="step-content">
              <div class="step-title font-weight-bold text-body-2">
                {{ step.title }}
              </div>
              <div class="step-desc text-caption text-slate-500">
                {{ step.description }}
              </div>
            </div>
            <div v-if="!isCompleted(step.key)" class="step-arrow">
              <v-icon icon="ri-arrow-left-s-line" size="16" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.onboarding-checklist-wrapper {
  position: fixed;
  bottom: 24px;
  left: 24px;
  z-index: 998;
  width: 340px;
  direction: rtl;
  pointer-events: auto;
}

/* بطاقة التهنئة الفاخرة */
.congrats-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.congrats-icon-wrap {
  width: 80px;
  height: 80px;
  background: rgba(255, 193, 7, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.btn-success-action {
  background: #4caf50;
  color: #fff;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
  transition: all 0.2s;
}

.btn-success-action:hover {
  background: #43a047;
  box-shadow: 0 6px 14px rgba(76, 175, 80, 0.4);
}

/* بطاقة قائمة الخطوات */
.checklist-card {
  background: #f1f5f9; /* تغميق لون الخلفية قليلاً لإبرازها ومنع التداخل */
  border-radius: 14px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border: 1.5px solid rgba(var(--v-theme-primary), 0.15); /* إبراز الحدود */
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important; /* ظل أقوى وأبرز */
}

.checklist-card.collapsed {
  width: 280px;
}

.checklist-header {
  padding: 12px 16px;
  cursor: pointer;
  background: #ffffff; /* هيدر أبيض نظيف وبارز */
  border-bottom: 1px solid #e2e8f0;
  user-select: none;
}

.checklist-header:hover {
  background: #f8fafc;
}

.header-icon {
  color: rgb(var(--v-theme-primary));
}

.header-title {
  font-size: 0.85rem;
  color: #1e293b;
}

.progress-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.toggle-arrow {
  color: #64748b;
}

/* شريط التقدم */
.progress-bar-container {
  height: 6px;
  background: #e2e8f0;
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: rgb(var(--v-theme-primary));
  border-radius: 9999px;
  transition: width 0.4s ease;
}

.checklist-body {
  padding: 16px;
  max-height: 380px;
  overflow-y: auto;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px; /* مسافة أوسع قليلاً للترتيب */
}

/* عناصر القائمة ككروت مستقلة بيضاء */
.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff; /* كرت أبيض متباين */
  border: 1px solid #e2e8f0; /* حدود ناعمة */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.step-item:hover:not(.step-completed) {
  background: #ffffff;
  border-color: rgba(var(--v-theme-primary), 0.25);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  transform: translateX(-4px);
}

.step-completed {
  opacity: 0.75;
  background: rgba(76, 175, 80, 0.05); /* لون إكمال ناعم ومميز */
  border-color: rgba(76, 175, 80, 0.15);
}

.step-checkbox {
  margin-top: 2px;
  flex-shrink: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: transform 0.15s ease;
}

.step-checkbox:hover {
  transform: scale(1.2);
}

.step-content {
  flex-grow: 1;
}

.step-title {
  color: #1e293b;
  margin-bottom: 2px;
}

.step-completed .step-title {
  text-decoration: line-through;
  color: #64748b;
}

.step-desc {
  font-size: 0.72rem;
  line-height: 1.4;
}

.step-arrow {
  color: #94a3b8;
  margin-top: 10px;
}

/* أنيميشن ناعم للظهور */
.animate-scale-up {
  animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.animate-slide-up {
  animation: slideUp 0.25s ease-out forwards;
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes scaleUp {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>
