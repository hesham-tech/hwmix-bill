import { ref } from 'vue';

export function usePrintExport() {
  const isPrinting = ref(false);
  const isExporting = ref(false);

  const printElement = (elementId, title = 'Document') => {
    isPrinting.value = true;
    const element = document.getElementById(elementId);
    if (!element) {
      console.error(`Element with id ${elementId} not found`);
      isPrinting.value = false;
      return;
    }

    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; direction: rtl; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f2f2f2; }
            .no-print { display: none; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          ${element.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
      isPrinting.value = false;
    }, 500);
  };

  const exportToCSV = (data, filename = 'export.csv', headers = []) => {
    isExporting.value = true;
    if (!data || !data.length) {
      isExporting.value = false;
      return;
    }

    const csvRows = [];

    // Add headers if provided
    if (headers.length) {
      csvRows.push(headers.join(','));
    } else {
      csvRows.push(Object.keys(data[0]).join(','));
    }

    // Add data rows
    for (const row of data) {
      const values = Object.values(row).map(value => {
        const escaped = ('' + value).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    isExporting.value = false;
  };

  return {
    isPrinting,
    isExporting,
    printElement,
    exportToCSV,
  };
}
