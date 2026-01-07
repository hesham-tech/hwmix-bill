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
    <div class="sidebar-header" @click="!xs ? (rail = !rail) : null">
      <div class="logo-container">
        <v-avatar size="32" v-if="userStore.currentUser?.company_logo">
          <v-img :src="userStore.currentUser.company_logo" contain />
        </v-avatar>
        <v-icon v-else icon="ri-building-line" size="32" color="primary" />
        <transition name="fade">
          <h2 v-if="!rail || xs" class="logo-text ms-2">hwmix-bill</h2>
        </transition>
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
                    selected-class="active-link"
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
                selected-class="active-link"
                @click="xs ? (drawer = false) : null"
              />
            </template>
          </v-list-group>

          <!-- Standalone item -->
          <template v-else>
            <v-tooltip v-if="rail && !xs" :text="item.title" location="end">
              <template #activator="{ props: itemTooltipProps }">
                <v-list-item
                  v-bind="itemTooltipProps"
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
      </v-list>
    </div>

    <template #append>
      <v-divider />
      <v-list density="compact" nav>
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
      <div v-if="!xs" class="rail-toggle">
        <AppButton :icon="rail ? 'ri-menu-unfold-line' : 'ri-menu-fold-line'" variant="text" @click="rail = !rail" />
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useAuthStore } from '@/stores/auth';
import navigationMenu from '@/config/navigation';
import { toast } from 'vue3-toastify';
import { useDisplay } from 'vuetify';
import AppButton from '@/components/common/AppButton.vue';

const { xs, smAndUp } = useDisplay();
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
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
  return navigationMenu.filter(item => canAccess(item.permission));
});

const canAccess = permission => {
  if (!permission) return true;
  return userStore.hasPermission(permission);
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
  overflow-y: hidden !important;
}

:deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 20px 16px;
  cursor: pointer;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-text {
  font-size: 1.15rem;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.sidebar-menu-wrapper {
  flex: 1;
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
  margin-bottom: 4px;
  border-radius: 8px;
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
