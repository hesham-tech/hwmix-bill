import { ref } from 'vue';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { printService } from '../core/PrintService';

/**
 * Composable for PDF generation and sharing
 */
export function usePdfShare() {
    const isGenerating = ref(false);
    const showShareDialog = ref(false);
    const pdfBlob = ref(null);
    const pdfUrl = ref(null);
    const currentFileName = ref('document.pdf');

    /**
     * Generate PDF from a print template
     */
    async function generatePdf(type, data, options = {}) {
        isGenerating.value = true;
        try {
            // 1. Get raw HTML and CSS from PrintService
            // We force 'a4' format as requested
            const printData = await printService.getPrintData(type, data, {
                ...options,
                format: 'a4'
            });

            // 2. Create a temporary rendering container
            const container = document.createElement('div');
            container.className = 'pdf-render-container';
            container.style.position = 'fixed';
            container.style.top = '-10000px'; // Way off screen
            container.style.left = '0';
            container.style.width = '210mm'; // Fixed A4 width
            container.style.background = 'white';

            // Inject CSS and HTML
            container.innerHTML = `
        <style>
          ${printData.css}
          /* Ensure PDF-specific overrides */
          .pdf-render-container { font-family: 'Inter', 'Roboto', sans-serif; direction: rtl; }
          img { max-width: 100%; }
        </style>
        <div class="pdf-content pa-8">
          ${printData.html}
        </div>
      `;

            document.body.appendChild(container);

            // Wait for images to load if any
            const images = container.getElementsByTagName('img');
            const imagePromises = Array.from(images).map(img => {
                if (img.complete) return Promise.resolve();
                return new Promise(resolve => {
                    img.onload = resolve;
                    img.onerror = resolve;
                });
            });
            await Promise.all(imagePromises);

            // 3. Capture with html2canvas
            const canvas = await html2canvas(container, {
                scale: 2, // Better quality
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            // 4. Create PDF with jsPDF
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
                compress: true
            });

            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Calculate dimensions to maintain aspect ratio
            const imgWidth = pdfWidth;
            const canvasHeightMM = (canvas.height * pdfWidth) / canvas.width;

            // Add image to PDF
            // If height is more than A4, we might need multiple pages, but for now we fit or clip
            // Usually legal contracts/invoices fit in 1-2 pages.
            let heightLeft = canvasHeightMM;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, canvasHeightMM, undefined, 'FAST');
            heightLeft -= pdfHeight;

            while (heightLeft >= 0) {
                position = heightLeft - canvasHeightMM;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, canvasHeightMM, undefined, 'FAST');
                heightLeft -= pdfHeight;
            }

            // 5. Output Blob
            const blob = pdf.output('blob');
            pdfBlob.value = blob;

            if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value);
            pdfUrl.value = URL.createObjectURL(blob);

            let fileName = (options as any).documentTitle || 'document';
            if (!fileName.toLowerCase().endsWith('.pdf')) {
                fileName += '.pdf';
            }
            currentFileName.value = fileName;

            // Cleanup
            document.body.removeChild(container);

            // Show dialog
            showShareDialog.value = true;

            return { success: true, blob, url: pdfUrl.value };
        } catch (error) {
            console.error('[usePdfShare] PDF Generation failed:', error);
            return { success: false, error };
        } finally {
            isGenerating.value = false;
        }
    }

    function download() {
        if (!pdfUrl.value) return;
        const link = document.createElement('a');
        link.href = pdfUrl.value;
        link.download = currentFileName.value;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async function share() {
        if (!pdfBlob.value) return;

        try {
            const file = new File([pdfBlob.value], currentFileName.value, { type: 'application/pdf' });

            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    files: [file],
                    title: currentFileName.value,
                    text: 'مشاركة مستند من نظام هوانيكس بيل'
                });
            } else {
                download();
            }
        } catch (error) {
            console.error('[usePdfShare] Share failed:', error);
            download();
        }
    }

    /**
     * Copy the ACTUAL PDF file to clipboard
     * Supported in modern desktop browsers
     */
    async function copyFileToClipboard() {
        if (!pdfBlob.value) return false;

        try {
            // Check if ClipboardItem is supported
            if (typeof ClipboardItem !== 'undefined') {
                const data = [new ClipboardItem({ 'application/pdf': pdfBlob.value })];
                await navigator.clipboard.write(data);
                return true;
            } else {
                console.warn('[usePdfShare] ClipboardItem not supported');
                return false;
            }
        } catch (error) {
            console.error('[usePdfShare] Copy file to clipboard failed:', error);
            return false;
        }
    }

    return {
        isGenerating,
        showShareDialog,
        pdfBlob,
        pdfUrl,
        currentFileName,
        generatePdf,
        download,
        share,
        copyFileToClipboard
    };
}
