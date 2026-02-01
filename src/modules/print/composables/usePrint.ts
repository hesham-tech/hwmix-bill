import { printService } from '../core/PrintService';
import { useUserStore } from '@/stores/user';
import { computed } from 'vue';
import type { PrintOptions, InstallmentReceiptData, InvoiceData } from '../core/types';

/**
 * Composable for easy print access
 * Main public API for printing documents
 */
export function usePrint() {
    const userStore = useUserStore();

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
    ): Promise<void> => {
        return printService.print(type, data, {
            format: printFormat.value,
            logo: companyLogo.value,
            companyName: companyName.value,
            ...options
        });
    };

    /**
     * Print installment receipt
     * Convenience method with type safety
     */
    const printInstallment = async (
        data: InstallmentReceiptData,
        options: PrintOptions = {}
    ): Promise<void> => {
        return print('installment', data, options);
    };

    /**
     * Print invoice
     * Convenience method with type safety
     */
    const printInvoice = async (
        data: InvoiceData,
        options: PrintOptions = {}
    ): Promise<void> => {
        return print('invoice', data, options);
    };

    return {
        print,
        printInstallment,
        printInvoice,
        // Expose settings for inspection
        printFormat: printFormat.value,
        companyLogo: companyLogo.value,
        companyName: companyName.value,
    };
}
