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
    :title="title"
    :subtitle="subtitle"
    :icon="icon"
    :filters="filters"
  >
    <!-- Relay all slots from parent to AppDataTable -->
    <template v-for="(_, slot) in $slots" #[slot]="scope">
      <slot :name="slot" v-bind="scope || {}" />
    </template>
    <!-- Customer Column -->
    <template #item.customer="{ item }" v-if="!$slots['item.customer']">
      <div v-if="showCustomer" class="d-flex align-center py-1">
        <AppAvatar :src="getCustomerData(item).avatar_url" :name="getCustomerData(item).full_name" size="36" class="me-3 shadow-sm border" />
        <div>
          <div class="font-weight-bold text-no-wrap text-caption">
            {{ getCustomerData(item).full_name || '---' }}
          </div>
          <AppPhone :phone="getCustomerData(item).phone" />
        </div>
      </div>
    </template>

    <!-- Installment Number Column -->
    <template #item.installment_number="{ item }" v-if="!$slots['item.installment_number']">
      <div class="py-1">
        <v-chip variant="tonal" size="x-small" color="primary" class="font-weight-bold"> قسط #{{ item.installment_number }} </v-chip>

        <!-- Conditional Info: Remaining vs Commitment -->
        <div v-if="item.remaining > 0 && showRemaining" class="text-caption text-error font-weight-bold mt-1">
          المتبقي: {{ formatCurrency(item.remaining) }}
        </div>
        <div v-else-if="item.commitment_label" :class="getCommitmentClass(item)" class="text-caption font-weight-bold d-flex align-center gap-1 mt-1">
          <v-icon :icon="getCommitmentIcon(item)" size="14" />
          {{ item.commitment_label }}
        </div>
      </div>
    </template>

    <!-- Plan/Products Column -->
    <template #item.plan="{ item }" v-if="!$slots['item.plan']">
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
    <template #item.amount="{ item }" v-if="!$slots['item.amount']">
      <div class="font-weight-bold text-body-1">{{ formatCurrency(item.amount) }}</div>
    </template>

    <!-- Due Date Column -->
    <template #item.due_date="{ item }" v-if="!$slots['item.due_date']">
      <div :class="[getDueDateClass(item.due_date, item.status), 'font-weight-medium']">
        {{ formatDate(item.due_date) }}
      </div>
    </template>

    <!-- Status Column -->
    <template #item.status="{ item }" v-if="!$slots['item.status']">
      <v-chip :color="getStatusColor(item.status)" size="small" variant="flat" class="font-weight-bold px-3">
        {{ item.status_label || getStatusLabel(item.status) }}
      </v-chip>
    </template>

    <!-- Actions -->
    <template #extra-actions="{ item }" v-if="!$slots['extra-actions']">
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
        class="font-weight-bold ms-1 px-3"
        tooltip="تحصيل المبلغ"
        @click.stop="$emit('pay', item)"
      >
        دفع
      </AppButton>

      <!-- Print Receipt: Only if paid or partially paid -->
      <AppButton
        v-if="['paid', 'partially_paid', 'partial'].includes(item.status)"
        icon="ri-printer-line"
        size="small"
        variant="elevated"
        color="teal-darken-1"
        class="font-weight-bold ms-1 px-3"
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
    <!-- Grid View Integration -->
    <template #grid="{ items }" v-if="!$slots['grid']">
      <v-col v-for="item in items" :key="item.id" cols="12" sm="6" md="4" lg="3">
        <v-card
          rounded="lg"
          class="border shadow-sm h-100 d-flex flex-column hover-shadow transition-all overflow-hidden"
          @click="$emit('view', item)"
        >
          <!-- Card Header: Status & Amount -->
          <div class="pa-3 d-flex align-center justify-space-between bg-grey-lighten-4 border-bottom">
            <v-chip :color="getStatusColor(item.status)" size="x-small" variant="flat" class="font-weight-bold px-2">
              {{ item.status_label || getStatusLabel(item.status) }}
            </v-chip>
            <div class="text-body-2 font-weight-black text-primary">{{ formatCurrency(item.amount) }}</div>
          </div>

          <!-- Card Body: Customer Info -->
          <div class="pa-3 flex-grow-1">
            <div class="d-flex align-center mb-3">
              <AppAvatar :src="getCustomerData(item).avatar_url" :name="getCustomerData(item).full_name" size="40" class="me-3 border shadow-sm" />
              <div class="overflow-hidden">
                <div class="text-subtitle-2 font-weight-bold truncate">{{ getCustomerData(item).full_name || '---' }}</div>
                <div class="text-caption text-grey">قسط #{{ item.installment_number }}</div>
              </div>
            </div>

            <!-- Meta Info -->
            <div class="d-flex flex-column gap-1">
              <div class="d-flex align-center justify-space-between text-caption">
                <span class="text-grey">تاريخ الاستحقاق:</span>
                <span :class="getDueDateClass(item.due_date, item.status)">{{ formatDate(item.due_date) }}</span>
              </div>
              <div v-if="item.remaining > 0" class="d-flex align-center justify-space-between text-caption">
                <span class="text-grey">المتبقي:</span>
                <span class="text-error font-weight-bold">{{ formatCurrency(item.remaining) }}</span>
              </div>
              <div v-else-if="item.commitment_label" class="d-flex align-center justify-space-between text-caption">
                <span class="text-grey">الالتزام:</span>
                <span :class="getCommitmentClass(item)" class="font-weight-bold d-flex align-center gap-1">
                  <v-icon :icon="getCommitmentIcon(item)" size="12" />
                  {{ item.commitment_label }}
                </span>
              </div>
            </div>
          </div>

          <!-- Card Footer: Quick Actions -->
          <div class="pa-2 border-top d-flex gap-1 bg-grey-lighten-5">
            <AppButton
              v-if="
                ['pending', 'partially_paid', 'partial', 'overdue'].includes(item.status) &&
                canAny(PERMISSIONS.PAYMENTS_CREATE, PERMISSIONS.INSTALLMENT_PAYMENTS_CREATE)
              "
              icon="ri-hand-coin-line"
              size="x-small"
              color="success"
              variant="flat"
              class="flex-grow-1"
              @click.stop="$emit('pay', item)"
            >
              دفع
            </AppButton>
            <AppButton
              v-if="['paid', 'partially_paid', 'partial'].includes(item.status)"
              icon="ri-printer-line"
              size="x-small"
              color="teal-darken-1"
              variant="flat"
              class="flex-grow-1"
              @click.stop="$emit('print-receipt', item)"
            >
              طباعة
            </AppButton>
            <AppButton icon="ri-eye-line" size="x-small" color="info" variant="tonal" class="px-2" @click.stop="$emit('view', item)"> عرض </AppButton>
          </div>
        </v-card>
      </v-col>
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
  title: { type: String, default: 'جدول الأقساط' },
  subtitle: { type: String, default: '' },
  icon: { type: String, default: 'ri-list-check-line' },
  filters: { type: Array, default: () => [] },
});

const emit = defineEmits(['view', 'pay', 'print-receipt']);

// Logic for Row Decoration
const getRowProps = ({ item }) => {
  const paidStatuses = ['paid', 'تم الدفع'];
  const partialStatuses = ['partially_paid', 'partial', 'مدفوع جزئياً'];
  const pendingStatuses = ['pending', 'لم يتم الدفع', 'في الانتظار'];
  const overdueStatuses = ['overdue', 'متأخر'];

  if (paidStatuses.includes(item.status)) return { class: 'installment-row-paid' };
  if (partialStatuses.includes(item.status)) return { class: 'installment-row-partial' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(item.due_date);
  due.setHours(0, 0, 0, 0);

  if (overdueStatuses.includes(item.status) || ([...pendingStatuses, ...partialStatuses].includes(item.status) && due <= today)) {
    return { class: 'installment-row-overdue' };
  }

  return {};
};

// Logic for Sorting: Overdue first, then oldest pending
const displayItems = computed(() => {
  // If autoSort is true, we keep local sorting (useful for small widgets like dashboard)
  if (props.autoSort) {
    const list = [...props.items];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return list.sort((a, b) => {
      const aDue = new Date(a.due_date);
      const bDue = new Date(b.due_date);
      aDue.setHours(0, 0, 0, 0);
      bDue.setHours(0, 0, 0, 0);

      // 1. Critical Priority (Overdue/Today)
      const aCritical = !['paid', 'canceled', 'cancelled'].includes(a.status) && aDue <= today;
      const bCritical = !['paid', 'canceled', 'cancelled'].includes(b.status) && bDue <= today;

      if (aCritical && !bCritical) return -1;
      if (!aCritical && bCritical) return 1;

      // 2. Status Priority
      const priority = {
        pending: 1,
        'في الانتظار': 1,
        'لم يتم الدفع': 1,
        partially_paid: 2,
        partial: 2,
        'مدفوع جزئياً': 2,
        paid: 3,
        'تم الدفع': 3,
        canceled: 4,
        cancelled: 4,
        ملغي: 4,
      };
      const aPrio = priority[a.status] ?? 99;
      const bPrio = priority[b.status] ?? 99;

      if (aPrio !== bPrio) return aPrio - bPrio;

      // 3. Date
      return aDue - bDue;
    });
  }

  // Otherwise, strictly follow server order
  return props.items;
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
    'في الانتظار': 'warning',
    'لم يتم الدفع': 'warning',
    paid: 'success',
    'تم الدفع': 'success',
    overdue: 'error',
    متأخر: 'error',
    canceled: 'grey',
    cancelled: 'grey',
    ملغي: 'grey',
    partially_paid: 'info',
    'مدفوع جزئياً': 'info',
  };
  return colors[status] || 'grey';
};

const getStatusLabel = status => {
  const labels = {
    pending: 'في الانتظار',
    'في الانتظار': 'في الانتظار',
    'لم يتم الدفع': 'في الانتظار',
    paid: 'مدفوع',
    'تم الدفع': 'مدفوع',
    overdue: 'متأخر',
    متأخر: 'متأخر',
    canceled: 'ملغي',
    cancelled: 'ملغي',
    ملغي: 'ملغي',
    partially_paid: 'مدفوع جزئياً',
    'مدفوع جزئياً': 'مدفوع جزئياً',
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

const getCommitmentClass = item => {
  if (item.commitment_days === null) return 'text-grey';
  if (item.commitment_days === 0) return 'text-primary';
  if (item.commitment_days > 0) return 'text-error';
  return 'text-success';
};

const getCommitmentIcon = item => {
  if (item.commitment_days === null) return 'ri-calendar-line';
  if (item.commitment_days === 0) return 'ri-checkbox-circle-line';
  if (item.commitment_days > 0) return 'ri-alarm-warning-line';
  return 'ri-medal-line';
};
</script>

<style>
/* Unscoped style to reach TR elements inside AppDataTable */
.installment-row-paid {
  background-color: #f1f8e9 !important;
}
.installment-row-partial {
  background-color: #fff8e1 !important;
}
.installment-row-overdue {
  background-color: #ffebee !important;
}

/* Hover effect stabilization */
.v-data-table .installment-row-paid:hover,
.v-data-table .installment-row-partial:hover,
.v-data-table .installment-row-overdue:hover {
  filter: brightness(0.98);
}
</style>

<style scoped>
/* Scoped styles can remain for local elements if needed */
</style>
