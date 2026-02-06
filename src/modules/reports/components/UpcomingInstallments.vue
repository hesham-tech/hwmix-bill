<template>
  <InstallmentsTable
    :items="installments"
    :loading="loading"
    :show-plan="false"
    title="الأقساط المستحقة قريباً"
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
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import InstallmentsTable from '@/modules/installments/components/InstallmentsTable.vue';
import InstallmentDetailsDialog from '@/modules/installments/components/InstallmentDetailsDialog.vue';

const props = defineProps({
  installments: {
    type: Array,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const router = useRouter();
const installmentsCount = computed(() => props.installments.length);

const showDetailsDialog = ref(false);
const selectedInstallment = ref(null);

const handleView = item => {
  selectedInstallment.value = item;
  showDetailsDialog.value = true;
};
</script>
