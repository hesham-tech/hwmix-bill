<template>
  <InstallmentsTable
    :items="installments"
    :loading="loading"
    :show-plan="false"
    title="الأقساط المستحقة للتحصيل"
    icon="ri-calendar-schedule-line"
    hide-pagination
    class="rounded-md overflow-hidden border"
    :items-per-page="5"
    @view="handleView"
  >
    <template #actions>
      <v-chip v-if="installmentsCount > 0" color="info" size="small" variant="flat" class="font-weight-bold">
        {{ installmentsCount }} أقساط مجدولة
      </v-chip>
    </template>

    <template #no-data>
      <div class="text-center pa-8">
        <v-icon icon="ri-time-line" size="48" color="grey-lighten-2" class="mb-2 opacity-50" />
        <div class="text-subtitle-1 text-grey font-weight-medium">لا توجد أقساط مستحقة خلال الفترة القادمة</div>
      </div>
    </template>
  </InstallmentsTable>

  <!-- Details Dialog -->
  <InstallmentDetailsDialog v-model="showDetailsDialog" :installment="selectedInstallment" />
</template>

<script setup>
// يعرض جدول الأقساط المالية المجدولة والمستحقة قريباً تفاعلياً عبر الـ Runtime المركزي.
import { ref, computed, onMounted } from 'vue';
import InstallmentsTable from '@/modules/installments/components/InstallmentsTable.vue';
import InstallmentDetailsDialog from '@/modules/installments/components/InstallmentDetailsDialog.vue';
import { useDashboardStore } from '@/@core/dashboard/store/dashboardStore';

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

const dashboardStore = useDashboardStore();

const loading = computed(() => {
  return dashboardStore.widgetLoadingStates[props.instanceId] !== false;
});

const installments = computed(() => {
  const wData = dashboardStore.dashboardData[props.instanceId];
  return Array.isArray(wData) ? wData : [];
});

const installmentsCount = computed(() => installments.value.length);

const showDetailsDialog = ref(false);
const selectedInstallment = ref(null);

const handleView = item => {
  selectedInstallment.value = item;
  showDetailsDialog.value = true;
};

const loadData = async () => {
  await dashboardStore.fetchWidgetData(props.instanceId);
};

onMounted(() => {
  loadData();
});
</script>

<script>
/**
 * مكون عرض الأقساط المستحقة القادمة (ممتثل للـ Widget Contract)
 */
export default {
  name: 'UpcomingInstallments'
}
</script>
