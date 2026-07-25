<template>
  <AppCard title="إجراءات سريعة" icon="ri-flashlight-line" class="h-100">
    <template #actions>
      <v-chip size="x-small" color="primary" variant="flat" class="font-weight-bold">أكثر استخداماً</v-chip>
    </template>

    <v-list class="pa-0">
      <v-list-item
        v-for="action in actions"
        :key="action.title"
        class="border-b py-3 px-4 clickable-action"
        @click="handleAction(action.route)"
      >
        <template #prepend>
          <v-avatar :color="`${action.color}-lighten-5`" size="40" class="me-3">
            <v-icon :icon="action.icon" :color="action.color" />
          </v-avatar>
        </template>

        <v-list-item-title class="font-weight-bold text-body-1">{{ action.title }}</v-list-item-title>
        <v-list-item-subtitle class="text-caption">{{ action.subtitle }}</v-list-item-subtitle>

        <template #append>
          <v-icon icon="ri-arrow-left-s-line" color="grey-lighten-1" size="small" />
        </template>
      </v-list-item>
    </v-list>
  </AppCard>
</template>

<script setup>
// يعرض كارت الإجراءات السريعة لتمكين المستخدم من إنشاء الفواتير والمدفوعات فورياً.
import { useRouter } from 'vue-router';
import AppCard from '@/components/common/AppCard.vue';

const props = defineProps({
  instanceId: {
    type: String,
    required: true
  },
  userConfig: {
    type: Object,
    default: () => ({})
  }
});

const router = useRouter();

const actions = [
  {
    title: 'فاتورة جديدة',
    subtitle: 'إنشاء فاتورة بيع جديدة',
    icon: 'ri-file-add-line',
    color: 'primary',
    route: '/app/invoices/create',
  },
  {
    title: 'تسجيل دفعة',
    subtitle: 'إضافة دفعة قبض جديدة',
    icon: 'ri-money-dollar-circle-line',
    color: 'success',
    route: '/app/payments/create',
  },
  {
    title: 'منتج جديد',
    subtitle: 'إضافة منتج أو صنف للمخزون',
    icon: 'ri-shopping-bag-line',
    color: 'info',
    route: '/app/products/create',
  },
  {
    title: 'عرض التقارير',
    subtitle: 'تقارير مفصلة ودقيقة للنظام',
    icon: 'ri-bar-chart-line',
    color: 'warning',
    route: '/app/reports',
  },
];

const handleAction = (route) => {
  router.push(route);
};
</script>

<script>
/**
 * مكون الإجراءات السريعة (ممتثل للـ Widget Contract)
 */
export default {
  name: 'QuickActions'
}
</script>

<style scoped>
.clickable-action {
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.clickable-action:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}
</style>
