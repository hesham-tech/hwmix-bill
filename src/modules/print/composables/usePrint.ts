import { printService } from '../core/PrintService';
import { useUserStore } from '@/stores/user';
import { useNotifications } from '@/plugins/notification';
import { computed } from 'vue';
import type { PrintOptions, InstallmentReceiptData, InvoiceData, PrintResult } from '../core/types';

/**
 * Composable for easy print access
 * Main public API for printing documents
 */
export function usePrint() {
    const userStore = useUserStore();
    const { notify } = useNotifications();

    const printFormat = computed(() =>
        userStore.currentCompany?.print_settings?.print_format || 'thermal'
    );

    const companyLogo = computed(() =>
        userStore.currentCompany?.logo_url || userStore.currentCompany?.logo
    );

    const companyName = computed(() =>
        userStore.currentCompany?.name || ''
    );

    /**
     * Generic print method
     * @param type - Template type (e.g., 'invoice', 'installment')
     * @param data - Data to print
     * @param options - Additional options
     */
    const print = async <T = any>(
        type: string,
        data: T,
        options: PrintOptions = {}
    ): Promise<PrintResult> => {
        const result = await printService.print(type, data, {
            format: printFormat.value,
            logo: companyLogo.value,
            companyName: companyName.value,
            ...options
        });

        if (!result.success) {
            notify(result.error || 'حدث خطأ أثناء محاولة الطباعة', {
                type: 'error',
                body: `قالب: ${type}`
            });
        }

        return result;
    };

    /**
     * Print installment receipt (Single Payment)
     * Convenience method with type safety
     */
    const printInstallment = async (
        data: InstallmentReceiptData,
        options: PrintOptions = {}
    ): Promise<PrintResult> => {
        return print('installment', data, options);
    };

    /**
     * Print full installment plan (Account Statement / Contract)
     * Convenience method with type safety
     */
    const printInstallmentPlan = async (
        data: { plan: any },
        options: PrintOptions = {}
    ): Promise<PrintResult> => {
        return print('installment_plan', data, options);
    };

    /**
     * Print invoice
     * Convenience method with type safety
     */
    const printInvoice = async (
        data: InvoiceData,
        options: PrintOptions = {}
    ): Promise<PrintResult> => {
        return print('invoice', data, options);
    };

    return {
        print,
        printInstallment,
        printInstallmentPlan,
        printInvoice,
        // Expose settings for inspection (Reactive)
        printFormat,
        companyLogo,
        companyName,
    };
}
