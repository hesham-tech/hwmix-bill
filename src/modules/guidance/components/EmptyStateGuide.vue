<script setup>
import { computed } from 'vue';

/**
 * مكون عرض الحالة الفارغة الإرشادية (Empty State Guide)
 * يوجه المستخدم بشكل جميل لخطوته الأولى في الصفحة عند خلوها من البيانات.
 */

const props = defineProps({
  // نوع الصفحة (products, invoices, customers, default)
  type: {
    type: String,
    default: 'default',
  },
  // العنوان
  title: {
    type: String,
    default: '',
  },
  // الوصف التفصيلي
  description: {
    type: String,
    default: '',
  },
  // نص زر الإجراء
  actionText: {
    type: String,
    default: '',
  },
  // الأيقونة المعروضة على الزر
  actionIcon: {
    type: String,
    default: 'ri-add-line',
  },
  // إمكانية إظهار زر الإجراء
  showCta: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['action']);

// القيم الافتراضية لكل صفحة لتبسيط الاستخدام
const defaults = {
  products: {
    title: 'ابدأ بإضافة منتجاتك وخدماتك',
    description: 'قم بتسجيل منتجاتك لتبسيط عملية البيع والتحكم السريع في المخزون والأسعار.',
    actionText: 'أضف أول منتج',
  },
  invoices: {
    title: 'لم تنشئ أي فاتورة مبيعات بعد',
    description: 'أنشئ أول فاتورة مبيعات لعملائك بدقة وسرعة تامة، وتابع المبالغ المحصلة والمتبقية.',
    actionText: 'إنشاء أول فاتورة',
  },
  customers: {
    title: 'سجل عملائك ونظم حساباتهم',
    description: 'أضف بيانات عملائك لمتابعة مديونياتهم وجدولة أقساطهم وتسجيل دفعاتهم المالية.',
    actionText: 'أضف عميل جديد',
  },
  default: {
    title: 'لا توجد بيانات لعرضها',
    description: 'ابدأ بإضافة أول سجل للبدء في استخدام هذه الصفحة.',
    actionText: 'إضافة سجل جديد',
  },
};

const activeConfig = computed(() => {
  const current = defaults[props.type] || defaults.default;
  return {
    title: props.title || current.title,
    description: props.description || current.description,
    actionText: props.actionText || current.actionText,
  };
});

function handleAction() {
  emit('action');
}
</script>

<template>
  <div class="empty-state-container animate-fade-in">
    <div class="illustration-wrapper">
      <!-- رسمة للمنتجات -->
      <svg v-if="type === 'products'" viewBox="0 0 200 200" class="empty-svg">
        <defs>
          <linearGradient id="prodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.05"/>
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="70" fill="url(#prodGrad)" />
        <rect x="70" y="60" width="60" height="60" rx="10" fill="none" stroke="#3b82f6" stroke-width="3" stroke-dasharray="4 4" />
        <path d="M70,80 L130,80 M100,60 L100,120" stroke="#3b82f6" stroke-width="3" stroke-linecap="round" />
        <circle cx="100" cy="90" r="15" fill="none" stroke="#2563eb" stroke-width="3" />
        <path d="M100,80 L100,92 L108,96" stroke="#2563eb" stroke-width="2" stroke-linecap="round" />
      </svg>

      <!-- رسمة للفواتير -->
      <svg v-else-if="type === 'invoices'" viewBox="0 0 200 200" class="empty-svg">
        <defs>
          <linearGradient id="invGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#10b981" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#047857" stop-opacity="0.05"/>
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="70" fill="url(#invGrad)" />
        <rect x="70" y="55" width="60" height="90" rx="8" fill="none" stroke="#10b981" stroke-width="3" />
        <line x1="85" y1="80" x2="115" y2="80" stroke="#10b981" stroke-width="3" stroke-linecap="round" />
        <line x1="85" y1="100" x2="115" y2="100" stroke="#10b981" stroke-width="3" stroke-linecap="round" />
        <line x1="85" y1="120" x2="105" y2="120" stroke="#10b981" stroke-width="3" stroke-linecap="round" />
        <path d="M115,55 L130,70 L115,70 Z" fill="#10b981" />
      </svg>

      <!-- رسمة للعملاء -->
      <svg v-else-if="type === 'customers'" viewBox="0 0 200 200" class="empty-svg">
        <defs>
          <linearGradient id="custGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.2"/>
            <stop offset="100%" stop-color="#b45309" stop-opacity="0.05"/>
          </linearGradient>
        </defs>
        <circle cx="100" cy="100" r="70" fill="url(#custGrad)" />
        <circle cx="100" cy="85" r="22" fill="none" stroke="#f59e0b" stroke-width="3" />
        <path d="M65,135 C65,115 80,115 100,115 C120,115 135,115 135,135" fill="none" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" />
        <circle cx="130" cy="75" r="10" fill="#f59e0b" opacity="0.3" />
        <circle cx="70" cy="75" r="10" fill="#f59e0b" opacity="0.3" />
      </svg>

      <!-- رسمة افتراضية -->
      <svg v-else viewBox="0 0 200 200" class="empty-svg">
        <circle cx="100" cy="100" r="70" fill="rgba(100, 116, 139, 0.1)" />
        <path d="M80,80 L120,120 M120,80 L80,120" stroke="#64748b" stroke-width="4" stroke-linecap="round" />
      </svg>
    </div>

    <h3 class="empty-title">{{ activeConfig.title }}</h3>
    <p class="empty-desc">{{ activeConfig.description }}</p>

    <div v-if="showCta" class="empty-actions">
      <slot name="actions">
        <v-btn
          color="primary"
          class="empty-cta-btn px-6 py-2"
          rounded="lg"
          elevation="2"
          @click="handleAction"
        >
          <v-icon start :icon="actionIcon" class="ml-1"></v-icon>
          {{ activeConfig.actionText }}
        </v-btn>
      </slot>
    </div>
  </div>
</template>

<style scoped>
.empty-state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  max-width: 500px;
  margin: 0 auto;
  direction: rtl;
}

.illustration-wrapper {
  width: 140px;
  height: 140px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05));
}

.empty-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin-bottom: 12px;
}

.empty-desc {
  font-size: 0.9rem;
  color: rgba(var(--v-theme-on-surface), 0.6);
  line-height: 1.6;
  margin-bottom: 24px;
}

.empty-actions {
  display: flex;
  gap: 12px;
}

.empty-cta-btn {
  font-weight: 600;
  letter-spacing: 0;
  transition: all 0.3s ease;
}

/* دخول ناعم */
.animate-fade-in {
  animation: fadeIn 0.4s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
