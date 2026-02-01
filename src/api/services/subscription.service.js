import BaseService from '../base.service';

class SubscriptionApiService extends BaseService {
  constructor() {
    super('subscriptions');
  }
}

export default new SubscriptionApiService();
