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
    // If user is accessing login, register, or saas pages while already authenticated, redirect to dashboard/portal
    const forceRedirectRoutes = ['login', 'register', 'saas-landing', 'saas-login', 'saas-register'];
    if (forceRedirectRoutes.includes(to.name)) {
      if (!userStore.currentUser) {
        try {
          await userStore.fetchUser();
        } catch (e) {
          authStore.logout();
          return next({ name: 'login' });
        }
      }

      if (userStore.isStaff) {
        return next({ name: 'admin-dashboard' });
      } else {
        return next({ name: 'portal' });
      }
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
  if (!userStore.currentUser && authStore.isAuthenticated) {
    try {
      await userStore.fetchUser();
    } catch (e) {
      return next({ name: 'login' });
    }
  }

  // === SAAS SUBSCRIPTION CHECK ===
  // Super admins and customer portal users are exempt from subscription page locking
  const isSuperAdmin = userStore.isAdmin;
  const isCustomer = !userStore.isStaff;
  
  if (!isSuperAdmin && !isCustomer) {
    const subStatus = userStore.currentUser?.subscription?.status || 'inactive';
    if (subStatus === 'pending' || subStatus === 'expired' || subStatus === 'inactive') {
      if (to.name !== 'my-subscription') {
        return next({ name: 'my-subscription' });
      }
    }
  }

  // === CUSTOMER PORTAL RESTRICTION ===
  // If the user is NOT staff (meaning they are a Customer), they must ONLY access customer/portal pages, sessions, or profile
  if (!userStore.isStaff) {
    const isAllowedForCustomer = 
      to.name === 'app-home' || 
      to.name === 'forbidden' || 
      to.name === 'not-found' || 
      to.name === 'profile' || 
      to.name === 'sessions' || 
      to.meta.isCustomer === true;

    if (!isAllowedForCustomer) {
      return next({ name: 'forbidden' });
    }

    // Bypass Spatie corporate permissions check for customer routes.
    // Customers only access their own data via portal APIs, they don't require company-level permissions.
    return next();
  }

  const requiredPermission = to.meta.permission;

  // No permission required
  if (!requiredPermission) {
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
  document.title = to.meta.title ? `${to.meta.title} - hwnix-bill` : 'hwnix-bill';
  next();
};
