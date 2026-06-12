import BaseService from '../base.service';
import apiClient from '../axios.config';

/**
 * Transaction Service
 * سجل المعاملات المالية والحركات
 */
class TransactionService extends BaseService {
  constructor() {
    super('transactions');
  }

  /**
   * Deposit balance
   */
  async deposit(data, options = {}) {
    const { showToast = true } = options;
    try {
      const response = await apiClient.post('transactions/deposit', data);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Withdraw balance
   */
  async withdraw(data, options = {}) {
    const { showToast = true } = options;
    try {
      const response = await apiClient.post('transactions/withdraw', data);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Transfer balance
   */
  async transfer(data, options = {}) {
    const { showToast = true } = options;
    try {
      const response = await apiClient.post('transactions/transfer', data);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Reverse transaction
   */
  async reverse(id, data = {}, options = {}) {
    const { showToast = true } = options;
    try {
      const response = await apiClient.post(`transactions/${id}/reverse`, data);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new TransactionService();
