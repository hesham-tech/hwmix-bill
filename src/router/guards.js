/**
 * Router Permission Guard
 * التحقق من صلاحيات الوصول للصفحات
 */

import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';

/**
 * Check if user is authenticated
 */
export const authGuard = async (to, from, next) => {
  const authStore = useAuthStore();
  const userStore = useUserStore();
  const isPublic = to.meta.public;

  if (!isPublic && !authStore.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (isPublic && authStore.isAuthenticated) {
    // If user is already logged in and tries to access a public page (like Login or Landing)
    // We redirect them to their respective dashboard
    if (!userStore.currentUser) {
      await userStore.fetchUser();
    }

    if (userStore.isStaff) {
      return next({ name: 'admin-dashboard' });
    } else {
      return next({ name: 'portal' });
    }
  }

  next();
};

/**
 * Check if user has required permissions
 */
export const permissionGuard = async (to, from, next) => {
  const userStore = useUserStore();
  const authStore = useAuthStore();

  // Skip if not authenticated or public route
  if (to.meta.public || !authStore.isAuthenticated) {
    return next();
  }

  // Fetch user permissions if not loaded
  if (!userStore.currentUser) {
    await userStore.fetchUser();
  }

  const requiredPermission = to.meta.permission;

  // No permission required or User is NOT staff (Customer)
  if (!requiredPermission || !userStore.isStaff) {
    return next();
  }

  // Check permission
  if (!userStore.hasPermission(requiredPermission)) {
    return next({ name: 'forbidden' });
  }

  next();
};

/**
 * Check if user has required role
 */
export const roleGuard = async (to, from, next) => {
  const userStore = useUserStore();
  const authStore = useAuthStore();

  // Skip if not authenticated or public route
  if (to.meta.public || !authStore.isAuthenticated) {
    return next();
  }

  const requiredRole = to.meta.role;

  // No role required
  if (!requiredRole) {
    return next();
  }

  // Check role
  if (!userStore.hasRole(requiredRole)) {
    return next({ name: 'forbidden' });
  }

  next();
};

/**
 * Combine multiple guards
 */
export const combineGuards = (...guards) => {
  return (to, from, next) => {
    const runGuard = index => {
      if (index >= guards.length) {
        next();
        return;
      }

      guards[index](to, from, nextArg => {
        if (nextArg === undefined) {
          runGuard(index + 1);
        } else {
          next(nextArg);
        }
      });
    };

    runGuard(0);
  };
};

/**
 * Default Guard - Set page title
 */
export const defaultGuard = (to, from, next) => {
  document.title = to.meta.title ? `${to.meta.title} - hwmix-bill` : 'hwmix-bill';
  next();
};
