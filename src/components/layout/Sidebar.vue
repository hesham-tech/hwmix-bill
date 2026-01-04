<template>
  <v-navigation-drawer v-model="drawer" :rail="rail" scrim="false" permanent floating class="sidebar" color="background">
    <!-- Logo Header -->
    <div class="sidebar-header">
      <div class="logo-container" @click="rail = !rail">
        <v-icon icon="ri-building-line" size="32" color="primary" />
        <transition name="fade">
          <h2 v-if="!rail" class="logo-text">hwmix-bill</h2>
        </transition>
      </div>
    </div>

    <v-divider />

    <!-- Navigation Menu - Scrollable -->
    <div class="sidebar-menu-wrapper">
      <v-list density="compact" nav class="sidebar-menu">
        <template v-for="(item, index) in filteredMenu" :key="index">
          <!-- Menu Item with Children -->
          <v-list-group v-if="item.children" :value="item.title">
            <template #activator="{ props }">
              <v-tooltip :text="item.title" location="end" :disabled="!rail">
                <template #activator="{ props: tooltipProps }">
                  <v-list-item v-bind="{ ...props, ...tooltipProps }" :prepend-icon="item.icon" :title="item.title" class="menu-item" />
                </template>
              </v-tooltip>
            </template>

            <v-tooltip
              v-for="(child, childIndex) in item.children.filter(c => canAccess(c.permission))"
              :key="childIndex"
              :text="child.title"
              location="end"
              :disabled="!rail"
            >
              <template #activator="{ props: tooltipProps }">
                <v-list-item v-bind="tooltipProps" :to="child.to" :title="child.title" :prepend-icon="child.icon" class="menu-sub-item" />
              </template>
            </v-tooltip>
          </v-list-group>

          <!-- Single Menu Item -->
          <v-tooltip v-else :text="item.title" location="end" :disabled="!rail">
            <template #activator="{ props: tooltipProps }">
              <v-list-item v-bind="tooltipProps" :to="item.to" :prepend-icon="item.icon" :title="item.title" class="menu-item" />
            </template>
          </v-tooltip>
        </template>
      </v-list>
    </div>

    <!-- Bottom Section -->
    <template #append>
      <v-divider />

      <v-list density="compact" nav>
        <v-tooltip text="تسجيل الخروج" location="end" :disabled="!rail">
          <template #activator="{ props: tooltipProps }">
            <v-list-item v-bind="tooltipProps" prepend-icon="ri-logout-box-line" title="تسجيل الخروج" @click="handleLogout" class="logout-item" />
          </template>
        </v-tooltip>
      </v-list>

      <!-- Toggle Button -->
      <div class="rail-toggle">
        <v-btn :icon="rail ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'" variant="text" @click="rail = !rail" />
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import navigationMenu from '@/config/navigation';
import { toast } from 'vue3-toastify';

const router = useRouter();
const userStore = useUserStore();
const authStore = useAuthStore();

const drawer = ref(true);
const rail = ref(false);

// Filter menu based on permissions
const filteredMenu = computed(() => {
  return navigationMenu.filter(item => canAccess(item.permission));
});

// Check if user has permission to access menu item
const canAccess = permission => {
  if (!permission) return true; // No permission required
  return userStore.hasPermission(permission);
};

// Logout handler
const handleLogout = async () => {
  try {
    await authStore.logout();
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
    toast.error('حدث خطأ أثناء تسجيل الخروج');
  }
};
</script>

<style scoped>
.sidebar {
  border-left: 1px solid rgb(var(--v-theme-surface-variant));
  height: 100vh !important;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  z-index: 1000;
}

.sidebar-header {
  padding: 24px 16px;
  cursor: pointer;
  flex-shrink: 0;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ✅ Scrollable menu wrapper */
.sidebar-menu-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.sidebar-menu {
  padding: 8px;
}

.menu-item {
  margin-bottom: 4px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}

.menu-sub-item {
  padding-right: 48px !important;
  margin-bottom: 2px;
  border-radius: 8px;
  font-size: 0.9rem;
}

.logout-item {
  color: rgb(var(--v-theme-error));
  margin: 8px;
  border-radius: 8px;
}

.logout-item:hover {
  background: rgba(var(--v-theme-error), 0.08);
}

.rail-toggle {
  padding: 8px;
  text-align: center;
}

/* ✅ Custom scrollbar */
.sidebar-menu-wrapper::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu-wrapper::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.2);
  border-radius: 3px;
}

.sidebar-menu-wrapper::-webkit-scrollbar-thumb:hover {
  background: rgba(var(--v-theme-primary), 0.3);
}
</style>
