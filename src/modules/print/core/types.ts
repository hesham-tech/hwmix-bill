import type { Component } from 'vue';

/**
 * Supported print formats
 */
export type PrintFormat = 'thermal' | 'a4' | 'a5' | 'standard' | 'sticker' | 'thermal_58';

/**
 * Print template configuration
 */
export interface PrintTemplate<T = any> {
    /** Vue component for rendering the template */
    component: Component;

    /** CSS styles specific to this template */
    styles: string;

    /** Supported print formats for this template */
    formats: PrintFormat[];

    /** Optional data transformer function */
    transformData?: (data: T) => any;

    /** Whether to wait for image/barcode verification before printing */
    requireVerification?: boolean;
}

/**
 * Options for print operation
 */
export interface PrintOptions {
    /** Print format to use (overrides company default) */
    format?: PrintFormat;

    /** Company logo URL (auto-injected if not provided) */
    logo?: string;

    /** Company name (auto-injected if not provided) */
    companyName?: string;

    /** Additional CSS to inject */
    additionalCss?: string;

    /** Whether to auto-close after printing */
    autoClose?: boolean;

    /** Callback after successful print */
    onSuccess?: () => void;

    /** Callback on print error */
    onError?: (error: Error) => void;
}

/**
 * Result of print operation
 */
export interface PrintResult {
    success: boolean;
    error?: string;
    type: string;
}

/**
 * Data structure sent to PrintDriver
 */
export interface PrintData {
    /** Complete HTML content including wrapper */
    html: string;

    /** Complete CSS styles */
    css: string;

    /** Print format type */
    format: PrintFormat;
}

/**
 * Installment receipt data structure
 */
export interface InstallmentReceiptData {
    payment?: {
        id: number;
        amount: number;
        payment_date?: string;
        created_at?: string;
        reference_number?: string;
        payment_method?: {
            name: string;
        };
    };
    customer?: {
        name: string;
    };
    installments?: Array<{
        id: number;
        installment_number: number;
        amount: number;
        due_date: string;
    }>;
    plan?: {
        remaining_amount: number;
    };
}

/**
 * General payment receipt data structure
 */
export interface PaymentReceiptData {
    payment?: {
        id: number;
        amount: number;
        payment_date?: string;
        created_at?: string;
        reference_number?: string;
        payment_method?: {
            name: string;
        };
    };
    customer?: {
        name: string;
    };
    invoice?: {
        invoice_number: string;
        remaining_amount: number;
    };
}

/**
 * Invoice data structure
 */
export interface InvoiceData {
    id: number;
    invoice_number: string;
    date: string;
    due_date?: string;
    customer: {
        name: string;
        phone?: string;
        address?: string;
    };
    items: Array<{
        name: string;
        quantity: number;
        price: number;
        total: number;
    }>;
    subtotal: number;
    tax?: number;
    discount?: number;
    total: number;
    notes?: string;
}

/**
 * Template registry interface
 */
export interface ITemplateRegistry {
    register<T = any>(type: string, template: PrintTemplate<T>): void;
    registerLazy(type: string, loader: () => Promise<void>): void;
    get(type: string): Promise<PrintTemplate | undefined>;
    getSync(type: string): PrintTemplate | undefined;
    has(type: string): boolean;
    list(): string[];
}

/**
 * Print service interface
 */
export interface IPrintService {
    print<T = any>(
        type: string,
        data: T,
        options?: PrintOptions
    ): Promise<PrintResult>;
}
