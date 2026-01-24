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
    captureMessage: 'جاري اخذ لقطة للشاشة...',
  }),
  actions: {
    async triggerManualReport(type = 'feedback', collector = null) {
      if (!collector) return;
      this.pendingReport = await collector(null, {
        type,
        severity: 'info',
        message: type === 'suggestion' ? 'اقتراح جديد' : 'بلاغ عن مشكلة',
      });
    },
  },
});
