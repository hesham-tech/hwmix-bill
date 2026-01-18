import BaseService from '../base.service';
import apiClient from '../axios.config';

/**
 * Invoice Service
 * خدمات الفواتير: CRUD + PDF + Email
 */
class InvoiceService extends BaseService {
  constructor() {
    super('invoices'); // endpoint base
  }

  /**
   * Get invoice by ID with full details
   */
  async getOneWithDetails(id, options = {}) {
    return this.getOne(id, { ...options, full: true });
  }

  /**
   * Get PDF for invoice
   * @param {Number} id - Invoice ID
   * @returns {Blob} PDF file
   */
  async getPDF(id, options = {}) {
    const { showToast = false } = options;

    try {
      const response = await apiClient.get(`invoice/${id}/pdf`, {
        responseType: 'blob',
      });

      // Create downloadable link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      if (showToast) {
        toast.success('تم تحميل الفاتورة بنجاح');
      }

      return response.data;
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Send invoice via email
   * @param {Number} id - Invoice ID
   * @param {Object} emailData - { email, message }
   */
  async sendEmail(id, emailData, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post(`invoice/${id}/send-email`, emailData);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Get invoice items
   */
  async getItems(id, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.get(`invoice/${id}/items`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Add item to invoice
   */
  async addItem(id, itemData, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post(`invoice/${id}/items`, itemData);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Update invoice item
   */
  async updateItem(invoiceId, itemId, itemData, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.put(`invoice/${invoiceId}/items/${itemId}`, itemData);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Delete invoice item
   */
  async deleteItem(invoiceId, itemId, options = {}) {
    const { showToast = true, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.delete(`invoice/${invoiceId}/items/${itemId}`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Get invoices by type
   * @param {String} type - 'sales', 'purchases', 'installment_sale'
   */
  async getByType(type, params = {}, options = {}) {
    return this.getAll({ ...params, type }, options);
  }

  /**
   * Get sales invoices
   */
  async getSales(params = {}, options = {}) {
    return this.getByType('sales', params, options);
  }

  /**
   * Get purchase invoices
   */
  async getPurchases(params = {}, options = {}) {
    return this.getByType('purchases', params, options);
  }

  /**
   * Get installment invoices
   */
  async getInstallments(params = {}, options = {}) {
    return this.getByType('installment_sale', params, options);
  }
}

export default new InvoiceService();
