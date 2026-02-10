import { createApp, h } from 'vue';
import type {
    IPrintService,
    PrintOptions,
    PrintData,
    PrintFormat
} from './types';
import { templateRegistry } from '../templates/TemplateRegistry';
import { useUserStore } from '@/stores/user';
import { useappState } from '@/stores/appState';
import { PRINT_CONFIG } from './printConfig';

/**
 * Core Print Service
 * Orchestrates template rendering and print execution
 */
class PrintService implements IPrintService {
    /**
     * Print a document using registered template
     * @param type - Template type identifier (e.g., 'invoice', 'installment')
     * @param data - Data to render in the template
     * @param options - Print options (format, logo, etc.)
     */
    async print<T = any>(
        type: string,
        data: T,
        options: PrintOptions = {}
    ): Promise<import('./types').PrintResult> {
        const appState = useappState();
        appState.isLoader = true;

        try {
            // Get template from registry (with lazy loading support)
            const template = await templateRegistry.get(type);

            if (!template) {
                throw new Error(
                    `قالب الطباعة "${type}" غير موجود. القوالب المتاحة: ${templateRegistry.list().join(', ')}`
                );
            }

            // Get user store for company settings
            const userStore = useUserStore();

            // Merge options with defaults from company settings
            const printFormat: PrintFormat = options.format ||
                userStore.currentCompany?.print_settings?.print_format ||
                (PRINT_CONFIG.DEFAULTS.FORMAT as PrintFormat);

            const companyLogo = options.logo ||
                userStore.currentCompany?.logo_url ||
                userStore.currentCompany?.logo;

            const companyName = options.companyName ||
                userStore.currentCompany?.name ||
                PRINT_CONFIG.DEFAULTS.COMPANY_NAME;

            // Validate format is supported by template
            if (!template.formats.includes(printFormat)) {
                console.warn(
                    `[PrintService] Format "${printFormat}" not supported by template "${type}". Supported: ${template.formats.join(', ')}`
                );
            }

            // Transform data if transformer provided
            const transformedData = template.transformData
                ? template.transformData(data)
                : data;

            // Build print data
            const printData = await this.buildPrintData(
                template,
                transformedData,
                printFormat,
                companyLogo,
                companyName,
                options.documentTitle,
                options.additionalCss
            );


            // Trigger print
            await this.triggerPrint(printData, options);

            appState.isLoader = false;
            return { success: true, type };
        } catch (error: any) {
            appState.isLoader = false;
            console.error('[PrintService] ❌ Print failed:', error);

            // Call error callback if provided
            try {
                options.onError?.(error);
            } catch (cbError) {
                console.error('[PrintService] Error in onError callback:', cbError);
            }

            return {
                success: false,
                error: error.message || 'حدث خطأ غير متوقع أثناء الطباعة',
                type
            };
        }
    }

    /**
     * Get raw print data (HTML/CSS) for a template without triggering print
     * Used for PDF generation and sharing
     */
    async getPrintData<T = any>(
        type: string,
        data: T,
        options: PrintOptions = {}
    ): Promise<PrintData> {
        const template = await templateRegistry.get(type);
        if (!template) {
            throw new Error(`قالب الطباعة "${type}" غير موجود.`);
        }

        const userStore = useUserStore();

        // Force A4 for PDF sharing as requested
        const printFormat: PrintFormat = 'a4';

        const companyLogo = options.logo ||
            userStore.currentCompany?.logo_url ||
            userStore.currentCompany?.logo;

        const companyName = options.companyName ||
            userStore.currentCompany?.name ||
            PRINT_CONFIG.DEFAULTS.COMPANY_NAME;

        const transformedData = template.transformData
            ? template.transformData(data)
            : data;

        return await this.buildPrintData(
            template,
            transformedData,
            printFormat,
            companyLogo,
            companyName,
            options.documentTitle,
            options.additionalCss
        );
    }

    /**
     * Build complete print data from template
     */
    private async buildPrintData(
        template: any,
        data: any,
        format: PrintFormat,
        logo: string | undefined,
        companyName: string,
        documentTitle?: string,
        additionalCss?: string
    ): Promise<PrintData> {
        // Create temporary container
        const container = document.createElement('div');
        container.id = 'print-render-container-' + Date.now();
        container.style.position = 'fixed';
        container.style.top = '0';
        container.style.left = '0';
        container.style.width = '210mm';
        container.style.height = 'auto'; // Important for long batches
        container.style.background = 'white';
        container.style.zIndex = '-9999';
        container.style.opacity = '0.01';
        container.style.pointerEvents = 'none';
        document.body.appendChild(container);

        try {
            // Mount component to generate HTML
            const app = createApp({
                render: () => h(template.component, {
                    ...data,
                    printFormat: format,
                    companyLogo: logo,
                    companyName: companyName,
                })
            });

            app.mount(container);

            // Event-driven Batch Verification: Monitor DOM for barcode image completion
            const expectedCount = data.items?.length || 0;

            if (expectedCount > 0 && template.requireVerification) {
                await new Promise<void>((resolve) => {
                    const timeout = setTimeout(() => {
                        observer.disconnect();
                        console.warn('[PrintService] ⚠️ Verification timeout. Proceeding with partially loaded content.');
                        resolve();
                    }, PRINT_CONFIG.VERIFICATION_TIMEOUT);

                    const observer = new MutationObserver(() => {
                        const readyCount = container.querySelectorAll('img[src^="data:image"]').length;
                        if (readyCount >= expectedCount) {
                            observer.disconnect();
                            clearTimeout(timeout);
                            resolve();
                        }
                    });

                    observer.observe(container, {
                        childList: true,
                        subtree: true,
                        attributes: true,
                        attributeFilter: ['src']
                    });

                    // Initial check
                    const initialCount = container.querySelectorAll('img[src^="data:image"]').length;
                    if (initialCount >= expectedCount) {
                        observer.disconnect();
                        clearTimeout(timeout);
                        resolve();
                    }
                });

                // Final safety buffer for layout
                await new Promise(resolve => setTimeout(resolve, PRINT_CONFIG.LAYOUT_SAFETY_DELAY));
            }

            // Get HTML
            const element = container.querySelector('.sticker-page') || container.firstElementChild;
            const html = element?.outerHTML || container.innerHTML;

            // Cleanup
            app.unmount();
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }

            // Combine styles
            const css = template.styles + (additionalCss || '');

            return {
                html,
                css,
                format: format,
                documentTitle
            };

        } catch (error) {
            console.error('[PrintService] ❌ Print data construction failed:', error);
            if (document.body.contains(container)) {
                document.body.removeChild(container);
            }
            throw error;
        }
    }

    /**
     * Trigger print using PrintDriver
     */
    private async triggerPrint(
        printData: PrintData,
        options: PrintOptions
    ): Promise<void> {

        // Emit custom event for PrintDriver to handle
        const event = new CustomEvent('trigger-print', {
            detail: {
                data: printData,
                options
            }
        });

        window.dispatchEvent(event);

        // Call callbacks
        try {
            options.onSuccess?.();
        } catch (error) {
            console.error('[PrintService] Error in onSuccess callback:', error);
        }
    }
}

// Export singleton instance
export const printService = new PrintService();
