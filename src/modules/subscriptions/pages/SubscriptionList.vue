<template>
  <div class="subscriptions-page">
    <AppPageHeader sticky>
      <template #title>
        <div class="d-flex align-center gap-2">
          <span class="text-h6 font-weight-black">الاشتراكات الجارية</span>
          <v-chip size="x-small" color="primary" variant="flat">{{ total }}</v-chip>
        </div>
      </template>
      <template #append>
        <AppButton color="primary" prepend-icon="ri-add-line" @click="openCreateDialog"> إضافة اشتراك جديد </AppButton>
      </template>
    </AppPageHeader>

    <div class="px-6 pb-6">
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
          <div class="d-flex flex-column">
            <span class="font-weight-bold">{{ item.user?.full_name || 'عميل غير معروف' }}</span>
            <span class="text-caption text-grey">{{ item.user?.phone || '' }}</span>
          </div>
        </template>

        <template #item.service="{ item }">
          <v-chip size="small" variant="flat" color="info-lighten-5" class="text-info font-weight-bold">
            {{ item.service?.name || 'خدمة غير محددة' }}
          </v-chip>
        </template>

        <template #item.billing_cycle="{ item }">
          <span class="text-body-2">{{ translateCycle(item.billing_cycle) }}</span>
        </template>

        <template #item.status="{ item }">
          <v-chip :color="getStatusColor(item.status)" size="small" variant="tonal" class="font-weight-bold">
            {{ translateStatus(item.status) }}
          </v-chip>
        </template>

        <template #item.next_billing_date="{ item }">
          <div :class="isNearExpiry(item.next_billing_date) ? 'text-error font-weight-bold' : ''">
            {{ formatDate(item.next_billing_date) }}
          </div>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end gap-1">
            <AppButton icon="ri-eye-line" size="x-small" variant="text" color="primary" tooltip="عرض التفاصيل" @click="handleView(item)" />
            <AppButton icon="ri-delete-bin-line" size="x-small" variant="text" color="error" tooltip="إلغاء الاشتراك" @click="handleDelete(item)" />
          </div>
        </template>
      </AppDataTable>
    </div>

    <!-- Delete Dialog -->
    <AppConfirmDialog ref="deleteRef" title="إلغاء اشتراك" message="هل أنت متأكد من إلغاء هذا الاشتراك؟" confirm-text="إلغاء" confirm-color="error" />

    <!-- Create Dialog -->
    <AppDialog v-model="isCreateDialogOpen" title="إنشاء اشتراك جديد" icon="ri-repeat-2-line" max-width="800" hide-actions>
      <SubscriptionForm @success="handleCreateSuccess" @cancel="isCreateDialogOpen = false" />
    </AppDialog>

    <!-- Details Dialog -->
    <AppDialog
      v-model="isDetailsDialogOpen"
      :title="'تفاصيل الاشتراك - ' + (selectedSubscription?.user?.full_name || '')"
      icon="ri-information-line"
      max-width="1000"
      hide-actions
    >
      <SubscriptionDetails v-if="selectedSubscription" :subscription-id="selectedSubscription.id" />
    </AppDialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { subscriptionApiService } from '@/api';
import { formatDate } from '@/utils/formatters';
import AppDataTable from '@/components/common/AppDataTable.vue';
import AppButton from '@/components/common/AppButton.vue';
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue';
import AppDialog from '@/components/common/AppDialog.vue';
import AppPageHeader from '@/components/common/AppPageHeader.vue';
import SubscriptionForm from '../components/SubscriptionForm.vue';
import SubscriptionDetails from '../components/SubscriptionDetails.vue';
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

const headers = [
  { title: 'العميل', key: 'customer' },
  { title: 'الخدمة', key: 'service' },
  { title: 'دورة الفوترة', key: 'billing_cycle' },
  { title: 'موعد التجديد القادم', key: 'next_billing_date' },
  { title: 'الحالة', key: 'status' },
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

onMounted(loadData);
</script>

<style scoped></style>
