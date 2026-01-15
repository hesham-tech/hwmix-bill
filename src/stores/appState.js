// stores/user.js
import { defineStore } from 'pinia';

export const useappState = defineStore('appState', {
  state: () => ({
    isLoader: false,
    errorServer: false,
    loadingApi: false,
    errorMessage: null,
    dialogDelete: false,
    pendingReport: null, // Holds error info for the global dialog
  }),
});
