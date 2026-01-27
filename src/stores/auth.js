import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '@/api/services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || 'null'));
  const token = ref(sessionStorage.getItem('token') || localStorage.getItem('token') || null);
  const isAuthenticated = computed(() => !!token.value);

  function saveLoginData(data, remember = false) {
    const { user: userData, token: tokenData } = data;

    token.value = tokenData;
    user.value = userData;

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', tokenData);
    storage.setItem('user', JSON.stringify(userData));
  }

  async function logout() {
    // Clear stores reactive state
    token.value = null;
    user.value = null;

    // Clear both storages
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');

    // Clear user store
    const { useUserStore } = await import('@/stores/user');
    const userStore = useUserStore();
    userStore.clearUser();

    // Redirect to login if not already there
    if (window.location.pathname !== '/login') {
      window.location.href = '/login?sessionExpired=1';
    }
  }

  async function fetchUser() {
    if (!token.value) return;

    try {
      const response = await authService.me();
      user.value = response.data;
    } catch (error) {
      console.error('Fetch user failed:', error);
    }
  }

  function setToken(newToken, remember = false) {
    token.value = newToken;
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem('token', newToken);
  }

  return {
    user,
    token,
    isAuthenticated,
    saveLoginData,
    logout,
    fetchUser,
    setToken,
  };
});
