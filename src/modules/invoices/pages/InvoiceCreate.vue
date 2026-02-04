<template>
  <div class="invoice-create-page">
    <InvoiceForm :initial-type="invoiceType" @success="handleSuccess" @cancel="goBack" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import InvoiceForm from '../components/InvoiceForm.vue';

const router = useRouter();
const route = useRoute();

// Determine invoice type from route if needed, default to 'sales'
const invoiceType = computed(() => route.query.type || 'sales');

const goBack = () => {
  router.push('/invoices');
};

const handleSuccess = invoice => {
  router.push(`/invoices/${invoice.id}`);
};
</script>

<style scoped>
.invoice-create-page {
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
}
</style>
