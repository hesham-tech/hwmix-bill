import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '@/api/services/auth.service';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = computed(() => !!token.value);

  async function login(credentials) {
    const response = await authService.login(credentials);
    token.value = response.token;
    user.value = response.user;
    localStorage.setItem('token', response.token);
  }

  async function logout() {
    // Clear stores reactive state
    token.value = null;
    user.value = null;

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

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
      user.value = response.data; // الاستجابة مغلفة في data
    } catch (error) {
      console.error('Fetch user failed:', error);
      // لا تقم بعمل logout هنا لتجنب اللوب اللانهائية إذا كان الخطأ مؤقتاً
    }
  }

  function setToken(newToken) {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    fetchUser,
    setToken,
  };
});
