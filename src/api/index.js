/**
 * Central API Services Export
 * استيراد مركزي لجميع الـ services
 */

export { default as authService } from './services/auth.service';
export { default as invoiceService } from './services/invoice.service';
export { default as productService } from './services/product.service';
export { default as paymentService } from './services/payment.service';
export { default as installmentService } from './services/installment.service';
export { default as installmentDetailService } from './services/installment-detail.service';
export { default as userService } from './services/user.service';
export { default as warehouseService } from './services/warehouse.service';
export { default as categoryService } from './services/category.service';
export { default as brandService } from './services/brand.service';
export { default as stockService } from './services/stock.service';
export { default as reportService } from './services/report.service';
export { default as roleService } from './services/role.service';
export { default as permissionService } from './services/permission.service';
export { default as taskService } from './services/task.service';
export { default as taskGroupService } from './services/task-group.service';
export { default as companyService } from './services/company.service';
export { default as expenseService } from './services/expense.service';
export { default as expenseCategoryService } from './services/expense-category.service';
export { default as financialLedgerService } from './services/financial-ledger.service';
export { default as attributeService } from './services/attribute.service';
export { default as attributeValueService } from './services/attribute-value.service';
export { default as backupService } from './services/backup.service';
export { default as errorReportService } from './services/error-report.service';
export { default as serviceApiService } from './services/service.service';
export { default as subscriptionApiService } from './services/subscription.service';
export { default as transactionService } from './services/transaction.service';

// ==================== HwnixCash Module ====================
export { default as hwnixCashDeviceService } from './services/hwnix-cash-device.service';
export { default as hwnixCashLineService } from './services/hwnix-cash-line.service';
export { default as hwnixCashMessageService } from './services/hwnix-cash-message.service';
export { default as hwnixCashWalletTransactionService } from './services/hwnix-cash-wallet-transaction.service';
export { default as hwnixCashMessageSourceService } from './services/hwnix-cash-message-source.service';
export { default as hwnixCashFinancialAccountService } from './services/hwnix-cash-financial-account.service';

// Export axios instance for custom calls
export { default as apiClient } from './axios.config';
