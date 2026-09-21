<template>
  <div class="invoice-create-page">
    <!-- زر الخدمات السريعة العائم (فوري والمحافظ) -->
    <v-btn
      v-if="invoiceType === 'sale' || invoiceType === 'sales'"
      color="primary"
      size="x-large"
      class="position-fixed font-weight-bold"
      style="bottom: 24px; left: 24px; z-index: 99; border-radius: 50%; height: 72px; width: 72px;"
      elevation="8"
      @click="isQuickServiceOpen = true"
    >
      <div class="d-flex flex-column align-center">
        <v-icon size="24" class="mb-1">ri-exchange-dollar-line</v-icon>
        <span style="font-size: 10px; line-height: 1;">خدمات دفع<br>ومحافظ</span>
      </div>
    </v-btn>

    <InvoiceForm :key="invoiceType" :initial-type="invoiceType" @success="handleSuccess" @cancel="goBack" />
    <QuickServiceOperation v-model="isQuickServiceOpen" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import InvoiceForm from '../components/InvoiceForm.vue';
import QuickServiceOperation from '@/modules/hwnix-cash/components/QuickServiceOperation.vue';

const isQuickServiceOpen = ref(false);

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
</style>
