import BaseService from '../base.service';

/**
 * Payment Service
 * خدمات المدفوعات
 */
class PaymentService extends BaseService {
  constructor() {
    super('payments');
  }

  /**
   * Get payments by invoice
   */
  async getByInvoice(invoiceId, options = {}) {
    return this.getAll({ invoice_id: invoiceId }, options);
  }

  /**
   * Get payments by customer
   */
  async getByCustomer(customerId, options = {}) {
    return this.getAll({ customer_id: customerId }, options);
  }

  /**
   * Get payments summary
   */
  async getSummary(params = {}, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get('payments/summary', { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new PaymentService();
