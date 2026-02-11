<template>
  <v-card v-if="customer" rounded="lg" class="border shadow-sm overflow-hidden financial-customer-card">
    <v-row no-gutters>
      <v-col cols="12" class="bg-primary-lighten-5 pa-2 pa-sm-4">
        <AppUserBalanceProfile :user="customer" mode="horizontal" :avatar-size="mobile ? 60 : 80" :clickable="false" />
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { useDisplay } from 'vuetify';
import { formatCurrency } from '@/utils/formatters';
import { AppUserBalanceProfile } from '@/components';

const { mobile } = useDisplay();

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
