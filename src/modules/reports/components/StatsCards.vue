<template>
  <v-row dense>
    <v-col v-for="(card, index) in cardData" :key="index" cols="6" sm="6" md="4" lg="2">
      <v-card border flat class="rounded-md overflow-hidden pa-1 h-100">
        <v-skeleton-loader v-if="loading" type="list-item-avatar, heading, subtitle" class="pa-2" />
        <v-card-text v-else :class="['pa-2 pa-sm-4 h-100 d-flex flex-column', `bg-${card.color}-lighten-5`]">
          <div class="d-flex align-center justify-space-between flex-wrap ga-1">
            <div class="flex-grow-1 min-width-0">
              <div :class="['text-xxs font-weight-bold mb-0 truncate-text', `text-${card.color}`]">{{ card.title }}</div>
              <div :class="['text-subtitle-2 text-sm-h5 font-weight-black line-height-1 truncate-text', `text-${card.color}`]">
                {{ card.value }}
              </div>
            </div>
            <v-avatar :color="card.color" :size="xs ? 28 : 40" variant="flat" class="rounded-sm flex-shrink-0">
              <v-icon :icon="card.icon" color="white" :size="xs ? 18 : 24" />
            </v-avatar>
          </div>
          <div class="mt-auto pt-2 text-xxs text-grey truncate-text">{{ card.subtitle }}</div>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed } from 'vue';
import { useDisplay } from 'vuetify';
import { formatCurrency } from '@/utils/formatters';

const props = defineProps({
  stats: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const { xs } = useDisplay();

const cardData = computed(() => [
  {
    title: 'إجمالي المبيعات',
    value: formatCurrency(props.stats.totalSales),
    subtitle: 'تراكمي',
    icon: 'ri-money-dollar-box-line',
    color: 'success',
  },
  {
    title: 'مبيعات الشهر',
    value: formatCurrency(props.stats.monthlySales),
    subtitle: 'هذا الشهر',
    icon: 'ri-calendar-event-line',
    color: 'primary',
  },
  {
    title: 'تحصيل معلق',
    value: formatCurrency(props.stats.pendingPayments),
    subtitle: 'معلق',
    icon: 'ri-hand-coin-line',
    color: 'error',
  },
  {
    title: 'اقساط مستحقة',
    value: formatCurrency(props.stats.unpaidInstallments),
    subtitle: 'يجب تحصيلة',
    icon: 'ri-calendar-check-line',
    color: 'warning',
  },
  {
    title: 'العملاء',
    value: props.stats.totalCustomers || 0,
    subtitle: 'نشطون',
    icon: 'ri-team-line',
    color: 'info',
  },
]);
</script>

<style scoped>
.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.line-height-1 {
  line-height: 1.1 !important;
}
.text-xxs {
  font-size: 0.65rem !important;
}
</style>
