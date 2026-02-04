import BaseService from '../base.service';
import apiClient from '../axios.config';
import { useUserStore } from '@/stores/user';

/**
 * Report Service
 * خدمة التقارير (مبيعات، مخزون، ضرائب، أرباح)
 */
class ReportService extends BaseService {
  constructor() {
    super('reports');
  }

  /**
   * Get Sales Report
   */
  async getSalesReport(params = {}, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get('reports/sales', { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Get Stock Report
   */
  async getStockReport(params = {}, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get('reports/stock', { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Get Profit/Loss Report
   */
  async getProfitLossReport(params = {}, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get('reports/profit-loss', { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Get Cash Flow Report
   */
  async getCashFlowReport(params = {}, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get('reports/cash-flow', { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Get Tax Report
   */
  async getTaxReport(params = {}, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get('reports/tax', { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Get Customer/Supplier Report
   */
  async getCustomerSupplierReport(params = {}, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get('reports/customer-supplier', { params });
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Export report to Excel
   */
  async exportToExcel(reportType, params = {}, options = {}) {
    const { showToast = false } = options;

    try {
      const response = await apiClient.get(`reports/${reportType}/export`, {
        params,
        responseType: 'blob',
      });

      // Download file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportType}-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      if (showToast) {
        toast.success('تم تصدير التقرير بنجاح');
      }

      return response.data;
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Print report
   */
  async printReport(reportType, params = {}, options = {}) {
    const { showToast = false } = options;

    try {
      const response = await apiClient.get(`reports/${reportType}/print`, {
        params,
        responseType: 'blob',
      });

      // Open print dialog
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const printWindow = window.open(url);
      printWindow.print();

      return response.data;
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new ReportService();
