/**
 * Global Print Configuration
 */
export const PRINT_CONFIG = {
    // Timeout for waiting for images/barcode rendering (ms)
    VERIFICATION_TIMEOUT: 6000,

    // Safety delay after rendering but before capturing HTML (ms)
    LAYOUT_SAFETY_DELAY: 100,

    // Delay before triggering window.print() inside iframe (ms)
    TRIGGER_DELAY: 200,

    // External Font URLs
    FONTS: {
        TAJAWAL: 'https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap'
    },

    // Default Fallbacks
    DEFAULTS: {
        FORMAT: 'thermal',
        COMPANY_NAME: 'وجدي العربي',
        CURRENCY: 'EGP'
    },

    // UI Strings (Translatable)
    STRINGS: {
        THANK_YOU: 'شكراً لتعاملكم معنا',
        PRINTED_AT: 'طبع بتاريخ',
        INVOICE: 'فاتورة',
        INSTALLMENT_RECEIPT: 'إيصال تحصيل أقساط',
        PAYMENT_RECEIPT: 'إيصال استلام نقدية',
        SIGNATURE_RECEIVER: 'توقيع المستلم',
        SIGNATURE_CUSTOMER: 'توقيع العميل',
        SIGNATURE_ACCOUNTANT: 'توقيع المحاسب'
    }
};
