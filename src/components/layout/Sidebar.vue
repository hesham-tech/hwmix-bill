<template>
  <v-navigation-drawer
    v-model="drawer"
    :rail="rail"
    :permanent="smAndUp"
    :persistent="smAndUp"
    :temporary="xs"
    :touchless="smAndUp"
    :scrim="xs ? 'rgba(0,0,0,0.1)' : false"
    width="280"
    class="sidebar"
    color="background"
  >
    <div class="sidebar-sidebar-header-wrapper" :class="{ 'collapsible-header': userStore.companies.length > 1 }">
      <div
        class="sidebar-header flex-grow-1"
        :class="{ clickable: userStore.companies.length > 1 }"
        @click="userStore.companies.length > 1 ? (showCompanySwitch = true) : null"
      >
        <div class="logo-container">
          <v-avatar size="50" rounded="md" v-if="activeCompany?.logo" class="logo-avatar">
            <v-img :src="activeCompany.logo" contain />
          </v-avatar>
          <v-avatar v-else size="50" rounded="md" color="primary" variant="tonal" class="logo-avatar">
            <v-icon icon="ri-building-line" size="28" />
          </v-avatar>
          <transition name="fade">
            <div v-if="!rail || xs" class="logo-text-wrapper ms-3">
              <h2 class="logo-text">{{ activeCompany?.name || 'hwmix-bill' }}</h2>
              <div v-if="activeCompany?.field && !rail" class="company-field text-caption text-primary font-weight-medium">
                {{ activeCompany.field }}
              </div>
              <div v-if="userStore.companies.length > 1" class="text-caption text-grey-darken-1 d-flex align-center mt-0 switch-hint">
                <span>تبديل الشركة</span>
                <v-icon icon="ri-arrow-up-down-line" size="10" class="ms-1" />
              </div>
            </div>
          </transition>
        </div>
      </div>

      <!-- Absolute Rail Toggle with Tooltip -->
      <div v-if="!xs" class="header-rail-toggle">
        <v-tooltip :text="rail ? 'توسيع القائمة' : 'تقليص القائمة'" location="right">
          <template #activator="{ props: tooltipProps }">
            <v-btn
              v-bind="tooltipProps"
              :icon="!rail ? 'ri-arrow-right-s-line' : 'ri-arrow-left-s-line'"
              color="primary"
              size="40"
              class="rail-floating-btn"
              elevation="4"
              @click.stop="rail = !rail"
            />
          </template>
        </v-tooltip>
      </div>
    </div>
    <v-divider />

    <div class="sidebar-menu-wrapper">
      <v-list v-model:opened="openedGroups" open-strategy="single" density="compact" nav class="sidebar-menu">
        <template v-for="(item, index) in filteredMenu" :key="index">
          <!-- Item with children -->
          <v-list-group v-if="item.children && item.children.length > 0" :value="item.title">
            <template #activator="{ props: groupProps }">
              <v-tooltip v-if="rail && !xs" :text="item.title" location="end">
                <template #activator="{ props: tooltipProps }">
                  <v-list-item
                    v-bind="{ ...groupProps, ...tooltipProps }"
                    :prepend-icon="item.icon"
                    :title="item.title"
                    class="menu-item group-header"
                  />
                </template>
              </v-tooltip>
              <v-list-item v-else v-bind="groupProps" :prepend-icon="item.icon" :title="item.title" class="menu-item group-header" />
            </template>

            <template v-for="(child, childIndex) in item.children.filter(c => canAccess(c.permission))" :key="childIndex">
              <v-tooltip v-if="rail && !xs" :text="child.title" location="end">
                <template #activator="{ props: childTooltipProps }">
                  <v-list-item
                    v-bind="childTooltipProps"
                    :to="child.to"
                    :title="child.title"
                    :prepend-icon="child.icon || 'ri-subtract-line'"
                    class="menu-sub-item"
                    active-class="active-link"
                    :active="isItemActive(child.to)"
                    @click="xs ? (drawer = false) : null"
                  />
                </template>
              </v-tooltip>
              <v-list-item
                v-else
                :to="child.to"
                :title="child.title"
                :prepend-icon="child.icon || 'ri-subtract-line'"
                class="menu-sub-item"
                active-class="active-link"
                :active="isItemActive(child.to)"
                @click="xs ? (drawer = false) : null"
              />
            </template>
          </v-list-group>

          <template v-else>
            <v-tooltip v-if="rail && !xs" :text="item.title" location="end">
              <template #activator="{ props: tooltipProps }">
                <v-list-item
                  v-bind="tooltipProps"
                  :to="item.to"
                  :prepend-icon="item.icon"
                  :title="item.title"
                  class="menu-item"
                  selected-class="active-link"
                  @click="xs ? (drawer = false) : null"
                />
              </template>
            </v-tooltip>
            <v-list-item
              v-else
              :to="item.to"
              :prepend-icon="item.icon"
              :title="item.title"
              class="menu-item"
              selected-class="active-link"
              @click="xs ? (drawer = false) : null"
            />
          </template>
        </template>
        <!-- Logout Item (Scrollable) -->
        <v-spacer />
        <v-divider class="my-2" />
        <v-tooltip v-if="rail && !xs" text="تسجيل الخروج" location="end">
          <template #activator="{ props: logoutTooltipProps }">
            <v-list-item
              v-bind="logoutTooltipProps"
              prepend-icon="ri-logout-box-line"
              title="تسجيل الخروج"
              @click="handleLogout"
              class="logout-item"
            />
          </template>
        </v-tooltip>
        <v-list-item v-else prepend-icon="ri-logout-box-line" title="تسجيل الخروج" @click="handleLogout" class="logout-item" />
      </v-list>
    </div>

    <CompanySwitchDialog v-model="showCompanySwitch" />
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import navigationMenu, { CUSTOMER_MENU } from '@/config/navigation';
import { toast } from 'vue3-toastify';
import { useDisplay } from 'vuetify';
import AppButton from '@/components/common/AppButton.vue';
import CompanySwitchDialog from '@/components/common/CompanySwitchDialog.vue';

const showCompanySwitch = ref(false);

const { xs, smAndUp } = useDisplay();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const activeCompany = computed(() => {
  return userStore.companies.find(c => c.id === userStore.currentUser?.company_id);
});

const authStore = useAuthStore();

const props = defineProps({
  modelValue: { type: Boolean, default: true },
});

const emit = defineEmits(['update:modelValue']);

// تحويل v-model ليعمل بشكل متوافق مع Vuetify
const drawer = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const rail = ref(false);
const openedGroups = ref([]);

// مراقبة حجم الشاشة لضبط الحالة الابتدائية
watch(
  xs,
  isMobile => {
    if (!isMobile) {
      drawer.value = true;
      rail.value = false;
    } else {
      drawer.value = false;
    }
  },
  { immediate: true }
);

const scrollToActive = () => {
  setTimeout(() => {
    const activeItem = document.querySelector('.sidebar .active-link');
    if (activeItem) {
      activeItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 300);
};

onMounted(scrollToActive);
watch(() => route.path, scrollToActive);

const filteredMenu = computed(() => {
  const menuSource = userStore.isStaff ? navigationMenu : CUSTOMER_MENU;
  return menuSource.filter(item => {
    // Check permission
    if (!canAccess(item.permission)) return false;

    // Check installment requirement for customers
    if (!userStore.isStaff && item.requiresInstallments && !userStore.hasInstallments) {
      return false;
    }

    return true;
  });
});

const canAccess = permission => {
  if (!permission) return true;
  return userStore.hasPermission(permission);
};

const isItemActive = itemPath => {
  if (!itemPath) return false;

  // If path contains query params, do strict check
  if (itemPath.includes('?')) {
    return route.fullPath === itemPath;
  }

  // Otherwise let Vuetify handle it (or basic path check)
  return route.path === itemPath;
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/login');
  } catch (error) {
    toast.error('حدث خطأ أثناء تسجيل الخروج');
  }
};
</script>

<style scoped>
:deep(.v-list-item--nav .v-list-item-title) {
  padding: 5px 0;
}
.active-link {
  background: rgba(var(--v-theme-primary), 0.12) !important;
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600;
  border-inline-start: 4px solid rgb(var(--v-theme-primary));
}

.sidebar {
  border-inline-end: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  height: 100vh !important;
  position: fixed !important;
  top: 0 !important;
  bottom: 0 !important;
  z-index: 1000;
  overflow: visible !important; /* Allow rail toggle to show outside */
}

:deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: visible !important; /* Allow rail toggle to show outside */
}

.sidebar-sidebar-header-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  padding: 0px 10px;
  min-height: 74px;
  transition: all 0.3s ease;
}

.sidebar-header {
  padding: 8px 10px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;
}

.sidebar-header.clickable:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.company-field {
  font-size: 0.75rem !important;
  line-height: 1;
  margin-bottom: 2px;
  opacity: 0.8;
}

.switch-hint {
  font-size: 0.7rem !important;
  opacity: 0.6;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-avatar {
  flex-shrink: 0;
  padding: 2px !important;
}

.logo-text-wrapper {
  line-height: 1.1;
  flex: 1;
  min-width: 0;
}

.logo-text {
  font-size: 1rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 160px;
  line-height: 1.2;
}

.header-rail-toggle {
  position: absolute;
  top: 50%;
  inset-inline-end: -14px;
  transform: translate(-14%, -50%);
  z-index: 1001;
}

.rail-icon-btn {
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgb(var(--v-theme-surface));
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.rail-icon-btn:hover {
  transform: scale(1.1);
  color: rgb(var(--v-theme-secondary)) !important;
}

.sidebar-menu-wrapper {
  flex: 1;
  height: 100vh;
  overflow-y: auto;
  scroll-behavior: smooth;
}

/* تخصيص السكرول بار */
.sidebar-menu-wrapper::-webkit-scrollbar {
  width: 4px;
}
.sidebar-menu-wrapper::-webkit-scrollbar-thumb {
  background: rgba(var(--v-theme-primary), 0.2);
  border-radius: 10px;
}

.menu-item,
.menu-sub-item {
  border-radius: 4px;
}

.menu-sub-item {
  padding-inline-start: 24px !important;
  font-size: 0.85rem;
}

.group-header {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.05) !important;
  margin-bottom: 8px !important;
}

.logout-item {
  color: rgb(var(--v-theme-error));
}

.rail-toggle {
  padding: 8px;
}
</style>
