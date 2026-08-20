<template>
  <v-navigation-drawer
    v-model="internalValue"
    location="right"
    width="450"
    temporary
  >
    <div class="d-flex align-center px-4 py-3 border-b">
      <h3 class="text-h6 mb-0">تفاصيل العهدة</h3>
      <v-spacer></v-spacer>
      <v-btn icon="mdi-close" variant="text" @click="close" density="comfortable"></v-btn>
    </div>

    <v-card-text v-if="loading" class="text-center py-5">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-card-text>
    
    <v-card-text v-else-if="custodyData">
      <v-list lines="two">
        <v-list-item>
          <v-list-item-title class="text-caption text-grey">الموظف / المستلم</v-list-item-title>
          <v-list-item-subtitle class="text-body-1">{{ custodyData.user?.name || '-' }}</v-list-item-subtitle>
        </v-list-item>
        
        <v-list-item>
          <v-list-item-title class="text-caption text-grey">المبلغ الإجمالي</v-list-item-title>
          <v-list-item-subtitle class="text-body-1 font-weight-bold">{{ custodyData.amount }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <v-list-item-title class="text-caption text-grey">المبلغ المتبقي</v-list-item-title>
          <v-list-item-subtitle class="text-body-1 font-weight-bold text-primary">{{ custodyData.remaining_amount }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <v-list-item-title class="text-caption text-grey">تاريخ الصرف</v-list-item-title>
          <v-list-item-subtitle class="text-body-1">{{ custodyData.issue_date }}</v-list-item-subtitle>
        </v-list-item>

        <v-list-item>
          <v-list-item-title class="text-caption text-grey">الحالة</v-list-item-title>
          <v-list-item-subtitle>
            <v-chip size="small" :color="getStatusColor(custodyData.status)">{{ getStatusLabel(custodyData.status) }}</v-chip>
          </v-list-item-subtitle>
        </v-list-item>

        <v-list-item v-if="custodyData.description">
          <v-list-item-title class="text-caption text-grey">الوصف</v-list-item-title>
          <v-list-item-subtitle class="text-body-2">{{ custodyData.description }}</v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <v-divider class="my-3"></v-divider>
      <h4 class="text-subtitle-1 mb-2">العمليات</h4>
      <v-timeline v-if="custodyData.transactions && custodyData.transactions.length" density="compact" side="end">
        <v-timeline-item v-for="t in custodyData.transactions" :key="t.id" :color="t.type === 'refund' ? 'success' : t.type === 'expense' ? 'error' : 'primary'" size="small">
          <div class="d-flex justify-space-between w-100">
            <div>
              <div class="font-weight-bold">{{ getTxTypeLabel(t.type) }}</div>
              <div class="text-caption">{{ t.description || '-' }}</div>
            </div>
            <div class="text-right">
              <div class="font-weight-bold">{{ t.amount }}</div>
              <div class="text-caption">{{ t.date }}</div>
            </div>
          </div>
        </v-timeline-item>
      </v-timeline>
      <div v-else class="text-center text-caption text-grey">لا توجد عمليات مسجلة.</div>
    </v-card-text>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useCustodies } from '../composables/useCustodies';

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  custodyId: { type: [Number, String], default: null },
});

const emit = defineEmits(['update:modelValue']);
const { getCustody } = useCustodies();

const internalValue = ref(props.modelValue);
const loading = ref(false);
const custodyData = ref(null);

watch(() => props.modelValue, val => {
  internalValue.value = val;
  if (val && props.custodyId) {
    loadData();
  }
});
watch(() => internalValue.value, val => emit('update:modelValue', val));

const loadData = async () => {
  loading.value = true;
  const res = await getCustody(props.custodyId);
  if (res && res.success) {
    custodyData.value = res.data;
  }
  loading.value = false;
};

const close = () => {
  internalValue.value = false;
};

const getStatusColor = status => {
  const map = { active: 'primary', settled: 'success' };
  return map[status] || 'grey';
};

const getStatusLabel = status => {
  const map = { active: 'نشطة', settled: 'مسواة' };
  return map[status] || status;
};

const getTxTypeLabel = type => {
  const map = { issue: 'صرف', refund: 'رد', expense: 'مصروف' };
  return map[type] || type;
};
</script>
