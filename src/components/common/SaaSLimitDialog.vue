<template>
  <v-dialog v-model="appState.saasLimit.isOpen" max-width="500" persistent class="saas-limit-dialog">
    <div class="saas-limit-card">
      <!-- زر الإغلاق العلوي -->
      <v-btn icon="ri-close-line" variant="text" color="white" size="small" class="close-btn" @click="appState.closeSaasLimit()" />

      <div class="saas-limit-body">
        <!-- الأيقونة التنبيهية المتوهجة -->
        <div class="glow-icon-wrap">
          <div class="glow-pulse"></div>
          <v-icon icon="ri-vip-crown-fill" size="40" color="amber" />
        </div>

        <!-- العنوان -->
        <h2 class="dialog-title mt-4">خطتك الحالية بحاجة لترقية!</h2>
        <p class="dialog-subtitle">
          لقد وصلت للحد الأقصى المسموح به لإنشاء <strong class="highlight-text">{{ resourceLabel }}</strong
          >.
        </p>

        <!-- حالة التحميل -->
        <div v-if="loading" class="text-center py-6">
          <v-progress-circular color="warning" indeterminate size="32" />
          <div class="mt-2 text-caption text-grey">جاري جلب إحصائيات استهلاكك...</div>
        </div>

        <!-- تفاصيل الاستهلاك الفوري -->
        <div v-else-if="usage" class="usage-section mt-4 w-100">
          <div class="usage-card">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="usage-label">الاستهلاك الحالي لمورد {{ resourceLabel }}:</span>
              <span class="usage-number font-weight-bold"> {{ usage.current }} / {{ usage.max === 'غير محدود' ? '∞' : usage.max }} </span>
            </div>

            <!-- شريط التقدم التفاعلي -->
            <div class="progress-track">
              <div class="progress-fill" :class="progressColorClass" :style="{ width: progressPercent + '%' }"></div>
            </div>

            <div class="d-flex justify-between text-caption mt-1 text-grey-darken-1">
              <span>خطتك: {{ planName }}</span>
              <span class="ms-auto" :class="progressTextClass">{{ progressPercent }}% مستهلك</span>
            </div>
          </div>
        </div>

        <!-- رسالة الخطأ الواردة من السيرفر -->
        <div class="server-msg-box mt-4">
          <v-icon icon="ri-information-line" size="16" class="me-2" style="color: #60a5fa" />
          <p class="server-msg">{{ appState.saasLimit.message }}</p>
        </div>

        <!-- نصائح للمستخدم للمحافظة على بياناته -->
        <div class="safety-tip mt-3">
          <v-icon icon="ri-checkbox-shield-line" size="14" class="me-1" color="success" />
          <span>تنبيه: يمكنك إغلاق هذه النافذة لنسخ بياناتك المكتوبة حالياً دون أن تفقدها.</span>
        </div>

        <!-- أزرار الإجراءات -->
        <div class="actions-row mt-6 w-100">
          <button class="action-btn action-btn--primary" @click="goToUpgrade">
            <v-icon icon="ri-arrow-left-up-line" size="16" class="me-1" />
            ترقية باقة الاشتراك الآن
          </button>

          <button class="action-btn action-btn--secondary mt-2" @click="appState.closeSaasLimit()">إغلاق ومراجعة البيانات</button>
        </div>
      </div>
    </div>
  </v-dialog>
</template>

<script setup>
//   مكون SaaSLimitDialog لعرض تحذيرات ناعمة ومفصلة عند تخطي حدود الموارد باشتراك SaaS
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useappState } from '@/stores/appState';
import apiClient from '@/api/axios.config';

const appState = useappState();
const router = useRouter();

const loading = ref(false);
const usageData = ref(null);

const resource = computed(() => appState.saasLimit.resource);

// ترجمة المورد للعربية
const resourceLabel = computed(() => {
  const r = resource.value;
  if (r === 'users') return 'المستخدمين';
  if (r === 'products') return 'المنتجات';
  if (r === 'invoices') return 'الفواتير';
  if (r === 'warehouses') return 'المخازن';
  return 'الموارد';
});

// جلب إحصائيات المورد المعني
const usage = computed(() => {
  if (!usageData.value || !usageData.value.limits) return null;
  return usageData.value.limits[resource.value] || null;
});

const planName = computed(() => {
  return usageData.value ? usageData.value.plan_name : 'الباقة الحالية';
});

const progressPercent = computed(() => {
  if (!usage.value) return 0;
  if (usage.value.is_unlimited) return 0;
  return Math.min(Math.round((usage.value.current / usage.value.max) * 100), 100);
});

const progressColorClass = computed(() => {
  const p = progressPercent.value;
  if (p >= 100) return 'fill-danger';
  if (p >= 90) return 'fill-warning';
  return 'fill-info';
});

const progressTextClass = computed(() => {
  const p = progressPercent.value;
  if (p >= 100) return 'text-danger';
  if (p >= 90) return 'text-warning';
  return 'text-info';
});

// جلب بيانات الاستهلاك الفعلي عند فتح الديالوج
const fetchSubscriptionStats = async () => {
  loading.value = true;
  try {
    const response = await apiClient.get('/saas/my-subscription');
    if (response.data && response.data.status) {
      usageData.value = response.data.data;
    }
  } catch (error) {
    console.error('Failed to fetch subscription stats for dialog', error);
  } finally {
    loading.value = false;
  }
};

// مراقبة فتح الديالوج لجلب الإحصائيات فوراً
watch(
  () => appState.saasLimit.isOpen,
  newVal => {
    if (newVal && resource.value) {
      fetchSubscriptionStats();
    }
  }
);

// التوجيه لصفحة الترقية
const goToUpgrade = () => {
  appState.closeSaasLimit();
  router.push('/app/my-subscription');
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');

.saas-limit-dialog :deep(.v-overlay__content) {
  border-radius: 24px !important;
  overflow: hidden;
}

/* تصميم الكارد الزجاجي */
.saas-limit-card {
  font-family: 'Cairo', sans-serif;
  background: rgba(10, 16, 32, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow:
    0 24px 70px rgba(0, 0, 0, 0.6),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
  position: relative;
  overflow: hidden;
  direction: rtl;
}

/* زر إغلاق علوي */
.close-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  z-index: 10;
  transition: all 0.2s;
}
.close-btn:hover {
  background: rgba(255, 255, 255, 0.12) !important;
  color: #f87171 !important;
}

.saas-limit-body {
  padding: 36px 28px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* أيقونة التوهج الفخمة */
.glow-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(245, 158, 11, 0.12);
  border: 1.5px solid rgba(245, 158, 11, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.glow-pulse {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  border: 1.5px solid rgba(245, 158, 11, 0.15);
  animation: glowPulse 2s infinite ease-in-out;
}

@keyframes glowPulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.12);
    opacity: 0.15;
  }
}

/* نصوص الديالوج */
.dialog-title {
  font-size: 1.3rem;
  font-weight: 800;
  color: white;
  text-align: center;
  line-height: 1.4;
}
.dialog-subtitle {
  font-size: 0.86rem;
  color: rgba(255, 255, 255, 0.6);
  text-align: center;
  margin-top: 6px;
  line-height: 1.5;
}
.highlight-text {
  color: #fbbf24 !important;
}

/* صندوق استهلاك المورد */
.usage-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 14px 16px;
}
.usage-label {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
}
.usage-number {
  font-size: 0.95rem;
  color: white;
}

/* شريط التقدم */
.progress-track {
  height: 6px;
  width: 100%;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
  margin: 6px 0;
}
.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
.fill-info {
  background: #60a5fa;
  box-shadow: 0 0 8px rgba(96, 165, 250, 0.5);
}
.fill-warning {
  background: #fbbf24;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.5);
}
.fill-danger {
  background: #f87171;
  box-shadow: 0 0 8px rgba(248, 113, 113, 0.5);
}

.text-info {
  color: #60a5fa !important;
}
.text-warning {
  color: #fbbf24 !important;
}
.text-danger {
  color: #f87171 !important;
}

/* صندوق الرسالة القادمة من السيرفر */
.server-msg-box {
  background: rgba(96, 165, 250, 0.06);
  border: 1px solid rgba(96, 165, 250, 0.15);
  border-radius: 12px;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  width: 100%;
}
.server-msg {
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.6;
}

/* بطاقة الأمان والنصائح */
.safety-tip {
  font-size: 0.72rem;
  color: rgba(74, 222, 128, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1.5;
}

/* الأزرار التفاعلية */
.actions-row {
  display: flex;
  flex-direction: column;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Cairo', sans-serif;
  font-weight: 700;
  font-size: 0.86rem;
  padding: 12px 20px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: none;
  width: 100%;
}

.action-btn--primary {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: #1a0a00;
  box-shadow: 0 4px 16px rgba(245, 158, 11, 0.25);
}
.action-btn--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(245, 158, 11, 0.35);
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}
.action-btn--primary:active {
  transform: translateY(0);
}

.action-btn--secondary {
  background: rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
}
.action-btn--secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}
</style>
