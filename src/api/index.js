/**
 * Central API Services Export
 * استيراد مركزي لجميع الـ services
 */

export { default as authService } from './services/auth.service';
export { default as invoiceService } from './services/invoice.service';
export { default as productService } from './services/product.service';
export { default as paymentService } from './services/payment.service';
export { default as installmentService } from './services/installment.service';
export { default as userService } from './services/user.service';
export { default as warehouseService } from './services/warehouse.service';
export { default as categoryService } from './services/category.service';
export { default as brandService } from './services/brand.service';
export { default as stockService } from './services/stock.service';
export { default as reportService } from './services/report.service';

// Export axios instance for custom calls
export { default as apiClient } from './axios.config';
