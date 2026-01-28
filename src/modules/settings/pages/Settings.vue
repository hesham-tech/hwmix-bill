<template>
  <div class="settings-page">
    <div class="page-header mb-8">
      <h1 class="text-h3 font-weight-bold primary--text mb-2">الإعدادات</h1>
      <p class="text-subtitle-1 text-grey-darken-1">تخصيص النظام وإدارة التفضيلات العامة</p>
    </div>

    <v-row>
      <v-col v-for="card in settingCards" :key="card.title" cols="12" sm="6" lg="4" xl="3">
        <v-hover v-slot="{ isHovering, props }">
          <v-card
            v-bind="props"
            :elevation="isHovering ? 8 : 2"
            class="setting-card h-100 transition-swing cursor-pointer"
            :to="card.to"
            rounded="xl"
          >
            <v-card-text class="pa-6 d-flex flex-column align-center text-center">
              <v-avatar :color="card.color" size="72" variant="tonal" class="mb-4">
                <v-icon :icon="card.icon" size="36" />
              </v-avatar>

              <h3 class="text-h6 font-weight-bold mb-2">{{ card.title }}</h3>
              <p class="text-body-2 text-grey-darken-1">{{ card.description }}</p>
            </v-card-text>

            <v-divider />

            <v-card-actions class="justify-center py-3 bg-grey-lighten-5">
              <span class="text-button text-primary font-weight-bold">الذهاب الآن</span>
              <v-icon icon="ri-arrow-left-s-line" color="primary" class="ms-1" />
            </v-card-actions>
          </v-card>
        </v-hover>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';

const authStore = useAuthStore();
const { can, canAny } = usePermissions();

const settingCards = computed(() => {
  const cards = [
    {
      title: 'الملف الشخصي',
      description: 'إدارة بياناتك الشخصية وصورة الحساب',
      icon: 'ri-user-settings-line',
      color: 'primary',
      to: '/app/profile',
    },
  ];

  if (canAny(PERMISSIONS.COMPANIES_VIEW_ALL, PERMISSIONS.COMPANIES_VIEW_CHILDREN, PERMISSIONS.COMPANIES_VIEW_SELF)) {
    cards.push({
      title: 'بيانات الشركة',
      description: 'تحديث هوية الشركة، الشعار، وقنوات التواصل',
      icon: 'ri-building-line',
      color: 'success',
      to: '/app/company',
    });
  }

  if (canAny(PERMISSIONS.ROLES_VIEW_ALL, PERMISSIONS.ROLES_VIEW_CHILDREN, PERMISSIONS.ROLES_VIEW_SELF)) {
    cards.push({
      title: 'الأدوار والصلاحيات',
      description: 'إدارة أدوار المستخدمين ومنح الصلاحيات',
      icon: 'ri-shield-keyhole-line',
      color: 'warning',
      to: '/app/roles',
    });
  }

  if (canAny(PERMISSIONS.USERS_VIEW_ALL, PERMISSIONS.USERS_VIEW_CHILDREN, PERMISSIONS.USERS_VIEW_SELF)) {
    cards.push({
      title: 'فريق العمل',
      description: 'إضافة وإدارة مستخدمي وموظفي الشركة',
      icon: 'ri-group-line',
      color: 'info',
      to: '/app/users',
    });
  }

  if (canAny(PERMISSIONS.ACTIVITY_LOGS_VIEW_ALL, PERMISSIONS.ACTIVITY_LOGS_VIEW_CHILDREN, PERMISSIONS.ACTIVITY_LOGS_VIEW_SELF)) {
    cards.push({
      title: 'سجل الأنشطة',
      description: 'مراقبة كافة العمليات والتغييرات في النظام',
      icon: 'ri-history-line',
      color: 'error',
      to: '/app/activity-logs',
    });
  }

  if (can(PERMISSIONS.ADMIN_SUPER)) {
    cards.push({
      title: 'النسخ الاحتياطي',
      description: 'إدارة النسخ الاحتياطية واستعادة النظام والإعدادات',
      icon: 'ri-database-2-line',
      color: 'blue-grey',
      to: '/app/backups',
    });
    cards.push({
      title: 'تقارير الأعطال',
      description: 'متابعة المشاكل التقنية التي أبلغ عنها المستخدمون',
      icon: 'ri-bug-line',
      color: 'warning',
      to: '/app/error-reports',
    });
  }

  // Common Settings for modules (only if they have modular view perms)
  if (canAny(PERMISSIONS.PAYMENT_METHODS_VIEW_ALL, PERMISSIONS.PAYMENT_METHODS_VIEW_CHILDREN, PERMISSIONS.PAYMENT_METHODS_VIEW_SELF)) {
    cards.push({
      title: 'طرق الدفع',
      description: 'إدارة وسائل الدفع وقنوات استلام النقدية',
      icon: 'ri-bank-card-line',
      color: 'deep-purple',
      to: '/app/payment-methods',
    });
  }

  if (canAny(PERMISSIONS.CASH_BOX_TYPES_VIEW_ALL, PERMISSIONS.CASH_BOX_TYPES_VIEW_CHILDREN, PERMISSIONS.CASH_BOX_TYPES_VIEW_SELF)) {
    cards.push({
      title: 'أنواع الخزائن',
      description: 'تصنيف وإدارة أنواع صناديق النقدية',
      icon: 'ri-safe-2-line',
      color: 'teal',
      to: '/app/cashbox-types',
    });
  }

  return cards;
});
</script>

<script>
export default {
  name: 'SettingsPage',
};
</script>

<style scoped>
.settings-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px 16px;
}

.setting-card {
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.setting-card:hover {
  transform: translateY(-5px);
}
</style>
