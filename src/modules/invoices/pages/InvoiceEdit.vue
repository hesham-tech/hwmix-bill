<template>
  <div class="invoice-edit-page">
    <InvoiceForm :invoice-id="invoiceId" @success="handleSuccess" @cancel="goBack" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import InvoiceForm from '../components/InvoiceForm.vue';

const router = useRouter();
const route = useRoute();

const invoiceId = computed(() => route.params.id);

const goBack = () => {
  router.push('/invoices');
};

const handleSuccess = invoice => {
  router.push(`/invoices/${invoice.id}`);
};
</script>

<style scoped>
.invoice-edit-page {
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
}
</style>
