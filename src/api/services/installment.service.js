import BaseService from '../base.service';
import apiClient from '../axios.config';
import { useUserStore } from '@/stores/user';

/**
 * Installment Service
 * خدمات الأقساط
 */
class InstallmentService extends BaseService {
  constructor() {
    super('installment-plans');
  }

  /**
   * Get installment plans
   */
  async getPlans(params = {}, options = {}) {
    return this.getAll(params, options);
  }

  /**
   * Create installment plan
   * Note: endpoint has known issues - use workaround
   */
  async createPlan(planData, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      // Calculate required fields
      const enrichedData = {
        ...planData,
        remaining_amount: planData.total_amount - (planData.down_payment || 0),
        number_of_installments: planData.installment_count,
        status: planData.status || 'active',
        end_date: planData.end_date || this.calculateEndDate(planData.start_date, planData.installment_count),
      };

      const response = await apiClient.post('installment-plan', enrichedData);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Update installment plan
   */
  async updatePlan(id, planData, options = {}) {
    return this.save(planData, id, options);
  }

  /**
   * Get installment payments
   */
  async getPayments(params = {}, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get('installment-payments', { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Create installment payment
   */
  async createPayment(paymentData, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post('installment-payment', paymentData);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Pay multiple installments (Logic-rich endpoint)
   */
  async pay(paymentData, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post('installment-payments/pay', paymentData);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Deposit excess amount to customer balance
   */
  async depositExcess(payload, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post('installment-payments/deposit-excess', payload);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(params = {}, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get('installment-payment-details', { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Calculate end date based on start date and installment count
   * Helper function
   */
  calculateEndDate(startDate, installmentCount) {
    const date = new Date(startDate);
    date.setMonth(date.getMonth() + installmentCount);
    return date.toISOString().split('T')[0];
  }
}

export default new InstallmentService();
