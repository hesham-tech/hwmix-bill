import BaseService from '../base.service';

/**
 * Subscription Service
 * خدمات الاشتراكات
 */
class SubscriptionService extends BaseService {
  constructor() {
    super('subscriptions');
  }

  /**
   * Get active subscriptions
   */
  async getActive(options = {}) {
    return this.getAll({ status: 'active' }, options);
  }

  /**
   * Renew subscription
   */
  async renew(id, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post(`subscription/${id}/renew`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }

  /**
   * Cancel subscription
   */
  async cancel(id, options = {}) {
    const { showToast = false, loading = true } = options;
    const userStore = useUserStore();

    if (loading) userStore.loadingApi = true;

    try {
      const response = await apiClient.post(`subscription/${id}/cancel`);
      return this.handleSuccess(response, showToast);
    } catch (error) {
      return this.handleError(error, showToast);
    }
  }
}

export default new SubscriptionService();
