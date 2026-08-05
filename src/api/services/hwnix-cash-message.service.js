import BaseService from '../base.service';

/**
 * خدمة API لإدارة رسائل كاش هونكس (قراءة فقط)
 */
class HwnixCashMessageService extends BaseService {
  constructor() {
    super('v1/hwnix-cash/messages');
  }

  reparse(id) {
    return this.post(`${id}/reparse`, {});
  }
}

export default new HwnixCashMessageService();
