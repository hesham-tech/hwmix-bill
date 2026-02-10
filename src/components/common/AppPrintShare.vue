<template>
  <div class="d-inline-flex align-center no-print">
    <!-- Main Print Button -->
    <v-btn
      :color="color"
      :variant="variant"
      :size="size"
      :prepend-icon="!iconOnly ? prependIcon || 'ri-printer-line' : ''"
      :icon="iconOnly ? prependIcon || 'ri-printer-line' : false"
      :class="['rounded-s-lg', { 'rounded-e-lg': false, 'border-e': true }]"
      :loading="isPrintLoading"
      @click="handlePrint"
    >
      <span v-if="!iconOnly" class="mx-1">{{ label }}</span>
    </v-btn>

    <!-- Share PDF Button -->
    <v-btn
      :color="color"
      :variant="variant"
      :size="size"
      :icon="iconOnly"
      :class="['rounded-e-lg', 'share-pdf-btn', { 'px-2': !iconOnly }]"
      :loading="isGenerating"
      @click="handleShare"
    >
      <div class="d-flex align-center gap-1">
        <v-icon :icon="prependIcon || 'ri-share-forward-line'" :size="iconOnly ? 'small' : '18px'" />
        <span v-if="!iconOnly" class="font-weight-black text-caption opacity-90">PDF</span>
      </div>

      <template #loader>
        <v-icon icon="ri-settings-4-line" class="rotating" size="small" />
      </template>
    </v-btn>

    <!-- Share Dialog -->
    <AppShareDialog
      v-model="showShareDialog"
      :pdf-blob="pdfBlob"
      :file-name="currentFileName"
      @download="download"
      @share="share"
      @copy="handleCopy"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { usePrint } from '@/modules/print/composables/usePrint';
import { usePdfShare } from '@/modules/print/composables/usePdfShare';
import AppShareDialog from './AppShareDialog.vue';

const props = defineProps({
  // Template type for PrintService
  type: { type: String, required: true },

  // Data for the template
  data: { type: Object, required: true },

  // Custom label for the print button
  label: { type: String, default: 'طباعة' },

  // Vuetify button props
  color: { type: String, default: 'primary' },
  variant: { type: String, default: 'elevated' },
  size: { type: String, default: 'default' },
  iconOnly: { type: Boolean, default: false },
  prependIcon: { type: String, default: '' },

  // Dynamic document title for PDF naming (Optional fallback)
  documentTitle: { type: String, default: '' },

  // Additional options for PrintService
  printOptions: { type: Object, default: () => ({}) },
});

/**
 * Professional Dynamic File Naming Logic
 * Format: [Customer]_[Number]_[Type].pdf
 */
const dynamicFileName = computed(() => {
  if (props.documentTitle && props.documentTitle !== 'document') return props.documentTitle;

  let customerName = '';
  let docNumber = '';
  let docType = '';

  if (props.type === 'invoice') {
    const inv = props.data.invoice;
    customerName = inv?.customer?.nickname || inv?.customer?.full_name || inv?.customer?.name || '';
    docNumber = inv?.invoice_number || '';
    docType = 'فاتورة';
  } else if (props.type === 'installment_plan') {
    const plan = props.data.plan;
    customerName = plan?.customer?.nickname || plan?.customer?.full_name || plan?.customer?.name || '';
    docNumber = plan?.id || '';
    docType = 'خطة_تقسيط';
  } else if (props.type === 'contract') {
    const plan = props.data.plan;
    customerName = plan?.customer?.nickname || plan?.customer?.full_name || plan?.customer?.name || '';
    docNumber = plan?.id || '';
    docType = 'عقد';
  } else if (props.type === 'installment') {
    const inst = props.data.installment;
    const payment = props.data.payment;
    const customer = props.data.customer || payment?.customer;
    customerName = customer?.nickname || customer?.full_name || customer?.name || '';
    docNumber = inst?.installment_number || payment?.id || '';
    docType = 'إيصال';
  }

  // Clean strings (remove spaces, special chars)
  const clean = str =>
    str
      ? String(str)
          .replace(/\s+/g, '_')
          .replace(/[^\w\u0600-\u06FF]/g, '')
      : '';

  const parts = [clean(customerName), docNumber, docType].filter(Boolean);
  return parts.join('_') || 'document';
});

const isPrintLoading = ref(false);
const { printInvoice, printInstallmentPlan, printLegalContract, printInstallment } = usePrint();
const { isGenerating, showShareDialog, pdfBlob, currentFileName, generatePdf, download, share, copyFileToClipboard } = usePdfShare();

const handlePrint = async () => {
  isPrintLoading.value = true;
  try {
    // We can extend this to handle all types dynamically if usePrint supported it
    // But for now, we'll map specific types or use a generic printer if available
    // For this project, specific print functions are used in usePrint
    if (props.type === 'invoice') {
      await printInvoice({ invoice: props.data.invoice, ...props.printOptions });
    } else if (props.type === 'installment_plan') {
      await printInstallmentPlan({ plan: props.data.plan, ...props.printOptions });
    } else if (props.type === 'installment') {
      // Single installment receipt
      await printInstallment(props.data, props.printOptions);
    } else if (props.type === 'contract') {
      await printLegalContract({ plan: props.data.plan, ...props.printOptions });
    } else {
      // Fallback or generic print
      console.warn(`[AppPrintShare] No specific print mapper for type: ${props.type}`);
    }
  } finally {
    isPrintLoading.value = false;
  }
};

const handleShare = async () => {
  await generatePdf(props.type, props.data, {
    documentTitle: dynamicFileName.value,
    ...props.printOptions,
  });
};

const handleCopy = async ({ onSuccess }) => {
  const result = await copyFileToClipboard();
  if (result) onSuccess();
};
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}

.rotating {
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.border-e {
  border-right: 1px solid rgba(255, 255, 255, 0.2) !important;
}
</style>
