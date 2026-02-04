import BaseService from '../base.service';

/**
 * Expense Service
 * إدارة المصاريف
 */
class ExpenseService extends BaseService {
  constructor() {
    super('expenses');
  }

  /**
   * Get expense summary (for reports)
   */
  async getSummary(params = {}, options = {}) {
    const { showToast = false } = options;
    try {
      const response = await this.api.get(`${this.endpoint}/summary`, { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new ExpenseService();
