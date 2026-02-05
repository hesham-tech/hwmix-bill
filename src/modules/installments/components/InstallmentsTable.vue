<template>
  <AppDataTable
    :headers="computedHeaders"
    :items="displayItems"
    :loading="loading"
    :total-items="totalItems"
    v-bind="$attrs"
    :can-edit="false"
    :can-delete="false"
    :can-view="false"
    :row-props="getRowProps"
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
      <!-- Pay: Only if pending/overdue/partial AND has permission -->
      <AppButton
        v-if="
          ['pending', 'partially_paid', 'partial', 'overdue'].includes(item.status) &&
          canAny(PERMISSIONS.PAYMENTS_CREATE, PERMISSIONS.INSTALLMENT_PAYMENTS_CREATE)
        "
        icon="ri-hand-coin-line"
        size="small"
        variant="elevated"
        color="success"
        class="font-weight-black ms-1 px-3"
        tooltip="تحصيل المبلغ"
        @click.stop="$emit('pay', item)"
      >
        دفع
      </AppButton>

      <!-- Print Receipt: Only if paid or partially paid -->
      <AppButton
        v-if="['paid', 'partially_paid'].includes(item.status)"
        icon="ri-printer-fill"
        size="small"
        variant="elevated"
        color="teal-darken-1"
        class="font-weight-black ms-1 px-3"
        tooltip="طباعة الإيصال"
        @click.stop="$emit('print-receipt', item)"
      >
        طباعة
      </AppButton>

      <!-- View Details -->
      <AppButton
        icon="ri-eye-line"
        size="small"
        variant="tonal"
        color="info"
        class="font-weight-bold ms-1"
        tooltip="عرض التفاصيل"
        @click.stop="$emit('view', item)"
      >
        عرض
      </AppButton>
    </template>
  </AppDataTable>
</template>

<script setup>
import { computed } from 'vue';
import { AppDataTable, AppButton, AppAvatar, AppPhone } from '@/components';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { usePermissions } from '@/composables/usePermissions';
import { PERMISSIONS } from '@/config/permissions';

const { can, canAny } = usePermissions();

const props = defineProps({
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  totalItems: { type: Number, default: 0 },
  showCustomer: { type: Boolean, default: true },
  showPlan: { type: Boolean, default: true },
  showRemaining: { type: Boolean, default: true },
  autoSort: { type: Boolean, default: true }, // Whether to sort locally
});

const emit = defineEmits(['view', 'pay', 'print-receipt']);

// Logic for Row Decoration
const getRowProps = ({ item }) => {
  if (item.status === 'paid') return { class: 'bg-green-lighten-5' };
  if (item.status === 'partially_paid') return { class: 'bg-yellow-lighten-5' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(item.due_date);
  due.setHours(0, 0, 0, 0);

  if (item.status === 'overdue' || (['pending', 'partially_paid', 'partial'].includes(item.status) && due <= today)) {
    return { class: 'bg-red-lighten-5' };
  }

  return {};
};

// Logic for Sorting: Overdue first, then oldest pending
const displayItems = computed(() => {
  if (!props.autoSort) return props.items;

  return [...props.items].sort((a, b) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isOverdue = item => {
      const due = new Date(item.due_date);
      due.setHours(0, 0, 0, 0);
      return item.status === 'overdue' || (['pending', 'partially_paid', 'partial'].includes(item.status) && due <= today);
    };

    const aOverdue = isOverdue(a);
    const bOverdue = isOverdue(b);

    // 1. Overdue/Due Today priority
    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // 2. Status priority for others
    const priority = { pending: 1, partially_paid: 2, partial: 2, paid: 3, canceled: 4, cancelled: 4 };
    const aPrio = priority[a.status] ?? 99;
    const bPrio = priority[b.status] ?? 99;

    if (aPrio !== bPrio) return aPrio - bPrio;

    // 3. Date priority (oldest first)
    return new Date(a.due_date) - new Date(b.due_date);
  });
});

const computedHeaders = computed(() => {
  const h = [];
  if (props.showCustomer) h.push({ title: 'العميل', key: 'customer', sortable: false });
  h.push({ title: 'القسط', key: 'installment_number', sortable: true });
  if (props.showPlan) h.push({ title: 'المنتجات / الخطة', key: 'plan', sortable: false });
  h.push({ title: 'تاريخ الاستحقاق', key: 'due_date', sortable: true });
  h.push({ title: 'القيمة', key: 'amount', align: 'end', sortable: true });
  h.push({ title: 'الحالة', key: 'status', sortable: true });
  h.push({ title: 'الإجراءات', key: 'actions', sortable: false, align: 'end', width: '220px' });
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
    canceled: 'grey',
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
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);

  if (due < today) return 'text-error font-weight-bold';
  if (due.getTime() === today.getTime()) return 'text-error font-weight-bold';
  return '';
};
</script>

<style scoped>
/* Premium light background colors */
.bg-green-lighten-5 {
  background-color: #f1f8e9 !important;
}
.bg-yellow-lighten-5 {
  background-color: #fff8e1 !important;
}
.bg-red-lighten-5 {
  background-color: #ffebee !important;
}
</style>
