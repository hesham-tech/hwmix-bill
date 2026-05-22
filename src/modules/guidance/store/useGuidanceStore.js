import { defineStore } from 'pinia';
import apiClient from '@/api/axios.config';
import { useUserStore } from '@/stores/user';

/**
 * متجر بينيا (Pinia Store) لإدارة حالة تقدم الجولات التعريفية والإرشادات والتلميحات للمستخدم.
 */
export const useGuidanceStore = defineStore('guidance', {
  state: () => ({
    progress: [], // [{ key, completed_at, skipped }]
    loading: false,
    guidanceEnabled: localStorage.getItem('guidance_enabled') !== 'false',
  }),

  getters: {
    /**
     * هل الخطوة أو الجولة المحددة مكتملة أو متخطاة؟
     */
    isCompleted: state => key => {
      return state.progress.some(p => p.key === key);
    },

    /**
     * هل يجب إظهار الجولة/الإرشاد المحدد؟
     * يراقب تفعيل الإرشاد الكلي، وعدم اكتمال الخطوة مسبقاً، وعمر حساب المستخدم.
     */
    shouldShow: state => key => {
      if (!state.guidanceEnabled) return false;
      if (state.isCompleted(key)) return false;

      // تجنب إظهار الجولات التعريفية للمستخدمين القدامى جداً (مثلاً أكثر من 90 يوم)
      try {
        const userStore = useUserStore();
        const createdAt = userStore.currentUser?.created_at;
        if (createdAt) {
          const createdDate = new Date(createdAt);
          const diffTime = Math.abs(new Date() - createdDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          // إذا كان المستخدم قديماً وتخطى 90 يوم، لا نزعجه بالجولات الإرشادية تلقائياً
          // لكن نسمح له بطلبها يدوياً إذا رغب
          if (diffDays > 90 && key.startsWith('tour.')) {
            return false;
          }
        }
      } catch (e) {
        // Silent fail
      }

      return true;
    },

    /**
     * جلب قائمة بالمفاتيح المكتملة فقط لتسهيل البحث السريع.
     */
    completedKeys: state => {
      return state.progress.map(p => p.key);
    },
  },

  actions: {
    /**
     * تهيئة المتجر وجلب البيانات من LocalStorage ثم مزامنتها مع الـ Backend.
     */
    async initGuidance() {
      const userStore = useUserStore();
      const userId = userStore.currentUser?.id || 'guest';
      const companyId = userStore.currentUser?.active_company_id || '0';
      const storageKey = `guidance_progress_${userId}_${companyId}`;

      // 1. تحميل الكاش المحلي أولاً (سرعة الاستجابة UX)
      const cached = localStorage.getItem(storageKey);
      if (cached) {
        try {
          this.progress = JSON.parse(cached);
        } catch (e) {
          this.progress = [];
        }
      }

      // 2. جلب التقدم الفعلي من الخادم والمزامنة في الخلفية
      await this.fetchProgress();
    },

    /**
     * جلب تقدم الإرشادات من الخادم.
     */
    async fetchProgress() {
      if (!this.guidanceEnabled) return;
      const userStore = useUserStore();
      if (!userStore.currentUser) return;

      this.loading = true;
      try {
        const response = await apiClient.get('/guidance/progress');
        if (response.data && (response.data.status || response.data.success)) {
          this.progress = response.data.data;
          this.saveToLocal();
        }
      } catch (error) {
        console.warn('Guidance progress fetch failed, using local fallback:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * تسجيل إكمال خطوة أو جولة إرشادية.
     */
    async markStepAsCompleted(key, skipped = false) {
      // 1. التحديث المحلي الفوري لضمان سرعة الـ UI
      if (this.isCompleted(key)) return;

      const newStep = {
        key,
        completed_at: new Date().toISOString(),
        skipped,
      };
      this.progress.push(newStep);
      this.saveToLocal();

      // 2. المزامنة مع الخادم في الخلفية (Lazy Sync)
      try {
        await apiClient.post('/guidance/complete', {
          key,
          skipped,
        });
      } catch (error) {
        console.warn('Failed to sync guidance step with server:', error);
        // لا نقوم بإزالة الخطوة محلياً لضمان عدم إزعاج المستخدم مجدداً حتى لو فشلت المزامنة مؤقتاً
      }
    },

    /**
     * إلغاء وسم خطوة إرشادية كمنتهية (التراجع).
     */
    async uncompleteStep(key) {
      // 1. التحديث المحلي الفوري لضمان سرعة الـ UI
      this.progress = this.progress.filter(p => p.key !== key);
      this.saveToLocal();

      // 2. المزامنة مع الخادم في الخلفية
      try {
        await apiClient.post('/guidance/uncomplete', {
          key,
        });
      } catch (error) {
        console.warn('Failed to sync guidance uncomplete step with server:', error);
      }
    },

    /**
     * إعادة تعيين كافة التقدم والبدء من جديد.
     */
    async resetProgress() {
      this.progress = [];
      this.saveToLocal();

      try {
        await apiClient.post('/guidance/reset');
      } catch (error) {
        console.warn('Failed to reset guidance progress on server:', error);
      }
    },

    /**
     * تفعيل أو تعطيل نظام الإرشاد بالكامل.
     */
    setGuidanceEnabled(enabled) {
      this.guidanceEnabled = enabled;
      localStorage.setItem('guidance_enabled', enabled ? 'true' : 'false');
    },

    /**
     * حفظ تقدم الإرشاد في localStorage الخاص بالمستخدم والشركة النشطة.
     */
    saveToLocal() {
      try {
        const userStore = useUserStore();
        const userId = userStore.currentUser?.id || 'guest';
        const companyId = userStore.currentUser?.active_company_id || '0';
        const storageKey = `guidance_progress_${userId}_${companyId}`;
        localStorage.setItem(storageKey, JSON.stringify(this.progress));
      } catch (e) {
        console.error('Failed to save guidance progress to localStorage:', e);
      }
    },
  },
});
