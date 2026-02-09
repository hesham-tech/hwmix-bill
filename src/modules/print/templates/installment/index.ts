import InstallmentTemplate from './InstallmentTemplate.vue';
import InstallmentPlanTemplate from './InstallmentPlanTemplate.vue';
import LegalContractTemplate from './LegalContractTemplate.vue';
import { installmentStyles, installmentPlanStyles, legalContractStyles } from './installmentStyles';
import { templateRegistry } from '../TemplateRegistry';

// 1. تسجيل إيصال التحصيل (Installment Receipt)
templateRegistry.register('installment', {
    component: InstallmentTemplate,
    styles: installmentStyles,
    formats: ['thermal', 'a4', 'a5', 'standard'],
    transformData: data => {
        return {
            paymentData: data.payment,
            customerName: data.payment?.customer?.name || data.payment?.customer?.full_name || data.customer?.name || 'عميل غير معروف',
            amountPaid: data.payment?.amount_paid || data.payment?.amount || 0,
            paidInstallments: data.installments || [],
            remainingAmount: data.plan?.remaining_amount || 0,
            paymentMethodName: data.payment?.payment_method || 'غير محدد',
        };
    },
});

// 2. تسجيل عقد خطة التقسيط بالكامل (Full Installment Plan / Invoice Style)
templateRegistry.register('installment_plan', {
    component: InstallmentPlanTemplate,
    styles: installmentPlanStyles,
    formats: ['a4', 'a5', 'thermal'],
    transformData: data => {
        return {
            planData: data.plan,
            customerName: data.plan?.customer?.full_name || data.plan?.customer?.name || '---',
            customerPhone: data.plan?.customer?.phone || '---',
            companyName: data.company?.name,
            companyLogo: data.company?.logo,
            companyAddress: data.company?.address,
            companyPhone: data.company?.phone,
        };
    },
});

// 3. تسجيل العقد القانوني المستقل (Legal Sales Contract)
templateRegistry.register('legal_contract', {
    component: LegalContractTemplate,
    styles: legalContractStyles,
    formats: ['a4'], // يفرض A4 دائماً
    transformData: data => {
        return {
            planData: data.plan,
            customerName: data.plan?.customer?.full_name || data.plan?.customer?.name || '---',
            customerPhone: data.plan?.customer?.phone || '---',
            companyName: data.company?.name,
            companyLogo: data.company?.logo,
            companyAddress: data.company?.address,
            companyPhone: data.company?.phone,
        };
    },
});

export { InstallmentTemplate, InstallmentPlanTemplate, LegalContractTemplate, installmentStyles };
