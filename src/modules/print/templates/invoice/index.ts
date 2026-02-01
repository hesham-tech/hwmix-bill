import InvoiceTemplate from './InvoiceTemplate.vue';
import { invoiceStyles } from './invoiceStyles';
import { templateRegistry } from '../TemplateRegistry';

// Auto-register invoice template
templateRegistry.register('invoice', {
    component: InvoiceTemplate,
    styles: invoiceStyles,
    formats: ['thermal', 'a4', 'a5', 'standard'],

    // Transform API data to template props
    transformData: (data) => {
        const invoice = data.invoice || data;

        return {
            // Invoice basic info
            invoiceNumber: invoice.invoice_number,
            invoiceTypeName: invoice.invoice_type?.name || 'بيع',
            issueDate: invoice.issue_date,
            dueDate: invoice.due_date,

            // Customer info
            customerName: invoice.customer?.full_name ||
                invoice.customer?.name ||
                'عميل غير معروف',
            customerPhone: invoice.customer?.phone,

            // Financial data
            grossAmount: invoice.gross_amount || 0,
            netAmount: invoice.net_amount || invoice.gross_amount || 0,
            paidAmount: invoice.paid_amount || 0,
            remainingAmount: invoice.remaining_amount || 0,
            totalDiscount: invoice.total_discount || 0,
            previousBalance: invoice.previous_balance || 0,
            totalRequired: invoice.total_required || 0,
            userBalanceAfter: invoice.user_balance_after || 0,

            // Items
            items: invoice.items || [],
        };
    },
});

export { InvoiceTemplate, invoiceStyles };
