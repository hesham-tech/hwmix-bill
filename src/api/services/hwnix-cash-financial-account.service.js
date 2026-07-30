import BaseService from '../base.service';

/**
 * خدمة API لإدارة الحسابات المالية بكاش هونكس HwnixCash
 */
class HwnixCashFinancialAccountService extends BaseService {
  constructor() {
    super('v1/hwnix-cash/financial-accounts');
  }

  getDistinctSenders() {
    return this.get('distinct-senders');
  }

  reconcile(id, data = {}) {
    return this.post(`${id}/reconcile`, data);
  }
}

export default new HwnixCashFinancialAccountService();
