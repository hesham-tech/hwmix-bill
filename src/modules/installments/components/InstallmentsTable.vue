<template>
  <AppDataTable
    :headers="computedHeaders"
    :items="items"
    :loading="loading"
    :total-items="totalItems"
    v-bind="$attrs"
    :can-edit="false"
    :can-delete="false"
    :can-view="false"
    title="جدول الأقساط"
    icon="ri-list-check-line"
  >
    <!-- Customer Column -->
    <template #item.customer="{ item }">
      <div v-if="showCustomer" class="d-flex align-center py-2">
        <AppAvatar :src="getCustomerData(item).avatar_url" :name="getCustomerData(item).full_name" size="36" class="me-3 shadow-sm border" />
        <div>
          <div class="font-weight-bold text-no-wrap text-body-2">
            {{ getCustomerData(item).full_name || '---' }}
          </div>
          <AppPhone :phone="getCustomerData(item).phone" />
        </div>
      </div>
    </template>

    <!-- Installment Number Column -->
    <template #item.installment_number="{ item }">
      <div class="py-1">
        <v-chip variant="tonal" size="x-small" color="primary" class="font-weight-bold"> قسط #{{ item.installment_number }} </v-chip>
        <div v-if="showRemaining" class="text-caption text-error font-weight-bold mt-1">المتبقي: {{ formatCurrency(item.remaining) }}</div>
      </div>
    </template>

    <!-- Plan/Products Column -->
    <template #item.plan="{ item }">
      <div v-if="showPlan" class="py-1 cursor-pointer" @click="$emit('view', item)">
        <div class="text-caption text-grey mb-1">
          <v-icon icon="ri-file-list-3-line" size="x-small" />
          خطة #{{ item.installment_plan_id }}
        </div>
        <div v-if="item.installment_plan?.invoice?.items?.length">
          <span class="text-body-2 font-weight-bold d-block text-primary hover-opacity" style="max-width: 200px">
            {{
              item.installment_plan.invoice.items
                .slice(0, 2)
                .map(i => i.name || i.variant?.product?.full_name || i.variant?.product?.name || i.product_name)
                .join(' ، ')
            }}
          </span>
          <v-chip v-if="item.installment_plan.invoice.items.length > 2" size="x-small" color="primary" variant="tonal" class="mt-1 font-weight-bold">
            + {{ item.installment_plan.invoice.items.length - 2 }} آخرين
          </v-chip>
        </div>
      </div>
    </template>

    <!-- Amount Column -->
    <template #item.amount="{ item }">
      <div class="font-weight-black text-body-1">{{ formatCurrency(item.amount) }}</div>
    </template>

    <!-- Due Date Column -->
    <template #item.due_date="{ item }">
      <div :class="[getDueDateClass(item.due_date, item.status), 'font-weight-medium']">
        {{ formatDate(item.due_date) }}
      </div>
    </template>

    <!-- Status Column -->
    <template #item.status="{ item }">
      <v-chip :color="getStatusColor(item.status)" size="small" variant="flat" class="font-weight-bold px-3">
        {{ item.status_label || getStatusLabel(item.status) }}
      </v-chip>
    </template>

    <!-- Actions -->
    <template #extra-actions="{ item }">
      <AppButton
        v-if="['paid', 'partially_paid'].includes(item.status) || item.remaining <= 0"
        icon="ri-printer-fill"
        size="small"
        variant="elevated"
        color="teal-darken-1"
        class="font-weight-black ms-2 px-3"
        tooltip="طباعة الإيصال"
        @click.stop="$emit('print-receipt', item)"
      >
        طباعة
      </AppButton>
      <AppButton
        icon="ri-eye-line"
        size="small"
        variant="tonal"
        color="info"
        class="font-weight-bold ms-1"
        tooltip="عرض التفاصيل"
        @click.stop="$emit('view', item)"
      />
      <AppButton
        v-if="['pending', 'partially_paid', 'overdue'].includes(item.status) && canPay"
        icon="ri-hand-coin-line"
        size="small"
        variant="tonal"
        color="success"
        class="font-weight-bold ms-1"
        tooltip="تحصيل المبلغ"
        @click.stop="$emit('pay', item)"
      >
        دفع
      </AppButton>
    </template>
  </AppDataTable>
</template>

<script setup>
import { computed } from 'vue';
import { AppDataTable, AppButton, AppAvatar, AppPhone } from '@/components';
import { formatCurrency, formatDate } from '@/utils/formatters';

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  totalItems: { type: Number, default: 0 },
  showCustomer: { type: Boolean, default: true },
  showPlan: { type: Boolean, default: true },
  showRemaining: { type: Boolean, default: true },
  canPay: { type: Boolean, default: true },
});

const emit = defineEmits(['view', 'pay', 'print-receipt']);

const computedHeaders = computed(() => {
  const h = [];
  if (props.showCustomer) h.push({ title: 'العميل', key: 'customer', sortable: false });
  h.push({ title: 'القسط', key: 'installment_number', sortable: true });
  if (props.showPlan) h.push({ title: 'المنتجات / الخطة', key: 'plan', sortable: false });
  h.push({ title: 'تاريخ الاستحقاق', key: 'due_date', sortable: true });
  h.push({ title: 'القيمة', key: 'amount', align: 'end', sortable: true });
  h.push({ title: 'الحالة', key: 'status', sortable: true });
  h.push({ title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', width: '180px' });
  return h;
});

const getCustomerData = item => {
  const customer = item.customer || item.installment_plan?.customer || item.installment_plan?.invoice?.customer;
  return {
    full_name: customer?.nickname || customer?.full_name || '---',
    avatar_url: customer?.avatar_url,
    phone: customer?.phone,
  };
};

const getStatusColor = status => {
  const colors = {
    pending: 'warning',
    paid: 'success',
    overdue: 'error',
    canceled: 'grey', // One 'L' as per standardization
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
    canceled: 'ملغي',
    cancelled: 'ملغي',
    partially_paid: 'مدفوع جزئياً',
  };
  return labels[status] || status;
};

const getDueDateClass = (dueDate, status) => {
  if (status === 'paid') return 'text-success';
  if (status === 'canceled' || status === 'cancelled') return 'text-grey';

  const today = new Date();
  const due = new Date(dueDate);
  if (due < today) return 'text-error font-weight-bold';
  return '';
};
</script>
