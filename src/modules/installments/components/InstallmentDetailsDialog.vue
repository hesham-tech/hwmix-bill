<template>
  <AppDialog
    v-model="internalValue"
    :title="`تفاصيل القسط #${installment?.installment_number}`"
    icon="ri-information-line"
    max-width="700"
    :show-confirm="false"
    cancel-text="إغلاق"
    @cancel="close"
  >
    <div v-if="installment" class="installment-details">
      <!-- Header Info -->
      <v-row class="mb-6">
        <v-col cols="12" md="6">
          <div class="d-flex align-center pa-4 rounded-md border bg-light">
            <AppAvatar :src="customer?.avatar_url" :name="customer?.full_name" size="64" class="me-4 shadow-sm" />
            <div>
              <div class="text-h6 font-weight-bold mb-1">{{ customer?.full_name || '---' }}</div>
              <AppPhone :number="customer?.phone" />
            </div>
          </div>
        </v-col>
        <v-col cols="12" md="6">
          <div class="pa-4 rounded-md border h-100 d-flex flex-column justify-center">
            <div class="d-flex justify-space-between align-center mb-2">
              <span class="text-grey">رقم القسط:</span>
              <v-chip color="secondary" size="small" variant="tonal" class="font-weight-bold">
                {{ installment.installment_number }}
              </v-chip>
            </div>
            <div class="d-flex justify-space-between align-center">
              <span class="text-grey">الحالة:</span>
              <v-chip :color="getStatusColor(installment.status)" size="small" variant="flat" class="font-weight-bold">
                {{ getStatusLabel(installment.status) }}
              </v-chip>
            </div>
          </div>
        </v-col>
      </v-row>

      <!-- Financial Info -->
      <v-row class="mb-6">
        <v-col cols="4">
          <div class="pa-4 rounded-md border text-center">
            <div class="text-caption text-grey mb-1">قيمة القسط</div>
            <div class="text-h6 font-weight-black text-primary">{{ formatCurrency(installment.amount) }}</div>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="pa-4 rounded-md border text-center bg-error-lighten-5 border-error border-opacity-25">
            <div class="text-caption text-error font-weight-bold mb-1">المبلغ المتبقي</div>
            <div class="text-h6 font-weight-black text-error">{{ formatCurrency(installment.remaining) }}</div>
          </div>
        </v-col>
        <v-col cols="4">
          <div class="pa-4 rounded-md border text-center">
            <div class="text-caption text-grey mb-1">تاريخ الاستحقاق</div>
            <div class="text-h6 font-weight-bold">{{ formatDate(installment.due_date) }}</div>
          </div>
        </v-col>
      </v-row>

      <!-- Plan Info -->
      <v-row>
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="rounded-md h-100">
            <v-card-title class="d-flex align-center py-3 text-subtitle-1 font-weight-bold">
              <v-icon icon="ri-file-list-3-line" class="me-2" color="primary" />
              معلومات الخطة
              <v-spacer />
              <v-btn variant="text" color="primary" prepend-icon="ri-external-link-line" size="small" @click="goToPlan"> فتح </v-btn>
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-list density="compact">
                <v-list-item>
                  <template #prepend>
                    <v-icon icon="ri-hashtag" color="grey" size="small" />
                  </template>
                  <v-list-item-title>رقم الخطة</v-list-item-title>
                  <template #append>
                    <span class="font-weight-bold">#{{ installment.installment_plan_id }}</span>
                  </template>
                </v-list-item>
                <v-divider inset />
                <v-list-item v-if="installment.paid_at">
                  <template #prepend>
                    <v-icon icon="ri-time-line" color="grey" size="small" />
                  </template>
                  <v-list-item-title>تاريخ السداد</v-list-item-title>
                  <template #append>
                    <span class="text-success font-weight-bold">{{ formatDate(installment.paid_at, true) }}</span>
                  </template>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Products List -->
        <v-col cols="12" md="6">
          <v-card variant="outlined" class="rounded-md h-100">
            <v-card-title class="py-3 text-subtitle-1 font-weight-bold d-flex align-center">
              <v-icon icon="ri-shopping-bag-line" class="me-2" color="primary" />
              المنتجات في الفاتورة
            </v-card-title>
            <v-divider />
            <v-card-text class="pa-0">
              <v-list density="compact" class="overflow-y-auto" style="max-height: 150px">
                <v-list-item
                  v-for="(item, idx) in installment.installment_plan?.invoice?.items"
                  :key="idx"
                  :class="{ 'border-b': idx < installment.installment_plan?.invoice?.items?.length - 1 }"
                >
                  <v-list-item-title class="text-body-2 font-weight-medium">
                    {{ item.name || item.variant?.product?.full_name || item.variant?.product?.name || item.product_name }}
                  </v-list-item-title>
                  <template #append>
                    <v-chip size="x-small" variant="tonal" class="font-weight-bold"> الكمية: {{ item.quantity }} </v-chip>
                  </template>
                </v-list-item>
                <div v-if="!installment.installment_plan?.invoice?.items?.length" class="pa-4 text-center text-grey">لا توجد منتجات مسجلة</div>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Spacing -->
      <div class="mb-6"></div>

      <!-- Payments List (If any) -->
      <div v-if="installment.payments?.length">
        <div class="text-subtitle-1 font-weight-bold mb-3 d-flex align-center">
          <v-icon icon="ri-history-line" class="me-2" color="primary" />
          سجل التحصيلات لهذا القسط
        </div>
        <v-table class="border rounded-md">
          <thead>
            <tr>
              <th class="text-right">التاريخ</th>
              <th class="text-right">المبلغ</th>
              <th class="text-right">طريقة الدفع</th>
              <th class="text-right">المرجع</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in installment.payments" :key="p.id">
              <td>{{ formatDate(p.payment_date) }}</td>
              <td class="font-weight-bold text-success">{{ formatCurrency(p.pivot?.amount_paid || p.amount_paid) }}</td>
              <td>{{ p.payment_method }}</td>
              <td class="text-caption text-grey">{{ p.reference_number || '---' }}</td>
            </tr>
          </tbody>
        </v-table>
      </div>
    </div>
  </AppDialog>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { AppDialog, AppAvatar, AppPhone } from '@/components';
import { formatCurrency, formatDate } from '@/utils/formatters';

const props = defineProps({
  modelValue: Boolean,
  installment: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['update:modelValue']);
const router = useRouter();

const internalValue = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
});

const customer = computed(() => {
  return props.installment?.installment_plan?.invoice?.customer || props.installment?.user;
});

const getStatusColor = status => {
  const colors = {
    pending: 'warning',
    paid: 'success',
    overdue: 'error',
    cancelled: 'grey',
    partially_paid: 'info',
  };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = {
    pending: 'معلق',
    paid: 'مدفوع',
    overdue: 'متأخر',
    cancelled: 'ملغي',
    partially_paid: 'مدفوع جزئياً',
  };
  return labels[status] || status;
};

const goToPlan = () => {
  router.push(`/app/installment-plans/${props.installment.installment_plan_id}`);
  close();
};

const close = () => {
  internalValue.value = false;
};
</script>

<style scoped>
.bg-light {
  background-color: #f8fafc;
}
</style>
