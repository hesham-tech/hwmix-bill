<template>
  <div v-show="false">
    <iframe ref="printIframe" @load="onIframeLoad"></iframe>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue';
import { usePrinter } from '../composables/usePrinter';

const { isPrinting, printData, printType, closePrinter } = usePrinter();
const printIframe = ref(null);

const onIframeLoad = () => {
  // Resetting iframe content if needed
};

watch(isPrinting, async newVal => {
  if (newVal && printData.value) {
    await nextTick();
    triggerPrint();
  }
});

const triggerPrint = () => {
  const iframe = printIframe.value;
  if (!iframe) return;

  const doc = iframe.contentWindow.document;

  // Base Styles
  const globalStyles = `
    body { margin: 0; padding: 0; direction: rtl; font-family: 'Tajawal', 'Arial', sans-serif; background: white; color: #333; }
    * { box-sizing: border-box; }
    @media print {
      body { width: 100%; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  `;

  let typeStyles = '';
  if (printType.value === 'thermal') {
    typeStyles = `
      body { width: 80mm; padding: 2mm; margin: 0 auto; }
      @page { margin: 0; size: 80mm auto; }
    `;
  } else if (printType.value === 'sticker') {
    typeStyles = `
      body { width: 40mm; height: 25mm; padding: 1mm; overflow: hidden; display: flex; align-items: center; justify-content: center; }
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

  // Build Document
  console.log('[PrintDriver] Building document for type:', printType.value);
  console.log('[PrintDriver] CSS length:', printData.value.css?.length || 0);
  console.log('[PrintDriver] CSS sample (first 500 chars):', printData.value.css?.substring(0, 500));
  console.log('[PrintDriver] HTML sample (first 800 chars):', printData.value.html?.substring(0, 800));
  console.log('[PrintDriver] typeStyles:', typeStyles);

  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
      <title>Hwnix Print</title>
      <style>
        ${globalStyles}
        ${typeStyles}
        ${printData.value.css || ''}
      </style>
    </head>
    <body class="print-mode-${printType.value}">
      <div id="print-content">${printData.value.html || ''}</div>
      <script>
        window.onload = () => {
          setTimeout(() => {
            window.focus();
            window.print();
            // Emit custom event back to parent
            window.parent.postMessage('print-finished', '*');
          }, 500);
        };
      <\/script>
    </body>
    </html>
  `);
  doc.close();
};

// Listen for message from iframe (since it's same-origin)
window.addEventListener('message', event => {
  if (event.data === 'print-finished') {
    closePrinter();
  }
});
</script>
