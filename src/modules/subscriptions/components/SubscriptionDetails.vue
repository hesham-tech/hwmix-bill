<template>
  <div v-if="loading" class="pa-10 text-center">
    <v-progress-circular indeterminate color="primary" />
    <div class="mt-4 text-body-2 grey--text">جاري تحميل بيانات الاشتراك...</div>
  </div>
  <div v-else-if="subscription" class="subscription-details">
    <v-row>
      <!-- Main Info Card -->
      <v-col cols="12" md="7">
        <v-card border flat class="mb-6">
          <v-card-text class="pa-6">
            <div class="d-flex align-center justify-space-between mb-6">
              <div class="d-flex align-center gap-4">
                <AppAvatar :img-url="null" :name="subscription.service?.name" size="64" rounded="lg" type="service" border />
                <div>
                  <div class="text-h6 font-weight-black">{{ subscription.service?.name }}</div>
                  <div class="text-subtitle-2 text-secondary">{{ translateCycle(subscription.billing_cycle) }}</div>
                </div>
              </div>
              <v-chip :color="getStatusColor(subscription.status)" variant="flat" class="font-weight-bold">
                {{ translateStatus(subscription.status) }}
              </v-chip>
            </div>

            <v-divider class="mb-6" />

            <v-row>
              <v-col cols="6">
                <div class="text-caption text-grey mb-1">العميل</div>
                <div class="text-body-1 font-weight-bold">{{ subscription.user?.full_name }}</div>
                <div class="text-caption">{{ subscription.user?.phone }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey mb-1">السعر</div>
                <div class="text-h6 font-weight-black text-primary">{{ formatCurrency(subscription.price) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey mb-1">تاريخ البدء</div>
                <div class="text-body-1">{{ formatDate(subscription.starts_at) }}</div>
              </v-col>
              <v-col cols="6">
                <div class="text-caption text-grey mb-1">موعد التجديد القادم</div>
                <div class="text-body-1 font-weight-bold" :class="isNearExpiry(subscription.next_billing_date) ? 'text-error' : ''">
                  {{ formatDate(subscription.next_billing_date) }}
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Subscription Settings -->
        <v-card border flat>
          <div class="pa-4 bg-grey-lighten-5 border-b font-weight-bold">إعدادات الاشتراك</div>
          <v-card-text class="pa-4">
            <div class="d-flex align-center justify-space-between mb-4">
              <div>
                <div class="font-weight-bold">التجديد التلقائي</div>
                <div class="text-caption text-grey">سيتم إنشاء مطالبة مالية جديدة تلقائياً عند انتهاء المدة</div>
              </div>
              <v-switch v-model="subscription.auto_renew" color="primary" inset hide-details @change="handleToggleAutoRenew" />
            </div>

            <v-divider class="mb-4" />

            <div class="d-flex gap-2">
              <AppButton block variant="tonal" color="warning" prepend-icon="ri-pause-line">إيقاف مؤقت</AppButton>
              <AppButton block variant="tonal" color="error" prepend-icon="ri-close-circle-line">إلغاء نهائي</AppButton>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- History / Stats Side -->
      <v-col cols="12" md="5">
        <v-card border flat class="mb-6">
          <div class="pa-4 bg-grey-lighten-5 border-b font-weight-bold">ملاحظات</div>
          <v-card-text class="pa-4">
            <div class="text-body-2 italic text-grey-darken-1">{{ subscription.notes || 'لا يوجد ملاحظات' }}</div>
          </v-card-text>
        </v-card>

        <v-card border flat>
          <div class="pa-4 bg-grey-lighten-5 border-b font-weight-bold text-center">سجل العمليات</div>
          <v-list density="compact" class="pa-0">
            <v-list-item v-for="i in 3" :key="i" class="border-b">
              <template #prepend>
                <v-avatar color="success-lighten-5" size="32" class="me-3">
                  <v-icon icon="ri-check-line" color="success" size="16" />
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2">تم تجديد بنجاح</v-list-item-title>
              <v-list-item-subtitle class="text-caption">12/01/2026</v-list-item-subtitle>
            </v-list-item>
          </v-list>
          <v-card-actions class="justify-center">
            <AppButton variant="text" size="small">عرض كل السجل</AppButton>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { subscriptionApiService } from '@/api';
import { formatDate, formatCurrency } from '@/utils/formatters';
import AppAvatar from '@/components/common/AppAvatar.vue';
import AppButton from '@/components/common/AppButton.vue';
import { toast } from 'vue3-toastify';

const props = defineProps({
  subscriptionId: {
    type: [String, Number],
    required: true,
  },
});

const subscription = ref(null);
const loading = ref(true);

const loadSubscription = async () => {
  loading.value = true;
  try {
    const response = await subscriptionApiService.get(props.subscriptionId);
    subscription.value = response.data;
  } catch (error) {
    console.error('Error loading subscription details:', error);
  } finally {
    loading.value = false;
  }
};

const handleToggleAutoRenew = async () => {
  try {
    await subscriptionApiService.update(subscription.value.id, {
      auto_renew: subscription.value.auto_renew,
    });
    toast.success(`تم ${subscription.value.auto_renew ? 'تفعيل' : 'تعطيل'} التجديد التلقائي`);
  } catch (error) {
    // Revert on error
    subscription.value.auto_renew = !subscription.value.auto_renew;
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
  const statuses = { active: 'نشط', expired: 'منتهي', pending: 'معلق', canceled: 'ملغي' };
  return statuses[status] || status;
};

const translateCycle = cycle => {
  const cycles = { monthly: 'شهري', yearly: 'سنوي', weekly: 'أسبوعي', daily: 'يومي' };
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

onMounted(loadSubscription);
</script>

<style scoped>
.gap-4 {
  gap: 1rem;
}
.gap-2 {
  gap: 0.5rem;
}
.italic {
  font-style: italic;
}
</style>
