import BaseService from '../base.service';

class SubscriptionApiService extends BaseService {
  constructor() {
    super('subscriptions');
  }

  renew(id, data) {
    return this.post(`${id}/renew`, data);
  }

  getHistory(id) {
    return this.get(`${id}/history`);
  }
}

export default new SubscriptionApiService();
