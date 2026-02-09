<template>
  <div v-show="false">
    <iframe ref="printIframe" @load="onIframeLoad"></iframe>
  </div>

  <!-- Print Preview Dialog -->
  <AppDialog
    v-model="showPreview"
    title="معاينة الطباعة"
    subtitle="راجع المستند قبل تأكيد الطباعة"
    icon="ri-printer-line"
    max-width="900"
    confirm-text="طباعة الآن"
    @confirm="confirmPrint"
  >
    <div class="print-preview-container">
      <iframe ref="previewIframe" class="preview-iframe"></iframe>
    </div>
  </AppDialog>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import AppDialog from '@/components/common/AppDialog.vue';
import { PRINT_CONFIG } from '../core/printConfig';

const printIframe = ref(null);
const previewIframe = ref(null);
const showPreview = ref(false);

const printData = ref({ html: '', css: '', documentTitle: '' });
const printType = ref('thermal');
const originalTitle = ref('');
let currentOptions = ref({});

const onIframeLoad = () => {
  // Resetting iframe content if needed
};

// Listen for PrintService custom events
const handlePrintEvent = event => {
  if (event.detail && event.detail.data) {
    const { data, options } = event.detail;
    currentOptions.value = options || {};

    // Set local state
    printData.value = {
      html: data.html,
      css: data.css,
      documentTitle: data.documentTitle || 'Hwnix Print',
    };
    printType.value = data.format || 'thermal';

    if (currentOptions.value.preview) {
      showPreview.value = true;
      nextTick(() => updatePreview());
    } else {
      nextTick(() => triggerPrint());
    }
  } else {
    console.warn('[PrintDriver] ⚠️ Received event without data!');
  }
};

const confirmPrint = () => {
  showPreview.value = false;
  nextTick(() => triggerPrint());
};

onMounted(() => {
  window.addEventListener('trigger-print', handlePrintEvent);
});

onUnmounted(() => {
  window.removeEventListener('trigger-print', handlePrintEvent);
});

const getDocumentContent = (isForPreview = false) => {
  // Base Styles
  const globalStyles = `
    @import url('${PRINT_CONFIG.FONTS.TAJAWAL}');
    body { margin: 0; padding: 0; direction: rtl; font-family: 'Tajawal', 'Arial', sans-serif; background: white; color: #333; }
    * { box-sizing: border-box; }
    @media print {
      body { width: 100%; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
    ${isForPreview ? 'body { padding-bottom: 50px; }' : ''}
  `;

  let typeStyles = '';
  if (printType.value === 'thermal' || printType.value === 'thermal_80') {
    typeStyles = `
      body { width: 80mm; padding: 0.5mm; margin: 0 auto; }
      @page { margin: 0; size: 80mm auto; }
    `;
  } else if (printType.value === 'thermal_58') {
    typeStyles = `
      body { width: 58mm; padding: 0.2mm; margin: 0 auto; }
      @page { margin: 0; size: 58mm auto; }
    `;
  } else if (printType.value === 'sticker') {
    typeStyles = `
      body { width: 40mm; padding: 0; }
      @page { size: 40mm 25mm; margin: 0; }
    `;
  } else if (printType.value === 'a4' || printType.value === 'standard') {
    typeStyles = `
      body { width: 210mm; min-height: 297mm; padding: 15mm; margin: 0 auto; }
      @page { size: A4; margin: 0; }
    `;
  } else if (printType.value === 'a5') {
    typeStyles = `
      body { width: 148mm; min-height: 210mm; padding: 10mm; margin: 0 auto; }
      @page { size: A5; margin: 0; }
    `;
  }

  return `
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>${printData.value.documentTitle}</title>
      <style>
        ${globalStyles}
        ${typeStyles}
        ${printData.value.css || ''}
      </style>
    </head>
    <body class="print-mode-${printType.value}">
      <div id="print-content">${printData.value.html || ''}</div>
      ${
        !isForPreview
          ? `
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.focus();
            window.print();
            window.parent.postMessage('print-finished', '*');
          }, ${PRINT_CONFIG.TRIGGER_DELAY});
        };
      <\/script>`
          : ''
      }
    </body>
    </html>
  `;
};

const updatePreview = () => {
  const iframe = previewIframe.value;
  if (!iframe) return;

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(getDocumentContent(true));
  doc.close();
};

const triggerPrint = () => {
  const iframe = printIframe.value;
  if (!iframe) {
    console.error('[PrintDriver] ❌ No iframe reference!');
    return;
  }

  const doc = iframe.contentWindow.document;

  // Set main window title temporarily for PDF naming
  if (printData.value.documentTitle) {
    originalTitle.value = document.title;
    document.title = printData.value.documentTitle;
  }

  doc.open();
  doc.write(getDocumentContent(false));
  doc.close();
};

// Listen for message from iframe (since it's same-origin)
window.addEventListener('message', event => {
  if (event.data === 'print-finished') {
    // Restore original title
    if (originalTitle.value) {
      document.title = originalTitle.value;
    }

    // Reset local state if needed
    printData.value = { html: '', css: '', documentTitle: '' };
    if (currentOptions.value.autoClose) {
      showPreview.value = false;
    }
  }
});
</script>

<style scoped>
.print-preview-container {
  width: 100%;
  height: 70vh;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  padding: 20px;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}
</style>
