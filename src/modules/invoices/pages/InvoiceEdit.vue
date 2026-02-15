<template>
  <div class="invoice-edit-page">
    <InvoiceForm :invoice-id="id" @success="handleSuccess" @cancel="goBack" />
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import InvoiceForm from '../components/InvoiceForm.vue';

const router = useRouter();
const props = defineProps({
  id: {
    type: [String, Number],
    required: true,
  },
});

const goBack = () => {
  router.push('/app/invoices');
};

const handleSuccess = invoice => {
  router.push(`/app/invoices/${invoice.id}`);
};
</script>

<style scoped>
.invoice-edit-page {
  background-color: rgb(var(--v-theme-background));
  min-height: 100vh;
}
</style>
