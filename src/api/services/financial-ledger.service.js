import BaseService from '../base.service';

/**
 * Financial Ledger Service
 * دفتر الأستاذ العام
 */
class FinancialLedgerService extends BaseService {
  constructor() {
    super('financial-ledger');
  }

  /**
   * Export ledger to Excel/PDF
   */
  async export(params = {}, options = {}) {
    const { showToast = false } = options;
    try {
      const response = await this.api.get(`${this.endpoint}/export`, {
        params,
        responseType: 'blob',
      });

      // Handle file download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `ledger-export-${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new FinancialLedgerService();
