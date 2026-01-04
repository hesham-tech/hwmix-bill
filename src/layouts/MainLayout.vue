<template>
  <v-app>
    <Sidebar />

    <v-app-bar color="surface" elevation="0" class="app-bar">
      <!-- Breadcrumbs -->
      <v-breadcrumbs :items="breadcrumbs" class="px-4">
        <template #divider>
          <v-icon icon="ri-arrow-left-s-line" />
        </template>
      </v-breadcrumbs>

      <v-spacer />

      <!-- User Menu -->
      <v-menu>
        <template #activator="{ props }">
          <v-btn v-bind="props" variant="text" class="user-menu-btn">
            <v-avatar size="32" color="primary">
              <v-icon icon="ri-user-line" />
            </v-avatar>
            <span class="mr-2">{{ userName }}</span>
            <v-icon icon="ri-arrow-down-s-line" size="small" />
          </v-btn>
        </template>

        <v-list>
          <v-list-item prepend-icon="ri-user-settings-line" title="الملف الشخصي" to="/profile" />
          <v-list-item prepend-icon="ri-settings-3-line" title="الإعدادات" to="/settings" />
          <v-divider />
          <v-list-item prepend-icon="ri-logout-box-line" title="تسجيل الخروج" @click="handleLogout" class="text-error" />
        </v-list>
      </v-menu>
    </v-app-bar>

    <v-main class="main-content">
      <v-container fluid class="pa-6">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { authService } from '@/api';
import Sidebar from '@/components/layout/Sidebar.vue';
import { toast } from 'vue3-toastify';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// User name from store
const userName = computed(() => userStore.currentUser?.name || 'المستخدم');

// Breadcrumbs from route meta
const breadcrumbs = computed(() => {
  const items = [{ title: 'الرئيسية', to: '/dashboard' }];

  if (route.meta.breadcrumbs) {
    items.push(...route.meta.breadcrumbs);
  } else if (route.meta.title) {
    items.push({ title: route.meta.title, disabled: true });
  }

  return items;
});

// Logout handler
const handleLogout = async () => {
  try {
    await authService.logout();
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/login');
  } catch (error) {
    toast.error('فشل تسجيل الخروج');
  }
};
</script>

<style scoped>
.app-bar {
  border-bottom: 1px solid rgb(var(--v-theme-surface-variant));
}

.user-menu-btn {
  text-transform: none;
  letter-spacing: 0;
}

.main-content {
  background: rgb(var(--v-theme-background));
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
