import { createApp, h } from 'vue';
import type {
    IPrintService,
    PrintOptions,
    PrintData,
    PrintFormat
} from './types';
import { templateRegistry } from '../templates/TemplateRegistry';
import { useUserStore } from '@/stores/user';

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
    ): Promise<void> {
        console.log('[PrintService] 🖨️ Print called:', { type, data, options });
        // Get template from registry
        const template = templateRegistry.get(type);

        if (!template) {
            throw new Error(
                `Print template "${type}" not found. Available templates: ${templateRegistry.list().join(', ')}`
            );
        }

        // Get user store for company settings
        const userStore = useUserStore();

        // Merge options with defaults from company settings
        const printFormat: PrintFormat = options.format ||
            userStore.currentCompany?.print_settings?.print_format ||
            'thermal';

        const companyLogo = options.logo ||
            userStore.currentCompany?.logo_url ||
            userStore.currentCompany?.logo;

        const companyName = options.companyName ||
            userStore.currentCompany?.name ||
            '';

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
            options.additionalCss
        );

        console.log('[PrintService] 📄 Print data built:', {
            htmlLength: printData.html?.length,
            cssLength: printData.css?.length,
            format: printData.format
        });

        // Trigger print
        await this.triggerPrint(printData, options);
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
        additionalCss?: string
    ): Promise<PrintData> {
        // Create temporary container
        const container = document.createElement('div');
        container.style.display = 'none';
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

            // Wait for next tick to ensure rendering
            await new Promise(resolve => setTimeout(resolve, 100));

            // Get HTML (outerHTML to include wrapper with classes)
            const element = container.querySelector('[id*="print"]') || container.firstElementChild;
            const html = element?.outerHTML || container.innerHTML;

            // Unmount and cleanup
            app.unmount();
            document.body.removeChild(container);

            // Combine styles
            const css = template.styles + (additionalCss || '');

            return {
                html,
                css,
                format
            };
        } catch (error) {
            // Cleanup on error
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
        console.log('[PrintService] 🚀 Dispatching trigger-print event...');

        // Emit custom event for PrintDriver to handle
        const event = new CustomEvent('trigger-print', {
            detail: {
                data: printData,
                options
            }
        });

        window.dispatchEvent(event);
        console.log('[PrintService] ✅ Event dispatched!');

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
