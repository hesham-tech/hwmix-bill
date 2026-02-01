// Main entry point for print module
// Import this file to initialize all print templates

// Initialize templates (triggers auto-registration)
import './templates';

// Export public API
export { usePrint } from './composables/usePrint';
export { templateRegistry } from './templates/TemplateRegistry';
export type {
    PrintFormat,
    PrintOptions,
    PrintTemplate,
    InstallmentReceiptData,
    InvoiceData,
} from './core/types';
