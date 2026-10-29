<template>
  <div class="invoice-create-page">
    <!-- زر الخدمات السريعة العائم (فوري والمحافظ) -->
    <v-btn
      v-if="invoiceType === 'sale' || invoiceType === 'sales'"
      color="primary"
      size="x-large"
      class="quick-service-button position-fixed font-weight-bold"
      style="bottom: 24px; left: 24px; z-index: 99; border-radius: 50%; height: 72px; width: 72px;"
      elevation="8"
      :disabled="!selectedCashBoxId"
      @click="isQuickServiceOpen = true"
    >
      <div class="d-flex flex-column align-center">
        <v-icon size="24" class="mb-1">ri-exchange-dollar-line</v-icon>
        <span style="font-size: 10px; line-height: 1;">خدمات دفع<br>ومحافظ</span>
      </div>
    </v-btn>

    <InvoiceForm :key="invoiceType" :initial-type="invoiceType" @cash-box-change="selectedCashBoxId = $event" @success="handleSuccess" @cancel="goBack" />
    <QuickServiceOperation v-if="selectedCashBoxId" v-model="isQuickServiceOpen" :cash-box-id="selectedCashBoxId" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import InvoiceForm from '../components/InvoiceForm.vue';
import QuickServiceOperation from '@/modules/hwnix-cash/components/QuickServiceOperation.vue';

const isQuickServiceOpen = ref(false);
const selectedCashBoxId = ref(null);

const router = useRouter();
const route = useRoute();

// Determine invoice type from route if needed, default to 'sales'
const invoiceType = computed(() => route.query.type || 'sales');

const goBack = () => {
  router.push('/app/invoices');
};

const handleSuccess = invoice => {
  router.push(`/app/invoices/${invoice.id}`);
};
</script>

<style scoped>
.invoice-create-page {
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
}
@media(max-width:599.98px) {
  .quick-service-button { position:static !important; width:auto !important; height:44px !important; border-radius:24px !important; margin:12px 12px 0; box-shadow:none !important; }
  .quick-service-button :deep(.v-btn__content > div) { flex-direction:row !important; gap:8px; }
  .quick-service-button :deep(span) { font-size:12px !important; line-height:1.4 !important; }
  .quick-service-button :deep(br) { display:none; }
}
</style>
