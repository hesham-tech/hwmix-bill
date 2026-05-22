<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useGuidance } from '../composables/useGuidance';

/**
 * مكون زر المساعدة السياقية (Contextual Help Button)
 * يظهر كأيقونة سؤال هادئة في رأس الصفحة، وعند النقر يفتح لوحة مساعدة جانبية تشرح الصفحة وتدعم إعادة تشغيل الجولات.
 */

const props = defineProps({
  // تحديد جولة تعريفية مرتبطة لإعادة تشغيلها
  tourKey: {
    type: String,
    default: '',
  },
  // محتوى مخصص للمساعدة (اختياري)
  customTitle: {
    type: String,
    default: '',
  },
  customDescription: {
    type: String,
    default: '',
  },
  // مصفوفة روابط المساعدة المفيدة [{ text, url }]
  links: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['restart-tour']);

const route = useRoute();
const drawer = ref(false);
const { resetProgress, markAsCompleted } = useGuidance();

// توليد تفاصيل مساعدة تلقائية بناءً على مسار الصفحة الحالي
const defaultHelpContent = {
  '/app/dashboard': {
    title: 'لوحة التحكم الرئيسية',
    description: 'شاشة إحصائية تلخص أداء عملك اليومي. يمكنك مراقبة المبيعات الإجمالية، الفواتير المستحقة، نشاط المنتجات، والدخول السريع للعمليات الأساسية.',
  },
  '/app/invoices': {
    title: 'إدارة الفواتير مبيعات/مشتريات',
    description: 'هنا يمكنك استعراض كافة الفواتير، البحث عن الفواتير برقمها أو اسم العميل، مراجعة حالة الدفع والأقساط، وتصدير التقارير وجداول البيانات.',
  },
  '/app/products': {
    title: 'إدارة المنتجات والخدمات',
    description: 'كتالوج المواد والخدمات الخاصة بك. يمكنك مراقبة المخزون الفعلي بكل فرع، تعديل الأسعار، ربط الباركودات، وإضافة وحدات القياس والأصناف.',
  },
  '/app/customers': {
    title: 'إدارة حسابات العملاء',
    description: 'قائمة العملاء المسجلين. تتيح لك الشاشة مراجعة أرصدة العملاء، دفع المبالغ المتبقية، جدولة دفعاتهم، وتتبع نشاطهم المالي.',
  },
  'default': {
    title: 'مساعد النظام الذكي',
    description: 'مرحباً بك في نظام HWNix ERP. توفر هذه الشاشات أدوات سريعة لإدارة نشاطك المالي والمخزني بأمان تام وسرعة فائقة.',
  },
};

const currentHelp = computed(() => {
  const path = route.path;
  const config = defaultHelpContent[path] || defaultHelpContent.default;
  return {
    title: props.customTitle || config.title,
    description: props.customDescription || config.description,
  };
});

/**
 * إعادة تشغيل الجولة التعريفية المرتبطة بهذه الصفحة
 */
async function triggerRestartTour() {
  drawer.value = false;
  if (props.tourKey) {
    // 1. إعادة تعيين الخطوة محلياً وسيرفرياً أولاً
    await resetTourKey(props.tourKey);
    // 2. بث حدث لإخطار الصفحة ببدء الجولة مجدداً
    emit('restart-tour');
  }
}

async function resetTourKey(key) {
  // نقوم بإعادة تعيين هذا المفتاح تحديداً من خلال الـ API والـ store
  const { useGuidanceStore } = await import('../store/useGuidanceStore');
  const store = useGuidanceStore();
  
  // نقوم بإزالة المفتاح من الـ state محلياً
  store.progress = store.progress.filter(p => p.key !== key);
  store.saveToLocal();

  // إرسال طلب للحذف من قاعدة البيانات أيضاً
  try {
    const apiClient = (await import('@/api/axios.config')).default;
    await apiClient.post('/guidance/complete', {
      key: key,
      skipped: true, // نرسلها كـ skipped لتهيئتها للحذف أو كحيلة لإعادة تعيينها، أو نعتمد على API resetAll.
      // الأفضل هو أن نوفر endpoint لحذف مفتاح محدد أو نعتمد على الحفظ المؤقت محلياً
    });
  } catch (e) {
    // Silent fail
  }
}

defineExpose({
  open: () => drawer.value = true,
  close: () => drawer.value = false,
  drawer
});
</script>

<template>
  <div class="contextual-help-wrapper">
    <!-- زر أيقونة المساعدة -->
    <v-tooltip location="bottom">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          icon="ri-question-line"
          variant="text"
          color="primary"
          class="help-trigger-btn rounded-lg d-none d-sm-inline-flex"
          size="34"
          @click="drawer = !drawer"
        />
      </template>
      المساعدة الإرشادية ودليل الصفحة
    </v-tooltip>

    <!-- درج المساعدة الجانبي الفاخر (Drawer) -->
    <v-navigation-drawer
      v-model="drawer"
      location="left"
      temporary
      width="340"
      class="help-navigation-drawer"
    >
      <div class="help-drawer-header">
        <div class="header-title-box">
          <v-icon icon="ri-guide-line" class="ml-2 text-primary"></v-icon>
          <span class="font-weight-bold text-h6">مساعدة سياقية</span>
        </div>
        <v-btn icon="ri-close-line" variant="text" density="comfortable" @click="drawer = false" />
      </div>

      <div class="help-drawer-body">
        <div class="help-card glass-card">
          <h4 class="help-card-title">{{ currentHelp.title }}</h4>
          <p class="help-card-desc">{{ currentHelp.description }}</p>
        </div>

        <!-- روابط إرشادية مفيدة -->
        <div v-if="links.length > 0" class="help-section mt-6">
          <h5 class="section-title">روابط وشروحات سريعة</h5>
          <ul class="help-links-list">
            <li v-for="(link, index) in links" :key="index">
              <a :href="link.url" target="_blank" class="help-link">
                <v-icon icon="ri-external-link-line" size="14" class="ml-1"></v-icon>
                {{ link.text }}
              </a>
            </li>
          </ul>
        </div>

        <!-- خيارات إضافية -->
        <div class="help-section mt-8">
          <h5 class="section-title">أدوات الإرشاد</h5>
          <div class="guidance-actions-box">
            <v-btn
              v-if="tourKey"
              block
              color="primary"
              variant="tonal"
              class="guidance-btn"
              rounded="lg"
              @click="triggerRestartTour"
            >
              <v-icon start icon="ri-play-circle-line" class="ml-1"></v-icon>
              إعادة الجولة التعريفية للصفحة
            </v-btn>

            <v-btn
              block
              variant="text"
              color="error"
              class="guidance-btn mt-2"
              rounded="lg"
              size="small"
              @click="resetProgress"
            >
              <v-icon start icon="ri-refresh-line" class="ml-1"></v-icon>
              إعادة تفعيل كافة الجولات والتعليمات
            </v-btn>
          </div>
        </div>
      </div>

      <div class="help-drawer-footer">
        <span class="text-caption text-secondary">نظام المساعدة الذكي v1.0 • HWNix ERP</span>
      </div>
    </v-navigation-drawer>
  </div>
</template>

<style scoped>
.contextual-help-wrapper {
  display: inline-block;
}

.help-trigger-btn {
  transition: transform 0.2s ease;
}

.help-trigger-btn:hover {
  transform: scale(1.05);
}

/* تصميم الدرج الجانبي زجاجي فاخر (Glassmorphism) */
.help-navigation-drawer {
  background: rgba(18, 18, 24, 0.9) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #f1f3f9 !important;
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.help-drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  direction: rtl;
}

.header-title-box {
  display: flex;
  align-items: center;
}

.help-drawer-body {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
  direction: rtl;
}

.glass-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.help-card-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--v-primary-base, #1867c0);
  margin-bottom: 8px;
}

.help-card-desc {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.6;
}

.help-section {
  direction: rtl;
}

.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.help-links-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.help-link {
  display: flex;
  align-items: center;
  font-size: 0.9rem;
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s ease;
}

.help-link:hover {
  color: #60a5fa;
  text-decoration: underline;
}

.guidance-actions-box {
  display: flex;
  flex-direction: column;
}

.guidance-btn {
  font-weight: 600;
  letter-spacing: 0;
}

.help-drawer-footer {
  padding: 16px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
  direction: rtl;
}
</style>
