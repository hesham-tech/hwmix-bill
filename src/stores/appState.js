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
    captureMessage: 'جاري اخذ لقطة للشاشة...',
    // Calculator Global State
    calculator: {
      isOpen: false,
    },
    // Installment Calculator Global State
    installmentCalc: {
      isOpen: false,
      mode: 'standalone', // 'standalone' or 'invoice'
      initialTotal: 0,
      onSave: null,
    },
    // Percentage Tool Global State
    percentageTool: {
      isOpen: false,
    },
  }),
  actions: {
    openCalculator() {
      this.calculator.isOpen = true;
    },
    closeCalculator() {
      this.calculator.isOpen = false;
    },
    openPercentageTool() {
      this.percentageTool.isOpen = true;
    },
    closePercentageTool() {
      this.percentageTool.isOpen = false;
    },
    openInstallmentCalc(options = {}) {
      this.installmentCalc = {
        isOpen: true,
        mode: options.mode || 'standalone',
        initialTotal: options.initialTotal || 0,
        onSave: options.onSave || null,
      };
    },
    closeInstallmentCalc() {
      this.installmentCalc.isOpen = false;
    },
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
