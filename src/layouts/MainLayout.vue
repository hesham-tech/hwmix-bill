<template>
  <Sidebar v-model="drawer" />

  <v-app-bar color="surface" elevation="0" class="border-b">
    <v-app-bar-nav-icon color="primary" @click="drawer = !drawer" class="d-flex d-sm-none" />

    <v-spacer />

    <v-tooltip location="bottom">
      <template #activator="{ props: tooltipProps }">
        <AppButton v-bind="tooltipProps" icon variant="text" @click="toggleLanguage" class="mx-2">
          <v-icon>ri-translate-2</v-icon>
        </AppButton>
      </template>
      {{ localeStore.locale === 'ar' ? 'English' : 'عربي' }}
    </v-tooltip>

    <v-menu>
      <template #activator="{ props }">
        <AppButton v-bind="props" variant="text" class="user-menu-btn px-2">
          <AppAvatar :img-url="userStore.currentUser?.avatar_url" :name="userStore.currentUser?.full_name" size="30" class="ml-2" />
          <span class="d-none d-sm-inline">{{ userName }}</span>
          <v-icon icon="ri-arrow-down-s-line" size="x-small" class="ms-1" />
        </AppButton>
      </template>
      <v-list density="compact">
        <v-list-item prepend-icon="ri-user-settings-line" title="الملف الشخصي" to="/profile" />
        <v-list-item prepend-icon="ri-settings-3-line" title="الإعدادات" to="/settings" />
        <v-divider class="my-1" />
        <v-list-item prepend-icon="ri-logout-box-line" title="تسجيل الخروج" @click="handleLogout" class="text-error" />
      </v-list>
    </v-menu>
  </v-app-bar>

  <v-main class="main-content">
    <div class="sticky-breadcrumbs-container border-b">
      <v-container fluid class="py-1 px-1">
        <v-breadcrumbs :items="breadcrumbs" class="pa-0 text-caption">
          <template #divider>
            <v-icon icon="ri-arrow-left-s-line" size="small" />
          </template>
        </v-breadcrumbs>
      </v-container>
    </div>

    <v-container fluid class="pa-6">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-container>
  </v-main>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { useLocaleStore } from '@/stores/locale';
import { authService } from '@/api';
import Sidebar from '@/components/layout/Sidebar.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import { toast } from 'vue3-toastify';
import { useDisplay } from 'vuetify';

const { xs } = useDisplay();
const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const localeStore = useLocaleStore();

// نجعل القائمة مغلقة افتراضياً في الجوال ومفتوحة في الحاسوب
const drawer = ref(!xs.value);

// مراقبة الحجم لضبط الـ drawer
watch(
  xs,
  isMobile => {
    drawer.value = !isMobile;
  },
  { immediate: true }
);

const userName = computed(() => userStore.currentUser?.full_name || 'المستخدم');

const breadcrumbs = computed(() => {
  const items = [{ title: 'الرئيسية', to: '/dashboard', disabled: false }];
  if (route.meta.breadcrumbs) {
    items.push(...route.meta.breadcrumbs);
  } else if (route.meta.title) {
    items.push({ title: route.meta.title, disabled: true });
  }
  return items;
});

const toggleLanguage = () => {
  localeStore.toggleLocale();
  toast.success(localeStore.locale === 'ar' ? 'تم التبديل للعربية' : 'Switched to English');
};

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
.sticky-breadcrumbs-container {
  position: sticky;
  top: 48px;
  z-index: 5;
  background: rgb(var(--v-theme-surface));
}

.main-content {
  background: rgb(var(--v-theme-background));
  min-height: 100vh;
}

.user-menu-btn {
  text-transform: none;
  font-weight: 500;
}

/* Page Transitions */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(5px);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}
</style>
