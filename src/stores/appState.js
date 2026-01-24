// stores/user.js
import { defineStore } from 'pinia';

export const useappState = defineStore('appState', {
  state: () => ({
    isLoader: false,
    errorServer: false,
    loadingApi: false,
    errorMessage: null,
    dialogDelete: false,
    pendingReport: null,
    isCapturing: false,
    captureMessage: 'جاري التقاط لقطة للشاشة...',
  }),
  actions: {
    async triggerManualReport(type = 'feedback') {
      const { collectErrorInfo } = await import('@/utils/error-collector');
      this.pendingReport = await collectErrorInfo(null, {
        type,
        severity: 'info',
        message: type === 'suggestion' ? 'اقتراح جديد' : 'بلاغ عن مشكلة',
      });
    },
  },
});
