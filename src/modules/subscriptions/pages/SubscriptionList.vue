<template>
  <div class="subscriptions-page">
    <AppPageHeader sticky>
      <template #title>
        <div class="d-flex align-center gap-2">
          <span class="text-h6 font-weight-bold">الاشتراكات الجارية</span>
          <v-chip size="x-small" color="primary" variant="flat">{{ total }}</v-chip>
        </div>
      </template>
      <template #append>
        <AppButton color="primary" prepend-icon="ri-add-line" @click="openCreateDialog"> إضافة اشتراك جديد </AppButton>
      </template>
    </AppPageHeader>

    <div>
      <AppDataTable
        :headers="headers"
        :items="subscriptions"
        :loading="loading"
        :items-length="total"
        :items-per-page="itemsPerPage"
        :page="page"
        title="سجل الاشتراكات"
        icon="ri-repeat-2-line"
        @update:page="
          page = $event;
          loadData();
        "
        @update:items-per-page="handleItemsPerPageChange"
      >
        <template #item.customer="{ item }">
          <div class="d-flex align-center py-1">
            <AppAvatar :img-url="item.user?.avatar_url" :name="item.user?.nickname || item.user?.full_name" size="40" class="me-3 border shadow-sm" />
            <div class="d-flex flex-column">
              <span class="font-weight-bold text-body-1">{{ item.user?.nickname || item.user?.full_name || 'عميل غير معروف' }}</span>
              <AppPhone :phone="item.user?.phone" class="text-caption" />
            </div>
          </div>
        </template>

        <template #item.service="{ item }">
          <div class="d-flex flex-column">
            <div class="d-flex align-center">
              <span class="font-weight-bold text-primary">{{ item.service?.name }}</span>
              <v-chip v-if="item.unique_identifier" size="x-small" variant="tonal" color="secondary" class="ms-2 px-1" title="معرف فريد">
                {{ item.unique_identifier }}
              </v-chip>
            </div>
            <div class="text-caption text-grey mt-1">
              <v-icon icon="ri-calendar-2-line" size="12" class="me-1" />
              منذ: {{ formatDate(item.starts_at) }}
            </div>
          </div>
        </template>

        <template #item.financial="{ item }">
          <div class="d-flex flex-column">
            <div class="d-flex align-center justify-space-between">
              <span class="text-body-2">السعر:</span>
              <span class="font-weight-bold">{{ formatCurrency(item.price) }}</span>
            </div>
            <div class="d-flex align-center justify-space-between mt-1">
              <span class="text-body-2">مدفوع جزئي:</span>
              <span class="font-weight-bold" :class="item.partial_payment >= 0 ? 'text-success' : 'text-error'">
                {{ formatCurrency(item.partial_payment) }}
              </span>
            </div>
          </div>
        </template>

        <template #item.billing="{ item }">
          <div class="d-flex flex-column text-end">
            <div class="d-flex align-center justify-end">
              <v-chip size="x-small" color="info" variant="flat" density="compact" class="me-1">{{ translateCycle(item.billing_cycle) }}</v-chip>
            </div>
            <div class="mt-1" :class="isNearExpiry(item.next_billing_date) ? 'text-error font-weight-bold' : 'text-grey text-caption'">
              التجديد: {{ formatDate(item.next_billing_date) || 'غير محدد' }}
            </div>
          </div>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal" class="font-weight-bold">
            <v-icon :icon="getStatusIcon(item.status)" size="14" class="me-1" />
            {{ translateStatus(item.status) }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <AppButton icon="ri-eye-line" size="x-small" variant="text" color="primary" tooltip="عرض التفاصيل" @click="handleView(item)" />
            <AppButton icon="ri-edit-line" size="x-small" variant="text" color="primary" tooltip="تعديل" @click="handleEdit(item)" />
            <AppButton icon="ri-loop-right-line" size="x-small" variant="text" color="success" tooltip="تجديد يدوي" @click="handleRenew(item)" />
            <AppButton icon="ri-delete-bin-line" size="x-small" variant="text" color="error" tooltip="إلغاء الاشتراك" @click="handleDelete(item)" />
          </div>
        </template>
      </AppDataTable>
    </div>

    <!-- Delete Dialog -->
    <AppConfirmDialog ref="deleteRef" title="إلغاء اشتراك" message="هل أنت متأكد من إلغاء هذا الاشتراك؟" confirm-text="إلغاء" confirm-color="error" />

    <!-- Create/Edit Dialog -->
    <AppDialog
      v-model="isCreateDialogOpen"
      :title="selectedSubscription?.id ? 'تعديل اشتراك' : 'إنشاء اشتراك جديد'"
      icon="ri-repeat-2-line"
      max-width="800"
      hide-actions
    >
      <SubscriptionForm :initial-data="selectedSubscription || {}" @success="handleCreateSuccess" @cancel="isCreateDialogOpen = false" />
    </AppDialog>

    <!-- Details Dialog -->
    <AppDialog
      v-model="isDetailsDialogOpen"
      :title="'تفاصيل الاشتراك - ' + (selectedSubscription?.user?.nickname || selectedSubscription?.user?.full_name || '')"
      icon="ri-information-line"
      max-width="1000"
      hide-actions
    >
      <SubscriptionDetails v-if="selectedSubscription" :subscription-id="selectedSubscription.id" />
    </AppDialog>

    <!-- Renew Dialog -->
    <RenewSubscriptionDialog ref="renewRef" @success="loadData" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { subscriptionApiService } from '@/api';
import { formatDate, formatCurrency } from '@/utils/formatters';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import SubscriptionForm from '../components/SubscriptionForm.vue';
import SubscriptionDetails from '../components/SubscriptionDetails.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppPhone from '@/components/common/AppPhone.vue';
import RenewSubscriptionDialog from '../components/RenewSubscriptionDialog.vue';
import { toast } from 'vue3-toastify';

const subscriptions = ref([]);
const loading = ref(false);
const total = ref(0);
const page = ref(1);
const itemsPerPage = ref(10);
const deleteRef = ref(null);
const isCreateDialogOpen = ref(false);
const isDetailsDialogOpen = ref(false);
const selectedSubscription = ref(null);
const renewRef = ref(null);

const headers = [
  { title: 'العميل', key: 'customer' },
  { title: 'الخدمة والمعرف', key: 'service' },
  { title: 'المالية (السعر/مدفوع جزئي)', key: 'financial', width: '240' },
  { title: 'موعد التجديد', key: 'billing', align: 'end' },
  { title: 'الحالة', key: 'status', align: 'center' },
  { title: 'الإجراءات', key: 'actions', sortable: false, align: 'end' },
];

const loadData = async () => {
  loading.value = true;
  try {
    const response = await subscriptionApiService.getAll({
      page: page.value,
      per_page: itemsPerPage.value,
    });
    subscriptions.value = response.data;
    total.value = response.meta?.total || response.data.length;
  } catch (error) {
    console.error('Error loading subscriptions:', error);
  } finally {
    loading.value = false;
  }
};

const getStatusColor = status => {
  switch (status) {
    case 'active':
      return 'success';
    case 'expired':
      return 'error';
    case 'pending':
      return 'warning';
    case 'canceled':
      return 'grey';
    default:
      return 'primary';
  }
};

const translateStatus = status => {
  const statuses = {
    active: 'نشط',
    expired: 'منتهي',
    pending: 'معلق',
    canceled: 'ملغي',
  };
  return statuses[status] || status;
};

const getStatusIcon = status => {
  const icons = {
    active: 'ri-checkbox-circle-line',
    expired: 'ri-error-warning-line',
    pending: 'ri-time-line',
    canceled: 'ri-close-circle-line',
  };
  return icons[status] || 'ri-information-line';
};

const translateCycle = cycle => {
  const cycles = {
    monthly: 'شهري',
    yearly: 'سنوي',
    weekly: 'أسبوعي',
    daily: 'يومي',
  };
  return cycles[cycle] || cycle;
};

const isNearExpiry = date => {
  if (!date) return false;
  const expiryDate = new Date(date);
  const now = new Date();
  const diffTime = expiryDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7 && diffDays > 0;
};

const handleDelete = async item => {
  const confirmed = await deleteRef.value.open();
  if (!confirmed) return;

  try {
    await subscriptionApiService.delete(item.id);
    toast.success('تم إلغاء الاشتراك بنجاح');
    loadData();
  } catch (error) {
    // Error handled by intercepter
  }
};

const handleItemsPerPageChange = value => {
  itemsPerPage.value = value;
  page.value = 1;
  loadData();
};

const openCreateDialog = () => {
  selectedSubscription.value = null;
  isCreateDialogOpen.value = true;
};

const handleCreateSuccess = () => {
  isCreateDialogOpen.value = false;
  loadData();
};

const handleView = item => {
  selectedSubscription.value = item;
  isDetailsDialogOpen.value = true;
};

const handleEdit = item => {
  selectedSubscription.value = { ...item };
  isCreateDialogOpen.value = true;
};

const handleRenew = item => {
  renewRef.value.open(item);
};

onMounted(loadData);
</script>

<style scoped></style>
