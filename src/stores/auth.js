import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '@/api/services/auth.service';
import router from '@/router';
import notificationManager from '@/services/notificationManager';

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

  async function logout(options = {}) {
    const showToast = options.showToast ?? false;

    // 1. Determine redirection path before clearing state
    const { useUserStore } = await import('@/stores/user');
    const userStore = useUserStore();
    
    // A user is staff/admin if their role flag is true, or they are on an admin/saas route
    const isStaff = userStore.isStaff || user.value?.is_staff_or_admin || 
      router.currentRoute.value.path.includes('/admin') || 
      router.currentRoute.value.path.includes('/saas');
      
    const redirectPath = isStaff ? '/saas/login' : '/login';

    // 2. Invalidate token on the server if present
    if (token.value) {
      try {
        const { default: apiClient } = await import('@/api/axios.config');
        await apiClient.post('logout');
      } catch (e) {
        console.warn('Server logout call failed, cleaning up locally anyway.', e);
      }
    }

    // 3. Clear reactive state
    token.value = null;
    user.value = null;

    // 4. Clear storages
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('products');

    // 5. Clear user store
    userStore.clearUser();

    // Clear Store Cart and Wishlist
    try {
      const { useCartStore } = await import('@/stores/cart');
      const { useWishlistStore } = await import('@/stores/wishlist');
      useCartStore().clearCart();
      useWishlistStore().clear();
    } catch (e) {
      console.warn('Could not clear cart/wishlist stores', e);
    }
    localStorage.removeItem('hwnix_store_cart');
    localStorage.removeItem('hwnix_store_wishlist');

    // 6. Show toast once
    if (showToast) {
      const { toast } = await import('vue3-toastify');
      notificationManager.success('تم تسجيل الخروج بنجاح');
    }

    // 7. Redirect logic based on Route Guards (Separation of Concerns)
    // If the current route requires auth (not public), we must kick them to login.
    // Otherwise, they stay exactly where they are as a guest.
    const currentRoute = router.currentRoute.value;
    const isPublic = currentRoute.meta?.public;
    
    if (!isPublic) {
      router.push({
        path: redirectPath,
        query: options.sessionExpired ? { sessionExpired: 1 } : {},
      });
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
