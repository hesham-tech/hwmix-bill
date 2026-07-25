import BaseService from '../base.service';

/**
 * خدمة API لإدارة مصادر رسائل كاش هونكس
 */
class HwnixCashMessageSourceService extends BaseService {
  constructor() {
    super('v1/hwnix-cash/message-sources');
  }
}

export default new HwnixCashMessageSourceService();
