<template>
  <div class="invoice-edit-page">
    <CanView permission="invoices.update" show-message>
      <div class="page-header mb-6">
        <h1 class="text-h4 font-weight-bold">تعديل فاتورة #{{ invoice?.invoice_number }}</h1>
        <p class="text-body-1 text-grey">تحديث بيانات الفاتورة</p>
      </div>

      <AppCard v-if="invoice">
        <InvoiceForm v-model="invoice" @save="handleSave" @cancel="handleCancel" />
      </AppCard>

      <AppSkeleton v-else type="form" />
    </CanView>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AppCard, AppSkeleton } from '@/components';
import CanView from '@/components/common/CanView.vue';
import InvoiceForm from '../components/InvoiceForm.vue';
import { invoiceService } from '@/api';
import { toast } from 'vue3-toastify';

const route = useRoute();
const router = useRouter();
const invoice = ref(null);

const handleSave = async data => {
  try {
    await invoiceService.save(data, route.params.id);
    toast.success('تم تحديث الفاتورة بنجاح');
    router.push(`/invoices/${route.params.id}`);
  } catch (error) {
    toast.error('فشل تحديث الفاتورة');
  }
};

const handleCancel = () => {
  router.push(`/invoices/${route.params.id}`);
};

onMounted(async () => {
  try {
    const response = await invoiceService.getOne(route.params.id);
    invoice.value = response.data[0];
  } catch (error) {
    toast.error('فشل تحميل الفاتورة');
    router.push('/invoices');
  }
});
</script>

<style scoped>
.invoice-edit-page {
  padding: 24px;
}
</style>
