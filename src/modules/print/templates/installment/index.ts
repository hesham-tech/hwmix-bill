import InstallmentTemplate from './InstallmentTemplate.vue';
import { installmentStyles } from './installmentStyles';
import { templateRegistry } from '../TemplateRegistry';

// Auto-register installment template
templateRegistry.register('installment', {
    component: InstallmentTemplate,
    styles: installmentStyles,
    formats: ['thermal', 'a4', 'a5', 'standard'],

    // Transform new API format to template's expected props
    transformData: (data) => {
        return {
            paymentData: data.payment,
            // Customer is in payment.customer, not at root level
            customerName: data.payment?.customer?.name ||
                data.payment?.customer?.full_name ||
                data.customer?.name ||
                'عميل غير معروف',
            amountPaid: data.payment?.amount_paid || data.payment?.amount || 0,
            paidInstallments: data.installments || [],
            remainingAmount: data.plan?.remaining_amount || 0,
            // payment_method is a string, not an object
            paymentMethodName: data.payment?.payment_method || 'غير محدد',
        };
    },
});

export { InstallmentTemplate, installmentStyles };
