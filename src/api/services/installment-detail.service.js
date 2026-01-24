import BaseService from '../base.service';
import apiClient from '../axios.config';
import { useUserStore } from '@/stores/user';

/**
 * Installment Detail Service
 * خدمة إدارة تفاصيل الأقساط
 */
class InstallmentDetailService extends BaseService {
  constructor() {
    super('installment-payment-details');
  }

  /**
   * Get details by payment ID
   */
  async getByPayment(paymentId, options = {}) {
    return this.getAll({ installment_payment_id: paymentId }, options);
  }

  /**
   * Get details by installment ID
   */
  async getByInstallment(installmentId, options = {}) {
    return this.getAll({ installment_id: installmentId }, options);
  }

  /**
   * Create installment payment detail
   * Note: Update endpoint has backend issues (500 error)
   */
  async createDetail(data, options = {}) {
    return this.save(data, null, options);
  }

  /**
   * Update detail - DISABLED due to backend issue
   * Error: Endpoint fails with 500 (missing company_id in table)
   * Workaround: Delete old + Create new instead
   */
  async updateDetail(id, data, options = {}) {
    console.warn('InstallmentDetailService.updateDetail: Backend endpoint has known issue (500 error)');
    console.warn('Workaround: Consider deleting old record and creating new one');

    // Uncomment when backend is fixed:
    // return this.save(data, id, options)

    throw new Error('Update endpoint disabled - use delete + create workaround');
  }

  /**
   * Workaround for update: Delete old + Create new
   */
  async replaceDetail(oldId, newData, options = {}) {
    const { showToast = false, loading = true } = options;

    try {
      // Delete old record
      await this.delete(oldId, { showToast: false, loading });

      // Create new record
      const result = await this.createDetail(newData, { showToast, loading });

      return result;
    } catch (error) {
      console.error('Error replacing installment detail:', error);
      throw error;
    }
  }

  /**
   * Get summary of payment details
   */
  async getSummary(installmentPlanId, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get('installment-payment-details/summary', {
        params: { installment_plan_id: installmentPlanId },
      });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Validate payment detail before save
   */
  validateDetail(data) {
    const errors = [];

    if (!data.installment_payment_id) {
      errors.push('installment_payment_id is required');
    }

    if (!data.installment_id) {
      errors.push('installment_id is required');
    }

    if (!data.amount_paid || data.amount_paid <= 0) {
      errors.push('amount_paid must be greater than 0');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default new InstallmentDetailService();
