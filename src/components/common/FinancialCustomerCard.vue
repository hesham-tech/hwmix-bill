<template>
  <v-card v-if="customer" rounded="lg" class="border shadow-sm overflow-hidden financial-customer-card">
    <v-row no-gutters>
      <v-col cols="12" class="bg-primary-lighten-5 pa-4 pa-sm-6">
        <div class="d-flex align-center flex-column flex-sm-row text-center text-sm-right">
          <AppAvatar
            :img-url="customer.avatar_url"
            :name="customer.full_name || customer.name"
            :size="84"
            class="mb-4 mb-sm-0 me-sm-6 elevation-3 border border-white border-xl"
            type="user"
          />
          <div class="flex-grow-1">
            <div class="text-overline text-primary font-weight-black mb-1">ملف العميل المالي</div>
            <h2 class="text-h5 font-weight-bold mb-1">
              {{ customer.full_name || customer.name || 'غير متوفر' }}
            </h2>
            <div class="d-flex align-center justify-center justify-sm-start gap-2 mb-2">
              <v-chip
                v-if="customer.nickname && customer.nickname !== customer.full_name"
                color="primary"
                size="x-small"
                variant="flat"
                class="font-weight-bold px-2"
              >
                {{ customer.nickname }}
              </v-chip>
              <v-chip :color="statusColor" size="x-small" variant="flat" class="font-weight-bold px-2">
                {{ statusLabel }}
              </v-chip>
            </div>
            <div class="d-flex align-center justify-center justify-sm-start gap-4 flex-wrap mt-3">
              <AppPhone v-if="customer.phone" :phone="customer.phone" class="text-primary font-weight-bold" />
              <div v-if="balance !== undefined" class="d-flex align-center gap-1">
                <v-icon icon="ri-wallet-3-line" size="18" color="grey-darken-1" />
                <span class="text-caption text-grey-darken-1">الرصيد الكلي:</span>
                <span :class="parseFloat(balance) < 0 ? 'text-error' : 'text-success'" class="font-weight-black text-body-2">
                  {{ formatCurrency(balance) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { computed } from 'vue';
import { formatCurrency } from '@/utils/formatters';
import AppPhone from '@/components/common/AppPhone.vue';
import AppAvatar from '@/components/common/AppAvatar.vue';

const props = defineProps({
  customer: {
    type: Object,
    required: true,
  },
  statusLabel: {
    type: String,
    default: 'عميل نشط',
  },
  statusColor: {
    type: String,
    default: 'info',
  },
  balance: {
    type: [Number, String],
    default: undefined,
  },
});
</script>

<style scoped>
.financial-customer-card {
  transition: all 0.3s ease;
}
.border-xl {
  border-width: 4px !important;
}
.gap-4 {
  gap: 16px;
}
</style>
