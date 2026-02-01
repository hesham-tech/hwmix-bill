import { templateRegistry } from '../TemplateRegistry';
import PaymentReceiptTemplate from './PaymentReceiptTemplate.vue';
import type { PaymentReceiptData } from '../../core/types';

templateRegistry.register<PaymentReceiptData>('payment', {
    component: PaymentReceiptTemplate,
    styles: '', // Specific styles are handled inside the component
    formats: ['thermal', 'a4', 'a5'],
    transformData: (data: any) => {
        // Handle different data sources (direct payment object or wrapper)
        const payment = data.payment || data;
        const invoice = payment.invoice || data.invoice;
        const customer = data.customer || payment.customer || invoice?.customer;

        return {
            paymentData: {
                id: payment.id,
                payment_date: payment.payment_date,
                created_at: payment.created_at,
                reference_number: payment.reference_number
            },
            customerName: customer?.nickname || customer?.full_name || 'بدون عميل',
            invoiceNumber: invoice?.invoice_number || '---',
            amountPaid: payment.amount || 0,
            remainingBalance: invoice?.remaining_amount,
            paymentMethodName: payment.payment_method?.name || payment.method_name || 'نقدي',
            companyName: data.companyName,
            companyLogo: data.companyLogo,
            printFormat: data.printFormat || 'thermal'
        };
    }
});
